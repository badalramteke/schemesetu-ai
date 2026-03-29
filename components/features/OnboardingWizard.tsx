"use client";

import React, { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import {
  Calendar,
  Users,
  MapPin,
  Briefcase,
  ArrowRight,
  SkipForward,
  ChevronDown,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { getDistricts } from "@/lib/constants/india-districts";

// ── Indian states list ────────────────────────────────────────────────────────

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
];

// ── Component ─────────────────────────────────────────────────────────────────

// ── Select wrapper (adds chevron icon) ────────────────────────────────────

const SelectWithChevron = ({
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  disabled?: boolean;
}) => (
  <div style={{ position: "relative" }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "14px 18px",
        fontSize: 15,
        color: "var(--text)",
        background: "var(--background)",
        border: "1.5px solid var(--secondary)",
        borderRadius: 14,
        outline: "none",
        fontFamily: "inherit",
        transition: "border-color 0.2s",
        appearance: "none" as const,
        cursor: disabled ? "not-allowed" : "pointer",
        paddingRight: 44,
        opacity: disabled ? 0.45 : 1,
        borderColor: value ? "var(--primary)" : "var(--secondary)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--primary)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = value
          ? "var(--primary)"
          : "var(--secondary)";
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown
      size={18}
      color={value ? "var(--primary)" : "var(--text)"}
      style={{
        position: "absolute",
        right: 14,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        transition: "color 0.2s",
      }}
    />
  </div>
);

export default function OnboardingWizard() {
  const { setHasCompletedOnboarding, userProfile, setUserProfile, language } =
    useApp();
  const i = t(language).onboarding;

  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 4;

  // ── Form State ──
  const [age, setAge] = useState(userProfile.age?.toString() || "");
  const [gender, setGender] = useState(userProfile.gender || "");
  const [stateName, setStateName] = useState(userProfile.state || "");
  const [district, setDistrict] = useState(userProfile.district || "");
  const [village, setVillage] = useState(userProfile.village || "");
  const [employment, setEmployment] = useState(userProfile.employment || "");

  // Dynamic districts based on state
  const districts = getDistricts(stateName);

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      const profile = {
        ...userProfile,
        age: parseInt(age),
        gender,
        state: stateName,
        district,
        village,
        employment,
      };
      setUserProfile(profile);
      setHasCompletedOnboarding(true);

      // Fire-and-forget: persist onboarding profile to Firestore for cross-device access
      (async () => {
        try {
          const { getOrCreateUserId, getProfileMemory, saveProfileMemory } =
            await import("@/lib/services/document-service");
          const userId = getOrCreateUserId();
          const existing = await getProfileMemory(userId);

          const mergedFacts: Record<string, string> =
            existing?.mergedFacts || {};
          if (age) mergedFacts.age = age;
          if (gender) mergedFacts.gender = gender;
          if (stateName) mergedFacts.state = stateName;
          if (district) mergedFacts.district = district;
          if (village) mergedFacts.village = village;
          if (employment) mergedFacts.employment = employment;

          await saveProfileMemory({
            userId,
            mergedFacts,
            fieldSources: existing?.fieldSources || {},
            missingFields: existing?.missingFields || [],
            documentRefs: existing?.documentRefs || [],
            lastUpdated: Date.now(),
          });
        } catch (e) {
          console.warn("Failed to persist onboarding profile:", e);
        }
      })();
    }
  };

  const skip = () => {
    setHasCompletedOnboarding(true);
  };

  // ── Icon + label per step ─────────────────────────────────────────────────

  const STEP_META = [
    { icon: Calendar, label: i.ageLabel },
    { icon: Users, label: i.genderLabel },
    { icon: MapPin, label: i.locationLabel },
    { icon: Briefcase, label: i.employmentLabel },
  ];

  const { icon: Icon, label } = STEP_META[step];

  // ── Styles ──
  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "14px 18px",
    fontSize: 16,
    color: "var(--text)",
    background: "var(--background)",
    border: "1.5px solid var(--secondary)",
    borderRadius: 14,
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s",
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "14px 18px",
    fontSize: 15,
    fontWeight: 500,
    textAlign: "left",
    borderRadius: 14,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
    border: active
      ? "1.5px solid var(--primary)"
      : "1.5px solid var(--secondary)",
    background: active ? "rgba(124, 92, 252, 0.04)" : "var(--surface)",
    color: active ? "var(--primary)" : "var(--text)",
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        background: "var(--background)",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
          <div
            key={idx}
            style={{
              height: 6,
              borderRadius: 99,
              transition: "all 0.35s",
              width: idx <= step ? 32 : 8,
              background: idx <= step ? "var(--primary)" : "var(--secondary)",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        key={step}
        style={{
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
          animation: "fadeInUp 0.3s ease-out",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "rgba(124, 92, 252, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Icon size={28} color="var(--primary)" />
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text)",
            margin: "0 0 4px",
          }}
        >
          {label}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 24px" }}>
          {i.stepOf(step + 1, TOTAL_STEPS)}
        </p>

        {/* ── Step 0: Age ── */}
        {step === 0 && (
          <input
            type="number"
            placeholder={i.agePlaceholder}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && next()}
            autoFocus
            min={1}
            max={120}
            style={inputBase}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--secondary)";
            }}
          />
        )}

        {/* ── Step 1: Gender ── */}
        {step === 1 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              textAlign: "left",
            }}
          >
            {i.genderOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGender(opt.value)}
                style={chipStyle(gender === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: Location — State → District → Village ── */}
        {step === 2 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              textAlign: "left",
            }}
          >
            {/* State dropdown */}
            <SelectWithChevron
              value={stateName}
              onChange={(v) => {
                setStateName(v);
                setDistrict("");
              }}
              placeholder={i.statePlaceholder}
              options={STATES}
            />

            {/* District dropdown — locked until state selected */}
            <div style={{ position: "relative" }}>
              <SelectWithChevron
                value={district}
                onChange={setDistrict}
                placeholder={
                  stateName
                    ? i.districtPlaceholder
                    : language === "hi"
                      ? "पहले राज्य चुनें"
                      : language === "mr"
                        ? "आधी राज्य निवडा"
                        : "Select state first"
                }
                options={districts}
                disabled={!stateName}
              />
              {/* Pill showing district count */}
              {stateName && districts.length > 0 && !district && (
                <span
                  style={{
                    position: "absolute",
                    right: 44,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--primary)",
                    background: "rgba(124, 92, 252, 0.08)",
                    padding: "2px 6px",
                    borderRadius: 99,
                    pointerEvents: "none",
                  }}
                >
                  {districts.length}
                </span>
              )}
            </div>

            {/* Village text input */}
            <input
              type="text"
              placeholder={i.villagePlaceholder}
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && next()}
              style={inputBase}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--secondary)";
              }}
            />

            {/* Contextual hint */}
            {stateName && district && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--primary)",
                  margin: "0 0 4px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  animation: "fadeInUp 0.2s ease-out",
                }}
              >
                📍 {district}, {stateName}
              </p>
            )}
          </div>
        )}

        {/* ── Step 3: Employment — 2-col chip grid ── */}
        {step === 3 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              textAlign: "left",
            }}
          >
            {i.employmentOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEmployment(opt.value)}
                style={chipStyle(employment === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Buttons ── */}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={skip}
            style={{
              flex: 1,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text)",
              background: "var(--background)",
              border: "1.5px solid var(--secondary)",
              borderRadius: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "inherit",
            }}
          >
            <SkipForward size={16} /> {i.skip}
          </button>
          <button
            onClick={next}
            style={{
              flex: 1,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--accent)",
              background:
                "linear-gradient(135deg, var(--primary), var(--primary))",
              border: "none",
              borderRadius: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(124, 92, 252, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(124, 92, 252, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(124, 92, 252, 0.3)";
            }}
          >
            {step < TOTAL_STEPS - 1 ? (
              <>
                <span>{i.next}</span>
                <ArrowRight size={16} />
              </>
            ) : (
              i.letsGo
            )}
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--text)", marginTop: 32 }}>
        {i.skipHint}
      </p>
    </div>
  );
}
