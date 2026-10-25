# 18 — Staging and production rollout plan

Sprint §30. **Nothing was deployed in this sprint.** Each stage below is a founder-approved step with its own verification and rollback. Paid generation is not part of any stage: it needs a separate, explicit founder authorization per job (deliverable 16).

## Stage 0: review (now)

The founder reviews:

- deliverable 01;
- the SH01 packet (16);
- the register (15);
- the blockers (19);
- the PRs.

Nothing merges automatically.

## Stage 1: security repairs on production (database only)

| Step | Action | Verify | Rollback |
| --- | --- | --- | --- |
| 1.1 | Merge #1696; apply `20261025120000` to production | `select tablename, roles from pg_policies where policyname = 'service_role_all' and tablename in ('site00_brand_creative_context','site00_page_concept_generation_runs')` → both `{service_role}`; an anon-key request to either table is refused | Recreate each policy `for all using (true) with check (true)` (restores the exposure; only if a server path breaks) |
| 1.2 | Merge the security follow-up; apply `20261026090000` | Advisors no longer report RLS disabled on the two production-graph tables; `has_function_privilege('anon','public.site00_allocate_access_credential_code()','execute')` → false; the access-credential flow still works for the server | SQL in the migration header (disable RLS, drop the two policies, re-grant execute) |
| 1.3 | Redeploy the API (Railway) from `main` after #1696 | Expression Engine GETs and ASSTS reads never dispatch (deliverable 07 of #1696) | Redeploy the previous image |

## Stage 2: spine schema on staging

| Step | Action | Verify | Rollback |
| --- | --- | --- | --- |
| 2.1 | On `site00-staging`, apply `20260826123000` (managed-project registry, absent there), then `20261026090000` and `20261026100000` | Applying `20261026100000` twice is a no-op; advisors clean for the new tables | `drop` the nine `site00_spine_*` tables, two views and eleven functions; delete the `site00-production-masters` bucket (it holds only test objects) |
| 2.2 | `SITE00_SPINE_VERIFY_TARGET=STAGING … npx tsx scripts/production/verify-spine-supabase.ts` | Every line PASS: functions, anon refused, bucket private, public path refused, record round trip, compare-and-set, cross-project, storage round trip | — |
| 2.3 | Point a staging API at it: `SITE00_PRODUCTION_RECORD_STORE=supabase`, `SITE00_PRODUCTION_SPINE_ENVIRONMENT=STAGING`, `SITE00_MEDIA_SIGNING_SECRET` (32+ chars) | Takes workspace shows "Supabase Postgres (STAGING Supabase)"; TECHNICALLY READY shows durable store and private storage met, provider route not met | Unset `SITE00_PRODUCTION_RECORD_STORE`: the API serves the read-only repository catalogue (the explicit default) |
| 2.4 | `SITE00_SPINE_SEED_TARGET=STAGING npx tsx scripts/production/seed-spine-records.ts` | 5 records CREATED, then ALREADY_PRESENT on a second run | Records are planning data; leave them or drop the tables (2.1 rollback) |
| 2.5 | Add staging members (`site00_spine_members`) for any non-founder reviewer | A member sees the project; a non-member admin gets 403 `NOT_A_PROJECT_MEMBER` | Delete the membership row |

**Exit criterion: STAGING_VERIFIED.**

## Stage 3: spine schema on production

| Step | Action | Verify | Rollback |
| --- | --- | --- | --- |
| 3.1 | Founder approval recorded; apply `20261026100000` to production | Same as 2.1, plus `PRODUCTION_READ_ONLY` verification (no writes) | Same drops as 2.1. Production rows would be lost: export them first (`select record from site00_spine_*`). |
| 3.2 | Seed with `SITE00_SPINE_SEED_TARGET=PRODUCTION` and `SITE00_PRODUCTION_SPINE_DEPLOYMENT=FOUNDER_APPROVED` | 5 records | — |
| 3.3 | Production API env: `SITE00_PRODUCTION_RECORD_STORE=supabase`, `SITE00_PRODUCTION_SPINE_ENVIRONMENT=PRODUCTION`, `SITE00_PRODUCTION_SPINE_DEPLOYMENT=FOUNDER_APPROVED`, `SITE00_MEDIA_SIGNING_SECRET`; redeploy | The workspace reads the durable store; decisions persist across a redeploy | Unset `SITE00_PRODUCTION_RECORD_STORE` and redeploy: back to the read-only catalogue; durable rows stay |
| 3.4 | Upload the SPA (GoDaddy) only if the UI changed since the last bundle | The Takes screen shows the six readiness rows | Re-upload the previous bundle |

**Exit criteria: PRODUCTION_DEPLOYED, then PRODUCTION_VERIFIED** (3.1 verification passes on the live project).

## Stage 4: creative and financial decisions (founder)

FD-S101-01, 09, 08, then 11 for the references, as in deliverable 16. Each is recorded through the founder's own action. None is inferred from technical readiness.

## Stage 5: a provider route (founder decision)

- **Choose an executor.** Either an agent-session executor the founder runs, or a server credential the founder provisions. Then set `SITE00_PROVIDER_EXECUTION=ENABLED` **only** where that one authorized job runs.
- **This stage is not part of this sprint.**

## Order and separation

- **Security first, on its own.** Stage 1 is database-only and goes first.
- **Schema next, no behaviour change.** Stages 2 and 3 change the schema and the API's store, but nothing about spend.
- **Spend last.** Spend is impossible until Stage 5 and an explicit per-job authorization.
