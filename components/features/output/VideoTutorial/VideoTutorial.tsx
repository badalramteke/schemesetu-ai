"use client";

import React, { useState } from "react";
import { PlayCircle, ExternalLink, Youtube } from "lucide-react";

interface VideoTutorialProps {
  schemeName: string;
  /** Optional YouTube video ID override. If not provided, opens a YouTube search. */
  videoId?: string;
}

export default function VideoTutorial({ schemeName, videoId }: VideoTutorialProps) {
  const [hover, setHover] = useState(false);

  const url = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(schemeName + " apply online tutorial")}`;

  const thumbUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch video tutorial for ${schemeName} on YouTube`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid #e8e8f0",
        background: hover ? "#fafafa" : "#fff",
        textDecoration: "none",
        transition: "all 0.2s",
        boxShadow: hover ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
        transform: hover ? "translateY(-1px)" : "none",
      }}
    >
      {/* Thumbnail or fallback red box */}
      <div style={{
        width: 56, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0,
        background: thumbUrl ? undefined : "linear-gradient(135deg, #FF0000, #cc0000)",
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
      }}>
        {thumbUrl
          ? <img src={thumbUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <Youtube size={20} color="#fff" />}
        {/* Play overlay */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.35)",
          opacity: hover ? 1 : 0.7, transition: "opacity 0.2s",
        }}>
          <PlayCircle size={20} color="#fff" />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e", margin: "0 0 2px", lineHeight: 1.4 }}>
          How to apply for {schemeName}
        </p>
        <p style={{ fontSize: 11, color: "#999", margin: 0 }}>Watch step-by-step tutorial</p>
      </div>

      <ExternalLink size={14} color="#bbb" style={{ flexShrink: 0 }} />
    </a>
  );
}
