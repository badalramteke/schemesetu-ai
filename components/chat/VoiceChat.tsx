"use client";

import React, { useRef, useEffect } from "react";
import { useVoiceChat } from "@/lib/hooks/useVoiceChat";
import type { ChatMessage, VoiceState } from "@/lib/hooks/useVoiceChat";

/* ═══════════════════════════════════════════════════════════════════════════
   ChatHistory — scrollable message list
   ═══════════════════════════════════════════════════════════════════════════ */

function ChatHistory({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          color: "var(--muted)",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(68, 167, 84, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--text)",
            margin: 0,
          }}
        >
          Tap the mic to start
        </p>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>
          Try: &quot;I am a farmer with 2 acres of land&quot;
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {messages.map((m) => {
        const isUser = m.sender === "user";
        return (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: isUser ? "flex-end" : "flex-start",
              animation: "fadeInUp 0.25s ease-out",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: isUser
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
                background: isUser
                  ? "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 78%, var(--primary) 22%), color-mix(in srgb, var(--surface) 90%, var(--primary) 10%))"
                  : "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 76%, var(--secondary) 24%), color-mix(in srgb, var(--surface) 90%, var(--secondary) 10%))",
                color: "var(--accent)",
                boxShadow: isUser
                  ? "0 0 0 1px color-mix(in srgb, var(--primary) 20%, transparent), 0 14px 30px var(--primary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 14%, transparent)"
                  : "0 0 0 1px color-mix(in srgb, var(--secondary) 20%, transparent), 0 14px 30px var(--secondary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 14%, transparent)",
                border: isUser
                  ? "1px solid color-mix(in srgb, var(--primary) 30%, transparent)"
                  : "1px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.55,
                fontSize: 15,
              }}
            >
              {m.text}
              <div
                style={{
                  fontSize: 10,
                  marginTop: 6,
                  opacity: 0.6,
                  textAlign: isUser ? "right" : "left",
                }}
              >
                {m.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TranscriptPreview — live transcription display
   ═══════════════════════════════════════════════════════════════════════════ */

function TranscriptPreview({ transcript }: { transcript: string }) {
  if (!transcript) return null;

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto 12px",
        padding: "12px 20px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        textAlign: "center",
        fontSize: 16,
        color: "var(--text)",
        fontStyle: "italic",
        minHeight: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      &ldquo;{transcript}
      <span
        style={{
          display: "inline-block",
          width: 2,
          height: 18,
          background: "var(--primary)",
          marginLeft: 2,
          animation: "blink 1s step-end infinite",
        }}
      />
      &rdquo;
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MicButton — large center button with state-driven UI
   ═══════════════════════════════════════════════════════════════════════════ */

const STATE_CONFIG: Record<
  VoiceState,
  { bg: string; shadow: string; label: string; ring?: string }
> = {
  idle: {
    bg: "var(--surface-alt)",
    shadow: "0 4px 14px rgba(0,0,0,0.15)",
    label: "Tap to speak",
  },
  listening: {
    bg: "var(--danger)",
    shadow: "0 0 0 8px rgba(231,76,60,0.2), 0 4px 20px rgba(231,76,60,0.35)",
    label: "Listening... tap to send",
    ring: "rgba(231,76,60,0.3)",
  },
  processing: {
    bg: "var(--warning)",
    shadow: "0 4px 14px rgba(255,159,67,0.3)",
    label: "Processing...",
  },
  responding: {
    bg: "var(--primary)",
    shadow: "0 0 0 8px rgba(39,174,96,0.2), 0 4px 20px rgba(39,174,96,0.35)",
    label: "Speaking...",
    ring: "rgba(39,174,96,0.3)",
  },
  error: {
    bg: "var(--danger)",
    shadow: "0 4px 14px rgba(192,57,43,0.3)",
    label: "Error — tap to retry",
  },
};

function MicButton({
  state,
  toggleMic,
  errorMsg,
}: {
  state: VoiceState;
  toggleMic: () => void;
  errorMsg: string;
}) {
  const cfg = STATE_CONFIG[state];
  const isDisabled = state === "processing";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px 16px 16px",
      }}
    >
      <button
        onClick={toggleMic}
        disabled={isDisabled}
        aria-label={cfg.label}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: "none",
          background: cfg.bg,
          boxShadow: cfg.shadow,
          cursor: isDisabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          animation:
            state === "listening"
              ? "pulse 1.5s infinite"
              : state === "processing"
                ? "spin 1.2s linear infinite"
                : "none",
          opacity: isDisabled ? 0.8 : 1,
        }}
      >
        {state === "processing" ? (
          /* Spinner */
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : state === "responding" ? (
          /* Speaker icon */
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          /* Mic icon */
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        )}
      </button>

      <span
        style={{
          marginTop: 12,
          fontSize: 14,
          fontWeight: 500,
          color:
            state === "listening"
              ? "var(--danger)"
              : state === "error"
                ? "var(--danger)"
                : state === "responding"
                  ? "var(--primary)"
                  : "var(--text)",
          transition: "color 0.3s",
        }}
      >
        {cfg.label}
      </span>

      {state === "error" && errorMsg && (
        <span
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "var(--danger)",
            maxWidth: 280,
            textAlign: "center",
          }}
        >
          {errorMsg}
        </span>
      )}

      <span style={{ marginTop: 8, fontSize: 11, color: "var(--muted)" }}>
        Press{" "}
        <kbd
          style={{
            padding: "1px 5px",
            background: "var(--surface-alt)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            fontFamily: "inherit",
            fontSize: 11,
          }}
        >
          Space
        </kbd>{" "}
        to toggle
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VoiceChat — main exported component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function VoiceChat() {
  const {
    state,
    transcript,
    messages,
    errorMsg,
    isMuted,
    toggleMic,
    toggleMute,
  } = useVoiceChat();

  // Keyboard shortcut: Space to toggle mic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Space when not focused on an input/textarea/button
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      if (e.code === "Space") {
        e.preventDefault();
        toggleMic();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleMic]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxWidth: 720,
        margin: "0 auto",
        width: "100%",
        background: "var(--background)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid var(--border)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
          color: "var(--accent)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
              Voice Assistant
            </h2>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.75 }}>
              Auto text-to-speech enabled
            </p>
          </div>
        </div>

        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute responses" : "Mute responses"}
          title={isMuted ? "Unmute auto-speak" : "Mute auto-speak"}
          style={{
            background: isMuted
              ? "color-mix(in srgb, var(--accent) 20%, transparent)"
              : "transparent",
            border:
              "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
            color: "var(--accent)",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {isMuted ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" x2="17" y1="9" y2="15" />
              <line x1="17" x2="23" y1="9" y2="15" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
          {isMuted ? "Muted" : "Auto-speak"}
        </button>
      </div>

      {/* ── Chat messages ── */}
      <ChatHistory messages={messages} />

      {/* ── Bottom area: transcript + mic ── */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "12px 16px",
        }}
      >
        <TranscriptPreview transcript={transcript} />
        <MicButton state={state} toggleMic={toggleMic} errorMsg={errorMsg} />
      </div>

      {/* ── Inline keyframe animations ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
