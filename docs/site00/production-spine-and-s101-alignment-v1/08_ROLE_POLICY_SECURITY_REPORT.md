# 08 — Role policy security report

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`, decision D-14. Branch `claude/production-spend-gates-and-policy-repair`. No live database was read or changed.

## 1. Finding

Two migrations create a policy named `service_role_all` as `for all using (true) with check (true)` with **no TO clause**. A policy with no TO clause applies to every role, so `anon` and `authenticated` can read and write the table. In Supabase both roles hold default table grants.

| Table | Migration | Live state (from memory, not queried) |
| --- | --- | --- |
| `site00_brand_creative_context` | `20260910180000_site00_brand_creative_context.sql:31-32` | Applied 2026-09-16 |
| `site00_page_concept_generation_runs` | `20260921120000_site00_page_concept_generation_runs.sql:26-27` | Listed as likely not applied |

Only server code uses these tables, through the service-role client:
- `api/_lib/site00BrandLore/brandCreativeContextSupabaseStore.ts`
- `api/_lib/site00PageConcept/pageConceptGenerationRunSupabaseStore.ts`

No browser code reads them.

## 2. Repair

`supabase/migrations/20261025120000_site00_restrict_service_role_all_policies.sql` drops and recreates each policy as `for all to service_role using (true) with check (true)`, only when the table exists.
- It is idempotent.
- It changes no data.
- It needs no code change.

## 3. Verification in isolated conditions

`scripts/production/verify-role-policies.sh` runs the check on a throwaway local PostgreSQL 16 cluster:
1. Creates `anon`, `authenticated` and `service_role` (with BYPASSRLS, as in Supabase).
2. Grants Supabase's default table privileges.
3. Applies the two original migrations, then the repair, twice.
4. Removes the cluster when it finishes.

| Check | Expected | Result |
| --- | --- | --- |
| Before: anon inserts into either table | ALLOWED (the finding) | ALLOWED |
| After: anon or authenticated inserts | DENIED | DENIED (both tables) |
| After: anon or authenticated sees rows | 0 | 0 (both tables) |
| After: service_role inserts and reads | ALLOWED | ALLOWED (both tables) |
| After: policy roles | `{service_role}` | `{service_role}` (both tables) |
| Re-applying the repair | No error | No error |

**Cross-project access.** Not applicable to these two tables: they are service-role only, and project scoping lives in the API stores. Cross-project denial for the new production records is tested in workstream B2 (deliverable 09).

## 4. What is not claimed

- **The production database is not fixed.** It has not been changed or checked: it has answered agents with 522 errors since 2026-10-02, and this sprint does not mutate production.
- **Pending deployment gate:**
  1. Merge.
  2. Apply the migration to the Supabase project.
  3. Confirm with `select tablename, roles from pg_policies where policyname = 'service_role_all' and tablename in ('site00_brand_creative_context', 'site00_page_concept_generation_runs');` that both show `{service_role}`.
  4. Confirm an anon-key request is refused.
