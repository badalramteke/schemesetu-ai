"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Search, Wheat, HeartPulse, Home as HomeIcon, HardHat, Ribbon, GraduationCap, MessageCircle } from "lucide-react";

const SECTORS = [
  { icon: Wheat, label: "Agriculture", query: "agriculture and farming", color: "#27AE60" },
  { icon: HeartPulse, label: "Healthcare", query: "health and medical", color: "#3498DB" },
  { icon: HomeIcon, label: "Housing", query: "housing and shelter", color: "#F39C12" },
  { icon: HardHat, label: "Employment", query: "employment and work", color: "#E74C3C" },
  { icon: Ribbon, label: "Pension", query: "pension and retirement", color: "#9B59B6" },
  { icon: GraduationCap, label: "Education", query: "education and skills", color: "#2980B9" },
];

export default function HomeDashboard() {
  const { setCurrentView, setChatPrefilledQuery, userProfile } = useApp();

  const go = (query: string) => { setChatPrefilledQuery(`Tell me about ${query} schemes I might be eligible for`); setCurrentView("chat"); };

  return (
    <div style={{ padding: "24px 20px 120px", background: "#fff", minHeight: "calc(100dvh - 56px)" }}>
      <div style={{ marginBottom: 20, animation: "fadeInUp 0.3s ease-out" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
          {userProfile.name ? `Namaste, ${userProfile.name}! 🙏` : "Namaste! 🙏"}
        </h2>
        <p style={{ fontSize: 14, color: "#888", marginTop: 4 }}>Which scheme are you looking for?</p>
      </div>

      <div style={{ marginBottom: 24, animation: "fadeInUp 0.3s ease-out 0.1s both" }}>
        <div style={{ position: "relative" }}>
          <Search size={18} color="#aaa" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text" placeholder="Search schemes..."
            onFocus={() => { setChatPrefilledQuery(""); setCurrentView("chat"); }}
            style={{ width: "100%", padding: "14px 16px 14px 44px", fontSize: 14, color: "#1a1a2e", background: "#f8f8fc", border: "1px solid #e8e8f0", borderRadius: 99, outline: "none" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, animation: "fadeInUp 0.3s ease-out 0.2s both" }}>
        {SECTORS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label} onClick={() => go(s.query)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, background: "#f8f8fc", border: "1px solid #e8e8f0", borderRadius: 20, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e8e8f0"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={26} color={s.color} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{s.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => { setChatPrefilledQuery(""); setCurrentView("chat"); }}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 20,
          display: "flex", alignItems: "center", gap: 8, padding: "14px 20px",
          fontSize: 14, fontWeight: 700, color: "#fff", background: "#910A67",
          border: "none", borderRadius: 99, cursor: "pointer",
          boxShadow: "0 8px 32px rgba(145,10,103,0.3)", animation: "pulseGlow 2s infinite",
        }}
      >
        <MessageCircle size={20} /> Buddy Ask ME!!
      </button>
    </div>
  );
}
