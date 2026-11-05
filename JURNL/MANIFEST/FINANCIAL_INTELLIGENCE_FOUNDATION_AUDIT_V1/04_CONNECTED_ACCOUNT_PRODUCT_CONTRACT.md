# 04 — Connected account product contract

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

DESIGN_REQUIREMENT and PROPOSED_ARCHITECTURE. No screen in the Opus MONEY work is changed by this document.

## Actions

The user can connect an institution, select which discovered accounts to include, see status, see the last successful sync, see balance data only when the provider supplied it, see transactions only when transaction access succeeded, review imported activity, see the provider error, reconnect, disconnect, hide an account without deleting history, add a manual-only pocket, and correct a classification or a manual note without editing the raw provider amount.

## Status values

| Status | Meaning |
| --- | --- |
| CONNECTED_AND_SYNCING | Item is healthy and the last sync completed inside the provider's normal lag. |
| CONNECTED_BUT_DELAYED | Item is healthy and data is older than the stated lag. Do not call it real-time. |
| REAUTHORIZATION_REQUIRED | The provider needs the user to authenticate again. |
| TRANSACTIONS_UNAVAILABLE | Balances may exist. Transaction product is off, unsupported, or not ready. Do not show an empty ledger as "no spending". |
| BALANCES_UNAVAILABLE | Transactions may exist. Balance product failed or is unsupported. |
| SYNC_FAILED | The last attempt errored. Prior verified data stays visible with its as-of time. |
| DISCONNECTED | User or system revoked the item. |
| MANUAL_ONLY | The pocket has no provider account. |
| PROVIDER_UNSUPPORTED | The institution or the product is outside the contracted coverage. |

An account is transaction-enabled only after a successful transaction sync for that provider account id. A successful link session is not enough.

## Copy rules

Delayed data is labeled with the as-of timestamp. Sample and manual balances stay on `BalanceBasis` and never use `BANK_CONFIRMED`. Hidden accounts stay in storage and drop out of default totals. A correction never overwrites `raw amount`.

## Manual pocket

`createManualAccount` remains the path for cash and for any account the user will not connect. Its status is MANUAL_ONLY. Its balance basis stays ENTERED_BY_YOU.

## Relationship to current UI

F05 MONEY, DOT 01, and DOT 02 already show pockets, transfers, and "no bank connected". A later implementation binds these statuses to that UI. This sprint does not move type, layout, or artwork.
