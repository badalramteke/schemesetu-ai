import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// ─── Environment Variables ───────────────────────────────────────────────────
const GEMINI_API_KEYS = [
  process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_BACKUP,
].filter(Boolean) as string[];

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;

// ─── Scheme Definitions (file → namespace mapping) ──────────────────────────
const SCHEMES = [
  { file: "PM-KISAN.txt", namespace: "pm-kisan", label: "PM-KISAN" },
  { file: "AB-PMJAY.txt", namespace: "ayushman", label: "AYUSHMAN BHARAT" },
  { file: "PMAY-Awas.txt", namespace: "pmay-g", label: "PMAY-G" },
  { file: "MGNREGA.txt", namespace: "mgnrega", label: "MGNREGA" },
  { file: "APY .txt", namespace: "apy", label: "APY" },
  { file: "Janani Suraksha Yojana Scheme Research.txt", namespace: "jsy", label: "JSY" },
  { file: "NMMSS Scheme Information Extraction.txt", namespace: "nmmss", label: "NMMSS" },
  { file: "PMFBY Scheme Information Extraction.txt", namespace: "pmfby", label: "PMFBY" },
  { file: "PMKVY Scheme Information Extraction.txt", namespace: "pmkvy", label: "PMKVY" },
  { file: "PMUY Scheme Information Extraction.txt", namespace: "pmuy", label: "PMUY" },
];

const CHUNK_SIZE = 500; // characters per chunk
const RATE_LIMIT_DELAY = 1500; // ms between API calls (increased to avoid rate limits)
const MAX_RETRIES = 5; // max retries per chunk
const SCHEME_DATA_DIR = path.join(
  process.cwd(),
  "lib",
  "schemes",
  "scheme_data",
);

// Track which key index to use (rotates on failure)
let currentKeyIndex = 0;

// ─── Utility: chunk text into pieces of CHUNK_SIZE characters ───────────────
function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// ─── Utility: sleep helper ──────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Utility: embed a single text chunk via Gemini with retry + key rotation ─
async function embedChunk(text: string): Promise<number[]> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Try each available key starting from the current one
    for (let keyOffset = 0; keyOffset < GEMINI_API_KEYS.length; keyOffset++) {
      const keyIdx = (currentKeyIndex + keyOffset) % GEMINI_API_KEYS.length;
      const key = GEMINI_API_KEYS[keyIdx];
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

      try {
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;

        if (!embedding || embedding.length === 0) {
          throw new Error("Embedding is empty or undefined");
        }

        // Success — prefer this key going forward
        currentKeyIndex = keyIdx;
        return embedding as number[];
      } catch (err: unknown) {
        lastError = err;
        const status = (err as { status?: number }).status;
        const msg = String(err);

        // Rate limit or transient "key expired" (Google's misleading error)
        if (status === 429 || status === 400 || status === 503) {
          const backoff = Math.min(1000 * Math.pow(2, attempt), 30000);
          console.warn(
            `   ⚠️  Key ${keyIdx + 1} hit ${status} (attempt ${attempt + 1}/${MAX_RETRIES}). ` +
              `Backing off ${backoff}ms...`,
          );
          await sleep(backoff);
          // Rotate to next key for the next inner-loop iteration
          continue;
        }

        // Genuinely invalid key (403) — skip this key permanently
        if (status === 403) {
          console.warn(
            `   ⚠️  Key ${keyIdx + 1} is permanently invalid (403), skipping.`,
          );
          continue;
        }

        // Unknown error — bubble up
        throw err;
      }
    }
  }

  throw lastError ?? new Error("All retries exhausted for embedding");
}

// ─── Seed a single scheme into its own Pinecone namespace ───────────────────
async function seedSchemeToNamespace(
  index: ReturnType<Pinecone["index"]>,
  scheme: (typeof SCHEMES)[0],
): Promise<number> {
  const filePath = path.join(SCHEME_DATA_DIR, scheme.file);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return 0;
  }

  // Read and chunk the text
  const text = fs.readFileSync(filePath, "utf-8");
  const chunks = chunkText(text, CHUNK_SIZE);

  console.log(
    `\n📦 Uploading ${scheme.label} to namespace '${scheme.namespace}'...`,
  );
  console.log(`   📂 Split into ${chunks.length} chunks`);

  const ns = index.namespace(scheme.namespace);
  let uploadedCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    try {
      console.log(
        `   ⏳ Embedding & uploading chunk ${i + 1}/${chunks.length}...`,
      );

      // Embed the chunk (with built-in retry + key rotation)
      const embedding = await embedChunk(chunk);

      // Build the vector record with metadata
      const record = {
        id: `${scheme.namespace}-chunk-${i}`,
        values: embedding,
        metadata: {
          schemeId: scheme.namespace,
          chunkNumber: i + 1,
          text: chunk,
        },
      };

      // Upsert into the scheme's dedicated namespace
      await ns.upsert({ records: [record] });
      uploadedCount++;

      // Rate limit delay between chunks
      await sleep(RATE_LIMIT_DELAY);
    } catch (error) {
      console.error(
        `   ❌ Failed chunk ${i + 1} after ${MAX_RETRIES} retries:`,
        error,
      );
    }
  }

  console.log(`✅ ${uploadedCount} chunks uploaded to '${scheme.namespace}'`);
  return uploadedCount;
}

// ─── Main: seed all schemes and print final summary ─────────────────────────
async function seedAllSchemes(): Promise<void> {
  // Validate environment variables
  if (
    GEMINI_API_KEYS.length === 0 ||
    !PINECONE_API_KEY ||
    !PINECONE_INDEX_NAME
  ) {
    console.error(
      "❌ Missing required environment variables. Please check .env.local",
    );
    process.exit(1);
  }

  console.log("🚀 Starting namespace-based Pinecone seeding...");
  console.log(`   Index: ${PINECONE_INDEX_NAME}`);
  console.log(`   Schemes: ${SCHEMES.length}`);
  console.log(`   Chunk size: ${CHUNK_SIZE} chars`);
  console.log(`   API keys available: ${GEMINI_API_KEYS.length}`);
  console.log(`   Rate limit delay: ${RATE_LIMIT_DELAY}ms`);
  console.log(`   Max retries per chunk: ${MAX_RETRIES}\n`);

  // Initialize Pinecone client
  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(PINECONE_INDEX_NAME);

  // Describe index for info
  try {
    const describe = await pc.describeIndex(PINECONE_INDEX_NAME);
    console.log(
      `🎯 Index dimension: ${describe.dimension}, metric: ${describe.metric}`,
    );
  } catch {
    console.warn("⚠️ Could not describe index, proceeding anyway.");
  }

  // Seed each scheme into its own namespace
  const results: { namespace: string; label: string; count: number }[] = [];

  for (const scheme of SCHEMES) {
    const count = await seedSchemeToNamespace(index, scheme);
    results.push({ namespace: scheme.namespace, label: scheme.label, count });
  }

  // ─── Final Summary ──────────────────────────────────────────────────────
  const totalVectors = results.reduce((sum, r) => sum + r.count, 0);

  console.log("\n════════════════════════════════════════");
  console.log(
    `✅ All ${SCHEMES.length} schemes uploaded to separate namespaces`,
  );
  console.log(`   Total vectors: ${totalVectors}`);
  for (const r of results) {
    console.log(`   ${r.namespace}: ${r.count} vectors`);
  }
  console.log("════════════════════════════════════════\n");
}

seedAllSchemes();
