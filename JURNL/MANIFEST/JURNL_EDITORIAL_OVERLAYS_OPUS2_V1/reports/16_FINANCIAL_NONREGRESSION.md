# 16 · Financial non-regression

No financial service changed: `createManualAccount`, `recordTransfer` (settlement start, duplicate guard), the archive
service (zero held balance, zero liability, no unresolved dependencies), `renameAccount` are called exactly as before.
Opening, typing in and dismissing any overlay writes nothing (E2E A3 counts the written legs; the search drawer only reads).
JURNL unit: **850 / 851** (the one failure is the MONEY parent rail test that fails identically on the untouched base). Financial
suites (jurnlFinancialInvariants, jurnlFinancialStabilization, jurnlF05Dot01, jurnlF05Pockets) are inside that run.

## Test results

| Check | Result |
|---|---|
| JURNL unit | 850 / 851 |
| new `jurnlEditorialOverlays` | 6 / 6 |
| E2E (production build, 10 specs × 4 projects) | 415 passed · 33 failed · 8 skipped |

| Spec | Project | passed | failed | skipped |
|---|---|---|---|---|
| jurnl-editorial-overlays.e2e.ts | desktop | 9 | 0 | 0 |
| jurnl-editorial-overlays.e2e.ts | mobile | 9 | 0 | 0 |
| jurnl-editorial-overlays.e2e.ts | small | 9 | 0 | 0 |
| jurnl-editorial-overlays.e2e.ts | tablet | 9 | 0 | 0 |
| jurnl-f05-carousel.e2e.ts | desktop | 14 | 6 | 0 |
| jurnl-f05-carousel.e2e.ts | mobile | 13 | 6 | 1 |
| jurnl-f05-carousel.e2e.ts | small | 13 | 6 | 1 |
| jurnl-f05-carousel.e2e.ts | tablet | 12 | 7 | 1 |
| jurnl-f05-dot01-camera.e2e.ts | desktop | 1 | 0 | 0 |
| jurnl-f05-dot01-camera.e2e.ts | mobile | 1 | 0 | 0 |
| jurnl-f05-dot01-camera.e2e.ts | small | 1 | 0 | 0 |
| jurnl-f05-dot01-camera.e2e.ts | tablet | 1 | 0 | 0 |
| jurnl-f05-dot01-directory.e2e.ts | desktop | 6 | 0 | 0 |
| jurnl-f05-dot01-directory.e2e.ts | mobile | 6 | 0 | 0 |
| jurnl-f05-dot01-directory.e2e.ts | small | 6 | 0 | 0 |
| jurnl-f05-dot01-directory.e2e.ts | tablet | 6 | 0 | 0 |
| jurnl-f05-dot01.e2e.ts | desktop | 29 | 0 | 1 |
| jurnl-f05-dot01.e2e.ts | mobile | 29 | 0 | 1 |
| jurnl-f05-dot01.e2e.ts | small | 30 | 0 | 0 |
| jurnl-f05-dot01.e2e.ts | tablet | 29 | 0 | 1 |
| jurnl-f05-motion-pilot.e2e.ts | desktop | 14 | 1 | 0 |
| jurnl-f05-motion-pilot.e2e.ts | mobile | 13 | 2 | 0 |
| jurnl-f05-motion-pilot.e2e.ts | small | 13 | 2 | 0 |
| jurnl-f05-motion-pilot.e2e.ts | tablet | 11 | 2 | 2 |
| jurnl-f05-pockets.e2e.ts | desktop | 14 | 0 | 0 |
| jurnl-f05-pockets.e2e.ts | mobile | 14 | 0 | 0 |
| jurnl-f05-pockets.e2e.ts | small | 14 | 0 | 0 |
| jurnl-f05-pockets.e2e.ts | tablet | 13 | 1 | 0 |
| jurnl-financial-os-stabilization.e2e.ts | desktop | 8 | 0 | 0 |
| jurnl-financial-os-stabilization.e2e.ts | mobile | 8 | 0 | 0 |
| jurnl-financial-os-stabilization.e2e.ts | small | 8 | 0 | 0 |
| jurnl-financial-os-stabilization.e2e.ts | tablet | 8 | 0 | 0 |
| jurnl-financial-os.e2e.ts | desktop | 8 | 0 | 0 |
| jurnl-financial-os.e2e.ts | mobile | 8 | 0 | 0 |
| jurnl-financial-os.e2e.ts | small | 8 | 0 | 0 |
| jurnl-financial-os.e2e.ts | tablet | 8 | 0 | 0 |
| jurnl-global-interactive-v3.e2e.ts | desktop | 4 | 0 | 0 |
| jurnl-global-interactive-v3.e2e.ts | mobile | 4 | 0 | 0 |
| jurnl-global-interactive-v3.e2e.ts | tablet | 4 | 0 | 0 |

