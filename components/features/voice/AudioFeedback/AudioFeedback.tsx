"use client";

import React, { useState, useRef } from "react";
import { Volume2, VolumeX, Square } from "lucide-react";

interface AudioFeedbackProps {
  /** The text content of the AI message to be read aloud */
  text: string;
  /** Language code for speech (en-IN, hi-IN, mr-IN) */
  lang?: string;
}

export default function AudioFeedback({ text, lang = "en-IN" }: AudioFeedbackProps) {
  const [speaking, setSpeaking] = useState(false);
  const [hover, setHover] = useState(false);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  const toggleSpeak = () => {
    if (!("speechSynthesis" in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    uttRef.current = utter;
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  if (!supported) return null;

  return (
    <button
      onClick={toggleSpeak}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={speaking ? "Stop reading aloud" : "Read message aloud"}
      title={speaking ? "Stop" : "Read aloud"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        fontSize: 11,
        fontWeight: 500,
        color: speaking ? "#910A67" : hover ? "#910A67" : "#aaa",
        background: speaking ? "rgba(145,10,103,0.06)" : hover ? "rgba(145,10,103,0.04)" : "transparent",
        border: speaking ? "1px solid rgba(145,10,103,0.25)" : "1px solid transparent",
        borderRadius: 99,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s",
      }}
    >
      {speaking ? (
        <>
          <Square size={10} fill="#910A67" />
          Stop
          {/* Animated waveform */}
          <span style={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {[0, 0.15, 0.3].map((d, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 8,
                  background: "#910A67",
                  borderRadius: 2,
                  animation: `wavePulse 1s ${d}s infinite ease-in-out`,
                }}
              />
            ))}
          </span>
        </>
      ) : (
        <>
          <Volume2 size={11} />
          Listen
        </>
      )}
      <style>{`
        @keyframes wavePulse {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50%       { transform: scaleY(1);   opacity: 1;   }
        }
      `}</style>
    </button>
  );
}
