# 04 · Verification

The E2E runs use the production build (`vite preview`) and synthetic worlds only. No production data was used.

## Unit tests and build

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `tests/jurnlEditorialOverlays.test.tsx` | 10 / 10 (O1–O5, C1, and the new E1–E4) |
| `tests/jurnlOverlayReplica1.test.tsx` | 11 / 11 (one assertion re-pointed, below) |
| JURNL unit tests, all | 866 / 867 |
| `npm run build` | PASS (`verify-production-dist: OK`) |

The new editorial tests pin this pass:

* **E1**: each overlay mounts the board's own parts, and MOVE MONEY's mark is the board's wax seal.
* **E2**: every lift keeps its own aspect and has no explicit height.
* **E3**: the papers are 9-sliced and never `background-size: 100% 100%`.
* **E4**: every part has its provenance and ships.

The replica test change: the F09 shell asset assertion now asserts board 06's parts. The F09 shell is asserted not drawn
any more. Every control and geometry assertion is unchanged.

The one JURNL unit failure is `jurnlF05MotionPilot` "Layout collections: 2 x 2 shell". It fails the same way on HEAD.

The repo-wide run also has 93 non-JURNL failures. The ten files that were not in the earlier baseline list fail
identically on the untouched HEAD: 13 tests in 9 files, both ways.

## End-to-end, Chromium (small 360 × 780, mobile 393 × 852, tablet, desktop)

| Group | Result |
|---|---|
| editorial overlays · global interactive V3 · pockets | 102 / 104 |
| editorial (re-run) · DOT 01 · directory · artwork-type · camera · motion pilot · carousel | 321 passed, 31 failed, 8 skipped |

Details on the failures:

* **B2 MANAGE POCKET on the 360-wide phone.** The fragment was wider than 90 % of 360. It is now `min(334, 85 % of
  the phone)`, as drawn, and it passes in the re-run.
* **Pockets T04 on tablet.** This failure predates this pass and is in the earlier baseline.
* **The 31 carousel and motion-pilot failures.** They are identical on the untouched HEAD build, the same 31 tests
  (verified by building HEAD and running both suites). They concern the MONEY parent's account collection, which no
  overlay in this pass touches.

## Runtime probe

`capture_editorial_overlays.ts` covered 8 overlays × 4 viewports (360 × 780, 393 × 660, 393 × 852, 430 × 932) at DSF 2.

| Measure | Result |
|---|---|
| states open | 32 / 32 |
| page scroll | 0 |
| off-screen controls outside a scroller | 0 |
| close in view | every overlay that has one |
| primary in view | 31 / 32 |

The one primary not in view is 07 RESOLVE ISSUES at 393 × 660 and 360 × 780. It is reachable inside the content
scroller, and OPUS2's own before and after metrics had 393 × 660 the same way.

Metrics: `metrics/overlay_measure_before.json` and `metrics/overlay_measure_after.json`.

iOS Safari: UNVERIFIED.
