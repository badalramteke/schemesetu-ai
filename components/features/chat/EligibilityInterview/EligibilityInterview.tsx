"use client";

import React, { useState, useCallback } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  SkipForward,
} from "lucide-react";
import {
  createInterviewState,
  determineNextQuestion,
  recordAnswer,
  validateAnswer,
  hasInterviewTree,
} from "@/lib/eligibility";
import type {
  InterviewState,
  EligibilityQuestion,
  EligibilityResult,
  AnswerConfidence,
} from "@/lib/eligibility";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EligibilityInterviewProps {
  schemeId: string;
  schemeName: string;
  /** Called when interview completes with results */
  onComplete: (result: EligibilityResult, answers: Record<string, string>) => void;
  /** Called when user wants to skip the interview */
  onSkip?: () => void;
  /** Pre-filled answers from user profile */
  profileAnswers?: Record<string, string>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EligibilityInterview({
  schemeId,
  schemeName,
  onComplete,
  onSkip,
  profileAnswers,
}: EligibilityInterviewProps) {
  // Compute initial state including profile auto-fill (runs once on mount)
  const [{ initState, initNext }] = useState(() => {
    let s = createInterviewState(schemeId);
    if (profileAnswers) {
      const profileMap: Record<string, { questionId: string; value: string }[]> = {
        "pm-kisan": [
          { questionId: "pmk_q2_state", value: profileAnswers.state || "" },
        ],
        ayushman: [
          { questionId: "ayush_q1_state", value: profileAnswers.state || "" },
        ],
      };
      const autoFills = profileMap[schemeId] || [];
      for (const { questionId, value } of autoFills) {
        if (value) {
          s = recordAnswer(s, questionId, value.toLowerCase().replace(/\s+/g, "_"));
        }
      }
    }
    const next = determineNextQuestion(s);
    return { initState: s, initNext: next };
  });

  const [state, setState] = useState<InterviewState>(initState);
  const [selectedValue, setSelectedValue] = useState("");
  const [animating, setAnimating] = useState(false);
  const [showResult, setShowResult] = useState(
    !!(initNext.result || initNext.earlyExit),
  );
  const [currentQuestion, setCurrentQuestion] =
    useState<EligibilityQuestion | null>(initNext.question);
  const [contextMessage, setContextMessage] = useState<string | undefined>(
    initNext.contextMessage,
  );
  const [progress, setProgress] = useState(initNext.progress);
  const [warnings, setWarnings] = useState<string[]>(initNext.warnings);
  const [validationIssue, setValidationIssue] = useState<string | null>(null);

  // Check if interview is available for this scheme
  const hasTree = hasInterviewTree(schemeId);

  // Handle answer submission
  const submitAnswer = useCallback(() => {
    if (!currentQuestion || !selectedValue) return;

    // Validate the answer
    const validation = validateAnswer(state, currentQuestion.id, selectedValue);
    if (validation.contradiction) {
      setValidationIssue(validation.contradiction.message);
      return;
    }

    setAnimating(true);
    setValidationIssue(null);

    // Determine confidence
    const confidence: AnswerConfidence = validation.confidence;

    // Record answer and advance state
    const newState = recordAnswer(
      state,
      currentQuestion.id,
      selectedValue,
      confidence,
    );
    setState(newState);

    // Get next question
    setTimeout(() => {
      const next = determineNextQuestion(newState);
      setCurrentQuestion(next.question);
      setContextMessage(next.contextMessage);
      setProgress(next.progress);
      setWarnings(next.warnings);
      setSelectedValue("");
      setAnimating(false);

      if (next.result || next.earlyExit) {
        setShowResult(true);
        if (next.result) {
          // Build simple answers map for parent
          const answerMap: Record<string, string> = {};
          for (const [qId, ans] of Object.entries(newState.answers)) {
            answerMap[qId] = ans.answer;
          }
          onComplete(next.result, answerMap);
        }
      }
    }, 300);
  }, [currentQuestion, selectedValue, state, onComplete]);

  // Auto-advance on single-select click
  const handleOptionClick = useCallback(
    (value: string) => {
      setSelectedValue(value);
      // Auto-advance after a small delay for single-select
      if (currentQuestion?.inputType === "single-select") {
        setTimeout(() => {
          if (!currentQuestion) return;
          const validation = validateAnswer(state, currentQuestion.id, value);
          if (validation.contradiction) {
            setValidationIssue(validation.contradiction.message);
            return;
          }
          setAnimating(true);
          setValidationIssue(null);

          const newState = recordAnswer(
            state,
            currentQuestion.id,
            value,
            validation.confidence,
          );
          setState(newState);

          setTimeout(() => {
            const next = determineNextQuestion(newState);
            setCurrentQuestion(next.question);
            setContextMessage(next.contextMessage);
            setProgress(next.progress);
            setWarnings(next.warnings);
            setSelectedValue("");
            setAnimating(false);

            if (next.result || next.earlyExit) {
              setShowResult(true);
              if (next.result) {
                const answerMap: Record<string, string> = {};
                for (const [qId, ans] of Object.entries(newState.answers)) {
                  answerMap[qId] = ans.answer;
                }
                onComplete(next.result, answerMap);
              }
            }
          }, 300);
        }, 200);
      }
    },
    [currentQuestion, state, onComplete],
  );

  // Go back to previous question
  const goBack = useCallback(() => {
    if (state.askedQuestions.length === 0) {
      onSkip?.();
      return;
    }

    // Remove last answer and re-derive state
    const lastQId = state.askedQuestions[state.askedQuestions.length - 1];
    const newAnswers = { ...state.answers };
    delete newAnswers[lastQId];

    // Rebuild state from scratch (cleanest approach)
    let rebuilt = createInterviewState(schemeId);
    for (const qId of state.askedQuestions.slice(0, -1)) {
      const ans = state.answers[qId];
      if (ans) {
        rebuilt = recordAnswer(rebuilt, qId, ans.answer, ans.confidence);
      }
    }

    setState(rebuilt);
    const next = determineNextQuestion(rebuilt);
    setCurrentQuestion(next.question);
    setContextMessage(next.contextMessage);
    setProgress(next.progress);
    setWarnings(next.warnings);
    setSelectedValue("");
    setShowResult(false);
    setValidationIssue(null);
  }, [state, schemeId, onSkip]);

  if (!hasTree) return null;

  // ── Result View ──
  if (showResult && state.result) {
    return <ResultCard result={state.result} schemeName={schemeName} />;
  }

  // ── Early Exit View ──
  if (showResult && state.failReason) {
    return (
      <ResultCard
        result={{
          status: "ineligible",
          confidence: 90,
          reasons: [],
          ineligibleReasons: [state.failReason],
          warnings: state.activeWarnings,
          recommendation: `Based on your answers, you are not eligible for ${schemeName}. Consider checking other schemes.`,
          nextSteps: [],
          documentsNeeded: [],
        }}
        schemeName={schemeName}
      />
    );
  }

  if (!currentQuestion) return null;

  const progressPct =
    state.totalQuestions > 0
      ? Math.round(
          (state.answeredCount / (state.totalQuestions + state.pendingFollowUps.length)) * 100,
        )
      : 0;

  // ── Interview Card ──
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        animation: "fadeInUp 0.3s ease-out",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 80%, var(--secondary) 20%), var(--surface))",
          border:
            "1px solid color-mix(in srgb, var(--secondary) 25%, transparent)",
          borderRadius: 20,
          padding: "24px 20px 20px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px color-mix(in srgb, var(--secondary) 12%, transparent)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--primary)",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Eligibility Check — {schemeName}
          </span>
          {onSkip && (
            <button
              onClick={onSkip}
              style={{
                fontSize: 11,
                color: "var(--muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "inherit",
              }}
            >
              <SkipForward size={12} />
              Skip
            </button>
          )}
        </div>

        {/* Progress */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span
            style={{ fontSize: 12, fontWeight: 600, color: "var(--secondary)" }}
          >
            {progress}
          </span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {progressPct}%
          </span>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: 4,
            borderRadius: 99,
            background: "color-mix(in srgb, var(--secondary) 15%, transparent)",
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              width: `${progressPct}%`,
              background:
                "linear-gradient(90deg, var(--primary), var(--secondary))",
              transition: "width 0.4s ease-out",
            }}
          />
        </div>

        {/* Context Message */}
        {contextMessage && (
          <p
            style={{
              fontSize: 13,
              color: "var(--muted)",
              margin: "0 0 12px",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            {contextMessage}
          </p>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {warnings.slice(-1).map((w, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  fontSize: 13,
                  color: "var(--text)",
                  lineHeight: 1.4,
                }}
              >
                <AlertTriangle
                  size={16}
                  color="#f59e0b"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Question */}
        <h3
          key={currentQuestion.id}
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text)",
            margin: "0 0 20px",
            lineHeight: 1.5,
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(8px)" : "none",
            transition: "opacity 0.25s, transform 0.25s",
          }}
        >
          {currentQuestion.text}
        </h3>

        {/* Validation Issue */}
        {validationIssue && (
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "10px 12px",
              marginBottom: 14,
              borderRadius: 12,
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              fontSize: 13,
              color: "var(--text)",
            }}
          >
            <HelpCircle
              size={16}
              color="#ef4444"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <span>{validationIssue}</span>
          </div>
        )}

        {/* Input Area */}
        <div
          key={`input-${currentQuestion.id}`}
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(8px)" : "none",
            transition: "opacity 0.3s ease-out 0.05s, transform 0.3s ease-out 0.05s",
          }}
        >
          {/* Single Select */}
          {currentQuestion.inputType === "single-select" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentQuestion.options.map((opt) => {
                const active = selectedValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleOptionClick(opt.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: 14,
                      fontWeight: 500,
                      textAlign: "left",
                      borderRadius: 14,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontFamily: "inherit",
                      border: active
                        ? "1.5px solid var(--primary)"
                        : "1.5px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
                      background: active
                        ? "rgba(124, 92, 252, 0.1)"
                        : "transparent",
                      color: active ? "var(--primary)" : "var(--text)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{opt.label}</span>
                    {active && (
                      <Check
                        size={16}
                        color="var(--primary)"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Dropdown */}
          {currentQuestion.inputType === "dropdown" && (
            <div style={{ position: "relative" }}>
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 16px",
                  fontSize: 14,
                  color: selectedValue ? "var(--text)" : "var(--muted)",
                  background: "var(--surface)",
                  border: selectedValue
                    ? "1.5px solid var(--primary)"
                    : "1.5px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
                  borderRadius: 14,
                  outline: "none",
                  fontFamily: "inherit",
                  appearance: "none",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
              >
                <option value="">Select your answer</option>
                {currentQuestion.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                color={selectedValue ? "var(--primary)" : "var(--muted)"}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
          )}

          {/* Number Input */}
          {currentQuestion.inputType === "number" && (
            <input
              type="number"
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              placeholder="Enter a number..."
              autoFocus
              onKeyDown={(e) =>
                e.key === "Enter" && selectedValue && submitAnswer()
              }
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: 14,
                color: "var(--text)",
                background: "var(--surface)",
                border: selectedValue
                  ? "1.5px solid var(--primary)"
                  : "1.5px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
                borderRadius: 14,
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
            />
          )}

          {/* Text Input */}
          {currentQuestion.inputType === "text" && (
            <input
              type="text"
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              placeholder="Type your answer..."
              autoFocus
              onKeyDown={(e) =>
                e.key === "Enter" && selectedValue && submitAnswer()
              }
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: 14,
                color: "var(--text)",
                background: "var(--surface)",
                border: selectedValue
                  ? "1.5px solid var(--primary)"
                  : "1.5px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
                borderRadius: 14,
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
            />
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            onClick={goBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              border:
                "1.5px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
              background: "transparent",
              color: "var(--muted)",
              transition: "all 0.2s",
            }}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {/* Only show Next for dropdown, text, number (single-select auto-advances) */}
          {currentQuestion.inputType !== "single-select" && (
            <button
              onClick={submitAnswer}
              disabled={!selectedValue}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 12,
                cursor: selectedValue ? "pointer" : "default",
                fontFamily: "inherit",
                border: "none",
                background: selectedValue
                  ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
                  : "color-mix(in srgb, var(--secondary) 20%, transparent)",
                color: selectedValue ? "#fff" : "var(--muted)",
                transition: "all 0.2s",
              }}
            >
              Next
              <ArrowRight size={14} />
            </button>
          )}

          {/* Skip for informational questions */}
          {currentQuestion.isInformational && !currentQuestion.isMandatory && (
            <button
              onClick={() => {
                const newState = recordAnswer(
                  state,
                  currentQuestion.id,
                  "skipped",
                  "low",
                );
                setState(newState);
                const next = determineNextQuestion(newState);
                setCurrentQuestion(next.question);
                setContextMessage(next.contextMessage);
                setProgress(next.progress);
                setWarnings(next.warnings);
                setSelectedValue("");
                if (next.result) {
                  setShowResult(true);
                  const answerMap: Record<string, string> = {};
                  for (const [qId, ans] of Object.entries(newState.answers)) {
                    answerMap[qId] = ans.answer;
                  }
                  onComplete(next.result, answerMap);
                }
              }}
              style={{
                fontSize: 12,
                color: "var(--muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "10px 12px",
              }}
            >
              Not sure / Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Result Card Sub-Component ───────────────────────────────────────────────

function ResultCard({
  result,
  schemeName,
}: {
  result: EligibilityResult;
  schemeName: string;
}) {
  const statusConfig = {
    eligible: {
      icon: CheckCircle2,
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.08)",
      border: "rgba(34, 197, 94, 0.25)",
      label: "Eligible",
    },
    ineligible: {
      icon: XCircle,
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.08)",
      border: "rgba(239, 68, 68, 0.25)",
      label: "Not Eligible",
    },
    maybe: {
      icon: AlertTriangle,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.08)",
      border: "rgba(245, 158, 11, 0.25)",
      label: "Maybe Eligible",
    },
  };

  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        animation: "fadeInUp 0.4s ease-out",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 80%, var(--secondary) 20%), var(--surface))",
          border: `1px solid ${config.border}`,
          borderRadius: 20,
          padding: "24px 20px",
          boxShadow: `0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px ${config.border}`,
        }}
      >
        {/* Status Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: config.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={22} color={config.color} />
          </div>
          <div>
            <div
              style={{ fontSize: 16, fontWeight: 700, color: config.color }}
            >
              {config.label}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {schemeName} — Confidence: {result.confidence}%
            </div>
          </div>
        </div>

        {/* Reasons */}
        {result.reasons.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {result.reasons.map((r, i) => (
              <p
                key={i}
                style={{
                  fontSize: 14,
                  color: "var(--text)",
                  lineHeight: 1.5,
                  margin: "0 0 6px",
                }}
              >
                {r}
              </p>
            ))}
          </div>
        )}

        {/* Ineligible Reasons */}
        {result.ineligibleReasons.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {result.ineligibleReasons.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(239, 68, 68, 0.06)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  fontSize: 13,
                  color: "var(--text)",
                  lineHeight: 1.4,
                  marginBottom: 6,
                }}
              >
                <XCircle
                  size={16}
                  color="#ef4444"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {result.warnings.map((w, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "rgba(245, 158, 11, 0.06)",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                  fontSize: 12,
                  color: "var(--text)",
                  lineHeight: 1.4,
                  marginBottom: 4,
                }}
              >
                <AlertTriangle
                  size={14}
                  color="#f59e0b"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recommendation */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(124, 92, 252, 0.06)",
            border:
              "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--text)",
              lineHeight: 1.5,
              margin: 0,
              fontWeight: 500,
            }}
          >
            💡 {result.recommendation}
          </p>
        </div>

        {/* Documents Needed */}
        {result.documentsNeeded.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--secondary)",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              📋 Documents Needed
            </h4>
            {result.documentsNeeded.map((doc, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 0",
                  fontSize: 13,
                  color: "var(--text)",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    flexShrink: 0,
                  }}
                />
                {doc}
              </div>
            ))}
          </div>
        )}

        {/* Next Steps */}
        {result.nextSteps.length > 0 && (
          <div>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--secondary)",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              📝 Next Steps
            </h4>
            {result.nextSteps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "6px 0",
                  fontSize: 13,
                  color: "var(--text)",
                  lineHeight: 1.4,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--primary)",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}.
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
