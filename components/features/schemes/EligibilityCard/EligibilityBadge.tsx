"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

type EligibilityStatus = true | false | null;

interface EligibilityBadgeProps {
  eligible: EligibilityStatus;
  size?: "sm" | "md";
}

const CONFIG = {
  true: {
    Icon: CheckCircle2,
    text: "Eligible",
    bg: "#e8f8ef",
    color: "#27AE60",
    border: "#b8e6cc",
  },
  false: {
    Icon: XCircle,
    text: "Not Eligible",
    bg: "#fde8e8",
    color: "#E74C3C",
    border: "#f5c0c0",
  },
  null: {
    Icon: AlertTriangle,
    text: "Maybe Eligible",
    bg: "#fff5e6",
    color: "#E67E22",
    border: "#f5deb3",
  },
};

export default function EligibilityBadge({ eligible, size = "md" }: EligibilityBadgeProps) {
  const key = eligible === true ? "true" : eligible === false ? "false" : "null";
  const { Icon, text, bg, color, border } = CONFIG[key];

  const iconSize = size === "sm" ? 11 : 13;
  const fontSize = size === "sm" ? 10 : 12;
  const padding = size === "sm" ? "3px 8px" : "5px 12px";

  return (
    <span
      role="status"
      aria-label={`Eligibility status: ${text}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding,
        fontSize,
        fontWeight: 600,
        color,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 99,
        letterSpacing: "0.01em",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={iconSize} />
      {text}
    </span>
  );
}
