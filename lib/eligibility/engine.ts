// ─── AI Eligibility Interview Engine ─────────────────────────────────────────
// Drives smart question logic with dependency resolution, skip logic, follow-ups,
// contradiction detection, and confidence scoring.

import type {
  EligibilityQuestion,
  UserAnswers,
  UserAnswer,
  AnswerConfidence,
  EligibilityResult,
  NextQuestionResult,
  AnswerValidation,
  InterviewState,
  SchemeQuestionTree,
} from "./types";
import { QUESTION_TREES, INTERVIEW_ENABLED_SCHEMES } from "./question-trees";

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Check if a scheme has a structured interview tree.
 */
export function hasInterviewTree(schemeId: string): boolean {
  return INTERVIEW_ENABLED_SCHEMES.includes(schemeId);
}

/**
 * Get the question tree for a scheme.
 */
export function getQuestionTree(
  schemeId: string,
): SchemeQuestionTree | undefined {
  return QUESTION_TREES[schemeId];
}

/**
 * Initialize a new interview session for a scheme.
 */
export function createInterviewState(schemeId: string): InterviewState {
  const tree = QUESTION_TREES[schemeId];
  if (!tree) {
    return {
      scheme: schemeId,
      currentQuestionId: null,
      answers: {},
      askedQuestions: [],
      pendingFollowUps: [],
      isComplete: true,
      result: null,
      totalQuestions: 0,
      answeredCount: 0,
      activeWarnings: [],
      failReason: null,
    };
  }

  // Count total askable questions (non-follow-up, top-level)
  const totalQuestions = tree.questions.length;

  return {
    scheme: schemeId,
    currentQuestionId: null,
    answers: {},
    askedQuestions: [],
    pendingFollowUps: [],
    isComplete: false,
    result: null,
    totalQuestions,
    answeredCount: 0,
    activeWarnings: [],
    failReason: null,
  };
}

/**
 * CORE: Determine the next question to ask based on current answers.
 * Handles: dependency checking, skip logic, follow-ups, early exit.
 */
export function determineNextQuestion(
  state: InterviewState,
): NextQuestionResult {
  const tree = QUESTION_TREES[state.scheme];
  if (!tree) {
    return {
      question: null,
      progress: "Complete",
      totalQuestions: 0,
      answeredCount: 0,
      warnings: [],
      result: buildFallbackResult(),
    };
  }

  // 1. Check for early exit (fail conditions already hit)
  const failCheck = checkFailConditions(state.answers, tree);
  if (failCheck) {
    return {
      question: null,
      progress: "Complete",
      totalQuestions: state.totalQuestions,
      answeredCount: state.answeredCount,
      warnings: state.activeWarnings,
      earlyExit: {
        reason: failCheck,
        status: "ineligible",
      },
      result: computeEligibility(state.answers, state.scheme),
    };
  }

  // 2. Check pending follow-ups first (they take priority)
  if (state.pendingFollowUps.length > 0) {
    const followUp = state.pendingFollowUps[0];
    return {
      question: followUp,
      progress: `Question ${state.answeredCount + 1} of ~${state.totalQuestions}`,
      totalQuestions: state.totalQuestions,
      answeredCount: state.answeredCount,
      warnings: state.activeWarnings,
      contextMessage: followUp.context,
    };
  }

  // 3. Find next askable question from the tree
  const allQuestions = tree.questions;
  const unanswered = allQuestions.filter(
    (q) => !state.answers[q.id] && !state.askedQuestions.includes(q.id),
  );

  // Filter by dependency satisfaction
  const askable = unanswered.filter((q) => canAskQuestion(q, state.answers));

  // Sort by tier (lower = higher priority)
  askable.sort((a, b) => a.tier - b.tier);

  if (askable.length === 0) {
    // No more questions — compute result
    const result = computeEligibility(state.answers, state.scheme);
    return {
      question: null,
      progress: "Complete",
      totalQuestions: state.totalQuestions,
      answeredCount: state.answeredCount,
      warnings: state.activeWarnings,
      result,
    };
  }

  const nextQ = askable[0];
  return {
    question: nextQ,
    progress: `Question ${state.answeredCount + 1} of ~${state.totalQuestions}`,
    totalQuestions: state.totalQuestions,
    answeredCount: state.answeredCount,
    warnings: state.activeWarnings,
    contextMessage: nextQ.context,
  };
}

/**
 * Record an answer and advance the interview state.
 * Returns the updated state + any new warnings.
 */
