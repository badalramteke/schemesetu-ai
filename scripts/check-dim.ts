import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function checkDim() {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent("test");
  console.log("Model: gemini-embedding-001");
  console.log("Dimension:", result.embedding.values.length);
  
  try {
      const model4 = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result4 = await model4.embedContent("test");
      console.log("Model: text-embedding-004");
      console.log("Dimension:", result4.embedding.values.length);
  } catch (e) {}
}

checkDim();
