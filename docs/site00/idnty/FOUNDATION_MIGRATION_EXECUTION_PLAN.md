# Foundation migration execution plan (Group A — approval required)

**Target project:** `hyycomvcaqxxvyrfupes` (FS Website)  
**Gate A minimum:** first two files. Third is Gate B messaging (optional for intake-only).

## Inventory (exact files)

| # | File path | Version | Tables / objects | RLS | Lock risk |
| --- | --- | --- | --- | --- | --- |
| 1 | `supabase/migrations/20261008160000_site00_digital_foundation_artifact_v1.sql` | 20261008160000 | `site00_df_referral_sources`, `site00_df_leads`, `site00_df_artifacts`, `site00_df_quotes`, `site00_df_quote_acceptances`, `site00_df_artifact_events`, client_actions, approvals, stages, ownership + indexes | Enabled on sensitive tables | Low (`IF NOT EXISTS`) |
| 2 | `supabase/migrations/20261008170000_site00_digital_foundation_persistence_v2.sql` | 20261008170000 | Alters `site00_df_artifacts`; adds `site00_df_checkout_sessions`, `site00_df_operations_bundle`; quote commercial-ready columns | RLS on new tables | Low |
| 3 | `supabase/migrations/20261010103000_site00_df_project_messaging.sql` | 20261010103000 | `site00_df_project_messages` + index | Service role only in practice | Low |

## Current schema state on live DB

| Check | Status |
| --- | --- |
| MCP `list_migrations` | **BLOCKED** (timeout) |
| MCP `execute_sql` / `list_tables` | **BLOCKED** (timeout) |
| Applied on production | **UNKNOWN** until `SELECT 1` succeeds |

## Pre-apply verification (founder or ops, read-only)

Run in Supabase SQL Editor when connectivity returns:

```sql
SELECT 1 AS ok;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'site00_df_%'
ORDER BY 1;
```

Compare output to inventory above. **Do not re-apply** a migration whose objects already exist unless a drift report says otherwise.

## Risk assessment

- **Additive only** — no `DROP TABLE` in these three files.
- **Rollback:** disable `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE` on Railway (memory fallback — **data loss risk** for new rows). Schema rollback is forward-fix only.
- **Backup:** confirm Supabase daily backup / PITR status in dashboard before apply.

## Validation after apply (disposable)

1. Railway `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1` (already on).
2. Mint disposable artifact via admin/founder flow (no Anthony PII in docs).
3. `update-intake` → verify row in `site00_df_artifacts` / `intake` JSONB.
4. Hard refresh client → same token loads.
5. Optional: API restart test (Group D) after explicit approval.

## Migration approval status

**WAITING FOR FOUNDER APPROVAL (Group A).**

Reply with explicit approval to apply migrations **1–2** (Gate A) and optionally **3** (messaging), after database connectivity is restored.

**Do not apply from Composer until:**

1. `SELECT 1` succeeds in SQL Editor or MCP `execute_sql`, and  
2. Founder approves this plan for project `hyycomvcaqxxvyrfupes`.
