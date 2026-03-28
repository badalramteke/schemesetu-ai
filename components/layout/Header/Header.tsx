"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Menu, Plus } from "lucide-react";
import { t } from "@/lib/i18n";

export default function Header() {
  const { toggleSidebar, startNewChat, language } = useApp();
  const i = t(language).header;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        background: "color-mix(in srgb, var(--surface) 92%, transparent)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--secondary)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={toggleSidebar}
          aria-label="Menu"
          style={{
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          <Menu size={22} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background:
                "linear-gradient(135deg, var(--primary), var(--primary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            SchemeSetu
          </span>
        </div>
      </div>

      <button
        onClick={startNewChat}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--accent)",
          background: "var(--primary)",
          border: "none",
          borderRadius: 99,
          cursor: "pointer",
        }}
      >
        <Plus size={14} /> {i.newChat}
      </button>
    </header>
  );
}
