# SITE 00 Project Core (P0.B)

**Status:** Implemented 2026-08-25  
**Predecessor:** P0.A Project Ingestion Readiness Audit

---

## Canonical project model

**Authoritative table:** `site00_projects`

| Field | Purpose |
|-------|---------|
| `id` | UUID — canonical `project_id` for all FKs |
| `organization_id` | FK → `site00_organizations` |
| `slug` | Unique URL/API identifier |
| `name` | Display name |
| `project_type` | `IDENTITY` \| `SITE` \| `PRODUCT` \| `WORLD` |
| `experience_class` | Unified `ProjectExperienceClass` (scope/manifests) |
| `status` | Lifecycle: `ACTIVE`, `PRE_INGESTION`, `INGESTION`, `PRODUCTION`, `ARCHIVED` |
| `metadata` | Non-canon registration notes |

**Types:** `shared/site00-projects/projectTypes.ts`

---

## Project identity resolution

Single resolver: `api/_lib/site00Projects/canonicalProject.ts`

```typescript
resolveCanonicalProject({ projectId?, slug? })
→ Site00CanonicalProject + capabilities
```

**Error codes:**
- `PROJECT_NOT_FOUND`
- `PROJECT_CAPABILITY_UNAVAILABLE` (via guard)
- `PROJECT_ACCESS_DENIED` (access model)

Founder slugs (`ndxbook`, etc.) are ensured in DB via `founderProjectDbId.ts`. Client projects (`astral-world`) are registered via migration seed.

---

## Identity hierarchy

```
organization
  → project (site00_projects.id)
    → project-scoped systems (ingestions, logical assets, client truth)
```

**Do not infer project from:** hardcoded slug checks, global ASSTS state, experiment defaults.

---

## Registered projects (P0.B)

| Slug | project_type | status | Notes |
|------|--------------|--------|-------|
| `ndxbook` | PRODUCT | ACTIVE | Full methodology capabilities |
| `astral-world` | WORLD | PRE_INGESTION | Minimal record — no creative canon |
| `frontal-slayer` | WORLD | ACTIVE | Founder index |
| `studio-world` | SITE | ACTIVE | Production infrastructure index |
| `all-in-one-enterprises` | SITE | ACTIVE | Managed brand |

---

## Client truth ownership

**Table:** `site00_client_truth_records`

- `truth_class`: `CLIENT_SUPPLIED` \| `FOUNDER_PROPOSED_CONCEPT`
- `status`: `RAW` \| `UNAPPROVED` → non-canonical (does not enter brand lore automatically)
- Service: `api/_lib/site00Projects/clientTruthService.ts`
- API: `client_truth_store`, `client_truth_list` on `api/site00/projects`

Synthesis gate (`intakeSynthesisGate.ts`) still blocks public discovery → production profiles.

---

## Ingestion ownership

**Table:** `site00_project_ingestions.project_id` → `site00_projects.id`

- Linked when `projectSlug` provided to orchestration ingest
- Otherwise `RECONCILIATION_REQUIRED` + `reconciliation_note`
- Historical rows without evidence remain unscoped (not guessed to NDXBOOK)

---

## Asset ownership

**Table:** `site00_logical_assets.project_id` + `ownership_status`

- New ASSTS bootstrap assets stamped with NDXBOOK `project_id`
- Legacy unscoped rows: `ownership_status = UNSCOPED` until reconciled
- Query API: `listLogicalAssetsForProject(projectId)`, `listFilteredLibraryAssets({ projectId })`

**Storage paths:** `shared/site00-projects/storagePaths.ts` → `projects/{project_id}/...`

---

## Unresolved legacy data

| Area | State |
|------|-------|
| Pre-migration logical assets | Backfilled to NDXBOOK where deterministic; remainder UNSCOPED |
| Pre-migration ingestions | `project_id` null — reconciliation required |
| `site00_creative_asset_records.project_id` | Still `text` — lineage audit deferred to P0.F |

---

## Health diagnostic

API action: `project_isolation_health` → `buildProjectIsolationHealthReport()`

Reports: project count, capabilities per project, unscoped asset/ingestion counts, ndxbook guard count (expect **0**).

---

## Migration

`supabase/migrations/20260825180000_site00_project_core_isolation.sql`
