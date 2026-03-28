// ─── Document Types ──────────────────────────────────────────────────────────

export type DocumentSource = "camera" | "gallery" | "pdf";

export type ProcessingStatus =
  | "uploaded"
  | "processing"
  | "ocr_complete"
  | "extracted"
  | "memory_merged"
  | "ai_available"
  | "failed";

export interface UserDocument {
  documentId: string;
  userId: string;
  sourceType: DocumentSource;
  mimeType: string;
  storagePath: string;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: number;
  updatedAt: number;
  status: ProcessingStatus;
  ocrText?: string;
  extractedFields?: ExtractedFields;
  documentTags?: string[];
  errorMessage?: string;
}

// ─── Extracted Field Types ───────────────────────────────────────────────────

export interface ExtractedField {
  value: string;
  confidence: "high" | "medium" | "low";
  sourceDocumentId: string;
  extractedAt: number;
}

export interface ExtractedFields {
  fullName?: ExtractedField;
  fatherName?: ExtractedField;
  dateOfBirth?: ExtractedField;
  age?: ExtractedField;
  gender?: ExtractedField;
  address?: ExtractedField;
  state?: ExtractedField;
  district?: ExtractedField;
  village?: ExtractedField;
  pincode?: ExtractedField;
  aadhaarLast4?: ExtractedField;
  panNumber?: ExtractedField;
  bankAccountPresent?: ExtractedField;
  bankName?: ExtractedField;
  ifscCode?: ExtractedField;
  rationCardType?: ExtractedField;
  landOwnership?: ExtractedField;
  landArea?: ExtractedField;
  income?: ExtractedField;
  caste?: ExtractedField;
  occupation?: ExtractedField;
  [key: string]: ExtractedField | undefined;
}

// ─── Profile Memory Types ────────────────────────────────────────────────────

export interface ProfileMemory {
  userId: string;
  mergedFacts: Record<string, string>;
  fieldSources: Record<string, { documentId: string; confidence: string }>;
  missingFields: string[];
  documentRefs: string[];
  lastUpdated: number;
}

// ─── OCR Request/Response ────────────────────────────────────────────────────

export interface OCRRequest {
  documentId: string;
  downloadUrl: string;
  mimeType: string;
  userId: string;
}

export interface OCRResponse {
  ocrText: string;
  extractedFields: ExtractedFields;
  documentTags: string[];
}
