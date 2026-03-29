// ─── AI Eligibility Interview System — Core Types ────────────────────────────

/** Confidence level for an individual answer */
export type AnswerConfidence = "high" | "medium" | "low";

/** Result of eligibility computation */
export type EligibilityStatus = "eligible" | "ineligible" | "maybe";

/** Question input type — matches existing WizardQuestion types */
export type QuestionInputType =
  | "single-select"
  | "multi-select"
  | "dropdown"
  | "text"
  | "number";

/** Tier level for question ordering (lower tiers asked first) */
export type QuestionTier = 1 | 2 | 3 | 4;

// ─── Question Definition ─────────────────────────────────────────────────────

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionDependency {
  questionId: string;
  /** Answer(s) that MUST match for this question to be asked */
  answers: string[];
}

export interface FollowUpRule {
  /** If the parent answer matches this value */
  triggerValue: string;
  /** Ask this follow-up question */
  followUpQuestion: EligibilityQuestion;
}

export interface FailCondition {
  /** If the answer to this question matches one of these values */
  answerValues: string[];
  /** Then the user is INELIGIBLE — short circuit */
  reason: string;
}

export interface WarnCondition {
  /** If the answer matches one of these values */
  answerValues: string[];
  /** Show this warning but DON'T block */
  warning: string;
}

export interface EligibilityQuestion {
  id: string;
  scheme: string;
  tier: QuestionTier;
  text: string;
  /** Conversational context shown before the question */
  context?: string;
  inputType: QuestionInputType;
  options: QuestionOption[];
  /** Must ALL be satisfied before this question is asked */
  dependsOn: QuestionDependency[];
  /** If true, this question is critical for eligibility */
  isMandatory: boolean;
  /** If true, this question is informational only (won't block eligibility) */
  isInformational: boolean;
  /** If answer matches certain values → immediate FAIL */
  failConditions: FailCondition[];
  /** If answer matches certain values → show WARNING but continue */
  warnConditions: WarnCondition[];
  /** If answer matches → auto-ask a follow-up */
  followUps: FollowUpRule[];
}

// ─── User Answers ────────────────────────────────────────────────────────────

export interface UserAnswer {
  answer: string;
  confidence: AnswerConfidence;
  timestamp: number;
  clarifications: string[];
}

export type UserAnswers = Record<string, UserAnswer>;

// ─── Eligibility Result ──────────────────────────────────────────────────────

export interface EligibilityResult {
  status: EligibilityStatus;
  confidence: number; // 0-100
  reasons: string[];
  ineligibleReasons: string[];
  warnings: string[];
  recommendation: string;
  nextSteps: string[];
  documentsNeeded: string[];
}

// ─── Interview State ─────────────────────────────────────────────────────────

export interface InterviewState {
  scheme: string;
  currentQuestionId: string | null;
  answers: UserAnswers;
  /** Questions that have already been asked (by ID) */
  askedQuestions: string[];
  /** Active follow-up questions to ask */
  pendingFollowUps: EligibilityQuestion[];
  /** Whether the interview has concluded */
  isComplete: boolean;
  /** If concluded, the result */
  result: EligibilityResult | null;
  /** Progress tracking */
  totalQuestions: number;
  answeredCount: number;
  /** Active warnings */
  activeWarnings: string[];
  /** If a fail condition was hit, the reason */
  failReason: string | null;
}

// ─── Engine API ──────────────────────────────────────────────────────────────

export interface NextQuestionResult {
  /** null means interview is complete */
  question: EligibilityQuestion | null;
  /** "Question X of Y" */
  progress: string;
  /** Total/answered counts */
  totalQuestions: number;
  answeredCount: number;
  /** Contextual message to show before the question */
  contextMessage?: string;
  /** Active warnings from previous answers */
  warnings: string[];
  /** If interview is complete, the eligibility result */
  result?: EligibilityResult;
  /** If a fail condition was hit early */
  earlyExit?: {
    reason: string;
    status: EligibilityStatus;
  };
}

export interface AnswerValidation {
  valid: boolean;
  issues: string[];
  confidence: AnswerConfidence;
  /** If there's a contradiction with previous answers */
  contradiction?: {
    questionId: string;
    message: string;
  };
}

// ─── Scheme Question Tree ────────────────────────────────────────────────────

export interface SchemeQuestionTree {
  schemeId: string;
  schemeName: string;
  questions: EligibilityQuestion[];
  /** Rules to compute final eligibility from all answers */
  eligibilityRules: EligibilityRule[];
  /** Documents needed based on eligibility */
  documents: string[];
  /** Next steps if eligible */
  nextSteps: string[];
}

export interface EligibilityRule {
  /** Human-readable description */
  description: string;
  /** Function-like condition: returns eligibility status */
  evaluate: (answers: UserAnswers) => {
    status: EligibilityStatus;
    reason: string;
  } | null;
}
