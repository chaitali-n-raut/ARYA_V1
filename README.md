<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/61256105-feea-44c8-8971-2a5d22aeabe3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Data model & roles (TalentLink update)

All application data is persisted by the backend in `backend/data/db.json`; the browser is not used as the application database. No demo data ships with the app.

- **T&P Officer** creates / edits / deletes drives, publishes or unpublishes them (drafts are invisible to students), and moves applications through *Applied → Under Review → Shortlisted → Interview → Selected / Rejected*.
- **Student** sees only published drives, with eligibility computed from their own profile (CGPA, branch, graduation year, backlogs) and applies once per drive.
- **Faculty/Mentor** sees only students whose `Mentor` / `Mentor_Email` maps to them (blank mentor in a CSV = the uploader) and those students' applications (read-only).
- **CSV imports** are separate batches (`BATCH-001`, …). Each student record carries `Import_Batch_ID`; *Delete CSV* removes only that batch. Duplicate `Student_ID`s are skipped, never overwritten.
- **Start with Clean Slate** (T&P header) wipes students, imports, drives, applications and notifications, but keeps accounts and roles.
- The frontend uses an in-memory cache only. Authentication is maintained by an HttpOnly server cookie, while persistent application data lives in the backend tenant-scoped database.

## Institution-aware registration and branding

ARYA now uses three registration paths:

1. **Register as Student / Faculty** — joins an already registered institution.
2. **Register Your Institution** — creates a new isolated college tenant and its first T&P account.
3. **Sign In** — existing users select their institution when needed and open their role workspace.

After authentication, protected workspaces display the authenticated institution name from the backend tenant record. The college name is not hardcoded in the frontend.

## Gemini AI integration

The backend already includes Google Gemini integration through `@google/genai`. The flow is:

`student profile -> local ML prediction -> grounded prompt -> Gemini -> AI coaching`

Set `GEMINI_API_KEY` in `backend/.env`. The key stays on the backend and is never placed in React/browser code.


### Institution verification
New colleges now follow a controlled onboarding flow: registration request -> Platform Admin review -> approval -> one-time T&P invitation -> invitation acceptance -> active tenant. A visitor cannot immediately create an active college workspace.
