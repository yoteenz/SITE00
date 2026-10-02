# DESIGN UNIFIED WORKSPACE — AUTHORITY → IMPLEMENTATION MAP

Pack: `DWS_SONNET_LITE.zip` (read in the order given by `SONNET_README.txt` / `PACK_MANIFEST.txt`).
Route: `/production/:projectSlug/design-workspace` (additive, inside `Site00InternalProductionGuard`).
Entry: `src/site00/components/designUnified/DesignUnifiedWorkspace.tsx`.

| Authority | Implemented as |
|---|---|
| 01 DESKTOP × 5 modes | `DwsStage` (atrium slot + 2 | featured | 3 suspended boards), `DwsHost` top bar, pipeline, ON YOUR TABLE, foot nav. Desktop grid in `site00-design-unified.css` (`[data-viewport=desktop]`). |
| 02 TABLET × 6 | Same data, tablet-native composition: two-line header (brand/project/needs, then mode tabs), fan of boards around a dominant featured board, stacked pipeline + table, split drawer ↔ inspector, centred modal. |
| 03 MOBILE × 5 | Touch-first: compact header, mode tabs row, orbiting boards around the overview board, scroll hint bar, horizontally scrolling pipeline/table, one full-height sheet at a time (modal > inspector > drawer). |
| 04 INTERACTION EXPRESSIONS | BRAND: `BrandLibraryDrawer` + `AssetDetailsInspector` + `BrandReviewModal`. EXPERIENCE: `JourneysDrawer` + live `ExperienceMap` (SVG graph, selectable nodes) + `InteractionInspector` + `PathReviewModal`. SURFACES: `SurfaceFamiliesDrawer` + `SurfaceCenter` + `SurfaceDetailsInspector` + `CompareSurfacesModal`. COMPILER: `SynthesisDrawer` + `CompilerCenter` + `ProjectIntelligenceInspector` + `AuthorityReviewModal`. ASSETS: `AssetLibraryDrawer` + `AssetsCenter` + `MetadataInspector` + `AssetDetailsModal` + `ExportModal`. |
| 05 ICON PACK | `DwsIcons.tsx` — live SVG on a 24 grid, 1.5 stroke, red accent dot; navigation/action/review/status/object sets. Pipeline objects are live stand-ins until the 3D renders are registered (`ICON3D.PIPELINE.*`). |
| 05 ASSET PACK | Panel shells, boards, drawers/popups/modals, buttons/pills/chips/toggles, tabs/underlines/dividers/indicators, review + ON YOUR TABLE cards, pipeline tiles, counters/statuses/progress/toast, global footer navigation — all CSS/React in `site00-design-unified.css` + `DwsParts.tsx`. |

Immutable host: `DESIGN` · project selector · `BRAND EXPERIENCE SURFACES COMPILER ASSETS` · `NN ITEMS NEED YOU` · `DESIGN PIPELINE` · `ON YOUR TABLE` · `HUB WORK LIBRARY ACTIVITY EXIT`. Only the mode content, pipeline stage list and table cards vary.

Expression state primitives (`dwsState.ts`): MODE_SWITCH, OPEN/CLOSE_DRAWER, OPEN/CLOSE_INSPECTOR, OPEN/CLOSE_MODAL, SELECT_ARTIFACT, BRING_FORWARD, COMPARE, OPEN_LIBRARY, FILTER, SEARCH, ANNOTATE, COMMENT, APPROVE, REQUEST_CHANGES, CHOOSE, EXPORT, DUPLICATE, DELETE, RETURN_TO_OVERVIEW, PIPELINE_STAGE_SELECT, ON_YOUR_TABLE_SELECT (+ REJECT, ADD_TO_LIBRARY, SET_EXPORT_*, SYNTH_*, GENERATE, SEND_FOR_REVIEW, PATH_STEP, INSPECTOR_TAB, OPEN_EXPRESSION).