export function recordAnswer(
  state: InterviewState,
  questionId: string,
  answerValue: string,
  confidence: AnswerConfidence = "high",
): InterviewState {
  const tree = QUESTION_TREES[state.scheme];
  if (!tree) return { ...state, isComplete: true };

  // Find the question (could be in main tree or pending follow-ups)
  let question = tree.questions.find((q) => q.id === questionId);
  const isFollowUp = state.pendingFollowUps.some((q) => q.id === questionId);
  if (!question && isFollowUp) {
    question = state.pendingFollowUps.find((q) => q.id === questionId);
  }

  if (!question) return state;

  // Record the answer
  const newAnswers: UserAnswers = {
    ...state.answers,
    [questionId]: {
      answer: answerValue,
      confidence,
      timestamp: Date.now(),
      clarifications: [],
    },
  };

  // Track asked questions
  const newAsked = [...state.askedQuestions, questionId];

  // Remove from pending follow-ups if it was one
  let newFollowUps = state.pendingFollowUps.filter((q) => q.id !== questionId);

  // Check for new follow-ups triggered by this answer
  for (const fu of question.followUps) {
    if (fu.triggerValue === answerValue) {
      newFollowUps = [...newFollowUps, fu.followUpQuestion];
    }
  }

  // Check for warnings
  const newWarnings = [...state.activeWarnings];
  for (const wc of question.warnConditions) {
    if (wc.answerValues.includes(answerValue)) {
      newWarnings.push(wc.warning);
    }
  }

  // Check for fail conditions
  let failReason = state.failReason;
  for (const fc of question.failConditions) {
    if (fc.answerValues.includes(answerValue)) {
      failReason = fc.reason;
      break;
    }
  }

  const answeredCount = Object.keys(newAnswers).length;

  // Check if interview is now complete (fail or no more questions)
  let isComplete = false;
  if (failReason) {
    isComplete = true;
  } else {
    // Quick check: are there more askable questions?
    const unanswered = tree.questions.filter(
      (q) => !newAnswers[q.id] && !newAsked.includes(q.id),
    );
    const askable = unanswered.filter((q) => canAskQuestion(q, newAnswers));
    if (askable.length === 0 && newFollowUps.length === 0) {
      isComplete = true;
    }
  }

  const result = isComplete
    ? computeEligibility(newAnswers, state.scheme)
    : null;

  return {
    ...state,
    answers: newAnswers,
    askedQuestions: newAsked,
    pendingFollowUps: newFollowUps,
    answeredCount,
    activeWarnings: newWarnings,
    failReason,
    isComplete,
    result,
  };
}

/**
 * Validate an answer for contradictions and confidence.
 */
export function validateAnswer(
  state: InterviewState,
  questionId: string,
  answerValue: string,
): AnswerValidation {
  const issues: string[] = [];
  let confidence: AnswerConfidence = "high";

  // Check for "not sure" type answers → medium confidence
  if (
    answerValue === "not_sure" ||
    answerValue === "dont_know" ||
    answerValue === "maybe"
  ) {
    confidence = "medium";
  }

  // Check for contradictions
  const contradiction = detectContradiction(
    state.answers,
    questionId,
    answerValue,
    state.scheme,
  );
  if (contradiction) {
    issues.push(contradiction.message);
    confidence = "low";
    return {
      valid: issues.length === 0,
      issues,
      confidence,
      contradiction,
    };
  }

  return { valid: true, issues, confidence };
}

/**
 * Compute final eligibility from all collected answers.
 */
