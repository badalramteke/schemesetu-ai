# SchemeSetu — Workspace Overview

## Summary
Implemented full app flow and fixed critical UI bugs. All 4 screens present and wired:

- Screen 1: Language Select — persisted language, navigates to onboarding
- Screen 2: Onboarding — 4-step generative UI, saves `userProfile` to localStorage
- Screen 3: Chat Home — time-based greeting, sector chips, load test Q&As
- Screen 4: Active Chat — chat UI, AI loading indicator, renders scheme cards
- Question Scrubber — long-press scrollbar scrubber implemented
- Conversational engine — one-question-at-a-time interview implemented
- RAG pipeline — Pinecone + Gemini orchestration implemented (server API at `/api/query`)
- Scheme card UI — EligibilityCard with download, CSC locator, video tutorial
- PDF generation — `PDFDownload` opens printable application pack

## Critical fixes applied
- Fixed "Cannot create components during render" in OnboardingWizard
- Fixed ref access during render in QuestionJumper (moved client access into effect)
- Updated PDFDownload button text to "Download Application Pack"

## Modified files (selected)
- components/features/OnboardingWizard.tsx
- components/features/chat/QuestionJumper/QuestionJumper.tsx
- components/features/output/PDFDownload/PDFDownload.tsx
- components/features/LanguageSelect.tsx
- components/features/chat/ChatBox/ChatBox.tsx
- components/features/schemes/EligibilityCard/EligibilityCard.tsx
- components/providers/AppProvider.tsx
- lib/rag-pipeline.ts
- lib/conversational-engine.ts
- lib/i18n.ts
- app/(public)/page.tsx
- app/api/query/route.ts

## How to run
1. npm install
2. npm run dev (open http://localhost:3000)
3. npm run lint (note: some non-critical lint errors remain)
4. npm run build to verify production build

## Manual tests
1. Launch app; select language and verify UI switches immediately.
2. Complete or skip onboarding; `userProfile` and `hasCompletedOnboarding` should persist.
3. On Chat Home, use sector chips and Load Test Q&As.
4. In Active Chat, run an interview flow; wait for AI loading and confirm scheme cards render.
5. Use Question Scrubber: long-press scrollbar and scrub through questions.
6. Click "Download Application Pack" on a card and verify printable page opens.

## Notes & Risks
- RAG requires Gemini and Pinecone keys (env vars). Without them, API falls back to noMatch responses.
- ESLint shows some errors in scripts and a `not-found` page link; these are non-blocking for runtime but should be cleaned.
- Upload / document deletion flows are not exercised here and must be tested with storage/back-end.

---
Generated at: <!-- GENERATED -->

