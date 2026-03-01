import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PINECONE_API_KEY = process.env.PINECONE_API_KEY as string;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string;

async function testIntegrated() {
  try {
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
    const index = pc.index(PINECONE_INDEX_NAME);

    console.log(`🚀 Testing integrated upsert to ${PINECONE_INDEX_NAME}...`);

    // In Integrated Inference, we usually send the text in the metadata
    // and let Pinecone handle the 'values' generation if supported in the SDK version.
    // However, some SDKs still require 'values' or a specific method.
    // Let's try sending a dummy vector or see if the SDK supports it.
    
    // Actually, if we use the Inference API, we can generate embeddings first.
    // But the user's index already has 'embed' config.
    
    try {
        await index.upsert([
            {
                id: "test-integrated-1",
                // values: [] as any, // Try empty values
                metadata: {
                    text: "This is a test of integrated inference.",
                    schemeId: "test"
                }
            }
        ] as any);
        console.log("✅ Upsert successful (with text metadata)!");
    } catch (e: any) {
        console.error("❌ Upsert failed:", e.message);
    }

  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
  }
}

testIntegrated();
