import { NextResponse } from "next/server";
import { generateWizardQuestions } from "@/lib/rag-pipeline";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userQuery, language, profile, candidateSchemes, userId } = body;

    if (
      !userQuery ||
      typeof userQuery !== "string" ||
      userQuery.trim().length < 3
    ) {
      return NextResponse.json(
        { error: "Invalid query", message: "Please provide a valid query." },
        { status: 400 },
      );
    }

    const lang = language === "hi" || language === "mr" ? language : "en";

    // Load document memory and merge with profile
    let enrichedProfile = profile || {};
    let memoryContext = "";
    if (userId) {
      try {
        const { getProfileMemory } =
          await import("@/lib/services/document-service");
        const { buildMemoryContext } =
          await import("@/lib/services/memory-service");
        const memory = await getProfileMemory(userId);
        if (memory && Object.keys(memory.mergedFacts).length > 0) {
          enrichedProfile = { ...memory.mergedFacts, ...enrichedProfile };
          memoryContext = buildMemoryContext(memory);
        }
      } catch (e) {
        console.warn("Failed to load profile memory:", e);
      }
    }

    const questions = await generateWizardQuestions(
      userQuery.trim(),
      enrichedProfile,
      lang,
      candidateSchemes || [],
      memoryContext,
    );

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error: unknown) {
    console.error("API /api/wizard-questions error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate questions", message },
      { status: 500 },
    );
  }
}
