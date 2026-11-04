# 07 — Pending transfer accounting invariants

Synthetic world (`tests/helpers/jurnlFinancialWorld.ts`, no real data): RIDE payout debit card $300 · BANK checking $100 · CASH $100 · VISA owes $400 of $2,000.

## The sprint's worked example: RIDE → BANK, $80

| Step | RIDE | BANK | In transit | RIDE + BANK | Available in all accounts (incl. CASH 100) | Total tracked assets | Unit test |
|---|---|---|---|---|---|---|---|
| Before | 300 | 100 | 0 | 400 | 500 | 500 | — |
| Scheduled | 300 | 100 | 0 | 400 | 500 | 500 | T01 |
| Started, not left | 300 | 100 | 0 | 400 | 500 | 500 | T02 |
| **Left RIDE, not arrived** | **220** | **100** | **80** | **320** | **420** | **500** | T03 / T04 |
| Arrived | 220 | 180 | 0 | 400 | 500 | 500 | T06 |
| Arrived confirmed again | 220 | 180 | 0 | 400 | 500 | 500 | T07 (idempotent) |
| Failed, money not back yet (RETURNING) | 220 | 100 | 80 | 320 | 420 | 500 | T08 |
| Failed, money returned | 300 | 100 | 0 | 400 | 500 | 500 | T08 |
| Cancelled before leaving | 300 | 100 | 0 | 400 | 500 | 500 | T09 |

Safe to Spend cash while the $80 is in transit: 420 (RIDE 220 + BANK 100 + CASH 100). The $80 is in neither account. A $150 BANK bill shows BANK short by $50, and setting aside $150 from BANK is refused (T05 / T25).

## Cash deposit ($60 CASH → BANK, in transit)

CASH 40 · BANK 100 · in transit 60 · total tracked 500 · Safe to Spend cash 440. After arrival: CASH 40 · BANK 160. The deposit is never recorded as income (T10).

## Invariants (all asserted in `tests/jurnlFinancialStabilization.test.ts`)

| # | Invariant |
|---|---|
| I1 | Only SETTLED legs change balances. |
| I2 | `total tracked assets = available in all asset accounts (cash included) + in transit`. It is unchanged by any transfer step until money actually leaves the tracked set (a card payment confirmed by the card). |
| I3 | Money in transit is in no account. It is not spendable, it cannot fund a bill in the destination account (T05 / T25), and it is not in Safe to Spend's cash. |
| I4 | Arrival credits the destination exactly once (T06 / T07). |
| I5 | A transfer whose money left cannot be cancelled or deleted (T09). |
| I6 | A not-yet-sent transfer from a Safe to Spend account to an account outside it is held back from Safe to Spend once, as `TRANSFERS NOT SENT YET` (committed-transfer test). |
| I7 | A transfer between two Safe to Spend accounts does not change Safe to Spend while scheduled or pending. Once it leaves, cash drops by the amount in transit until it arrives. |
| I8 | A card payment on its way does not lower the card balance or utilization (T11, T26). |
| I9 | Legacy two-leg records marked PENDING become NEEDS_RECONCILIATION and change nothing until confirmed (T12; doc 08). |
| I10 | Daily earnings are unaffected: digital and cash land once, at once, with no transfer or pending state (regression test). |
| I11 | Every Safe to Spend line traces to a canonical record: obligation id, card account id or transfer link id (T28). |
| I12 | Every manually recorded entry is labelled as recorded by the person, not confirmed by a bank (T27). |

## Proof

- **Unit:** 27/27 in `jurnlFinancialStabilization.test.ts` (T01–T28 plus legacy, committed-transfer, day-30, TODAY COMING and daily-earnings tests). The sprint-1 invariants (`jurnlFinancialInvariants.test.ts`) still pass 40/40.
- **E2E (×4 viewports):** `transfer in transit…`, `a started transfer that never left…`, `card payment on its way…`.
