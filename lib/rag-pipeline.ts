import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EligibilityResult {
  schemeId: string;
  schemeName: string;
  eligible: boolean | null; // true, false, or null (maybe)
  reason: string;
  documents: string[];
  nextSteps: string[];
  benefits: string;
  confidence: "High" | "Medium" | "Low";
  sourceUrl: string;
  lastVerified: string;
}

export interface NoMatchScheme {
  schemeId: string;
  schemeName: string;
  reason: string;
}

export interface DynamicTurn {
  status: "questioning" | "complete";
  question?: string;
  chips?: { label: string; value: string }[];
  results?: RAGEcosystemResponse;
}

export interface RAGEcosystemResponse {
  matchingSchemes: EligibilityResult[];
  totalMatches: number;
  noMatch: NoMatchScheme[];
}

const GENERATION_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
];

const FALLBACK_GEMMA_MODELS = [
  "gemma-3-27b", // Absolute final fallback (Gemma 3 27B)
];

const SCHEME_NAMES: Record<string, string> = {
  "pm-kisan": "PM-KISAN",
  ayushman: "Ayushman Bharat (PMJAY)",
  "pmay-g": "PMAY-G (Awas Yojana)",
  mgnrega: "MGNREGA",
  apy: "Atal Pension Yojana (APY)",
};

const ALL_SCHEME_IDS = Object.keys(SCHEME_NAMES);

// Language names for Gemini prompt
const LANG_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  mr: "Marathi (मराठी)",
};

/**
 * Strengthened intent detection logic based on keyword matching.
 * Maps queries to primary scheme IDs for better search prioritization.
 */
