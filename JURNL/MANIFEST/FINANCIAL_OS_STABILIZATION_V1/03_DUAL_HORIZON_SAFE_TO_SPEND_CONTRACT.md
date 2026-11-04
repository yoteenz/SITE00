# 03 — Dual-horizon Safe to Spend contract (D1)

## One formula, one owner

`computeSafeToSpendThrough(horizonEnd, horizon, draft, entries)` in `data/f09/safeToSpend.ts` is the only place Safe to Spend is computed. It runs over two periods:

| Reading | Function | Period | Where it shows |
|---|---|---|---|
| **SAFE TO SPEND** (canonical) | `computeSafeToSpend()` = `computeSafeToSpendThrough(today + 30, 'NEXT_30_DAYS')` | today through today + 30, **inclusive** | Every surface: F09 parent, TODAY, F10 purchase check, F11, F15, SEE WHY |
| **AVAILABLE BEFORE NEXT INCOME** | `computeNextIncomeView().view` | today through the next expected income date, inclusive | Only in the planning-period chips (SEE WHY on TODAY; `PLANNING PERIOD` sheet from the F09 period line) |

```
value = cash in Safe to Spend accounts
      − bills and subscriptions due in the period (what is still owed; set-asides are already inside this)
      − card minimums still due in the period (after confirmed payments this cycle and payments on their way)
      − transfers not yet sent, from Safe to Spend accounts to accounts outside it
      − protected money − safety buffer − plan assignments − goal, purchase and trip reserves
```

Cash never includes money in transit. Expected income is never added to cash in either period.

## Next income

`nextExpectedIncome(today)` reads F06 income sources with status `EXPECTED` or `LATE` and a next date on or after today, and picks the earliest.

- **Amount known:** shown as `{AMOUNT} EXPECTED, NOT RECEIVED`.
- **Amount unknown:** shown as `AMOUNT NOT KNOWN`.
- **No dated income:** the view says `NO NEXT INCOME DATE RECORDED.` and offers `ADD EXPECTED INCOME DATE` (F06 add sheet, with date, optional amount and cadence). Nothing is invented.
- **Daily earnings** (rideshare and similar) are records of the past and are never forecast into a next-income date.

## Reconciliation between the two periods

`computeNextIncomeView()` returns:

- `onlyIn30Days`: items inside the 30-day number that fall due after the next income (shown as `IN THE 30-DAY NUMBER, DUE AFTER YOUR NEXT INCOME`).
- `onlyBeforeIncome`: items due before the next income but after day 30, which happens when income is more than 30 days away.

Every line in either reading traces to an obligation id, a card account id or a transfer link id (unit T28).

## Day-30 boundary (documented behaviour)

The period is inclusive of day 30. Take a monthly bill due **today**: its next occurrence falls on today + 30 days in a 30-day month, inside the period. In that case the 30-day number deducts **two** occurrences of that bill. This is correct under the definition "everything due from today to {DATE}".

- Unit test `the 30-day period includes day 30…` covers it.
- The F09 line states the end date (`NEXT 30 DAYS · TO DEC 3`), so the period is visible.
- Journey B in the #1704 journeys spec set its bill due today and expected a single deduction. It now sets the due date to +3 days and asserts the exact single deduction of $140 (doc 10).

## What opening a period changes

Nothing. Choosing a period is a read. Unit T13 asserts that the stored snapshot and the 30-day value are identical before and after. E2E D1 asserts the 30-day value hook is unchanged after both chips are opened.

## Printed date removed

The F09 parent rendered a hardcoded `AVAILABLE THROUGH OCT 18` that came from the reference image. It was a false date on every day except one. It is now the live `horizonLine(windowEnd)`, rendered as a button (`safe-open-horizon`) inside the approved layout box. The art layer keeps `pointer-events: none`; only this line takes `pointer-events: auto`.
