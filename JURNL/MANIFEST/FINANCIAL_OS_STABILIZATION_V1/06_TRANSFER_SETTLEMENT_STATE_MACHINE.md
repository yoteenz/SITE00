# 06 — Transfer settlement state machine

A transfer or card payment is **two linked ledger legs**: OUT from the source and IN to the destination. They share one `link.id`.

- Each leg carries a `settlement`: `SCHEDULED`, `PENDING`, `SETTLED`, `CANCELLED`, `FAILED`, `REVERSED` or `NEEDS_RECONCILIATION`.
- Each leg carries an append-only `settlement_history` (`{ at, state, action }`).
- **Only a SETTLED leg changes a balance** (`legApplies` → `isEffective`, in `data/ledger/accounting.ts`).

The transfer's state is derived from the two legs (`deriveTransferState`, `data/ledger/transferSettlement.ts`). It is never stored separately, so it cannot drift from the legs.

## States

| Transfer state | OUT leg | IN leg | Source balance | Destination balance | In transit | User label (transfer) | User label (card payment) | Required state (sprint) |
|---|---|---|---|---|---|---|---|---|
| SCHEDULED | SCHEDULED | SCHEDULED | unchanged | unchanged | 0 | PLANNED | PAYMENT SCHEDULED | SCHEDULED / SCHEDULED |
| PENDING | PENDING | PENDING | unchanged | unchanged | 0 | STARTED · NOT LEFT YET | PAYMENT SUBMITTED | PENDING / SUBMITTED |
| IN_TRANSIT | SETTLED | PENDING | − amount | unchanged | + amount | IN TRANSIT | PAID FROM ACCOUNT · CARD NOT CONFIRMED | IN TRANSIT / SOURCE DEBIT CONFIRMED |
| COMPLETED | SETTLED | SETTLED | − amount | + amount (asset) / − owed (card) | 0 | ARRIVED | CARD CONFIRMED PAYMENT | COMPLETED / ISSUER CREDIT CONFIRMED |
| CANCELLED | CANCELLED | CANCELLED | unchanged | unchanged | 0 | CANCELLED | PAYMENT CANCELLED | CANCELLED |
| FAILED | FAILED or REVERSED | FAILED | unchanged (net) | unchanged | 0 | FAILED | PAYMENT FAILED | FAILED / FAILED |
| RETURNING | SETTLED | FAILED | − amount | unchanged | + amount | FAILED · MONEY COMING BACK | PAYMENT FAILED · MONEY COMING BACK | FAILED (money not back yet) |
| REVERSED | REVERSED | REVERSED | unchanged (net) | unchanged (net) | 0 | REVERSED | PAYMENT REVERSED | REVERSED / REVERSED |
| NEEDS_RECONCILIATION | NEEDS_RECONCILIATION (either leg) | — | unchanged | unchanged | 0 | NEEDS CONFIRMATION | NEEDS CONFIRMATION | legacy (doc 08) |

## Starting a transfer (`recordTransfer`, `TransferInput.start`)

| Chosen start (chip `transfer-status-*` / `card-pay-status-*`) | OUT | IN |
|---|---|---|
| COMPLETED: `IT ARRIVED` (default) | SETTLED | SETTLED |
| IN_TRANSIT: `LEFT · NOT ARRIVED` | SETTLED | PENDING |
| PENDING: `STARTED · NOT LEFT YET` | PENDING | PENDING |
| SCHEDULED: `PLANNED FOR LATER` (the only start allowed with a future date) | SCHEDULED | SCHEDULED |

The deprecated `pending: true` flag maps to PENDING. Before this sprint it applied both legs immediately; that was the defect.

## Steps (`recordTransferStep` → `buildTransferAction`), all idempotent

| From state | LEFT_SOURCE | RECEIVED | CANCEL | FAIL (not returned) | FAIL (returned) | MONEY_RETURNED | REVERSE |
|---|---|---|---|---|---|---|---|
| SCHEDULED / PENDING / NEEDS_RECONCILIATION | → IN_TRANSIT | → COMPLETED | → CANCELLED | → FAILED | → FAILED | refused | refused |
| IN_TRANSIT | no-op | → COMPLETED | **refused**: `THE MONEY ALREADY LEFT. MARK IT ARRIVED OR FAILED INSTEAD.` | → RETURNING | → FAILED (OUT REVERSED) | refused | refused |
| RETURNING | refused | refused | refused | no-op | no-op | → FAILED (OUT REVERSED) | refused |
| COMPLETED | no-op | **no-op** (cannot credit twice) | refused | refused | refused | refused | → REVERSED |
| CANCELLED / FAILED / REVERSED | — terminal; repeating the same step is a no-op, others are refused — |

The detail sheet (`TransferDetailSheet`, testid `transfer-detail-facts`, `data-state`) offers only `allowedActions(state)`.

## Removal

`canRemoveTransfer(state)` is false for IN_TRANSIT and RETURNING. While money is between accounts, deleting both legs would make it vanish or reappear. `buildRemoveLinkedEvent` refuses with the state named.

## Where it shows

- **PLACES (F05):** `places-summary` (AVAILABLE IN ACCOUNTS · CASH · IN TRANSIT · TOTAL TRACKED · OWED); per-account `MOVING` lines; `open-transfers` panel.
- **Card page (F12):** `open-transfers` for the card.
- **ACTIVITY (F04):** transfer detail with STATUS from the settlement; SOURCE `RECORDED BY YOU · NOT CONFIRMED BY A BANK`.
- **TODAY:** attention line `N TRANSFERS TO CONFIRM`; next step `CONFIRM WHAT HAPPENED TO A TRANSFER` / `MARK MONEY IN TRANSIT AS ARRIVED`; SEE WHY rows (IN TRANSIT, TRANSFERS NOT SENT YET, TRANSFERS TO CONFIRM).

No bank is contacted and no payment is initiated: every step is recorded by the person.
