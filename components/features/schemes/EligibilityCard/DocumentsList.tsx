"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, FileText } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

interface DocumentsListProps {
  documents: string[];
  onAcknowledged?: () => void;
}

export default function DocumentsList({ documents, onAcknowledged }: DocumentsListProps) {
  const { userProfile } = useApp();
  
  // Pre-tick logic based on user profile or context
  const getInitialChecked = () => {
    const init: Record<number, boolean> = {};
    if (!documents) return init;
    
    documents.forEach((doc, i) => {
      const d = doc.toLowerCase();
      // If we already know their age, assume age proof is available
      if ((d.includes("age") || d.includes("aadhaar")) && userProfile?.age) init[i] = true;
      // If we know their location, assume identity/residence proof
      if ((d.includes("residence") || d.includes("domicile")) && userProfile?.state) init[i] = true;
      // If they are a farmer, assume they might have land records ready (heuristic)
      if (d.includes("land") && userProfile?.occupation === "farmer") init[i] = true;
    });
    return init;
  };

  const [checked, setChecked] = useState<Record<number, boolean>>(getInitialChecked());
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FileText size={13} color="#910A67" />
          <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: 0 }}>
            Documents Needed
          </p>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: allDone ? "#27AE60" : "#888",
          background: allDone ? "#e8f8ef" : "#f5f5f5",
          border: `1px solid ${allDone ? "#b8e6cc" : "#e8e8f0"}`,
          borderRadius: 99, padding: "2px 8px",
          transition: "all 0.3s",
        }}>
          {doneCount}/{total} ready
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 99, background: "#f0f0f0", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${(doneCount / total) * 100}%`,
          background: allDone ? "#27AE60" : "#910A67",
          borderRadius: 99,
          transition: "width 0.4s ease, background 0.3s",
        }} />
      </div>

      {/* Document Checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        {documents.map((doc, i) => {
          const isChecked = !!checked[i];
          
          let helperText = "Get this from a Common Service Centre (CSC) or local Gram Panchayat";
          const d = doc.toLowerCase();
          if (d.includes("aadhaar")) helperText = "Get this at your nearest Aadhaar Seva Kendra or apply at uidai.gov.in";
          else if (d.includes("land") || d.includes("khasra") || d.includes("khatauni") || d.includes("7/12")) helperText = "Get this from your Tehsildar office or State Revenue Department";
          else if (d.includes("income")) helperText = "Get this from the Tahsildar or local Revenue Office";
          else if (d.includes("caste")) helperText = "Apply at your local Tehsil or Common Service Centre (CSC)";
          else if (d.includes("bank") || d.includes("passbook") || d.includes("account")) helperText = "Visit your nearest bank branch to update your passbook";
          else if (d.includes("photo")) helperText = "Get this clicked at any local photography shop";
          else if (d.includes("ration")) helperText = "Apply at your local Food and Civil Supplies office or CSC";
          else if (d.includes("domicile") || d.includes("resident")) helperText = "Get this from the SDM/Tehsildar office or CSC";
          else if (d.includes("pan")) helperText = "Apply for a PAN card online via NSDL or at a PAN agency";

          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button
                onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                aria-label={`${isChecked ? "Unmark" : "Mark"} ${doc} as ready`}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: isChecked ? "1.5px solid #27AE60" : "1.5px solid #e8e8f0",
                  background: isChecked ? "#f0fdf4" : "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {isChecked
                  ? <CheckSquare size={18} color="#27AE60" style={{ flexShrink: 0 }} />
                  : <Square size={18} color="#cfcfcf" style={{ flexShrink: 0 }} />}
                <span style={{
                  fontSize: 14,
                  fontWeight: isChecked ? 600 : 500,
                  color: isChecked ? "#1f8b4c" : "#333",
                  lineHeight: 1.4,
                  transition: "all 0.2s",
                }}>
                  {doc}
                </span>
              </button>
              
              {!isChecked && (
                <p style={{ 
                  margin: "0 0 0 42px", 
                  fontSize: 11.5, 
                  color: "#888", 
                  lineHeight: 1.4,
                  fontStyle: "italic" 
                }}>
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
            color: "#fff",
            background: "#910A67",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#7A0856"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#910A67"}
        >
          I will manage the documents — Continue
        </button>
      )}

      {allDone && (
        <p style={{
          fontSize: 13, fontWeight: 600, color: "#27AE60",
          textAlign: "center", margin: "8px 0 0 0",
          background: "#e8f8ef", padding: "10px", borderRadius: 10,
          border: "1px solid #b8e6cc",
          animation: "fadeInUp 0.3s ease-out",
        }}>
          🎉 You have all documents ready! You can now apply.
        </p>
      )}
    </div>
  );
}
