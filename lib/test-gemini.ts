// This tests if Gemini API key works
// Don't commit this, just for testing

import { GoogleGenerativeAI } from "@google/generative-ai";

const testGemini = async () => {
  try {
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent("Say hello");

    console.log("✅ Gemini API works!");
    console.log("Response:", response.response.text());
  } catch (error) {
    console.error("❌ Gemini API failed:", error);
  }
};

testGemini();