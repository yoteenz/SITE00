# Builder Hybrid Spatial Studio V1 (technical foundation)

Sprint: `P0.SITE00.BUILDER.HYBRID-SPATIAL-STUDIO.V1-APPROVED-VISUAL-AUTHORITY-AND-EXPERIENCE-IMPLEMENTATION1`  
**Role redirect:** Composer owns contracts only; visual authority implementation → **Opus** (`BUILDER_OPUS_TECHNICAL_HANDOFF.md`).

## Approved visual authority manifest

| Ref | Asset path | Status |
| --- | --- | --- |
| Four-room experience (01–04) | `docs/site00/builder-experience/wireframes/BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg` | **APPROVED / INTEGRATED** |
| Blueprint reveal (05) | `docs/site00/builder-experience/wireframes/BUILDER_APPROVED_BLUEPRINT_REVEAL.jpg` | **APPROVED / INTEGRATED** |

Legacy Opus wireframes remain for selection semantics; **visual composition follows the approved JPGs above.**

## Route

- `/bldr/studio` — `BldrSpatialStudioPage`
- Feature flag: `VITE_SITE00_TEMPLATE_SYSTEM_V1` (must be enabled)
- Estimate dollars/windows: `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` (Blueprint metrics)

## Contract mapping

| Room | UI | Builder contract |
| --- | --- | --- |
| 01 PLACE | SIMPLE / ADVANCED / CUSTOM / WORLD | `spatialSelectionToBuilder` → build kind, structure, edition |
| 02 FEEL | MODERN / BOLD / EDITORIAL / IMMERSIVE | Visual system ids (estimator registry) |
| 03 WORK | PAGES, SHOP, … | `CapabilityId` set |
| 04 PACE | STANDARD / EXPEDITED / FLEXIBLE | `delivery` |
| 05 BLUEPRINT | Overview + tabs | `builderBlueprint` + `builderEstimateView` |

No hardcoded `$12,000–$18,000` or `6–10 weeks`. All timeline/investment strings come from `builderEstimateView`.

## Persistence

- Browser `localStorage` key `site00.bldr.spatialStudio.v1` (save / save for later)

## Deferred

- AR control (not implemented — no inert button)
- Live 3D — state-driven CSS build object + FRONT / SIDE / LAYERS views only

## Pricing calibration

Public marketing prices unchanged. See `BUILDER_PRICING_EVIDENCE.json` for calibration register inputs; founder decision still required before changing published entry prices.
