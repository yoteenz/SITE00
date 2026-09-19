# SITE 00 Origin System

**Status:** Implemented P0.C (2026-08-25)  
**Predecessor:** P0.B Project Core + Project ID Isolation

---

## Core rule

```
CLIENT INPUT → STORED AS CLIENT TRUTH
NOT: CLIENT INPUT → AUTOMATIC CANON
```

Origin ingestion preserves everything the client supplied as source truth without auto-canonizing, rewriting as brand truth, or generating creative output.

---

## Architecture

```
PROJECT (site00_projects)
  → ORIGIN INGESTION SESSION (site00_origin_ingestion_sessions)
    → CLIENT TRUTH RECORDS (site00_client_truth_records)
    → SOURCE REFERENCES (site00_logical_assets, asset_type=source_reference)
    → ORIGIN SUMMARY (site00_origin_summaries — derived, is_canonical=false)
```

---

## Client truth semantics

**Table:** `site00_client_truth_records`

| Field | Values |
|-------|--------|
| `truth_class` | `CLIENT_SUPPLIED`, `FOUNDER_PROPOSED_CONCEPT` |
| `status` | `RAW`, `UNAPPROVED` → non-canonical; `REVIEW`, `WITHDRAWN` |
| `payload.category` | Generic Origin category (see below) |
| `payload.truthLabel` | `CLIENT_CONFIRMED`, `CLIENT_PROPOSED` |
| `payload.isCanonical` | Always `false` at Origin phase |

Client truth is **not** brand canon, product canon, world canon, or visual canon.

---

## Origin categories (generic)

`shared/site00-origin/categories.ts`:

- PROJECT_OVERVIEW, PROJECT_TYPE, CURRENT_BRAND_STATE
- CLIENT_GOALS, CLIENT_CONCEPT, TARGET_USERS
- BUSINESS_MODEL, ENVIRONMENT_CONCEPTS, PLATFORM_CONCEPTS
- READER_MODEL, CLIENT_FLOW, PRODUCT_IDEAS, MERCHANDISE_IDEAS
- SOURCE_REFERENCES, CONSTRAINTS, UNRESOLVED_DECISIONS

---

## Ingestion session states

| Status | Meaning |
|--------|---------|
| NOT_STARTED | Session created, no inputs |
| IN_PROGRESS | Ingestion running |
| INGESTED | Source truth persisted, summary generated |

---

## Project lifecycle transition

After successful Origin ingestion:

`PRE_INGESTION` → `ORIGIN_INGESTED`

Does **not** transition to IDENTITY_COMPLETE, WORLD_READY, BLUEPRINT_READY, or PRODUCTION_READY.

---

## API actions (`api/site00/projects`)

| Action | Method | Capability |
|--------|--------|------------|
| `origin_ingest` | POST | ORIGIN_INGESTION |
| `origin_health` | GET | ORIGIN_INGESTION |
| `origin_summary` | GET | ORIGIN_INGESTION |
| `client_truth_store` | POST | CLIENT_TRUTH |
| `client_truth_list` | GET | CLIENT_TRUTH |
| `project_isolation_health` | GET | founder index |

---

## Service

`api/_lib/site00Projects/originIngestionService.ts`

- `ingestProjectOrigin(slug)` — idempotent seed + references + summary + status transition
- `generateOriginSummary(slug)` — derived from client truth; does not replace sources
- `buildOriginIngestionHealth(slug)` — per-project health report
- `transitionToOriginIngested(slug)` — guarded status transition

---

## Canon firewall

Origin ingestion:

- Does **not** call canon promotion APIs
- Does **not** write to `site00_brand_lore_profiles`
- Does **not** trigger WORLD_FORMATION runtime
- Sets `site00_origin_summaries.is_canonical = false`
- Stores environment concepts, business model ideas, and references as non-canonical

---

## UI

`/projects/:slug/origin` — `ProjectOriginPage.tsx`

Founder can view ingestion status, run ingestion, inspect client truth records and unresolved decisions.

---

## Migrations

- P0.B: `20260825180000_site00_project_core_isolation.sql`
- P0.C: `20260825210000_site00_origin_ingestion.sql`