export function computeEligibility(
  answers: UserAnswers,
  schemeId: string,
): EligibilityResult {
  const tree = QUESTION_TREES[schemeId];
  if (!tree) return buildFallbackResult();

  const reasons: string[] = [];
  const ineligibleReasons: string[] = [];
  const warnings: string[] = [];
  let finalStatus: "eligible" | "ineligible" | "maybe" = "maybe";

  // Evaluate all rules in order
  for (const rule of tree.eligibilityRules) {
    const result = rule.evaluate(answers);
    if (result) {
      if (result.status === "ineligible") {
        ineligibleReasons.push(result.reason);
        finalStatus = "ineligible";
        break; // First ineligble rule wins
      } else if (result.status === "eligible") {
        reasons.push(result.reason);
        finalStatus = "eligible";
      } else if (result.status === "maybe") {
        reasons.push(result.reason);
        if (finalStatus !== "eligible") finalStatus = "maybe";
      }
    }
  }

  // Collect all warnings from answers
  for (const q of tree.questions) {
    const userAnswer = answers[q.id]?.answer;
    if (userAnswer) {
      for (const wc of q.warnConditions) {
        if (wc.answerValues.includes(userAnswer)) {
          warnings.push(wc.warning);
        }
      }
    }
  }

  // Compute confidence score
  const confidence = computeConfidenceScore(answers, tree);

  // Build recommendation
  let recommendation: string;
  if (finalStatus === "eligible") {
    recommendation = `You appear eligible for ${tree.schemeName}. Proceed to your nearest CSC center with the required documents.`;
  } else if (finalStatus === "ineligible") {
    recommendation = `Based on the information provided, you are not eligible for ${tree.schemeName}. Consider checking other government schemes.`;
  } else {
    recommendation = `Your eligibility for ${tree.schemeName} needs verification. Visit a CSC center or call the helpline for clarity.`;
  }

  return {
    status: finalStatus,
    confidence,
    reasons:
      reasons.length > 0 ? reasons : ["Eligibility assessment complete."],
    ineligibleReasons,
    warnings,
    recommendation,
    nextSteps: finalStatus !== "ineligible" ? tree.nextSteps : [],
    documentsNeeded: finalStatus !== "ineligible" ? tree.documents : [],
  };
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Check if a question's dependencies are all satisfied.
 */
function canAskQuestion(
  question: EligibilityQuestion,
  answers: UserAnswers,
): boolean {
  if (question.dependsOn.length === 0) return true;

  return question.dependsOn.every((dep) => {
    const userAnswer = answers[dep.questionId];
    if (!userAnswer) return false;
    return dep.answers.includes(userAnswer.answer);
  });
}

/**
 * Check if any answer has triggered a fail condition.
 */
function checkFailConditions(
  answers: UserAnswers,
  tree: SchemeQuestionTree,
): string | null {
  for (const q of tree.questions) {
    const userAnswer = answers[q.id]?.answer;
    if (userAnswer) {
      for (const fc of q.failConditions) {
        if (fc.answerValues.includes(userAnswer)) {
          return fc.reason;
        }
      }
    }
  }
  // Also check follow-up fail conditions
  for (const q of tree.questions) {
    for (const fu of q.followUps) {
      const fuAnswer = answers[fu.followUpQuestion.id]?.answer;
      if (fuAnswer) {
        for (const fc of fu.followUpQuestion.failConditions) {
          if (fc.answerValues.includes(fuAnswer)) {
            return fc.reason;
          }
        }
      }
    }
  }
  return null;
}

/**
 * Detect contradictions between answers.
 */
function detectContradiction(
  currentAnswers: UserAnswers,
  newQuestionId: string,
  newAnswer: string,
  schemeId: string,
): { questionId: string; message: string } | undefined {
  // PM-KISAN: "Not a farmer" but answered "Yes" to land ownership
  if (schemeId === "pm-kisan") {
    if (
      newQuestionId === "pmk_q3_land_ownership" &&
      newAnswer !== "no" &&
      currentAnswers["pmk_q1_farmer"]?.answer === "no"
    ) {
      return {
        questionId: "pmk_q1_farmer",
        message:
          "You said you're not a farmer, but you own agricultural land. Could you clarify?",
      };
    }
  }

  // MGNREGA: "Employed" but low income
  if (schemeId === "mgnrega") {
    if (
      newQuestionId === "mgn_q4_economic_status" &&
      newAnswer === "bpl" &&
      currentAnswers["mgn_q1_employment"]?.answer === "employed"
    ) {
      return {
        questionId: "mgn_q1_employment",
        message:
          "You mentioned having full-time work but also BPL status. Could you clarify your employment situation?",
      };
    }
  }

  return undefined;
}

/**
 * Score confidence 0-100 based on answer quality.
 */
function computeConfidenceScore(
  answers: UserAnswers,
  tree: SchemeQuestionTree,
): number {
  const mandatoryQuestions = tree.questions.filter((q) => q.isMandatory);
  const mandatoryAnswered = mandatoryQuestions.filter(
    (q) => answers[q.id],
  ).length;

  // Base score from mandatory questions answered
  const mandatoryRatio =
    mandatoryQuestions.length > 0
      ? mandatoryAnswered / mandatoryQuestions.length
      : 1;
  let score = mandatoryRatio * 70; // 70 pts for mandatory coverage

  // Bonus for high confidence answers
  const allAnswers = Object.values(answers);
  const highConfCount = allAnswers.filter(
    (a) => a.confidence === "high",
  ).length;
  const totalAnswers = allAnswers.length;
  if (totalAnswers > 0) {
    score += (highConfCount / totalAnswers) * 20; // 20 pts for answer confidence
  }

  // Bonus for informational questions answered
  const infoQuestions = tree.questions.filter((q) => q.isInformational);
  const infoAnswered = infoQuestions.filter((q) => answers[q.id]).length;
  if (infoQuestions.length > 0) {
    score += (infoAnswered / infoQuestions.length) * 10; // 10 pts for completeness
  }

  return Math.min(100, Math.round(score));
}

/**
 * Default result when no tree is available.
 */
function buildFallbackResult(): EligibilityResult {
  return {
    status: "maybe",
    confidence: 0,
    reasons: ["Unable to determine eligibility without question tree."],
    ineligibleReasons: [],
    warnings: [],
    recommendation:
      "Please visit your nearest CSC center for eligibility verification.",
    nextSteps: [],
    documentsNeeded: [],
  };
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

export { QUESTION_TREES, INTERVIEW_ENABLED_SCHEMES } from "./question-trees";
export type {
  EligibilityQuestion,
  UserAnswers,
  UserAnswer,
  InterviewState,
  NextQuestionResult,
  AnswerValidation,
  EligibilityResult,
  SchemeQuestionTree,
  AnswerConfidence,
  QuestionOption,
} from "./types";
