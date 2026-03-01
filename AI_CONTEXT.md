# SchemeSetu AI - Project Context & Documentation

This document serves as a foundational context file for future AI interactions. It outlines the current state of the application, architecture, configured APIs, and most importantly, what features are fully built versus what is currently broken or pending.

**DO NOT scan the entire project looking for this information. Read this file first.**

---

## 1. Tech Stack Overview
- **Framework:** Next.js (React) with TypeScript
- **Styling:** Tailwind CSS
- **Database / Vector Search:** Pinecone (RAG functionality)
- **AI Models:** Google Gemini (Primary API) & Gemma (Fallback via Hugging Face/Google)
- **State Management:** React Hooks (`useState`, `useRef`, `useContext`) and `localStorage` for persistence
- **Multilingual Support:** English (`en`), Hindi (`hi`), Marathi (`mr`)

---

## 2. Core Features Fully Implemented & Working

### The RAG Pipeline (`lib/rag-pipeline.ts`)
- The backend engine handles user queries by retrieving context from Pinecone and generating responses.
- **Dynamic AI Interviewer (Pivot):** Instead of using hardcoded questions from `conversational-engine.ts`, the logic in `determineNextTurn` dynamically scans the matched government schemes and asks the user localized follow-up questions to fill in missing eligibility data (e.g., "Do you own land?", "Are you in the BPL category?").
- **Multi-layered Fallback System:** API rate limits or failures are handled elegantly:
  1. Main API Key (`NEXT_PUBLIC_GEMINI_API_KEY`) rotating through `gemini-2.5-flash`, `gemini-3.0-flash`, `gemini-2.5-flash-lite`.
  2. Backup API Key (`NEXT_PUBLIC_GEMINI_API_KEY_BACKUP`) rotating through the same models.
  3. Ultimate Fallback to `gemma-3-27b` if both Gemini keys fail.

### The Frontend Application
- **Onboarding Flow:** Collects basic user demographics (Age, Gender, Location, Employment) and saves them in `localStorage`.
- **Chat Interface (`ChatBox.tsx`):** A responsive UI rendering user messages and AI bubble responses (including scheme cards).
- **Text-to-Speech (TTS) via `AudioFeedback.tsx`:** The AI can read its responses out loud. It dynamically searches for regional Hindi (`hi-IN`) or Marathi (`mr-IN`) voice engines installed on the user's browser/phone to prevent a robotic English accent.
- **File Upload UI:** A hidden `<input type="file" />` disguised as a "+" button is attached to the chat box. When a file is uploaded, the app simulates an AI response confirming receipt in the user's native language. *(Note: Backend processing of the file text is currently simulated, not fully wired to an OCR/Vision API).*
- **i18n Localization:** The entire UI and AI outputs intelligently shift between English, Hindi, and Marathi based on the user's selected toggle.

---

## 3. 🚨 CRITICALLY BROKEN: Speech-To-Text (Voice Capture)
**Status:** NON-FUNCTIONAL

The `toggleVoice` function inside `components/features/chat/ChatBox/ChatBox.tsx` is currently completely broken and disabled or malfunctioning.
- **The Issue:** We attempted to implement `window.SpeechRecognition` (Web Speech API) to allow users to dictate large paragraphs pseudo-continuously.
- **What Failed:** Browsers like Chrome aggressively throw `network`, `aborted`, and `audio-capture` exceptions when trying to run `continuous = true` or when trying to auto-restart the microphone loop via React `refs`. 
- **Current State:** The microphone button will either not capture text, crash silently, or fail to concatenate sentences accurately.

**Context for Future AI:** Do not assume the Voice STT input is working. If the user asks you to fix voice input, you must start from scratch or heavily diagnose `ChatBox.tsx` -> `toggleVoice`. The browser's native API is highly unstable in React strict mode or edge network conditions.

---

## 4. Pending Features (To-Do)
- **Document Request Flow:** Only ask users for documents (PDFs/Images) after their core eligibility is confirmed.
- **PDF Application Generation:** Automatically generate a downloadable PDF containing a cover page, eligibility checklist, required documents, and CSC (Common Service Centre) instructions.
- **CSC Center Finder:** Logic to locate the nearest Common Service Centre based on the user's district.
- **Privacy Dashboard:** Enable users to view, edit, and delete their saved data (following a 7-day auto-delete policy).