export function detectUserIntent(query: string): string | null {
  const lowQuery = query.toLowerCase();

  const categories = [
    {
      id: "pm-kisan",
      keywords: [
        "agriculture",
        "farming",
        "farmer",
        "land",
        "crop",
        "cultivation",
        "cultivate",
        "agricultural",
        "farm",
        "kisan",
        "pm-kisan",
        "paddy",
        "wheat",
        "harvest",
        "fields",
        "soil",
        "plantation",
      ],
    },
    {
      id: "pmay-g",
      keywords: [
        "house",
        "home",
        "housing",
        "awas",
        "kutcha",
        "pucca",
        "construction",
        "roof",
        "building",
        "shelter",
        "dwelling",
        "residence",
        "live",
      ],
    },
    {
      id: "ayushman",
      keywords: [
        "health",
        "hospital",
        "medical",
        "insurance",
        "doctor",
        "treatment",
        "disease",
        "sick",
        "illness",
        "healthcare",
        "ayushman",
        "pmjay",
      ],
    },
    {
      id: "mgnrega",
      keywords: [
        "work",
        "job",
        "wage",
        "daily",
        "labor",
        "employment",
        "mgnrega",
        "earn",
        "income",
        "wages",
        "work guarantee",
      ],
    },
    {
      id: "apy",
      keywords: [
        "pension",
        "retirement",
        "old age",
        "savings",
        "future",
        "elderly",
        "apy",
        "atal",
        "monthly income after 60",
      ],
    },
  ];

  const results = categories.map((cat) => {
    let count = 0;
    let firstIndex = Infinity;

    cat.keywords.forEach((kw) => {
      const kwEscaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${kwEscaped}\\b`, "g");
      const matches = lowQuery.match(regex);

      if (matches) {
        count += matches.length;
        const idx = lowQuery.indexOf(kw.toLowerCase());
        if (idx !== -1 && idx < firstIndex) {
          firstIndex = idx;
        }
      }
    });

    return { id: cat.id, count, firstIndex };
  });

  const matched = results.filter((r) => r.count > 0);
  if (matched.length === 0) return null;

  // Sort by highest count first.
  // Tiebreaker: the one whose keyword appeared earliest in the string.
  matched.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.firstIndex - b.firstIndex;
  });

  return matched[0].id;
}

function getGeminiKeys() {
  const keys = [
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_BACKUP,
  ].filter(Boolean) as string[];
  if (keys.length === 0) throw new Error("No Gemini API keys found");
  return keys;
}

function getPineconeIndex() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;
  if (!apiKey || !indexName)
    throw new Error("Missing PINECONE_API_KEY or PINECONE_INDEX_NAME");
  const pc = new Pinecone({ apiKey });
  return pc.index(indexName);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateContentWithFallback(prompt: string): Promise<string> {
  const keys = getGeminiKeys();

  // Phase 1: Try all preferred Gemini models across all available keys
  for (const key of keys) {
    const genAI = new GoogleGenerativeAI(key);
    for (const modelName of GENERATION_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err: any) {
        const msg = err?.message || "";
        const isRetryable =
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("404") ||
          msg.includes("not found") ||
          msg.includes("not supported");
        if (!isRetryable) throw err;
        console.warn(
          `[Fallback] Model ${modelName} failed (${msg.includes("404") || msg.includes("not found") ? "model not found" : "quota limit"}). Trying next fallback...`,
        );
      }
    }
  }

  // Phase 2: If ALL Gemini models fail across ALL keys, try Gemma as a last resort
  console.warn(
    `[Fallback] All Gemini models exhausted. Failing over to Gemma 3 27B model...`,
  );
  for (const key of keys) {
    const genAI = new GoogleGenerativeAI(key);
    for (const modelName of FALLBACK_GEMMA_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err: any) {
        const msg = err?.message || "";
        const isRetryable =
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("404") ||
          msg.includes("not found") ||
          msg.includes("not supported");
        if (!isRetryable) throw err;
        console.warn(
          `[Fallback] Gemma Model ${modelName} failed. Trying next...`,
        );
      }
    }
  }

  throw new Error(
    "Quota Exceeded across all available models (including Gemma) and keys",
  );
}

async function embedQuery(query: string): Promise<number[]> {
  const keys = getGeminiKeys();
  for (const key of keys) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await model.embedContent(query);
      return result.embedding.values as number[];
    } catch (err: any) {
      const is429 =
        err?.message?.includes("429") ||
        err?.message?.includes("RESOURCE_EXHAUSTED");
      if (!is429) throw err;
      console.warn(
        `[Fallback] Embedding hit quota limit on a key. Trying next key...`,
      );
    }
  }
  throw new Error("Quota Exceeded on embedding across all keys");
}

function parseGeminiJSON(text: string): any {
  try {
    // Strip markdown fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini JSON:", text);
    return null;
  }
}

function sortByEligibility(results: EligibilityResult[]): EligibilityResult[] {
  const order = (e: boolean | null) => (e === true ? 0 : e === null ? 1 : 2);
  return results.sort((a, b) => order(a.eligible) - order(b.eligible));
}

// ─── Core RAG Functions ──────────────────────────────────────────────────────

/**
 * Search ALL 5 schemes, return all matches ranked by eligibility.
 */
export async function queryMultiSchemeRAG(
  userQuery: string,
  language: string = "en",
  targetSchemes: string[] = [],
): Promise<RAGEcosystemResponse> {
  if (!userQuery || userQuery.trim().length < 3) {
    return { matchingSchemes: [], totalMatches: 0, noMatch: [] };
  }

  // Use targeted namespaces if provided, otherwise all
  const namespacesToSearch =
    targetSchemes.length > 0
      ? targetSchemes.filter((id) => ALL_SCHEME_IDS.includes(id))
      : ALL_SCHEME_IDS;

  try {
    // 1. Embed an enriched query to ensure we fetch essential chunks (benefits, documents, application steps)
    const enrichedQuery = `${userQuery}. Include details on financial benefits, required documents, eligibility, and how to apply.`;
    const queryEmbedding = await embedQuery(enrichedQuery);

    // 2. Search Pinecone across relevant scheme namespaces in parallel
    const index = getPineconeIndex();
    const queryPromises = namespacesToSearch.map(async (namespaceId) => {
      try {
        const results = await index.namespace(namespaceId).query({
          vector: queryEmbedding,
          topK: 15, // High topK to effectively reconstruct the entire small source docs (solves chunk fragmentation)
          includeMetadata: true,
        });
        return results.matches || [];
      } catch (e) {
        console.error(`Error querying namespace ${namespaceId}:`, e);
        return [];
      }
    });

    const namespaceResults = await Promise.all(queryPromises);

    // Flatten and sort by score to get the overall top chunks
    const allMatches = namespaceResults.flat();
    allMatches.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Filter out chunks with very low similarity scores
    const matches = allMatches.filter((m) => (m.score || 0) > 0.65).slice(0, 8);

    if (matches.length === 0) {
      return {
        matchingSchemes: [],
        totalMatches: 0,
        noMatch: [], // Don't list all schemes if none match
      };
    }

    // 3. Group chunks by schemeId
    const chunksByScheme: Record<string, string[]> = {};
    for (const match of matches) {
      const schemeId = (match.metadata as Record<string, string>)?.schemeId;
      const text = (match.metadata as Record<string, string>)?.text;
      if (schemeId && text) {
        if (!chunksByScheme[schemeId]) chunksByScheme[schemeId] = [];
        chunksByScheme[schemeId].push(text);
      }
    }

    // 4. Batch Eligibility Check (One call for all schemes to save quota)

    const schemesContext = Object.entries(chunksByScheme)
      .map(([id, chunks]) => {
        const name = SCHEME_NAMES[id] || id;
        return `### SCHEME: ${name} (ID: ${id})\n${chunks.join("\n\n---\n\n")}`;
      })
      .join("\n\n====================\n\n");

    const batchPrompt = `You are the Expert Government Advisor. 
Based ONLY on the scheme information provided across different sections, evaluate the user's eligibility ONLY for schemes that are highly relevant to their situation.

User situation: "${userQuery}"

OFFICIAL SCHEME INFORMATION:
${schemesContext}

RESPOND ONLY AS VALID JSON ARRAY (no markdown, no code fences):
[
  {
    "schemeId": "exact_id_from_above",
    "eligible": true or false or null,
    "reason": "Expert 1-2 sentence explanation in ${LANG_NAMES[language] || "English"}",
    "documents": ["list", "of", "docs"],
    "nextSteps": ["action", "steps"],
    "benefits": "List what is covered, then state exact amounts like ₹X per year via DBT. Example: Covers hospitalization, surgery, medicines. ₹5,00,000 per family per year via cashless treatment at empanelled hospitals.",
    "confidence": "High" or "Medium" or "Low",
    "sourceUrl": "official url",
    "lastVerified": "YYYY-MM-DD"
  }
]

RULES:
1. ONLY return objects for schemes that actually match the user's request. If a scheme is completely unrelated, EXCLUDE it from the array.
2. If info is missing for a relevant scheme, set eligible to null.
3. Use simple, rural-friendly language.
4. All text values MUST be in ${LANG_NAMES[language] || "English"}. JSON keys must stay in English.`;

    const eligibilityResults: EligibilityResult[] = [];
    const foundSchemeIds = new Set(Object.keys(chunksByScheme));

    try {
      const responseText = await generateContentWithFallback(batchPrompt);
      const parsedArray = parseGeminiJSON(responseText);

      if (Array.isArray(parsedArray)) {
        for (const item of parsedArray) {
          const schemeId = item.schemeId as string;
          const schemeName = SCHEME_NAMES[schemeId] || schemeId;

          eligibilityResults.push({
            schemeId,
            schemeName,
            eligible: item.eligible as boolean | null,
            reason: (item.reason as string) || "Information not available.",
            documents: (item.documents as string[]) || [],
            nextSteps: (item.nextSteps as string[]) || [],
            benefits: (item.benefits as string) || "Details not available.",
            confidence:
              (item.confidence as "High" | "Medium" | "Low") || "Medium",
            sourceUrl: (item.sourceUrl as string) || "https://www.india.gov.in",
            lastVerified:
              (item.lastVerified as string) ||
              new Date().toISOString().split("T")[0],
          });
        }
      }
    } catch (err) {
      console.error("Batch Gemini evaluation error:", err);
      // Let the error throw so it cascades cleanly instead of returning fake cards
      throw err;
    }

    // 5. Build noMatch list for schemes that weren't found in Pinecone results
    const noMatch: NoMatchScheme[] = namespacesToSearch
      .filter((id) => !foundSchemeIds.has(id))
      .map((id) => ({
        schemeId: id,
        schemeName: SCHEME_NAMES[id],
        reason: "Your query did not match any information for this scheme.",
      }));

    // 6. Sort and return
    const sorted = sortByEligibility(eligibilityResults);

    return {
      matchingSchemes: sorted,
      totalMatches: sorted.length,
      noMatch,
    };
  } catch (error) {
    console.error("RAG pipeline error:", error);
    return {
      matchingSchemes: [],
      totalMatches: 0,
      noMatch: namespacesToSearch.map((id) => ({
        schemeId: id,
        schemeName: SCHEME_NAMES[id],
        reason: "Service temporarily unavailable. Please try again.",
      })),
    };
  }
}

/**
 * Deep dive on ONE specific scheme for detailed eligibility check.
 */
export async function getSingleSchemeEligibility(
  userQuery: string,
  schemeId: string,
  language: string = "en",
): Promise<EligibilityResult> {
  const schemeName = SCHEME_NAMES[schemeId] || schemeId;

  const defaultResult: EligibilityResult = {
    schemeId,
    schemeName,
    eligible: null,
    reason: "Could not determine eligibility.",
    documents: [],
    nextSteps: [],
    benefits: "Information not available.",
    confidence: "Low",
    sourceUrl: "https://www.india.gov.in",
    lastVerified: new Date().toISOString().split("T")[0],
  };

  if (!userQuery || userQuery.trim().length < 3) return defaultResult;

  try {
    // 1. Embed the user query
    const queryEmbedding = await embedQuery(userQuery);

    // 2. Search Pinecone for chunks in this specific scheme's namespace
    const index = getPineconeIndex();
    const searchResults = await index.namespace(schemeId).query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    const matches = searchResults.matches || [];

    if (matches.length === 0) {
      return {
        ...defaultResult,
        reason: `No information found for ${schemeName}.`,
      };
    }

    // 3. Build context from matched chunks
    const context = matches
      .map((m) => (m.metadata as Record<string, string>)?.text || "")
      .filter(Boolean)
      .join("\n\n---\n\n");

    // 4. Send to Gemini with detailed prompt

    const prompt = `You are SchemeSetu AI, a trusted government scheme advisor for rural Indian citizens.

You are doing a DETAILED eligibility check for ${schemeName}.

User situation: "${userQuery}"

Official ${schemeName} information:
${context}

Respond ONLY as valid JSON (no markdown, no code fences, no extra text):
{
  "eligible": true or false or null,
  "reason": "Detailed 2-3 sentence explanation. Explain exactly WHY they qualify or don't. Be specific about which criteria they meet or miss.",
  "documents": ["Every document they need to apply, be thorough"],
  "nextSteps": ["Detailed step-by-step guide a village person can follow. Include where to go, what to say, and what to expect."],
  "benefits": "First list what is covered (services, items), then state exact ₹ amounts, frequency, and payment mode. Example: Covers hospitalization, surgery, diagnostics, medicines. ₹5,00,000 per family per year via cashless treatment.",
  "confidence": "High" or "Medium" or "Low",
  "sourceUrl": "Official gov website url for this scheme",
  "lastVerified": "YYYY-MM-DD format date"
}

Rules:
- Use ONLY information from the scheme text above. Do NOT invent anything.
- If you cannot determine eligibility, set eligible to null and explain what info is missing.
- Be thorough — this is a deep-dive check, not a summary.
- Use simple language a farmer or village person would understand.
- Include exact rupee amounts, timelines, and payment methods if in the text.

IMPORTANT: Respond with ALL text values (reason, documents, nextSteps, benefits) in ${LANG_NAMES[language] || "English"}. JSON keys must stay in English.`;
    const responseText = await generateContentWithFallback(prompt);
    const parsed = parseGeminiJSON(responseText);

    if (parsed) {
      return {
        schemeId,
        schemeName,
        eligible: parsed.eligible as boolean | null,
        reason: (parsed.reason as string) || defaultResult.reason,
        documents: (parsed.documents as string[]) || [],
        nextSteps: (parsed.nextSteps as string[]) || [],
        benefits: (parsed.benefits as string) || defaultResult.benefits,
        confidence:
          (parsed.confidence as "High" | "Medium" | "Low") ||
          defaultResult.confidence,
        sourceUrl: (parsed.sourceUrl as string) || defaultResult.sourceUrl,
        lastVerified:
          (parsed.lastVerified as string) || defaultResult.lastVerified,
      };
    }

    return defaultResult;
  } catch (error) {
    console.error(`Single scheme RAG error for ${schemeName}:`, error);
    return {
      ...defaultResult,
      reason: "Service temporarily unavailable. Please try again.",
    };
  }
}

/**
 * DYNAMIC AI INTERVIEWER:
 * Analyzes retrieved chunks and decides whether to ask a follow-up question
 * or show final RAG results.
 */
export async function determineNextTurn(
  userQuery: string,
  profile: Record<string, any>,
  answers: Record<string, string>,
  language: string = "en",
  askedQuestions: string[] = [],
  candidateSchemes: string[] = [],
): Promise<DynamicTurn> {
  // Determine which namespaces to search — prefer explicit candidates, else search all
  const targetNamespaces =
    candidateSchemes.length > 0
      ? candidateSchemes.filter((id) => ALL_SCHEME_IDS.includes(id))
      : ALL_SCHEME_IDS;

  try {
    // 1. Get relevant scheme chunks using an enriched query
    const goalContext = answers.goal ? ` related to ${answers.goal}` : "";
    const enrichedQuery = `${userQuery}${goalContext}. Include details on financial benefits, required documents, eligibility, and how to apply.`;
    const queryEmbedding = await embedQuery(enrichedQuery);
    const index = getPineconeIndex();

    // Search ONLY relevant namespaces (not all 5) to get focused context
    const queryPromises = targetNamespaces.map(async (ns) => {
      try {
        const res = await index
          .namespace(ns)
          .query({ vector: queryEmbedding, topK: 15, includeMetadata: true });
        return res.matches || [];
      } catch (err) {
        console.error(`Pinecone query failed for namespace ${ns}:`, err);
        return [];
      }
    });
    const allMatches = (await Promise.all(queryPromises)).flat();
    allMatches.sort((a, b) => (b.score || 0) - (a.score || 0));
    const topMatches = allMatches.slice(0, 20); // Top 20 chunks across all schemes overall

    if (topMatches.length === 0) {
      return {
        status: "complete",
        results: { matchingSchemes: [], totalMatches: 0, noMatch: [] },
      };
    }

    // 2. Build context for Gemini
    const targetSchemeNames = targetNamespaces
      .map((id) => SCHEME_NAMES[id] || id)
      .join(", ");
    const schemeContext = topMatches
      .map((m) => {
        const meta = m.metadata as any;
        return `[Scheme: ${SCHEME_NAMES[meta.schemeId] || meta.schemeId}]\n${meta.text}`;
      })
      .join("\n\n---\n\n");

    const userInfo = `
Profile: ${JSON.stringify(profile)}
Answers so far: ${JSON.stringify(answers)}
    `.trim();

    // 3. Ask Gemini: "What's missing?"

    const prompt = `You are the Expert Government Advisor for SchemeSetu. 

IMPORTANT: The user is asking about: ${targetSchemeNames}
You MUST ONLY ask questions relevant to these specific schemes. Do NOT ask about unrelated topics.
    
CONTEXT:
User Query: "${userQuery}"
Target Schemes: ${targetSchemeNames}
Candidate Scheme Data: ${schemeContext}
User Profile: ${JSON.stringify(profile)}
User Answers (question → answer): ${JSON.stringify(answers)}
${askedQuestions.length > 0 ? `\nALREADY ASKED QUESTIONS (DO NOT repeat or rephrase any of these):\n${askedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}` : ""}

EXPECTED BEHAVIOR:
1. Focus ONLY on the target schemes listed above. Ignore unrelated scheme data.
2. Ask eligibility questions SPECIFIC to these schemes (e.g., for Ayushman Bharat ask about income/BPL status/family size, NOT about agricultural land).
3. NEVER ask "What are you looking for?" or "How can I help?" — the user already told you.
4. If you have enough details to confirm eligibility, respond with "complete".
5. NEVER repeat or rephrase a question that was already asked. Each question must gather NEW information.
6. If 3 or more questions have already been asked, strongly prefer responding with "complete" unless critical info is truly missing.

RULES for "questioning":
- Output 2-4 interactive chips.
- Keep the question very short and rural-friendly.
- Be authoritative. You know the rules.
- Ask about DIFFERENT eligibility criteria each time (e.g. age, income, BPL card, family size, documents — not the same topic twice).

JSON OUTPUT ONLY:
{
  "status": "questioning" | "complete",
  "question": "The specific expert question relevant to ${targetSchemeNames}",
  "chips": [{"label": "Option", "value": "val"}],
  "reasoning": "Internal logic"
}
`;

    const text = await generateContentWithFallback(prompt);
    const parsed = parseGeminiJSON(text);

    if (parsed?.status === "questioning") {
      return {
        status: "questioning",
        question: parsed.question as string,
        chips: parsed.chips as { label: string; value: string }[],
      };
    }

    // If complete or fallback, run the actual batch eligibility check without
    // doing duplicate embed/pinecone fetches. We already have the userQuery!
    console.log(
      "Determine Next Turn: Complete or Fallback. Fetching final RAG results.",
    );
    const finalResults = await queryMultiSchemeRAG(
      userQuery,
      language,
      targetNamespaces,
    );
    return { status: "complete", results: finalResults };
  } catch (err) {
    console.error("Dynamic turnover error:", err);
    // If the error is a rate limit, bubble it up to show the "Traffic" warning in UI
    if (
      err instanceof Error &&
      (err.message.includes("429") || err.message.includes("Retry exhausted"))
    ) {
      throw new Error("Quota Exceeded");
    }

    // Otherwise try fallback
    try {
      const fallbackResults = await queryMultiSchemeRAG(
        userQuery,
        language,
        targetNamespaces,
      );
      return { status: "complete", results: fallbackResults };
    } catch {
      return {
        status: "complete",
        results: { matchingSchemes: [], totalMatches: 0, noMatch: [] },
      };
    }
  }
}
