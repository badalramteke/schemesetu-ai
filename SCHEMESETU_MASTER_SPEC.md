# SchemeSetu AI — Master Project Workspace Specification

> **Purpose:** This document is the single, self-contained architectural blueprint for the SchemeSetu AI platform. Copy any section into an AI prompt to generate 100% working code.

---

## 1. Tech Stack (Pinned Versions)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| UI Library | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| LLM Provider | Google Gemini (`@google/generative-ai`) | 0.24.x |
| LLM Orchestration | LangChain + `@langchain/google-genai` | 1.2.x / 2.1.x |
| Vector DB | Pinecone (`@pinecone-database/pinecone`) | 7.1.x |
| Auth / DB | Firebase | 12.x |
| Icons | Lucide React | 0.575.x |
| HTTP | Axios | 1.13.x |
| Env | dotenv | 17.x |
| Hosting | Vercel (serverless) | — |

### Models Used
- **Generation (cascading fallback):** `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.5-flash-lite` → `gemma-3-27b`
- **Embedding:** `gemini-embedding-001`
- **Vector Index:** Pinecone index `schemesetu-pinecone`, one namespace per scheme (`pm-kisan`, `ayushman`, `pmay-g`, `mgnrega`, `apy`)

---

## 2. Blueprints — Complete Directory Tree

