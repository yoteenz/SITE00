# Staging E2E activation — founder approval checklist

**Sprint:** `P0.SITE00.IDNTY.STAGING-SECURITY-DEPLOYMENT-AND-E2E-UNBLOCK1`  
**Draft PR:** #1648 · branch `cursor/staging-foundation-config-readiness-be3b`

## Database forensics (staging `soocqbyjkxeubfjnuwvf`)

| Finding | Detail |
| --- | --- |
| Migration history | Only `20261008160000_*` and `20261008170000_*` recorded |
| `site00_df_project_messages` | Table **exists**; migration `20261010103000` **not** in history |
| Cause | **D — schema drift** (table created outside tracked migration, likely manual/SQL editor) |
| RLS | **OFF** on `site00_df_project_messages`; all other `site00_df_*` tables RLS **ON**, **0 policies** |
| Grants | Same as `site00_df_artifacts`: anon/authenticated have no SELECT |
| Runtime | Messages persist in `site00_df_operations_bundle` JSON today; standalone table is forward-compatible |

## Migration approval gate

| Field | Value |
| --- | --- |
| **MIGRATION** | `20261015120000_site00_df_project_messages_rls.sql` |
| **TARGET** | site00-staging only |
| **PROJECT REF** | soocqbyjkxeubfjnuwvf |
| **TABLES** | `site00_df_project_messages` |
| **SECURITY** | Enable RLS; revoke row privileges from anon/authenticated; no permissive policies (matches sibling DF tables) |
| **DATA DELETION** | NO |
| **DATA MODIFICATION** | NO |
| **ACCESS IMPACT** | PostgREST anon/authenticated remain unable to read rows; service-role API unchanged |
| **ROLLBACK** | `alter table ... disable row level security;` + restore grants if needed (not recommended) |
| **RISK** | **LOW** — aligns with existing DF pattern; no destructive DDL |
| **APPROVAL REQUIRED** | **YES** before remote apply |

### Applied (founder-approved 2026-10-15)

Migration `20261015120000_site00_df_project_messages_rls` applied to **site00-staging** (`soocqbyjkxeubfjnuwvf`) only. Verified: RLS ON, 0 policies (matches artifacts), anon/authenticated without SELECT/INSERT/UPDATE/DELETE, row count unchanged (0).

Optional follow-up (separate approval): record `20261010103000` in migration history via Supabase CLI repair to remove drift — not required for RLS fix.

## Railway staging API (`reliable-creation`)

| Variable | Value | When |
| --- | --- | --- |
| `SITE00_PUBLIC_APP_ORIGIN` | `https://carefree-luck-staging.up.railway.app` | Before E2E (links in email + checkout) |
| `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE` | `1` | **After** RLS migration verified (already **on** on live API — confirm intentional) |

**Do not set on:** carefree-luck SPA, production API, production environment.

## Post-approval execution order

1. Founder approves RLS migration apply on **site00-staging** only.
2. Apply `20261015120000_site00_df_project_messages_rls.sql` (MCP or Supabase SQL).
3. Verify RLS: `relrowsecurity = true` on `site00_df_project_messages`.
4. Merge or deploy **#1648** onto `cursor/idnty-founder-readiness-e2e-be3b`.
5. Set `SITE00_PUBLIC_APP_ORIGIN` on staging API if missing.
6. Confirm `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1` only after step 3.
7. Redeploy **reliable-creation** API → verify `/api/health` (`stripeKeyMode`, public origin, persist).
8. Redeploy **carefree-luck** SPA → verify bundle + `/admin/site00/foundation-readiness`.
9. Founder sign-in on staging (manual).
10. Readiness report → create synthetic client (no send until approved).

## E2E entry (not authorized in this sprint)

Separate approval for: allowlisted Resend send, Stripe TEST checkout, full 25-step flow in sprint §15.

## Production

**UNCHANGED** — site00.com, api.site00.com, production Supabase, production Railway.
