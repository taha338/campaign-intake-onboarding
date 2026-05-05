# Campaign Intake — Operation 1776

Vercel app that collects operational onboarding details for a campaign or
party / movement. Form 1 of three in the Operation 1776 onboarding pipeline.

## Stack
- Vite 8 + React 19
- Tailwind 4 (`@tailwindcss/vite`)
- Framer Motion (animations)
- Supabase JS (submission storage)
- ClickUp REST API (server-side proxy via Vercel API routes)

## Local dev
```
npm install
npm run dev
# open http://localhost:5174/?client_id=CI-0184
```

## Required Vercel env vars

Set under Project Settings → Environment Variables. None are committed.

| Var | Purpose |
|---|---|
| `CLICKUP_API_TOKEN` | ClickUp personal API token (server-side only) |
| `CLICKUP_ACTIVE_CLIENTS_LIST_ID` | List ID of the master Active Clients list (default `901113554047`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Used by `/api/submit` to write to the `*_secrets` table |
| `SHEETS_WEBHOOK_URL` | Apps Script web endpoint for the master spreadsheet |

## Project structure
```
api/
  clickup-prefill.js    GET — pulls Active Clients task by Client ID
  clickup-sync.js       (todo) PUT — updates form-list task on submit
  submit.js             (todo) POST — writes to Supabase + fans out
src/
  context/IntakeContext.jsx
  components/           Header, SubjectTypeToggle, Field primitives
  lib/
    clickup.js          fetch helpers
    options.js          dropdown / multi-select options
    sanitize.js         input sanitization
  App.jsx
```

## Status

This is **Form 1 v0** — initial scaffold with prefill + Sections A–C and
brand styling. Sections D–S, secrets handling, Supabase write, ClickUp
write-back, and Sheets sync are wired up incrementally in following commits.
