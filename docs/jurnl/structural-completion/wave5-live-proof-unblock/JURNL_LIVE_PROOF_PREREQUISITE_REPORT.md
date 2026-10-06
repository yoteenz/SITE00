# JURNL live proof prerequisite report

Generated: 2026-10-06T11:13:55.544Z

## Minimum GitHub secrets (exact names)

| Secret | Role |
|--------|------|
| `SUPABASE_URL` or `VITE_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` or `VITE_SUPABASE_ANON_KEY` | User JWT / RLS proof |
| `SUPABASE_SERVICE_ROLE_KEY` | QA user provisioning only |
| `JURNL_QA_USER_A_EMAIL` / `JURNL_QA_USER_A_PASSWORD` | USER_A |
| `JURNL_QA_USER_B_EMAIL` / `JURNL_QA_USER_B_PASSWORD` | USER_B |
| `JURNL_LIVE_API_BASE` or `VITE_API_BASE` | Optional — CI uses local API on :8787 |

## Migration

Apply `supabase/migrations/20261006103000_jurnl_production_persistence.sql` via Supabase Dashboard SQL or `supabase db push` (non-destructive `IF NOT EXISTS`).

## Status

- Prerequisite gate: **PREREQUISITE_BLOCKED**
- Missing secrets: JURNL_QA_USER_A_EMAIL, JURNL_QA_USER_A_PASSWORD, JURNL_QA_USER_B_EMAIL, JURNL_QA_USER_B_PASSWORD
- Migration remote: **UNKNOWN**

## Next step

GitHub → Actions → **JURNL Live RLS & Production Sync Proof** → Run workflow (after secrets + migration).