```
schemesetu-ai/
├── app/                              # Next.js App Router pages & API
│   ├── layout.tsx                    # Root layout — providers, fonts, <html>
│   ├── loading.tsx                   # Global loading spinner
│   ├── error.tsx                     # Global error boundary
│   ├── not-found.tsx                 # 404 page
│   ├── (public)/                     # Public route group
│   │   ├── layout.tsx                # Public shell — navbar, footer
│   │   ├── page.tsx                  # Landing / home page
│   │   ├── about/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── voice-chat/page.tsx       # Standalone voice chat page
│   │   └── blog/
│   │       ├── layout.tsx
│   │       ├── page.tsx              # Blog listing
│   │       └── [slug]/page.tsx       # Blog post
│   ├── (auth)/                       # Auth route group
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/                  # Authenticated dashboard group
│   │   ├── layout.tsx                # Dashboard shell — sidebar, auth guard
│   │   ├── dashboard/page.tsx        # Main dashboard
│   │   ├── [userId]/page.tsx         # User-specific view
│   │   ├── profile/page.tsx
│   │   └── settings/page.tsx
│   └── api/                          # Serverless API routes
│       ├── query/route.ts            # POST — central RAG query handler
│       ├── schemes/
│       │   ├── route.ts              # GET all schemes
│       │   ├── [id]/route.ts         # GET single scheme
│       │   ├── search/route.ts       # GET scheme search
│       │   └── steps/route.ts        # GET application steps
│       ├── pdf-download/route.ts     # GET — generate & download PDF
│       ├── csc-locator/route.ts      # GET — nearest CSC centers
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── logout/route.ts
│       ├── users/
│       │   ├── route.ts              # POST create user
│       │   └── [id]/
│       │       ├── route.ts          # GET/PUT/DELETE user
│       │       └── profile/route.ts  # GET/PUT user profile
│       └── webhooks/stripe/route.ts  # Stripe webhook handler
├── components/
│   ├── chat/
│   │   └── VoiceChat.tsx             # Voice-based chat interface
│   ├── features/
│   │   ├── HomeDashboard.tsx         # Landing page hero + quick actions
│   │   ├── LanguageSelect.tsx        # Language picker (en/hi/mr)
│   │   ├── OnboardingWizard.tsx      # Multi-step user onboarding
│   │   ├── accessibility/
│   │   │   ├── AccessibilityPanel/   # Master accessibility controls
│   │   │   ├── FontSizeControl/
│   │   │   ├── HighContrastToggle/
│   │   │   └── ReadingModeToggle/
│   │   ├── auth/
│   │   │   ├── LoginForm/            # LoginForm.tsx, useLoginForm.ts, test
│   │   │   ├── SignupForm/
│   │   │   ├── ForgotPasswordForm/
│   │   │   └── ProtectedRoute/       # Auth gate wrapper
│   │   ├── chat/
│   │   │   ├── ChatBox/ChatBox.tsx   # Main chat container + logic
│   │   │   ├── ChatInput/ChatInput.tsx
│   │   │   ├── ChatMessage/ChatMessage.tsx
│   │   │   ├── ChatHistory/
│   │   │   ├── QuestionJumper/QuestionJumper.tsx  # Chip-based quick answers
│   │   │   └── useChatHistory.ts
│   │   ├── dashboard/
│   │   │   ├── ActivityChart/
│   │   │   ├── DashboardGrid/
│   │   │   ├── SavedSchemes/
│   │   │   └── StatsCard/
│   │   ├── output/
│   │   │   ├── CSCLocator/CSCLocator.tsx
│   │   │   ├── PDFDownload/PDFDownload.tsx
│   │   │   ├── ShareResults/
│   │   │   └── VideoTutorial/VideoTutorial.tsx
│   │   ├── schemes/
│   │   │   ├── EligibilityCard/      # EligibilityCard, Badge, BenefitsTable,
│   │   │   │                         # DocumentsList, ApplicationStepsCard
│   │   │   ├── SchemeCard/
│   │   │   ├── SchemeDetail/
│   │   │   ├── SchemeFilter/
│   │   │   ├── SchemeGrid/
│   │   │   └── SchemeSearch/
│   │   └── user/
│   │       ├── NotificationSettings/
│   │       ├── PreferencePanel/
│   │       ├── UserProfile/
│   │       └── UserSettings/
│   ├── layout/
│   │   ├── Footer/
│   │   ├── Header/
│   │   ├── MobileNav/
│   │   ├── Navbar/
│   │   └── Sidebar/
│   ├── ui/                           # Reusable primitives
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── ErrorBoundary/
│   │   ├── Input/
│   │   ├── LoadingSpinner/
│   │   ├── Modal/
│   │   ├── ProgressBar/
│   │   ├── Select/
│   │   ├── Skeleton/
│   │   ├── Tabs/
│   │   ├── Toast/
│   │   └── Tooltip/
│   └── voice/
│       └── AudioFeedback/
├── context/                          # React Context providers
│   ├── AppContext.tsx
│   ├── AuthContext.tsx
│   ├── ChatContext.tsx
│   ├── LanguageContext.tsx
│   ├── ThemeContext.tsx
│   └── AccessibilityContext.tsx
├── lib/
│   ├── config/
│   │   ├── app.ts                    # App constants (name, version)
│   │   ├── env.ts                    # Env var validation
│   │   ├── firebase.ts               # Firebase init
│   │   ├── gemini.ts                 # Gemini model config
│   │   └── pinecone.ts              # Pinecone client singleton
│   ├── constants/
│   │   ├── api-endpoints.ts
│   │   ├── india-districts.ts        # All Indian districts by state
│   │   ├── messages.ts               # UI string constants
│   │   ├── routes.ts                 # Route path constants
│   │   └── validation-rules.ts
│   ├── conversational-engine.ts      # Goal→scheme mapping, keyword intent
│   ├── rag-pipeline.ts              # ★ CORE — RAG + AI Interviewer (755 lines)
│   ├── mock-messages.ts
│   ├── rag/                          # Modular RAG (stub files for refactor)
│   │   ├── gemini-client.ts          # [STUB] Modular Gemini wrapper
│   │   ├── pinecone-client.ts        # [STUB] Modular Pinecone wrapper
│   │   ├── prompts.ts                # [STUB] Prompt templates
│   │   ├── rag-pipeline.ts           # [STUB] Modular RAG pipeline
│   │   └── types.ts                  # [STUB] RAG type exports
│   ├── schemes/
│   │   ├── apy.ts                    # Atal Pension Yojana data
│   │   ├── ayushman-bharat.ts        # Ayushman Bharat PMJAY data
│   │   ├── index.ts                  # Barrel export
│   │   ├── mgnrega.ts               # MGNREGA data
│   │   ├── pm-kisan.ts              # PM-KISAN data
│   │   ├── pmay-g.ts                # PMAY-G data
│   │   ├── types.ts                 # Scheme TypeScript interfaces
│   │   └── scheme_data/             # Raw text files per scheme
│   │       ├── apy.txt
│   │       ├── ayushman_bharat.txt
│   │       ├── mgnrega.txt
│   │       ├── pm_kisan.txt
│   │       └── pmay_g.txt
│   ├── services/
│   │   ├── auth-service.ts
│   │   ├── csc-service.ts           # CSC center lookup by district
│   │   ├── eligibility.ts           # Rule-based eligibility engine
│   │   ├── pdf-generator.ts         # Server-side PDF generation
│   │   ├── translation.ts           # Translation service wrapper
│   │   └── user-service.ts
│   ├── db/
│   │   ├── migrations/init.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Scheme.ts
│   │   │   └── Query.ts
│   │   └── queries/
│   │       ├── user-queries.ts
│   │       ├── scheme-queries.ts
│   │       └── query-queries.ts
│   ├── hooks/
│   │   ├── useAccessibility.ts
│   │   ├── useAuth.ts
│   │   ├── useChatHistory.ts
│   │   ├── useDarkMode.ts
│   │   ├── useDebounce.ts
│   │   ├── useEligibility.ts
│   │   ├── useFetch.ts
│   │   ├── useForm.ts
│   │   ├── useLanguage.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMobile.ts
│   │   ├── useVoiceChat.ts
│   │   └── useVoiceInput.ts
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── useTranslation.ts
│   │   ├── en.json
│   │   ├── hi.json
│   │   └── mr.json
│   ├── i18n.ts                      # Top-level i18n re-export
│   └── middleware/
│       ├── auth-middleware.ts
│       ├── error-middleware.ts
│       ├── logger-middleware.ts
│       └── rate-limit-middleware.ts
├── styles/
│   ├── globals.css                   # Tailwind directives + base
│   ├── tailwind.css
│   ├── variables.css                 # CSS custom properties
│   ├── animations.css
│   ├── typography.css
│   └── responsive.css
├── types/
│   └── speech.d.ts                   # Web Speech API type augmentation
├── scripts/
│   ├── seed-pinecone.ts             # Seed Pinecone with scheme data
│   ├── seed-all-schemes-with-namespaces.ts
│   ├── seed-db.ts
│   ├── setup.ts
│   ├── migrate.ts
│   ├── debug-pinecone.ts
│   ├── check-dim.ts
│   ├── test-v4-dim.ts
│   ├── test-pinecone-inference.ts
│   ├── test-rag-and-api.ts
│   ├── test-integrated.ts
│   └── list-models-rest.ts
├── __tests__/
│   ├── mocks/handlers.ts
│   └── e2e/
│       ├── eligibility-check.spec.ts
│       ├── pdf-download.spec.ts
│       └── voice-input.spec.ts
├── public/                           # Static assets
│   ├── favicon.ico
│   └── *.svg
├── .env.local                        # Environment variables
├── next.config.ts
├── tsconfig.json
├── package.json
├── vercel.json
├── server.js                         # Custom Node server for production
└── postcss.config.mjs
```

---

## 3. File Manifest — Every File, Every Detail

> **Convention:** Each entry lists **Path**, **Imports**, **Pseudocode/Logic**, and **State/Data Flow**.
> Files marked `[STUB]` are currently empty and need implementation.

---

### 3.1 Root Configuration Files

#### `next.config.ts`
- **Imports:** `NextConfig` from `next`
- **Logic:** Export default config. Enable `reactStrictMode`. Add `images.domains` for any external image hosts. Configure `experimental.serverActions` if needed.
- **State:** Read at build time by Next.js.

#### `tsconfig.json`
- **Logic:** Extends Next.js defaults. Paths alias `@/*` → `./*`. Strict mode on. Include `types/speech.d.ts`.

#### `package.json`
- **Scripts:** `dev` → `next dev`, `build` → `next build`, `start` → `node server.js`, `lint` → `eslint`
- **Key deps:** See Tech Stack table above.

#### `server.js`
- **Logic:** Custom Node HTTP server wrapping `next()`. Binds to `process.env.PORT || 3000`. Used for Vercel production start.

#### `vercel.json`
- **Logic:** Vercel deployment config. Function memory/duration limits. Route rewrites if needed.

