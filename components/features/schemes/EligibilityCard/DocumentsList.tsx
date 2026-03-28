"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, FileText } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { t } from "@/lib/i18n";

interface DocumentsListProps {
  documents: string[];
  onAcknowledged?: () => void;
}

export default function DocumentsList({
  documents,
  onAcknowledged,
}: DocumentsListProps) {
  const { userProfile, language } = useApp();
  const i = t(language);

  // Pre-tick logic based on user profile or context
  const getInitialChecked = () => {
    const init: Record<number, boolean> = {};
    if (!documents) return init;

    documents.forEach((doc, i) => {
      const d = doc.toLowerCase();
      // If we already know their age, assume age proof is available
      if ((d.includes("age") || d.includes("aadhaar")) && userProfile?.age)
        init[i] = true;
      // If we know their location, assume identity/residence proof
      if (
        (d.includes("residence") || d.includes("domicile")) &&
        userProfile?.state
      )
        init[i] = true;
      // If they are a farmer, assume they might have land records ready (heuristic)
      if (d.includes("land") && userProfile?.occupation === "farmer")
        init[i] = true;
    });
    return init;
  };

  const [checked, setChecked] =
    useState<Record<number, boolean>>(getInitialChecked());
  const [acknowledged, setAcknowledged] = useState(false);

  // Auto-acknowledge if all documents are manually ticked
  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = documents?.length || 0;
  const allDone = total > 0 && doneCount === total;

  useEffect(() => {
    if (allDone && !acknowledged) {
      setAcknowledged(true);
      onAcknowledged?.();
    }
  }, [allDone, acknowledged, onAcknowledged]);

  if (!documents || documents.length === 0) return null;

  const toggle = (i: number) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FileText size={13} color="var(--primary)" />
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            {i.schemeCard.documentsNeeded}
          </p>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: allDone ? "var(--primary)" : "var(--text)",
            background: allDone
              ? "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 84%, var(--primary) 16%), color-mix(in srgb, var(--surface) 92%, var(--primary) 8%))"
              : "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 86%, var(--secondary) 14%), color-mix(in srgb, var(--surface) 94%, var(--secondary) 6%))",
            border: `1px solid ${allDone ? "color-mix(in srgb, var(--primary) 30%, transparent)" : "color-mix(in srgb, var(--secondary) 28%, transparent)"}`,
            borderRadius: 99,
            padding: "2px 8px",
            boxShadow: allDone
              ? "0 6px 14px var(--primary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 14%, transparent)"
              : "0 6px 14px var(--secondary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 12%, transparent)",
            transition: "all 0.3s",
          }}
        >
          {i.schemeCard.ready(doneCount, total)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 4,
          borderRadius: 99,
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--surface-alt) 88%, var(--secondary) 12%), var(--surface))",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(doneCount / total) * 100}%`,
            background: allDone ? "var(--primary)" : "var(--primary)",
            borderRadius: 99,
            transition: "width 0.4s ease, background 0.3s",
          }}
        />
      </div>

      {/* Document Checklist */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 4,
        }}
      >
        {documents.map((doc, i) => {
          const isChecked = !!checked[i];

          let helperText =
            "Get this from a Common Service Centre (CSC) or local Gram Panchayat";
          const d = doc.toLowerCase();
          if (d.includes("aadhaar"))
            helperText =
              "Get this at your nearest Aadhaar Seva Kendra or apply at uidai.gov.in";
          else if (
            d.includes("land") ||
            d.includes("khasra") ||
            d.includes("khatauni") ||
            d.includes("7/12")
          )
            helperText =
              "Get this from your Tehsildar office or State Revenue Department";
          else if (d.includes("income"))
            helperText = "Get this from the Tahsildar or local Revenue Office";
          else if (d.includes("caste"))
            helperText =
              "Apply at your local Tehsil or Common Service Centre (CSC)";
          else if (
            d.includes("bank") ||
            d.includes("passbook") ||
            d.includes("account")
          )
            helperText =
              "Visit your nearest bank branch to update your passbook";
          else if (d.includes("photo"))
            helperText = "Get this clicked at any local photography shop";
          else if (d.includes("ration"))
            helperText =
              "Apply at your local Food and Civil Supplies office or CSC";
          else if (d.includes("domicile") || d.includes("resident"))
            helperText = "Get this from the SDM/Tehsildar office or CSC";
          else if (d.includes("pan"))
            helperText =
              "Apply for a PAN card online via NSDL or at a PAN agency";

          return (
            <div
              key={i}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <button
                onClick={() =>
                  setChecked((prev) => ({ ...prev, [i]: !prev[i] }))
                }
                aria-label={`${isChecked ? "Unmark" : "Mark"} ${doc} as ready`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: isChecked
                    ? "1px solid color-mix(in srgb, var(--primary) 34%, transparent)"
                    : "1px solid color-mix(in srgb, var(--secondary) 34%, transparent)",
                  background: isChecked
                    ? "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 78%, var(--primary) 22%), color-mix(in srgb, var(--surface) 90%, var(--primary) 10%))"
                    : "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 76%, var(--secondary) 24%), color-mix(in srgb, var(--surface) 90%, var(--secondary) 10%))",
                  boxShadow: isChecked
                    ? "0 0 0 1px color-mix(in srgb, var(--primary) 18%, transparent), 0 14px 30px var(--primary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 14%, transparent)"
                    : "0 0 0 1px color-mix(in srgb, var(--secondary) 18%, transparent), 0 14px 30px var(--secondary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 12%, transparent)",
                  backdropFilter: "blur(10px)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {isChecked ? (
                  <CheckSquare
                    size={18}
                    color="var(--primary)"
                    style={{ flexShrink: 0 }}
                  />
                ) : (
                  <Square
                    size={18}
                    color="var(--muted)"
                    style={{ flexShrink: 0 }}
                  />
                )}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: isChecked ? 600 : 500,
                    color: isChecked ? "var(--primary)" : "var(--text)",
                    lineHeight: 1.4,
                    transition: "all 0.2s",
                  }}
                >
                  {doc}
                </span>
              </button>

              {!isChecked && (
                <p
                  style={{
                    margin: "0 0 0 42px",
                    fontSize: 11.5,
                    color: "var(--text)",
                    lineHeight: 1.4,
                    fontStyle: "italic",
                  }}
                >
                  ℹ️ {helperText}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Acknowledgment block */}
      {!allDone && !acknowledged && (
        <button
          onClick={() => {
            setAcknowledged(true);
            onAcknowledged?.();
          }}
          style={{
            marginTop: 10,
            padding: "12px",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--accent)",
            background: "var(--primary)",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--primary-dark)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--primary)")
          }
        >
          I will manage the documents — Continue
        </button>
      )}

      {allDone && (
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--primary)",
            textAlign: "center",
            margin: "8px 0 0 0",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 82%, var(--primary) 18%), color-mix(in srgb, var(--surface) 92%, var(--primary) 8%))",
            padding: "10px",
            borderRadius: 10,
            border:
              "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
            boxShadow:
              "0 10px 22px var(--primary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 14%, transparent)",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          🎉 You have all documents ready! You can now apply.
        </p>
      )}
    </div>
  );
}
