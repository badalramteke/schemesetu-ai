"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type VoiceState =
  | "idle"
  | "listening"
  | "processing"
  | "responding"
  | "error";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

/* ─── Hook ──────────────────────────────────────────────────────────────── */

export function useVoiceChat() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  // ── Refs for values needed inside event handlers (avoids stale closures) ──
  const stateRef = useRef<VoiceState>("idle");
  const transcriptRef = useRef("");
  const isMutedRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const forcedStopRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  /* ── speakResponse ───────────────────────────────────────────────────── */
  const speakResponse = useCallback((text: string) => {
    if (!synthRef.current || isMutedRef.current) {
      setState("idle");
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;

    // Try to pick an Indian-English voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en-IN") || v.name.includes("India"),
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setState("responding");
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("idle");

    synthRef.current.speak(utterance);
  }, []);

  /* ── sendQuery ───────────────────────────────────────────────────────── */
  const sendQuery = useCallback(
    async (text: string) => {
      setState("processing");

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        sender: "user",
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setTranscript("");
      transcriptRef.current = "";

      try {
        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userQuery: text,
            language: "en",
            profile: {},
            answers: {},
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        let responseText = "";

        if (data.status === "questioning" && data.question) {
          responseText = data.question;
          if (data.chips?.length) {
            responseText +=
              "\n\nOptions: " +
              data.chips.map((c: { label: string }) => c.label).join(", ");
          }
        } else if (data.status === "complete" && data.results) {
          const schemes = data.results.matchingSchemes ?? [];
          if (schemes.length > 0) {
            responseText = `I found ${schemes.length} scheme${schemes.length > 1 ? "s" : ""} for you!\n\n`;
            responseText += schemes
              .slice(0, 3)
              .map(
                (
                  s: {
                    schemeName: string;
                    reason: string;
                    benefits?: string;
                  },
                  i: number,
                ) =>
                  `${i + 1}. ${s.schemeName} — ${s.reason}${s.benefits ? `\nBenefits: ${s.benefits}` : ""}`,
              )
              .join("\n\n");
          } else {
            responseText =
              "I couldn't find matching schemes with the information provided. Could you share more details about your occupation, income, or location?";
          }
        } else if (data.error) {
          responseText = `Sorry, something went wrong: ${data.message || "Unknown error"}`;
        } else {
          responseText =
            "I received your message but couldn't process the response. Please try again.";
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: responseText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Auto-speak the response
        speakResponse(responseText);
      } catch (err) {
        console.error("Query error:", err);

        const errText =
          "Sorry, I'm having trouble reaching the server. Please check your connection and try again.";
        const errMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: errText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
        speakResponse(errText);
      }
    },
    [speakResponse],
  );

  /* ── processAndSend — safe wrapper ───────────────────────────────────── */
  const processAndSend = useCallback(
    (finalText: string) => {
      const trimmed = finalText.trim();
      if (trimmed.length >= 2) {
        sendQuery(trimmed);
      } else {
        setState("idle");
      }
    },
    [sendQuery],
  );

  /* ── Initialize Web Speech API (runs once) ───────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Speech synthesis
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      // Chrome needs a voices-changed event to populate the list
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Speech recognition
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      console.warn("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let full = "";
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full);
      transcriptRef.current = full;
    };

    recognition.onerror = (event: Event & { error?: string }) => {
      const err = event.error ?? "unknown";
      console.error("SpeechRecognition error:", err);

      if (err === "no-speech" || err === "aborted") return;

      if (err === "not-allowed" || err === "audio-capture") {
        setState("error");
        setErrorMsg(
          "Microphone access denied. Please allow microphone permissions in your browser settings.",
        );
      } else {
        setState("error");
        setErrorMsg(`Microphone error: ${err}`);
      }
      setTimeout(() => {
        if (stateRef.current === "error") setState("idle");
      }, 4000);
    };

    recognition.onend = () => {
      // Manual stops are handled in stopListening. Only handle auto-end here.
      if (forcedStopRef.current) {
        forcedStopRef.current = false;
        return;
      }

      // Browser stopped on its own (silence timeout). Auto-send if we have text.
      if (stateRef.current === "listening") {
        const t = transcriptRef.current.trim();
        if (t.length >= 2) {
          processAndSend(t);
        } else {
          setState("idle");
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        /* noop */
      }
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [processAndSend]);

  /* ── startListening ──────────────────────────────────────────────────── */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setErrorMsg(
        "Speech recognition is not supported in your browser. Try Chrome or Edge.",
      );
      setState("error");
      setTimeout(() => setState("idle"), 4000);
      return;
    }

    // Cancel ongoing speech
    if (synthRef.current) synthRef.current.cancel();

    setTranscript("");
    transcriptRef.current = "";
    forcedStopRef.current = false;

    try {
      recognitionRef.current.start();
      setState("listening");
    } catch {
      // Already active — abort then retry
      try {
        recognitionRef.current.abort();
      } catch {
        /* noop */
      }
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
          setState("listening");
        } catch {
          setState("error");
          setErrorMsg("Could not start microphone. Please try again.");
        }
      }, 200);
    }
  }, []);

  /* ── stopListening ───────────────────────────────────────────────────── */
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    forcedStopRef.current = true;
    try {
      recognitionRef.current.stop();
    } catch {
      /* noop */
    }

    const t = transcriptRef.current.trim();
    if (t.length >= 2) {
      processAndSend(t);
    } else {
      setState("idle");
    }
  }, [processAndSend]);

  /* ── toggleMic ───────────────────────────────────────────────────────── */
  const toggleMic = useCallback(() => {
    const s = stateRef.current;
    if (s === "listening") {
      stopListening();
    } else if (s === "idle" || s === "error") {
      startListening();
    } else if (s === "responding") {
      // Stop current speech & begin listening
      if (synthRef.current) synthRef.current.cancel();
      startListening();
    }
    // Don't do anything during "processing"
  }, [startListening, stopListening]);

  /* ── toggleMute ──────────────────────────────────────────────────────── */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && synthRef.current) synthRef.current.cancel();
      return next;
    });
  }, []);

  return {
    state,
    transcript,
    messages,
    errorMsg,
    isMuted,
    startListening,
    stopListening,
    toggleMic,
    toggleMute,
    isMicActive: state === "listening",
    isProcessing: state === "processing",
  };
}
