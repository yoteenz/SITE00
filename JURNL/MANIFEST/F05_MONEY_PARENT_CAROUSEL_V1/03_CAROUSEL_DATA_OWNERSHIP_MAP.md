# 03 — Carousel data ownership map

Every value comes from `computeMoneyCarousel()` (`src/projects/jurnl/data/f05/moneyCarousel.ts`), which reads the canonical owners only. It writes nothing, and a test asserts that.

| Collection | Panel | Shows | Exact meaning | Owner (function) |
|---|---|---|---|---|
| 01 ACCOUNTS | each place | name, amount, OWED tag, transfer slip | money held (assets) or owed (cards, loans); settled legs only | F05 / #1706: `computeMoneyPicture` positions, `transferTotals` |
| 02 TRANSFERS | IN TRANSIT | Σ amount · "LEFT, NOT ARRIVED" / "n TRANSFERS · NOT ARRIVED" / "FAILED · COMING BACK" | transfers whose source leg is settled and destination is not (IN_TRANSIT, RETURNING). **Not in any account, not available.** | #1706 `transferViews` |
| | PENDING | Σ · "AWAITING CONFIRMATION" | started or submitted, source **not** debited (PENDING), plus legacy unconfirmed (NEEDS_RECONCILIATION) | #1706 |
| | SCHEDULED | Σ · relative date of the earliest | planned for a future date: **no money moved** | #1706 |
| | RECENT TRANSFERS | "VIEW HISTORY" | opens ACTIVITY, where every recorded transfer appears | F04 |
| 03 COMMITMENTS | BILLS + SUBSCRIPTIONS | Σ · "NEXT 30 DAYS" | what is still due on bills and subscriptions in Safe to Spend's 30-day period (set-asides included, not added again) | F09 `computeSafeToSpend().upcoming` (from F07 obligations) |
| | SAVINGS | Σ · "SET ASIDE FOR GOALS" (description adds "STILL IN YOUR ACCOUNTS, NOT MOVED") | money **earmarked** for F14 goals. It stays in its accounts and was **not moved**; it is not money held in savings accounts. | F14 `totalGoalSetAside()` = F09 `goalReserved` |
| | UPCOMING PAYMENTS | Σ · "NEXT 30 DAYS" (description names the card minimums and any unsent transfers) | card minimums still due in 30 days + transfers not sent yet from Safe to Spend accounts | F09 `cardPayments + committedTransfers` |
| | RESERVED | Σ · "TOTAL COMMITTED" | **exactly COMMITTED in the summary band**: bills + upcoming payments + money held back (protected, buffer, plans, goals, purchases, trips) | F09 (same as the band) |
| 04 OUTLOOK | SAFE TO SPEND | Σ · "NEXT 30 DAYS" | **exactly AVAILABLE in the band** | F09 `computeSafeToSpend().value` |
| | NEXT INCOME | amount · "IN n DAYS" (description: "EXPECTED, NOT RECEIVED"), or "NOT SET · ADD A DATE", or "NOT SET · IN n DAYS" when the amount is unknown | F06's earliest EXPECTED / LATE income on or after today; **never added to money held**; daily earnings are never forecast | F09 `nextExpectedIncome()` over F06 |
| | 30-DAY OUTLOOK | "VIEW FORECAST" | opens F15 AHEAD | F15 |
| | SPENDING INSIGHTS | Σ · "LAST 30 DAYS", or "NONE · NOTHING RECORDED" | recorded spending (EXPENSE + CREDIT_PURCHASE; transfers and card payments excluded), last 30 days | ledger `flowTotals()` |

## No double counting (unit-tested)

- BILLS + UPCOMING PAYMENTS + held back = RESERVED = COMMITTED, to the cent.
- SAVINGS is a part of held back, so it is shown but not added again.
- Set-asides for bills are already inside BILLS (#1706 reservation engine); there is no second engine.
- A card payment is never spending: its legs are TRANSFER / CREDIT_PAYMENT classes, and the pilot tests assert it.

## Differences from the reference artwork (founder to note)

| Reference | Pilot | Why |
|---|---|---|
| RESERVED $420 = BILLS $180 + UPCOMING $240 | RESERVED = COMMITTED, which **also includes money held back** (goals, plans, buffer) | one canonical COMMITTED; the summary band and RESERVED must agree |
| BILLS "THIS MONTH" | "NEXT 30 DAYS" | the number is the 30-day period, not the calendar month |
| IN TRANSIT "ARRIVING TODAY" | "LEFT, NOT ARRIVED" | JURNL records no arrival date; it does not guess one |
| SPENDING INSIGHTS "VIEW DETAILS" | the recorded 30-day spending, opening ACTIVITY | no insights surface exists yet (doc 06) |

## Captions are short; descriptions are complete

A caption sits in the paper's text column (left of its art) and wraps there, as the reference's captions do, so it is
kept to the reference's length. The full meaning (for example EXPECTED, NOT RECEIVED for next income, or NOT MOVED for
savings) is in each paper's accessible name, which is also what a screen reader announces. The E2E suite asserts both.
