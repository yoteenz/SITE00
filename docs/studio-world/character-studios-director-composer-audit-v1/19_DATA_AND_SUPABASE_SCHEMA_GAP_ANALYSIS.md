# 19 — Data and Supabase schema gap analysis

Read from `supabase/migrations` (63 files) on main. No database call was made. No migration was applied.

**Whether migrations are applied** is inferred from motherboard memory and `docs/supabase/PENDING_MIGRATIONS_CHECKLIST.md`. The production project has returned 522 errors to agents since 2026-10-02 (G-DATA-03).

## 1. Can the current model support each entity?

| Entity | Table today | Closest existing | Verdict |
| --- | --- | --- | --- |
| Actor identity | none | `StudioWorldActor` TS seed | Missing |
| Character assignment | none (JSONB in `site00_methodology_validation_runs` for NDXBOOK discovery) | `ProductionCharacter` type | Missing |
| Approved Look | none | `CharacterCampaignLook` type; fabrication in browser storage | Missing |
| Voice reference | none | THE EXCHANGE cast registry JSON (branch) | Missing |
| Scene | none | THE EXCHANGE scene index JSON (branch) | Missing |
| Shot | none | THE EXCHANGE shot list JSON; FILM (memory) | Missing |
| Keyframe | none | THE EXCHANGE keyframe manifest JSON | Missing |
| Generation (provider job) | `site00_generation_jobs` (asset, provider, provider job ID, model, idempotency key, request and response snapshots, status, attempt, error) | also `site00_production_jobs`, `site00_studio_world_runs` | **Reusable** with additions (G-ASSET-03) |
| Take | none | — | Missing |
| Media asset with provenance | `site00_asset_versions` (provider, model, prompt snapshot, seed, parameters, parent version, file path) | `site00_creative_asset_records` (text project ID) | **Reusable** with project, hash and bucket key |
| Approval event | `site00_review_events` (ASSTS); also `site00_approval_requests`, `site00_client_review_receipts`, `site00_founder_creative_judgments` | — | **Reusable**: `site00_review_events` for take decisions |
| Cost record | none (JSON columns `cost_summary`, `cost_usd`, `cost_metadata`) | gateway JSONL | Missing |
| Timeline placement | none | THE EXCHANGE multitrack JSON | Missing |
| Edit version | none | FILM EDL (memory) | Missing |
| Continuity state | none (`site00_creative_entries.continuity_graph` JSONB, unused) | THE EXCHANGE continuity ledger JSON | Missing |

Migration evidence:
- `20260817103000_site00_assts_asset_factory.sql` (generation jobs, asset versions, review events)
- `20260818143000` (projects, production jobs)
- `20260823120000` (creative asset records)
- `20260907160000` (creative entries, expression generation receipts; no code reads or writes them)
- `20261022120000` (fiction tables; not applied)

## 2. Keys, ownership, storage and provenance

| Issue | Evidence | Effect |
| --- | --- | --- |
| Project identity three ways: `site00_projects.id` (uuid), `site00_managed_projects.project_key`, free-text `project_id` or `project_slug` | migrations 20260818143000, 20260826123000, 20260823120000 | New tables need one key (G-PROJ-01) |
| Asset vault has no project column | 20260817103000 | Cannot scope assets to a project |
| Job and version rows have no cost and no content hash | same | Cannot reconcile spend or prove a file |
| Ownership enforced only in API code (`service_role_all` everywhere) | most migrations | Acceptable if every route is server-side |
| **Two policies named `service_role_all` have no TO clause** (`for all using (true) with check (true)`), so they apply to every role | `20260910180000_site00_brand_creative_context.sql:31-32` (applied 2026-09-16 per memory); `20260921120000_site00_page_concept_generation_runs.sql:26-27` (likely not applied) | Possible read and write through the public key; verify on a branch (G-DATA-02) |
| No migration creates a storage bucket or policy; code uses public `live-preview` URLs; nothing creates signed URLs | `api/_lib/site00Assts/storage.ts:3`; repository search | Unreleased footage would be public (G-ASSET-02) |
| Unused tables | `site00_expression_generation_receipts`, invalidation tables | Reuse or retire; do not duplicate (G-DATA-04) |

## 3. Storage model decision (D-03)

THE EXCHANGE convention is "no fiction tables in Supabase". Records live as repository JSON, CSV and Fountain files. Main nevertheless carries an unapplied `site00_fiction_*` migration.

| Option | For | Against |
| --- | --- | --- |
| Repository records (JSON) for takes, jobs and decisions; media in a private bucket | Matches THE EXCHANGE; reviewable diffs; works while the database is unreachable | No multi-device live state; the founder's phone decisions must reach the repository through an API or an agent |
| Supabase tables (additive) | Live state, multi-device, INBOX and ACTIVITY integration | Database state unknown; ownership rules to fix first |
| **Recommended:** repository records for the S1-01 pilot (phase 1); Supabase for phase 3 after G-DATA-03 is resolved | Footage starts sooner without blocking on the database | Needs one migration step later |

## 4. Additive schema sketch (phase 3; not applied)

These are names and keys only. No SQL is proposed for application in this audit.

| Table | Key columns | Reuses |
| --- | --- | --- |
| `site00_generation_jobs` (+ columns) | `project_id` FK, `shot_ref`, `purpose`, `quoted_credits`, `actual_credits`, `authorization_ref` | existing table |
| `site00_asset_versions` (+ columns) | `project_id` FK, `content_sha256`, `bucket`, `object_key`, `duration_ms` | existing table |
| `site00_production_shots` | `project_id` FK, `release_id`, `scene_id`, `shot_id`, `plan_version` | new |
| `site00_production_takes` | `shot_id` FK, `job_id` FK, `asset_version_id` FK, `character_id`, `look_id`, `look_version`, `state` | new |
| `site00_review_events` (reuse) | `subject_type` = TAKE, `subject_id`, decision, note, actor | existing table |
| `site00_cost_ledger` | `project_id`, `release_id`, `job_id`, `kind` (AUTHORIZED, COMMITTED, ACTUAL), credits, usd | new |
| `site00_edit_versions` | `project_id`, `scene_id`, `export_format`, `asset_version_id`, source take IDs | new |

Actor, Character, Look and voice tables follow D-05 (the canonical registry) in phase 2. They should not be created before that decision.

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| S-01 | Read-only migration status from the live project | Studio World | Database reachable | Dated list of applied migrations recorded |
| S-02 | Fix the two policies on a non-production branch | Studio World | D-14 | Anonymous-key request cannot read or write either table |
| S-03 | Private bucket by migration, signed reads | Production Asset Registry | D-04 | A master is unreachable without a signed URL; the URL expires |
| S-04 | Additive schema review (above) | Production Asset Registry | S-01, D-03 | Each entity appears once with foreign keys; no duplicate of an existing table |
