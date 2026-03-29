// ─── Eligibility Interview System — Barrel Export ─────────────────────────────

export {
  hasInterviewTree,
  getQuestionTree,
  createInterviewState,
  determineNextQuestion,
  recordAnswer,
  validateAnswer,
  computeEligibility,
  QUESTION_TREES,
  INTERVIEW_ENABLED_SCHEMES,
} from "./engine";

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
  QuestionInputType,
  EligibilityStatus,
  QuestionTier,
  QuestionDependency,
  FollowUpRule,
  FailCondition,
  WarnCondition,
} from "./types";