#### `.env.local`
- **Variables:**
  - `NEXT_PUBLIC_GEMINI_API_KEY` — Primary Gemini key
  - `NEXT_PUBLIC_GEMINI_API_KEY_BACKUP` — Backup key for failover
  - `PINECONE_API_KEY` — Server-only Pinecone key
  - `PINECONE_INDEX_NAME` — Index name (`schemesetu-pinecone`)
  - `NEXT_PUBLIC_FIREBASE_*` — Firebase config (6 vars)

---

### 3.2 App — Root Files

#### `app/layout.tsx`
- **Imports:** `AppContext`, `AuthContext`, `LanguageContext`, `ThemeContext`, `ChatContext`, `AccessibilityContext`, globals.css
- **Logic:** Wraps `{children}` in nested providers: `ThemeContext` → `LanguageContext` → `AccessibilityContext` → `AuthContext` → `AppContext` → `ChatContext`. Sets `<html lang>`, loads Google Fonts (Inter/Noto Sans Devanagari), adds `<meta>` tags.
- **State:** All global context providers originate here.

#### `app/loading.tsx`
- **Logic:** Renders `<LoadingSpinner />` full-screen during route transitions.

#### `app/error.tsx`
- **Logic:** `"use client"`. Catches runtime errors. Shows error message + "Try Again" button calling `reset()`.

#### `app/not-found.tsx`
- **Logic:** Custom 404 page with link back to home.

---

### 3.3 App — Public Pages (`app/(public)/`)

#### `app/(public)/layout.tsx`
- **Imports:** `Navbar`, `Footer`
- **Logic:** Renders `<Navbar />`, `{children}`, `<Footer />`. Shared across all public pages.

#### `app/(public)/page.tsx` — Landing Page
- **Imports:** `HomeDashboard`, `OnboardingWizard`, `ChatBox`, `LanguageSelect`
- **Logic:**
  1. Check `AppContext` for `userProfile`. If absent → show `<OnboardingWizard />`.
  2. If profile exists → show `<HomeDashboard />` with suggested queries.
  3. Render `<ChatBox />` as the primary interaction surface.
  4. `<LanguageSelect />` in header.
- **State:** Reads `userProfile` from `AppContext`. Writes `prefillQuery` into `ChatContext` when user clicks a suggestion.

#### `app/(public)/about/page.tsx`
- **Logic:** Static "About SchemeSetu" page. Mission, team, methodology.

#### `app/(public)/pricing/page.tsx`
- **Logic:** Pricing tiers. Free tier + premium. Links to Stripe checkout (future).

#### `app/(public)/voice-chat/page.tsx`
- **Imports:** `VoiceChat`
- **Logic:** Full-page voice interaction mode. Uses `useVoiceInput` hook for STT, sends to `/api/query`, plays response via TTS.

#### `app/(public)/blog/` pages
- **Logic:** Static blog with slugs. `page.tsx` lists posts. `[slug]/page.tsx` renders individual post. `layout.tsx` adds blog-specific sidebar/nav.

---

### 3.4 App — Auth Pages (`app/(auth)/`)

#### `app/(auth)/login/page.tsx`
- **Imports:** `LoginForm`
- **Logic:** Renders login form. On success → redirect to dashboard.

#### `app/(auth)/signup/page.tsx`
- **Imports:** `SignupForm`
- **Logic:** Renders signup form. Calls `/api/auth/register`. On success → redirect to onboarding.

#### `app/(auth)/forgot-password/page.tsx` & `reset-password/page.tsx`
- **Logic:** Firebase password reset flow. Email input → send reset link → token-based reset page.

---

### 3.5 App — Dashboard Pages (`app/(dashboard)/`)

#### `app/(dashboard)/layout.tsx`
- **Imports:** `Sidebar`, `ProtectedRoute`
- **Logic:** Wraps children in `<ProtectedRoute>` (redirects unauthenticated users). Renders `<Sidebar />` + main content area.

#### `app/(dashboard)/dashboard/page.tsx`
- **Imports:** `DashboardGrid`, `StatsCard`, `ActivityChart`, `SavedSchemes`
- **Logic:** Shows user stats (queries made, schemes found), recent activity chart, saved/bookmarked schemes list.
- **State:** Fetches from `AuthContext.user.id` → `/api/users/[id]/profile`.

#### `app/(dashboard)/profile/page.tsx`
- **Imports:** `UserProfile`
- **Logic:** Display/edit user profile. Calls `PUT /api/users/[id]/profile`.

#### `app/(dashboard)/settings/page.tsx`
- **Imports:** `UserSettings`, `NotificationSettings`, `PreferencePanel`
- **Logic:** Language preference, notification toggles, accessibility settings, data deletion (7-day auto-delete policy).

#### `app/(dashboard)/[userId]/page.tsx`
- **Logic:** Admin or public view of a specific user's saved schemes.

---

### 3.6 App — API Routes (`app/api/`)

#### `app/api/query/route.ts` — ★ CENTRAL ENDPOINT
- **Imports:** `determineNextTurn` from `@/lib/rag-pipeline`
- **Logic (POST):**
  1. Parse `{ userQuery, language, profile, answers, askedQuestions, candidateSchemes }`.
  2. Validate `userQuery` ≥ 3 chars.
  3. Normalize `language` to `en`/`hi`/`mr`.
  4. Call `determineNextTurn(userQuery, profile, answers, language, askedQuestions, candidateSchemes)`.
  5. Return `DynamicTurn` result: either `{ status: "questioning", question, chips }` or `{ status: "complete", results: RAGEcosystemResponse }`.
- **State flow:** Frontend sends accumulated `answers` + `askedQuestions` each turn; server is stateless.

#### `app/api/schemes/route.ts`
- **Logic (GET):** Return all scheme summaries from `lib/schemes/index.ts`.

#### `app/api/schemes/[id]/route.ts`
- **Logic (GET):** Return single scheme detail by ID. Uses `getSingleSchemeEligibility()` if query param `check=true`.

#### `app/api/schemes/search/route.ts`
- **Logic (GET):** Accept `?q=keyword&state=StateName`. Filter schemes by keyword match + state-specific eligibility.

