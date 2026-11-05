# 13 · Financial non-regression

No data model, ledger, service or validation code was changed: the diff touches only the DOT 01 frame / stylesheet / two sheet
files (presentation: title paper, seals, scan art, action surfaces, type) and adds lifted images. `git diff --stat` on
`src/projects/jurnl/data/**` is empty.

| Invariant / behaviour | Evidence |
|---|---|
| canonical ledger, balances, transfers, credit-card rules, Safe to Spend | `jurnlFinancialInvariants` 40 / 40, `jurnlFinancialStabilization` 27 / 27 |
| DOT 01 ledger operations (record, correct / reverse, adjust to actual, archive safety, receipts, duplicates) | `jurnlF05Dot01` D01–D60: 62 / 62 |
| zero-balance archive policy (zero held, zero liability, no unresolved transfers / commitments / reservations; history kept) | `jurnlF05Dot01` archive cases + E2E archive / archive-blocked journeys (`jurnl-f05-dot01.e2e.ts`, editorial B3) — pass; 25's button now draws the authority's dark pill but calls the same `archiveAccountSafely` |
| Pocket creation / rename / reorder / long-press / three-dot management | `jurnlF05Pockets` 12 / 12; `jurnl-f05-pockets.e2e.ts` 41 / 42 (T04 tablet pre-existing) |
| transaction entry through RECORD TRANSACTION | E2E R2 (fills the form and reaches TRANSACTION REVIEW) + the DOT 01 record / review / save journeys |
| financial journeys across the app | `jurnl-financial-os*.e2e.ts` 32 / 32 |

No fake balances were introduced (the lifted papers carry no figures; every amount is live), no production database was touched
(synthetic worlds only), nothing was deployed or merged. Full numbers: `metrics/TEST_RESULTS.md`.
