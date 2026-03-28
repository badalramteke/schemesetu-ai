"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatQuestion {
  id: string;
  text: string;
  messageIndex: number;
}

interface Props {
  chatHistory: ChatQuestion[];
  onSelectQuestion: (messageIndex: number) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  totalMessages: number;
  onScrubStateChange?: (scrubbing: boolean) => void;
}

const ACCENT = "var(--primary)";

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuestionJumper({
  chatHistory,
  onSelectQuestion,
  scrollContainerRef,
  totalMessages,
  onScrubStateChange,
}: Props) {
  const [thumbTop, setThumbTop] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubIndex, setScrubIndex] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrubIndexRef = useRef(0); // Ref to avoid stale closure in global listeners

  // Keep ref in sync
  useEffect(() => {
    scrubIndexRef.current = scrubIndex;
  }, [scrubIndex]);

  // ── Sync thumb with scroll ──
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (scrubbing) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight) {
        setThumbTop(0);
        return;
      }
      const trackH = trackRef.current?.clientHeight || 200;
      const thumbH = 40;
      setThumbTop(
        (scrollTop / (scrollHeight - clientHeight)) * (trackH - thumbH),
      );
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef, totalMessages, scrubbing]);

  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    [],
  );

  // Notify parent of scrub state
  useEffect(() => {
    onScrubStateChange?.(scrubbing);
  }, [scrubbing, onScrubStateChange]);

  // ── Press start on thumb ──
  const onDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      holdTimer.current = setTimeout(() => {
        const el = scrollContainerRef.current;
        let idx = 0;
        if (el && chatHistory.length > 0) {
          const ratio =
            el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
          idx = Math.round(ratio * (chatHistory.length - 1));
        }
        setScrubIndex(idx);
        scrubIndexRef.current = idx;
        setScrubbing(true);
      }, 200);
    },
    [chatHistory, scrollContainerRef],
  );

  // ── Global move/up while scrubbing ──
  useEffect(() => {
    if (!scrubbing) return;

    const calcIndex = (y: number) => {
      const trackEl = trackRef.current;
      if (!trackEl || chatHistory.length === 0) return 0;
      const rect = trackEl.getBoundingClientRect();
      const relY = Math.max(0, Math.min(y - rect.top, rect.height));
      return Math.max(
        0,
        Math.min(
          chatHistory.length - 1,
          Math.round((relY / rect.height) * (chatHistory.length - 1)),
        ),
      );
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;
      const idx = calcIndex(y);
      setScrubIndex(idx);
      scrubIndexRef.current = idx;
    };

    const onUp = () => {
      const q = chatHistory[scrubIndexRef.current];
      if (q) onSelectQuestion(q.messageIndex);
      setScrubbing(false);
      if (holdTimer.current) clearTimeout(holdTimer.current);
    };

    window.addEventListener("mousemove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [scrubbing, chatHistory, onSelectQuestion]);

  // ── Positions (no transitions during scrub for zero lag) ──
  const [trackH, setTrackH] = useState(300);

  useEffect(() => {
    if (trackRef.current) {
      setTrackH(trackRef.current.clientHeight);
    }
  }, [scrubbing]);

  const dotY =
    chatHistory.length > 1
      ? (scrubIndex / (chatHistory.length - 1)) * (trackH - 16) + 8
      : trackH / 2;

  const prev = scrubIndex > 0 ? chatHistory[scrubIndex - 1] : null;
  const curr = chatHistory[scrubIndex] || null;
  const next =
    scrubIndex < chatHistory.length - 1 ? chatHistory[scrubIndex + 1] : null;

  if (chatHistory.length < 2) return null;

  return (
    <>
      {/* Dark overlay when scrubbing */}
      {scrubbing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 8,
            background: "rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Track */}
      <div
        ref={trackRef}
        style={{
          position: "absolute",
          top: 4,
          right: 2,
          bottom: 4,
          width: 20,
          zIndex: 12,
        }}
      >
        {/* Track line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 7,
            width: 3,
            borderRadius: 99,
            background: scrubbing
              ? "rgba(68, 167, 84, 0.3)"
              : "rgba(68, 167, 84, 0.08)",
          }}
        />

        {/* Thumb (when NOT scrubbing) */}
        {!scrubbing && (
          <div
            onMouseDown={onDown}
            onTouchStart={onDown}
            style={{
              position: "absolute",
              top: thumbTop,
              right: -1,
              width: 20,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(180deg, ${ACCENT}, var(--primary))`,
              cursor: "grab",
              touchAction: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(68, 167, 84, 0.25)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div
                style={{
                  width: 8,
                  height: 1.5,
                  borderRadius: 99,
                  background:
                    "color-mix(in srgb, var(--accent) 50%, transparent)",
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 1.5,
                  borderRadius: 99,
                  background:
                    "color-mix(in srgb, var(--accent) 50%, transparent)",
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 1.5,
                  borderRadius: 99,
                  background:
                    "color-mix(in srgb, var(--accent) 50%, transparent)",
                }}
              />
            </div>
          </div>
        )}

        {/* Scrubbing: dot + cards — NO transitions for zero-lag on mobile */}
        {scrubbing && (
          <>
            {/* Glowing dot */}
            <div
              style={{
                position: "absolute",
                top: dotY - 7,
                right: 3,
                width: 14,
                height: 14,
                borderRadius: 99,
                background: ACCENT,
                boxShadow: `0 0 10px ${ACCENT}`,
                zIndex: 5,
              }}
            />

            {/* Previous */}
            {prev && (
              <div
                style={{
                  position: "absolute",
                  top: dotY - 68,
                  right: 28,
                  width: 170,
                  padding: "5px 10px",
                  background: "var(--surface-alt)",
                  borderRadius: 10,
                  border: "1px solid rgba(68, 167, 84, 0.25)",
                  opacity: 0.55,
                  zIndex: 5,
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    color: "color-mix(in srgb, var(--accent) 35%, transparent)",
                    fontWeight: 700,
                  }}
                >
                  Q{scrubIndex}
                </span>
                <p
                  style={{
                    fontSize: 10,
                    color: "color-mix(in srgb, var(--accent) 45%, transparent)",
                    margin: "1px 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {prev.text}
                </p>
              </div>
            )}

            {/* Current (big) */}
            {curr && (
              <div
                style={{
                  position: "absolute",
                  top: dotY - 22,
                  right: 24,
                  width: 210,
                  padding: "8px 12px",
                  background: ACCENT,
                  borderRadius: 12,
                  border:
                    "1px solid color-mix(in srgb, var(--accent) 15%, transparent)",
                  boxShadow: `0 4px 20px rgba(68, 167, 84, 0.5)`,
                  zIndex: 6,
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    color: "color-mix(in srgb, var(--accent) 55%, transparent)",
                    fontWeight: 700,
                  }}
                >
                  Q{scrubIndex + 1} / {chatHistory.length}
                </span>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--accent)",
                    margin: "2px 0 0",
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {curr.text}
                </p>
              </div>
            )}

            {/* Next */}
            {next && (
              <div
                style={{
                  position: "absolute",
                  top: dotY + 30,
                  right: 28,
                  width: 170,
                  padding: "5px 10px",
                  background: "var(--surface-alt)",
                  borderRadius: 10,
                  border: "1px solid rgba(68, 167, 84, 0.25)",
                  opacity: 0.55,
                  zIndex: 5,
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    color: "color-mix(in srgb, var(--accent) 35%, transparent)",
                    fontWeight: 700,
                  }}
                >
                  Q{scrubIndex + 2}
                </span>
                <p
                  style={{
                    fontSize: 10,
                    color: "color-mix(in srgb, var(--accent) 45%, transparent)",
                    margin: "1px 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {next.text}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