#### `app/api/schemes/steps/route.ts`
- **Logic (GET):** Return step-by-step application instructions for a scheme. Accept `?schemeId=xxx`.

#### `app/api/pdf-download/route.ts`
- **Imports:** `generatePDF` from `@/lib/services/pdf-generator`
- **Logic (GET):**
  1. Accept `?queryId=xxx` or request body with user profile + eligibility results.
  2. Call `generatePDF({ profile, eligibleSchemes, documents, cscInfo })`.
  3. Return binary PDF stream with `Content-Disposition: attachment`.

#### `app/api/csc-locator/route.ts`
- **Imports:** `findNearestCSC` from `@/lib/services/csc-service`
- **Logic (GET):** Accept `?state=X&district=Y`. Return array of CSC centers with name, address, lat/lng, phone.

#### `app/api/auth/login/route.ts`
- **Logic (POST):** Accept `{ email, password }`. Validate via Firebase Auth. Return JWT/session token.

#### `app/api/auth/register/route.ts`
- **Logic (POST):** Accept `{ email, password, name }`. Create Firebase user. Create DB record via `user-service.ts`.

#### `app/api/auth/logout/route.ts`
- **Logic (POST):** Invalidate session/token.

#### `app/api/users/route.ts` & `[id]/route.ts`
- **Logic:** CRUD operations on User model. `GET` returns user, `PUT` updates, `DELETE` removes (7-day policy).

#### `app/api/webhooks/stripe/route.ts`
- **Logic:** Verify Stripe webhook signature. Handle `checkout.session.completed`, `invoice.paid` events. Update user subscription tier.

---

### 3.7 Context Providers (`context/`)

#### `context/AppContext.tsx` — [STUB, needs implementation]
- **Exports:** `AppProvider`, `useApp`
- **State:** `userProfile: UserProfile | null`, `isOnboarded: boolean`, `prefillQuery: string`
- **Logic:** On mount, check `localStorage` for saved profile (via `useLocalStorage`). Expose `setProfile()`, `clearProfile()`.
- **Data flow:** `OnboardingWizard` writes → `AppContext` stores → `ChatBox` reads profile for API calls.

#### `context/AuthContext.tsx` — [STUB]
- **Exports:** `AuthProvider`, `useAuth`
- **State:** `user: User | null`, `loading: boolean`, `isAuthenticated: boolean`
- **Logic:** Subscribe to Firebase `onAuthStateChanged`. Expose `login()`, `signup()`, `logout()`.

#### `context/ChatContext.tsx` — [STUB]
- **Exports:** `ChatProvider`, `useChat`
- **State:** `messages: ChatMessage[]`, `isLoading: boolean`, `answers: Record<string,string>`, `askedQuestions: string[]`, `candidateSchemes: string[]`
- **Logic:** Manages full chat conversation state. `sendMessage()` POSTs to `/api/query`, appends AI response, tracks `answers` and `askedQuestions` across turns.

#### `context/LanguageContext.tsx` — [STUB]
- **Exports:** `LanguageProvider`, `useLanguageContext`
- **State:** `language: 'en' | 'hi' | 'mr'`
- **Logic:** Persists to `localStorage`. Provides `setLanguage()`. Consumed by all UI text + API calls.

#### `context/ThemeContext.tsx` — [STUB]
- **Exports:** `ThemeProvider`, `useTheme`
- **State:** `theme: 'light' | 'dark'`
- **Logic:** Toggle dark mode. Persists preference. Adds `data-theme` attribute to `<html>`.

#### `context/AccessibilityContext.tsx` — [STUB]
- **Exports:** `AccessibilityProvider`, `useAccessibilityContext`
- **State:** `fontSize: number`, `highContrast: boolean`, `readingMode: boolean`
- **Logic:** Applies CSS variable overrides. Persists to `localStorage`.

---

### 3.8 Lib — Core Engine

#### `lib/rag-pipeline.ts` — ★ FULLY IMPLEMENTED (755 lines)
- **Imports:** `GoogleGenerativeAI`, `Pinecone`
- **Exports:**
  - `queryMultiSchemeRAG(userQuery, language, targetSchemes)` → `RAGEcosystemResponse`
  - `getSingleSchemeEligibility(userQuery, schemeId, language)` → `EligibilityResult`
  - `determineNextTurn(userQuery, profile, answers, language, askedQuestions, candidateSchemes)` → `DynamicTurn`
  - `detectUserIntent(query)` → `string | null`
- **Logic flow:**
  1. `determineNextTurn` is called by `/api/query`. It embeds an enriched query via `gemini-embedding-001`.
  2. Searches Pinecone across relevant namespaces (one per scheme). Gets top-20 chunks.
  3. Builds a prompt asking Gemini "what eligibility info is still missing?"
  4. If Gemini returns `status: "questioning"` → return follow-up question + chips to frontend.
  5. If `status: "complete"` → call `queryMultiSchemeRAG` which does a batch eligibility check via Gemini.
  6. `queryMultiSchemeRAG` embeds, searches Pinecone, groups chunks by scheme, sends ONE batch prompt to Gemini for all schemes, parses JSON response into `EligibilityResult[]`.
  7. Multi-model fallback: tries `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.5-flash-lite` → `gemma-3-27b`. Also rotates across multiple API keys.
- **Key types:**
  - `EligibilityResult { schemeId, schemeName, eligible, reason, documents, nextSteps, benefits, confidence, sourceUrl, lastVerified }`
  - `DynamicTurn { status, question?, chips?, results? }`
  - `RAGEcosystemResponse { matchingSchemes, totalMatches, noMatch }`

#### `lib/conversational-engine.ts` — IMPLEMENTED (39 lines)
- **Exports:** `ConvPhase` type, `GOAL_SCHEME_MAP`, `inferSchemesFromQuery()`, `getCandidateSchemes()`
- **Logic:** Maps user goals (financial, health, housing, etc.) to scheme IDs. Regex keyword matching for Hindi/Marathi/English.

#### `lib/mock-messages.ts`
- **Logic:** Hardcoded sample chat messages for development/testing.

---

### 3.9 Lib — Config (`lib/config/`)

#### `lib/config/app.ts`
- **Exports:** `APP_NAME`, `APP_VERSION`, `APP_DESCRIPTION`

