# Phase 17: Auto-Fill PM-KISAN

## Goal

Let an eligible PM-KISAN user provide missing inputs, upload required documents, complete OTP login, run guided auto-fill through MCP + Gemini + Puppeteer, and store progress and results in Firestore and Cloudinary without breaking any existing AI flow.

## Locked Decisions

1. Existing AI connections must not break.
2. Auto-fill V1 supports PM-KISAN only.
3. Uploaded files live in Cloudinary.
4. Session data, progress, metadata, and results live in Firestore.
5. OTP stays manual and user-controlled.
6. Gemini is only for reasoning and field mapping, not free-form browser control.
7. PDF conversion, compression, and normalization are deferred to a later phase.
8. If a file is too large, too small, corrupted, or unsupported, V1 validates and rejects it with clear messaging.
9. The feature must be additive and isolated from current chat, OCR, RAG, voice, and eligibility flows.

## Architecture

App flow:

1. Eligibility result identifies a supported PM-KISAN case.
2. Scheme card shows an Auto-Fill CTA behind a feature flag.
3. User sees what data the app already has and what is still missing.
4. User uploads missing documents and enters missing fields.
5. Next.js creates and persists an auto-fill session in Firestore.
6. Files are uploaded to Cloudinary and only metadata is stored in Firestore.
7. User starts automation.
8. Next.js orchestration layer calls the MCP server.
9. MCP server uses Puppeteer to drive the portal deterministically.
10. Gemini helps map portal labels to known schema fields, but cannot drive arbitrary browser behavior.
11. Flow pauses for OTP and resumes only after the user provides it.
12. Final confirmation, screenshots, and status are persisted and shown in the app.

System shape:

1. Next.js app
2. Next.js API routes
3. Firestore for session and progress state
4. Cloudinary for uploaded documents and optional confirmation screenshots
5. MCP Node server for deterministic browser tools
6. Puppeteer for portal automation
7. Gemini for mapping and reasoning only

## Wave Structure

1. Wave 1
   - 17-01 Foundation and guardrails
   - 17-02 Data contracts and storage adapters
2. Wave 2
   - 17-03 MCP automation engine and PM-KISAN adapter
   - 17-04 App UI flow and API integration
3. Wave 3
   - 17-05 Real portal hardening, non-regression checks, and rollout gate

## 17-01 Foundation And Guardrails

### Objective

Create the isolated auto-fill foundation so the feature can consume existing eligibility and document data without changing current AI behavior.

### Files

- lib/types/auto-fill.ts
- lib/services/auto-fill/feature-gates.ts
- lib/services/auto-fill/source-data.ts
- lib/services/auto-fill/pm-kisan-requirements.ts
- lib/services/auto-fill/file-validation.ts
- lib/i18n/types.ts
- lib/i18n/langs/en.ts
- lib/i18n/langs/hi.ts
- lib/i18n/langs/mr.ts
- lib/i18n/langs/bn.ts
- lib/i18n/langs/gu.ts
- lib/i18n/langs/kn.ts
- lib/i18n/langs/te.ts
- lib/i18n/langs/ur.ts
- components/features/schemes/EligibilityCard/EligibilityCard.tsx

### Tasks

1. Define the auto-fill domain types.
   Types must cover:
   - session id
   - scheme id and scheme slug
   - applicant snapshot
   - supported scheme metadata
   - missing fields
   - required documents
   - uploaded documents
   - progress state
   - OTP state
   - result state
   - Firestore references
   - Cloudinary metadata
   - portal confirmation data
   - recoverable error shape
2. Create an additive source-data adapter.
   - Read from the current user profile, extracted document data, and eligibility result shape.
   - Do not alter current chat, RAG, OCR, or recommendation logic.
   - Treat current AI flows as read-only dependencies.
3. Define PM-KISAN-specific requirements and validation.
   - Compute what the app already has.
   - Compute what the user still needs to provide.
   - Determine which fields can be auto-filled.
   - Determine which documents are mandatory before launch.
4. Add file validation only, not conversion.
   - Reject unsupported mime types.
   - Reject PDFs outside V1 size limits.
   - Reject empty or corrupt uploads.
   - Error text must clearly state that file conversion is not available yet.
