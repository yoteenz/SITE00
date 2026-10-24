# Database and security validation — staging

**Sprint:** `P0.SITE00.IDNTY.PHASE3B.STAGING-DEPLOYMENT-AND-LIVE-FOUNDER-E2E-ACTIVATION1`  
**Project:** `site00-staging` · ref **`soocqbyjkxeubfjnuwvf`**

## API ↔ database binding

| Check | Evidence | Result |
| --- | --- | --- |
| Staging API uses staging Supabase | `/api/health` → `supabaseProjectRef: soocqbyjkxeubfjnuwvf` | **PASS** |
| Production isolation | Health `supabaseStagingIsolationVerified: true` | **PASS** |
| Persistence enabled | `persistSupabaseEnv: true`, `persistenceStore: supabase` | **PASS** |

## Schema and RLS (read-only SQL, 2026-10-24)

Sample of `site00_df_*` relations: `site00_df_artifacts`, `site00_df_leads`, `site00_df_quotes`, `site00_df_artifact_events`, `site00_df_build_credits`, `site00_df_operations_bundle`, `site00_df_project_messages`, …

| Check | Result |
| --- | --- |
| Foundation tables present | **PASS** |
| RLS enabled on core DF tables | **PASS** (`relrowsecurity = true` on sampled tables) |
| `site00_df_project_messages` RLS, 0 policies | **PASS** (matches prior audit — deny anon/authenticated direct access) |
| Service role policies | Documented in prior migration `site00_df_service_role_policies` |

## Live write / cross-client tests

| Check | Result |
| --- | --- |
| Synthetic intake write + reload | **NOT_RUN** (no live journey) |
| Cross-client token access | **NOT_RUN** |
| Duplicate Stripe webhook idempotency | **NOT_RUN** |
| Email intent persistence on live run | **NOT_RUN** |

## Agent VM warning

Cloud agent `SUPABASE_URL` points to **production** ref `hyycomvcaqxxvyrfupes`. **No DF test writes** were executed from the agent VM against production.

## RLS weakening

**None.** No policy or migration changes in this sprint.
