"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useApp } from "@/components/providers/AppProvider";
import {
  Landmark, Wheat, HeartPulse, Home as HomeIcon,
  HardHat, Ribbon, GraduationCap, Plus, ArrowUp, AudioLines, FlaskConical,
} from "lucide-react";
import ChatMessage from "@/components/features/chat/ChatMessage/ChatMessage";
import QuestionJumper from "@/components/features/chat/QuestionJumper/QuestionJumper";
import type { ChatQuestion } from "@/components/features/chat/QuestionJumper/QuestionJumper";
import { MOCK_MESSAGES } from "@/lib/mock-messages";
import { t } from "@/lib/i18n";
import type { EligibilityResult } from "@/lib/rag-pipeline";
import {
  inferSchemesFromQuery,
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
  { key: "agriculture" as const, icon: Wheat,          color: "#27AE60" },
  { key: "healthcare"  as const, icon: HeartPulse,     color: "#3498DB" },
  { key: "housing"     as const, icon: HomeIcon,       color: "#F39C12" },
  { key: "employment"  as const, icon: HardHat,        color: "#E74C3C" },
  { key: "pension"     as const, icon: Ribbon,         color: "#9B59B6" },
  { key: "education"   as const, icon: GraduationCap,  color: "#2980B9" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatBox() {
  const { chatPrefilledQuery, setChatPrefilledQuery, userProfile, language, chatId, chatHistory, setChatHistory } = useApp();
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
  const [messages, setMessages] = useState<Message[]>(() => getInitial("messages", []));
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // ── Conversational interview state ──
  const [convPhase, setConvPhase] = useState<ConvPhase>(() => getInitial("convPhase", "idle"));
  const [convAnswers, setConvAnswers] = useState<Record<string, string>>(() => getInitial("convAnswers", {}));
  const [candidates, setCandidates] = useState<string[]>(() => getInitial("candidates", []));
  const [activeQId, setActiveQId] = useState(() => getInitial("activeQId", ""));
  const [goalLabel, setGoalLabel] = useState(() => getInitial("goalLabel", ""));
  const [pendingQuery, setPendingQuery] = useState(() => getInitial("pendingQuery", ""));

  // Auto-save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`chat_data_${chatId}`, JSON.stringify({
      messages, convPhase, convAnswers, candidates, activeQId, goalLabel, pendingQuery
    }));
  }, [messages, convPhase, convAnswers, candidates, activeQId, goalLabel, pendingQuery, chatId]);

  // Push new chat session to History immediately when a message is added
  useEffect(() => {
    if (messages.length > 0) {
      const exists = chatHistory.some(c => c.id === chatId);
      if (!exists) {
        setChatHistory([{ 
          id: chatId, 
          title: messages[0].role === "user" ? (messages[0].content || "New Chat") : "New Chat",
          timestamp: Date.now() 
        }, ...chatHistory]);
      }
    }
  }, [messages, chatId, chatHistory, setChatHistory]);

  // Refs for async-safe access
  const convPhaseRef    = useRef<ConvPhase>("idle");
  const convAnswersRef  = useRef<Record<string, string>>({});
  const candidatesRef   = useRef<string[]>([]);
  const activeQIdRef    = useRef("");
  const goalLabelRef    = useRef("");
  const pendingQueryRef = useRef("");

  // Keep refs in sync with state
  useEffect(() => { convPhaseRef.current   = convPhase; },    [convPhase]);
  useEffect(() => { convAnswersRef.current  = convAnswers; },  [convAnswers]);
  useEffect(() => { candidatesRef.current   = candidates; },   [candidates]);
  useEffect(() => { activeQIdRef.current    = activeQId; },    [activeQId]);
  useEffect(() => { goalLabelRef.current    = goalLabel; },    [goalLabel]);
  useEffect(() => { pendingQueryRef.current = pendingQuery; }, [pendingQuery]);

  const scrollRef  = useRef<HTMLDivElement>(null);
  const endRef     = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLTextAreaElement>(null);
  const recogRef   = useRef<SpeechRecognition | null>(null);
  const msgRefs    = useRef<Map<number, HTMLDivElement>>(new Map());
  const autoSent   = useRef(false);

  const hasMessages = messages.length > 0;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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

  // ── Dynamic Turn API Call ──────────────────────────────────────────────────

  const fetchNextDynamicTurn = async (query: string, curAnswers: Record<string, string>) => {
    addMsg({ id: makeId("l"), role: "ai", isLoading: true });
    setBusy(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userQuery: query, 
          language,
          profile: userProfile,
          answers: curAnswers
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.message);

      // Remove loading indicator
      setMessages((p) => p.filter((m) => !m.isLoading));

      if (data.status === "questioning") {
        setConvPhase("questions");
        convPhaseRef.current = "questions";
        
        addMsg({
          id: makeId("q"),
          role: "ai",
          content: data.question,
          chips: data.chips,
        });
      } else if (data.status === "complete") {
        setConvPhase("rag");
        convPhaseRef.current = "rag";

        const results = data.results;
        const msg = (results?.totalMatches || 0) > 0
          ? i.chat.foundSchemes(results.totalMatches)
          : i.chat.noSchemes;

        addMsg({
          id: makeId("a"),
          role: "ai",
          content: msg,
          eligibilityResults: results?.matchingSchemes || [],
        });
      }
    } catch (err) {
      console.error("Dynamic turn error:", err);
      setMessages((p) =>
        p.filter((m) => !m.isLoading).concat({ id: makeId("e"), role: "ai", content: i.chat.busy })
      );
    } finally {
      setBusy(false);
    }
  };

  // ── Voice ──────────────────────────────────────────────────────────────────

  const toggleVoice = () => {
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert(i.chat.voiceNotSupported); return; }
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
    r.onresult = (e: SpeechRecognitionEvent) => {
      let t = "";
      for (let j = 0; j < e.results.length; j++) t += e.results[j][0].transcript;
      setText(t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  };



  // ── Core send (user types and sends) ──────────────────────────────────────

  const send = async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed || busy) return;

    // Prevent duplicate triggers if already in a non-idle phase
    if (messages.length > 0 && convPhaseRef.current === "idle") return;

    setText("");
    if (textRef.current) textRef.current.style.height = "auto";

    // ── During question phase: handle free text (optional) ──
    if (convPhaseRef.current === "questions") {
      addMsg({ id: makeId("u"), role: "user", content: trimmed });
      // In dynamic mode, free text could be used to answer the question
      await fetchNextDynamicTurn(pendingQueryRef.current, { ...convAnswersRef.current, [Date.now()]: trimmed });
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
      }
      return;
    }

    // ── Follow-up message after chat is done → restart interview ──
    if (convPhaseRef.current === "rag") {
      // Reset state and start fresh
      setConvAnswers({});
      convAnswersRef.current = {};
      setCandidates([]);
      candidatesRef.current = [];
      setActiveQId("");
      activeQIdRef.current = "";
      setGoalLabel("");
      goalLabelRef.current = "";
      
      setPendingQuery(trimmed);
      pendingQueryRef.current = trimmed;
      setConvPhase("goal");
      convPhaseRef.current = "goal";

      addMsg({ id: makeId("u"), role: "user", content: trimmed });
      addMsg({
        id: makeId("g"),
        role: "ai",
        content: i.chat.goalQuestion,
        chips: i.chat.goalChips,
      });
    }
  };

  // ── Chip click handler ─────────────────────────────────────────────────────

  const handleChipClick = async (value: string, label: string) => {
    if (busy) return;

    // Remove chips from whichever message just had them
    setMessages((p) => p.map((m) => (m.chips ? { ...m, chips: undefined, sensitiveNote: undefined } : m)));



    // Show user's selection as a user message bubble
    addMsg({ id: makeId("u"), role: "user", content: label.replace(/^[^\w₹"\u0900-\u097f\u0a80-\u0aff]+/, "") });

    const phase = convPhaseRef.current;

    // ── Phase: goal selection ──
    if (phase === "goal") {
      setGoalLabel(label);
      goalLabelRef.current = label;
      setConvPhase("questions");
      convPhaseRef.current = "questions";
      
      await fetchNextDynamicTurn(pendingQueryRef.current, { goal: value });
      return;
    }

    // ── Phase: eligibility questions ──
    if (phase === "questions") {
      // Dynamic questions use labels or values as answers
      const newAnswers = { ...convAnswersRef.current, [Date.now().toString()]: value };
      setConvAnswers(newAnswers);
      convAnswersRef.current = newAnswers;

      await fetchNextDynamicTurn(pendingQueryRef.current, newAnswers);
    }
  };

  // ── RAG API call ───────────────────────────────────────────────────────────



  // ── QuestionJumper helpers ─────────────────────────────────────────────────

  const chatQuestions: ChatQuestion[] = useMemo(() =>
    messages
      .map((m, idx) => ({ m, idx }))
      .filter(({ m }) => m.role === "user" && m.content)
      .map(({ m, idx }) => ({ id: m.id, text: m.content!, messageIndex: idx })),
    [messages]
  );

  const jumpToQuestion = (messageIndex: number) => {
    const el = msgRefs.current.get(messageIndex);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.transition = "background 0.3s";
      el.style.background = "rgba(145,10,103,0.08)";
      setTimeout(() => { el.style.background = "transparent"; }, 1500);
    }
  };

  // ── Input handlers ─────────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); }
  };
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 120) + "px";
    }
  };

  // ── Greeting ───────────────────────────────────────────────────────────────

  const hour = new Date().getHours();
  const tod  = hour < 12 ? i.chat.morning : hour < 17 ? i.chat.afternoon : i.chat.evening;
  const greet = i.chat.greeting(userProfile.name || "", tod);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 56px)", background: "#fff" }}>

      {/* ─── SCROLLABLE AREA ─── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div ref={scrollRef} className="hide-scrollbar"
          style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Empty state */}
          {!hasMessages && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px 0" }}>
              <div style={{ textAlign: "center", marginBottom: 32, animation: "fadeInUp 0.4s ease-out" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(145,10,103,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Landmark size={24} color="#910A67" />
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{greet}</h2>
                <p style={{ fontSize: 14, color: "#888", marginTop: 6, maxWidth: 320 }}>{i.chat.placeholder}</p>
              </div>
              <button onClick={loadTestData}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 12, fontWeight: 500, color: "#910A67", background: "rgba(145,10,103,0.06)", border: "1px dashed rgba(145,10,103,0.3)", borderRadius: 99, cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}>
                <FlaskConical size={14} /> {i.chat.loadTest}
              </button>
            </div>
          )}

          {/* Messages */}
          {hasMessages && (
            <div style={{ flex: 1, padding: "8px 0", paddingRight: chatQuestions.length >= 2 ? 28 : 0, maxWidth: 760, margin: "0 auto", width: "100%" }}>
              {messages.map((m, idx) => (
                <div key={m.id} ref={(el) => { if (el) msgRefs.current.set(idx, el); }} style={{ borderRadius: 8 }}>
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
      <div style={{ padding: "0 20px 24px", maxWidth: 720, width: "100%", margin: "0 auto", display: isScrubbing ? "none" : "block" }}>

        {/* Sector chips (empty state only) */}
        {!hasMessages && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 16, animation: "fadeInUp 0.4s ease-out 0.2s both" }}>
            {SECTOR_ICONS.map((s) => {
              const Icon = s.icon;
              const sector = i.chat.sectors[s.key];
              return (
                <button key={s.key} onClick={() => send(i.chat.sectorPrompt(sector.query))}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#555", background: "#fff", border: "1px solid #e8e8f0", borderRadius: 99, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.color = s.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e8e8f0"; e.currentTarget.style.color = "#555"; }}>
                  <Icon size={14} /> {sector.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Input box */}
        <div style={{ padding: "12px 16px", background: "#f8f8fc", border: listening ? "2px solid #910A67" : "1px solid #e8e8f0", borderRadius: 20, transition: "all 0.3s", boxShadow: listening ? "0 0 0 4px rgba(145,10,103,0.15)" : "0 1px 4px rgba(0,0,0,0.04)" }}>
          <textarea ref={textRef} value={text} onChange={handleInput} onKeyDown={handleKeyDown}
            placeholder={i.chat.placeholder} rows={1} disabled={busy}
            style={{ width: "100%", minHeight: 24, maxHeight: 120, padding: 0, fontSize: 15, color: "#1a1a2e", background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "inherit", opacity: busy ? 0.5 : 1 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <button aria-label="Attach" style={{ width: 32, height: 32, borderRadius: 99, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
              <Plus size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {text.trim() ? (
                <button onClick={() => send(text)} disabled={busy} aria-label="Send"
                  style={{ width: 36, height: 36, borderRadius: 99, border: "none", background: "#910A67", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", opacity: busy ? 0.5 : 1 }}>
                  <ArrowUp size={18} />
                </button>
              ) : (
                <button onClick={toggleVoice} aria-label={listening ? "Stop listening" : "Start voice input"}
                  style={{ width: 36, height: 36, borderRadius: 99, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: listening ? "#910A67" : "rgba(145,10,103,0.08)", color: listening ? "#fff" : "#910A67", transition: "all 0.2s", animation: listening ? "pulseGlow 1.5s infinite" : "none" }}>
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
