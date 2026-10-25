# 03 — Production RecordStore implementation

Sprint §04, §05, §12 and §13. Branch `claude/production-live-persistence-readiness`.

## 1. One interface, three backends

Business logic (the runner, the API, the workspace) talks only to `RecordStore` (`shared/site00-production-spine/store.ts`). The bytes live in a backend:

| Backend | File | Durable | Use |
| --- | --- | --- | --- |
| `SupabaseRpcBackend` | `node/supabaseStore.ts` | yes | Staging and production. Calls the migration's service-role-only functions. |
| `JsonFileBackend` | `node/jsonStore.ts` | no | The repository planning catalogue (read-only), and development fixtures outside the repository |
| `MemoryBackend` | `store.ts` | no | Unit tests |

`RecordStore.apply(ops)` is new. It takes a batch of creates and updates and commits all of them or none:

- **Creates.** A create of an identical existing record is a no-op. A create of a different record under the same id is `CONFLICT`.
- **Updates are compare-and-set.** An update names the revision it read. If the stored revision has moved, the batch fails with `CONFLICT`. If it succeeds, the record advances by exactly one.
- **References.** Every reference must resolve, either to a stored record or to one created earlier in the batch.
- **Records and stores.** Approvals are never updated. Another project's record is refused. A live store refuses `TEST_FIXTURE` records, and a test store accepts only them.

`create` and `update` are one-op batches. The runner writes every multi-record change as one batch:

- an approval and the job it authorizes;
- a take decision, the take, and any continuity frames it invalidates;
- an asset, its take, and the job's CAPTURED state.

## 2. The Supabase backend

| Call | Database function | Notes |
| --- | --- | --- |
| `read(kind, id)` | `site00_spine_read(kind, project, id)` | `null` when absent |
| `readAll(kind)` | `site00_spine_records(kind, project)` | One round trip per kind |
| `list(kind)` | `site00_spine_list(kind, project)` | Ids in order |
| `commit(ops)` | `site00_spine_commit(ops)` | One transaction; raises on any conflict or constraint |
| `memberRole(user)` | `site00_spine_member_role(project, user)` | Feeds the API's role check |
| `probe()` | `site00_spine_list` | Run when the store opens: proves the schema exists and the key is service_role |

Database errors map to spine codes: `SPINE_CONFLICT` / 23505 → `CONFLICT`, 23503 → `REFERENCE_NOT_FOUND`, 23514 → `CONSTRAINT_VIOLATION`, `SPINE_FORBIDDEN` → `FORBIDDEN`, `SPINE_IMMUTABLE_RECORD` → `IMMUTABLE_RECORD`, 42501 → `STORE_FORBIDDEN`, and a missing function → `STORE_SCHEMA_MISSING`. A transport failure is `STORE_UNAVAILABLE`. **There is no fallback:** nothing is kept in memory when the database cannot be reached.

## 3. Explicit store selection (§12)

`node/storeSelection.ts → planSpineStore(env)`. The API opens exactly what it says; there is no silent fallback.

| `SITE00_PRODUCTION_RECORD_STORE` | Environment | Opens | Writes |
| --- | --- | --- | --- |
| unset or `repository` | any | Repository JSON, read-only | Refused (`STORE_READ_ONLY`). No decision can land somewhere fragile. |
| `fixture` | not production | TEST FIXTURE JSON under `SITE00_PRODUCTION_SPINE_FIXTURE_ROOT` (outside the repository) | Test records only |
| `supabase` + `SITE00_PRODUCTION_SPINE_ENVIRONMENT=STAGING` | dev or staging | Supabase records + private bucket | Yes. A production server is refused (`ENVIRONMENT_MISMATCH`). |
| `supabase` + `…=PRODUCTION` + `SITE00_PRODUCTION_SPINE_DEPLOYMENT=FOUNDER_APPROVED` | production | Supabase records + private bucket | Yes, only after the founder approves the deployment |
| anything else | any | nothing | 503 `STORE_NOT_CONFIGURED` |

- **Fallbacks removed from `api/site00/production-spine.ts`.** The earlier default media store in the OS temp directory is gone, and so are the writable repository JSON in development and the fixture switch taken from a lone environment variable.
- **Supabase mode checks before opening.** It probes the schema and checks that the bucket exists and is private before handing out a store. A failed open is retried on the next request, never replaced.

## 4. Logical records → physical objects

| Logical record (§05) | Physical object |
| --- | --- |
| PRODUCTION_PROJECTS | `site00_managed_projects` (existing registry; THE EXCHANGE row added, `on conflict do nothing`) |
| PRODUCTION_JOBS | `site00_spine_jobs` |
| PRODUCTION_TAKES | `site00_spine_takes` |
| PRODUCTION_ASSETS | `site00_spine_assets` |
| PRODUCTION_APPROVAL_EVENTS | `site00_spine_approval_events` (append-only) |
| PRODUCTION_COST_RECORDS | view `site00_spine_cost_records` (quote vs actual per attempt) |
| PRODUCTION_PROVIDER_OPERATIONS | `site00_spine_provider_operations` (one row per attempt, kept from the job by trigger) |
| PRODUCTION_EDIT_SELECTIONS | view `site00_spine_edit_selections` (one per shot by unique index) |
| shot setup, budget, continuity frames, project roles | `site00_spine_shots`, `site00_spine_budgets`, `site00_spine_continuity_refs`, `site00_spine_members` |

The existing `site00_production_jobs` (website deliverables) and `site00_generation_jobs` (ASSTS) belong to other domains. They are not reused, so there is no second physical table for the same thing.

## 5. Fields (§06)

- **Jobs** carry project, shot, kind, route, provider, model, mode, settings, inputs, prompt and output request. They also carry quote (credits, time, source), ceiling, the founder authorization, the input hash, the idempotency key, the provider operation, status, attempts (each with ticket, authorization, operation, outcome, quoted and charged credits), transitions and errors.
- **Takes** add `intendedEditSec` (the shot's planned on-screen time) and `continuity.findings` (the reviewer's words).
- **Approval events** add `previousState`, `newState` and `sourceVersion` (`KIND/id@rN`). With actor, role, action, subject, rationale (`note`) and time, every §06 field is present.
- **Generation authorizations** also record the quote, route, purpose and the `ONE_JOB_ONE_ATTEMPT` scope they were given against.

## 6. Verification

| Check | Result |
| --- | --- |
| Records survive a new connection and a new OS process | PASS (`tests/productionSpineDurable.test.ts`, dry-run step 11) |
| Eight concurrent writers at one revision: one wins, seven `CONFLICT` | PASS (real PostgreSQL sessions) |
| Two "servers" dispatch one job at once: one provider request | PASS |
| A batch with one bad op leaves nothing behind | PASS |
| Unreachable database: `STORE_UNAVAILABLE`, no fallback | PASS |
| Store selection refuses unsafe combinations | PASS |
| Live Supabase project | NOT RUN: no staging project approved for changes. Script ready: `scripts/production/verify-spine-supabase.ts` |