5. Add the i18n contract for the new auto-fill UI states.
   - CTA label
   - requirements panel labels
   - document validation errors
   - OTP step labels
   - progress step labels
   - success and failure states

### Verify

1. Types compile cleanly.
2. Existing eligibility and chat flows still build without behavior changes.
3. PM-KISAN requirement calculation can run from mocked user data and return a stable have-vs-need payload.
4. i18n keys exist for the new auto-fill states.

### Done

1. Auto-fill has a clean internal contract.
2. Existing AI connections remain protected.
3. PM-KISAN V1 scope and file rules are encoded in code.

## 17-02 Data Contracts And Storage Adapters

### Objective

Create Firestore and Cloudinary adapters for session state and files before building browser automation.

### Files

- lib/services/auto-fill/firestore-sessions.ts
- lib/services/auto-fill/firestore-events.ts
- lib/services/auto-fill/firestore-results.ts
- lib/services/auto-fill/cloudinary-documents.ts
- lib/services/auto-fill/session-service.ts
- app/api/auto-fill/sessions/route.ts
- app/api/auto-fill/sessions/[sessionId]/route.ts
- app/api/auto-fill/sessions/[sessionId]/requirements/route.ts
- app/api/auto-fill/sessions/[sessionId]/documents/route.ts

### Tasks

1. Create the Firestore persistence model.
   Recommended collections:
   - autoFillSessions
   - autoFillEvents
   - autoFillResults
2. Define the session document shape.
   Each session document should store:
   - scheme id
   - user id
   - current state
   - applicant snapshot
   - missing field status
   - uploaded document references
   - portal progress
   - OTP pending flag
   - error summary
   - createdAt and updatedAt
3. Create the Cloudinary upload wrapper for auto-fill documents.
   - Accept document type and file payload.
   - Validate with the V1 file rules.
   - Upload to a dedicated folder namespace.
   - Return public id, secure URL, bytes, mime type, and original filename.
   - Store only metadata in Firestore session documents.
4. Create session lifecycle APIs.
   Endpoints should support:
   - create session from an eligible scheme
   - fetch session details
   - calculate and persist missing requirements
   - upload and attach documents
5. Keep these APIs isolated from existing AI endpoints.
   - Do not destabilize current chat or scheme-query routes.
   - Add an adapter layer instead of reworking current service contracts.

### Verify

1. Firestore can write and read a full auto-fill session.
2. Cloudinary uploads return stored metadata and URLs.
3. Invalid PDFs are rejected with explicit user-facing errors.
4. Session creation from a known PM-KISAN eligibility result works without touching current AI endpoints.

### Done

1. The app can create and persist an auto-fill session.
2. Documents are stored in Cloudinary and referenced in Firestore.
3. File validation works without conversion logic.

## 17-03 MCP Automation Engine And PM-KISAN Adapter

### Objective

Build the browser automation backend as a separate deterministic engine with human-in-the-loop OTP.

### Files

- mcp/pm-kisan-autofill/package.json
- mcp/pm-kisan-autofill/src/server.ts
- mcp/pm-kisan-autofill/src/types.ts
- mcp/pm-kisan-autofill/src/tools/browser.ts
- mcp/pm-kisan-autofill/src/tools/forms.ts
- mcp/pm-kisan-autofill/src/tools/uploads.ts
- mcp/pm-kisan-autofill/src/tools/progress.ts
- mcp/pm-kisan-autofill/src/portals/pm-kisan/selectors.ts
- mcp/pm-kisan-autofill/src/portals/pm-kisan/login.ts
- mcp/pm-kisan-autofill/src/portals/pm-kisan/fill.ts
- mcp/pm-kisan-autofill/src/portals/pm-kisan/submit.ts
- mcp/pm-kisan-autofill/src/portals/pm-kisan/confirm.ts
- lib/services/auto-fill/mcp-client.ts
- lib/services/auto-fill/gemini-mapper.ts
- lib/services/auto-fill/automation-runner.ts
- app/api/auto-fill/sessions/[sessionId]/start/route.ts
- app/api/auto-fill/sessions/[sessionId]/otp/route.ts
- app/api/auto-fill/sessions/[sessionId]/status/route.ts
- app/api/auto-fill/sessions/[sessionId]/cancel/route.ts

### Tasks

