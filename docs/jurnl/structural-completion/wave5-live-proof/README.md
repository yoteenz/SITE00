# JURNL Wave 5 live proof

Run **JURNL Live RLS & Production Sync Proof** (`.github/workflows/jurnl-live-production-sync-proof.yml`).

## Required GitHub secrets (exact names)

| Name | Required |
|------|----------|
| `SUPABASE_URL` or `VITE_SUPABASE_URL` | Yes |
| `SUPABASE_ANON_KEY` or `VITE_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (QA user provisioning only) |
| `JURNL_QA_USER_A_EMAIL` | Yes |
| `JURNL_QA_USER_A_PASSWORD` | Yes |
| `JURNL_QA_USER_B_EMAIL` | Yes |
| `JURNL_QA_USER_B_PASSWORD` | Yes |
| `JURNL_LIVE_API_BASE` or `VITE_API_BASE` | Optional (CI starts local API on port 8787) |

Inventory artifact: `docs/jurnl/structural-completion/wave5-live-proof-unblock/JURNL_LIVE_PROOF_SECRET_INVENTORY.json`

## Migration

Apply `supabase/migrations/20261006103000_jurnl_production_persistence.sql` on the Supabase project (non-destructive). Status: `JURNL_LIVE_PROOF_MIGRATION_STATUS.json` in `wave5-live-proof-unblock/`.

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
