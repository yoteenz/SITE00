# Spatial drill-down engine — source audit & prototype 1

**Sprint:** `P0.SITE00.BUILDER.SPATIAL-DRILLDOWN-ENGINE.SOURCE-AUDIT-AND-INTERACTION-PROTOTYPE1`  
**Base:** `main` @ post-#1672 (five-tab Blueprint + creative intelligence)  
**Scope:** Audit + shared interaction layer + WORK (SHOP/SELL) and FEEL (BOLD) vertical slices only.

## 03 — Source forensics (actual paths)

| Concern | Primary source |
| --- | --- |
| Room 02 FEEL UI | `src/site00/builder-studio/rooms.tsx` (`FeelControls`, `FeelStageArrows`) |
| Room 03 WORK UI | `src/site00/builder-studio/rooms.tsx` (`WorkControls`, `WorkStageToggles`, `useWorkModules`) |
| Builder shell / routing | `src/site00/builder-studio/BuilderStudio.tsx`, `studioModel.ts` |
| Session → contract | `src/site00/builder-experience/spatialStudio/useBuilderSpatialIntakeSession.ts`, `mapping.ts` |
| Build Object renderer | **Three.js WebGL** — `buildObject/engine.ts` (`createBuildObjectEngine`) |
| Stage React wrapper | `buildObject/BuildObjectStage.tsx` (single engine instance per studio visit) |
| Composition (geometry) | `buildObject/composition.ts` — procedural boxes, stable element `id`s |
| Blueprint inspection | `buildObject/anatomy.ts` + `compose(..., { inspect })` (already used on Blueprint tab) |
| Camera | `engine.ts` `fitCamera`, `fitBounds`; tween `fromCamera` → `toCamera` (~680ms) |
| Motion / reduced motion | `BuildMotion` in composition; `usePrefersReducedMotion` snaps tweens |
| Design intelligence | `designResolution.ts`, `pageValueIntelligence.ts` (Blueprint read model) |
| Capabilities / pricing | `builder-experience/registry.ts` `CAPABILITIES`; estimator via `toEstimateConfig` + `clientView.builderEstimateView` / `scopeImpact` |
| Persistence | `spatialStudio/persistence.ts` → `localStorage` key `site00.bldr.spatialStudio.v1` |

**Renderer truth:** The architectural model is **real-time WebGL** (Three.js), not SVG/CSS sequences. Camera **can** move toward focused element bounds (`camera.focus` + `closeness`) — already proven on Blueprint inspection.

## 04 — Spatial feasibility (addressable regions)

| Region ID | Room | Element ids (composition) | Selectable today | Camera focus | Prototype |
| --- | --- | --- | --- | --- | --- |
| `WORK:SHOP` | 03 | `m-shop-*` | Module toggle (separate from explore) | Yes — inspect lit set | **Vertical slice** |
| `WORK:PAGES` … `PORTAL` | 03 | `m-pages-*`, `m-blog-*`, … | Toggle only | Supported via same inspect pattern | Not in slice |
| `FEEL:BOLD` | 02 | `plate-*`, `slab` | Direction strip | Yes — `feelBoldInspect` | **Vertical slice** |
| Blueprint sections | 05 | Envelope / side volumes | Tab + inspect | Yes | Unchanged |

**Mobile:** Stage uses container-sized canvas + `fitCamera`; drill-down uses same path. No extra render passes added in prototype.

## 10 — Capability taxonomy reconciliation (proposed vs engine)

| Proposed family | Maps to today | Notes |
| --- | --- | --- |
| Core experience | `PAGES` module → `EDIT_CONTENT`; `CORE_INCLUDED` copy | PAGES not implicit in estimator until module selected — **cannot** mark “always present” without contract change |
| Publish | `BLOG` + `EDIT_CONTENT` | Overlaps CMS, not separate enum |
| Sell | `SHOP` → `SELL` + `PAYMENTS` (comesWith) | Prototype target |
| Book | `BOOKING` → `BOOK` | Supported |
| Membership | `MEMBER_AREA` → `MEMBERSHIP` + `ACCOUNTS` | Overlap with portal |
| Client portal | `PORTAL` → `DATA_PORTAL` + bundled caps | Overlap with membership/accounts |
| Operations | `TEAM_ROLES`, `DASHBOARD`, etc. | No single WORK module — **no independent WORK tile today** |

**Do not rename enums** in this sprint; use this matrix for Phase 2 product design.

## 11 — Sub-option inventory (SHOP slice)

| Sub-option | Engine status |
| --- | --- |
| Catalog · bag · checkout | **EXISTING** — `SELL` when `SHOP` module on |
| Take payment | **INCLUDED** — `PAYMENTS` comes with `SELL` |
| Customer accounts | **OPTIONAL** — `ACCOUNTS`; prototype adds via `shopAccounts` spatial flag |
| Subscriptions / order mgmt | **NOT CURRENTLY OFFERED** as separate toggles |
| Digital-only products | **NOT SPLIT** in capability model (same `SELL`) |

## 12 — Pricing contract (prototype)

- Labels: `INCLUDED` · `OPTIONAL` · `SELECTED` · `REQUIRES QUOTE` · `UNAVAILABLE`
- Delta copy: `spatialDrilldown/pricingLabel.ts` → `scopeImpact` + `builderEstimateView` investment strings only
- **No fabricated dollar add-ons**; when estimator throws, show `REQUIRES QUOTE`

## 06–08 — Interaction grammar (implementation)

Ephemeral UI state: `spatialDrilldown/types.ts` (`DrilldownPhase`).  
Controller: `spatialDrilldown/controller.ts`.  
Persisted config: existing spatial fields + optional `shopAccounts`, `feelType`, `feelColor`.

Flow: **SELECT** (target) → **ENTER** (camera inspect) → **EXPLORE/EDIT** (panel) → **RETURN** (restore room camera).

Selection vs explore: module **toggle** unchanged on stage; **ENTER SHOP SPACE** / **ENTER DIRECTION** is separate control in drill panel.

## 14 & 17 — Vertical slices shipped

- **WORK:** SHOP drill-down panel + camera inspect + optional accounts + estimate delta text
- **FEEL:** BOLD drill-down + type/color refinements → `BuilderSelection.type` / `.color` via mapping

## Opus handoff

- Approved shell, tabs, cards unchanged
- Drill panel uses existing `bs-drill*` tokens (minimal CSS)
- Next: visual polish of panel density, stage affordance (“explore” glyph on module), haptic/keyboard enter shortcuts, expand regions to BOOKING/PORTAL

## Regression guard

Tests: `src/site00/builder-studio/spatialDrilldown/spatialDrilldown.test.ts`
