**Draft. Do not merge.** Stacked on #1706 (`274d7956`), which is stacked on #1705. Merge order: #1705 → #1706 → this PR. Nothing is deployed and no database was touched. **NEW_GENERATIONS: 0.**

Sprints:

- `P0.JURNL.F05-MONEY.PARENT-ANIMATED-COLLAGE-RECONSTRUCTION-AND-FIDELITY-PILOT.OPUS1` (the layered motion pilot)
- its in-flight addendum (#1706 as the financial baseline; animation follows settlement state)
- `P0.JURNL.F05-MONEY.PARENT-FOUR-PANEL-CAROUSEL-AND-MOTION-AUTHORITY-EXPANSION.OPUS1` (this update)

**See it:** `/production/jurnl/runtime/money?parent=motion`. `?parent=cabinet` returns to the approved MONEY hub, which **stays the default**.

## The MONEY parent, now a four-collection carousel

One page and one carousel. Each collection has four papers:

1. **ACCOUNTS:** the user's places, id-bound and live.
   - Liabilities are shown as OWED.
   - With more than four places, the page shows three and an **ALL PLACES · +n MORE** paper that opens the full list. The dots stay four.
2. **TRANSFERS:** IN TRANSIT · PENDING · SCHEDULED · RECENT TRANSFERS, from the #1706 settlement model.
3. **COMMITMENTS:** BILLS + SUBSCRIPTIONS · SAVINGS (money set aside for goals, *not moved*) · UPCOMING PAYMENTS · RESERVED. RESERVED equals COMMITTED in the band, to the cent.
4. **OUTLOOK:** SAFE TO SPEND (F09, 30 days, equal to AVAILABLE) · NEXT INCOME (F06; expected, not received; NOT SET when there is no date) · 30-DAY OUTLOOK · SPENDING INSIGHTS (recorded spending only).

How it behaves:

- **Only the papers move.** The SIDEKICK environment, title, summary band, dots and dock are pixel-identical in all four collections.
- **A change** is an exit toward the swipe, then an entry from the other side, with 30–35 ms stagger. It ends by 520 ms. The page entrance never replays.
- **Input:** touch / pen / mouse swipe, trackpad, ← →, four dots (≥ 24 × 44 px targets), and previous / next buttons.
  - No auto-rotation and no wrap.
  - Gestures stay inside the carousel; a touch from the screen edge is left to the system.
- **State lives in the URL** (`?c=`, replace navigation). Overlays, child routes, back and reload all return to the same collection.
- **Reduced motion:** the collection changes at once.
- **Every paper opens an existing route or sheet.** Gaps are documented, not faked: no transfers-only filter in ACTIVITY, and no insights surface.

### Code

| Path | What |
|---|---|
| `data/f05/moneyCarousel.ts` | reads the canonical owners only and writes nothing (unit-tested) |
| `runtime/screens/f05/{useMoneyCarousel.ts, CarouselPanelPaper.tsx, jurnl-f05-carousel.css}` | carousel controller, panel paper, carousel styles |
| `runtime/screens/f05/MoneyMotionParent.tsx`, `f05MotionLayout.ts` | the parent page, rewritten around the carousel |
| `runtime/state/store.tsx` | a REPLACE navigation updates the in-app back trail's current entry instead of adding a phantom step |
| 12 `families/F05_MONEY/MOTION_PILOT/F05_PAPER_*.webp` | the founder's papers from the four screens, true alpha, no baked text, no generative fill |

The runtime also moved to the founder's 9:16 SIDEKICK composition. Type was re-measured against the reference: median offset 2 px.

## Verification (rerun on this branch, not inherited)

| Check | Result |
|---|---|
| Carousel E2E (QA 01–28) at 360 × 780, 393 × 852, 834 × 1194, 1440 × 900 | **77 passed · 0 failed · 3 skipped by design** |
| Full JURNL E2E (363 tests, 4 sizes) | **355 passed · 3 failed · 5 skipped**. The 3 failures are `jurnl-golden-journey` hitting its 90 s timeout under load with the disk allowance spent. **Rerun alone: 3 / 3 passed** in 44–47 s. |
| JURNL unit tests | **737 / 737**: invariants 40, stabilization 27, pilot 20, carousel 10 |
| Full repo vitest | 11,329 passed, 91 failed. All 91 are in 58 non-JURNL files and fail identically at `274d7956`, so they are pre-existing. |
| `tsc` / `npm run build` / monetization guard / F01 CSS firewall | PASS |
| Fidelity vs each of the four screens | the shell is the SIDEKICK in every state; papers correlate 0.84–0.98 with their source art; named departures in doc 09 |
| Live RLS proof | **PREREQUISITE_BLOCKED** (QA secrets unavailable); not run, not reported as failed |

## For the founder

Doc 14 has the decisions:

- **RESERVED:** keep it equal to COMMITTED, or bills + payments only? Your screen's $420 is the latter.
- **Dot spacing:** keep the touch-target spacing, or match the screen?
- **Making the carousel the MONEY default.**

Asset corrections that would make it exact: a SIDEKICK with the JURNL label, and a 2× export. Child pages and other families are untouched.

## Evidence

`JURNL/MANIFEST/F05_MONEY_PARENT_CAROUSEL_V1/`:

- docs 01–17;
- `09_FIDELITY/`, `10_SCREENSHOTS/`, `11_MOTION/` (the preview is `F05_CAROUSEL_CHANGE_PREVIEW.webp`), `12_RESULTS/`;
- `F05_MONEY_CAROUSEL_FOUNDER_REVIEW.zip` and `F05_MONEY_CAROUSEL_FULL_EVIDENCE.zip`.

The pilot's original evidence, `JURNL/MANIFEST/F05_MONEY_PARENT_MOTION_PILOT_V1/`, is preserved.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_016iFHHZSJayUYsyciZFbowv
