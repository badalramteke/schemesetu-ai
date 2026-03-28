"use client";

import React, { useState } from "react";
import { ChevronDown, ExternalLink, Globe, ShieldCheck } from "lucide-react";
import type { EligibilityResult } from "@/lib/rag-pipeline";
import { useApp } from "@/components/providers/AppProvider";
import { t } from "@/lib/i18n";
import EligibilityBadge from "./EligibilityBadge";
import DocumentsList from "./DocumentsList";
import BenefitsTable from "./BenefitsTable";
import ApplicationStepsCard from "./ApplicationStepsCard";
import VideoTutorial from "@/components/features/output/VideoTutorial/VideoTutorial";
import PDFDownload from "@/components/features/output/PDFDownload/PDFDownload";
import CSCLocator from "@/components/features/output/CSCLocator/CSCLocator";

interface EligibilityCardProps {
  result: EligibilityResult;
  index: number;
  district?: string;
  state?: string;
}

function EligibilityCard({
  result,
  index,
  district,
  state,
}: EligibilityCardProps) {
  const [open, setOpen] = useState(true);
  const [showCSC, setShowCSC] = useState(false);
  const { language } = useApp();
  const i = t(language);

  // If no documents are required, they are implicitly acknowledged.
  const hasDocs = result.documents && result.documents.length > 0;
  const [docsAcknowledged, setDocsAcknowledged] = useState(!hasDocs);

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 80%, var(--secondary) 20%), color-mix(in srgb, var(--surface) 92%, var(--secondary) 8%))",
        border:
          "1px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
        borderRadius: 16,
        overflow: "hidden",
        animation: `fadeInUp 0.35s ease-out ${index * 0.12}s both`,
        boxShadow:
          "0 0 0 1px color-mix(in srgb, var(--secondary) 16%, transparent), 0 16px 34px var(--secondary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 14%, transparent)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* ── Header ── */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${result.schemeName} — click to ${open ? "collapse" : "expand"}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "14px 16px",
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--secondary) 10%, transparent), color-mix(in srgb, var(--secondary) 4%, transparent))",
          borderBottom: open
            ? "1px solid color-mix(in srgb, var(--secondary) 14%, var(--accent) 86%)"
            : "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            {result.schemeName}
          </span>
          <EligibilityBadge eligible={result.eligible} size="sm" />
        </div>
        <ChevronDown
          size={16}
          color="var(--text)"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </button>

      {/* ── Body ── */}
      {open && (
        <div
          style={{
            padding: "0 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Reason / summary */}
          {result.reason && (
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: "var(--text)",
                margin: 0,
              }}
            >
              {result.reason}
            </p>
          )}

          {/* Benefits Table */}
          {result.benefits && <BenefitsTable rawBenefits={result.benefits} />}

          {/* Documents Checklist */}
          {hasDocs && (
            <DocumentsList
              documents={result.documents}
              onAcknowledged={() => setDocsAcknowledged(true)}
            />
          )}

          {/* Render remaining sections only when documents are ready/acknowledged */}
          {docsAcknowledged && (
            <>
              {/* Next Steps */}
              {result.nextSteps && result.nextSteps.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--muted)",
                      margin: "0 0 8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    📋 {i.schemeCard.nextSteps}
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {result.nextSteps.map((step, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          fontSize: 13,
                          color: "var(--text)",
                        }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 99,
                            background:
                              "color-mix(in srgb, var(--primary) 16%, transparent)",
                            color: "var(--primary)",
                            fontSize: 10,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Tutorial */}
              <VideoTutorial schemeName={result.schemeName} />

              {/* Application Steps — auto-fetched from Pinecone */}
              <ApplicationStepsCard
                schemeId={result.schemeId}
                schemeName={result.schemeName}
              />

              {/* CSC Toggle */}
              <button
                onClick={() => setShowCSC((p) => !p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "8px 0",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                📍 {showCSC ? i.csc.hide : i.csc.findCscCentre}
              </button>
              {showCSC && <CSCLocator district={district} state={state} />}

              {/* Metadata Row: Confidence & Verified */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 16,
                  marginBottom: 16,
                  padding: "12px 14px",
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 84%, var(--secondary) 16%), color-mix(in srgb, var(--surface) 94%, var(--secondary) 6%))",
                  borderRadius: 12,
                  border:
                    "1px solid color-mix(in srgb, var(--secondary) 20%, transparent)",
                  boxShadow:
                    "0 10px 22px var(--secondary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 12%, transparent)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck
                    size={16}
                    color={
                      result.confidence === "High"
                        ? "var(--primary)"
                        : result.confidence === "Medium"
                          ? "var(--warning)"
                          : "var(--danger)"
                    }
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {result.confidence} {i.schemeCard.confidence}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "var(--text)",
                  }}
                >
                  <Globe size={12} />
                  <a
                    href={result.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--primary)", textDecoration: "none" }}
                  >
                    {i.schemeCard.verified(result.lastVerified)}
                  </a>
                </div>
              </div>

              {/* Action Row */}
              <div style={{ display: "flex", gap: 10 }}>
                <PDFDownload
                  schemeName={result.schemeName}
                  summary={result.reason}
                  documents={result.documents}
                  nextSteps={result.nextSteps}
                  benefits={result.benefits}
                />
                <a
                  href={result.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Official site for ${result.schemeName}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "11px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--muted)",
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--surface-alt) 84%, var(--secondary) 16%), color-mix(in srgb, var(--surface) 94%, var(--secondary) 6%))",
                    border:
                      "1px solid color-mix(in srgb, var(--secondary) 26%, transparent)",
                    borderRadius: 12,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    boxShadow:
                      "0 8px 18px var(--secondary-glow), inset 0 1px 0 color-mix(in srgb, var(--accent) 12%, transparent)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.color = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--secondary)";
                    e.currentTarget.style.color = "var(--muted)";
                  }}
                >
                  <ExternalLink size={14} /> {i.schemeCard.officialSite}
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(EligibilityCard);
