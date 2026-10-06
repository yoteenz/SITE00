# JURNL Wave 5 live proof

Run **JURNL Live RLS & Production Sync Proof** (`.github/workflows/jurnl-live-production-sync-proof.yml`).

## Required GitHub secrets

- `SUPABASE_URL` (or `VITE_SUPABASE_URL`)
- `SUPABASE_ANON_KEY` (or `VITE_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (QA user setup only)
- `JURNL_QA_USER_A_EMAIL` / `JURNL_QA_USER_A_PASSWORD`
- `JURNL_QA_USER_B_EMAIL` / `JURNL_QA_USER_B_PASSWORD`
- Optional: `JURNL_LIVE_API_BASE` (defaults to local API in CI if unset)

## Manual dispatch

GitHub → Actions → **JURNL Live RLS & Production Sync Proof** → Run workflow.

## Local

```bash
JURNL_LIVE_PROOF=1 JURNL_LIVE_QA_SETUP=1 \
  SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
  JURNL_QA_USER_A_EMAIL=... JURNL_QA_USER_A_PASSWORD=... \
  JURNL_QA_USER_B_EMAIL=... JURNL_QA_USER_B_PASSWORD=... \
  npm run jurnl:live-proof
```

Artifacts land in this folder.
