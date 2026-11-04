# 20 · Financial non-regression results

| Check | Result |
|---|---|
| JURNL unit (vitest `tests/jurnl*`) | **836 / 836 passed**, 215 suites (includes the new `jurnlGlobalInteractiveV3` ×11 and archive D53b / P08b) |
| financial unit invariants (`jurnlFinancialInvariants`, `jurnlFinancialStabilization`, `jurnlF05Dot01` D01–D60, `jurnlF05Pockets`) | all passed (inside the 836) |
| E2E — dot01, dot01-camera, carousel, motion-pilot, pockets, financial-os, financial-os-stabilization, global-interactive-v3 × small / mobile / tablet / desktop, production build (`vite preview`), 2 workers | **387 passed · 1 failed · 8 skipped (by design)** on the full run; the failure was DOT 01 test 25 on `small`, run with its pre-fix fixture (world overrode `balance` but not `available_balance`); after the fixture fix it **passes** on its own (and passed on mobile / tablet / desktop in the same run) → **388 / 388 executed tests pass** |
| typecheck (`tsc --noEmit`) | 0 errors |
| production build (`npm run build`, dist verify) | PASS |


**One deliberate financial-rule change — ZERO BALANCE BEFORE ARCHIVE (founder-approved).** `archiveBlockers` (the
canonical service the archive re-checks at the moment of archiving) adds `HELD_BALANCE`: a Pocket that still holds money,
is below zero, or (a card) holds a credit balance cannot be archived / deleted; nothing is moved, nothing is cancelled.
Existing blockers (unfinished transfers incl. scheduled / pending / in-transit, reserved funds, default account,
recurring payments, expected income, money owed on a card) are unchanged. Tests updated to the policy, none weakened:
D53 / P09 / P10 now spend the remaining balance (a recorded entry) before archiving; new D53b and P08b assert the
blocker; the Pockets E2E worlds start the deletable Pocket at zero and T14 asserts BALANCE REMAINING. Overpay guard,
canonical settlement, Safe to Spend, receipts, corrections and reconciliation: untouched.

PRODUCTION_DATABASE_MUTATIONS 0 · synthetic data only.
