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

export default function ChatMessage({
  role,
  content,
  eligibilityResults,
  isLoading,
  chips,
  onChipClick,
}: ChatMessageProps) {
  const { language, userProfile } = useApp();
  const lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";

  // Build spoken text for AudioFeedback
  const spokenText = [
    content,
    eligibilityResults?.map((r) =>
      [r.schemeName, r.reason, r.benefits].filter(Boolean).join(". ")
    ).join(". "),
  ].filter(Boolean).join(". ");

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (role === "ai" && isLoading) {
    return (
      <div
        style={{ display: "flex", gap: 12, padding: "12px 16px", animation: "fadeInUp 0.3s ease-out" }}
        aria-live="polite"
        aria-label="AI is thinking"
      >
        <div style={{
          width: 32, height: 32, borderRadius: 99,
          background: "#910A67",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Bot size={16} color="#fff" />
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "12px 16px",
          background: "#f8f8fc", border: "1px solid #e8e8f0",
          borderRadius: "16px 16px 16px 4px",
        }}>
          {[0, 0.2, 0.4].map((d) => (
            <span
              key={d}
              style={{
                display: "inline-block", width: 8, height: 8,
                borderRadius: 99, background: "#bbb",
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
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px", animation: "fadeInUp 0.2s ease-out" }}>
        <div style={{
          maxWidth: "80%", padding: "12px 16px",
          fontSize: 14, lineHeight: 1.6,
          color: "#fff", background: "#910A67",
          borderRadius: "16px 16px 4px 16px",
        }}>
          {content}
        </div>
      </div>
    );
  }

  // ── AI message ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{ display: "flex", gap: 12, padding: "12px 16px", animation: "fadeInUp 0.3s ease-out" }}
      aria-live="polite"
    >
      <div style={{
        width: 32, height: 32, borderRadius: 99,
        background: "#910A67",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Bot size={16} color="#fff" />
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Text bubble */}
        {content && (
          <div style={{
            padding: "12px 16px",
            fontSize: 14, lineHeight: 1.6, color: "#333",
            background: "#f8f8fc", border: "1px solid #e8e8f0",
            borderRadius: "16px 16px 16px 4px",
          }}>
            {content}
          </div>
        )}

        {/* Read aloud + source chips together */}
        {(spokenText || (chips && chips.length > 0)) && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {spokenText && <AudioFeedback text={spokenText} lang={lang} />}

            {/* Interaction chips */}
            {chips && chips.map((chip) => (
              <button
                key={chip.value}
                onClick={() => onChipClick?.(chip.value, chip.label)}
                style={{
                  padding: "10px 16px", fontSize: 13, fontWeight: 500,
                  color: "#555", background: "#fff",
                  border: "1px solid #e8e8f0", borderRadius: 99,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s", lineHeight: 1.3,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#910A67";
                  e.currentTarget.style.color = "#910A67";
                  e.currentTarget.style.background = "rgba(145,10,103,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e8e8f0";
                  e.currentTarget.style.color = "#555";
                  e.currentTarget.style.background = "#fff";
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
