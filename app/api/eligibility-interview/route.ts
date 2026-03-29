import { NextResponse } from "next/server";
import {
  createInterviewState,
  determineNextQuestion,
  recordAnswer,
  validateAnswer,
  computeEligibility,
  hasInterviewTree,
  INTERVIEW_ENABLED_SCHEMES,
} from "@/lib/eligibility";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, schemeId, questionId, answerValue, currentState } = body;

    if (!schemeId || typeof schemeId !== "string") {
      return NextResponse.json({ error: "Missing schemeId" }, { status: 400 });
    }

    // Check if scheme has an interview tree
    if (!hasInterviewTree(schemeId)) {
      return NextResponse.json(
        {
          error: "No interview tree",
          message: `Scheme "${schemeId}" does not have a structured interview. Available: ${INTERVIEW_ENABLED_SCHEMES.join(", ")}`,
          availableSchemes: INTERVIEW_ENABLED_SCHEMES,
        },
        { status: 404 },
      );
    }

    switch (action) {
      case "start": {
        const state = createInterviewState(schemeId);
        const next = determineNextQuestion(state);
        return NextResponse.json({
          state,
          next,
        });
      }

      case "answer": {
        if (!questionId || !answerValue || !currentState) {
          return NextResponse.json(
            { error: "Missing questionId, answerValue, or currentState" },
            { status: 400 },
          );
        }

        // Validate the answer
        const validation = validateAnswer(
          currentState,
          questionId,
          answerValue,
        );

        // Record the answer
        const newState = recordAnswer(
          currentState,
          questionId,
          answerValue,
          validation.confidence,
        );

        // Get next question
        const next = determineNextQuestion(newState);

        return NextResponse.json({
          state: newState,
          next,
          validation,
        });
      }

      case "compute": {
        if (!currentState) {
          return NextResponse.json(
            { error: "Missing currentState" },
            { status: 400 },
          );
        }
        const result = computeEligibility(currentState.answers, schemeId);
        return NextResponse.json({ result });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: start, answer, compute" },
          { status: 400 },
        );
    }
  } catch (error: unknown) {
    console.error("API /api/eligibility-interview error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process", message },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    availableSchemes: INTERVIEW_ENABLED_SCHEMES,
    description:
      "AI Eligibility Interview System. POST with {action: 'start', schemeId: 'pm-kisan'} to begin.",
  });
}
