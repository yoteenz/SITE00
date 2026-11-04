# 12 — Playwright carousel interaction results

**Spec.** `e2e/jurnl/jurnl-f05-carousel.e2e.ts`: 20 tests, run at every project size.

**Run.** Part of the full JURNL E2E run on branch `claude/jurnl-f05-money-motion-pilot-um0u93`, at code commit `a51bec4c`. Chromium (Playwright's bundled headless shell). Dev server `127.0.0.1:5174`. Synthetic data only.

**Raw results.** `12_RESULTS/e2e_full_jurnl_results.json` (every test, every project, with durations).

## Result: 77 passed · 0 failed · 3 skipped by design

Every test passed on 360 × 780 (`small`), 393 × 852 (`mobile`), 834 × 1194 (`tablet`) and 1440 × 900 (`desktop`), except these three skips:

- the change frame sequence is not captured at tablet size;
- the mid-drag capture uses a mouse, so it does not run on the two touch projects.

| QA (§17) | Test | small | mobile | tablet | desktop |
|---|---|---|---|---|---|
| 01 | first collection is ACCOUNTS: four id-bound places, live values | ✓ | ✓ | ✓ | ✓ |
| 02 · 03 · 04 · 05 | swipes advance one at a time, reverse returns, ends do not wrap (real touch on phones) | ✓ | ✓ | ✓ | ✓ |
| — | a short drag settles back; a drag never opens the paper it ends on | ✓ | ✓ | ✓ | ✓ |
| 06 | dots, previous / next, keyboard; focus follows; announced | ✓ | ✓ | ✓ | ✓ |
| 07 · 08 · 09 · 10 | environment, title, summary and dock are pixel-identical and never re-mount, in all four collections | ✓ | ✓ | ✓ | ✓ |
| 11 | four papers per collection, in the same four places | ✓ | ✓ | ✓ | ✓ |
| 12 · 21 | every panel opens its owner (8 routes, 4 sheets). Back, Escape, the page's sheets, Quick Add and a reload all return to the same collection; nothing written | ✓ | ✓ | ✓ | ✓ |
| 13 · 17 · 18 · 19 | canonical figures: in transit $80 / pending $60 / scheduled $200; BANK not credited, CASH not credited; HELD excludes debt; RESERVED = COMMITTED = bills + upcoming + savings; Safe to Spend = AVAILABLE = F09 | ✓ | ✓ | ✓ | ✓ |
| 14 · 15 · 16 | no transfers, bills or income: NONE / NO BILLS ADDED / NOT SET; savings $0 when a goal has nothing set aside; a missing date opens INCOME's add sheet | ✓ | ✓ | ✓ | ✓ |
| 14 | no places: Safe to Spend and RESERVED read ADD A PLACE FIRST | ✓ | ✓ | ✓ | ✓ |
| 20 | swipe, dot, key, button and trackpad changes leave the stored snapshot byte-identical | ✓ | ✓ | ✓ | ✓ |
| 23 | no history entries; no route change; vertical drags, drags over the title and touches from the screen edge are ignored | ✓ | ✓ | ✓ | ✓ |
| 24 | after each change: one collection, four papers, one seal / title / h1 / dock; nothing running, translucent or transformed | ✓ | ✓ | ✓ | ✓ |
| 25 | everything on screen in all four collections; dots ≥ 24 × 44 px; text inside its paper; no page scroll | ✓ | ✓ | ✓ | ✓ |
| 26 | a place opens by id and back returns to ACCOUNTS | ✓ | ✓ | ✓ | ✓ |
| 26 | more than four places: three + ALL PLACES (+4 MORE) → the full list; still four dots | ✓ | ✓ | ✓ | ✓ |
| a11y | carousel / slide semantics; no serious or critical axe violation in any collection | ✓ | ✓ | ✓ | ✓ |
| motion | exit then entry from the other side; only papers animate; ≤ 520 ms; frames captured | ✓ | ✓ | skip | ✓ |
| motion | mid-drag: papers follow with resistance (−20 to −100 px for a −100 px drag) | skip | skip | ✓ | ✓ |
| 22 | reduced motion: immediate change, zero animations; swipe, keys and panels work | ✓ | ✓ | ✓ | ✓ |

QA 26–28 also rest on the regression suites (doc 13).

## Pilot spec on the same run

`e2e/jurnl/jurnl-f05-motion-pilot.e2e.ts`: **58 passed · 0 failed · 2 skipped by design**. Its paging test now asserts ALL PLACES and four dots (directive §04: more than four places is a nested route, not pagination). Every other assertion is unchanged.

## Not covered here

- **Real devices.** There was no Mobile Safari, no real iOS or Android device, and no screen reader in this environment. Touch is real CDP touch input in Chromium's mobile emulation.
- **Motion constants.** Threshold, flick and resistance are set in emulation. They should be confirmed on the founder's phone (doc 05).
