"use client";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/config/firebase";
import type {
  UserDocument,
  ProcessingStatus,
  DocumentSource,
  ExtractedFields,
  ProfileMemory,
} from "@/lib/types/document";

// ─── Constants ───────────────────────────────────────────────────────────────

const DOCUMENTS_COLLECTION = "documents";
const PROFILE_MEMORY_COLLECTION = "profileMemory";
const LOCAL_DOCS_KEY = "schemesetu-documents";
const LOCAL_MEMORY_KEY = "schemesetu-profile-memory";

// Track whether Firestore is working (to avoid spamming console)
let firestoreAvailable: boolean | null = null;

// ─── File → base64 helper ────────────────────────────────────────────────────

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:mime;base64, prefix — keep raw base64
      const base64 = result.split(",")[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Upload document (base64 in localStorage, metadata to Firestore) ─────────

export async function uploadDocument(
  file: File,
  userId: string,
  sourceType: DocumentSource,
  onProgress?: (pct: number) => void,
): Promise<{ doc: UserDocument; base64Data: string }> {
  const documentId = `${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  onProgress?.(10);

  // Convert file to base64
  const base64Data = await fileToBase64(file);

  onProgress?.(30);

  // Upload to Cloudinary via our server-side API (keeps secrets safe)
  let cloudinaryUrl = "";
  try {
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64Data,
        mimeType: file.type,
        userId,
        documentId,
        fileName: file.name,
      }),
    });

    if (uploadRes.ok) {
      const uploadData = await uploadRes.json();
      cloudinaryUrl = uploadData.url || "";
      console.log(
        "[SchemeSetu] ☁️ File uploaded to Cloudinary:",
        cloudinaryUrl,
      );
    } else {
      const errText = await uploadRes.text();
      console.error("[SchemeSetu] Cloudinary upload failed:", errText);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[SchemeSetu] Cloudinary upload error:", msg);
  }

  onProgress?.(60);

  const userDoc: UserDocument = {
    documentId,
    userId,
    sourceType,
    mimeType: file.type,
    storagePath: cloudinaryUrl
      ? `cloudinary://${documentId}`
      : `local://${documentId}`,
    downloadUrl: cloudinaryUrl,
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: Date.now(),
    updatedAt: Date.now(),
    status: "uploaded",
  };

  // Try saving metadata to Firestore, fall back to localStorage
  try {
    await setDoc(doc(db, DOCUMENTS_COLLECTION, documentId), userDoc);
    if (firestoreAvailable === null) {
      firestoreAvailable = true;
      console.log("[SchemeSetu] ✅ Firestore connected successfully");
    }
  } catch (e: unknown) {
    if (firestoreAvailable !== false) {
      firestoreAvailable = false;
      const msg = e instanceof Error ? e.message : String(e);
      console.error(
        `[SchemeSetu] ❌ Firestore write FAILED: ${msg}\n` +
          `Data is saved to localStorage only.\n` +
          `To fix: Go to Firebase Console → Firestore → Rules and set:\n` +
          `  rules_version = '2';\n` +
          `  service cloud.firestore {\n` +
          `    match /databases/{database}/documents {\n` +
          `      match /{document=**} { allow read, write: if true; }\n` +
          `    }\n` +
          `  }`,
      );
    }
  }

  onProgress?.(80);

  // Always cache locally (metadata)
  cacheDocumentLocally(userDoc);

  // Store base64 data in localStorage as fallback (for small files up to ~5MB)
  try {
    localStorage.setItem(`schemesetu-file-${documentId}`, base64Data);
  } catch {
    console.warn("File too large for localStorage cache");
  }

  onProgress?.(100);

  return { doc: userDoc, base64Data };
}

// ─── Firestore CRUD with localStorage fallbacks ─────────────────────────────

