"use client";

import React from "react";

interface NavItemProps { icon: React.ReactNode; label: string; onClick?: () => void; }

export default function NavItem({ icon, label, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick} aria-label={label}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#555", background: "transparent", border: "none", borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f3f8"; e.currentTarget.style.color = "#910A67"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555"; }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
