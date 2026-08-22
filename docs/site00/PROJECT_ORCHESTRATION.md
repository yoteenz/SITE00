# SITE 00 Project Orchestration

Multi-project Brand + Production Operating System foundation (Sprint 01).

## Architecture Layers

1. **Organization Registry** — brands, infrastructure, classifications
2. **Launch Manifests** — target-specific requirements (not universal checklists)
3. **Workstreams** — project-specific production tracks
4. **Command Queue** — prioritized attention surface (data layer only in Sprint 01)
5. **External Systems** — registry for repos, Studio World, deployment, etc.
6. **Evidence & Reconciliation** — observed activity vs declared state
7. **Knowledge** — Canon, Reference, Template, Instance (four-layer model)

## Organization Classifications

| Classification | Example |
|----------------|---------|
| INTERNAL_BRAND_PLATFORM | SITE 00 |
| INTERNAL_BRAND | Frontal Slayer |
| MANAGED_BRAND | All In One Enterprises |
| PRODUCTION_INFRASTRUCTURE | Studio World |

Studio World is **infrastructure**, not a client brand (`client_facing = false`).

## Admin Authority Boundary

SITE 00 intelligence may **propose, classify, explain, prioritize, reconcile, calculate, recommend**.

It must **NOT** autonomously:
- Activate a proposed launch manifest
- Change authoritative scope
- Approve launch overrides
- Accept reconciliation state changes
- Mark launch complete

## API

`GET/POST /api/admin/site00-orchestration` (admin-only)

## Debug UI

`/admin/site00/debug/orchestration`

## Service Layer

`api/_lib/site00Orchestration/`

| Module | Role |
|--------|------|
| orchestrationService.ts | Main orchestration operations |
| manifestBuilder.ts | Deterministic manifest generation |
| readinessCalculator.ts | Target-specific readiness |
| deferralEngine.ts | Scope deferral with impact |
| commandQueue.ts | Command queue + next actions |
| reconciliationService.ts | Evidence vs declared state |
| dependencyGraph.ts | Requirement dependencies |
| seedFixtures.ts | DEMO / UNRECONCILED fixtures |

## Sprint 02 Handoff

- GitHub repository connections
- Frontal Slayer / Studio World / AIO deep reconciliation
- Replace fixtures with evidence-backed state
