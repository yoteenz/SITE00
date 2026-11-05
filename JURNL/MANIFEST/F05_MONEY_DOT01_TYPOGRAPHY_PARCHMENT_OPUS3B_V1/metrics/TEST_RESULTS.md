# Test results (this branch, synthetic data only)

| Check | Result | Notes |
|---|---|---|
| TypeScript (`tsc --noEmit`, also inside `npm run build`) | PASS | |
| Production build (`npm run build`: tsc + vite + dist verification + release manifest) | PASS (3 builds in the first delivery, 1 after the continuation) | `verify-production-dist: OK (471 JS assets)` |
| JURNL unit suite (`vitest run tests/jurnl`, continuation build) | **862 / 863** (incl. `jurnlF05Dot01ArtworkType.test.ts` 12 / 12) | the 1 failure is pre-existing on the base: `jurnlF05MotionPilot` "accounts snap-scroll two per row" |
| financial-scope unit tests | 141 / 141 | `jurnlFinancialInvariants` 40, `jurnlFinancialStabilization` 27, `jurnlF05Dot01` (D01–D60 ledger) 62, `jurnlF05Pockets` 12 |
| F05 E2E — new `jurnl-f05-dot01-artwork-type.e2e.ts` | **36 / 36** (small · mobile · tablet · desktop, continuation build; now also asserts each overlay's own seal) | first runs found 3 test-precision issues (a production build inlines the 3 KB glyphs as data URIs; the authority's 9 px REORDER offset at tablet scale) and 1 real defect (both scan pills on the 44 px floor at 393 px) — all fixed, re-run green |
| F05 E2E — `jurnl-f05-dot01.e2e.ts` | **117 passed, 3 skipped** (4 projects, continuation build) | the skip is the suite's own responsive test, run on `small` only by design |
| F05 E2E — `jurnl-f05-dot01-directory.e2e.ts` | **24 / 24** (4 projects, continuation build) | |
| F05 E2E — `jurnl-f05-dot01-camera.e2e.ts` | **2 / 2** (small, mobile, continuation build) | |
| F05 E2E — `jurnl-f05-pockets.e2e.ts` | **41 / 42** (small 14, mobile 14 on the continuation build; tablet 13 on the first-delivery build) | the failure is pre-existing on the base: T04 on tablet |
| editorial / V3 — `jurnl-editorial-overlays.e2e.ts` | **27 / 27** (small, mobile on the continuation build; tablet on the first-delivery build) | |
| financial journeys — `jurnl-financial-os.e2e.ts`, `jurnl-financial-os-stabilization.e2e.ts` | **32 / 32** (small, mobile, continuation build) | |
| **F05_E2E total (latest result per suite × project)** | **279 / 280 passed, 3 skipped** | 1 pre-existing failure (pockets T04 tablet) |
| not run | carousel, motion-pilot suites | they fail on the base (MONEY parent rail, Cursor) and nothing in this sprint touches them |

E2E ran against the production preview (`vite preview`, port 5176) of the built bundle. iOS Safari: **UNVERIFIED** (Chromium only).
