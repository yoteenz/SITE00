# 13 · REGRESSION TEST RESULTS

All runs were on this branch (head `e7cc0530c` and later) against the dev server on :5174. The comparison heads ran in a separate worktree on :5175:
- **base** `eb9058e03`: the PR base;
- **OPUS3 head** `1297c7b34`: the last commit before OPUS4.

## Summary

| Check | Result |
|---|---|
| Typecheck (`tsc --noEmit`) | **clean** |
| Build (`npm run build`) | **pass**: `verify-production-dist: OK (471 JS assets)`. Not deployed. |
| Unit (`vitest run tests/jurnl`) | **948 / 948** in 55 files, including `jurnlMotionOpus4.test.ts` (33) |
| OPUS4 browser spec (`jurnl-motion-opus4.e2e.ts`) | **63 passed, 12 skipped** across mobile, tablet and desktop (the six-viewport sweep runs once, in the mobile project) |
| F05 suites, `small` project, 360 × 780, 10 files, 120 tests | 80 passed on the first run (3 workers), 10 more on a 1-worker rerun. **29 remain: 28 fail identically on base, and 1 is flaky on both heads.** |
| Every file, `mobile` project, 393 × 852, 23 files | 3 overlay / menu / motion files: 47 / 52 first run, then 4 fixed (below), 1 pre-existing. Remaining 20 files: 127 passed, then a 1-worker rerun. **30 remain: 28 fail identically on the OPUS3 head, and 2 are crash flakes** (repeat ×3: branch 6 / 6, OPUS3 head 5 / 6). |
| **New regressions** | **0** (one OPUS4 test-timing regression was found and fixed; see below) |

## Found and fixed in this sprint

| Test | Cause | Fix |
|---|---|---|
| `jurnl-editorial-overlays` A3 (MOVE MONEY positions) | **Caused by OPUS4.** The test read the plate and the FROM paper while the new 420 ms entrance (slight rotation) was still running, which put it 2.5 px off. It passed at 1297c7b34 with the 260 ms entrance. | The test now waits until the plate's entrance has finished before reading resting geometry, as the OPUS3 C-tests already did. The assertions are unchanged. |
| `jurnl-global-menu-recovery` C0 / C4 / C20 (SEARCH) | **OPUS3 test defect.** These fail on 1297c7b34 too: they expected the retired OV05 shell's ratio, 2016 / 3584. | They assert the regenerated OV05 shell's own ratio, 581 / 887 (one uniform scale). |
| carousel E2E: `settle`, 24 · no duplicated images, change frames | The helpers awaited `finished` on **every** animation or called `finish()` on all. The new infinite ambient loops would hang or throw. | They skip `jm-amb-*` loops or non-finite animations. Every one-shot assertion is unchanged. Test 24 additionally asserts `ambientOnLayersOnly: true` (ambient runs only on `.jma-light` / `.jma-sheen > i`, at most two). The change-frames test keeps its strict "no shell animation during a change" check, which the director satisfies because navigation pauses ambience. |
| motion pilot E2E: `settle`, residue, entrance frames, route frames | Same cause. | Same treatment. The entrance-budget test now also asserts **the ambience is off during the entrance**, and measures the 650 ms budget over the entrance animations, not the ambient loops that start after it. |

## Pre-existing failures

These fail identically on the base or the OPUS3 head, with the same message and, where shown, the same values. They are not touched by OPUS4.

| Category | Tests | Cause on both heads |
|---|---|---|
| URL with query | DOT 01 directory D1 / D2 / D4 / D7; pockets T01 ×2, T04, T13 / T15 / T17, T14; DOT 01 02–05, VIEW ALL → back, dock placement, DOT 01 reduced motion; carousel 26 (logic intact); motion pilot 8 / 9 / 13 / 19 / 20, route frames, 14 (reduced motion); editorial B1 (SEARCH) | Navigation keeps `?parent=motion&c=accounts` on child routes, and the tests match the URL with a `$` anchor (e.g. received `…/money/places/visa?parent=motion`). |
| Accounts rail | carousel 01, 11, 24 (`papers: 6`), 25 (`f05m-place-cash right 515 > 360.5`), 26 (more than four places), the drag that starts over the BANK paper (the rail keeps its own horizontal scroll); motion pilot 4 and 15 – 18; pockets T06 | The accounts collection became a scrolling rail plus ADD / MOVE slots before OPUS3; these tests still expect four fixed papers. |
| Page crash under load | DOT 01 accessibility (axe over every DOT 01 page) | Crashes the Chromium renderer on both heads with one worker. |
| Timeout | golden journey F01 – F16 | Times out on both heads (already recorded as pre-existing in OPUS3). |
| Flaky | financial OS "spending: card purchase…" (small); "transfer: moving money…", "card payment on its way…" (mobile) | Pass or crash with the same frequency on both heads; repeats are listed above. |

## Evidence

Raw reports are in the full evidence ZIP, `TEST_REPORTS/`:
- `e2e-small*.json`, `e2e-mobile*.json`, and the base / OPUS3-head runs with the same `--last-failed` lists;
- `unit-final.json`;
- `typecheck.log`, `build.log`.
