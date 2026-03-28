"use client";

import React, { useState } from "react";
import { Download, CheckCircle2, FileText, Loader2 } from "lucide-react";

interface PDFDownloadProps {
  schemeName: string;
  summary?: string;
  documents?: string[];
  nextSteps?: string[];
  benefits?: string;
  district?: string;
  state?: string;
  userProfile?: { age?: number; gender?: string; employment?: string };
}

export default function PDFDownload({
  schemeName,
  summary,
  documents = [],
  nextSteps = [],
  benefits,
  district,
  state,
  userProfile,
}: PDFDownloadProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleDownload = async () => {
    if (status !== "idle") return;
    setStatus("loading");

    const root = getComputedStyle(document.documentElement);
    const theme = {
      text: root.getPropertyValue("--text").trim() || "#f5f5f3",
      background: root.getPropertyValue("--background").trim() || "#010402",
      primary: root.getPropertyValue("--primary").trim() || "#44a754",
      secondary: root.getPropertyValue("--secondary").trim() || "#1fc7e0",
      accent: root.getPropertyValue("--accent").trim() || "#ffffff",
      muted: root.getPropertyValue("--muted").trim() || "#9cb0a5",
      border:
        root.getPropertyValue("--border").trim() || "rgba(31, 199, 224, 0.35)",
      warning: root.getPropertyValue("--warning").trim() || "#f0aa49",
      warningSoft:
        root.getPropertyValue("--warning-soft").trim() ||
        "rgba(240, 170, 73, 0.16)",
    };

    // Generate QR API URL (using goqr.me API for simplicity as purely frontend solution)
    const portalUrl = encodeURIComponent(
      `https://www.india.gov.in/search/site/${encodeURIComponent(schemeName)}`,
    );
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${portalUrl}`;
    const cscQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://locator.csccloud.in/`;

    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>SchemeSetu_${schemeName.replace(/\\s+/g, "_")}_${new Date().toISOString().split("T")[0]}</title>
  <style>
    :root { --text: ${theme.text}; --background: ${theme.background}; --primary: ${theme.primary}; --secondary: ${theme.secondary}; --accent: ${theme.accent}; --muted: ${theme.muted}; --border: ${theme.border}; --warning: ${theme.warning}; --warning-soft: ${theme.warningSoft}; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: var(--text); font-size: 14px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid var(--primary); padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: var(--primary); font-size: 28px; margin: 0 0 8px; }
    .header p { color: var(--muted); margin: 0; font-size: 16px; }
    .user-box { background: var(--background); border: 1px solid var(--secondary); border-radius: 8px; padding: 16px; margin-bottom: 30px; display: flex; gap: 24px; }
    .user-box div { flex: 1; }
    .user-box strong { display: block; font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em; margin-bottom: 4px; }
    h2 { font-size: 16px; color: var(--primary); margin: 30px 0 12px; display: flex; align-items: center; gap: 8px; }
    h2::before { content: ""; display: block; width: 4px; height: 16px; background: var(--primary); border-radius: 4px; }
    .badge { display:inline-block; background:var(--primary); color:var(--accent); padding:4px 12px; border-radius:99px; font-size:12px; font-weight:700; margin-bottom:16px; }
    ul { padding-left: 20px; margin: 0; }
    li { margin-bottom: 8px; padding-left: 8px; }
    .step { display:flex; gap:12px; margin-bottom:12px; background: var(--background); padding: 12px; border: 1px solid var(--border); border-radius: 8px; }
    .num { background:var(--primary); color:var(--accent); width:24px; height:24px; border-radius:99px; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
    .benefits { background:var(--warning-soft); border:1px solid var(--warning); border-radius:8px; padding:16px; font-size: 15px; color: var(--text); font-weight: 500; }
    .csc-box { background: var(--background); border: 1px solid var(--secondary); border-radius: 8px; padding: 16px; margin-top: 20px; display: flex; align-items: center; justify-content: space-between;}
    .qr-grid { display: flex; gap: 24px; margin-top: 40px; padding-top: 30px; border-top: 1px dashed var(--border); }
    .qr-card { text-align: center; font-size: 12px; color: var(--text); }
    .qr-card img { width: 100px; height: 100px; border: 1px solid var(--border); padding: 4px; border-radius: 8px; margin-bottom: 8px; }
    footer { margin-top:50px; font-size:12px; color:var(--muted); text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SchemeSetu — Application Pack</h1>
    <p>Your personalized guide for requesting government benefits</p>
  </div>

  <div class="user-box">
    <div><strong>Applicant Profile</strong>${userProfile?.age ? userProfile.age + " yrs" : "-"}, ${userProfile?.gender || "-"}</div>
    <div><strong>Location</strong>${district || ""}${district && state ? ", " : ""}${state || "-"}</div>
    <div><strong>Occupation</strong>${userProfile?.employment || "-"}</div>
  </div>

  <div class="badge">Eligible Match</div>
  <h2>${schemeName}</h2>
  ${summary ? `<p style="font-size: 15px; color: var(--text);">${summary}</p>` : ""}
  
  ${benefits ? `<h2>Benefits</h2><div class="benefits">💰 ${benefits}</div>` : ""}
  
  ${
    documents.length > 0
      ? `<h2>Required Documents</h2>
    <p style="font-size: 12px; color: var(--muted); margin-bottom: 12px;"><i>Note: If you are missing any of these, ask your local CSC center or Panchayat office for help obtaining them.</i></p>
    <ul>${documents.map((d) => `<li>${d}</li>`).join("")}</ul>`
      : ""
  }
  
  ${nextSteps.length > 0 ? `<h2>Step-by-Step Instructions</h2>${nextSteps.map((s, i) => `<div class="step"><span class="num">${i + 1}</span><span>${s}</span></div>`).join("")}` : ""}

  <div class="csc-box">
    <div>
      <h3 style="margin: 0 0 4px; color: var(--primary); font-size: 15px;">Need offline help?</h3>
      <p style="margin: 0; color: var(--text); font-size: 13px;">Visit your nearest Common Service Centre (CSC) in ${district || "your area"}. They can fill the application for you for a nominal fee (approx ₹30-50).</p>
    </div>
  </div>

  <div class="qr-grid">
    <div class="qr-card">
      <img src="${qrUrl}" alt="Official Portal QR" />
      <div>Scan for Official Portal</div>
    </div>
    <div class="qr-card">
      <img src="${cscQrUrl}" alt="CSC Locator QR" />
      <div>Scan to Find CSC on Map</div>
    </div>
  </div>

  <footer>
    Document generated securely on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} by SchemeSetu AI.<br/>
    For the most up-to-date and official information, please verify at india.gov.in.
  </footer>
</body>
</html>`;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          win.print();
          URL.revokeObjectURL(url);
        }, 500);
      };
    }

    setTimeout(() => setStatus("done"), 1200);
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={status === "loading"}
      aria-label={`Download PDF summary for ${schemeName}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "11px 20px",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--accent)",
        background:
          status === "done"
            ? "var(--primary)"
            : "linear-gradient(135deg, var(--primary), var(--primary))",
        border: "none",
        borderRadius: 12,
        cursor: status === "loading" ? "wait" : "pointer",
        transition: "all 0.3s",
        fontFamily: "inherit",
        boxShadow: "0 2px 8px rgba(68, 167, 84, 0.25)",
        flex: 1,
        opacity: status === "loading" ? 0.8 : 1,
      }}
    >
      {status === "loading" && (
        <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
      )}
      {status === "done" && <CheckCircle2 size={15} />}
      {status === "idle" && <FileText size={15} />}

      {status === "loading"
        ? "Preparing…"
        : status === "done"
          ? "Opened!"
          : "Download Application Pack"}
      {status === "idle" && <Download size={13} style={{ opacity: 0.8 }} />}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
