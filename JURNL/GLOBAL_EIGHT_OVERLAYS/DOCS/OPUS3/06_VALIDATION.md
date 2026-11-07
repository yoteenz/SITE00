# 06 · Validation (OPUS3, regenerated shells)

The OPUS3 regenerated-shell work ships in the same draft PR as OPUS4 (#1723). It was validated on the combined head. The OPUS4 motion doc `JURNL/MANIFEST/F05_MONEY_MOTION_SYSTEM_OPUS4/13_REGRESSION_TEST_RESULTS.md` holds the full run record.

| Check | Result |
|---|---|
| Typecheck | clean |
| Build | pass (`verify-production-dist: OK`), not deployed |
| Unit | 948 / 948 in 55 files. OPUS3's own: `jurnlCleanArtworkOpus3.test.tsx` (K1–K4, D1–D3, S, E), `jurnlEditorialOverlays.test.tsx` (O4, plate mode), `jurnlGlobalMenuRecovery.test.tsx` (B8). |
| E2E, OPUS3 block (`jurnl-global-menu-recovery.e2e.ts`, mobile) | C0 / C4 / C20 SEARCH, C5 MANAGE POCKET, C6 BUFFER (keyboard open, saves USD), C7 PRIVACY at every viewport: **pass**. C0 / C4 / C20 needed the expected plate ratio corrected to the regenerated shell's 581 / 887: they asserted the retired shell's 2016 / 3584 and failed on 1297c7b34 too. |
| E2E, editorial overlays (mobile) | A3 MOVE MONEY on its shell, B2 note art and clip, B4 menu environment: **pass**. B1 SEARCH fails on the base too (URL query, pre-existing). |
| Runtime captures | 114 states (19 states × 6 viewports: 360 × 640, 393 × 660, 393 × 852, 430 × 932, 820 × 1180, 1440 × 900), from `scripts/jurnl/global-menu/capture_opus3_states.ts` with reduced motion. **Every overlay open, page scroll 0 / 114.** Sheets: `captures/AFTER_REGENERATED_SHELLS_<viewport>.jpg`; measurements: `captures/after_measure.json` (art ids per overlay, scrolling regions, focus). |

## Captured states

Each state below was captured at every viewport:

| Group | States |
|---|---|
| ADD A POCKET | default, keyboard open |
| MOVE MONEY | default |
| MANAGE POCKET | note, rename, delete confirm |
| SEARCH | recent, 0 / 4 / 20 results with a long merchant, keyboard open |
| MENU | top, final item reached |
| BUFFER | default, keyboard open, saved, rate unavailable |
| PRIVACY | top, list end |

## Remaining

The open items are in `05_REMAINING_LIMITATIONS.md`. They are unchanged by this validation.
