"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useApp } from "@/components/providers/AppProvider";
import {
  Landmark,
  Wheat,
  HeartPulse,
  Home as HomeIcon,
  HardHat,
  Ribbon,
  GraduationCap,
  Plus,
  ArrowUp,
  AudioLines,
  FlaskConical,
} from "lucide-react";
import ChatMessage from "@/components/features/chat/ChatMessage/ChatMessage";
import QuestionJumper from "@/components/features/chat/QuestionJumper/QuestionJumper";
import type { ChatQuestion } from "@/components/features/chat/QuestionJumper/QuestionJumper";
import { MOCK_MESSAGES } from "@/lib/mock-messages";
import { t } from "@/lib/i18n";
import type { EligibilityResult } from "@/lib/rag-pipeline";
import {
  inferSchemesFromQuery,
  getCandidateSchemes,
  type ConvPhase,
} from "@/lib/conversational-engine";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "ai";
  content?: string;
  eligibilityResults?: EligibilityResult[];
  isLoading?: boolean;
  chips?: { value: string; label: string }[];
  sensitiveNote?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTOR_ICONS = [
  { key: "agriculture" as const, icon: Wheat, color: "var(--primary)" },
  {
    key: "healthcare" as const,
    icon: HeartPulse,
    color: "var(--sector-healthcare)",
  },
  { key: "housing" as const, icon: HomeIcon, color: "var(--sector-housing)" },
  {
    key: "employment" as const,
    icon: HardHat,
    color: "var(--sector-employment)",
  },
  { key: "pension" as const, icon: Ribbon, color: "var(--sector-pension)" },
  {
    key: "education" as const,
    icon: GraduationCap,
    color: "var(--sector-education)",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatBox() {
  const {
    chatPrefilledQuery,
    setChatPrefilledQuery,
    userProfile,
    language,
    chatId,
    chatHistory,
    setChatHistory,
  } = useApp();
  const i = t(language);

  // Helper to get initial state from localStorage for the active chat
  const getInitial = <T,>(key: string, _default: T): T => {
    if (typeof window === "undefined") return _default;
    try {
      const saved = localStorage.getItem(`chat_data_${chatId}`);
      if (!saved) return _default;
      const parsed = JSON.parse(saved);
      return parsed[key] !== undefined ? parsed[key] : _default;
    } catch {
      return _default;
    }
  };

  // ── Chat messages ──
  const [messages, setMessages] = useState<Message[]>(() =>
    getInitial("messages", []),
  );
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // ── Conversational interview state ──
  const [convPhase, setConvPhase] = useState<ConvPhase>(() =>
    getInitial("convPhase", "idle"),
  );
  const [convAnswers, setConvAnswers] = useState<Record<string, string>>(() =>
    getInitial("convAnswers", {}),
  );
  const [candidates, setCandidates] = useState<string[]>(() =>
    getInitial("candidates", []),
  );
  const [activeQId, setActiveQId] = useState(() => getInitial("activeQId", ""));
  const [goalLabel, setGoalLabel] = useState(() => getInitial("goalLabel", ""));
  const [askedQuestions, setAskedQuestions] = useState<string[]>(() =>
    getInitial("askedQuestions", []),
  );
  const [pendingQuery, setPendingQuery] = useState(() =>
    getInitial("pendingQuery", ""),
  );

  // Auto-save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      `chat_data_${chatId}`,
      JSON.stringify({
        messages,
        convPhase,
        convAnswers,
        candidates,
        activeQId,
        goalLabel,
        askedQuestions,
        pendingQuery,
      }),
    );
  }, [
    messages,
    convPhase,
    convAnswers,
    candidates,
    activeQId,
    goalLabel,
    askedQuestions,
    pendingQuery,
    chatId,
  ]);

  // Push new chat session to History immediately when a message is added
  useEffect(() => {
    if (messages.length > 0) {
      const exists = chatHistory.some((c) => c.id === chatId);
      if (!exists) {
        setChatHistory([
          {
            id: chatId,
            title:
              messages[0].role === "user"
                ? messages[0].content || "New Chat"
                : "New Chat",
            timestamp: Date.now(),
          },
          ...chatHistory,
        ]);
      }
    }
  }, [messages, chatId, chatHistory, setChatHistory]);

  // Refs for async-safe access
  const convPhaseRef = useRef<ConvPhase>("idle");
  const convAnswersRef = useRef<Record<string, string>>({});
  const candidatesRef = useRef<string[]>([]);
  const activeQIdRef = useRef("");
  const goalLabelRef = useRef("");
  const askedQuestionsRef = useRef<string[]>([]);
  const pendingQueryRef = useRef("");

  // Keep refs in sync with state
  useEffect(() => {
    convPhaseRef.current = convPhase;
  }, [convPhase]);
  useEffect(() => {
    convAnswersRef.current = convAnswers;
  }, [convAnswers]);
  useEffect(() => {
    candidatesRef.current = candidates;
  }, [candidates]);
  useEffect(() => {
    activeQIdRef.current = activeQId;
  }, [activeQId]);
  useEffect(() => {
    goalLabelRef.current = goalLabel;
  }, [goalLabel]);
  useEffect(() => {
    askedQuestionsRef.current = askedQuestions;
  }, [askedQuestions]);
  useEffect(() => {
    pendingQueryRef.current = pendingQuery;
  }, [pendingQuery]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const recogRef = useRef<SpeechRecognition | null>(null);
  const manualStopRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const autoSent = useRef(false);
  const voiceInitiatedRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendRef = useRef<(input: string) => Promise<void>>(async () => {});

  const hasMessages = messages.length > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cancel TTS and cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recogRef.current) {
        try {
          recogRef.current.abort();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  // Auto-send pre-filled query (from sector chip on home screen)
  useEffect(() => {
    if (chatPrefilledQuery && !autoSent.current) {
      autoSent.current = true;
      send(chatPrefilledQuery);
      setChatPrefilledQuery("");
    }
  }, []); // eslint-disable-line

  // ── Helpers ────────────────────────────────────────────────────────────────

  const loadTestData = () => setMessages(MOCK_MESSAGES);

  const addMsg = (msg: Message) => setMessages((p) => [...p, msg]);

  const makeId = (prefix: string) => `${prefix}${Date.now()}`;

  // ── Follow-up detection: answers from already-shown results ────────────

  /**
   * Checks if the user's message is a follow-up question about schemes that
   * were already shown (documents, benefits, eligibility, next steps, etc.).
   * Returns an answer string if matched, or null to proceed normally.
   */
  const handleFollowUp = (query: string, msgs: Message[]): string | null => {
    const q = query.toLowerCase();

    // If the last AI message was an error / busy message, don't serve stale results
    const lastAiMsg = [...msgs].reverse().find((m) => m.role === "ai");
    if (
      lastAiMsg &&
      !lastAiMsg.eligibilityResults?.length &&
      !lastAiMsg.chips
    ) {
      // Last AI message was plain text (likely an error) — skip follow-up
      return null;
    }

    // Gather all eligibility results from recent messages
    const lastResults: EligibilityResult[] = [];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].eligibilityResults?.length) {
        lastResults.push(...msgs[i].eligibilityResults!);
        break; // only use the most recent result set
      }
    }
    if (lastResults.length === 0) return null;

    // Detect follow-up intent patterns
    const isDocumentQ =
      /document|docs|papers|kagaz|proof|certificate|dastavez|कागज|दस्तावेज|कागदपत्|required|need to submit|submit/i.test(
        q,
      );
    const isBenefitQ =
      /benefit|amount|money|kitna|paisa|rupee|₹|लाभ|पैसा|फायदा|राशि/i.test(q);
    const isNextStepsQ =
      /next\s*step|how\s*to\s*apply|apply\s*kaise|process|procedure|kaise|kahan|where|कैसे|कहां|कसे|कुठे/i.test(
        q,
      );
    const isEligibilityQ =
      /eligible|eligibility|qualify|patra|योग्य|पात्र/i.test(q);
    const isAboutSchemeQ =
      /about\s*(this|the)\s*scheme|tell\s*me\s*more|details|jankari|जानकारी|माहिती/i.test(
        q,
      );

    if (
      !isDocumentQ &&
      !isBenefitQ &&
      !isNextStepsQ &&
      !isEligibilityQ &&
      !isAboutSchemeQ
    ) {
      return null; // not a follow-up — let it proceed to new query flow
    }

    // Try to match a specific scheme name from the query
    let targetSchemes = lastResults;
    const mentionedScheme = lastResults.find(
      (r) =>
        q.includes(r.schemeName.toLowerCase()) ||
        q.includes(r.schemeId.toLowerCase()),
    );
    if (mentionedScheme) {
      targetSchemes = [mentionedScheme];
    }

    // Build a contextual response
    const parts: string[] = [];

    for (const scheme of targetSchemes) {
      const header =
        targetSchemes.length > 1 ? `**${scheme.schemeName}:**\n` : "";

      if (isDocumentQ) {
        if (scheme.documents?.length) {
          parts.push(
            `${header}📋 Documents required for ${scheme.schemeName}:\n` +
              scheme.documents.map((d, i) => `${i + 1}. ${d}`).join("\n"),
          );
        } else {
          parts.push(
            `${header}No specific documents listed for ${scheme.schemeName}.`,
          );
        }
      }

      if (isBenefitQ) {
        if (scheme.benefits) {
          parts.push(
            `${header}💰 Benefits of ${scheme.schemeName}:\n${scheme.benefits}`,
          );
        } else {
          parts.push(
            `${header}Benefits information not available for ${scheme.schemeName}.`,
          );
        }
      }

      if (isNextStepsQ) {
        if (scheme.nextSteps?.length) {
          parts.push(
            `${header}📝 How to apply for ${scheme.schemeName}:\n` +
              scheme.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
          );
        } else {
          parts.push(
            `${header}Application steps not available for ${scheme.schemeName}.`,
          );
        }
      }

      if (isEligibilityQ) {
        const status =
          scheme.eligible === true
            ? "✅ Eligible"
            : scheme.eligible === false
              ? "❌ Not Eligible"
              : "⚠️ Maybe Eligible";
        parts.push(
          `${header}${status} for ${scheme.schemeName}:\n${scheme.reason || "No details available."}`,
        );
      }

      if (isAboutSchemeQ) {
        const lines = [`${header}📌 ${scheme.schemeName}`];
        if (scheme.reason) lines.push(`• ${scheme.reason}`);
        if (scheme.benefits) lines.push(`• Benefits: ${scheme.benefits}`);
        if (scheme.documents?.length)
          lines.push(`• Documents: ${scheme.documents.join(", ")}`);
        if (scheme.sourceUrl)
          lines.push(`• Official website: ${scheme.sourceUrl}`);
        parts.push(lines.join("\n"));
      }
    }

    return parts.length > 0 ? parts.join("\n\n") : null;
  };

  // ── Auto TTS for AI responses after voice input ────────────────────────

  const speakResponse = (responseText: string) => {
    if (!voiceInitiatedRef.current) return;
    voiceInitiatedRef.current = false;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Strip markdown/HTML for cleaner speech
    const cleanText = responseText
      .replace(/[#*_~`>]/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang =
      language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // ── Dynamic Turn API Call ──────────────────────────────────────────────────

  const fetchNextDynamicTurn = async (
    query: string,
    curAnswers: Record<string, string>,
  ) => {
    addMsg({ id: makeId("l"), role: "ai", isLoading: true });
    setBusy(true);

    // Determine which schemes are relevant so the backend only queries those
    const goalValue = curAnswers.goal || goalLabelRef.current || "";
    const candidateSchemes = goalValue
      ? getCandidateSchemes(goalValue, query)
      : inferSchemesFromQuery(query);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: query,
          language,
          profile: userProfile,
          answers: curAnswers,
          askedQuestions: askedQuestionsRef.current,
          candidateSchemes:
            candidateSchemes.length > 0 ? candidateSchemes : undefined,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.message);

      // Remove loading indicator
      setMessages((p) => p.filter((m) => !m.isLoading));

      if (data.status === "questioning") {
        setConvPhase("questions");
        convPhaseRef.current = "questions";

        // Track this question so it won't be repeated
        const newAsked = [...askedQuestionsRef.current, data.question];
        setAskedQuestions(newAsked);
        askedQuestionsRef.current = newAsked;

        addMsg({
          id: makeId("q"),
          role: "ai",
          content: data.question,
          chips: data.chips,
        });
        speakResponse(data.question);
      } else if (data.status === "complete") {
        setConvPhase("rag");
        convPhaseRef.current = "rag";

        const results = data.results;
        const msg =
          (results?.totalMatches || 0) > 0
            ? i.chat.foundSchemes(results.totalMatches)
            : i.chat.noSchemes;

        addMsg({
          id: makeId("a"),
          role: "ai",
          content: msg,
          eligibilityResults: results?.matchingSchemes || [],
        });
        speakResponse(msg);
      }
    } catch (err) {
      console.error("Dynamic turn error:", err);
      setMessages((p) =>
        p
          .filter((m) => !m.isLoading)
          .concat({ id: makeId("e"), role: "ai", content: i.chat.busy }),
      );
    } finally {
      setBusy(false);
    }
  };

  // ── File Upload ────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Add visual indicator of user upload
    addMsg({
      id: makeId("u"),
      role: "user",
      content: `📎 Uploaded Document: ${file.name}`,
    });

    // Simulate AI document processing
    setBusy(true);
    setTimeout(() => {
      let reply = "";
      if (language === "hi")
        reply = `मैंने आपका दस्तावेज़ (${file.name}) प्राप्त कर लिया है। अब मैं आपकी पात्रता की जांच करने के लिए इसका उपयोग करूंगा। कृपया अपना सवाल पूछें।`;
      else if (language === "mr")
        reply = `मला तुमचे दस्तऐवज (${file.name}) मिळाले आहे. आता मी तुमच्या पात्रतेची तपासणी करण्यासाठी याचा वापर करेन. कृपया तुमचा प्रश्न विचारा.`;
      else
        reply = `I have received and securely attached your document (${file.name}). I will cross-reference this to verify your eligibility. How can I help you today?`;

      addMsg({
        id: makeId("a"),
        role: "ai",
        content: reply,
      });
      setBusy(false);
    }, 1500);

    // Reset input
    e.target.value = "";
  };

  // ── Voice ──────────────────────────────────────────────────────────────────

  // Clean up old recognition instance before starting a new one
  const cleanupRecognition = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recogRef.current) {
      try {
        manualStopRef.current = true; // prevent auto-restart in onend
        recogRef.current.abort();
      } catch {
        /* already stopped */
      }
      recogRef.current = null;
    }
  };

  // Silence auto-send: resets a 2-second timer on every speech result.
  // When no new speech for 2s → stop & auto-send.
  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      // Auto-stop and send after 2s of silence
      if (recogRef.current) {
        manualStopRef.current = true;
        try {
          recogRef.current.stop();
        } catch {
          /* ignore */
        }
        setListening(false);
        voiceInitiatedRef.current = true;
        // Use sendRef (always fresh) to avoid stale closure
        setTimeout(() => {
          const val =
            textRef.current?.value.trim() || finalTranscriptRef.current.trim();
          if (val) sendRef.current(val);
        }, 100);
      }
    }, 2000);
  };

  const toggleVoice = () => {
    if (listening) {
      // ── Manual stop: user clicked mic to stop & send ──
      manualStopRef.current = true;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      try {
        recogRef.current?.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
      voiceInitiatedRef.current = true;
      // Auto-send the accumulated text (use sendRef to avoid stale closure)
      setTimeout(() => {
        const val =
          textRef.current?.value.trim() || finalTranscriptRef.current.trim();
        if (val) sendRef.current(val);
      }, 150);
      return;
    }

    // ── Start listening ──
    // Cancel any ongoing TTS before starting a new voice session
    window.speechSynthesis?.cancel();

    // Clean up any previous instance
    cleanupRecognition();
    manualStopRef.current = false;
    finalTranscriptRef.current = text ? text + " " : "";

    const SR =
      (window as unknown as Record<string, SpeechRecognitionConstructor>)
        .SpeechRecognition ||
      (window as unknown as Record<string, SpeechRecognitionConstructor>)
        .webkitSpeechRecognition;
    if (!SR) {
      alert(
        i.chat.voiceNotSupported ||
          "Voice recognition is not supported in this browser.",
      );
      return;
    }
    try {
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.lang =
        language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";

      // We maintain a local string of what this specific session has finalized
      let currentSessionFinal = "";

      r.onresult = (e: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";

        for (let j = e.resultIndex; j < e.results.length; j++) {
          if (e.results[j].isFinal) {
            final += e.results[j][0].transcript;
          } else {
            interim += e.results[j][0].transcript;
          }
        }

        if (final) {
          currentSessionFinal += final + " ";
        }

        // Combine everything from previous sessions + this session + realtime interim
        const displayString = (
          finalTranscriptRef.current +
          currentSessionFinal +
          interim
        ).trim();
        setText(displayString);

        // Auto-expand textarea to fit the new text
        if (textRef.current) {
          textRef.current.style.height = "auto";
          textRef.current.style.height = `${Math.min(textRef.current.scrollHeight, 120)}px`;
        }

        // Reset the 2-second silence timer so we auto-send after user stops speaking
        resetSilenceTimer();
      };

      r.onend = () => {
        if (!manualStopRef.current) {
          // Save what we successfully transcribed before the drop
          finalTranscriptRef.current += currentSessionFinal;
          currentSessionFinal = "";

          // Browser needs a tiny breather before hot-restarting the microphone hardware
          setTimeout(() => {
            if (!manualStopRef.current) {
              try {
                r.start();
              } catch {
                setListening(false);
              }
            }
          }, 250);
        } else {
          setListening(false);
        }
      };

      r.onerror = (e: Event) => {
        const error = (e as Event & { error: string }).error;
        if (error === "no-speech") return; // Silence is fine

        if (error === "not-allowed" || error === "audio-capture") {
          manualStopRef.current = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          setListening(false);
          alert(
            "Microphone access denied. Please allow microphone permissions in your browser.",
          );
        }
        // If e.error === "network", it will naturally fall through to `onend` and cleanly auto-restart!
      };

      recogRef.current = r;
      r.start();
      setListening(true);
    } catch (err) {
      console.error("Microphone Initialization Failed:", err);
      setListening(false);
    }
  };

  // ── Core send (user types and sends) ──────────────────────────────────────

  const send = async (input: string) => {
    // Stop any ongoing TTS when sending a new message
    window.speechSynthesis?.cancel();
    const trimmed = input.trim();
    if (!trimmed || busy) return;

    // Clean up voice state
    cleanupRecognition();

    setText("");
    finalTranscriptRef.current = "";
    if (textRef.current) textRef.current.style.height = "auto";

    // ── During question phase: handle free text (optional) ──
    if (convPhaseRef.current === "questions") {
      addMsg({ id: makeId("u"), role: "user", content: trimmed });
      // Use last asked question as key so Gemini knows what was answered
      const lastQ =
        askedQuestionsRef.current[askedQuestionsRef.current.length - 1] ||
        `q_${Date.now()}`;
      const newAnswers = {
        ...convAnswersRef.current,
        [lastQ]: trimmed,
      };
      setConvAnswers(newAnswers);
      convAnswersRef.current = newAnswers;
      await fetchNextDynamicTurn(pendingQueryRef.current, newAnswers);
      return;
    }

    // ── During goal phase: treat voice/text as goal selection ──
    if (convPhaseRef.current === "goal") {
      addMsg({ id: makeId("u"), role: "user", content: trimmed });
      setGoalLabel(trimmed);
      goalLabelRef.current = trimmed;
      setConvPhase("questions");
      convPhaseRef.current = "questions";
      await fetchNextDynamicTurn(pendingQueryRef.current, { goal: trimmed });
      return;
    }

    // ── First message ever → start dynamic conversation ──
    if (convPhaseRef.current === "idle") {
      addMsg({ id: makeId("u"), role: "user", content: trimmed });
      setPendingQuery(trimmed);
      pendingQueryRef.current = trimmed;

      const inferred = inferSchemesFromQuery(trimmed);
      if (inferred.length > 0) {
        // Specific query (e.g. from sector chip) → fetch first dynamic turn immediately
        await fetchNextDynamicTurn(trimmed, {});
      } else {
        // Vague query → ask for goal
        setConvPhase("goal");
        convPhaseRef.current = "goal";
        addMsg({
          id: makeId("g"),
          role: "ai",
          content: i.chat.goalQuestion,
          chips: i.chat.goalChips,
        });
        speakResponse(i.chat.goalQuestion);
      }
      return;
    }

    // ── Follow-up message after chat is done ──
    if (convPhaseRef.current === "rag") {
      addMsg({ id: makeId("u"), role: "user", content: trimmed });

      // Check if this is a follow-up about already-shown results
      const followUpAnswer = handleFollowUp(trimmed, [
        ...messages,
        { id: "temp", role: "user" as const, content: trimmed },
      ]);

      if (followUpAnswer) {
        // Answer directly from existing results — no restart needed
        addMsg({
          id: makeId("a"),
          role: "ai",
          content: followUpAnswer,
        });
        speakResponse(followUpAnswer);
        return;
      }

      // Genuinely new query → check if we can infer schemes directly
      const inferred = inferSchemesFromQuery(trimmed);

      // Reset state for new query
      setConvAnswers({});
      convAnswersRef.current = {};
      setCandidates([]);
      candidatesRef.current = [];
      setActiveQId("");
      activeQIdRef.current = "";
      setGoalLabel("");
      goalLabelRef.current = "";
      setAskedQuestions([]);
      askedQuestionsRef.current = [];
      setPendingQuery(trimmed);
      pendingQueryRef.current = trimmed;

      if (inferred.length > 0) {
        // Specific new query → skip goal selection, go straight to questions
        await fetchNextDynamicTurn(trimmed, {});
      } else {
        // Vague new query → show goal selection
        setConvPhase("goal");
        convPhaseRef.current = "goal";
        addMsg({
          id: makeId("g"),
          role: "ai",
          content: i.chat.goalQuestion,
          chips: i.chat.goalChips,
        });
        speakResponse(i.chat.goalQuestion);
      }
    }
  };

  // Keep sendRef always pointing to the latest send function (avoids stale closures)
  sendRef.current = send;

  // ── Chip click handler ─────────────────────────────────────────────────────

  const handleChipClick = async (value: string, label: string) => {
    if (busy) return;

    // Remove chips from whichever message just had them
    setMessages((p) =>
      p.map((m) =>
        m.chips ? { ...m, chips: undefined, sensitiveNote: undefined } : m,
      ),
    );

    // Show user's selection as a user message bubble
    addMsg({
      id: makeId("u"),
      role: "user",
      content: label.replace(/^[^\w₹"\u0900-\u097f\u0a80-\u0aff]+/, ""),
    });

    const phase = convPhaseRef.current;

    // ── Phase: goal selection ──
    if (phase === "goal") {
      setGoalLabel(label);
      goalLabelRef.current = label;
      setConvPhase("questions");
      convPhaseRef.current = "questions";

      // Store goal in answers so it persists for subsequent calls
      const goalAnswers = { ...convAnswersRef.current, goal: value };
      setConvAnswers(goalAnswers);
      convAnswersRef.current = goalAnswers;

      await fetchNextDynamicTurn(pendingQueryRef.current, goalAnswers);
      return;
    }

    // ── Phase: eligibility questions ──
    if (phase === "questions") {
      // Use the last asked question as key so Gemini knows what was answered
      const lastQ =
        askedQuestionsRef.current[askedQuestionsRef.current.length - 1] ||
        `q_${Date.now()}`;
      const newAnswers = {
        ...convAnswersRef.current,
        [lastQ]: value,
      };
      setConvAnswers(newAnswers);
      convAnswersRef.current = newAnswers;

      await fetchNextDynamicTurn(pendingQueryRef.current, newAnswers);
    }
  };

  // ── RAG API call ───────────────────────────────────────────────────────────

  // ── QuestionJumper helpers ─────────────────────────────────────────────────

  const chatQuestions: ChatQuestion[] = useMemo(
    () =>
      messages
        .map((m, idx) => ({ m, idx }))
        .filter(({ m }) => m.role === "user" && m.content)
        .map(({ m, idx }) => ({
          id: m.id,
          text: m.content!,
          messageIndex: idx,
        })),
    [messages],
  );

  const jumpToQuestion = (messageIndex: number) => {
    const el = msgRefs.current.get(messageIndex);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.transition = "background 0.3s";
      el.style.background = "rgba(68, 167, 84, 0.08)";
      setTimeout(() => {
        el.style.background = "transparent";
      }, 1500);
    }
  };

  // ── Input handlers ─────────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(text);
    }
  };
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height =
        Math.min(textRef.current.scrollHeight, 120) + "px";
    }
  };

  // ── Greeting ───────────────────────────────────────────────────────────────

  const hour = new Date().getHours();
  const tod =
    hour < 12 ? i.chat.morning : hour < 17 ? i.chat.afternoon : i.chat.evening;
  const greet = i.chat.greeting(userProfile.name || "", tod);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100dvh - 56px)",
        background: "var(--background)",
      }}
    >
      {/* ─── SCROLLABLE AREA ─── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div
          ref={scrollRef}
          className="hide-scrollbar"
          style={{
            height: "100%",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Empty state */}
          {!hasMessages && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 20px 0",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 32,
                  animation: "fadeInUp 0.4s ease-out",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "rgba(68, 167, 84, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Landmark size={24} color="var(--primary)" />
                </div>
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {greet}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text)",
                    marginTop: 6,
                    maxWidth: 320,
                  }}
                >
                  {i.chat.placeholder}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 16,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={loadTestData}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--primary)",
                    background: "rgba(68, 167, 84, 0.06)",
                    border: "1px dashed rgba(68, 167, 84, 0.3)",
                    borderRadius: 99,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <FlaskConical size={14} /> {i.chat.loadTest}
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {hasMessages && (
            <div
              style={{
                flex: 1,
                padding: "8px 0",
                paddingRight: chatQuestions.length >= 2 ? 28 : 0,
                maxWidth: 760,
                margin: "0 auto",
                width: "100%",
              }}
            >
              {messages.map((m, idx) => (
                <div
                  key={m.id}
                  ref={(el) => {
                    if (el) msgRefs.current.set(idx, el);
                  }}
                  style={{ borderRadius: 8 }}
                >
                  <ChatMessage {...m} onChipClick={handleChipClick} />
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* QuestionJumper scrollbar */}
        {chatQuestions.length >= 2 && (
          <QuestionJumper
            chatHistory={chatQuestions}
            onSelectQuestion={jumpToQuestion}
            scrollContainerRef={scrollRef}
            totalMessages={messages.length}
            onScrubStateChange={setIsScrubbing}
          />
        )}
      </div>

      {/* ─── BOTTOM INPUT ─── */}
      <div
        style={{
          padding: "0 20px 24px",
          maxWidth: 720,
          width: "100%",
          margin: "0 auto",
          display: isScrubbing ? "none" : "block",
        }}
      >
        {/* Sector chips (empty state only) */}
        {!hasMessages && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 8,
              marginBottom: 16,
              animation: "fadeInUp 0.4s ease-out 0.2s both",
            }}
          >
            {SECTOR_ICONS.map((s) => {
              const Icon = s.icon;
              const sector = i.chat.sectors[s.key];
              return (
                <button
                  key={s.key}
                  onClick={() => send(i.chat.sectorPrompt(sector.query))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                    background: "var(--background)",
                    border: "1px solid var(--secondary)",
                    borderRadius: 99,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = s.color;
                    e.currentTarget.style.color = s.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--secondary)";
                    e.currentTarget.style.color = "var(--text)";
                  }}
                >
                  <Icon size={14} /> {sector.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Input box */}
        <div
          style={{
            padding: "12px 16px",
            background: "var(--background)",
            border: listening
              ? "2px solid var(--primary)"
              : "1px solid var(--secondary)",
            borderRadius: 20,
            transition: "all 0.3s",
            boxShadow: listening
              ? "0 0 0 4px rgba(68, 167, 84, 0.15)"
              : "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <textarea
            ref={textRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={i.chat.placeholder}
            rows={1}
            disabled={busy}
            style={{
              width: "100%",
              minHeight: 24,
              maxHeight: 120,
              padding: 0,
              fontSize: 15,
              color: "var(--text)",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
              opacity: busy ? 0.5 : 1,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            {/* Real File Input Trigger */}
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach"
              style={{
                width: 32,
                height: 32,
                borderRadius: 99,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--primary)";
                e.currentTarget.style.background = "rgba(68, 167, 84, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Plus size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              style={{ display: "none" }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {text.trim() && !listening ? (
                <button
                  onClick={() => send(text)}
                  disabled={busy}
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
                    color: "var(--accent)",
                    opacity: busy ? 0.5 : 1,
                  }}
                >
                  <ArrowUp size={18} />
                </button>
              ) : (
                <button
                  onClick={toggleVoice}
                  aria-label={
                    listening ? "Stop listening" : "Start voice input"
                  }
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 99,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: listening
                      ? "var(--primary)"
                      : "rgba(68, 167, 84, 0.08)",
                    color: listening ? "var(--accent)" : "var(--primary)",
                    transition: "all 0.2s",
                    animation: listening ? "pulseGlow 1.5s infinite" : "none",
                  }}
                >
                  <AudioLines size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
