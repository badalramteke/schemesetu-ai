"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Globe, Languages } from "lucide-react";
import { t } from "@/lib/i18n";

const LANGUAGES = [
  { code: "en" as const, label: "English", native: "English" },
  { code: "hi" as const, label: "हिन्दी", native: "Hindi" },
  { code: "mr" as const, label: "मराठी", native: "Marathi" },
];

export default function LanguageSelect() {
  const { setLanguage, setCurrentView, language } = useApp();
  const i = t(language).langSelect;

  return (
    <div style={{ background: "#fff", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeInUp 0.4s ease-out" }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, #910A67, #720455)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(145,10,103,0.25)" }}>
          <Globe size={40} color="#fff" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{i.title}</h1>
        <p style={{ fontSize: 14, color: "#666", marginTop: 8 }}>{i.subtitle}</p>
      </div>

      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>
        {LANGUAGES.map((lang, idx) => (
          <button
            key={lang.code}
            onClick={() => { setLanguage(lang.code); setCurrentView("onboarding"); }}
            style={{
              display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "18px 24px",
              background: "#f8f8fc", border: "1px solid #e8e8f0", borderRadius: 16,
              cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              animation: `fadeInUp 0.4s ease-out ${idx * 0.1}s both`, fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f0eef5"; e.currentTarget.style.borderColor = "#910A67"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f8f8fc"; e.currentTarget.style.borderColor = "#e8e8f0"; }}
          >
            <Languages size={26} color="#910A67" />
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", margin: 0 }}>{lang.label}</p>
              <p style={{ fontSize: 13, color: "#888", margin: 0 }}>{lang.native}</p>
            </div>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "#aaa", marginTop: 48, animation: "fadeInUp 0.4s ease-out 0.4s both" }}>
        {i.footer}
      </p>
    </div>
  );
}
