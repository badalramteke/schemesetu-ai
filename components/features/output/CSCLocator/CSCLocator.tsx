"use client";

import React, { useState } from "react";
import { MapPin, Phone, Clock, ExternalLink, Navigation } from "lucide-react";

interface CSCLocatorProps {
  /** User's district/state from profile, used to prefill search */
  district?: string;
  state?: string;
}

const SAMPLE_CSCS = [
  {
    name: "CSC Centre — Gram Panchayat Office",
    address: "Near Hanuman Mandir, Wardha Road",
    timing: "Mon–Sat, 9am–5pm",
    phone: "1800-3000-3468",
  },
  {
    name: "Jan Seva Kendra",
    address: "Main Market, Opp. Bank of Maharashtra",
    timing: "Mon–Sat, 10am–4pm",
    phone: "1800-111-555",
  },
];

export default function CSCLocator({ district, state }: CSCLocatorProps) {
  const [expanded, setExpanded] = useState(false);

  const locationStr =
    [district, state].filter(Boolean).join(", ") || "your area";
  const mapsQuery = encodeURIComponent(`Common Service Centre ${locationStr}`);
  const mapsUrl = `https://www.google.com/maps/search/${mapsQuery}`;

  const [locating, setLocating] = useState(false);
  const [nearestCSC, setNearestCSC] = useState<{name: string, address: string} | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");

  const handleLocateAndBook = async () => {
    setLocating(true);
    setErrorMsg("");
    setNearestCSC(null);
    setGoogleMapsLink("");

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch("/api/csc/book", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to find nearest CSC");
          }

          const data = await res.json();
          setNearestCSC(data.csc);
          setGoogleMapsLink(data.googleMapsLink);
          setExpanded(false); // Collapse sample list if success
        } catch (err: unknown) {
          if (err instanceof Error) {
            setErrorMsg(err.message);
          } else {
            setErrorMsg("An error occurred");
          }
        } finally {
          setLocating(false);
        }
      },
      () => {
        setErrorMsg("Unable to retrieve your location");
        setLocating(false);
      }
    );
  };

  return (
    <div
      style={{
        border: "1px solid var(--secondary)",
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--background)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          background:
            "linear-gradient(135deg, rgba(68, 167, 84, 0.06), rgba(114,4,85,0.03))",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(68, 167, 84, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MapPin size={15} color="var(--primary)" />
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Nearest CSC Centre
          </p>
          <p style={{ fontSize: 11, color: "var(--text)", margin: 0 }}>
            Common Service Centres in {locationStr}
          </p>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Find CSC on Google Maps"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 10px",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--primary)",
            background: "rgba(68, 167, 84, 0.06)",
            border: "1px solid rgba(68, 167, 84, 0.2)",
            borderRadius: 99,
            textDecoration: "none",
          }}
        >
          <Navigation size={10} /> Find
        </a>
      </div>

      {/* Auto Booking Section */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={handleLocateAndBook}
          disabled={locating}
          style={{
            width: "100%",
            padding: "10px 12px",
            backgroundColor: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: locating ? "not-allowed" : "pointer",
            opacity: locating ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          {locating ? "Locating..." : "Find Nearest CSC & Book"}
        </button>

        {errorMsg && (
            <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 8 }}>{errorMsg}</p>
        )}

        {nearestCSC && googleMapsLink && (
           <div style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: "var(--success-soft)", border: "1px solid var(--success)" }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px", color: "var(--success-strong)" }}>Nearest CSC Found!</p>
              <p style={{ fontSize: 13, margin: "0 0 2px" }}>{nearestCSC.name}</p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 8px" }}>{nearestCSC.address}</p>
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: "var(--success)",
                  color: "white",
                  borderRadius: 6,
                  textDecoration: "none"
                }}
              >
                  Open in Google Maps
              </a>
           </div>
        )}
      </div>

      {/* CSC Card list */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {(expanded ? SAMPLE_CSCS : (nearestCSC ? [] : SAMPLE_CSCS.slice(0, 1))).map((csc, i) => (
          <div
            key={i}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text)",
                margin: "0 0 6px",
              }}
            >
              {csc.name}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 6 }}
              >
                <MapPin
                  size={11}
                  color="var(--text)"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    lineHeight: 1.4,
                  }}
                >
                  {csc.address}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={11} color="var(--text)" />
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {csc.timing}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={11} color="var(--text)" />
                <a
                  href={`tel:${csc.phone}`}
                  style={{
                    fontSize: 12,
                    color: "var(--primary)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {csc.phone}
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Toggle / Helpline */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!nearestCSC && (
            <button
              onClick={() => setExpanded((p) => !p)}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--primary)",
                background: "rgba(68, 167, 84, 0.05)",
                border: "1px solid rgba(68, 167, 84, 0.2)",
                borderRadius: 99,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {expanded ? "Show Less" : "Show More Centres"}
            </button>
          )}
          <a
            href="https://locator.csccloud.in/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text)",
              background: "var(--background)",
              border: "1px solid var(--secondary)",
              borderRadius: 99,
              textDecoration: "none",
            }}
          >
            <ExternalLink size={11} /> CSC Official Locator
          </a>
        </div>

        {/* Helpline */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            background: "var(--warning-soft)",
            border: "1px solid var(--warning)",
          }}
        >
          <p style={{ fontSize: 11, color: "var(--text)", margin: "0 0 2px" }}>
            📞 CSC Helpline (Toll-Free)
          </p>
          <a
            href="tel:18003000468"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--warning-strong)",
              textDecoration: "none",
            }}
          >
            1800-3000-0468
          </a>
        </div>
      </div>
    </div>
  );
}
