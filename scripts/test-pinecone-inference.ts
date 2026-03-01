import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PINECONE_API_KEY = process.env.PINECONE_API_KEY as string;

async function testInference() {
  try {
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
    
    console.log("🚀 Testing Pinecone Inference API...");
    
    // Check if pc.inference is available
    if (!(pc as any).inference) {
        console.log("❌ pc.inference is not available on this SDK version.");
        return;
    }

    const embeddings = await (pc as any).inference.embed(
      'llama-text-embed-v2',
      ['This is a test of Pinecone inference.'],
      { inputType: 'passage', truncate: 'END' }
    );

    console.log("✅ Embeddings generated!");
    console.log("Dimension:", embeddings.data[0]?.values?.length);
    console.log("Values snippet:", embeddings.data[0]?.values?.slice(0, 5));

  } catch (error: any) {
    console.error("❌ Inference test failed:", error.message);
  }
}

testInference();
