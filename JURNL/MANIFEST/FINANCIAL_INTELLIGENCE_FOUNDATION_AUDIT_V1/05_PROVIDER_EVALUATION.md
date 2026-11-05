# 05 — Provider evaluation

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

Plaid is a candidate. It is not selected. No vendor account was created. No pricing was collected from a contract.

## Facts read from public pages on 4 Nov 2026

VERIFIED_WITH_PROVIDER_DOCS.

- Plaid transactions have pending and posted states. Posted is a new transaction. `pending_transaction_id` links it to the removed pending id. Name and amount can change. Some pending holds never post. Source: https://plaid.com/docs/transactions/transactions-data/ (page fetched 4 Nov 2026).
- Default history request is 90 days. `transactions.days_requested` can ask for more on first initialization, up to 730 days. It cannot be extended later without deleting the item. Capital One is documented as 90 days and no pending. Source: https://plaid.com/docs/transactions/troubleshooting/.
- Current sync path is `/transactions/sync` plus `SYNC_UPDATES_AVAILABLE`. The first call must happen before that webhook fires. Source: https://plaid.com/docs/transactions/sync-migration/.
- Coverage explorer says support is per institution and per product, and the table is not real-time. Source: https://plaid.com/docs/institutions/.
- Plaid US coverage CSV generated `2026-10-16T03:26:16.866Z` includes `ins_133030,Uber Pro Card` with `balance` 1 and `transactions` 1. That is a coverage flag in a snapshot, not a JURNL production test.
- Uber's help article, updated 1 Dec 2025, says the Uber Pro Card can be connected through Plaid with phone, SMS PIN, and wallet passcode: https://uber-branchapp.zendesk.com/hc/en-us/articles/7819985296411-Can-I-connect-my-Uber-Pro-Card-account-to-other-apps. This is Uber's statement about Plaid, not a statement that JURNL is eligible.
- Lyft Direct is described by Lyft as a Payfare business debit account: https://help.lyft.com/hc/en-us/all/articles/360022461073-Lyft-Direct. The same coverage CSV snapshot had no row named Lyft Direct or Payfare in a name search. Compatibility is UNKNOWN. Do not promise it.

## UNKNOWN, and must stay unknown until a vendor review

Exact current Plaid price. MX, Teller, and Finicity price and coverage. Production eligibility of this SITE 00 entity. Sandbox credentials. Webhook retry guarantees beyond the public sync guide. Whether Uber Pro Card pending transactions and payout descriptors are useful for gross-versus-net. Data portability terms in a signed contract.

## Architecture requirement

PROPOSED_ARCHITECTURE. The ingestion port is provider-neutral:

- `provider_id`
- `provider_item_id`
- `provider_account_id`
- `provider_transaction_id`
- `pending_provider_transaction_id`
- raw payload
- cursor

Plaid's sync cursor and `pending_transaction_id` fit this port. Another aggregator's ids must be storable without a schema rewrite. JURNL ledger ids are never the provider ids.

## Alternatives

MX, Teller, and Finicity are named only because the structural blueprint already lists them as unused. No public evaluation of their Uber or Lyft coverage was completed in this sprint. Choosing among them is BLOCKED on founder vendor selection (decision OD-01).
