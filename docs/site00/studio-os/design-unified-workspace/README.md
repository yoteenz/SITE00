# DESIGN UNIFIED WORKSPACE — SONNET-STRUCTURE2

Route: `/production/:projectSlug/design-workspace` (internal-production guard; legacy `/production/:slug/design/*` untouched).

## QA
- Unit: `tests/designUnifiedWorkspace.test.tsx` — 18 tests (mode order, host, pipelines, uppercase of model + SSR markup, all expression-state reducer paths).
- Live browser flow (Playwright): 36 checks per viewport (desktop 1672×941, tablet 1086×1448, mobile 390×844), 0 failures — mode order, foot-nav order, bring-forward, library drawer, search, select → inspector, review modal, comment, request changes, approve, needs-you counter, journeys drawer, node select, path review, reject, compare, add to library, approve expression, synthesis generate, authority review, send for review, asset library, export, delete, return to overview, pipeline select, ON YOUR TABLE → modal, persistence on next load, project switch, 0 lowercase text nodes, 0 horizontal overflow, 0 page errors.
- Uppercase audit: 100–126 user-visible text nodes checked per viewport/state set → 0 lowercase violations (computed `text-transform` + source copy both uppercase; inputs/placeholders included).

## Known limitations
- Project artwork, atrium plate and 3D pipeline objects are slots (see `ASSET_SLOTS.json`); live gradient / SVG stand-ins render until registered.
- Content is seeded NDXBOOK content mirroring the authority; decisions persist device-locally (`localStorage`) — no backend contract was changed. Wiring to project data / review backend is the next step.
- Desktop-preview reload in the local dev harness shows a pre-existing `removeChild` error on other Production routes too (not introduced here); persistence was verified across a fresh page load.
