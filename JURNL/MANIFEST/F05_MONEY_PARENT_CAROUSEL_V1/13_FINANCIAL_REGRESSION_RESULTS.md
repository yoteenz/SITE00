# 13 — Financial regression results

**Financial baseline:** PR #1706 at `274d7956`. None of the results below are inherited from it: every one was rerun on this branch, at code commit `a51bec4c`.

## Unit (vitest)

| Suite | Result |
|---|---|
| All JURNL unit suites (`tests/jurnl*`, 43 files) | **737 / 737** |
| — financial invariants (`jurnlFinancialInvariants`) | 40 / 40 |
| — stabilization, #1706 (`jurnlFinancialStabilization`) | 27 / 27 |
| — F05 motion pilot (`jurnlF05MotionPilot`) | 20 / 20 |
| — F05 carousel (`jurnlF05Carousel`, new) | 10 / 10 |

Raw results: `12_RESULTS/unit_jurnl_results.json`.

What the carousel unit tests prove:

- **Transfers.** Each panel sums only its own #1706 state. A transfer in transit credits no account; arrival removes it from the panel.
- **Commitments.**
  - BILLS = F09 `upcoming`.
  - UPCOMING PAYMENTS = card minimums + unsent transfers.
  - SAVINGS = goal set-asides, which are part of held back.
  - RESERVED = COMMITTED in the band, to the cent.
  - A goal set-aside moves no money.
- **Outlook.**
  - Safe to Spend = F09 (30 days) = AVAILABLE.
  - Next income comes from F06 and is never added to money held. With no date it reads NOT SET.
  - Spending = recorded spending over the last 30 days.
- **Read-only.** Reading the carousel changes no record. The module contains no write call and no storage access.
- **E2E world parity.** The E2E world's literal records (transfer legs, purchases, bills) equal what the app's own builders produce, apart from ids and timestamps. Read through the carousel, they give the figures the E2E suite asserts.

### Whole repository (for completeness)

| | |
|---|---|
| Full repo `npx vitest run` | 11,329 passed · **91 failed** · 5 skipped (11,425) |
| The 91 failures | 58 files, all outside JURNL (SITE00 studio, brand, visual reconstruction, NDX, API projects) |
| The same 58 files at the #1706 base `274d7956` | **the same 91 failed** (780 passed of 871), so they are pre-existing and not caused by this branch |

Details: `12_RESULTS/unit_full_repo_results.json`. Nothing was suppressed or changed to make tests pass.

## E2E (Playwright, all JURNL specs, four sizes)

| Run | Result |
|---|---|
| Full JURNL E2E: 363 tests across small, mobile, tablet and desktop | **355 passed · 3 failed · 5 skipped by design** (46.7 min, 2 workers) |
| The 3 failures | `jurnl-golden-journey` "F01–F16 coherent path with reload verification" on mobile, tablet and desktop: **test timeout (90 s) during a page load** |
| The golden journey rerun alone (1 worker, after freeing disk) | **3 / 3 passed**: mobile 46.8 s · tablet 45.1 s · desktop 44.1 s |

### Why the three timed out

- The golden journey makes about 16 full page loads inside one 90 s budget. In earlier full runs on this branch it took 76–88 s.
- During this run the machine was heavily loaded: two browsers plus the dev server.
- The session's disk allowance also ran out. A first tablet rerun failed with `ENOSPC: no space left on device` before old artefacts were removed.
- Alone, the journey passes in about half its budget.
- The journey does not use the carousel; it opens `/money`, which is the unchanged cabinet hub.
- **Honest status:** the three are reported as failed in the full run and passed on isolated rerun. Neither the timeout nor the test was changed.

### Financial specs in the full run, all passing on every project

| Spec | Result |
|---|---|
| `jurnl-financial-os` | 32 / 32 |
| `jurnl-financial-os-stabilization` (#1706) | 32 / 32 |
| `jurnl-paydown-sts` | 6 / 6 |
| `jurnl-core-mutations` | 27 / 27 |
| `jurnl-f05-motion-pilot` (incl. "transfer states drive the thread; only recorded steps move money") | 58 / 58 + 2 skipped |
| `jurnl-f05-carousel` | 77 / 77 + 3 skipped |

Raw: `12_RESULTS/e2e_full_jurnl_results.json`, `12_RESULTS/e2e_golden_journey_isolated_rerun.json`.

## Build and static checks

| Check | Result |
|---|---|
| `tsc --noEmit` | PASS |
| `npm run build` (+ `verify-production-dist`, 471 JS assets) | PASS |
| Monetization guard (no literal `$<digit>` in `src/projects/jurnl`) | PASS |
| F01 CSS firewall (all carousel CSS under `.jrn`) | PASS (in the JURNL unit suites) |

## Shared runtime change

`runtime/state/store.tsx` now makes a REPLACE navigation update the in-app back trail's top entry instead of adding one. This stops collection changes, and the index redirect, from leaving phantom back steps. Every JURNL E2E spec ran with it.

## Security

**PRODUCTION_SECURITY_PROOF: PREREQUISITE_BLOCKED.** The live Supabase RLS suite needs QA secrets that are not available in this session, so it did not run. This is not reported as a failure.
