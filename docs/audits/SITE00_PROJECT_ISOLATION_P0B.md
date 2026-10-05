# SITE 00 Project Isolation — P0.B Report

**Date:** 2026-08-25  
**Sprint:** P0.B — Project Core + project_id Isolation  
**Predecessor:** [SITE00_PROJECT_INGESTION_READINESS_AUDIT.md](../audits/SITE00_PROJECT_INGESTION_READINESS_AUDIT.md)

---

## Summary

P0.B converts SITE 00 from NDXBOOK-implicit architecture to **capability-gated multi-project runtime**. NDXBOOK methodology preserved. Astral World registered as **PRE_INGESTION** minimal project.

---

## P0.A blockers addressed

| Blocker | P0.B status |
|---------|-------------|
| 244 NDXBOOK API guards | **Resolved** — 0 architectural slug guards remain |
| `site00_logical_assets` no project_id | **Resolved** — column + ownership_status + NDXBOOK backfill |
| `site00_project_ingestions` no project_id | **Resolved** — FK + link on ingest when slug provided |
| No project type enum | **Resolved** — `project_type` CHECK on `site00_projects` |
| No capability registry | **Resolved** — `shared/site00-projects/capabilities.ts` |

## P0.A blockers NOT addressed (by design)

| Blocker | Status |
|---------|--------|
| `WORLD_FORMATION_IMPLEMENTED=false` | Unchanged — correct |
| Production handoff compiler | Out of scope |
| Full asset vault redesign | Partial — project_id only |

---

## Guard counts

| Metric | Before | After |
|--------|--------|-------|
| NDXBOOK architectural guards (`api/site00/projects.ts`) | 244 | **0** |
| Hardcoded `projectId: 'ndxbook'` | 111 | **0** (uses `slug`) |

Remaining `ndxbook` references in codebase are **VALID_BRAND_CONTENT**, tests, or founder configuration — not architectural gates.

---

## Readiness recheck

| Capability | P0.A | P0.B |
|------------|------|------|
| PROJECT RECORD | PARTIAL | **READY** (Astral World registered) |
| PROJECT TYPE | PARTIAL | **READY** (enum + CHECK) |
| PROJECT ISOLATION | FALSE | **PARTIAL** (capability + asset FK; lineage text FK remains) |
| ORIGIN | PARTIAL | **PARTIAL** (ingestion FK; full Origin UI deferred) |
| CLIENT TRUTH | PARTIAL | **READY** (table + API) |
| ASSET OWNERSHIP | MISSING | **PARTIAL** (new assets scoped; legacy UNSCOPED possible) |
| CAPABILITY REGISTRY | MISSING | **READY** |
| WORLD SUPPORT | PARTIAL | **PARTIAL** (type supported; formation still false) |

**Astral World ingestion readiness:** **PARTIAL** — project exists; client truth path exists; full Origin UI + world intake link deferred to P0.C.

---

## Remaining ingestion blockers

1. Origin UI / world intake linked to Astral World project row
2. Full creative lineage `project_id` UUID FK (still text on creative_asset_records)
3. Project-scoped asset vault UX (ASSTS still operator-global UI)

---

## Recommended next sprint

**P0.C — Origin + Client Truth ingestion** (link world intake → project, Origin workspace, ingestion reconciliation workflow)

---

## Evidence

- Migration: `supabase/migrations/20260825180000_site00_project_core_isolation.sql`
- Capabilities: `shared/site00-projects/capabilities.ts`
- Resolver: `api/_lib/site00Projects/canonicalProject.ts`
- Tests: `tests/projectCoreIsolationP0B.test.ts` (10 pass)
- Architecture: `docs/architecture/SITE00_PROJECT_CORE.md`, `SITE00_PROJECT_CAPABILITIES.md`
