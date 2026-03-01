import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;

if (!GEMINI_API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
  console.error("❌ Missing required environment variables. Please check .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

// All schemes to seed
const SCHEMES = [
  { file: "PM-KISAN.txt", schemeId: "pm-kisan", source: "PM-KISAN Official Document" },
  { file: "AB-PMJAY.txt", schemeId: "ab-pmjay", source: "Ayushman Bharat PMJAY Official Document" },
  { file: "PMAY-Awas.txt", schemeId: "pmay-awas", source: "PMAY Awas Yojana Official Document" },
  { file: "MGNREGA.txt", schemeId: "mgnrega", source: "MGNREGA Official Document" },
  { file: "APY .txt", schemeId: "apy", source: "Atal Pension Yojana Official Document" },
];

async function seedScheme(
  index: ReturnType<Pinecone["index"]>,
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  scheme: typeof SCHEMES[0]
) {
  const filePath = path.join(process.cwd(), "lib", "schemes", "scheme_data", scheme.file);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${scheme.file}`);
    return { success: 0, fail: 0 };
  }

  const text = fs.readFileSync(filePath, "utf-8");

  // Split text into chunks of 500 characters
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += 500) {
    chunks.push(text.slice(i, i + 500));
  }

  console.log(`\n📂 ${scheme.file}: Split into ${chunks.length} chunks.`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`⏳ [${scheme.schemeId}] Uploading chunk ${i + 1}/${chunks.length}...`);

    try {
      const result = await model.embedContent(chunk);
      const embedding = result.embedding.values;

      if (!embedding || embedding.length === 0) {
        throw new Error("Embedding is empty or undefined");
      }

      const record = {
        id: `${scheme.schemeId}-chunk-${i}`,
        values: embedding as number[],
        metadata: {
          schemeId: scheme.schemeId,
          text: chunk,
          source: scheme.source,
        },
      };

      await index.upsert({ records: [record] });
      successCount++;

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error uploading chunk ${i + 1}:`, error);
      failCount++;
    }
  }

  return { success: successCount, fail: failCount };
}

async function seed() {
  try {
    const index = pc.index(PINECONE_INDEX_NAME);

    try {
      const describe = await pc.describeIndex(PINECONE_INDEX_NAME);
      console.log(`🎯 Index: ${PINECONE_INDEX_NAME}, Dimension: ${describe.dimension}, Metric: ${describe.metric}`);
    } catch (e) {
      console.warn("⚠️ Could not describe index, proceeding anyway.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    let totalSuccess = 0;
    let totalFail = 0;

    for (const scheme of SCHEMES) {
      const { success, fail } = await seedScheme(index, model, scheme);
      totalSuccess += success;
      totalFail += fail;
    }

    console.log("\n========================================");
    if (totalFail === 0) {
      console.log(`✅ All ${totalSuccess} chunks across ${SCHEMES.length} schemes uploaded successfully!`);
    } else {
      console.log(`⚠️ Completed with ${totalSuccess} successes and ${totalFail} failures across ${SCHEMES.length} schemes.`);
    }
    console.log("========================================");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

seed();