#### `lib/config/env.ts`
- **Logic:** Validate required env vars at startup. Throw descriptive errors if missing.

#### `lib/config/firebase.ts`
- **Imports:** `firebase/app`, `firebase/auth`, `firebase/firestore`
- **Logic:** Initialize Firebase app with env vars. Export `auth`, `db` instances. Guard against double-init.

#### `lib/config/gemini.ts`
- **Logic:** Export model name constants, fallback order, generation config (temperature, topP, maxTokens).

#### `lib/config/pinecone.ts`
- **Logic:** Export singleton Pinecone client. Initialize with `PINECONE_API_KEY`. Export `getIndex(indexName)` helper.

---

### 3.10 Lib — Schemes (`lib/schemes/`)

#### `lib/schemes/types.ts`
- **Exports:** `SchemeDefinition` interface: `{ id, name, shortDescription, fullDescription, eligibilityCriteria[], requiredDocuments[], benefits[], applicationSteps[], sourceUrl, category }`

#### Per-scheme files (`pm-kisan.ts`, `ayushman-bharat.ts`, `pmay-g.ts`, `mgnrega.ts`, `apy.ts`)
- **Exports:** `const SCHEME_DATA: SchemeDefinition` with full structured data.
- **Source:** Derived from `scheme_data/*.txt` raw text files.

#### `lib/schemes/index.ts`
- **Logic:** Barrel export. `getAllSchemes()`, `getSchemeById(id)`.

#### `lib/schemes/scheme_data/*.txt`
- **Content:** Raw government scheme text — eligibility, benefits, documents, application process. Used by `seed-pinecone.ts` to chunk and embed into Pinecone.

---

### 3.11 Lib — Services (`lib/services/`)

#### `lib/services/auth-service.ts`
- **Logic:** Wraps Firebase Auth. `signIn(email, password)`, `signUp(email, password, name)`, `signOut()`, `resetPassword(email)`.

#### `lib/services/user-service.ts`
- **Logic:** CRUD for user records. `createUser()`, `getUser(id)`, `updateUser(id, data)`, `deleteUser(id)`. Uses Firebase Firestore or DB models.

#### `lib/services/eligibility.ts`
- **Logic:** Rule-based pre-filter. `checkEligibility(profile, schemeId)` → `{ eligible, missingFields[] }`. Runs BEFORE RAG for quick disqualification (e.g., age range, state exclusion).

#### `lib/services/pdf-generator.ts`
- **Logic:** `generatePDF({ profile, schemes, documents, cscInfo })` → `Buffer`. Builds a PDF with: user details, eligible schemes list, required documents checklist, nearest CSC info, step-by-step instructions. Uses a Node PDF library (e.g., `pdfkit` or `@react-pdf/renderer`).

#### `lib/services/csc-service.ts`
- **Logic:** `findNearestCSC(state, district)` → `CSCCenter[]`. Looks up from `lib/constants/india-districts.ts` or a JSON data file. Returns `{ name, address, lat, lng, phone }`.

#### `lib/services/translation.ts`
- **Logic:** `translateText(text, targetLang)`. Wraps Gemini for on-the-fly translation. Caches results. Used when scheme data is only in English but user needs Hindi/Marathi.

---

### 3.12 Lib — DB (`lib/db/`)

#### `lib/db/models/User.ts`
- **Interface:** `{ id, email, name, phone, profile: UserProfile, createdAt, updatedAt }`

#### `lib/db/models/Scheme.ts`
- **Interface:** `{ id, name, category, description, eligibility, documents, benefits }`

#### `lib/db/models/Query.ts`
- **Interface:** `{ id, userId, queryText, language, answers, results, createdAt }`

#### `lib/db/queries/*.ts`
- **Logic:** Query helper functions. `getUserById()`, `getSchemesByCategory()`, `saveQuery()`, `getUserQueries()`.

#### `lib/db/migrations/init.ts`
- **Logic:** Initialize Firestore collections/indexes or run SQL migrations.

---

### 3.13 Lib — Hooks (`lib/hooks/`)

#### `useLocalStorage.ts`
- **Logic:** `useLocalStorage<T>(key, initialValue)` → `[value, setValue]`. Syncs React state with localStorage.

#### `useVoiceInput.ts`
- **Logic:** Wraps Web Speech API (`SpeechRecognition`). `start()`, `stop()`, `transcript`, `isListening`, `error`. ⚠️ Currently unstable — needs conservative lifecycle rewrite.

#### `useVoiceChat.ts`
- **Logic:** Combines `useVoiceInput` (STT) + TTS (`speechSynthesis`). Full voice conversation loop.

#### `useAuth.ts`
- **Logic:** Convenience hook wrapping `AuthContext`. Returns `{ user, login, logout, isAuthenticated }`.

#### `useLanguage.ts`
- **Logic:** Wraps `LanguageContext`. Returns `{ language, setLanguage, t(key) }`.

#### `useChatHistory.ts`
- **Logic:** Manages chat message array. `addMessage()`, `clearHistory()`. Persists to localStorage.

#### `useEligibility.ts`
- **Logic:** Tracks eligibility check state. Calls `/api/query` and processes `DynamicTurn` responses.

#### `useForm.ts`
- **Logic:** Generic form state manager. `values`, `errors`, `handleChange`, `handleSubmit`, `validate(rules)`.

#### `useFetch.ts`
- **Logic:** Generic fetch wrapper. `{ data, loading, error, refetch }`. Handles loading/error states.

#### `useDebounce.ts`
- **Logic:** Debounce a value by `delay` ms. Used for search inputs.

#### `useDarkMode.ts`
- **Logic:** Toggle dark mode. Wraps `ThemeContext`.

#### `useMobile.ts`
- **Logic:** `isMobile: boolean` based on viewport width. Used for responsive layouts.

#### `useAccessibility.ts`
- **Logic:** Wraps `AccessibilityContext`. Returns `{ fontSize, highContrast, readingMode, setFontSize, toggleContrast }`.

---

### 3.14 Lib — i18n (`lib/i18n/`)

#### `lib/i18n/index.ts`
- **Logic:** Load translation JSON files. Export `getTranslation(lang, key)`.

