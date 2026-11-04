# 19 · Implementation change manifest

Base: `main` @ `e413590e`. All changes additive or backward compatible; repository schema stays v5.

## New modules

| File | Purpose |
| --- | --- |
| `src/projects/jurnl/data/ledger/accounting.ts` | Pure engine: nature, location kind, basis, cents rounding, entry account / class / effect, positions, summary, flow totals |
| `src/projects/jurnl/data/ledger/ledgerOps.ts` | Builders → `FinancialCommit`: spending, transfers / card payments (duplicate guard), linked removal, balance correction, set balance, rename with backfill |
| `src/projects/jurnl/data/ledger/moneyPositions.ts` | Repository readers + hooks; purpose suggestions; `setPurposeAccount` |
| `src/projects/jurnl/data/ledger/purposes.ts` | Purpose → usual account defaults and resolution |
| `src/projects/jurnl/data/f06/dailyEarnings.ts` | Daily earnings breakdown, validation, build / edit / delete, totals |
| `src/projects/jurnl/data/f07/obligationLifecycle.ts` | Funding view, scheduled occurrences, create / edit / pay / undo / skip / reschedule / pause / stop |
| `src/projects/jurnl/data/f07/reservations.ts` | Set aside / reduce / release / reassign / settle on payment; per-account health |
| `src/projects/jurnl/data/f07/subscriptions.ts` | Views and monthly / annual equivalents |
| `src/projects/jurnl/data/f12/creditGuidance.ts` | Card facts, payment safety, interest, utilization, payment source plan |
| `src/projects/jurnl/data/f03/todayOperating.ts` | TODAY reading, attention fact, next steps |
| `src/projects/jurnl/data/foundation/dailyEarnings.ts`, `reservations.ts` | Types |
| `src/projects/jurnl/data/repository/ids.ts` | Collision-free ids |
| `src/projects/jurnl/runtime/finance/FinanceSheets.tsx` | Daily earnings, transfer, usual accounts, record spending, bill form, set aside, mark paid, more / history sheets |
| `src/projects/jurnl/runtime/finance/CreditSheets.tsx` | Card plan, record payment, card terms, overall use |
| `src/projects/jurnl/runtime/finance/TodayMoneySheet.tsx` | TODAY → SEE WHY drawer |
| `tests/jurnlFinancialInvariants.test.ts` | 40 tests, A–Z |
| `e2e/jurnl/jurnl-financial-os.e2e.ts` | 8 journeys × 4 viewports, screenshots, axe |

## Modified

| File | Change |
| --- | --- |
| `data/repository/types.ts`, `deviceRepository.ts` | `dailyEarnings`, `reservations`, `commit()`, list methods; unique tx ids; canonical enrichment in `appendTransaction`; account-id sync in `updateTransaction` |
| `data/repository/deviceServerMerge.ts` | Obligations and daily earnings count as device data |
| `data/home/moneyTypes.ts` | `LedgerEntry` canonical fields; `UpcomingItem.kindLabel / fundingLabel / direction` |
| `data/home/money.ts` | `useRepoTick`, `entryWhenLabel`, funding-aware `upcomingFor`, plain filter summary |
| `data/foundation/{accounts,accountMutations,categories,creditAttributes,dates,obligations,settings}.ts` | `DEBIT_CARD`, `is_payout_card`, `QUARTERLY`, month-end date helpers, obligation and card-term fields, purpose settings, real credit limit on create |
| `data/f09/safeToSpend.ts` | Invariant formula (doc 09), extra reported fields, plain labels |
| `data/f12/creditStore.ts` | Ledger-based summaries, explicit term patching, remaining-minimum projections |
| `runtime/screens/HomeScreens.tsx` | TODAY slip / status / rows / SEE WHY; Activity SPENDING button, plain copy, detail drawer for linked events |
| `runtime/screens/MoneyScreens.tsx` | Ledger balances; places list, MOVE MONEY, USUAL ACCOUNTS; add / edit place |
| `runtime/screens/IncomeScreens.tsx` | Earnings panel and sheets; expected income wording |
| `runtime/screens/UpcomingScreens.tsx` | Funding facts; bill detail actions; SUBSCRIPTIONS screen |
| `runtime/screens/CreditScreens.tsx` | Card facts, plan / pay / terms; honest add-card |
| `runtime/screens/SafeToSpendScreens.tsx` | Plain labels; bills include card minimums |
| `runtime/screens/{Plan,Goals,Ahead,CheckPurchase}Screens.tsx` | Functional copy |
| `runtime/components/TransactionRow.tsx` | Real date, account, class label |
| `runtime/global/GlobalSheets.tsx` | Quick Add defaults to the usual everyday account |
| `runtime/JurnlRuntimeRoot.tsx` | Route `upcoming/subscriptions` |
| `src/projects/jurnl/e2e/fixture.ts`, `scripts/jurnl/live-proof/buildQaSnapshot.ts`, `tests/jurnlDeviceServerMerge.test.ts` | New snapshot collections |
| `tests/jurnlF03F04Runtime.test.tsx`, `tests/jurnlRootAuthorityReconstruction1.test.tsx` | Assertions updated to the replaced copy |
| `tests/jurnlCurrencyEngine.test.ts` | Cash expectation at cent precision (bookkeeping rounds each entry to cents) |
| `playwright.config.ts` | `small` project (360 × 780) for the financial journeys only |
| `motherboard/MEMORY.md` | One appended entry |

## Imported from PR #1704 (verbatim)

`JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1/*`, `tests/jurnlProductUtilityAudit1.test.ts`, `scripts/jurnl/product-utility-audit/*`, `e2e/jurnl/jurnl-product-utility-journeys.e2e.ts`.

## Not changed

Plates, authority images, icons, typography, nav, logo / identity work (#1701 / #1703), Supabase migrations, server API, production data. No images generated; no OpenArt credits spent.
