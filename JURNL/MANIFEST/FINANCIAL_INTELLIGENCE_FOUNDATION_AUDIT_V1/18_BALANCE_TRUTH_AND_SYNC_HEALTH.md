# 18 — Balance truth and sync health

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

## Today

VERIFIED_IN_REPOSITORY. Book balance = entered anchor + effects of non-mock, non-future entries. `BalanceBasis` is ENTERED_BY_YOU, NOT_VERIFIED, SAMPLE, or BANK_CONFIRMED. The last is never set. Provider current, available, and limit fields do not exist.

## Target

For a connected account:

| Figure | Authority |
| --- | --- |
| Current or available balance | Provider, with the provider's own definition and as-of time. |
| Credit limit and amount owed | Provider when present. |
| Posted activity | Canonical events. |
| Pending | Provider pending rows, excluded from posted totals. |
| Manual pocket | The existing anchor plus recorded entries. |
| Unreconciled difference | Displayed. Never removed with a silent plug. |
| Missing window | The requested history versus what the provider returned. |

Do not recompute a provider balance by replaying imports on top of it. Do not invent transactions to explain a gap. Show last verified balance, last sync, pending, the difference, the missing window, and any manual adjustment the user actually confirmed.

Sync health uses the statuses in document 04. A delayed balance is not real-time. A balance-only account is not a transaction account.
