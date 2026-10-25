# 04 — Supabase schema and migration report

Sprint §05, §06, §09. Migrations were tested only on throwaway local PostgreSQL 16 clusters. **No migration was applied to any Supabase project.** Staging (`site00-staging`) was not approved for changes, and production is out of scope.

## 1. Migrations

| Migration | Branch | Purpose | Drops | Idempotent |
| --- | --- | --- | --- | --- |
| `20261025120000_site00_restrict_service_role_all_policies.sql` | #1696 | Two `service_role_all` policies that applied to `public` now apply to `service_role` only | nothing | yes |
| `20261026090000_site00_production_graph_rls_and_definer_grants.sql` | security follow-up | RLS on `site00_production_dependency_edges` and `site00_production_invalidation_events` (service_role only); `site00_allocate_access_credential_code()` executable by service_role only | nothing (rollback SQL in the file) | yes (guarded by `to_regclass` / `to_regprocedure`) |
| `20261026100000_site00_production_spine_records.sql` | integration | Durable spine records, roles, triggers, store functions, RLS, private masters bucket | nothing | yes (applied twice in every test) |

## 2. `20261026100000` in detail (531 lines)

### Tables (9)

| Table | Key | Typed columns (generated from `record`) | Enforced |
| --- | --- | --- | --- |
| `site00_spine_members` | (project_key, user_id) | — | Role is one of the five; FK to `auth.users` and the project |
| `site00_spine_budgets` | (project_key, id) | status, authorized_credits, approval_id | AUTHORIZED needs an approval; FK to the approval event |
| `site00_spine_shots` | (project_key, id) | release, scene, budget, generation | FK to its budget |
| `site00_spine_approval_events` | (project_key, id) | kind, subject, decision, actor, role, time, previous/new state, source version, input hash | Revision always 1; spend kinds by FOUNDER only; take and continuity decisions by role; one decision per subject version; never updated, deleted or truncated |
| `site00_spine_jobs` | (project_key, id) | shot, status, provider, model, route, input hash, idempotency key, quote, ceiling, approval, operation | Status vocabulary includes RECONCILIATION_REQUIRED; AUTHORIZED/QUEUED needs an approval; quote ≤ ceiling; unique idempotency key; AUTHORIZED only against a founder authorization for this job at this input hash |
| `site00_spine_assets` | (project_key, id) | storage ref, adapter, sha256, size, source job/take | Hash format; size > 0; **provenance**: the storage ref is `spine-media://<adapter>/<bucket>/<project>/<sha256>.<ext>` for this row's own adapter, project and hash; FK to the job and the take |
| `site00_spine_takes` | (project_key, id) | shot, job, asset, hash, decision, selected, last approval | No orphan (FK to shot, job and asset); selected ⇒ APPROVED; one selection per shot; APPROVED only through a founder APPROVE event; selection only through a SELECT_FOR_EDIT event by the founder or an authorized editor |
| `site00_spine_continuity_refs` | (project_key, id) | take, asset, status | FK to the take and the asset |
| `site00_spine_provider_operations` | (project_key, job_id, attempt) | ticket, authorization, operation, outcome, quoted/charged credits, charge status | One row per ticket; one row per provider operation id; one attempt in flight (OPEN/UNCERTAIN) per job; a closed attempt never changes; kept from the job's attempts by trigger |

**Identity.** Every record table checks that `record.kind`, `record.id`, `record.projectId` and `record.revision` match the row. Every foreign key is composite on `(project_key, …)`, so a reference cannot reach another project's row.

### Views (2, `security_invoker`)

- `site00_spine_cost_records`: per attempt, the quote (`QUOTED` / `UNKNOWN`), the actual charge (`REPORTED` / `UNKNOWN` / `NOT_AVAILABLE`) and the outcome. An unknown charge is never shown as 0.
- `site00_spine_edit_selections`: the selected take per shot.

### Triggers and functions

