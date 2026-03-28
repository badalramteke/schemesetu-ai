"use client";

import React from "react";
import { Bot } from "lucide-react";
import type { EligibilityResult } from "@/lib/rag-pipeline";
import EligibilityCard from "@/components/features/schemes/EligibilityCard/EligibilityCard";
import AudioFeedback from "@/components/features/voice/AudioFeedback/AudioFeedback";
import { useApp } from "@/components/providers/AppProvider";

interface ChatMessageProps {
  role: "user" | "ai";
  content?: string;
  eligibilityResults?: EligibilityResult[];
  isLoading?: boolean;
  chips?: { value: string; label: string }[];
  onChipClick?: (value: string, label: string) => void;
}

function ChatMessage({
  role,
  content,
  eligibilityResults,
  isLoading,
  chips,
  onChipClick,
}: ChatMessageProps) {
  const { language, userProfile } = useApp();
  const lang =
    language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";

  // Render text with newlines and **bold** markdown
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {i > 0 && <br />}
        {line.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
      </React.Fragment>
    ));
  };

  // Build spoken text for AudioFeedback
  const spokenText = [
    content,
    eligibilityResults
      ?.map((r) =>
        [r.schemeName, r.reason, r.benefits].filter(Boolean).join(". "),
      )
      .join(". "),
  ]
    .filter(Boolean)
    .join(". ");

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (role === "ai" && isLoading) {
    return (
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "12px 16px",
          animation: "fadeInUp 0.3s ease-out",
        }}
        aria-live="polite"
        aria-label="AI is thinking"
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 99,
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bot size={16} color="var(--accent)" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "12px 16px",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 76%, var(--secondary) 24%), color-mix(in srgb, var(--surface) 90%, var(--secondary) 10%))",
            border:
              "1px solid color-mix(in srgb, var(--secondary) 34%, transparent)",
            boxShadow:
              "0 0 0 1px color-mix(in srgb, var(--secondary) 20%, transparent), 0 14px 34px var(--secondary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 18%, transparent)",
            backdropFilter: "blur(8px)",
            borderRadius: "16px 16px 16px 4px",
          }}
        >
          {[0, 0.2, 0.4].map((d) => (
            <span
              key={d}
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: 99,
                background: "var(--muted)",
                animation: `dotBounce 1.4s ${d}s infinite ease-in-out`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── User message ─────────────────────────────────────────────────────────────
  if (role === "user") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 16px",
          animation: "fadeInUp 0.2s ease-out",
        }}
      >
        <div
          style={{
            maxWidth: "80%",
            padding: "12px 16px",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--accent)",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 78%, var(--primary) 22%), color-mix(in srgb, var(--surface) 90%, var(--primary) 10%))",
            border:
              "1px solid color-mix(in srgb, var(--primary) 34%, transparent)",
            boxShadow:
              "0 0 0 1px color-mix(in srgb, var(--primary) 20%, transparent), 0 14px 34px var(--primary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 18%, transparent)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px 16px 4px 16px",
          }}
        >
          {renderContent(content || "")}
        </div>
      </div>
    );
  }

  // ── AI message ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 16px",
        animation: "fadeInUp 0.3s ease-out",
      }}
      aria-live="polite"
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 99,
          background: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Bot size={16} color="var(--accent)" />
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Text bubble */}
        {content && (
          <div
            style={{
              padding: "12px 16px",
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--accent)",
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 76%, var(--secondary) 24%), color-mix(in srgb, var(--surface) 90%, var(--secondary) 10%))",
              border:
                "1px solid color-mix(in srgb, var(--secondary) 34%, transparent)",
              boxShadow:
                "0 0 0 1px color-mix(in srgb, var(--secondary) 20%, transparent), 0 14px 34px var(--secondary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 18%, transparent)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px 16px 16px 4px",
            }}
          >
            {renderContent(content)}
          </div>
        )}

        {/* Read aloud + source chips together */}
        {(spokenText || (chips && chips.length > 0)) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
            }}
          >
            {spokenText && <AudioFeedback text={spokenText} lang={lang} />}

            {/* Interaction chips */}
            {chips &&
              chips.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => onChipClick?.(chip.value, chip.label)}
                  style={{
                    padding: "10px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                    background: "var(--background)",
                    border: "1px solid var(--secondary-softest)",
                    borderRadius: 99,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                    lineHeight: 1.3,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.color = "var(--primary)";
                    e.currentTarget.style.background =
                      "rgba(68, 167, 84, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--secondary-softest)";
                    e.currentTarget.style.color = "var(--text)";
                    e.currentTarget.style.background = "var(--background)";
                  }}
                >
                  {chip.label}
                </button>
              ))}
          </div>
        )}

        {/* Eligibility cards */}
        {eligibilityResults && eligibilityResults.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {eligibilityResults.map((r, idx) => (
              <EligibilityCard
                key={r.schemeId}
                result={r}
                index={idx}
                district={userProfile?.district}
                state={userProfile?.state}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ChatMessage);
