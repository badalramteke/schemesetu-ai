"use client";

import React from "react";
import {
  IndianRupee,
  Calendar,
  CreditCard,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { t } from "@/lib/i18n";

interface MoneyBenefit {
  label: string;
  value: string;
  icon: "rupee" | "calendar" | "card";
}

interface BenefitsTableProps {
  /** Raw benefits string from RAG pipeline */
  rawBenefits: string;
}

/**
 * Splits a raw benefits string into:
 *   textBenefits  – what-is-covered items (services, coverage, etc.)
 *   moneyBenefits – structured financial rows (amount, frequency, payment mode)
 */
function parseBenefits(raw: string): {
  textBenefits: string[];
  moneyBenefits: MoneyBenefit[];
} {
  const moneyBenefits: MoneyBenefit[] = [];

  // ── Extract money-related structured info ──────────────────────────────

  // Match rupee amounts
  const amtMatch = raw.match(
    /₹\s*[\d,]+(?:\.\d+)?(?:\s*(?:per|\/)\s*(?:year|month|annum|family))?|\d[\d,]*\s*(?:rupee|lakh|crore)/i,
  );
  if (amtMatch) {
    moneyBenefits.push({
      label: "Benefit Amount",
      value: amtMatch[0].trim(),
      icon: "rupee",
    });
  }

  // Frequency
  const freqPatterns = [
    { re: /per\s+year|annually|yearly|per\s+annum/i, val: "Per year" },
    { re: /per\s+month|monthly/i, val: "Per month" },
    { re: /per\s+family/i, val: "Per family" },
    { re: /one[- ]time|once|lump[- ]sum/i, val: "One-time payment" },
    {
      re: /(\d+)\s+instalment/i,
      val: (m: RegExpMatchArray) => `${m[1]} instalments`,
    },
  ];
  for (const p of freqPatterns) {
    const m = raw.match(p.re);
    if (m) {
      moneyBenefits.push({
        label: "Frequency",
        value: typeof p.val === "function" ? p.val(m) : p.val,
        icon: "calendar",
      });
      break;
    }
  }

  // Payment mode
  const payPatterns = [
    {
      re: /DBT|direct\s+benefit\s+transfer/i,
      val: "Direct Benefit Transfer (DBT)",
    },
    { re: /bank\s+transfer|NEFT|RTGS/i, val: "Bank Transfer" },
    { re: /cashless/i, val: "Cashless Treatment" },
    { re: /cash/i, val: "Cash" },
    { re: /cheque/i, val: "Cheque" },
    { re: /ration|PDS/i, val: "Public Distribution System" },
    { re: /empanelled\s+hospital/i, val: "Empanelled Hospitals" },
  ];
  for (const p of payPatterns) {
    if (p.re.test(raw)) {
      moneyBenefits.push({ label: "Payment Mode", value: p.val, icon: "card" });
      break;
    }
  }

  // ── Extract text benefits (what's covered) ────────────────────────────

  // Try to split the raw string into individual benefit points
  let textBenefits: string[] = [];

  // First try: split on common separators (, and/or bullets/newlines)
  // We look for "covers ..." or benefit-item lists
  const coverMatch = raw.match(/covers?\s+(.+)/i);
  const benefitText = coverMatch ? coverMatch[1] : raw;

  // Split on commas, "and", semicolons, bullet points, or newlines
  const items = benefitText
    .split(/[,;\n]|\band\b/i)
    .map((s) => s.replace(/\.$/, "").trim())
    .filter((s) => {
      // Keep only descriptive text items, skip money amounts and very short fragments
      if (!s || s.length < 3) return false;
      // Skip items that are purely money references (already captured above)
      if (/^₹\s*[\d,]+/.test(s)) return false;
      if (/^\d+\s+instalment/i.test(s)) return false;
      if (/^(via|through)\s+(DBT|bank)/i.test(s)) return false;
      return true;
    });

  if (items.length > 1) {
    textBenefits = items;
  } else if (raw.length > 0) {
    // Fallback: show the full text as a single benefit point
    textBenefits = [raw];
  }

  return { textBenefits, moneyBenefits };
}

const MONEY_ICONS = {
  rupee: IndianRupee,
  calendar: Calendar,
  card: CreditCard,
};

export default function BenefitsTable({ rawBenefits }: BenefitsTableProps) {
  const { language } = useApp();
  const i = t(language);

  if (!rawBenefits) return null;

  const { textBenefits, moneyBenefits } = parseBenefits(rawBenefits);

  const labelMap: Record<string, string> = {
    "Benefit Amount": i.schemeCard.benefitAmount,
    Frequency: i.schemeCard.frequency,
    "Payment Mode": i.schemeCard.paymentMode,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* ── What's Covered (Text Benefits) ── */}
      {textBenefits.length > 0 && (
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid var(--secondary-softest)",
            background: "var(--surface)",
            boxShadow:
              "0 10px 24px color-mix(in srgb, var(--primary) 12%, transparent)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              background:
                "linear-gradient(90deg, color-mix(in srgb, var(--secondary) 10%, transparent), color-mix(in srgb, var(--secondary) 4%, transparent))",
              borderBottom:
                "1px solid color-mix(in srgb, var(--secondary) 10%, var(--accent) 90%)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FileText size={13} color="var(--secondary)" />
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--secondary)",
                margin: 0,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {i.schemeCard.whatsCovered}
            </p>
          </div>

          <div style={{ padding: "10px 14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {textBenefits.map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
                >
                  <CheckCircle
                    size={14}
                    color="var(--secondary)"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: "var(--text)",
                      fontWeight: 500,
                    }}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Financial Benefits (Money) ── */}
      {moneyBenefits.length > 0 && (
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border:
              "1px solid color-mix(in srgb, var(--primary) 28%, transparent)",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 82%, var(--primary) 18%), color-mix(in srgb, var(--surface) 92%, var(--primary) 8%))",
            boxShadow:
              "0 0 0 1px color-mix(in srgb, var(--primary) 18%, transparent), 0 14px 30px var(--primary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 14%, transparent)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              background:
                "linear-gradient(90deg, color-mix(in srgb, var(--primary) 16%, transparent), color-mix(in srgb, var(--primary) 6%, transparent))",
              borderBottom:
                "1px solid color-mix(in srgb, var(--primary) 16%, var(--accent) 84%)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IndianRupee size={13} color="var(--primary)" />
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--primary)",
                margin: 0,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {i.schemeCard.financialBenefits}
            </p>
          </div>

          <div style={{ padding: "4px 0" }}>
            {moneyBenefits.map((row, i) => {
              const IconComp = MONEY_ICONS[row.icon];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 14px",
                    borderBottom:
                      i < moneyBenefits.length - 1
                        ? "1px solid color-mix(in srgb, var(--primary) 16%, var(--accent) 84%)"
                        : "none",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <IconComp size={12} color="var(--text)" />
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        fontWeight: 500,
                      }}
                    >
                      {labelMap[row.label] || row.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
