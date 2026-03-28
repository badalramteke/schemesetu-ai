"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Globe,
  Building2,
  Smartphone,
  Loader2,
  MapPin,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Step {
  step: number;
  title: string;
  description: string;
}

interface StepChannel {
  title: string;
  steps: Step[];
}

interface StepsData {
  online: StepChannel | null;
  offline: StepChannel | null;
  atHospital?: StepChannel | null;
}

interface ApplicationStepsCardProps {
  schemeId: string;
  schemeName: string;
}

// ── Channel config ───────────────────────────────────────────────────────────

const CHANNEL_CONFIG = {
  online: {
    icon: Globe,
    color: "var(--channel-online)",
    bg: "var(--channel-online-soft)",
    border: "var(--channel-online-border)",
    gradient: "var(--channel-online-gradient)",
  },
  offline: {
    icon: Building2,
    color: "var(--channel-offline)",
    bg: "var(--channel-offline-soft)",
    border: "var(--channel-offline-border)",
    gradient: "var(--channel-offline-gradient)",
  },
  atHospital: {
    icon: MapPin,
    color: "var(--channel-hospital)",
    bg: "var(--warning-soft)",
    border: "var(--channel-hospital-border)",
    gradient: "var(--channel-hospital-gradient)",
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function ApplicationStepsCard({
  schemeId,
  schemeName,
}: ApplicationStepsCardProps) {
  const [steps, setSteps] = useState<StepsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSteps() {
      try {
        const res = await fetch("/api/schemes/steps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schemeId, schemeName }),
        });

        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled) {
          setSteps(data);
          // Auto-expand the first available channel
          if (data.online) setExpandedChannel("online");
          else if (data.offline) setExpandedChannel("offline");
          else if (data.atHospital) setExpandedChannel("atHospital");
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSteps();
    return () => {
      cancelled = true;
    };
  }, [schemeId, schemeName]);

  if (error) return null; // Silently hide if fetch fails

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px",
          background: "var(--surface)",
          border: "1px solid var(--secondary)",
          borderRadius: 14,
          marginTop: 8,
        }}
      >
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <Loader2
          size={16}
          color="var(--primary)"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <span style={{ fontSize: 13, color: "var(--text)" }}>
          Loading application process…
        </span>
      </div>
    );
  }

  if (!steps || (!steps.online && !steps.offline && !steps.atHospital)) {
    return null;
  }

  const channels = (["online", "offline", "atHospital"] as const).filter(
    (key) => steps[key],
  );

  const toggleChannel = (key: string) => {
    setExpandedChannel((prev) => (prev === key ? null : key));
  };

  return (
    <div
      style={{
        marginTop: 10,
        background: "var(--surface)",
        border: "1px solid var(--secondary)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderBottom: "1px solid var(--secondary)",
        }}
      >
        <Smartphone size={15} color="var(--primary)" />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--primary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          How to Apply — Step by Step
        </span>
      </div>

      {/* Channel accordions */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {channels.map((channelKey, idx) => {
          const channel = steps[channelKey]!;
          const config = CHANNEL_CONFIG[channelKey];
          const Icon = config.icon;
          const isOpen = expandedChannel === channelKey;
          const isLast = idx === channels.length - 1;

          return (
            <div
              key={channelKey}
              style={{
                borderBottom: isLast ? "none" : "1px solid var(--secondary)",
              }}
            >
              {/* Channel header button */}
              <button
                onClick={() => toggleChannel(channelKey)}
                aria-expanded={isOpen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "12px 16px",
                  background: isOpen ? config.bg : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: config.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} color="var(--accent)" />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isOpen ? config.color : "var(--text)",
                    }}
                  >
                    {channel.title}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text)",
                      background: "var(--surface-alt)",
                      padding: "2px 8px",
                      borderRadius: 99,
                    }}
                  >
                    {channel.steps.length} steps
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  color="var(--text)"
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Steps timeline */}
              {isOpen && (
                <div
                  style={{
                    padding: "4px 16px 16px",
                    background: config.bg,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0,
                      position: "relative",
                    }}
                  >
                    {channel.steps.map((step, i) => {
                      const isLastStep = i === channel.steps.length - 1;

                      return (
                        <div
                          key={step.step}
                          style={{
                            display: "flex",
                            gap: 12,
                            position: "relative",
                            paddingBottom: isLastStep ? 0 : 16,
                          }}
                        >
                          {/* Timeline line */}
                          {!isLastStep && (
                            <div
                              style={{
                                position: "absolute",
                                left: 13,
                                top: 28,
                                bottom: 0,
                                width: 2,
                                background: config.border,
                              }}
                            />
                          )}

                          {/* Step number circle */}
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 99,
                              background: "var(--background)",
                              border: `2px solid ${config.color}`,
                              color: config.color,
                              fontSize: 11,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              zIndex: 1,
                            }}
                          >
                            {step.step}
                          </div>

                          {/* Step content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--text)",
                                margin: "3px 0 4px",
                                lineHeight: 1.3,
                              }}
                            >
                              {step.title}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--muted)",
                                margin: 0,
                                lineHeight: 1.6,
                              }}
                            >
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
