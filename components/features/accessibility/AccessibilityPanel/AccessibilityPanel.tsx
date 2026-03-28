"use client";

import React, { useState } from "react";
import { Settings2, Type, Sun, X, Minus, Plus } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

export default function AccessibilityPanel() {
  const { fontSize, setFontSize, highContrast, setHighContrast } = useApp();
  const [open, setOpen] = useState(false);

  const adjustFont = (delta: number) => {
    const clamped = Math.min(22, Math.max(12, fontSize + delta));
    setFontSize(clamped);
  };

  const resetFont = () => setFontSize(16);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="Open accessibility settings"
        aria-expanded={open}
        style={{
          position: "fixed",
          bottom: 90,
          right: 16,
          zIndex: 60,
          width: 40,
          height: 40,
          borderRadius: 12,
          border: "1px solid var(--secondary)",
          background: "var(--background)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: open ? "var(--primary)" : "var(--text)",
          transition: "all 0.2s",
        }}
      >
        <Settings2 size={16} />
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility settings"
          style={{
            position: "fixed",
            bottom: 138,
            right: 16,
            zIndex: 60,
            width: 240,
            background: "var(--background)",
            border: "1px solid var(--secondary)",
            borderRadius: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            animation: "fadeInUp 0.2s ease-out",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text)",
                margin: 0,
              }}
            >
              Accessibility
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close accessibility panel"
              style={{
                width: 24,
                height: 24,
                borderRadius: 99,
                border: "none",
                background: "var(--surface)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text)",
              }}
            >
              <X size={12} />
            </button>
          </div>

          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Text size */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <Type size={13} color="var(--primary)" />
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  Text Size
                </p>
                <button
                  onClick={resetFont}
                  aria-label="Reset text size"
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    color: "var(--muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Reset
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => adjustFont(-1)}
                  disabled={fontSize <= 12}
                  aria-label="Decrease text size"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 99,
                    border: "1px solid var(--secondary)",
                    background: "var(--background)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: fontSize <= 12 ? "var(--muted)" : "var(--text)",
                    opacity: fontSize <= 12 ? 0.5 : 1,
                  }}
                >
                  <Minus size={14} />
                </button>

                {/* Size preview bar */}
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 99,
                    background: "var(--surface)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${((fontSize - 12) / (22 - 12)) * 100}%`,
                      background:
                        "linear-gradient(90deg, var(--primary), var(--primary))",
                      borderRadius: 99,
                      transition: "width 0.2s",
                    }}
                  />
                </div>

                <button
                  onClick={() => adjustFont(1)}
                  disabled={fontSize >= 22}
                  aria-label="Increase text size"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 99,
                    border: "1px solid var(--secondary)",
                    background: "var(--background)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: fontSize >= 22 ? "var(--muted)" : "var(--text)",
                    opacity: fontSize >= 22 ? 0.5 : 1,
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
              <p
                style={{
                  fontSize: 10,
                  color: "var(--text)",
                  textAlign: "center",
                  margin: "4px 0 0",
                  fontFamily: "inherit",
                }}
              >
                {fontSize}px
              </p>
            </div>

            {/* High contrast */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Sun size={13} color="var(--primary)" />
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  High Contrast
                </p>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                role="switch"
                aria-checked={highContrast}
                aria-label="Toggle high contrast mode"
                style={{
                  width: 42,
                  height: 24,
                  borderRadius: 99,
                  border: "none",
                  background: highContrast
                    ? "var(--primary)"
                    : "var(--secondary)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.3s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: highContrast ? 21 : 3,
                    width: 18,
                    height: 18,
                    borderRadius: 99,
                    background: "var(--background)",
                    transition: "left 0.3s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
