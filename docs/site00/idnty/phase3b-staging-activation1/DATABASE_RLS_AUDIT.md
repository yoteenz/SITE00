# Database & RLS audit — site00-staging (`soocqbyjkxeubfjnuwvf`)

**Method:** Supabase MCP read-only SQL (2026-10-21). No data modified.

## Migrations applied (remote)

| Version | Name |
| --- | --- |
| 20261014205232 | 20261008160000_site00_digital_foundation_artifact_v1 |
| 20261014205237 | 20261008170000_site00_digital_foundation_persistence_v2 |
| 20261015144544 | 20261015120000_site00_df_project_messages_rls |
| 20261019125239 | site00_df_service_role_policies |

## RLS enabled (all `site00_df_*` tables)

All listed foundation tables have `relrowsecurity = true`.

## Policies

| Pattern | Tables |
| --- | --- |
| `service_role_all` (ALL for `service_role`) | artifacts, quotes, leads, stripe_events, operations_bundle, … |
| RLS ON, **0 policies** | `site00_df_project_messages` |

`site00_df_project_messages`: RLS enabled with **zero policies** — PostgREST anon/authenticated must remain denied (same pattern as pre-policy hardening). API uses service role for persistence.

## Persistence path

- Staging API health: `persistenceStore: supabase`, `persistSupabaseEnv: true`
- Client intake writes go through API service role → `site00_df_*` tables (not browser direct)

## Gate C (durable intake)

| Check | Status |
| --- | --- |
| Schema present | PASS |
| API persistence flag | PASS |
| Live intake write + refresh proof on staging | **NOT_TESTED** (requires founder-authenticated test client + authorized email) |

## Agent VM warning

Do **not** point local tests at production Supabase (`hyycomvcaqxxvyrfupes`). Staging E2E must run on staging API + staging project only.
