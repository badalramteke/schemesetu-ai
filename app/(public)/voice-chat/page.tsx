"use client";

import React from "react";
import VoiceChat from "@/components/chat/VoiceChat";
import { useRouter } from "next/navigation";

export default function VoiceChatPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#f7f7fa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top nav bar */}
      <div
        style={{
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid #eee",
          background: "#fff",
        }}
      >
        <button
          onClick={() => router.push("/")}
          aria-label="Back to home"
          style={{
            background: "none",
            border: "1px solid #e0e0e0",
            borderRadius: 10,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 13,
            color: "#555",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
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
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Chat
        </button>
        <span style={{ fontSize: 14, color: "#999" }}>Voice-first mode</span>
      </div>

      {/* Voice chat fills the rest */}
      <div style={{ flex: 1, padding: "16px", display: "flex" }}>
        <VoiceChat />
      </div>
    </div>
  );
}
