# Digital Foundation migration reconciliation

**Sprint:** `P0.SITE00.IDNTY.SUPABASE-POST-INCIDENT-STABILITY-AND-ANTHONY-GATE-A-RECOVERY1`  
**Project:** `hyycomvcaqxxvyrfupes`  
**Date (UTC):** 2026-10-11

## Expected migrations (Gate A audit)

| Version | File | Gate |
| --- | --- | --- |
| `20261008160000` | `supabase/migrations/20261008160000_site00_digital_foundation_artifact_v1.sql` | **A — required** |
| `20261008170000` | `supabase/migrations/20261008170000_site00_digital_foundation_persistence_v2.sql` | **A — required** |
| `20261010103000` | `supabase/migrations/20261010103000_site00_df_project_messaging.sql` | **B — optional for intake-only** |

## Applied on production (verified 2026-10-11)

| Check | Result |
| --- | --- |
| `supabase_migrations.schema_migrations` rows for `20261008160000`, `20261008170000`, `20261010103000` | **NONE** (empty query) |
| `information_schema.tables` `site00_df_%` | **0 tables** |
| `to_regclass('public.site00_df_artifacts')` | **NULL** (via aggregate probe) |

**Conclusion:** All three Digital Foundation migrations are **PENDING** on live Postgres.

## Dependencies

1. **v1** must run before **v2** (v2 alters `site00_df_artifacts` and references it).  
2. **messaging** requires `site00_df_artifacts(artifact_id)` FK — run after **v1**.

## Objects (summary)

**v1:** `site00_df_referral_sources`, `site00_df_leads`, `site00_df_artifacts`, quotes, acceptances, events, client actions, approvals, stages, ownership, indexes, RLS on sensitive tables.

**v2:** columns on artifacts; `site00_df_checkout_sessions`, `site00_df_operations_bundle`; quote commercial-ready columns; RLS on new tables.

**messaging:** `site00_df_project_messages` + index.

## RLS / functions / triggers

- No custom triggers in these three files.  
- RLS enabled on DF tables per migration SQL; service-role API path expected for SITE 00 Railway.

## Rollback strategy

- **Schema:** forward-fix only (migrations are additive `IF NOT EXISTS`).  
- **Runtime:** turning off `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE` forces memory store — **data loss** for production intakes. **Do not** use as rollback after Anthony data exists.

## Production resource impact (estimate)

- Low lock risk (`IF NOT EXISTS`, small DDL).  
- Apply **off-peak**; run `ANALYZE` after apply.  
- **Do not apply from this agent** without founder approval.

## Founder approval plan

1. Confirm Supabase stability gates progressing (see `SUPABASE_STABILITY_CERTIFICATION.md`).  
2. Backup / PITR confirmed in dashboard.  
3. Apply **v1 + v2** in SQL Editor or `supabase db push` (founder-operated).  
4. Re-run verification SQL:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'site00_df_%'
ORDER BY 1;
```

5. Optionally apply **messaging** when Gate B messaging is in scope.  
6. Proceed to disposable intake E2E (`ANTHONY_GATE_A_E2E_PLAN.md`).

**MIGRATION_APPROVAL:** **PENDING**