Failures, classified:

| Spec | Project | Test | Class |
|---|---|---|---|
| jurnl-f05-carousel.e2e.ts | small | 01 · the first collection is ACCOUNTS: the approved four places with live, id-bound values | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | small | a drag short of the threshold settles back; a drag never opens the paper it ends on | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | small | 11 · every collection is four papers, in the four approved places | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | small | 24 · no duplicated images or ghosted layers once a change settles | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | small | 25 · usable at this size: everything on screen, real touch targets, no page scroll | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | small | 26 · more than four places: the first four places and VIEW ALL ACCOUNTS, which lists every place | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | mobile | 01 · the first collection is ACCOUNTS: the approved four places with live, id-bound values | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | mobile | a drag short of the threshold settles back; a drag never opens the paper it ends on | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | mobile | 11 · every collection is four papers, in the four approved places | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | mobile | 24 · no duplicated images or ghosted layers once a change settles | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | mobile | 25 · usable at this size: everything on screen, real touch targets, no page scroll | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | mobile | 26 · more than four places: the first four places and VIEW ALL ACCOUNTS, which lists every place | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | tablet | 01 · the first collection is ACCOUNTS: the approved four places with live, id-bound values | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | tablet | a drag short of the threshold settles back; a drag never opens the paper it ends on | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | tablet | 07 / 08 / 09 / 10 · environment, MONEY title, summary and the global dock never move or re-mount | FLAKY under 3-worker load: passes 3 / 3 in isolation (same assertion fails on the base desktop project) |
| jurnl-f05-carousel.e2e.ts | tablet | 11 · every collection is four papers, in the four approved places | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | tablet | 24 · no duplicated images or ghosted layers once a change settles | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | tablet | 25 · usable at this size: everything on screen, real touch targets, no page scroll | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | tablet | 26 · more than four places: the first four places and VIEW ALL ACCOUNTS, which lists every place | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | desktop | 01 · the first collection is ACCOUNTS: the approved four places with live, id-bound values | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | desktop | a drag short of the threshold settles back; a drag never opens the paper it ends on | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | desktop | 07 / 08 / 09 / 10 · environment, MONEY title, summary and the global dock never move or re-mount | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | desktop | 11 · every collection is four papers, in the four approved places | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | desktop | 24 · no duplicated images or ghosted layers once a change settles | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-carousel.e2e.ts | desktop | 26 · more than four places: the first four places and VIEW ALL ACCOUNTS, which lists every place | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-motion-pilot.e2e.ts | small | 4 · many accounts: the first four places and VIEW ALL ACCOUNTS; more places never add pages or d | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-motion-pilot.e2e.ts | small | 15 / 16 / 17 / 18 · readable at once, no duplicates, nothing off-screen, no page scroll | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-motion-pilot.e2e.ts | mobile | 4 · many accounts: the first four places and VIEW ALL ACCOUNTS; more places never add pages or d | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-motion-pilot.e2e.ts | mobile | 15 / 16 / 17 / 18 · readable at once, no duplicates, nothing off-screen, no page scroll | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-motion-pilot.e2e.ts | tablet | 4 · many accounts: the first four places and VIEW ALL ACCOUNTS; more places never add pages or d | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-motion-pilot.e2e.ts | tablet | 15 / 16 / 17 / 18 · readable at once, no duplicates, nothing off-screen, no page scroll | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-motion-pilot.e2e.ts | desktop | 4 · many accounts: the first four places and VIEW ALL ACCOUNTS; more places never add pages or d | PRE-EXISTING on base (MONEY parent rail) |
| jurnl-f05-pockets.e2e.ts | tablet | T04 · a scroll or drag never opens the menu, and a short tap is still a tap | PRE-EXISTING on base (MONEY parent rail) |
