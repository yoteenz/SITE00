# 15 — Rideshare and business context

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

The engine serves users who are not drivers. Rideshare is a context, not the taxonomy.

## Bank-visible facts the ledger can represent today

VERIFIED_IN_REPOSITORY. Accounts can be `DEBIT_CARD` or a payout-card location. `MoneyPurpose` includes `RIDESHARE_EARNINGS` and `CASH_TIPS` as pocket defaults. None of these connect to Uber or Lyft.

## Target, without invented numbers

| Event | Treatment when only the bank record exists |
| --- | --- |
| Uber or Lyft payout deposit | Income of the net amount. Gross, tips, bonuses, fees UNKNOWN. |
| Instant-payout fee | Expense only if a separate amount is present. |
| Uber Pro Card purchase | Card or debit expense on that account if the account is actually connected. Coverage is a Plaid CSV flag, not a JURNL connection. |
| Lyft Direct | UNKNOWN compatibility. Do not show it as supported. |
| Fuel, charging, tolls, parking, maintenance, washes, supplies | Ordinary expenses. Purpose and activity only after evidence. |
| Platform adjustment, refund, reimbursement | Documents 08 and scenario 08. |

## Gross versus net

Do not reconstruct gross from a net deposit. A future platform connector may attach a statement to the same canonical bank event. It adds components. It does not replace the bank amount. If components do not sum to the deposit, the difference stays UNRECONCILED. It is not forced.

## Personal book

Payroll, rent, mortgage, utilities, groceries, insurance, card purchases, card payments, subscriptions, healthcare, education, childcare, transfers, savings, debt, refunds, and shared expenses use the same type and purpose axes. Shared-expense household rules are BLOCKED until OD-02 chooses the workspace boundary. Until then, rules are single-owner.
