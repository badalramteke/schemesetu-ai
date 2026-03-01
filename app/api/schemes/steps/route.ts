import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGeminiKeys(): string[] {
  return [
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_BACKUP,
  ].filter(Boolean) as string[];
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
    }
  }
  throw new Error("Embedding quota exceeded");
}

const SCHEME_ID_MAP: Record<string, string> = {
  "PM-KISAN": "pm-kisan",
  "Ayushman Bharat (PMJAY)": "ayushman",
  "PMAY-G (Awas Yojana)": "pmay-g",
  MGNREGA: "mgnrega",
  "Atal Pension Yojana (APY)": "apy",
  // Direct IDs
  "pm-kisan": "pm-kisan",
  ayushman: "ayushman",
  "pmay-g": "pmay-g",
  mgnrega: "mgnrega",
  apy: "apy",
};

// ── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { schemeId, schemeName } = await request.json();
    const namespace =
      SCHEME_ID_MAP[schemeId] || SCHEME_ID_MAP[schemeName] || schemeId;

    if (!namespace) {
      return NextResponse.json({ error: "Invalid scheme" }, { status: 400 });
    }

    // Embed a query specifically for application process steps
    const stepQuery = `How to apply for this scheme step by step process online and offline application procedure registration`;
    const embedding = await embedQuery(stepQuery);

    // Query Pinecone for this scheme's namespace
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.index(process.env.PINECONE_INDEX_NAME!);
    const results = await index.namespace(namespace).query({
      vector: embedding,
      topK: 10,
      includeMetadata: true,
    });

    // Extract text chunks and filter for application-related content
    const allChunks = (results.matches || [])
      .map((m) => ({
        text: (m.metadata as Record<string, string>)?.text || "",
        score: m.score || 0,
      }))
      .filter((c) => c.text.length > 20);

    // Filter chunks that contain application/step/process keywords
    const stepChunks = allChunks.filter((c) => {
      const t = c.text.toLowerCase();
      return (
        t.includes("how to apply") ||
        t.includes("step") ||
        t.includes("option") ||
        t.includes("register") ||
        t.includes("online") ||
        t.includes("offline") ||
        t.includes("csc") ||
        t.includes("portal") ||
        t.includes("app") ||
        t.includes("bank") ||
        t.includes("gram panchayat") ||
        t.includes("apply")
      );
    });

    // Use all chunks if step-specific ones are too few
    const contextChunks = stepChunks.length >= 2 ? stepChunks : allChunks;
    const context = contextChunks.map((c) => c.text).join("\n\n---\n\n");

    // Ask Gemini to structure the steps
    const keys = getGeminiKeys();
    const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

    const prompt = `You are an expert on Indian government scheme application processes.

Based ONLY on the following official scheme information, extract the step-by-step application process.

SCHEME DATA:
${context}

Respond ONLY as valid JSON (no markdown, no code fences):
{
  "online": {
    "title": "Online Application",
    "steps": [
      {"step": 1, "title": "Short title", "description": "Detailed description of what to do"},
      ...
    ]
  },
  "offline": {
    "title": "Offline Application", 
    "steps": [
      {"step": 1, "title": "Short title", "description": "Detailed description of what to do"},
      ...
    ]
  },
  "atHospital": null
}

RULES:
1. Extract ONLY from the data provided. Do NOT invent steps.
2. If there's a third option (like at hospital, at bank, at post office), add it as "atHospital" with same structure (rename title appropriately, e.g. "At the Hospital", "At your Bank Branch").
3. If online or offline process is not mentioned, set that key to null.
4. Keep descriptions rural-friendly and simple.
5. Include specific portal URLs, app names, office names when mentioned in the data.`;

    let responseText = "";
    for (const key of keys) {
      const genAI = new GoogleGenerativeAI(key);
      for (const modelName of MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          responseText = result.response.text();
          break;
        } catch {
          continue;
        }
      }
      if (responseText) break;
    }

    if (!responseText) {
      return NextResponse.json({ error: "AI quota exceeded" }, { status: 503 });
    }

    // Parse JSON response
    let cleaned = responseText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("Steps API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch application steps" },
      { status: 500 },
    );
  }
}
