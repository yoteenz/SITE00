# 09 · Financial data ownership

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

DOT 01 reads and writes only through the canonical owners. Nothing is stored twice, and no figure is computed outside the ledger.

| Surface | Reads | Writes (through) |
|---|---|---|
| 01 parent / 06 directory | `computeMoneyPicture`, `computeLedgerPositions`; the first four places come from `orderAccounts` (`settings.accountOrder`) | — |
| 02–05 account pages | `accountView`: positions; `transferViews` (incoming, waiting to leave, in transit out); credit attributes (limit, available = limit − owed, minimum, due date); purposes | — |
| 07–10, 31 histories | `searchHistory`: ledger entries via `historyRow` (class, effect only when settled, settlement state); filters live in the URL | — |
| 11 transaction detail | the entry, its `correction_history`, and its receipt image from IndexedDB (this device) | — |
| 12 settings | account record, purposes, reconciliation mark | `renameAccount`, `setPurposeAccount`, `upsertAccount` (include in total) |
| 13 / 23 balance review | `reconciliationOf`: tracked position; the mark in `settings.accountReconciliation` | `adjustToActual` → `buildBalanceCorrection` → `applyOp` (one ADJUSTMENT entry with the reason); `markReconciled` (only with no difference) |
| 14 / 30 add account | — | `createManualAccount` (a card limit only if entered: `creditLimit` null otherwise), `masked_identifier` for the last 4, `setPurposeAccount` |
| 16 / 18 / 19 / 28 / 33 purchases | `previewPurchase` (`buildExpense` + positions with the entry) | `savePurchase` → `applyOp` (one entry; refused if the id exists or the place is not ACTIVE) |
| 17 add cash | `previewTransfer` | from an account: `recordTransfer` (COMPLETED, #1706 legs); counted cash: `correctAccountBalance` (ADJUSTMENT); earnings → F06 income |
| 20 card payment | `previewTransfer` (+ DOT 01 guards: never more than the card owes after open payments; cash never below 0; bank overdraft warned) | `recordTransfer` with ALREADY PAID (COMPLETED) / SUBMITTED (PENDING) / SCHEDULED; JURNL never sends money |
| 21 purposes | purposes | `setPurposeAccount` |
| 24 / 37 corrections | `correctionCheck` (only single EXPENSE / CREDIT_PURCHASE / REFUND entries; transfers, bills, income and balance corrections are refused with their owner's route); `previewCorrection` / `previewReversal` | correct: `buildExpense` rebuild, same id, the replaced values appended to `correction_history`; reverse / duplicate: `applyOp` remove + a full copy in `settings.ledgerAudit` (bounded 200) |
| 25 / 36 archive | `archiveBlockers`: open transfers, reserved funds, default purpose, recurring bills, expected income, a card that still owes | `archiveAccountSafely` → `archiveAccount` (re-checked at that moment); the place leaves `accountOrder`; history stays |
| 26–29, 34 receipts | `findDuplicatePurchase` (same image SHA-256; or same amount within a day at the same merchant / place) | the image → IndexedDB (`jurnl-receipts`, key `<user>::<receipt id>`); the read values → `entry.receipt` on the one saved entry |
| 32 reorder | active places | `setAccountOrder` (an exact permutation of the active places, or nothing) |
| 35 needs review | `reviewIssues`: a transfer never confirmed, no balance, a balance older than 30 days, reconciliation gone stale | `markIssueResolved` (never for an unconfirmed transfer: that is resolved by recording the step) |

## Settings added (all optional, device repository)

- `accountOrder`
- `accountReconciliation`
- `accountReviewResolved`
- `ledgerAudit`

## Entry fields added (optional)

- `correction_history`
- `receipt`
- `source_values`: what the user typed, kept as entered beside the canonical uppercase display form.

## Owners outside DOT 01

- Income: F06.
- Bills and subscriptions: F07.
- Transfer steps: the #1706 transfer engine, reached from the MONEY parent's TRANSFERS collection.
