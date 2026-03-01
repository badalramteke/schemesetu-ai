// ─── Conversational Engine for SchemeSetu ────────────────────────────────────
// Drives the one-question-at-a-time eligibility interview before calling RAG.

export type ConvPhase = "idle" | "goal" | "questions" | "rag";

// ── Goal → candidate scheme mapping ──────────────────────────────────────────

export const GOAL_SCHEME_MAP: Record<string, string[]> = {
  financial:   ["pm-kisan", "mgnrega"],
  subsidy:     ["pm-kisan"],
  health:      ["ayushman"],
  housing:     ["pmay-g"],
  pension:     ["apy"],
  loan:        [],
  training:    [],
  employment:  ["mgnrega"],
  everything:  ["pm-kisan", "ayushman", "pmay-g", "mgnrega", "apy"],
};

// Infer from keywords in initial free-text query
export function inferSchemesFromQuery(query: string): string[] {
  const s = new Set<string>();
  if (/farm|kisan|crop|land|agri|khet|खेती|शेती/i.test(query))         s.add("pm-kisan");
  if (/health|hospital|medical|ayushman|bimari|आरोग्य|स्वास्थ्य/i.test(query)) s.add("ayushman");
  if (/house|ghar|awas|housing|shelter|makan|घर|गृह/i.test(query))      s.add("pmay-g");
  if (/work|nrega|mgnrega|job|employ|kaam|रोज़गार|काम|रोजगार/i.test(query)) s.add("mgnrega");
  if (/pension|retire|apy|atal|बुढ़ापा|निवृत्ती/i.test(query))           s.add("apy");
  return [...s];
}

export function getCandidateSchemes(goalValue: string, initialQuery: string): string[] {
  const fromGoal = GOAL_SCHEME_MAP[goalValue] ?? [];
  if (fromGoal.length > 0) return fromGoal;
  const fromQuery = inferSchemesFromQuery(initialQuery);
  return fromQuery.length > 0
    ? fromQuery
    : ["pm-kisan", "ayushman", "pmay-g", "mgnrega", "apy"];
}
