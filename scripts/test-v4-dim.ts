import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent("test");
    console.log("embedding-001 dimension:", result.embedding.values.length);
  } catch (e: any) {
    console.error("Error with text-embedding-004:", e.message);
  }
}

test();
