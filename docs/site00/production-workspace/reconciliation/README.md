# Production Workspace — project isolation, logic reconciliation, panel intelligence

Sprint `P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-ISOLATION-LOGIC-RECONCILIATION-PANEL-INTELLIGENCE1`.

## Founder decision (authority)

The seven root tabs — **HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY** — are seven operational
projections of **one project-scoped production graph**.

> NO CROSS-PROJECT DATA FALLBACK. EVER.
> Missing project truth renders as a legitimate project-scoped empty / not-yet-established state.
> GLOBAL_TAB_AVAILABLE ≠ PROJECT_DOMAIN_ESTABLISHED.

## The chain (implemented)

```
ACTIVE_PROJECT ─▶ PROJECT_GRAPH ─▶ WORKSPACE_DOMAIN ─▶ NODE / STATE / QUERY ─▶ PANEL DATA
 URL (path slug      assembleProjectGraph   the tab            getWorkspacePanelData      every row = one record,
 or ?project=) →     (adapters over the      (7 projections)    (throws on a foreign       every count = a list length
 per-tab choice →    project's own source                       graph)
 none = picker       truth + its ledger)
```

| Layer | Code |
|---|---|
| Graph types, node stages, pipeline | `shared/site00-production-graph/types.ts`, `graph.ts` |
| Source-truth adapters | `shared/site00-production-graph/adapters/` — family contracts (JURNL), visual-authority package (AIO), expression production (NDXBOOK Entry 002, live), world system (Astral World) |
| Project sources (host) | `src/site00/production/projectGraphSources.ts`, `useProjectGraph.ts` |
| Workspace ledger (cross-tab actions) | `shared/site00-production-graph/ledger.ts`, `src/site00/production/workspaceLedgerStore.ts` |
| Active project / URL scope | `shared/site00-production-graph/projectScope.ts`, `src/site00/production/activeProject.ts` |
| Panel query + counts | `shared/site00-production-graph/query.ts` |
| Capability map | `shared/site00-production-graph/capabilities.ts` |
| Panel contracts | `shared/site00-production-graph/panelContracts.ts` |
| DESIGN method / EXPERIENCE kinds | `shared/site00-production-graph/methods.ts` |
| Tab surfaces | `src/site00/production/WorkspaceSurfaces.tsx`, `src/site00/components/productionAuthority/projectGraph/*` |

## Documents

| File | What it answers |
|---|---|
| [current-workspace-data-map.md](current-workspace-data-map.md) | Every tab's data source before → after, classified (CANONICAL_PROJECT_SCOPED … UNKNOWN) |
| [project-isolation-audit.md](project-isolation-audit.md) | Every leak / default found, the isolation mechanism, stale-state invalidation, route validity |
| [panel-intelligence-audit.md](panel-intelligence-audit.md) | PanelContract model, the eleven questions, every graph panel, every audited panel |
| [pipeline-reconciliation.md](pipeline-reconciliation.md) | Canonical pipeline graph + node stages, how each source state maps onto them |
| [workspace-domain-contracts.md](workspace-domain-contracts.md) | Tab semantics; DESIGN site, EXPERIENCE world and EXPRESSION contracts |
| [project-domain-capability-map.md](project-domain-capability-map.md) | Project × domain applicability vs establishment |
| [cross-tab-state-map.md](cross-tab-state-map.md) | Ledger actions and their effects in every tab (the three founder example flows) |
| [media-slot-audit.md](media-slot-audit.md) | Graph media roles, contained previews, missing states, casting overview media |
| [legacy-default-fallbacks.md](legacy-default-fallbacks.md) | Every `'ndxbook'` default / fallback and what happened to it |
| [removed-or-replaced-panels.md](removed-or-replaced-panels.md) | Panels removed, replaced, gated, unmounted, still open |
| [implementation-report.md](implementation-report.md) | Final report (§37), tests, QA, remaining |

Machine-readable (generated from code — `npx tsx scripts/production-workspace/reconciliation-export.ts`):

- `project-graph-summary.json` — per project counts, domains, phase, next action, DESIGN method, EXPERIENCE kinds
- `project-domain-capability.json` — applicability × establishment
- `panel-contracts.json` — 24 graph panel contracts + 74 audited panels
- `project-isolation-qa.json` — live QA (3 viewports × 5 projects × 7 tabs + route flows)
- `boards/isolation-board-{mobile,tablet,desktop}.jpg` — every tab of every project, per viewport

## Proof

- `tests/productionProjectGraph.test.ts` (23) — isolation invariant, foreign rows dropped, project truth, count integrity,
  ledger propagation (DESIGN approve / revise, EXPERIENCE reject, EXPRESSION casting approve, AIO resolve), routing, contracts.
- `tests/productionProjectIsolation.test.tsx` (32) — tests A–H rendered on the real surfaces.
- `scripts/production-workspace/project-isolation-qa.mjs` — live: **105 / 105 routes pass, 49 / 49 flows pass, 0 leaks,
  0 foreign rows, 0 horizontal overflow, 0 page errors** at 393×852 · 834×1194 · 1440×900.
