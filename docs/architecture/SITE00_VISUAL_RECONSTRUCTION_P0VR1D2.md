# SITE 00 — P0.VR.1D.2 Live NDX Project Hub Reconstruction

**Execution sprint** — reuses P0.VR.1D + P0.VR.1D.1 architecture; does not duplicate engines.

## Purpose

Prove the screenshot-as-design-spec pipeline by:

1. Ingesting **actual founder** desktop + mobile mood boards
2. Extracting true screen viewports (not board canvas dimensions)
3. Running **real browser renders** (`skipRender=false`)
4. Capturing DOM measurements + screenshots + overlays
5. Producing actionable patches and honest pass/fail status

## Founder board locations

| Priority | Path |
|----------|------|
| 1 | `visual-references/founder/ndxbook/desktop-mood-board.png` + `mobile-mood-board.png` |
| 2 | `NDX_FOUNDER_DESKTOP_BOARD_PATH` / `NDX_FOUNDER_MOBILE_BOARD_PATH` env |
| 3 | Supabase `live-preview` → `site00/visual-references/projects/ndxbook/founder-workspace-*-board.png` |

Wireframe fixtures under `tests/fixtures/` are **not** founder boards.

## Run live reconstruction

```bash
npm run dev   # :5174
npx tsx scripts/visualReconstruction/runNdxProjectHubLiveReconstruction.ts
```

Dev fallback (reports `fixtureSubstitution: true`):

```bash
npx tsx scripts/visualReconstruction/runNdxProjectHubLiveReconstruction.ts --allow-fixture-fallback
```

Output: `/tmp/ndx-project-hub-live-vr/<timestamp>/report.json` + renders + overlays.

## Module location

`shared/site00-studio-world-production/visualReconstruction/p0vr1d2/`

| Module | Role |
|--------|------|
| `resolveNdxFounderBoardAssets.ts` | Founder board resolution (no silent fixture use) |
| `inferScreenViewportFromBoardCrop.ts` | Screen frame detection + viewport inference |
| `measureScreenReferenceResolution.ts` | Measured resolution (not defaulted SUFFICIENT) |
| `runNdxProjectHubLiveReconstruction.ts` | Live execution orchestrator |

## Honest status model

`ARCHITECTURE_READY` → `REFERENCE_INGESTED` → `SPEC_COMPILED` → `FIRST_RENDER_COMPLETE` → `CORRECTION_IN_PROGRESS` → `VISUAL_PASS` / `PIXEL_PASS` / `NEEDS_CORRECTION`

Do not report visual pass when only architecture exists.

## Tests

`tests/visualReconstructionP0VR1D2.test.ts`

## Lineage

P0.VR.1 → P0.VR.1A → P0.VR.1C → P0.VR.1D → P0.VR.1D.1 → **P0.VR.1D.2**
