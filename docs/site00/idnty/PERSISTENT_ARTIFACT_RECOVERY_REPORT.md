# Persistent artifact & intake recovery — forensic report

**Sprint:** `P0.SITE00.IDNTY.PERSISTENT-ARTIFACT-AND-INTAKE-RECOVERY1`  
**Staging Supabase:** `soocqbyjkxeubfjnuwvf`  
**Date:** 2026-10-19  

## Root cause (evidence-based)

1. **Silent Supabase write failures** — `persistArtifactGraph()` upserted leads, artifacts, quotes, and operations bundles **without checking** `{ error }`. The API returned success while nothing was committed.

2. **Referral source FK mismatch** — In-memory leads reference `referral_source_id` from `seedReferralSources()`, which used **random UUIDs per process**. Those IDs were **never inserted** into `site00_df_referral_sources`. Postgres rejected lead/artifact upserts with FK violations; errors were swallowed.

3. **Memory-only survival** — Artifacts lived in the Railway process heap. **Refresh on another instance**, **deploy**, or **restart** called `loadArtifactGraphByToken()` → no row → `ARTIFACT_NOT_FOUND` → client **“THIS LINK ISN'T ACTIVE”**. Founder dashboard `list` syncs from Supabase → **empty list**.

4. **Staging DB state at investigation** — `site00_df_artifacts` / `leads` / `referral_sources` counts were **0**. The founder’s original synthetic client **cannot be recovered** from durable storage (never committed or wiped).

## Repairs shipped (code)

- Stable referral source UUIDs (`DF_REFERRAL_SOURCE_ID` in `referralSources.ts`).
- Upsert referral sources before lead/artifact on every persist.
- `assertSupabaseOk` / `DfPersistenceError` on all critical writes.
- `createArtifactForLeadDurable()` + await on synthetic test client and admin artifact creation.
- GET/POST artifact handler returns **404 ARTIFACT_NOT_FOUND** when Supabase enabled and row missing.
- `resetSyntheticTestData()` rehydrates from Supabase after memory clear (does not delete DB rows).
- Migration `20261019130000_site00_df_service_role_policies.sql` (applied to staging via MCP).

## Founder next steps

1. Redeploy **reliable-creation-staging** from integration branch after merge.
2. Create **one new** synthetic test client (original token unrecoverable).
3. Partial intake → wait for **SAVED** → refresh link and readiness dashboard on a **second** browser session.
4. Apply migration on any other Supabase project that hosts DF tables if not staging.

## Token policy

No token rotation or link expiry was found in code. Public tokens remain stable for the artifact lifetime; quote expiry does not invalidate the link.