1. Build the MCP server with deterministic tool boundaries.
   Tools should cover:
   - launch browser
   - open PM-KISAN URL
   - wait for selector
   - fill input
   - select option
   - upload file
   - click button
   - read visible labels
   - capture screenshot
   - extract confirmation details
   - pause for OTP
   - resume after OTP
2. Keep Gemini constrained.
   - Gemini may only map portal labels to known session fields.
   - Gemini may help identify missing data from dynamic text.
   - Every Gemini output must be validated against typed schema before any browser step executes.
   - Gemini must not invent tools or drive arbitrary browser actions.
3. Build the PM-KISAN portal adapter.
   - Isolate selectors and heuristics under the PM-KISAN folder.
   - Keep portal changes from spilling into the app layer.
4. Build the Next.js orchestration layer.
   The runner should:
   - read the session from Firestore
   - resolve uploaded documents from Cloudinary metadata
   - start the MCP flow
   - emit progress events to Firestore
   - stop and wait at OTP
   - resume after OTP
   - persist screenshots, confirmation number, and final result state
5. Add failure handling.
   Handle:
   - selector mismatch
   - upload failure
   - OTP timeout
   - navigation timeout
   - confirmation extraction failure

### Verify

1. The automation engine runs against a controlled mock page and emits the full state progression.
2. OTP pause and resume works without losing session state.
3. Cloudinary-backed file references can be uploaded through Puppeteer.
4. Failure states are captured in Firestore with actionable error text.

### Done

1. The backend can run an end-to-end PM-KISAN auto-fill session in a controlled environment.
2. OTP remains human-controlled.
3. Existing AI inference paths remain isolated from automation logic.

## 17-04 App UI Flow And API Integration

### Objective

Add the visible app flow from eligible scheme card to missing-data collection, OTP entry, live progress, and success screen.

### Files

- components/features/output/AutoFill/AutoFillLaunchButton.tsx
- components/features/output/AutoFill/AutoFillRequirementsPanel.tsx
- components/features/output/AutoFill/AutoFillDocumentUploader.tsx
- components/features/output/AutoFill/AutoFillOtpStep.tsx
- components/features/output/AutoFill/AutoFillProgressPanel.tsx
- components/features/output/AutoFill/AutoFillResultPanel.tsx
- components/features/output/AutoFill/AutoFillModal.tsx
- components/features/schemes/EligibilityCard/AutoFillCta.tsx
- components/features/schemes/EligibilityCard/EligibilityCard.tsx
- lib/hooks/useAutoFillSession.ts
- app/api/auto-fill/sessions/[sessionId]/events/route.ts
- lib/i18n/types.ts
- lib/i18n/langs/en.ts
- lib/i18n/langs/hi.ts
- lib/i18n/langs/mr.ts
- lib/i18n/langs/bn.ts
- lib/i18n/langs/gu.ts
- lib/i18n/langs/kn.ts
- lib/i18n/langs/te.ts
- lib/i18n/langs/ur.ts

### Tasks

1. Add the PM-KISAN-only launch CTA to eligible schemes.
   Show the button only when:
   - the user is eligible
   - the scheme is PM-KISAN
   - the feature flag is enabled
2. Build the missing-data collection flow.
   The UI should show:
   - already available data
   - required but missing fields
   - required documents
   - validation results
   - explicit file rejection messages for unsupported or oversized PDFs
3. Upload documents through the new API.
   - Store files in Cloudinary.
   - Update session metadata in Firestore.
4. Build the live execution flow.
   The user should see:
   - portal opening
   - login step
   - waiting for OTP
   - field-by-field progress
   - document upload step
   - submission state
   - confirmation data
   - failure recovery state
5. Build the result surface.
   Show:
   - confirmation number
   - screenshot preview if captured
   - tracking link if available
   - saved session state for later review

### Verify

1. An eligible PM-KISAN card can launch the auto-fill flow from the existing scheme UI.
2. The user can upload missing documents and enter missing fields.
3. OTP can be entered in-app and the session resumes.
4. Success and failure states are understandable and persisted.

### Done

1. The app provides a complete user-facing auto-fill journey.
2. The feature is additive and does not disturb existing eligibility or chat UX.

## 17-05 Real Portal Hardening, Non-Regression Checks, And Rollout Gate

### Objective

