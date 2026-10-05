# SITE 00 — Visual Reconstruction P0.VR.1D.7

Reference scope awareness: full-screen vs workspace panel vs module authority.

## Problem

P0.VR.1D.4A correctly ingested the founder desktop mood board but compared embedded panel crops against full standalone routes (e.g. 403×414 Campaign panel vs 1440×900 Campaign route). This produced:

- Zero mapped desktop regions
- Sparse patch generation
- Artificially low visual scores
- `FAIL_REGION_MAPPING_RUNTIME`

## Solution

`p0vr1d7/` teaches the reconstruction engine **what level of UI** each reference represents before comparison.

| Module | Role |
|--------|------|
| `classifyVisualReferenceScope.ts` | Evidence-based scope classification |
| `scopeTargetRegistry.ts` | NDX desktop panel + mobile full-screen targets |
| `scopedReferenceDomRegionMap.ts` | Scope-rooted DOM mapping |
| `captureScopedRenderSnapshot.ts` | Panel element capture vs full viewport |
| `scopedPixelComparison.ts` | Reference crop vs scoped render crop |
| `reclassifyFounderBoardReferences.ts` | Reprocess 6+6 founder extractions |
| `markInvalidHistoricalScopeComparisons.ts` | Preserve + mark panel-vs-page comparisons |

## Scope types

- `FULL_SCREEN_REFERENCE` — mobile phone frames; desktop composite board
- `WORKSPACE_PANEL_REFERENCE` — embedded Campaign / Experiment / Content Ops / Character panels
- `MODULE_REFERENCE` — Cultural Intelligence module
- `COMPONENT_REFERENCE` / `INTERACTION_STATE_REFERENCE` / `ARTWORK_REFERENCE`

## DOM anchors

Desktop embedded panels use `data-vr-scope` on `OverviewFounderWorkspaceBoard` TapeCards:

- `ndx.desktop.overview`
- `ndx.desktop.campaign-board-panel`
- `ndx.desktop.experiment-panel`
- `ndx.desktop.content-ops-panel`
- `ndx.desktop.cultural-intelligence-panel`
- `ndx.desktop.character-lab-panel`

## Reused lineage

P0.VR.1D · P0.VR.1D.1 · P0.VR.1D.2 · P0.VR.1D.4 · P0.VR.1D.4A — no new reconstruction architecture.
