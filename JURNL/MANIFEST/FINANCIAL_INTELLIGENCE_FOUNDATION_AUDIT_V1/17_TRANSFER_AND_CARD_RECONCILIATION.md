# 17 — Transfer and card reconciliation

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

## What exists

VERIFIED_IN_REPOSITORY. `transferSettlement.ts` owns SCHEDULED, PENDING, IN_TRANSIT, COMPLETED, CANCELLED, FAILED, RETURNING, REVERSED, NEEDS_RECONCILIATION. IN_TRANSIT reduces the source and leaves the destination unchanged. The amount is in neither pocket as available. CANCELLED is only before the money leaves. REVERSED undoes both legs. A reversed card payment restores the liability. Labels used in the product: PENDING is "payment submitted", IN_TRANSIT is "paid from account, card not confirmed", REVERSED is "payment reversed". `ledgerOps.ts` sets leg settlement from those states. `findDuplicateTransfer` matches a repeated manual transfer by accounts, amount, and date. Every transition is user-recorded. The file says none of this is bank-confirmed.

Card purchases increase amount owed. Card payments are a different class. That separation is already the right invariant. It has no bank match.

## Target

PROPOSED_ARCHITECTURE. Provider rows reconcile onto this machine. They do not create a second machine.

- Two owned accounts, matching amount and currency, inside a stated window: propose a transfer relationship. State stays NEEDS_RECONCILIATION until both posted legs exist or the user confirms.
- One leg only: IN_TRANSIT or NEEDS_RECONCILIATION. Not an expense.
- A user-recorded transfer that later appears from the bank: link by confirmation (scenario 06). Do not post a second pair.
- Card payment: match the funding outflow to the card credit. Expense totals ignore the payment.
- Payment reversal: append REVERSED. Amount owed increases. Purchases stay.
- Refund on a card: `REFUND` reduces liability. Not income.

Window length and amount tolerance are UNKNOWN until OD decisions. Default proposal: exact minor-unit amount, same currency, 5 business days, and anything looser requires the user. This default is a proposal, not a tuned result.
