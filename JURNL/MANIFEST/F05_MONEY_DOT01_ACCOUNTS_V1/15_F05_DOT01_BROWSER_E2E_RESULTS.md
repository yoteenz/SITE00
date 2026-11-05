# 15 · Browser E2E results

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707.

Playwright 1.x, Chromium, against the Vite dev server (`JURNL_E2E_SKIP_WEBSERVER=1`). The projects:

- `small` 360 × 780: the financial and F05 journeys;
- `mobile` 393 × 852, `tablet` 834 × 1194 and `desktop` 1440 × 900: every JURNL spec.

The DOT 01 responsive test also sets 430 × 932 inside the test. All data is synthetic.

## Full JURNL regression (one run, 57.6 min)

- **Code:** the run started on `572f01fa`. The live-camera edit `e3994f7f` landed during it, and the dev server reloaded.
- **Not covered:** the camera spec did not exist yet, and the later parent fix `fc608eb3` came after the run. The final F05 reruns below cover both.

**Totals from the run: 466 passed · 9 failed · 8 skipped.**

| Spec | small | mobile | tablet | desktop |
|---|---|---|---|---|
| `jurnl-a11y-core.e2e.ts` | — | 7 ✓ | 7 ✓ | 7 ✓ |
| `jurnl-core-mutations.e2e.ts` | — | 9 ✓ | 9 ✓ | 9 ✓ |
| `jurnl-entry-setup.e2e.ts` | — | 4 ✓ | 4 ✓ | 4 ✓ |
| `jurnl-f05-carousel.e2e.ts` | 19 ✓ · 1 skip | 19 ✓ · 1 skip | 17 ✓ · 2 ✘ · 1 skip | 18 ✓ · 2 ✘ |
| `jurnl-f05-dot01.e2e.ts` | 29 ✓ · 1 ✘ | 29 ✓ · 1 skip | 29 ✓ · 1 skip | 29 ✓ · 1 skip |
| `jurnl-f05-motion-pilot.e2e.ts` | 14 ✓ · 1 ✘ | 15 ✓ | 13 ✓ · 2 skip | 15 ✓ |
| `jurnl-family-reachability.e2e.ts` | — | 15 ✓ | 15 ✓ | 15 ✓ |
| `jurnl-financial-os-stabilization.e2e.ts` | 8 ✓ | 8 ✓ | 8 ✓ | 8 ✓ |
| `jurnl-financial-os.e2e.ts` | 8 ✓ | 8 ✓ | 8 ✓ | 8 ✓ |
| `jurnl-global-systems.e2e.ts` | — | 8 ✓ | 8 ✓ | 8 ✓ |
| `jurnl-golden-journey.e2e.ts` | — | 0 ✓ · 1 ✘ | 0 ✓ · 1 ✘ | 0 ✓ · 1 ✘ |
| `jurnl-paydown-sts.e2e.ts` | — | 2 ✓ | 2 ✓ | 2 ✓ |
| `jurnl-persistence.e2e.ts` | — | 1 ✓ | 1 ✓ | 1 ✓ |
| `jurnl-product-utility-journeys.e2e.ts` | — | 3 ✓ | 3 ✓ | 3 ✓ |
| `jurnl-production-hardening.e2e.ts` | — | 3 ✓ | 3 ✓ | 3 ✓ |

## Failures and isolated reruns

| Project | Spec | Test | Isolated rerun |
|---|---|---|---|
| small | `jurnl-f05-motion-pilot.e2e.ts` | F05 MONEY parent motion pilot › 3 / 5 / 6 · four accounts: approved hierarchy, live values, assets never netted with debt | PASS alone (11.4 s); the browser page crashed under load ("Page crashed" during goto) |
| small | `jurnl-f05-dot01.e2e.ts` | F05 DOT 01 — responsive (360×780 · 393×852 · 430×932 · 834×1194 · 1440×900) › nothing overflows sideways, controls stay on screen and touchable, inputs keep 16 px type | PASS alone (1.7 m); "Target crashed" under load (and the dev server was reloading an edit) |
| mobile | `jurnl-golden-journey.e2e.ts` | JURNL golden journey › F01–F16 coherent path with reload verification | PASS alone (41.7 s); the 90 s timeout under 2-worker load, as in #1706 |
| tablet | `jurnl-f05-carousel.e2e.ts` | F05 MONEY carousel › 07 / 08 / 09 / 10 · environment, MONEY title, summary and the global dock never move or re-mount | REAL REGRESSION → fixed in fc608eb3; carousel + pilot rerun on all four sizes: 135 passed, 0 failed |
| tablet | `jurnl-f05-carousel.e2e.ts` | F05 MONEY carousel › 25 · usable at this size: everything on screen, real touch targets, no page scroll | REAL REGRESSION → fixed in fc608eb3; carousel + pilot rerun on all four sizes: 135 passed, 0 failed |
| tablet | `jurnl-golden-journey.e2e.ts` | JURNL golden journey › F01–F16 coherent path with reload verification | PASS alone (45.4 s); timeout under load |
| desktop | `jurnl-f05-carousel.e2e.ts` | F05 MONEY carousel › 07 / 08 / 09 / 10 · environment, MONEY title, summary and the global dock never move or re-mount | REAL REGRESSION → fixed in fc608eb3; carousel + pilot rerun on all four sizes: 135 passed, 0 failed |
| desktop | `jurnl-f05-carousel.e2e.ts` | F05 MONEY carousel › 25 · usable at this size: everything on screen, real touch targets, no page scroll | REAL REGRESSION → fixed in fc608eb3; carousel + pilot rerun on all four sizes: 135 passed, 0 failed |
| desktop | `jurnl-golden-journey.e2e.ts` | JURNL golden journey › F01–F16 coherent path with reload verification | PASS alone (43.1 s); timeout under load |

**F05 specs rerun on the final code** (`fc608eb3`, all four sizes) (`jurnl-f05-dot01`, `jurnl-f05-dot01-camera`, `jurnl-f05-carousel`, `jurnl-f05-motion-pilot`; small, mobile, tablet and desktop): **256 passed · 0 failed · 8 skipped**. The skips are by design (touch-only or once-only checks).

**Also on the final code:** JURNL unit suite 798 / 798; `npm run build` (tsc + vite + verify-production-dist) PASS.

## What the DOT 01 specs cover

`jurnl-f05-dot01.e2e.ts` has 31 tests and `jurnl-f05-dot01-camera.e2e.ts` has 1:

- the directory, with a persisted and cancelled reorder;
- the empty state and account setup (a card limit is never invented);
- the four account pages, with id-bound values;
- histories with search and filters in the URL, a card statement and all transactions;
- cash spending, card purchase, card payment states with the overpay guard, and add cash as a transfer;
- receipts with **real on-device OCR on a synthetic photo**: scan → review → confirm (one entry, photo on the device only, no upload, no receipt text in logs), duplicate, failure → manual, PDF refused, and the live camera preview;
- corrections with the trail, reversal once only, and transfer legs refused;
- reconciliation (never with a difference; one adjustment entry);
- archive blocked and confirmed;
- settings and purposes;
- overlays (focus trap, Escape, focus return, page state kept, dock covered);
- chrome as the authorities draw it (dock only on 06 / 31, full-bleed elsewhere, chips per screen, no corner chrome);
- typography, no circular controls, axe, five sizes and reduced motion.

The receipt tests are a real OCR run on synthetic images in Chromium. They are **not** a printed-receipt or phone-camera test, and not iOS Safari.
