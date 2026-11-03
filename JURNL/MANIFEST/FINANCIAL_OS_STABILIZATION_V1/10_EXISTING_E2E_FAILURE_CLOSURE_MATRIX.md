# 10 — Existing E2E and unit failure closure matrix

The seven distinct E2E failures that #1705 reported reproduce on `main` (`e413590e`, mobile). Sprint 1's run on `main` gave 15 passed and 7 failed, and the same seven failed on #1705. Each one was traced from the raw test file and trace to a root cause and fixed there.

- No assertion was weakened, no test was removed or skipped, and no selector was swapped without fixing the cause.
- Where an old assertion only checked that "a number is visible", it now checks the exact stored value and the exact Safe to Spend change in cents.

| # | Spec :: test | Observed failure | Root cause class | Root cause | Fix (where) | Assertion now | Result on this branch (mobile / tablet / desktop) |
|---|---|---|---|---|---|---|---|
| 1 | `jurnl-core-mutations` :: F11 trip reserve affects safe to spend | `locator('.jrn-home__num')` timeout | STALE_TEST_SELECTOR | The F09 parent became an approved authority composition. `.jrn-home__num` no longer exists, so the test read a removed visual class. | Product: stable value hook `data-jrn-value="safe-to-spend" data-jrn-amount-cents` on the F09 amount (`SafeToSpendScreens.tsx`). Test: `safeToSpendCents(page)`. | Stored `trip.reserved_amount = 100`; Safe to Spend drops by exactly 10000 cents | PASS / PASS / PASS |
| 2 | `jurnl-core-mutations` :: F08 plan assign reduces STS | `getByText(/ASSIGNED/i)` not found | STALE_COPY_ASSERTION | The assign confirmation copy changed in the approved PLAN composition. The test also never checked the amount. | Test: read the stored plan and the value hook | Stored `assigned_amount = 150`; drop of exactly 15000 cents; the PLAN folio shows `$150` | PASS / PASS / PASS |
| 3 | `jurnl-global-systems` :: Ask Jurnl opens without provider | `[data-jrn-trigger="today-ask"]` never appears | UNREACHABLE_INTERACTION (product defect) | TODAY had no way to open ASK JURNL. The footer MORE was inert text. | Product: footer MORE is a button (`today-more`) opening a drawer with ASK JURNL (`today-ask`) and shortcuts (`HomeScreens.tsx`) | Drawer opens; Ask shows `NO LIVE AI PROVIDER` | PASS / PASS / PASS |
| 4 | `jurnl-paydown-sts` :: simulated extra payment alone does not reduce STS | `.jrn-home__num` timeout | STALE_TEST_SELECTOR | Same as #1 | Same as #1 | Safe to Spend cents unchanged **and** ledger transaction count unchanged | PASS / PASS / PASS |
| 5 | `jurnl-paydown-sts` :: committed trip reserve reduces STS (contrast) | `.jrn-home__num` timeout | STALE_TEST_SELECTOR | Same as #1 | Same as #1 | Stored reserve 50; drop of exactly 5000 cents | PASS / PASS / PASS |
| 6 | `jurnl-product-utility-journeys` :: Journey B — obligation visible on Safe to Spend | `SecurityError` reading sessionStorage, then a weak visibility check | IFRAME_OR_SESSION_STORAGE_BOUNDARY + TEST_FIXTURE_DEFECT | `resetJurnlE2eSeedFlag` ran `sessionStorage` on `about:blank`, which has no origin. The bill was due **today**, so the inclusive 30-day period held two occurrences (doc 03, day-30 boundary). | Test helper: return early on `about:blank` (no boundary crossed). Test: due +3 days via `upcoming-due`. | Stored `amount = 140`; drop of exactly 14000 cents (one occurrence); lands on F09 | PASS / PASS / PASS |
| 7 | `jurnl-product-utility-journeys` :: Journey H — edit obligation amount | `upcoming-edit` timeout | TEST_FIXTURE_DEFECT + UNREACHABLE_INTERACTION | The `upcoming-up-` prefix also matched expected-income rows, which have no amount to edit. EDIT was hidden in the MORE sheet. | Test: select bills only (`upcoming-up-obl-`). Product: EDIT is a direct action on the bill (`upcoming-edit`); the MORE copy is `upcoming-more-edit`. | `obligation-funding` shows `$150` before **and after a reload** | PASS / PASS / PASS |
| 8 | Tablet :: F09 root safe reachable (sprint 1) | setup timeout under load, passed on rerun | ENVIRONMENT_LOAD | Machine load during a 3-worker run, not product | none needed | unchanged | PASS / PASS / PASS |

## F01 unit failures (2)

| Test | Observed | Root cause class | Root cause | Fix | Result |
|---|---|---|---|---|---|
| `jurnlF01Runtime` :: inspection switches … a production shell ignores them | expected `data-jrn-screen="F01.03"` | ENVIRONMENT_CONFIGURATION | In production mode, JURNL fails closed unless the server data plane is configured. CI configures it with non-secret placeholders. Locally it was absent, so the shell rendered the fail-closed screen. `vi.stubEnv` cannot help because `import.meta.env` is fixed when the worker starts. | `vi.mock` of `productionConfig` that resolves production exactly as CI does (`SERVER_SYNC`, `https://api.site00.com`). **Assertions unchanged.** Product fail-closed behaviour unchanged. | PASS |
| `jurnlMonetizationFoundation` :: no F01 screen renders plan, upgrade, trial, price or billing UI | expected `data-jrn-screen="F01.00"` | ENVIRONMENT_CONFIGURATION | Same | Same | PASS |

## Totals

Full existing JURNL E2E: `npx playwright test e2e/jurnl --project=mobile --project=tablet --project=desktop --workers=3`. 207 tests in 12 files, run on 2026-11-03.

| Measure | #1705 (sprint 1) | This branch |
|---|---|---|
| Tests (3 projects) | 183 | 207 (+24: the new stabilization spec, 8 × 3) |
| Passed in the full run | 160 | **204** |
| The 7 distinct pre-existing failures (21 instances) | failing | **0 failing**: all 21 instances pass |
| F01 unit failures | 2 | **0** |
| Non-pass in the full run | 23 | **3**: see below |

**The 3 non-passes are one test** (`jurnl-golden-journey` :: F01–F16 coherent path with reload verification), on all three projects. Classification: ENVIRONMENT_LOAD.

- **What happened:** mobile and desktop hit the 90 s test timeout (94.8 s and 93.8 s). On tablet, Chromium reported `Page crashed` while navigating to `/purchases`. The run had 3 workers on a 4-core runner at load ≈ 13.
- **Isolated rerun:** passes on mobile (49.6 s), tablet and desktop (1.6 min for both).
- **Sprint-1 timing:** 55.6 / 50.1 / 49.9 s, so the path is not slower on this branch.
- **Timeout:** not raised. The test is unchanged.

`PRE_EXISTING_FAILURES_RESOLVED: 7 / 7 (21 / 21 instances) + 2 / 2 F01 unit`. `PRE_EXISTING_FAILURES_REMAINING: 0`.