export async function updateDocumentStatus(
  documentId: string,
  status: ProcessingStatus,
  extra?: Partial<UserDocument>,
): Promise<void> {
  // Update Firestore using setDoc + merge (works even if doc doesn't exist yet)
  if (firestoreAvailable !== false) {
    try {
      const ref = doc(db, DOCUMENTS_COLLECTION, documentId);
      await setDoc(
        ref,
        { status, updatedAt: Date.now(), ...extra },
        { merge: true },
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(
        `[SchemeSetu] Firestore updateDocumentStatus failed: ${msg}`,
      );
    }
  }

  // Always update local cache too
  updateLocalDocStatus(documentId, status, extra);
}

export async function saveOCRResults(
  documentId: string,
  ocrText: string,
  extractedFields: ExtractedFields,
  documentTags: string[],
): Promise<void> {
  if (firestoreAvailable !== false) {
    try {
      const ref = doc(db, DOCUMENTS_COLLECTION, documentId);
      await setDoc(
        ref,
        {
          ocrText,
          extractedFields,
          documentTags,
          status: "extracted" as ProcessingStatus,
          updatedAt: Date.now(),
        },
        { merge: true },
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[SchemeSetu] Firestore saveOCRResults failed: ${msg}`);
    }
  }

  // Always update local cache
  updateLocalDocStatus(documentId, "extracted", {
    ocrText,
    extractedFields,
    documentTags,
  });
}

export async function getUserDocuments(
  userId: string,
): Promise<UserDocument[]> {
  if (firestoreAvailable !== false) {
    try {
      const q = query(
        collection(db, DOCUMENTS_COLLECTION),
        where("userId", "==", userId),
        orderBy("uploadedAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => d.data() as UserDocument);
      if (docs.length > 0) return docs;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[SchemeSetu] Firestore getUserDocuments failed: ${msg}`);
    }
  }

  // Fallback to local cache
  return getCachedDocuments().filter((d) => d.userId === userId);
}

export async function getDocument(
  documentId: string,
): Promise<UserDocument | null> {
  if (firestoreAvailable !== false) {
    try {
      const snap = await getDoc(doc(db, DOCUMENTS_COLLECTION, documentId));
      if (snap.exists()) return snap.data() as UserDocument;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[SchemeSetu] Firestore getDocument failed: ${msg}`);
    }
  }

  // Fallback to local cache
  const cached = getCachedDocuments();
  return cached.find((d) => d.documentId === documentId) || null;
}

// ─── Profile Memory ──────────────────────────────────────────────────────────

export async function saveProfileMemory(memory: ProfileMemory): Promise<void> {
  // Always save to localStorage first (guaranteed to work)
  try {
    localStorage.setItem(LOCAL_MEMORY_KEY, JSON.stringify(memory));
  } catch {}

  // Try Firestore
  if (firestoreAvailable !== false) {
    try {
      await setDoc(doc(db, PROFILE_MEMORY_COLLECTION, memory.userId), memory);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[SchemeSetu] Firestore saveProfileMemory failed: ${msg}`);
    }
  }
}

export async function getProfileMemory(
  userId: string,
): Promise<ProfileMemory | null> {
  // Try local cache first (fast)
  try {
    const cached = localStorage.getItem(LOCAL_MEMORY_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as ProfileMemory;
      if (parsed.userId === userId) return parsed;
    }
  } catch {}

  // Try Firestore
  if (firestoreAvailable !== false) {
    try {
      const snap = await getDoc(doc(db, PROFILE_MEMORY_COLLECTION, userId));
      if (snap.exists()) {
        const memory = snap.data() as ProfileMemory;
        try {
          localStorage.setItem(LOCAL_MEMORY_KEY, JSON.stringify(memory));
        } catch {}
        return memory;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[SchemeSetu] Firestore getProfileMemory failed: ${msg}`);
    }
  }

  return null;
}

// ─── Local Cache Helpers ─────────────────────────────────────────────────────

function cacheDocumentLocally(userDoc: UserDocument): void {
  try {
    const existing = JSON.parse(
      localStorage.getItem(LOCAL_DOCS_KEY) || "[]",
    ) as UserDocument[];
    const updated = [
      userDoc,
      ...existing.filter((d) => d.documentId !== userDoc.documentId),
    ].slice(0, 20);
    localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(updated));
  } catch {}
}

function updateLocalDocStatus(
  documentId: string,
  status: ProcessingStatus,
  extra?: Partial<UserDocument>,
): void {
  try {
    const existing = JSON.parse(
      localStorage.getItem(LOCAL_DOCS_KEY) || "[]",
    ) as UserDocument[];
    const updated = existing.map((d) =>
      d.documentId === documentId
        ? { ...d, status, updatedAt: Date.now(), ...extra }
        : d,
    );
    localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(updated));
  } catch {}
}

export function getCachedDocuments(): UserDocument[] {
  try {
    return JSON.parse(
      localStorage.getItem(LOCAL_DOCS_KEY) || "[]",
    ) as UserDocument[];
  } catch {
    return [];
  }
}

// ─── Get stored base64 data for a document ───────────────────────────────────

export function getStoredFileBase64(documentId: string): string | null {
  try {
    return localStorage.getItem(`schemesetu-file-${documentId}`);
  } catch {
    return null;
  }
}

// ─── User ID Helper ──────────────────────────────────────────────────────────

export function getOrCreateUserId(): string {
  const key = "schemesetu-user-id";
  let userId = localStorage.getItem(key);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, userId);
  }
  return userId;
}
