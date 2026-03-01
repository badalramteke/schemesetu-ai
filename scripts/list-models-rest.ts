import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_GEMINI_API_KEY");
  process.exit(1);
}

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("Available models:");
      data.models.forEach((m: any) => {
        console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(", ")})`);
      });
    } else {
      console.log("No models returned. API response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

listModels();
