# 15 — Implementation change manifest

- **Base:** PR #1706 head `274d7956`.
- **Branch:** `claude/jurnl-f05-money-motion-pilot-um0u93`.
- **Scope:** F05 MONEY parent only. No child page was redesigned, no other family changed, no API, database or migration was touched, and nothing was generated.

## New

| File | Purpose |
|---|---|
| `JURNL/F05_MONEY_MOTION_PILOT/INPUT/*` | The input package, unmodified (the extraction source) |
| `scripts/jurnl/f05-motion-pilot/extract_layers.py` | Deterministic extraction: GrabCut, two-band reconstruction, covered fill, seamless tile, torn-edge key, alpha QA, envelope check, zero-motion composite |
| `src/projects/jurnl/families/F05_MONEY/MOTION_PILOT/*.webp`, `F05_MOTION_GEOMETRY.json` | Runtime layers: SIDEKICK, title paper, wax seal, four card papers, panel tile, paper tile, torn edge, geometry and envelopes |
| `src/projects/jurnl/data/f05/moneyParentReading.ts` | Read-only selector for HELD, OWED, COMMITTED and AVAILABLE, plus the account papers (canonical model only) |
| `src/projects/jurnl/runtime/screens/f05/f05MotionLayout.ts` | Pure responsive geometry (board scale, crop, elastic panel, slots, pages) |
| `src/projects/jurnl/runtime/screens/f05/MoneyMotionParent.tsx` | The layered page: L0–L4, figures, papers, paging, chips, sheets, shared-element routing, reduced motion |
| `src/projects/jurnl/runtime/screens/f05/jurnl-f05-motion.css` | Layers, live type in board units, dock and menu re-seating, motion system, reduced motion, sheet skin |
| `src/projects/jurnl/runtime/screens/f05/MoneyParentRoute.tsx` | Opt-in switch: `?parent=motion` / `?parent=cabinet` (the cabinet stays the default) |
| `public/site00/projects/jurnl/fonts/pinyon-script-400.woff2` + `pinyon-script-OFL.txt` | Lowercase editorial script (SIL OFL, unmodified, via @fontsource) |
| `tests/jurnlF05MotionPilot.test.ts` | 14 unit tests |
| `e2e/jurnl/jurnl-f05-motion-pilot.e2e.ts`, `e2e/jurnl/helpers/jurnl-f05-world.ts` | E2E (20 checks, axe, reduced motion, frame sequences) and the synthetic worlds |
| `scripts/jurnl/f05-motion-pilot/.gitignore` | Ignores `__pycache__` |
| `JURNL/MANIFEST/F05_MONEY_PARENT_MOTION_PILOT_V1/*` | This evidence package |

## Modified (minimal)

| File | Change |
|---|---|
| `src/projects/jurnl/runtime/JurnlRuntimeRoot.tsx` | The `money` route renders `MoneyParentRoute` (which renders the unchanged `MoneyHubScreen` by default) |
| `src/projects/jurnl/runtime/screens/MoneyScreens.tsx` | `AddPlaceSheet` exported. The account title gets `view-transition-name: jrn-place`, the shared-element boundary. No other change. |
| `e2e/jurnl/helpers/jurnl-financial-world.ts` | `acct` exported for reuse |
| `playwright.config.ts` | The `small` (360 × 780) project also runs the pilot spec |

## Not changed (deliberately)

- **Financial model:** formulas and stores, including #1706's transfer settlement. No second Safe to Spend formula.
- **Approved cabinet hub:** the MONEY default, its tests and composition.
- **Global dock, Quick Add, add-place and transfer sheets:** components and behaviour.
- **Child pages:** other than the one transition-name hook.
- **Shell reduced-motion rule:** a pre-existing specificity gap, reported in doc 10.

## Commits

| SHA | Summary |
|---|---|
| `5f622ddd` | Pilot: extraction pipeline, live layers, motion |
| `edbff1ac` | Unit and E2E coverage, entrance budget, transition frames |
| `3e8ce83d` | Type floors, 44 px hit areas, safe-area chips and dock, clean paper tile |
| `2648182b` | Card ink masks keep imagery edges intact |
| `0d271a13` | Evidence package (first delivery) |
| `f16be3a7` | **Addendum:** transfer and card-payment visuals bound to #1706 settlement states (threads, tokens, slips, detail-sheet steps), state tests, single-owner guard |
| `faf6272c` | No literal amounts in comments (monetization guard) |
| (final) | Addendum evidence: doc 17, updated 01 / 06 / 07 / 08 / 12 / 16, ZIPs (see the PR) |
