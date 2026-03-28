"use client";

import {
  saveProfileMemory,
  getProfileMemory,
  updateDocumentStatus,
} from "@/lib/services/document-service";
import type { ExtractedFields, ProfileMemory } from "@/lib/types/document";

// ─── Confidence ranking ──────────────────────────────────────────────────────

const CONFIDENCE_RANK: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

// ─── All expected profile fields ─────────────────────────────────────────────

const ALL_FIELDS = [
  "fullName",
  "fatherName",
  "dateOfBirth",
  "age",
  "gender",
  "address",
  "state",
  "district",
  "village",
  "pincode",
  "aadhaarLast4",
  "panNumber",
  "bankAccountPresent",
  "bankName",
  "ifscCode",
  "rationCardType",
  "landOwnership",
  "landArea",
  "income",
  "caste",
  "occupation",
];

// ─── Merge extracted fields into profile memory ──────────────────────────────

export async function mergeDocumentIntoMemory(
  userId: string,
  documentId: string,
  extractedFields: ExtractedFields,
): Promise<ProfileMemory> {
  // Load existing memory or create new
  let memory = await getProfileMemory(userId);

  if (!memory) {
    memory = {
      userId,
      mergedFacts: {},
      fieldSources: {},
      missingFields: [...ALL_FIELDS],
      documentRefs: [],
      lastUpdated: Date.now(),
    };
  }

  // Add this document ref
  if (!memory.documentRefs.includes(documentId)) {
    memory.documentRefs.push(documentId);
  }

  // Merge each field — higher confidence wins
  for (const [key, field] of Object.entries(extractedFields)) {
    if (!field || !field.value) continue;

    const existing = memory.fieldSources[key];
    const existingRank = existing
      ? CONFIDENCE_RANK[existing.confidence] || 0
      : 0;
    const newRank = CONFIDENCE_RANK[field.confidence] || 0;

    // Update if new field has higher or equal confidence
    if (newRank >= existingRank) {
      memory.mergedFacts[key] = field.value;
      memory.fieldSources[key] = {
        documentId: field.sourceDocumentId || documentId,
        confidence: field.confidence,
      };
    }
  }

  // Recalculate missing fields
  memory.missingFields = ALL_FIELDS.filter((f) => !memory!.mergedFacts[f]);
  memory.lastUpdated = Date.now();

  // Persist
  await saveProfileMemory(memory);

  // Update document status
  await updateDocumentStatus(documentId, "memory_merged");

  return memory;
}

// ─── Build a profile summary string for AI context injection ─────────────────

export function buildMemoryContext(memory: ProfileMemory): string {
  const facts = memory.mergedFacts;
  if (Object.keys(facts).length === 0) return "";

  const lines: string[] = ["[KNOWN USER FACTS FROM UPLOADED DOCUMENTS]"];

  const fieldLabels: Record<string, string> = {
    fullName: "Name",
    fatherName: "Father's Name",
    dateOfBirth: "Date of Birth",
    age: "Age",
    gender: "Gender",
    address: "Address",
    state: "State",
    district: "District",
    village: "Village",
    pincode: "Pin Code",
    aadhaarLast4: "Aadhaar (last 4)",
    panNumber: "PAN",
    bankAccountPresent: "Has Bank Account",
    bankName: "Bank Name",
    ifscCode: "IFSC Code",
    rationCardType: "Ration Card Type",
    landOwnership: "Land Ownership",
    landArea: "Land Area",
    income: "Annual Income",
    caste: "Caste Category",
    occupation: "Occupation",
  };

  for (const [key, value] of Object.entries(facts)) {
    const label = fieldLabels[key] || key;
    const source = memory.fieldSources[key];
    const conf = source?.confidence ? ` (${source.confidence} confidence)` : "";
    lines.push(`- ${label}: ${value}${conf}`);
  }

  if (memory.missingFields.length > 0) {
    lines.push("");
    lines.push(
      "[STILL UNKNOWN: " +
        memory.missingFields.map((f) => fieldLabels[f] || f).join(", ") +
        "]",
    );
  }

  return lines.join("\n");
}

// ─── Get memory facts as structured object for profile auto-fill ─────────────

export async function getMemoryFacts(
  userId: string,
): Promise<Record<string, string>> {
  const memory = await getProfileMemory(userId);
  return memory?.mergedFacts || {};
}
