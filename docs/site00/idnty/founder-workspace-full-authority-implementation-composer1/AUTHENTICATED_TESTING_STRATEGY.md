# Authenticated testing strategy

**Status:** DOCUMENTED — session not established in slice 3 cloud run.

## Preferred order (sprint mandate)

1. **Option A — Founder test session:** Sign in through normal Supabase auth on preview or staging; use existing admin allowlist (`ADMIN_EMAILS` on API). No bypass in repo.
2. **Option B — Staging-only test admin:** Provision a dedicated staging user with founder-workspace permissions (Railway `empowering-clarity` / `reliable-creation-staging`). Credentials via Cursor Secrets or one-time founder login on device — never commit tokens.
3. **Option C — Isolated integration env:** Synthetic artifacts + real auth stack (bootstrap API already exists for cloud mobile preview dev only — not a production bypass).
4. **Option D — Local authenticated browser:** `npm run dev` + founder login against safe API origin.

## Explicitly forbidden

- Hardcoded admin passwords in git  
- Committing Playwright `storageState` or session cookies  
- Supabase RLS changes for screenshots  
- Claiming authenticated E2E from unauthenticated Playwright (prior script hit marketing landing)

## Playwright capture (when authorized)

- Base: dev `:5174` or isolated preview hostname  
- Routes: `/admin/site00/founder-workspace/*`  
- Script: `scripts/founder-workspace-screenshots.mjs` (extend with login hook using env-provided credentials outside repo)

## Current result

**AUTHENTICATED_CAPTURE: BLOCKED — AUTHORIZATION REQUIRED**