Run the real integration hardening and explicitly verify that existing AI-assisted flows did not regress.

### Files

- **tests**/integration/services/auto-fill-session.test.ts
- **tests**/integration/api/auto-fill-sessions.test.ts
- **tests**/e2e/auto-fill-pm-kisan.spec.ts
- **tests**/mocks/pm-kisan portal fixtures
- scripts/test-auto-fill-mock.ts
- README.md
- WORKSPACE_OVERVIEW.md

### Tasks

1. Add automated non-regression checks.
   Cover:
   - session creation
   - document upload validation
   - OTP pause and resume
   - confirmation persistence
   - no breakage to existing eligibility and scheme-card flow
2. Add a controlled real-portal validation checklist.
   Verify:
   - selectors still match
   - login path behaves as expected
   - manual OTP handoff is clear
   - confirmation capture works
3. Add rollout protection.
   - Use a feature flag so the PM-KISAN CTA can be disabled quickly without affecting the rest of the app if the portal changes.
4. Document setup and operational constraints.
   - MCP service startup
   - required env vars
   - dry-run or mock mode expectations
   - known portal brittleness risks

### Verify

1. Integration and E2E tests pass for the mock flow.
2. The existing AI-assisted scheme discovery and eligibility flow still work.
3. The feature flag can disable auto-fill cleanly.
4. A live portal smoke test succeeds before broad exposure.

### Done

1. The feature is safe to ship behind a flag.
2. Existing AI connections are verified not to have regressed.
3. PM-KISAN auto-fill is ready for controlled rollout.

## Must-Haves

1. A PM-KISAN-eligible user can see an auto-fill option in the scheme result flow.
2. The app can tell the user exactly which fields and documents are still missing.
3. Documents are stored in Cloudinary and session state is stored in Firestore.
4. The user must manually enter OTP before submission continues.
5. The app shows live, trustworthy progress during browser automation.
6. The user receives confirmation details after success.
7. Existing AI-assisted chat, OCR, RAG, voice, and eligibility flows continue to work unchanged.
8. Unsupported or invalid PDFs are rejected clearly without conversion in V1.

## Artifacts

1. Auto-fill types and validation utilities.
2. Firestore session, event, and result adapters.
3. Cloudinary document upload adapter.
4. MCP server with PM-KISAN portal adapter.
5. Start, status, OTP, cancel, requirements, and document APIs.
6. UI for CTA, missing-data collection, OTP, progress, and confirmation.
7. Feature flag and non-regression tests.

## Key Links

1. Existing eligibility result to PM-KISAN-only auto-fill CTA.
2. Session APIs to Firestore state.
3. Document uploader to Cloudinary metadata persistence.
4. Next.js automation runner to MCP tools.
5. OTP UI to paused session resume.
6. Final portal confirmation to stored result and user-facing confirmation panel.
7. Feature flag to safe rollback without affecting other AI features.

## Explicit Deferred Scope

Do not include these in V1:

1. PDF compression
2. PDF size normalization
3. format conversion
4. image-to-PDF conversion
5. automatic repair of malformed files

V1 behavior should be:

1. validate
2. accept or reject
3. explain what the user must re-upload

## Risks And Controls

1. Portal markup changes
   - Control: isolate selectors in the PM-KISAN adapter and ship behind a feature flag.
2. OTP timeout and user drop-off
   - Control: use resumable Firestore session state and explicit pause/resume UX.
3. File upload incompatibility
   - Control: validate early and reject clearly without attempting hidden conversion.
4. Gemini mis-mapping a field
   - Control: validate mapping output against typed schema before any browser action.
5. Regression in current AI flows
   - Control: additive services only, isolated APIs, and explicit non-regression tests.

## Recommended Execution Order

1. Build 17-01 first to freeze contracts and protect current AI behavior.
2. Build 17-02 next so storage and file handling are stable.
3. Build 17-03 and 17-04 in parallel once contracts are fixed.
4. Finish with 17-05 before exposing the feature broadly.

## Exit Criteria

1. PM-KISAN auto-fill works end to end in a controlled environment.
2. Manual OTP handoff works without state loss.
3. Files are persisted in Cloudinary and session state in Firestore.
4. Existing AI-assisted behavior is unchanged outside the new flow.
5. The feature can be disabled safely with a feature flag.
