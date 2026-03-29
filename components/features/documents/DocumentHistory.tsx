"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Camera,
  Image,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  ChevronDown,
  ChevronUp,
  Brain,
} from "lucide-react";
import type { UserDocument, ProcessingStatus } from "@/lib/types/document";

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProcessingStatus,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  uploaded: { label: "Uploaded", color: "var(--muted)", icon: Clock },
  processing: { label: "Processing...", color: "#f59e0b", icon: Clock },
  ocr_complete: { label: "OCR Done", color: "#3b82f6", icon: CheckCircle },
  extracted: { label: "Extracted", color: "#3b82f6", icon: CheckCircle },
  memory_merged: { label: "Memorized", color: "#8b5cf6", icon: Brain },
  ai_available: {
    label: "AI Ready",
    color: "var(--primary)",
    icon: CheckCircle,
  },
  failed: { label: "Failed", color: "#ef4444", icon: AlertCircle },
};

const SOURCE_ICONS: Record<string, typeof FileText> = {
  camera: Camera,
  gallery: Image,
  pdf: FileText,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function DocumentHistory() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { getOrCreateUserId, getCachedDocuments, getUserDocuments } =
        await import("@/lib/services/document-service");
      const userId = getOrCreateUserId();

      // Show cached first
      const cached = getCachedDocuments();
      if (cached.length > 0) setDocuments(cached);

      // Fetch fresh from Firestore
      try {
        const fresh = await getUserDocuments(userId);
        if (fresh.length > 0) setDocuments(fresh);
      } catch {
        // Keep cached data if Firestore fails
      }
    } catch {
      // No documents
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (
    file: File,
    source: "gallery" | "pdf" | "camera",
  ) => {
    try {
      const {
        uploadDocument,
        getOrCreateUserId,
        saveOCRResults,
        updateDocumentStatus,
      } = await import("@/lib/services/document-service");
      const userId = getOrCreateUserId();

      setUploadProgress(0);
      const { doc: userDoc, base64Data } = await uploadDocument(
        file,
        userId,
        source,
        (pct) => setUploadProgress(pct),
      );
      setUploadProgress(null);

      setDocuments((prev) => [userDoc, ...prev]);

      // Run OCR in background
      await updateDocumentStatus(userDoc.documentId, "processing");
      setDocuments((prev) =>
        prev.map((d) =>
          d.documentId === userDoc.documentId
            ? { ...d, status: "processing" }
            : d,
        ),
      );

      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data,
          mimeType: userDoc.mimeType,
          documentId: userDoc.documentId,
          userId,
        }),
      });

      if (ocrRes.ok) {
        const ocrData = await ocrRes.json();
        await saveOCRResults(
          userDoc.documentId,
          ocrData.ocrText,
          ocrData.extractedFields,
          ocrData.documentTags,
        );

        const { mergeDocumentIntoMemory } =
          await import("@/lib/services/memory-service");
        await mergeDocumentIntoMemory(
          userId,
          userDoc.documentId,
          ocrData.extractedFields,
        );

        await updateDocumentStatus(userDoc.documentId, "ai_available");
        setDocuments((prev) =>
          prev.map((d) =>
            d.documentId === userDoc.documentId
              ? {
                  ...d,
                  status: "ai_available" as ProcessingStatus,
                  extractedFields: ocrData.extractedFields,
                  documentTags: ocrData.documentTags,
                  ocrText: ocrData.ocrText,
                }
              : d,
          ),
        );
      } else {
        const errBody = await ocrRes.json().catch(() => ({}));
        const errMsg = errBody.error || `OCR failed (${ocrRes.status})`;
        console.error("[DocumentHistory] OCR error:", errMsg);
        await updateDocumentStatus(userDoc.documentId, "failed", {
          errorMessage: errMsg,
        });
        setDocuments((prev) =>
          prev.map((d) =>
            d.documentId === userDoc.documentId
              ? { ...d, status: "failed" as ProcessingStatus }
              : d,
          ),
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadProgress(null);
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    source: "gallery" | "pdf" | "camera",
  ) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file, source);
    e.target.value = "";
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      style={{
        marginTop: 24,
        padding: "20px",
        background: "var(--background)",
        border: "1px solid var(--secondary)",
        borderRadius: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Brain size={20} color="var(--primary)" />
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            AI Document Memory
          </h3>
        </div>
        <span
          style={{
            fontSize: 12,
            color: "var(--muted)",
            background: "var(--surface)",
            padding: "4px 10px",
            borderRadius: 99,
          }}
        >
          {documents.length} doc{documents.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Upload Buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => cameraRef.current?.click()}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--primary)",
            background: "rgba(124, 92, 252, 0.08)",
            border: "1px solid rgba(124, 92, 252, 0.2)",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          <Camera size={16} /> Camera
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#3b82f6",
            background: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          <Upload size={16} /> Upload
        </button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e, "camera")}
          style={{ display: "none" }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) =>
            handleFileSelect(
              e,
              e.target.files?.[0]?.type.includes("pdf") ? "pdf" : "gallery",
            )
          }
          style={{ display: "none" }}
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              height: 4,
              background: "var(--surface)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${uploadProgress}%`,
                background: "var(--primary)",
                borderRadius: 2,
                transition: "width 0.3s",
              }}
            />
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      {/* Document List */}
      {loading ? (
        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            textAlign: "center",
            padding: 20,
          }}
        >
          Loading documents...
        </p>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 16px" }}>
          <FileText
            size={32}
            color="var(--muted)"
            style={{ marginBottom: 8 }}
          />
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            No documents uploaded yet. Upload your Aadhaar, PAN, Ration Card,
            etc. and AI will remember your details.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {documents.map((doc) => {
            const statusConf =
              STATUS_CONFIG[doc.status] || STATUS_CONFIG.uploaded;
            const StatusIcon = statusConf.icon;
            const SourceIcon = SOURCE_ICONS[doc.sourceType] || FileText;
            const isExpanded = expanded === doc.documentId;
            const fieldCount = doc.extractedFields
              ? Object.keys(doc.extractedFields).length
              : 0;

            return (
              <div
                key={doc.documentId}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--secondary)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() =>
                    setExpanded(isExpanded ? null : doc.documentId)
                  }
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <SourceIcon size={18} color="var(--muted)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text)",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {doc.fileName}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        margin: 0,
                        marginTop: 2,
                      }}
                    >
                      {formatSize(doc.fileSize)} · {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <StatusIcon size={14} color={statusConf.color} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: statusConf.color,
                      }}
                    >
                      {statusConf.label}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} color="var(--muted)" />
                  ) : (
                    <ChevronDown size={16} color="var(--muted)" />
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "0 14px 14px",
                      borderTop: "1px solid var(--secondary)",
                    }}
                  >
                    {doc.documentTags && doc.documentTags.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 4,
                          marginTop: 10,
                        }}
                      >
                        {doc.documentTags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "var(--primary)",
                              background: "rgba(124, 92, 252, 0.1)",
                              padding: "2px 8px",
                              borderRadius: 99,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {fieldCount > 0 && doc.extractedFields && (
                      <div style={{ marginTop: 10 }}>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--text)",
                            marginBottom: 6,
                          }}
                        >
                          Extracted Fields ({fieldCount})
                        </p>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 4,
                          }}
                        >
                          {Object.entries(doc.extractedFields)
                            .filter(([, v]) => v?.value)
                            .map(([key, field]) => (
                              <div
                                key={key}
                                style={{
                                  fontSize: 11,
                                  padding: "4px 8px",
                                  background: "var(--background)",
                                  borderRadius: 6,
                                }}
                              >
                                <span style={{ color: "var(--muted)" }}>
                                  {key}:
                                </span>{" "}
                                <span
                                  style={{
                                    color: "var(--text)",
                                    fontWeight: 500,
                                  }}
                                >
                                  {field!.value}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {doc.status === "failed" && doc.errorMessage && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "#ef4444",
                          marginTop: 8,
                        }}
                      >
                        Error: {doc.errorMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