| Object | Kind | What it does |
| --- | --- | --- |
| `site00_spine_approval_events_immutable` | BEFORE UPDATE / DELETE (row), BEFORE TRUNCATE (statement) | Raises `SPINE_IMMUTABLE_RECORD`, even for the table owner |
| `site00_spine_approval_subject_exists` | AFTER INSERT | The event's subject exists in the same project |
| `site00_spine_take_authority` | AFTER INSERT / UPDATE | APPROVED and SELECTED only through the matching event and role |
| `site00_spine_job_authority` | AFTER INSERT / UPDATE | AUTHORIZED only against a founder GENERATION_AUTHORIZATION for this job at this input hash |
| `site00_spine_sync_provider_operations` | AFTER INSERT / UPDATE | Keeps one provider-operation row per attempt; closed attempts are immutable |
| `site00_spine_read`, `_records`, `_list`, `_commit`, `_member_role`, `_table` | functions | The store API; `_commit` applies a batch atomically with compare-and-set |

**Defect found and fixed while testing:** the authority triggers were first written as BEFORE triggers. PostgreSQL computes stored generated columns after BEFORE triggers, so those triggers read nulls and enforced nothing. They now run AFTER the row is written. Raising there still rolls back the statement and the whole batch. The tests prove each rule holds.

### Security

- **RLS and grants.**
  - RLS is on for all nine tables. `service_role_all` applies to `service_role` only.
  - `spine_member_read` lets an authenticated user read rows of projects they are a member of, and only their own membership row.
  - Anon is revoked from everything. Authenticated users have no insert, update, delete, truncate, references or trigger rights.
  - Every function is executable by `service_role` only.
- **Bucket.** It inserts the `site00-production-masters` bucket into `storage.buckets` (`public = false`, 500 MB limit, mp4/mov/png/jpeg/webp). If the bucket exists, it forces `public = false`. It adds no `storage.objects` policy, so only the service role reads or writes it.

## 3. Dependencies

The migration needs:

- `site00_managed_projects`, from `20260826123000_site00_design_control_plane_bridge.sql`, applied in production per the read-only listing; staging lacks it;
- Supabase's `auth.users` / `auth.uid()`;
- `storage.buckets`.

The bucket insert is skipped when `storage.buckets` is absent.

## 4. How it was tested

- **Cluster.** `scripts/production/pgSandbox.ts` starts a throwaway PostgreSQL 16 cluster on a private socket. It creates Supabase's `anon` / `authenticated` / `service_role` roles with Supabase's default grants, and stubs `auth.users`, `auth.uid()` (from `request.jwt.claim.sub`) and `storage.buckets`.
- **Migrations.** It applies `20260826123000` and then `20261026100000`. The suite applies `20261026100000` a second time to prove idempotency.
- **Suite.** `tests/productionSpineDurable.test.ts` runs 18 checks against it through the same `SupabaseRpcBackend` the API uses:
  - additive and idempotent apply; persistence across connections and processes; atomic batches;
  - compare-and-set under concurrency; one provider request from two concurrent dispatchers;
  - duplicate job; orphan take; asset without provenance; approval or selection without authority; authorization without a founder event;
  - in-flight attempt; operation reuse; closed-attempt rewrite;
  - approval immutability (update, delete and truncate as owner);
  - RLS for anon, non-member, member and other-project member; direct writes and function calls denied.
- **Security follow-up.** `scripts/production/verify-security-hardening.sh` runs 21 checks on the security migration. B1's `verify-role-policies.sh` runs 16 on #1696's.

## 5. Not done

- **No live apply.** Nothing was applied to staging or production. `STAGING_VERIFIED` and `PRODUCTION_DEPLOYED` are BLOCKED (deliverable 19).
- **No PostgREST layer locally.** It could not be downloaded here. The RPC layer was exercised with an equivalent client that calls the same functions under the same roles. The PostgREST HTTP layer itself is covered only by the staging script.
