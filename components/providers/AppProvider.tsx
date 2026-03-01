"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Language = "en" | "hi" | "mr";

interface UserProfile {
  name?: string;
  location?: string;
  age?: number;
  occupation?: string;
  gender?: string;
  employment?: string;
  state?: string;
  district?: string;
  village?: string;
}

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (done: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (on: boolean) => void;
  currentView: "language" | "onboarding" | "home" | "chat";
  setCurrentView: (view: "language" | "onboarding" | "home" | "chat") => void;
  chatPrefilledQuery: string;
  setChatPrefilledQuery: (query: string) => void;
  chatId: string;
  setChatId: (id: string) => void;
  chatHistory: { id: string; title: string; timestamp: number }[];
  setChatHistory: (val: { id: string; title: string; timestamp: number }[]) => void;
  startNewChat: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);
  const [userProfile, setUserProfileState] = useState<UserProfile>({});
  const [fontSize, setFontSizeState] = useState(16);
  const [highContrast, setHighContrastState] = useState(false);
  const [currentView, setCurrentView] = useState<AppState["currentView"]>("language");
  const [chatPrefilledQuery, setChatPrefilledQuery] = useState("");
  const [chatId, setChatId] = useState<string>(() => Date.now().toString());
  const [chatHistory, setChatHistoryState] = useState<{ id: string; title: string; timestamp: number }[]>([]);

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("schemesetu-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguageState(parsed.language);
        if (parsed.hasCompletedOnboarding) {
          setHasCompletedOnboardingState(true);
          setCurrentView("home");
        }
        if (parsed.userProfile) setUserProfileState(parsed.userProfile);
        if (parsed.fontSize) setFontSizeState(parsed.fontSize);
        if (parsed.highContrast) setHighContrastState(parsed.highContrast);
        if (parsed.chatHistory) setChatHistoryState(parsed.chatHistory);
        if (parsed.chatId) setChatId(parsed.chatId);
      }
    } catch {}
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "schemesetu-state",
        JSON.stringify({ language, hasCompletedOnboarding, userProfile, fontSize, highContrast, chatHistory, chatId })
      );
    } catch {}
  }, [language, hasCompletedOnboarding, userProfile, fontSize, highContrast, chatHistory, chatId]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const setHasCompletedOnboarding = (done: boolean) => {
    setHasCompletedOnboardingState(done);
    if (done) setCurrentView("home");
  };
  const setUserProfile = (profile: UserProfile) => setUserProfileState(profile);
  const setFontSize = (size: number) => setFontSizeState(size);
  const setHighContrast = (on: boolean) => setHighContrastState(on);

  const setChatHistory = (history: any[]) => setChatHistoryState(history);

  const startNewChat = () => {
    setChatPrefilledQuery("");
    const newId = Date.now().toString();
    setChatId(newId);
    setSidebarOpen(false);
    setCurrentView("chat");
  };

  return (
    <AppContext.Provider
      value={{
        language, setLanguage,
        sidebarOpen, setSidebarOpen, toggleSidebar,
        hasCompletedOnboarding, setHasCompletedOnboarding,
        userProfile, setUserProfile,
        fontSize, setFontSize,
        highContrast, setHighContrast,
        currentView, setCurrentView,
        chatPrefilledQuery, setChatPrefilledQuery,
        chatId, setChatId,
        chatHistory, setChatHistory,
        startNewChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
