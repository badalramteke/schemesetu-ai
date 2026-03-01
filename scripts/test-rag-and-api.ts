import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { queryMultiSchemeRAG } from "../lib/rag-pipeline";
import type { RAGEcosystemResponse, EligibilityResult } from "../lib/rag-pipeline";

// ─── Test Queries ───────────────────────────────────────────────────────────

const MAIN_QUERIES = [
  "I'm a farmer with 2 acres of land in Maharashtra",
  "I'm a 26-year-old woman, unemployed, no assets",
  "I have no house, living in kutcha hut, no money",
  "I'm 35 years old, want monthly pension, have bank account",
  "I'm a government employee working in Delhi",
];

const EDGE_CASES = [
  { query: "farmer", label: "Very short query" },
  { query: "", label: "Empty query" },
  { query: "Mera naam Ramesh hai", label: "Non-English (Hindi)" },
  { query: "I   am   a    farmer", label: "Multiple spaces" },
];

// ─── Validation ──────────────────────────────────────────────────────────────

function validateResponse(res: RAGEcosystemResponse, queryLabel: string): string[] {
  const errors: string[] = [];

  if (!Array.isArray(res.matchingSchemes)) {
    errors.push("matchingSchemes is not an array");
  } else {
    for (const s of res.matchingSchemes) {
      if (!s.schemeId) errors.push(`Missing schemeId in matchingSchemes`);
      if (!s.schemeName) errors.push(`Missing schemeName for ${s.schemeId}`);
      if (s.eligible === undefined) errors.push(`Missing eligible for ${s.schemeId}`);
      if (!s.reason) errors.push(`Missing reason for ${s.schemeId}`);
      if (!Array.isArray(s.documents)) errors.push(`documents not array for ${s.schemeId}`);
      if (!Array.isArray(s.nextSteps)) errors.push(`nextSteps not array for ${s.schemeId}`);
      if (!s.benefits) errors.push(`Missing benefits for ${s.schemeId}`);
    }

    // Check sorting: eligible=true first, then null, then false
    const order = (e: boolean | null) => (e === true ? 0 : e === null ? 1 : 2);
    for (let i = 1; i < res.matchingSchemes.length; i++) {
      if (order(res.matchingSchemes[i].eligible) < order(res.matchingSchemes[i - 1].eligible)) {
        errors.push("matchingSchemes not sorted by eligibility");
        break;
      }
    }
  }

  if (typeof res.totalMatches !== "number") {
    errors.push("totalMatches is not a number");
  }

  if (!Array.isArray(res.noMatch)) {
    errors.push("noMatch is not an array");
  } else {
    for (const n of res.noMatch) {
      if (!n.schemeId) errors.push("Missing schemeId in noMatch");
      if (!n.schemeName) errors.push("Missing schemeName in noMatch");
      if (!n.reason) errors.push("Missing reason in noMatch");
    }
  }

  return errors;
}

// ─── Logging ─────────────────────────────────────────────────────────────────

function logResult(label: string, res: RAGEcosystemResponse) {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`📝 QUERY: "${label}"`);
  console.log(`${"─".repeat(70)}`);
  console.log(`✅ Matching Schemes: ${res.totalMatches}`);

  for (const s of res.matchingSchemes) {
    const badge = s.eligible === true ? "✅ ELIGIBLE" : s.eligible === null ? "🟡 MAYBE" : "❌ NOT ELIGIBLE";
    console.log(`\n  ${badge} — ${s.schemeName} (${s.schemeId})`);
    console.log(`    Reason: ${s.reason}`);
    console.log(`    Benefits: ${s.benefits}`);
    console.log(`    Documents: ${s.documents.join(", ")}`);
    console.log(`    Next Steps: ${s.nextSteps.join(" → ")}`);
  }

  if (res.noMatch.length > 0) {
    console.log(`\n  ⛔ No Match: ${res.noMatch.map((n) => n.schemeName).join(", ")}`);
  }
}

// ─── Test Runner ─────────────────────────────────────────────────────────────

async function runTests() {
  let passed = 0;
  let failed = 0;
  let totalTime = 0;

  console.log("\n🚀 PART 1: TESTING RAG PIPELINE DIRECTLY");
  console.log("═".repeat(70));

  // ── Main Queries ──
  for (const query of MAIN_QUERIES) {
    const start = Date.now();
    try {
      const result = await queryMultiSchemeRAG(query);
      const elapsed = Date.now() - start;
      totalTime += elapsed;

      logResult(query, result);

      const errors = validateResponse(result, query);
      if (errors.length === 0) {
        console.log(`\n  🧪 Validation: ✅ PASSED (${elapsed}ms)`);
        passed++;
      } else {
        console.log(`\n  🧪 Validation: ❌ FAILED (${elapsed}ms)`);
        errors.forEach((e) => console.log(`    ⚠️ ${e}`));
        failed++;
      }
    } catch (error: unknown) {
      const elapsed = Date.now() - start;
      totalTime += elapsed;
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`\n  ❌ ERROR: ${msg} (${elapsed}ms)`);
      failed++;
    }
  }

  // ── Edge Cases ──
  console.log("\n\n🧪 PART 2: EDGE CASE TESTS");
  console.log("═".repeat(70));

  for (const { query, label } of EDGE_CASES) {
    const start = Date.now();
    try {
      const result = await queryMultiSchemeRAG(query);
      const elapsed = Date.now() - start;
      totalTime += elapsed;

      if (query.trim().length < 3) {
        // Empty or very short queries should return empty results
        if (result.matchingSchemes.length === 0) {
          console.log(`\n  ✅ ${label}: Returned empty (correct) — ${elapsed}ms`);
          passed++;
        } else {
          console.log(`\n  ⚠️ ${label}: Expected empty but got ${result.totalMatches} matches — ${elapsed}ms`);
          failed++;
        }
      } else {
        console.log(`\n  ✅ ${label}: Returned ${result.totalMatches} matches — ${elapsed}ms`);
        passed++;
      }
    } catch (error: unknown) {
      const elapsed = Date.now() - start;
      totalTime += elapsed;
      const msg = error instanceof Error ? error.message : String(error);
      if (query.trim().length < 3) {
        console.log(`\n  ✅ ${label}: Threw error (acceptable for edge case) — ${elapsed}ms`);
        passed++;
      } else {
        console.log(`\n  ❌ ${label}: Unexpected error: ${msg} — ${elapsed}ms`);
        failed++;
      }
    }
  }

  // ── Summary ──
  console.log("\n\n" + "═".repeat(70));
  console.log("📊 TEST SUMMARY");
  console.log("═".repeat(70));
  console.log(`  Total Tests:  ${passed + failed}`);
  console.log(`  ✅ Passed:    ${passed}`);
  console.log(`  ❌ Failed:    ${failed}`);
  console.log(`  ⏱️  Total Time: ${(totalTime / 1000).toFixed(1)}s`);
  console.log(`  📈 Avg Time:  ${Math.round(totalTime / (passed + failed))}ms per query`);
  console.log("═".repeat(70));

  if (failed === 0) {
    console.log("\n🎉 ALL TESTS PASSED! RAG pipeline is working correctly.\n");
  } else {
    console.log(`\n⚠️ ${failed} test(s) failed. Review the output above.\n`);
  }
}

runTests();
