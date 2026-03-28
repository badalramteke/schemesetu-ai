"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import LayoutWrapper from "@/components/layout/LayoutWrapper/LayoutWrapper";
import LanguageSelect from "@/components/features/LanguageSelect";
import OnboardingWizard from "@/components/features/OnboardingWizard";
import ChatBox from "@/components/features/chat/ChatBox/ChatBox";
import SettingsPage from "@/app/(dashboard)/settings/page";

export default function Home() {
  const { currentView, chatId } = useApp();

  if (currentView === "language") return <LanguageSelect />;
  if (currentView === "onboarding") return <OnboardingWizard />;
  if (currentView === "settings")
    return (
      <LayoutWrapper>
        <SettingsPage />
      </LayoutWrapper>
    );

  // Both "home" and "chat" now use the same unified ChatBox
  return (
    <LayoutWrapper>
      <ChatBox key={chatId} />
    </LayoutWrapper>
  );
}
