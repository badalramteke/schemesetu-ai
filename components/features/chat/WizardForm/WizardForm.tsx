"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";
import type { WizardQuestion } from "@/lib/rag-pipeline";

interface WizardFormProps {
  questions: WizardQuestion[];
  onSubmit: (answers: Record<string, string>) => void;
  onBack?: () => void;
  loading?: boolean;
}

function WizardForm({ questions, onSubmit, onBack, loading }: WizardFormProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiSelects, setMultiSelects] = useState<Record<string, string[]>>(
    {},
  );
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const total = questions.length;
  const current = questions[step];
  const isLast = step === total - 1;
  const progressPct = ((step + 1) / total) * 100;

  // Commit multi-select values as comma-separated string
  useEffect(() => {
    Object.entries(multiSelects).forEach(([id, vals]) => {
      if (vals.length > 0) {
        setAnswers((prev) => ({ ...prev, [id]: vals.join(", ") }));
      }
    });
  }, [multiSelects]);

  const currentAnswer = answers[current?.id] || "";
  const isOtherSelected = currentAnswer === "other";
  const otherText = otherTexts[current?.id] || "";
  const isAnswered = isOtherSelected
    ? otherText.trim().length > 0
    : currentAnswer.trim().length > 0;

  const handleSingleSelect = (value: string) => {
    if (value !== "other") {
      setOtherTexts((prev) => ({ ...prev, [current.id]: "" }));
    }
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const handleOtherText = (text: string) => {
    setOtherTexts((prev) => ({ ...prev, [current.id]: text }));
  };

  const handleMultiToggle = (value: string) => {
    setMultiSelects((prev) => {
      const existing = prev[current.id] || [];
      const next = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      return { ...prev, [current.id]: next };
    });
  };

  const handleTextChange = (value: string) => {
    if (value !== "other") {
      setOtherTexts((prev) => ({ ...prev, [current.id]: "" }));
    }
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const goNext = () => {
    // Resolve "other" selections to actual typed text
    const resolvedAnswers = { ...answers };
    for (const [id, val] of Object.entries(resolvedAnswers)) {
      if (val === "other" && otherTexts[id]?.trim()) {
        resolvedAnswers[id] = otherTexts[id].trim();
      }
    }
    if (isLast) {
      onSubmit(resolvedAnswers);
    } else {
      // Save resolved value for current step before moving
      if (answers[current.id] === "other" && otherTexts[current.id]?.trim()) {
        setAnswers((prev) => ({
          ...prev,
          [current.id]: otherTexts[current.id].trim(),
        }));
      }
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else if (onBack) {
      onBack();
    }
  };

  if (!current) return null;

  const multiSelected = multiSelects[current.id] || [];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        animation: "fadeInUp 0.3s ease-out",
      }}
    >
      {/* Card container */}
      <div
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 80%, var(--secondary) 20%), var(--surface))",
          border:
            "1px solid color-mix(in srgb, var(--secondary) 25%, transparent)",
          borderRadius: 20,
          padding: "24px 20px 20px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px color-mix(in srgb, var(--secondary) 12%, transparent)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header: Step counter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--secondary)",
              letterSpacing: 0.5,
            }}
          >
            STEP {step + 1} OF {total}
          </span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {Math.round(progressPct)}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            borderRadius: 99,
            background: "rgba(255,255,255,0.06)",
            marginBottom: 24,
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

        {/* Question text */}
        <h3
          key={step}
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text)",
            margin: "0 0 20px",
            lineHeight: 1.5,
            animation: "fadeInUp 0.25s ease-out",
          }}
        >
          {current.question}
        </h3>

        {/* Input area */}
        <div
          key={`input-${step}`}
          style={{ animation: "fadeInUp 0.3s ease-out 0.05s both" }}
        >
          {/* Single select buttons */}
          {current.inputType === "single-select" && current.options && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {current.options.map((opt) => {
                const active = currentAnswer === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSingleSelect(opt.value)}
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
                        ? "rgba(68, 167, 84, 0.1)"
                        : "rgba(255,255,255,0.03)",
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

          {/* "Other" text input (shows when "other" is selected in single-select) */}
          {current.inputType === "single-select" && isOtherSelected && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => handleOtherText(e.target.value)}
              placeholder="Type your answer..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && isAnswered && goNext()}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginTop: 10,
                fontSize: 14,
                color: "var(--text)",
                background: "rgba(255,255,255,0.03)",
                border: otherText
                  ? "1.5px solid var(--primary)"
                  : "1.5px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
                borderRadius: 14,
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
            />
          )}

          {/* Multi select buttons */}
          {current.inputType === "multi-select" && current.options && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {current.options.map((opt) => {
                const active = multiSelected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleMultiToggle(opt.value)}
                    style={{
                      padding: "10px 16px",
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 99,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontFamily: "inherit",
                      border: active
                        ? "1.5px solid var(--primary)"
                        : "1.5px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
                      background: active
                        ? "rgba(68, 167, 84, 0.12)"
                        : "rgba(255,255,255,0.03)",
                      color: active ? "var(--primary)" : "var(--text)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {active && <Check size={14} />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Dropdown */}
          {current.inputType === "dropdown" && current.options && (
            <div style={{ position: "relative" }}>
              <select
                value={currentAnswer}
                onChange={(e) => handleTextChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 16px",
                  fontSize: 14,
                  color: currentAnswer ? "var(--text)" : "var(--muted)",
                  background: "rgba(255,255,255,0.03)",
                  border: currentAnswer
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
                <option value="">
                  {current.placeholder || "Select an option"}
                </option>
                {current.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                color={currentAnswer ? "var(--primary)" : "var(--muted)"}
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

          {/* "Other" text input (shows when "other" is selected in dropdown) */}
          {current.inputType === "dropdown" && currentAnswer === "other" && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => handleOtherText(e.target.value)}
              placeholder="Type your answer..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && isAnswered && goNext()}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginTop: 10,
                fontSize: 14,
                color: "var(--text)",
                background: "rgba(255,255,255,0.03)",
                border: otherText
                  ? "1.5px solid var(--primary)"
                  : "1.5px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
                borderRadius: 14,
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
            />
          )}

          {/* Text input */}
          {current.inputType === "text" && (
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={current.placeholder || "Type your answer..."}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && isAnswered && goNext()}
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: 14,
                color: "var(--text)",
                background: "rgba(255,255,255,0.03)",
                border: currentAnswer
                  ? "1.5px solid var(--primary)"
                  : "1.5px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
                borderRadius: 14,
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
            />
          )}

          {/* Number input */}
          {current.inputType === "number" && (
            <input
              type="number"
              value={currentAnswer}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={current.placeholder || "Enter a number..."}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && isAnswered && goNext()}
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: 14,
                color: "var(--text)",
                background: "rgba(255,255,255,0.03)",
                border: currentAnswer
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

        {/* Navigation buttons */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 24,
          }}
        >
          {/* Back button */}
          {(step > 0 || onBack) && (
            <button
              onClick={goBack}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "12px 20px",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text)",
                background: "transparent",
                border:
                  "1.5px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
                borderRadius: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}

          {/* Next / Submit button */}
          <button
            onClick={goNext}
            disabled={(current.required && !isAnswered) || (loading && isLast)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 600,
              color:
                current.required && !isAnswered
                  ? "var(--muted)"
                  : "var(--accent)",
              background:
                current.required && !isAnswered
                  ? "rgba(255,255,255,0.04)"
                  : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              border: "none",
              borderRadius: 14,
              cursor:
                current.required && !isAnswered ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
              boxShadow:
                current.required && !isAnswered
                  ? "none"
                  : "0 4px 14px rgba(68, 167, 84, 0.3)",
              opacity: loading && isLast ? 0.7 : 1,
            }}
          >
            {loading && isLast ? (
              <>
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <span>Checking eligibility...</span>
              </>
            ) : isLast ? (
              <>
                <Check size={16} />
                <span>Submit</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Step dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginTop: 16,
          }}
        >
          {questions.map((q, idx) => (
            <div
              key={q.id}
              style={{
                width: idx === step ? 20 : 6,
                height: 6,
                borderRadius: 99,
                background:
                  idx < step
                    ? "var(--primary)"
                    : idx === step
                      ? "var(--secondary)"
                      : "rgba(255,255,255,0.1)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(WizardForm);