#### `lib/i18n/useTranslation.ts`
- **Logic:** Hook: `const { t } = useTranslation()`. Reads `LanguageContext`, returns `t(key)` function that looks up from loaded JSON.

#### `lib/i18n/en.json`, `hi.json`, `mr.json`
- **Content:** Flat key-value translation maps. Keys: `greeting`, `search_placeholder`, `schemes_found`, `no_results`, `submit`, `loading`, etc.

---

### 3.15 Lib — Middleware (`lib/middleware/`)

#### `auth-middleware.ts`
- **Logic:** Verify JWT/session token from request headers. Attach `userId` to request context. Return 401 if invalid.

#### `rate-limit-middleware.ts`
- **Logic:** In-memory rate limiter. Track requests per IP. Return 429 if exceeded (e.g., 30 req/min).

#### `error-middleware.ts`
- **Logic:** Catch unhandled errors. Log with correlation ID. Return standardized `{ error, message, code }` responses.

#### `logger-middleware.ts`
- **Logic:** Log request method, path, duration, status code. Structured JSON logging.

---

### 3.16 Components — Chat

#### `components/features/chat/ChatBox/ChatBox.tsx`
- **Imports:** `ChatInput`, `ChatMessage`, `QuestionJumper`, `useChat`, `useLanguage`, `useApp`
- **Logic:**
  1. Render scrollable message list from `ChatContext.messages`.
  2. When user sends a message → call `ChatContext.sendMessage(text)`.
  3. `sendMessage` POSTs to `/api/query` with `{ userQuery, language, profile, answers, askedQuestions, candidateSchemes }`.
  4. If response is `questioning` → append AI question + render `QuestionJumper` chips.
  5. If response is `complete` → append results, render `EligibilityCard` for each scheme.
  6. Handle file uploads (trigger simulated doc acknowledgment).
  7. Voice toggle button → `useVoiceInput.start()/stop()`.
- **State flow:** `AppContext.userProfile` → sent with each query. `ChatContext` manages messages, answers, askedQuestions.

#### `components/features/chat/ChatInput/ChatInput.tsx`
- **Props:** `onSend(text)`, `disabled`, `placeholder`
- **Logic:** Text input + send button + file attach button + mic button. Auto-resize textarea.

#### `components/features/chat/ChatMessage/ChatMessage.tsx`
- **Props:** `message: { role, content, schemes?, followUp? }`
- **Logic:** Renders user/AI messages differently. If `schemes` present → render `EligibilityCard` list. If `followUp` → render question text.

#### `components/features/chat/QuestionJumper/QuestionJumper.tsx`
- **Props:** `chips: { label, value }[]`, `onSelect(value)`
- **Logic:** Render chip buttons. On click → call `onSelect(value)` which adds to `answers` and sends next turn.

---

### 3.17 Components — Features

#### `components/features/HomeDashboard.tsx`
- **Logic:** Hero section + suggested queries grid. "Ask about farming schemes", "Health insurance", etc. On click → sets `ChatContext.prefillQuery`.

#### `components/features/OnboardingWizard.tsx`
- **Logic:** Multi-step form (4 steps): Name/Age/Gender → State/District → Employment/Income → Assets/Family.
  - Districts from `lib/constants/india-districts.ts`.
  - On completion → `AppContext.setProfile(data)` + save to localStorage.

#### `components/features/LanguageSelect.tsx`
- **Logic:** Dropdown/buttons for en/hi/mr. Calls `LanguageContext.setLanguage()`.

---

### 3.18 Components — Schemes

#### `components/features/schemes/EligibilityCard/EligibilityCard.tsx`
- **Props:** `result: EligibilityResult`
- **Logic:** Card with scheme name, eligibility badge (green/yellow/red), benefits table, required documents list, next steps, confidence indicator. Sub-components: `EligibilityBadge`, `BenefitsTable`, `DocumentsList`, `ApplicationStepsCard`.

---

### 3.19 Components — Output

#### `components/features/output/PDFDownload/PDFDownload.tsx`
- **Logic:** Button that calls `GET /api/pdf-download?queryId=xxx`. Downloads the generated PDF. Shows loading state.

#### `components/features/output/CSCLocator/CSCLocator.tsx`
- **Logic:** Takes `state`/`district` from profile. Calls `GET /api/csc-locator`. Displays list/map of nearby CSC centers.

#### `components/features/output/VideoTutorial/VideoTutorial.tsx`
- **Logic:** Embedded video player with step-by-step application tutorial for a scheme.

---

### 3.20 Components — UI Primitives (`components/ui/`)

Each folder exports a styled, reusable component: `Button`, `Card`, `Input`, `Select`, `Modal`, `Toast`, `Tooltip`, `Tabs`, `Skeleton`, `LoadingSpinner`, `ProgressBar`, `ErrorBoundary`. All use Tailwind CSS classes + CSS variables from `styles/variables.css`.

---

### 3.21 Components — Layout (`components/layout/`)

