# 16 — Stabilization implementation change manifest

- **Base:** PR #1705 head `c56691ec`.
- **Branch:** `claude/jurnl-financial-os-stabilization-um0u93`.
- **Scope:** JURNL only, plus `playwright.config.ts` (the `small` project's test list) and `motherboard/MEMORY.md` (the sprint log entry).
- **Not touched:** API, database, migrations, plates, generated assets, and other projects.

## Financial core (formula changes are marked ⚠ and listed with their consumers)

| File | Change |
|---|---|
| `data/home/moneyTypes.ts` | `LegSettlement`, `SettlementEvent`; optional `LedgerEntry.settlement`, `settlement_history` |
| `data/ledger/accounting.ts` ⚠ | `isTwoLegKind`, `legSettlement`, `legApplies`. `isEffective` now also requires the leg to be SETTLED. Consumers: every position, Safe to Spend, TODAY, Places, cards, F15. Only two-leg entries can be non-settled, so expenses, income and daily earnings are unchanged (40/40 sprint-1 invariants still pass). |
| `data/ledger/transferSettlement.ts` (new) | Derived transfer state, labels (transfer and card payment), allowed actions, idempotent step builder, removal guard, per-account totals |
| `data/ledger/moneyPicture.ts` (new) | Available in accounts, in transit, total tracked assets |
| `data/ledger/ledgerOps.ts` ⚠ | `TransferInput.start` (deprecated `pending` maps to PENDING; it used to apply both legs). Future dates are only allowed as SCHEDULED. Duplicate detection ignores cancelled, failed and reversed transfers. Removal is blocked while money is in transit. New `recordTransferStep`. |
| `data/f12/creditGuidance.ts` ⚠ | Card facts: confirmed in-cycle payments only (requires a statement date); pending payments; unmatched payments; `remainingMinimumAfterPending`; new PAYMENT_PENDING state. Consumers: credit screens, Safe to Spend card lines, TODAY, F13. |
| `data/f12/creditStore.ts` ⚠ | `creditPaymentProjections` uses `remainingMinimumAfterPending`; adds `cardsWithKnownMinimum` |
| `data/foundation/obligations.ts` | Optional `linked_card_account_id` |
| `data/foundation/upcomingProjection.ts` ⚠ | Skips a bill linked to a card whose minimum is known (the card line covers it) |
| `data/f07/obligationLifecycle.ts` | `linkObligationToCard`. MARK PAID on a linked bill points to the card payment. The link is carried through create and edit. |
| `data/f09/safeToSpend.ts` ⚠ | `computeSafeToSpendThrough` is the single owner (30-day wrapper unchanged in signature). Committed not-yet-sent transfers; in-transit, tracked-asset and transfers-to-confirm figures; linked card bills; possible duplicates; account shortfalls include unsent transfers. Adds `nextExpectedIncome` and `computeNextIncomeView`. |
| `data/f08/billSetAsides.ts` (new) | Read model of bill set-asides for Plan |
| `data/f03/todayOperating.ts` | `N TRANSFERS TO CONFIRM` attention line; transfer next step |
| `data/home/money.ts` | `upcomingFor` shows sample bills only with sample cash. With real balances and no bills, the list is empty (Safe to Spend already deducted nothing). |
| `data/parents/catalog.ts` | 12 family questions plain-languaged (doc 09) |

## Runtime (UI) — no plate, layout box or type style changed

| File | Change |
|---|---|
| `runtime/finance/FinanceSheets.tsx` | Transfer start chips and effect note; `TransferDetailSheet`; `OpenTransfersPanel`; bill card-link chips; MORE edit trigger renamed `upcoming-more-edit` |
| `runtime/finance/CreditSheets.tsx` | Card payment start chips; confirmed vs on-the-way rows; honest toast |
| `runtime/finance/SafeHorizonSheet.tsx` (new) | `horizonLine`, `HorizonBody` (two periods), `SafeHorizonSheet` |
| `runtime/finance/TodayMoneySheet.tsx` | Planning-period chips; transfer rows |
| `runtime/screens/SafeToSpendScreens.tsx` | Printed `AVAILABLE THROUGH OCT 18` replaced by the live period button; value hook `data-jrn-value="safe-to-spend"` |
| `runtime/jurnl-f09-authority.css` | Button reset for the period line; `pointer-events: auto` on that line only |
| `runtime/screens/HomeScreens.tsx` | Head `YOUR MONEY.`; footer MORE opens a drawer (ASK JURNL plus shortcuts); empty COMING line; Activity transfer detail |
| `runtime/screens/MoneyScreens.tsx` | Places summary (available, cash, in transit, tracked, owed); moving lines; open transfers |
| `runtime/screens/CreditScreens.tsx` | Open transfers for the card |
| `runtime/screens/UpcomingScreens.tsx` | Linked-card panel; possible-duplicate link; direct EDIT |
| `runtime/screens/PlanScreens.tsx` | SET MONEY ASIDE offers bill set-asides (shared sheet); plain assign sheet |
| `runtime/screens/IncomeScreens.tsx` | Add expected income with a date (from the next-income view) |
| `runtime/screens/PaydownScreens.tsx` | `THE DESCENT ·` prefix removed |

## Tests

| File | Change |
|---|---|
| `tests/helpers/jurnlFinancialWorld.ts` (new) | Synthetic world |
| `tests/jurnlFinancialStabilization.test.ts` (new) | 27 tests: T01–T28 plus legacy, committed-transfer, day-30, TODAY COMING and daily-earnings tests |
| `tests/jurnlF01Runtime.test.tsx`, `tests/jurnlMonetizationFoundation.test.tsx` | Resolve production config exactly as CI does (doc 10). Assertions unchanged. |
| `tests/jurnlF03F04Runtime.test.tsx` | TODAY header actions 4 → 5 (MORE is now a real action) |
| `tests/jurnlRootAuthorityReconstruction1.test.tsx` | Copy lists follow doc 09 |
| `e2e/jurnl/helpers/jurnl-page.ts` | `about:blank` guard; `safeToSpendCents`; `storedSnapshot` |
| `e2e/jurnl/helpers/jurnl-financial-world.ts` (new) | E2E synthetic world |
| `e2e/jurnl/jurnl-financial-os-stabilization.e2e.ts` (new) | 8 journeys plus screenshots |
| `e2e/jurnl/jurnl-core-mutations.e2e.ts`, `jurnl-paydown-sts.e2e.ts`, `jurnl-global-systems.e2e.ts`, `jurnl-product-utility-journeys.e2e.ts` | Root-cause repairs; assertions are stronger (exact deltas and stored values; doc 10) |
| `e2e/jurnl/jurnl-financial-os.e2e.ts` | Uses the shared E2E world |
| `playwright.config.ts` | `small` (360×780) project runs both financial specs |

## Generated

`docs/jurnl/structural-completion/*` (14 files) were regenerated with `npx tsx scripts/jurnl/structural-blueprint/build.ts` because the catalog questions changed. The blueprint test enforces this.

## Commits

- `addbf2db`: settlement states, card-cycle minimums, horizon core.
- `7203c27d`: UI, headlines, E2E repairs.
- The evidence commit follows; see the PR for the final SHA.
