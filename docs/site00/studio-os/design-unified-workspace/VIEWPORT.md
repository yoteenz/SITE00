# DESIGN → VIEWPORT (final internal DESIGN mode, after ASSETS)

Sprint `P0.STUDIOOS.DESIGN.VIEWPORT-TAB-SONNET1` · pack `SITE00_VIEWPORT_TAB_SONNET_LITE` (3 authorities inspected).

VIEWPORT is the sixth mode of the existing unified DESIGN workspace (`BRAND · EXPERIENCE · SURFACES · COMPILER · ASSETS · VIEWPORT`).
It is not a new workspace, tool or global nav destination. The host shell (production header, project context, mode row,
atrium, DESIGN PIPELINE, ON YOUR TABLE, bottom nav) is untouched: only the stage content (the centre chamber and its
side panels) changes.

## Navigation invariant
Top nav: the five existing labels/order/routes + `VIEWPORT` appended. Bottom nav: `HUB · WORK · LIBRARY · ACTIVITY · EXIT`, unchanged
(labels, order, routes, active state). The authority images show different bottom-nav labels (INBOX / EXPERIENCE / EXPRESSION …); they are
**not** copied — the live canonical nav is preserved, as instructed.

## Files
- `dwsViewportMode.ts` — the single source of truth: `VpState` (device, orientation, custom size, zoom, route, expression, interaction,
  overlays, compare pair, reload key, validation + inspection marks), pure helpers (size, scale, safe-area insets, preview URL, validation),
  the VIEWPORT pipeline + ON YOUR TABLE deck data.
- `DwsViewportStage.tsx` — the stage (presets · routes · chamber · interactions · overlays; phone: rails + control strip + validation card + tool tabs).
- `dwsState.ts` — `vp` state + `VP_*` actions (the existing reducer; no second state machine). Persisted device-locally with the rest of the workspace.
- `DesignUnifiedWorkspace.tsx` — renders `DwsViewportStage` instead of `DwsStage` when `mode === 'viewport'`; pipeline/table take the VIEWPORT deck.

## Expressions (states of ONE chamber, never pages)
`preview` (default live client preview) · `presets` (preset active) · `custom` (width/height editor) · `interaction` (inspection) ·
`overlays` (safe area / grid / bounds) · `compare` (two-up) · `validation` (review). Route selection changes the frame `src` and keeps everything else.

## Live preview architecture
The client app renders in an **isolated same-origin iframe** (`/app/projects/:slug[/section]`; DEV builds use the client app's own DEV preview route
`/app/preview/fixture-app-ndxbook/…`, which is the only client route that renders without a client account). The iframe is sized to the logical
device size and CSS-scaled (FIT / 50 / 75 / 100). Host QA guides (safe area, grid, bounds) are drawn **above** the frame by the host with
`pointer-events: none`; no client CSS is modified and no client UI is mounted into host state.

## Honest limitations
- No standalone "Viewport Lab" existed in this codebase (no route, component, preset model, zoom or safe-area logic was found), so nothing was
  absorbed: the state above is the first and only viewport implementation (no duplicate sources of truth exist).
- Routes are the client app's real sections (HOME · REVIEWS · INBOX · LIBRARY · PROFILE). The authority's HOME/WORK/LIBRARY/ABOUT/CONTACT is a
  marketing-site route list that does not exist in this repo's client app.
- Validation is reviewer input: every check starts `NOT RUN`; nothing is auto-passed and there are no fake counts. PERFORMANCE and ACCESSIBILITY have
  no automated source yet. Interaction-inspection items are checklists marked by the reviewer.
- Compare is current-preset ↔ preset (DESKTOP / TABLET / MOBILE). CURRENT ↔ PREVIOUS needs version history that does not exist.
- Capture / proof / export is not shipped (no existing lab supported it cleanly). `OPEN IN NEW TAB` is provided.
- The VIEWPORT pipeline (RESEARCH … REFINE · VIEWPORT · PRODUCTION) and its ON YOUR TABLE cards are the authority's VIEWPORT deck. The other five modes keep their own pipelines unchanged.
- Phones are a vertical scroll: header, mode row and bottom nav are fixed, but the pipeline/table containers move down when a tool panel opens above them.
