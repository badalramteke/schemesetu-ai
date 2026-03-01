"use client";

import React from "react";
import { IndianRupee, Calendar, CreditCard } from "lucide-react";

interface BenefitsEntry {
  label: string;
  value: string;
  icon?: "rupee" | "calendar" | "card";
}

interface BenefitsTableProps {
  /** Raw benefits string from RAG pipeline, e.g. "₹6000/year in 3 instalments via DBT" */
  rawBenefits: string;
}

/**
 * Parses a raw benefits string into structured rows.
 * Handles patterns like:
 *  - "₹6000 per year" → Amount: ₹6,000 / Frequency: Per year
 *  - "3 instalments" → Instalments: 3
 *  - "via DBT" / "via bank transfer" → Payment: Direct Bank Transfer
 */
function parseBenefits(raw: string): BenefitsEntry[] {
  const rows: BenefitsEntry[] = [];

  // Match rupee amounts
  const amtMatch = raw.match(/₹\s*[\d,]+(?:\.\d+)?|\d[\d,]*\s*(?:rupee|lakh|crore)/i);
  if (amtMatch) {
    rows.push({ label: "Benefit Amount", value: amtMatch[0].replace(/\s+/g, ""), icon: "rupee" });
  }

  // Frequency
  const freqPatterns = [
    { re: /per\s+year|annually|yearly/i, val: "Per year" },
    { re: /per\s+month|monthly/i, val: "Per month" },
    { re: /one[- ]time|once|lump[- ]sum/i, val: "One-time payment" },
    { re: /(\d+)\s+instalment/i, val: (m: RegExpMatchArray) => `${m[1]} instalments` },
  ];
  for (const p of freqPatterns) {
    const m = raw.match(p.re);
    if (m) {
      rows.push({ label: "Frequency", value: typeof p.val === "function" ? p.val(m) : p.val, icon: "calendar" });
      break;
    }
  }

  // Payment mode
  const payPatterns = [
    { re: /DBT|direct\s+benefit\s+transfer/i, val: "Direct Benefit Transfer (DBT)" },
    { re: /bank\s+transfer|NEFT|RTGS/i, val: "Bank Transfer" },
    { re: /cash/i, val: "Cash" },
    { re: /cheque/i, val: "Cheque" },
    { re: /ration|PDS/i, val: "Public Distribution System" },
  ];
  for (const p of payPatterns) {
    if (p.re.test(raw)) {
      rows.push({ label: "Payment Mode", value: p.val, icon: "card" });
      break;
    }
  }

  // If nothing parsed, just show the raw text as a single summary row
  if (rows.length === 0) {
    rows.push({ label: "Benefits", value: raw, icon: "rupee" });
  }

  return rows;
}

const ICONS = {
  rupee: IndianRupee,
  calendar: Calendar,
  card: CreditCard,
};

export default function BenefitsTable({ rawBenefits }: BenefitsTableProps) {
  if (!rawBenefits) return null;

  const rows = parseBenefits(rawBenefits);

  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      border: "1px solid #d0eadb", background: "#f2fbf5",
    }}>
      <div style={{
        padding: "8px 14px",
        background: "linear-gradient(90deg, rgba(39,174,96,0.12), rgba(39,174,96,0.04))",
        borderBottom: "1px solid #d0eadb",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <IndianRupee size={13} color="#27AE60" />
        <p style={{ fontSize: 11, fontWeight: 700, color: "#27AE60", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Benefits Breakdown
        </p>
      </div>

      <div style={{ padding: "4px 0" }}>
        {rows.map((row, i) => {
          const IconComp = row.icon ? ICONS[row.icon] : IndianRupee;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 14px",
              borderBottom: i < rows.length - 1 ? "1px solid rgba(208,234,219,0.6)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <IconComp size={12} color="#555" />
                <span style={{ fontSize: 12, color: "#777", fontWeight: 500 }}>{row.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#27AE60" }}>{row.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
