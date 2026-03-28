import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Vision-capable models in priority order
const VISION_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

function getGeminiKeys(): string[] {
  return [
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_BACKUP,
  ].filter(Boolean) as string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { base64Data, mimeType, documentId, userId } = body;

    if (!base64Data || !documentId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: base64Data, documentId, userId" },
        { status: 400 },
      );
    }

    const keys = getGeminiKeys();
    if (keys.length === 0) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    const resolvedMime = mimeType || "image/jpeg";

    const prompt = `You are an OCR and document analysis expert for Indian government documents.

TASK: Extract ALL text from this document image/PDF page, then identify structured fields.

STEP 1: OCR — Extract every piece of text visible in the document. Be thorough.

STEP 2: Identify the document type. Common Indian documents:
- Aadhaar Card
- PAN Card
- Ration Card (BPL/APL/AAY)
- Land Records (Khatauni/Khasra/7-12 extract)
- Bank Passbook / Statement
- Income Certificate
- Caste Certificate
- Domicile / Residence Certificate
- Voter ID
- Driving License
- Birth Certificate
- Other

STEP 3: Extract structured fields. For each field, rate confidence as "high", "medium", or "low".

Respond ONLY as valid JSON (no markdown, no code fences):
{
  "ocrText": "The complete raw text extracted from the document",
  "documentType": "Aadhaar Card | PAN Card | Ration Card | Land Record | Bank Passbook | Income Certificate | Caste Certificate | Domicile Certificate | Voter ID | Other",
  "documentTags": ["aadhaar", "identity", ...relevant tags],
  "extractedFields": {
    "fullName": { "value": "...", "confidence": "high" },
    "fatherName": { "value": "...", "confidence": "medium" },
    "dateOfBirth": { "value": "DD/MM/YYYY or as found", "confidence": "high" },
    "age": { "value": "...", "confidence": "medium" },
    "gender": { "value": "Male/Female/Other", "confidence": "high" },
    "address": { "value": "full address as found", "confidence": "medium" },
    "state": { "value": "...", "confidence": "medium" },
    "district": { "value": "...", "confidence": "medium" },
    "village": { "value": "...", "confidence": "low" },
    "pincode": { "value": "...", "confidence": "high" },
    "aadhaarLast4": { "value": "last 4 digits only", "confidence": "high" },
    "panNumber": { "value": "...", "confidence": "high" },
    "bankAccountPresent": { "value": "yes/no", "confidence": "high" },
    "bankName": { "value": "...", "confidence": "medium" },
    "ifscCode": { "value": "...", "confidence": "high" },
    "rationCardType": { "value": "BPL/APL/AAY/None", "confidence": "medium" },
    "landOwnership": { "value": "yes/no", "confidence": "medium" },
    "landArea": { "value": "X acres/hectares", "confidence": "medium" },
    "income": { "value": "annual income if found", "confidence": "low" },
    "caste": { "value": "SC/ST/OBC/General if found", "confidence": "medium" },
    "occupation": { "value": "...", "confidence": "low" }
  }
}

RULES:
- Only include fields that are actually present in the document. Omit fields not found.
- For Aadhaar: extract ONLY last 4 digits of the number for privacy.
- Be accurate — do not guess values. If uncertain, set confidence to "low".
- ocrText must contain ALL visible text, not a summary.`;

    const inlineData = {
      mimeType: resolvedMime.startsWith("application/pdf")
        ? "application/pdf"
        : resolvedMime,
      data: base64Data,
    };

    // Try all models across all keys (same fallback pattern as RAG pipeline)
    let responseText: string | null = null;
    let lastError: string = "";

    for (const key of keys) {
      const genAI = new GoogleGenerativeAI(key);
      for (const modelName of VISION_MODELS) {
        try {
          if (process.env.NODE_ENV === "development")
            console.log(`[OCR] Trying model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([prompt, { inlineData }]);
          responseText = result.response.text();
          break;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          lastError = msg;
          const isRetryable =
            msg.includes("429") ||
            msg.includes("RESOURCE_EXHAUSTED") ||
            msg.includes("404") ||
            msg.includes("not found") ||
            msg.includes("not supported") ||
            msg.includes("quota");
          if (!isRetryable) {
            console.error(`[OCR] Non-retryable error on ${modelName}:`, msg);
            throw err;
          }
          console.warn(`[OCR] ${modelName} failed (${msg}). Trying next...`);
        }
      }
      if (responseText) break;
    }

    if (!responseText) {
      return NextResponse.json(
        { error: `All Gemini vision models failed. Last error: ${lastError}` },
        { status: 502 },
      );
    }

    // Parse the JSON response
    let cleaned = responseText.trim();
    // Strip markdown code fences if present
    const fenceMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
    if (fenceMatch) {
      cleaned = fenceMatch[1];
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Try extracting JSON from within the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        console.error(
          "[OCR] Failed to parse Gemini response:",
          cleaned.slice(0, 500),
        );
        return NextResponse.json(
          { error: "Failed to parse OCR response from AI model" },
          { status: 502 },
        );
      }
    }

    // Add source document references to each extracted field
    const fieldsWithSource: Record<string, unknown> = {};
    if (parsed.extractedFields && typeof parsed.extractedFields === "object") {
      for (const [key, val] of Object.entries(
        parsed.extractedFields as Record<string, unknown>,
      )) {
        if (val && typeof val === "object") {
          fieldsWithSource[key] = {
            ...(val as object),
            sourceDocumentId: documentId,
            extractedAt: Date.now(),
          };
        }
      }
    }

    return NextResponse.json(
      {
        ocrText: (parsed.ocrText as string) || "",
        extractedFields: fieldsWithSource,
        documentTags: (parsed.documentTags as string[]) || [],
        documentType: (parsed.documentType as string) || "Other",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("OCR API error:", error);
    const message =
      error instanceof Error ? error.message : "OCR processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
