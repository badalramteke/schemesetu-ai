import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// ─── Environment Variables ───────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;

// ─── Scheme Definitions (file → namespace mapping) ──────────────────────────
const SCHEMES = [
  { file: "PM-KISAN.txt",   namespace: "pm-kisan",  label: "PM-KISAN" },
  { file: "AB-PMJAY.txt",   namespace: "ayushman",  label: "AYUSHMAN BHARAT" },
  { file: "PMAY-Awas.txt",  namespace: "pmay-g",    label: "PMAY-G" },
  { file: "MGNREGA.txt",    namespace: "mgnrega",   label: "MGNREGA" },
  { file: "APY .txt",       namespace: "apy",        label: "APY" },
];

const CHUNK_SIZE = 500; // characters per chunk
const RATE_LIMIT_DELAY = 500; // ms between API calls
const SCHEME_DATA_DIR = path.join(process.cwd(), "lib", "schemes", "scheme_data");

// ─── Utility: chunk text into pieces of CHUNK_SIZE characters ───────────────
function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// ─── Utility: embed a single text chunk via Gemini ──────────────────────────
async function embedChunk(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  text: string
): Promise<number[]> {
  const result = await model.embedContent(text);
  const embedding = result.embedding.values;

  if (!embedding || embedding.length === 0) {
    throw new Error("Embedding is empty or undefined");
  }

  return embedding as number[];
}

// ─── Seed a single scheme into its own Pinecone namespace ───────────────────
async function seedSchemeToNamespace(
  index: ReturnType<Pinecone["index"]>,
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  scheme: (typeof SCHEMES)[0]
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

  console.log(`\n📦 Uploading ${scheme.label} to namespace '${scheme.namespace}'...`);
  console.log(`   📂 Split into ${chunks.length} chunks`);

  const ns = index.namespace(scheme.namespace);
  let uploadedCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    try {
      console.log(`   ⏳ Embedding & uploading chunk ${i + 1}/${chunks.length}...`);

      // Embed the chunk
      const embedding = await embedChunk(model, chunk);

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

      // Rate limit delay
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
    } catch (error) {
      console.error(`   ❌ Failed chunk ${i + 1}:`, error);
    }
  }

  console.log(`✅ ${uploadedCount} chunks uploaded to '${scheme.namespace}'`);
  return uploadedCount;
}

// ─── Main: seed all schemes and print final summary ─────────────────────────
async function seedAllSchemes(): Promise<void> {
  // Validate environment variables
  if (!GEMINI_API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
    console.error("❌ Missing required environment variables. Please check .env.local");
    process.exit(1);
  }

  console.log("🚀 Starting namespace-based Pinecone seeding...");
  console.log(`   Index: ${PINECONE_INDEX_NAME}`);
  console.log(`   Schemes: ${SCHEMES.length}`);
  console.log(`   Chunk size: ${CHUNK_SIZE} chars\n`);

  // Initialize clients
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(PINECONE_INDEX_NAME);

  // Describe index for info
  try {
    const describe = await pc.describeIndex(PINECONE_INDEX_NAME);
    console.log(`🎯 Index dimension: ${describe.dimension}, metric: ${describe.metric}`);
  } catch {
    console.warn("⚠️ Could not describe index, proceeding anyway.");
  }

  // Seed each scheme into its own namespace
  const results: { namespace: string; label: string; count: number }[] = [];

  for (const scheme of SCHEMES) {
    const count = await seedSchemeToNamespace(index, model, scheme);
    results.push({ namespace: scheme.namespace, label: scheme.label, count });
  }

  // ─── Final Summary ──────────────────────────────────────────────────────
  const totalVectors = results.reduce((sum, r) => sum + r.count, 0);

  console.log("\n════════════════════════════════════════");
  console.log(`✅ All ${SCHEMES.length} schemes uploaded to separate namespaces`);
  console.log(`   Total vectors: ${totalVectors}`);
  for (const r of results) {
    console.log(`   ${r.namespace}: ${r.count} vectors`);
  }
  console.log("════════════════════════════════════════\n");
}

seedAllSchemes();
