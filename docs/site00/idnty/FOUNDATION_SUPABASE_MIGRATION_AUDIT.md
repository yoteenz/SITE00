# Foundation Supabase migration audit

**Target project (API-bound):** `hyycomvcaqxxvyrfupes.supabase.co` (name: FS Website)  
**Audit date:** 2026-10-10

## Repository migration inventory

| File | Purpose |
| --- | --- |
| `20261008160000_site00_digital_foundation_artifact_v1.sql` | Core tables: referral_sources, leads, artifacts, quotes, acceptances, events, client_actions, approvals, stages, ownership, RLS |
| `20261008170000_site00_digital_foundation_persistence_v2.sql` | checkout_sessions, operations_bundle, quote founder_commercial_ready columns, readiness columns on artifacts |
| `20261010103000_site00_df_project_messaging.sql` | Messaging tables (Gate B; not required for intake-only) |

## Expected schema objects (Gate A minimum)

- `site00_df_leads`, `site00_df_artifacts` (intake JSONB on artifact row)
- `site00_df_quotes`, `site00_df_quote_acceptances`
- `site00_df_artifact_events`
- `site00_df_operations_bundle` (stages, actions, approvals serialized)
- Indexes: `site00_df_artifacts_token_idx` on `public_token`
- RLS enabled; API uses **service role** (bypasses RLS for server writes)

## Live database verification status

| Check | Status | Evidence |
| --- | --- | --- |
| MCP `list_migrations` on project | **BLOCKED** | Connection timeout (2026-10-10 recovery sprint 5) |
| MCP `execute_sql` `SELECT 1` | **BLOCKED** | Connection timeout |
| REST with valid key (VM) | **BLOCKED** | ~12–15 s client timeout |
| Railway `action=payload` (production) | **BLOCKED** | ~20 s → 500 `[object Object]` |
| REST with invalid key (VM) | **OK** | 401 ~70 ms (edge only) |
| Management `get_project` | **OK** | `ACTIVE_HEALTHY` |
| API reports `supabaseConfigured: true` | **CONFIGURED** | `GET /api/health` — `gitCommit` `56cae6852f0c` |
| Migration applied on live DB | **UNVERIFIED** | No successful schema read |

See `ANTHONY_SUPABASE_522_ROOT_CAUSE.md` for full matrix.

## Safety review (SQL)

- Migrations use `create table if not exists` / `add column if not exists` — **non-destructive** additive pattern.
- No `DROP TABLE` or `TRUNCATE` in DF migration files reviewed.
- **Do not** run broad deletes on production.

## Recommended founder/ops sequence (authorization required)

1. Confirm Supabase project = `hyycomvcaqxxvyrfupes` (matches API health `supabaseHost`).
2. In Supabase SQL editor or CLI, compare `information_schema.tables` for `site00_df_%` to inventory above.
3. Apply missing migrations in order (160000 → 170000 → 10103000 if messaging needed later).
4. Set Railway `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1`.
5. Redeploy API; verify `digitalFoundation.persistSupabaseEnv: true` on `/api/health` (after diagnostics deploy).
6. Run disposable artifact intake test; confirm row in `site00_df_artifacts` via Supabase dashboard (no PII in tickets).

## Rollback

- **Flag off:** Set `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=0` and redeploy — reverts to memory-only (data loss risk for new intakes).
- **Schema:** Do not drop tables with client data; rollback is forward-fix only.
