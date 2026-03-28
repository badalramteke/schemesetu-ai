"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import { t } from "@/lib/i18n";
import { ArrowLeft, Globe, Type, Eye } from "lucide-react";

const LANGUAGES = [
  { code: "en" as const, label: "English" },
  { code: "hi" as const, label: "हिन्दी (Hindi)" },
  { code: "mr" as const, label: "मराठी (Marathi)" },
  { code: "bn" as const, label: "বাংলা (Bengali)" },
  { code: "gu" as const, label: "ગુજરાતી (Gujarati)" },
  { code: "kn" as const, label: "ಕನ್ನಡ (Kannada)" },
  { code: "te" as const, label: "తెలుగు (Telugu)" },
  { code: "ur" as const, label: "اردو (Urdu)" },
];

export default function Page() {
  const {
    language,
    setLanguage,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    setCurrentView,
  } = useApp();

  const i = t(language).sidebar;

  const sectionStyle: React.CSSProperties = {
    background: "var(--background)",
    border: "1px solid var(--secondary)",
    borderRadius: 16,
    padding: "20px 24px",
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text)",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const subtextStyle: React.CSSProperties = {
    fontSize: 13,
    color: "var(--muted)",
    margin: "4px 0 14px",
  };

  return (
    <div
      style={{
        padding: "24px 20px 120px",
        background: "var(--background)",
        minHeight: "100dvh",
        direction: language === "ur" ? "rtl" : "ltr",
      }}
    >
      {/* back + title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <button
          onClick={() => setCurrentView("home")}
          aria-label="Back"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "var(--text)",
          }}
        >
          <ArrowLeft size={22} />
        </button>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text)",
            margin: 0,
          }}
        >
          {i.settings}
        </h1>
      </div>

      {/* ── Language ── */}
      <div style={sectionStyle}>
        <p style={labelStyle}>
          <Globe size={18} color="var(--primary)" />
          {language === "ur" ? "زبان" : language === "hi" ? "भाषा" : "Language"}
        </p>
        <p style={subtextStyle}>
          {language === "ur"
            ? "ایپ کی زبان تبدیل کریں"
            : language === "hi"
              ? "ऐप की भाषा बदलें"
              : "Change the app language"}
        </p>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: 15,
            fontFamily: "inherit",
            color: "var(--text)",
            background: "var(--background)",
            border: "1px solid var(--secondary)",
            borderRadius: 12,
            cursor: "pointer",
            outline: "none",
            direction: "ltr",
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Font size ── */}
      <div style={sectionStyle}>
        <p style={labelStyle}>
          <Type size={18} color="var(--primary)" />
          {language === "ur"
            ? "فونٹ سائز"
            : language === "hi"
              ? "फ़ॉन्ट आकार"
              : "Font Size"}
        </p>
        <p style={subtextStyle}>
          {language === "ur"
            ? `موجودہ: ${fontSize}px`
            : `Current: ${fontSize}px`}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            style={stepBtnStyle}
          >
            A−
          </button>
          <input
            type="range"
            min={12}
            max={22}
            step={1}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{ flex: 1, accentColor: "var(--primary)" }}
          />
          <button
            onClick={() => setFontSize(Math.min(22, fontSize + 2))}
            style={stepBtnStyle}
          >
            A+
          </button>
        </div>
      </div>

      {/* ── High contrast ── */}
      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={labelStyle}>
              <Eye size={18} color="var(--primary)" />
              {language === "ur"
                ? "زیادہ کنٹراسٹ"
                : language === "hi"
                  ? "हाई कंट्रास्ट"
                  : "High Contrast"}
            </p>
            <p style={{ ...subtextStyle, marginBottom: 0 }}>
              {language === "ur"
                ? "بہتر پڑھنے کے لیے کنٹراسٹ بڑھائیں"
                : language === "hi"
                  ? "बेहतर पठनीयता के लिए कंट्रास्ट बढ़ाएं"
                  : "Increase contrast for better readability"}
            </p>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            role="switch"
            aria-checked={highContrast}
            style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              background: highContrast ? "var(--primary)" : "var(--secondary)",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: highContrast ? 27 : 3,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "var(--text)",
                transition: "left 0.2s",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

const stepBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  color: "var(--text)",
  background: "var(--background)",
  border: "1px solid var(--secondary)",
  borderRadius: 10,
  cursor: "pointer",
};
