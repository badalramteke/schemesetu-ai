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
    bg: "var(--success-soft)",
    color: "var(--primary)",
    border: "var(--secondary)",
  },
  false: {
    Icon: XCircle,
    text: "Not Eligible",
    bg: "var(--danger-soft)",
    color: "var(--danger)",
    border: "var(--danger)",
  },
  null: {
    Icon: AlertTriangle,
    text: "Maybe Eligible",
    bg: "var(--warning-soft)",
    color: "var(--warning)",
    border: "var(--warning)",
  },
};

export default function EligibilityBadge({
  eligible,
  size = "md",
}: EligibilityBadgeProps) {
  const key =
    eligible === true ? "true" : eligible === false ? "false" : "null";
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
