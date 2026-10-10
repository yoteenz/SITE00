# BLDR Hybrid Spatial Studio — reference fidelity asset manifest

Sprint: P0.SITE00.BLDR.HYBRID-SPATIAL-STUDIO.V1-GROK-REFERENCE-FIDELITY-ASSET-AND-ICON-REFINEMENT1

## References inspected

| ID | File | Coverage |
| --- | --- | --- |
| ATT-01 | founder attachment (5 phones) | PLACE, FEEL, WORK, PACE, BLUEPRINT overview |
| ATT-02 | founder attachment (4 phones) | PLACE–PACE |
| ATT-03 | founder attachment (blueprint hero) | BLUEPRINT |

Phone chrome and photographic set are excluded from the app.

## Current implementation (audit)

- Route `/bldr/studio` → `BldrSpatialStudioPage.tsx`
- Build object is **CSS 3D slabs**, not a Three.js scene and not a GLB. No unapproved mesh injected.
- Estimator values stay on `blueprintEconomics` / intake snapshot. Screenshot fixture prices are not hardcoded.

## Assets

| ID | Function | Path | Room |
| --- | --- | --- | --- |
| ICN-FAMILY | Monoline icons | `src/site00/components/bldr/spatial-studio/BldrStudioIcon.tsx` | all |
| THUMB-FAMILY | Distinct SVG architecture thumbs | `src/site00/components/bldr/spatial-studio/ArchitecturalThumb.tsx` | PLACE, FEEL, BLUEPRINT |
| MAT-CSS | Marble plinth, glass slabs, red portal `#E50107` | `src/site00/styles/site00-builder-spatial-studio.css` | stage |
| TYPE-BARLOW | Condensed headlines from local woff2 | `/site00/fonts/barlow-condensed/` | shell |

## Known visual gaps

- Photoreal marble/glass in the references is a rendered architectural model. This sprint improves the live CSS object. A Blender/WFE GLB remains a separate founder-gated fabrication dependency.
- AR control is not shown as active (unsupported).
- Core page chips (website/mobile/seo/analytics) remain informational, not new selectable modules.
