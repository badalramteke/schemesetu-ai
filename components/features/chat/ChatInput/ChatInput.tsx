"use client";

import React, { useState, useRef } from "react";
import { Plus, ArrowUp, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (msg: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const send = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
    if (ref.current) ref.current.style.height = "auto";
  };

  return (
    <div
      style={{
        padding: "12px 16px",
        background: "color-mix(in srgb, var(--surface) 95%, transparent)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid var(--secondary)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          padding: "8px 12px",
          background: "var(--background)",
          border: "1px solid var(--secondary)",
          borderRadius: 20,
        }}
      >
        <button
          aria-label="Attach"
          style={{
            width: 36,
            height: 36,
            borderRadius: 99,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "var(--text)",
          }}
        >
          <Plus size={20} />
        </button>
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (ref.current) {
              ref.current.style.height = "auto";
              ref.current.style.height =
                Math.min(ref.current.scrollHeight, 120) + "px";
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask about any scheme..."
          rows={1}
          disabled={disabled}
          style={{
            flex: 1,
            minHeight: 36,
            maxHeight: 120,
            padding: "8px 0",
            fontSize: 14,
            color: "var(--text)",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            caretColor: "var(--primary)",
            opacity: disabled ? 0.5 : 1,
            fontFamily: "inherit",
          }}
        />
        {text.trim() ? (
          <button
            onClick={send}
            disabled={disabled}
            aria-label="Send"
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              border: "none",
              background: "var(--primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "var(--accent)",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <ArrowUp size={18} />
          </button>
        ) : (
          <button
            aria-label="Voice"
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              border: "none",
              background: "var(--primary-soft)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "var(--primary)",
            }}
          >
            <Mic size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
