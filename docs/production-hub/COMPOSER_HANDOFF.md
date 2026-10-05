# COMPOSER HANDOFF — Production Hub

Branch: `claude/narrative-momentum-widget-8zogkg` · Route: `/production` (existing; no new routing tree). Not merged to main.

## Architecture
- Pure core: `shared/site00-production-hub/` — `graph.ts` (deterministic node graph/status rules), `reducer.ts` (UI state machine), `model.ts` (canonical-data adapters, deep links), `assets.ts` / `assetReceipts.ts` / `manifest.ts` (slot registry, receipts, Grok manifest).
- UI: `src/site00/components/productionHub/` (`ProductionHub.tsx` orchestrator, `machine.tsx`, `panels.tsx`, `overlays.tsx`, `nav.tsx`, `HubImage.tsx`, `useProductionHubData.ts`); styles `src/site00/styles/site00-production-hub.css` (prefix `ph-`).
- Entry: `ProductionWorkspaceHubPage.tsx` renders `<ProductionHub />` in a portal layer; guarded by `Site00InternalProductionGuard` (founder/admin only).

## State model
`selectedProjectId, selectedProductionId, selectedSceneId, selectedNodeId, selectedArtifactId, selectedStoryboardFrameId, currentMode (LIVE|FLOW|DEPENDENCIES), inspectionState, expandedSurface, overlay, compareOpen, expandedAttentionId, activityFilter`. Scene and frame selection are independent. Context persists in sessionStorage `site00.production.hub.ctx.v1`; RESTORE never reopens overlays.

## Canonical data
Entry 002 via `useExpressionEngineEntry002` (B1P2/B48/B49R4), NME reel `beatSequence` (7 scenes), production cast state, project index, `productionRequestStore`, `productionActivityStore` (both device-local).

## Interactions
Mode switch; scene selector; node select + contextual quick actions; node inspector; artifact/authority expansion; frame lightbox; compare (no fabricated scores); founder decision (two-step confirm → `SET_FINAL_CINEMATIC_STORYBOARD_JUDGMENT`; revision also files `EXPRESSION_STORYBOARD_REVISION` request); On Your Table / Recent Activity expansion; project/production selector; attention quick view overlay; deep links `?from=hub&entry=002&scene&frame&node` with `HubReturnBar` restore.

## Known limitations / persistence TODOs
- Node status is production-level; no per-scene production records → persist per-scene records.
- Queue/activity are device-local → needs server queue API.
- Frame→scene mapping unavailable client-side.
- Comparison scoring unavailable (score shows UNAVAILABLE; DIFFERENCES/CONTINUITY disabled) → needs a comparison capability.
- Approval persistence relies on the existing expression-engine action; set node has no canonical data (LOCKED/NOT_STARTED).
- Only Entry 002 has real production data; other projects show empty slots.
- `public/site00/production-mobile/*.jpg` (earlier sprint stand-in crops) is not used by the Hub; recommend removing.

## Integrating Grok assets
1. Drop files at manifest `destinationPath`.
2. Append `{slotId, canonicalAssetId, url, source:'GROK', receivedAt}` to `HUB_ASSET_RECEIPTS`.
3. Re-run `npx tsx scripts/generate-production-hub-manifest.ts`; fulfilled slots drop out of the manifest.

## QA
`npm test -- p0ProductionHubMachine1`; run `npm run dev`, open `/production` as admin at 390px; compare against authority pack states 00–14. Anti-screenshot check: block all images — chamber must stay a coherent interactive machine.
