"use client";

import React, { useState } from "react";
import { ChevronDown, ExternalLink, Globe, ShieldCheck } from "lucide-react";
import type { EligibilityResult } from "@/lib/rag-pipeline";
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

export default function EligibilityCard({
  result,
  index,
  district,
  state,
}: EligibilityCardProps) {
  const [open, setOpen] = useState(true);
  const [showCSC, setShowCSC] = useState(false);

  // If no documents are required, they are implicitly acknowledged.
  const hasDocs = result.documents && result.documents.length > 0;
  const [docsAcknowledged, setDocsAcknowledged] = useState(!hasDocs);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8f0",
        borderRadius: 16,
        overflow: "hidden",
        animation: `fadeInUp 0.35s ease-out ${index * 0.12}s both`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
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
          background: "transparent",
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
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>
            {result.schemeName}
          </span>
          <EligibilityBadge eligible={result.eligible} size="sm" />
        </div>
        <ChevronDown
          size={16}
          color="#aaa"
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
                color: "#555",
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
                      color: "#999",
                      margin: "0 0 8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    📋 Next Steps
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
                          color: "#555",
                        }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 99,
                            background: "rgba(145,10,103,0.08)",
                            color: "#910A67",
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
                  color: "#888",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                📍 {showCSC ? "Hide" : "Find nearest CSC centre"}
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
                  background: "#f8f8fc",
                  borderRadius: 12,
                  border: "1px solid #e8e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck
                    size={16}
                    color={
                      result.confidence === "High"
                        ? "#27AE60"
                        : result.confidence === "Medium"
                          ? "#F39C12"
                          : "#E74C3C"
                    }
                  />
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: "#555" }}
                  >
                    {result.confidence} Confidence
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "#888",
                  }}
                >
                  <Globe size={12} />
                  <a
                    href={result.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#910A67", textDecoration: "none" }}
                  >
                    Verified {result.lastVerified}
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
                    color: "#777",
                    background: "#fff",
                    border: "1.5px solid #e8e8f0",
                    borderRadius: 12,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#910A67";
                    e.currentTarget.style.color = "#910A67";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e8e8f0";
                    e.currentTarget.style.color = "#777";
                  }}
                >
                  <ExternalLink size={14} /> Official Site
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
