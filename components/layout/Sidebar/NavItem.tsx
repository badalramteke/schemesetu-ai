"use client";

import React from "react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export default function NavItem({ icon, label, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "12px 16px",
        fontSize: 14,
        fontWeight: 500,
        color: "var(--text)",
        background: "transparent",
        border: "none",
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--primary-soft)";
        e.currentTarget.style.color = "var(--primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text)";
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