- **Navbar/** — Logo, nav links, language select, auth buttons, mobile hamburger
- **Footer/** — Links, copyright, social
- **Sidebar/** — Dashboard sidebar with nav items (Dashboard, Profile, Settings, Saved Schemes)
- **Header/** — Page-level header with breadcrumb
- **MobileNav/** — Bottom tab nav for mobile

---

### 3.22 Scripts (`scripts/`)

#### `scripts/seed-pinecone.ts` — CRITICAL
- **Logic:**
  1. Read `lib/schemes/scheme_data/*.txt` files.
  2. Chunk each file into ~500-token segments.
  3. Embed each chunk using `gemini-embedding-001`.
  4. Upsert to Pinecone under namespace = schemeId (e.g., `pm-kisan`, `ayushman`).
  5. Metadata per vector: `{ schemeId, text, chunkIndex }`.

#### `scripts/seed-all-schemes-with-namespaces.ts`
- **Logic:** Same as above but processes all 5 schemes in sequence.

#### `scripts/seed-db.ts`
- **Logic:** Seed Firebase/DB with initial scheme records and test users.

#### `scripts/test-rag-and-api.ts`
- **Logic:** End-to-end test: call `determineNextTurn()` with sample queries, verify response format.

---

### 3.23 Styles (`styles/`)

#### `globals.css`
- `@tailwind base; @tailwind components; @tailwind utilities;` + CSS reset + base body styles.

#### `variables.css`
- CSS custom properties: `--color-primary`, `--color-bg`, `--font-size-base`, `--radius`, etc. Dark mode overrides via `[data-theme="dark"]`.

#### `animations.css`
- Keyframe animations: `fadeIn`, `slideUp`, `pulse`, `shimmer` (for skeletons).

#### `typography.css`
- Font face declarations, heading scales, body text styles.

#### `responsive.css`
- Breakpoint-specific overrides for mobile/tablet/desktop.

---

## 4. State Management & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    React Context Tree                         │
│                                                              │
│  ThemeContext (dark/light)                                    │
│   └─ LanguageContext (en/hi/mr)                              │
│       └─ AccessibilityContext (fontSize, contrast)           │
│           └─ AuthContext (user, isAuthenticated)              │
│               └─ AppContext (userProfile, isOnboarded)        │
│                   └─ ChatContext (messages, answers, schemes) │
└─────────────────────────────────────────────────────────────┘

Data Flow per Chat Turn:
1. User types → ChatInput.onSend(text)
2. ChatContext.sendMessage(text) → POST /api/query
   Payload: { userQuery, language, profile, answers, askedQuestions, candidateSchemes }
3. Server: determineNextTurn() → embed → Pinecone search → Gemini prompt
4. Response: { status: "questioning", question, chips } OR { status: "complete", results }
5. ChatContext updates messages[], answers{}, askedQuestions[]
6. UI re-renders: ChatMessage + QuestionJumper or EligibilityCard

Persistence:
- userProfile → localStorage (via useLocalStorage)
- chatHistory → localStorage (via useChatHistory)
- user account → Firebase Auth + Firestore
- scheme vectors → Pinecone (seeded offline)
```

---

## 5. Implementation Sequence — Ordered Prompts

Use these prompts in order. Each builds on the previous.

---

### Phase 1: Foundation

**Step 1 — Environment & Config**
> "Write the config files: `lib/config/env.ts` (validate all env vars), `lib/config/app.ts` (app constants), `lib/config/firebase.ts` (Firebase init with guard), `lib/config/gemini.ts` (model names, fallback order, generation config), `lib/config/pinecone.ts` (singleton client). Use the exact env var names from .env.local."

**Step 2 — TypeScript Types & Interfaces**
> "Write all shared types: `lib/schemes/types.ts` (SchemeDefinition), `lib/rag/types.ts` (EligibilityResult, DynamicTurn, RAGEcosystemResponse, ChatMessage), `lib/db/models/User.ts`, `lib/db/models/Scheme.ts`, `lib/db/models/Query.ts`, `types/speech.d.ts` (Web Speech API augmentation)."

**Step 3 — Constants**
> "Write `lib/constants/api-endpoints.ts`, `lib/constants/routes.ts`, `lib/constants/messages.ts`, `lib/constants/validation-rules.ts`. Write `lib/constants/india-districts.ts` with a complete district-by-state mapping for all Indian states."

---

### Phase 2: Data Layer

**Step 4 — Scheme Data Files**
> "Write the 5 scheme definition files: `lib/schemes/pm-kisan.ts`, `ayushman-bharat.ts`, `pmay-g.ts`, `mgnrega.ts`, `apy.ts`, each exporting a `SchemeDefinition` object. Write `lib/schemes/index.ts` barrel export. Ensure `lib/schemes/scheme_data/*.txt` raw text files have comprehensive content."

**Step 5 — Database Layer**
> "Write `lib/db/queries/user-queries.ts`, `scheme-queries.ts`, `query-queries.ts` with Firestore CRUD helpers. Write `lib/db/migrations/init.ts`."

**Step 6 — Seeding Scripts**
> "Write `scripts/seed-pinecone.ts`: read scheme_data/*.txt, chunk into 500-token segments, embed via gemini-embedding-001, upsert to Pinecone under per-scheme namespaces. Write `scripts/seed-db.ts` for initial data."

---

### Phase 3: Core AI Engine

**Step 7 — RAG Pipeline (already implemented)**
> "Review and refactor `lib/rag-pipeline.ts`. Extract reusable parts into `lib/rag/gemini-client.ts` (model fallback logic), `lib/rag/pinecone-client.ts` (search helper), `lib/rag/prompts.ts` (all prompt templates). Keep `lib/rag-pipeline.ts` as the orchestrator."

**Step 8 — Conversational Engine Enhancement**
> "Enhance `lib/conversational-engine.ts`: add more goal categories, improve Hindi/Marathi keyword matching, add `determinePhase()` function that decides between idle → goal → questions → rag transitions."

**Step 9 — Services**
> "Write `lib/services/eligibility.ts` (rule-based pre-filter), `lib/services/pdf-generator.ts` (generate PDF with pdfkit), `lib/services/csc-service.ts` (district CSC lookup), `lib/services/translation.ts` (Gemini-powered translation with cache), `lib/services/auth-service.ts`, `lib/services/user-service.ts`."

---

### Phase 4: API Routes

**Step 10 — Query API (already done)**
> "Verify `app/api/query/route.ts` works end-to-end with the refactored pipeline."

**Step 11 — Scheme APIs**
> "Write `app/api/schemes/route.ts`, `[id]/route.ts`, `search/route.ts`, `steps/route.ts`."

**Step 12 — Output APIs**
> "Write `app/api/pdf-download/route.ts` (calls pdf-generator, streams PDF), `app/api/csc-locator/route.ts` (calls csc-service)."

**Step 13 — Auth & User APIs**
> "Write `app/api/auth/login/route.ts`, `register/route.ts`, `logout/route.ts`, `app/api/users/route.ts`, `[id]/route.ts`, `[id]/profile/route.ts`. Use Firebase Auth + auth-middleware."

---

### Phase 5: Context & Hooks

**Step 14 — Context Providers**
> "Implement all 6 context providers in `context/`: AppContext, AuthContext, ChatContext, LanguageContext, ThemeContext, AccessibilityContext. Follow the interfaces defined in section 3.7."

**Step 15 — Custom Hooks**
> "Implement all hooks in `lib/hooks/`: useLocalStorage, useAuth, useChatHistory, useLanguage, useVoiceInput (conservative lifecycle), useVoiceChat, useEligibility, useForm, useFetch, useDebounce, useDarkMode, useMobile, useAccessibility."

**Step 16 — i18n**
> "Write `lib/i18n/index.ts`, `useTranslation.ts`, and complete `en.json`, `hi.json`, `mr.json` with all UI strings."

---

### Phase 6: UI Components

**Step 17 — UI Primitives**
> "Write all components in `components/ui/`: Button, Card, Input, Select, Modal, Toast, Tooltip, Tabs, Skeleton, LoadingSpinner, ProgressBar, ErrorBoundary. Use Tailwind + CSS variables. Each folder has index.ts barrel export."

**Step 18 — Layout Components**
> "Write `components/layout/`: Navbar (responsive, with lang select + auth), Footer, Sidebar (dashboard nav), Header, MobileNav (bottom tabs)."

**Step 19 — Chat Components**
> "Write ChatBox, ChatInput, ChatMessage, QuestionJumper, useChatHistory. ChatBox must integrate with ChatContext for the full query loop."

**Step 20 — Feature Components**
> "Write HomeDashboard, OnboardingWizard (4-step form), LanguageSelect, VoiceChat. Write scheme components: EligibilityCard (with Badge, BenefitsTable, DocumentsList, ApplicationStepsCard), SchemeCard, SchemeDetail, SchemeFilter, SchemeGrid, SchemeSearch."

**Step 21 — Output Components**
> "Write PDFDownload, CSCLocator, ShareResults, VideoTutorial."

**Step 22 — Dashboard Components**
> "Write DashboardGrid, StatsCard, ActivityChart, SavedSchemes."

**Step 23 — Auth Components**
> "Write LoginForm (with useLoginForm hook + test), SignupForm, ForgotPasswordForm, ProtectedRoute."

**Step 24 — Accessibility Components**
> "Write AccessibilityPanel, FontSizeControl, HighContrastToggle, ReadingModeToggle."

**Step 25 — User Components**
> "Write UserProfile, UserSettings, NotificationSettings, PreferencePanel."

---

### Phase 7: Pages

**Step 26 — Root Layout & Error Pages**
> "Write `app/layout.tsx` (nest all providers), `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`."

**Step 27 — Public Pages**
> "Write `app/(public)/layout.tsx`, `page.tsx` (landing), `about/page.tsx`, `pricing/page.tsx`, `voice-chat/page.tsx`, blog pages."

**Step 28 — Auth Pages**
> "Write login, signup, forgot-password, reset-password pages."

**Step 29 — Dashboard Pages**
> "Write `app/(dashboard)/layout.tsx`, `dashboard/page.tsx`, `profile/page.tsx`, `settings/page.tsx`, `[userId]/page.tsx`."

---

### Phase 8: Styles & Polish

**Step 30 — Styling**
> "Write `styles/globals.css`, `variables.css` (design tokens for light/dark), `animations.css`, `typography.css`, `responsive.css`, `tailwind.css`."

---

### Phase 9: Middleware & Security

**Step 31 — Middleware**
> "Write `lib/middleware/auth-middleware.ts`, `rate-limit-middleware.ts`, `error-middleware.ts`, `logger-middleware.ts`. Apply auth middleware to protected API routes."

---

### Phase 10: Testing & Verification

**Step 32 — Test Infrastructure**
> "Write `__tests__/mocks/handlers.ts` (MSW handlers for API mocking). Write e2e specs: `eligibility-check.spec.ts`, `pdf-download.spec.ts`, `voice-input.spec.ts`."

**Step 33 — Script Tests**
> "Write `scripts/test-rag-and-api.ts` (full pipeline test), `scripts/test-integrated.ts` (integration test hitting all endpoints)."

---

## 6. Key API Contracts

### POST `/api/query`
```json
// Request
{
  "userQuery": "Tell me about housing schemes",
  "language": "en",
  "profile": { "name": "Asha", "age": 34, "state": "Maharashtra", "district": "Pune", "employment": "Unemployed" },
  "answers": { "ownsLand": "no", "bpl": "yes" },
  "askedQuestions": ["ownsLand"],
  "candidateSchemes": ["pmay-g", "pm-kisan"]
}

// Response (questioning)
{
  "status": "questioning",
  "question": "Do you have a ration card?",
  "chips": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]
}

// Response (complete)
{
  "status": "complete",
  "results": {
    "matchingSchemes": [{
      "schemeId": "pmay-g",
      "schemeName": "PMAY-G (Awas Yojana)",
      "eligible": true,
      "reason": "You qualify based on BPL status and no existing home.",
      "documents": ["Aadhaar Card", "BPL Certificate", "Land Document"],
      "nextSteps": ["Visit nearest CSC", "Fill Form-A", "Submit documents"],
      "benefits": "₹1,20,000 for new house construction in plain areas",
      "confidence": "High",
      "sourceUrl": "https://pmayg.nic.in",
      "lastVerified": "2026-03-01"
    }],
    "totalMatches": 1,
    "noMatch": []
  }
}
```

### GET `/api/csc-locator?state=Maharashtra&district=Pune`
```json
{
  "district": "Pune", "state": "Maharashtra",
  "cscCenters": [
    { "name": "Pune CSC - Shivajinagar", "address": "123 Main Rd", "lat": 18.5167, "lng": 73.8565, "phone": "020-XXXXXXX" }
  ]
}
```

### GET `/api/pdf-download?queryId=abc123`
→ Binary PDF stream, `Content-Disposition: attachment; filename="schemesetu-application.pdf"`

---

## 7. Environment Variables Reference

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Client+Server | Primary Gemini API key |
| `NEXT_PUBLIC_GEMINI_API_KEY_BACKUP` | Client+Server | Fallback Gemini key |
| `PINECONE_API_KEY` | Server only | Pinecone API key |
| `PINECONE_INDEX_NAME` | Server only | Pinecone index name |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | Firebase messaging ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client | Firebase app ID |

---

*Generated from live codebase analysis on 2026-03-25. This specification covers all 200+ files in the project tree.*
