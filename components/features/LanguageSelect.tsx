"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Globe, Languages } from "lucide-react";
import { t } from "@/lib/i18n";

const LANGUAGES = [
  { code: "en" as const, label: "English", native: "English" },
  { code: "hi" as const, label: "हिन्दी", native: "Hindi" },
  { code: "mr" as const, label: "मराठी", native: "Marathi" },
  { code: "bn" as const, label: "বাংলা", native: "Bengali" },
  { code: "gu" as const, label: "ગુજરાતી", native: "Gujarati" },
  { code: "kn" as const, label: "ಕನ್ನಡ", native: "Kannada" },
  { code: "te" as const, label: "తెలుగు", native: "Telugu" },
  { code: "ur" as const, label: "اردو", native: "Urdu" },
];

export default function LanguageSelect() {
  const { setLanguage, setCurrentView, language } = useApp();
  const i = t(language).langSelect;

  return (
    <div
      style={{
        background: "var(--background)",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 40,
          animation: "fadeInUp 0.4s ease-out",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, var(--primary), var(--primary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(68, 167, 84, 0.25)",
          }}
        >
          <Globe size={40} color="var(--accent)" />
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text)",
            margin: 0,
          }}
        >
          {i.title}
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>
          {i.subtitle}
        </p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 500,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {LANGUAGES.map((lang, idx) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
              setCurrentView("onboarding");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "14px 16px",
              background: "var(--background)",
              border: "1px solid var(--secondary)",
              borderRadius: 14,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
              animation: `fadeInUp 0.4s ease-out ${idx * 0.06}s both`,
              fontFamily: "inherit",
              direction: lang.code === "ur" ? "rtl" : "ltr",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--primary-soft)";
              e.currentTarget.style.borderColor = "var(--primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--background)";
              e.currentTarget.style.borderColor = "var(--secondary)";
            }}
          >
            <Languages size={22} color="var(--primary)" />
            <div>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                {lang.label}
              </p>
              <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>
                {lang.native}
              </p>
            </div>
          </button>
        ))}
      </div>

      <p
        style={{
          fontSize: 12,
          color: "var(--text)",
          marginTop: 48,
          animation: "fadeInUp 0.4s ease-out 0.4s both",
        }}
      >
        {i.footer}
      </p>
    </div>
  );
}
