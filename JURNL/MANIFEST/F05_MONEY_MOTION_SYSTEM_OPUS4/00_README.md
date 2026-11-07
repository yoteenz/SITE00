# F05 MONEY · MOTION SYSTEM (OPUS4)

Sprint: `P0.JURNL.F05-MONEY.INTELLIGENT-IMMERSIVE-MOTION-SYSTEM-AND-LIVING-ENVIRONMENT.CONVERGENCE.OPUS4`

JURNL's MONEY family now has one motion language:
- a central motion director;
- one easing per material;
- quiet ambient life on the independently mounted art after the entrance;
- tactile, interruptible responses to touch;
- feedback that follows stored financial state only.

| # | Document |
|---|---|
| 01 | [Motion baseline report](01_MOTION_BASELINE_REPORT.md) |
| 02 | [Motion architecture](02_MOTION_ARCHITECTURE.md) |
| 03 | [Material motion tokens](03_MATERIAL_MOTION_TOKENS.md) |
| 04 | [Motion director implementation](04_MOTION_DIRECTOR_IMPLEMENTATION.md) |
| 05 | [Ambient channels](05_AMBIENT_CHANNELS.md) |
| 06 | [MONEY parent motion](06_MONEY_PARENT_MOTION.md) |
| 07 | [DOT 01 motion](07_DOT01_MOTION.md) |
| 08 | [DOT 02 – DOT 04 motion coverage](08_DOT02_DOT04_MOTION_COVERAGE.md) |
| 09 | [Global overlay motion](09_GLOBAL_OVERLAY_MOTION.md) |
| 10 | [Asset motion ownership](10_ASSET_MOTION_OWNERSHIP.md) |
| 11 | [Reduced motion and accessibility](11_REDUCED_MOTION_AND_ACCESSIBILITY.md) |
| 12 | [Performance validation](12_PERFORMANCE_VALIDATION.md) |
| 13 | [Regression test results](13_REGRESSION_TEST_RESULTS.md) |
| 14 | [Responsive validation](14_RESPONSIVE_VALIDATION.md) |
| 15 | [Runtime motion recordings](15_RUNTIME_MOTION_RECORDINGS/) |
| 16 | [Before / after screenshots](16_BEFORE_AFTER_SCREENSHOTS/) |
| 17 | [Known gaps and artwork dependencies](17_KNOWN_GAPS_AND_ARTWORK_DEPENDENCIES.md) |
| 18 | [Founder review](18_FOUNDER_REVIEW.md) |

## Code

- `src/projects/jurnl/runtime/motion/`:
  - `director.ts`
  - `materials.ts`
  - `useMotion.ts`
  - `overlayMotion.ts`
  - `jurnl-motion.css`
- Integration:
  - `JurnlRuntimeRoot.tsx`
  - `screens/f05/MoneyMotionParent.tsx`
  - `useMoneyCarousel.ts`
  - `dot01/Dot01Frame.tsx`
  - `dot01/PocketManager.tsx`
  - `surfaces/JurnlSurfaces.tsx`
  - `global/ChildEnvironments.tsx`
  - `finance/FinanceSheets.tsx`
  - the F05, carousel, DOT 01 and child-environment stylesheets

## Tests

- `tests/jurnlMotionOpus4.test.ts`: unit tests for the director, materials, swipe timing, state mapping, and the stylesheet and asset-separation contracts.
- `e2e/jurnl/jurnl-motion-opus4.e2e.ts`: browser tests for ambient, swipe, overlays, financial feedback, reduced motion and responsive layout.
- Existing helpers updated to the ambient contract:
  - `jurnl-f05-carousel.e2e.ts`
  - `jurnl-f05-motion-pilot.e2e.ts`

## Recordings

Generated with `npx tsx scripts/jurnl/motion/record_opus4.ts <out>` against the running dev server. Each recording has its own video, timeline JSON and step stills.

Scope held for this sprint: no artwork generated, no schema change, no data mutation, no deployment, no merge.
