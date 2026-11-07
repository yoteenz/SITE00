# 17 · Financial non-regression

Base: #1713 `f7e2739c` (canonical card overpay guard, cabinet safe archive, canonical settlement) — **not modified**.
This sprint changed presentation only: no file under `data/` changed (see 21); `AccountPage` still reads every figure
from `accountView` / F07 `accountReservationHealth` and computes nothing.

## Unit (vitest, `tests/jurnl*`)

**823 / 823 passed, 0 failed** (211 suites).

| Financial / F05 file | passed / tests |
|---|---|
| `jurnlF05AccountScenes.test.ts` | 8 / 8 |
| `jurnlF05Carousel.test.ts` | 10 / 10 |
| `jurnlF05Dot01.test.ts` | 61 / 61 |
| `jurnlF05MicroAssetsB0506.test.ts` | 5 / 5 |
| `jurnlF05MotionPilot.test.ts` | 21 / 21 |
| `jurnlF05Pockets.test.ts` | 11 / 11 |
| `jurnlFinancialInvariants.test.ts` | 40 / 40 |
| `jurnlFinancialStabilization.test.ts` | 27 / 27 |

## Browser

**F05 + financial E2E** (7 suites × 4 projects: small 360×780 · mobile 393×852 · tablet 834×1194 · desktop 1440×900, production build via `vite preview`, 2 workers): **376 passed · 0 failed · 0 flaky · 8 skipped**. The 8 skips are the suites' own per-project conditions, unchanged.

Financial journeys included: `jurnl-financial-os.e2e.ts` (daily earnings, spending, bills, set-aside, card payment)
and `jurnl-financial-os-stabilization.e2e.ts` (transfer settlement, card payment on its way, minimum counted once,
shared set-aside), plus DOT 01 entries 16–20 (one canonical entry each; card payment recorded, never sent; overpaying
refused), reconciliation 13 / 23 and archive 25 / 36.

## Invariants held

* overpaying a card is refused (dot01 `20 ·…overpaying is refused`; unit financial invariants)
* a card purchase raises what the card owes and moves no cash; cash spending lowers cash only
* a transfer from an account to cash is a transfer, not income
* tracked, actual and difference stay apart; never reconciled with a difference
* an archived Pocket keeps its history and is never a page (NotFound)

PRODUCTION_DATABASE_MUTATIONS 0 · PAID_PROVIDER_SPEND 0 (synthetic data only, local device repository).
