"use client";

import React, { useState } from "react";
import { MapPin, Phone, Clock, ExternalLink, Navigation, CalendarCheck, User, Send } from "lucide-react";

interface CSCLocatorProps {
  /** User's district/state from profile, used to prefill search */
  district?: string;
  state?: string;
}

interface NearestCSCData {
  name: string;
  address: string;
  whatsapp?: string;
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

  // --- Locate state ---
  const [locating, setLocating] = useState(false);
  const [nearestCSC, setNearestCSC] = useState<NearestCSCData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");

  // --- Booking state ---
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingScheme, setBookingScheme] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Step 1: Locate nearest CSC
  const handleLocate = async () => {
    setLocating(true);
    setErrorMsg("");
    setNearestCSC(null);
    setGoogleMapsLink("");
    setShowBookingForm(false);
    setBookingSuccess(false);

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              action: "locate", // Only locate, don't book
            }),
          });

          if (!res.ok) throw new Error("Failed to find nearest CSC");

          const data = await res.json();
          setNearestCSC(data.csc);
          setGoogleMapsLink(data.googleMapsLink);
          setExpanded(false);
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

  // Step 2: Book appointment (send user details via WhatsApp)
  const handleBook = async () => {
    if (!bookingName.trim() || !bookingPhone.trim()) {
      setBookingError("Please enter your name and phone number");
      return;
    }

    setBooking(true);
    setBookingError("");

    try {
      const res = await fetch("/api/csc/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "book",
          userName: bookingName.trim(),
          userPhone: bookingPhone.trim(),
          schemeInterest: bookingScheme.trim() || "General Enquiry",
          cscName: nearestCSC?.name || "Nearest CSC",
          cscAddress: nearestCSC?.address || "",
        }),
      });

      if (!res.ok) throw new Error("Booking request failed");

      setBookingSuccess(true);
      setShowBookingForm(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setBookingError(err.message);
      } else {
        setBookingError("An error occurred while booking");
      }
    } finally {
      setBooking(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    fontSize: 12,
    border: "1px solid var(--border)",
    borderRadius: 6,
    background: "var(--background)",
    color: "var(--text)",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
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

      {/* Locate Section */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={handleLocate}
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
            gap: "8px",
            fontFamily: "inherit",
          }}
        >
          <Navigation size={14} />
          {locating ? "Locating..." : "Find Nearest CSC"}
        </button>

        {errorMsg && (
          <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 8 }}>{errorMsg}</p>
        )}

        {/* Located CSC Result */}
        {nearestCSC && googleMapsLink && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: "rgba(68, 167, 84, 0.04)", border: "1px solid rgba(68, 167, 84, 0.15)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px", color: "var(--primary)" }}>📍 Nearest CSC Found!</p>
            <p style={{ fontSize: 13, margin: "0 0 2px", fontWeight: 600 }}>{nearestCSC.name}</p>
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px" }}>{nearestCSC.address}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: "var(--primary)",
                  color: "white",
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                <MapPin size={12} /> Open in Maps
              </a>

              {!bookingSuccess && (
                <button
                  onClick={() => { setShowBookingForm(true); setBookingError(""); }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <CalendarCheck size={12} /> Book Appointment
                </button>
              )}
            </div>

            {/* Booking Success */}
            {bookingSuccess && (
              <div style={{ marginTop: 10, padding: 10, borderRadius: 6, backgroundColor: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.25)" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", margin: "0 0 2px" }}>✅ Booking Confirmed!</p>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>A WhatsApp confirmation has been sent. The CSC will contact you shortly.</p>
              </div>
            )}

            {/* Booking Form */}
            {showBookingForm && !bookingSuccess && (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)" }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 10px", color: "var(--text)" }}>
                  <User size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                  Your Details for Booking
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 2, display: "block" }}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 2, display: "block" }}>Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 2, display: "block" }}>Scheme Interest (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. PM-KISAN, Ayushman Bharat"
                      value={bookingScheme}
                      onChange={(e) => setBookingScheme(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  {bookingError && (
                    <p style={{ color: "var(--danger)", fontSize: 11, margin: 0 }}>{bookingError}</p>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleBook}
                      disabled={booking}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: booking ? "not-allowed" : "pointer",
                        opacity: booking ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        fontFamily: "inherit",
                      }}
                    >
                      <Send size={12} />
                      {booking ? "Sending..." : "Confirm Booking"}
                    </button>
                    <button
                      onClick={() => setShowBookingForm(false)}
                      style={{
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--muted)",
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
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
