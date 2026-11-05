# 08 — Transaction type invariants

Inspected tree: `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ `8ba653faf`
Worktree: `/tmp/site00-jurnl-integration-wt`
Default branch `main` @ `e413590e1` does not contain `src/projects/jurnl/data/ledger/accounting.ts`.
None of the financial-OS pull requests below are merged to `main`.
Tagline: PLAN TODAY. GROW FREELY.
Sprint: P0.JURNL.FINANCIAL-INTELLIGENCE.CONNECTED-TRANSACTION-UNDERSTANDING-AND-ADAPTIVE-LEARNING-FOUNDATION.AUDIT1
Application code: unchanged. Database: unchanged. Paid calls: none.


Evidence classes:

- VERIFIED_IN_REPOSITORY — read in the inspected tree.
- VERIFIED_IN_TESTS — covered by a named test in that tree.
- VERIFIED_WITH_PROVIDER_DOCS — public page read on 4 Nov 2026 (America/Chicago). Not a live JURNL connection.
- DESIGN_REQUIREMENT — required by this sprint. Not implemented.
- PROPOSED_ARCHITECTURE — design for a later implementation sprint. Not implemented.
- UNKNOWN — not established by repository evidence or a cited source.
- BLOCKED — needs a founder or vendor decision before build.

DESIGN_REQUIREMENT. Map onto the existing `TxnClass` instead of inventing a parallel enum. Where the current enum has no value, the phase plan adds one. Do not overload `ADJUSTMENT` for all of the missing cases.

| Type | Accounting behavior | Existing hook |
| --- | --- | --- |
| INCOME | Increases an asset. Counts as income. A net payout is income of the net amount only. | `INCOME` |
| EXPENSE | Decreases an asset, or increases a card liability (`CREDIT_PURCHASE`). Counts as spending once. | `EXPENSE`, `CREDIT_PURCHASE` |
| INTERNAL TRANSFER | Moves value between two owned accounts. Not income. Not expense. | `TRANSFER` and the settlement machine |
| CREDIT CARD PAYMENT | Decreases the funding asset and decreases the card liability. Not a second expense. | `CREDIT_PAYMENT` |
| LOAN PAYMENT | Decreases the funding asset. Splits principal (liability down) and interest (expense) when both are known. If the split is unknown, the whole payment is a debt payment and interest is UNDETERMINED, not guessed. | `DEBT_PAYMENT` |
| REFUND | Reverses a prior expense, including a card purchase. Not income. | `REFUND` |
| REIMBURSEMENT | Offsets a named expense or is unapplied cash until the user links it. Not wages unless the user says so. | New. Do not use `INCOME` by default. |
| FEE | Expense. A payout fee is an expense only when the fee is actually present as its own amount. Do not invent it by subtracting a guessed gross. | New, or `EXPENSE` with category FEE until the enum exists. |
| INTEREST | Expense when charged. Income when earned. Never a transfer. | New. |
| REVERSAL | Undoes a named prior event. A reversed card payment increases amount owed. | Settlement `REVERSED` |
| ADJUSTMENT | A user-confirmed correction to the book, with a reason. Not a silent plug for a balance gap. | `ADJUSTMENT` |
| CASH WITHDRAWAL | Asset down. Cash pocket up if the user tracks cash. Not an expense until the cash is spent. | `TRANSFER` to cash, or a new cash type |
| CASH DEPOSIT | The reverse. | Same |
| PENDING AUTHORIZATION | Not a final posted charge. Excluded from posted spending. Removed if the provider removes it and no successor arrives. | `Clearance.PENDING` is only a user flag today |
| OTHER / UNKNOWN | Posted amount still counts in the account. It does not count in a purpose total. | `OTHER` category |

## Invariants

- A rideshare payout is not gross revenue.
- An internal transfer is not income.
- A card payment is not a second expense.
- A refund is not earned income.
- A loan payment is not entirely interest and not entirely principal unless that component is known.
- A pending authorization is not a posted charge.
- Two equal merchant charges on one day are two events when their source ids differ.
