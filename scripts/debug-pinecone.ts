import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PINECONE_API_KEY = process.env.PINECONE_API_KEY as string;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string; 

async function testConnection() {
  try {
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
    
    console.log("Checking indexes...");
    const indexes = await pc.listIndexes();
    console.log("Existing indexes:", JSON.stringify(indexes, null, 2));

    const index = pc.index(PINECONE_INDEX_NAME);
    console.log(`Connecting to index: ${PINECONE_INDEX_NAME}`);
    
    try {
        const stats = await index.describeIndexStats();
        console.log("Index stats:", JSON.stringify(stats, null, 2));
    } catch (e: any) {
        console.error(`❌ Could not describe stats for ${PINECONE_INDEX_NAME}: ${e.message}`);
    }

  } catch (error: any) {
    console.error("❌ Pinecone connection failed:", error.message);
  }
}

testConnection();
