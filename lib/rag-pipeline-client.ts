// ─── Client-safe exports from RAG pipeline ──────────────────────────────────
// This file contains types and pure functions that can be safely imported
// from client components ("use client") without pulling in server-only
// dependencies like Pinecone or fs.

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

export interface WizardQuestion {
  id: string;
  question: string;
  inputType: "single-select" | "multi-select" | "dropdown" | "text" | "number";
  options?: { label: string; value: string }[];
  required: boolean;
  placeholder?: string;
}

export interface RAGEcosystemResponse {
  matchingSchemes: EligibilityResult[];
  totalMatches: number;
  noMatch: NoMatchScheme[];
}

// ─── Pure Functions ──────────────────────────────────────────────────────────

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
    {
      id: "jsy",
      keywords: [
        "pregnancy",
        "pregnant",
        "delivery",
        "maternal",
        "mother",
        "baby",
        "newborn",
        "childbirth",
        "janani",
        "suraksha",
        "asha",
        "hospital delivery",
        "antenatal",
        "postnatal",
        "neonatal",
      ],
    },
    {
      id: "nmmss",
      keywords: [
        "scholarship",
        "student",
        "merit",
        "school",
        "education",
        "study",
        "class 8",
        "class 9",
        "class 10",
        "exam",
        "nmmss",
        "nmms",
        "tuition",
        "dropout",
        "secondary school",
      ],
    },
    {
      id: "pmfby",
      keywords: [
        "crop insurance",
        "fasal bima",
        "pmfby",
        "crop loss",
        "flood damage",
        "drought loss",
        "hailstorm",
        "crop damage",
        "insurance claim",
        "bima",
        "kharif",
        "rabi",
        "harvest loss",
        "natural disaster crop",
      ],
    },
    {
      id: "pmkvy",
      keywords: [
        "skill",
        "training",
        "vocational",
        "kaushal",
        "pmkvy",
        "course",
        "certificate",
        "skill india",
        "apprentice",
        "placement",
        "learn trade",
        "computer course",
        "driving",
        "tailoring",
        "electrician",
        "plumber",
      ],
    },
    {
      id: "pmuy",
      keywords: [
        "gas",
        "lpg",
        "cylinder",
        "cooking gas",
        "ujjwala",
        "pmuy",
        "stove",
        "fuel",
        "firewood",
        "chulha",
        "smokeless",
        "gas connection",
        "cooking fuel",
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

  matched.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.firstIndex - b.firstIndex;
  });

  return matched[0].id;
}
