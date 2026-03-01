import { NextResponse } from "next/server";
import { determineNextTurn } from "@/lib/rag-pipeline";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userQuery, language, profile, answers } = body;

    if (!userQuery || typeof userQuery !== "string" || userQuery.trim().length < 3) {
      return NextResponse.json(
        { error: "Invalid query", message: "Please provide a valid query (at least 3 characters)." },
        { status: 400 }
      );
    }

    const lang = (language === "hi" || language === "mr") ? language : "en";
    
    // Call the Dynamic AI Interviewer
    const result = await determineNextTurn(
      userQuery.trim(),
      profile || {},
      answers || {},
      lang
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("API /api/query error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process query", message },
      { status: 500 }
    );
  }
}
