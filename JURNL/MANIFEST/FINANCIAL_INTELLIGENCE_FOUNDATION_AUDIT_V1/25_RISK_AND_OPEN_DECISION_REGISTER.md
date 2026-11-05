# 25 — Risk and open decision register

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

## Risks

| Id | Risk | Evidence | Mitigation |
| --- | --- | --- | --- |
| R1 | A later sprint treats F02 CONNECTED as a real bank. | B12 and the setup patch. | Status enum. Transactions enabled only after a transaction sync. |
| R2 | Merchant and amount dedupe drops a real second purchase. | `findDuplicatePurchase` is a warning heuristic for manual entry. | Provider id is the only automatic identity. |
| R3 | Card payment doubles spending. | Classes already separate the events, with no bank matcher. | Phase 2 tests 10–12. |
| R4 | Transfer inflates income. | State machine exists and is user-only. | Phase 2 forbids expense and income types on matched legs. |
| R5 | Learning crosses tenants. | Rules do not exist. Snapshot is per user, which is necessary and not sufficient once a service role reads all snapshots. | Owner filter and scenario 28. |
| R6 | Model writes money. | No model client today. | Document 20 and a code boundary. |
| R7 | Tax copy overclaims. | F01 already withholds unverifiable claims. | Tax stays UNDETERMINED. |
| R8 | Provider coverage is assumed. | Uber Pro Card is a CSV flag. Lyft Direct was not in that snapshot. | Per-institution status PROVIDER_UNSUPPORTED. |
| R9 | Balance is "fixed" with a plug. | Current book always ties to the anchor. | Document 18. |
| R10 | This audit is mistaken for a merge of the financial PRs. | Those PRs are still draft. | Phase 0 is blocked on an explicit merge decision. |
| R11 | Opus UI is edited while artwork is in review. | PR #1714 is the active visual draft. | This branch is docs on `main` only. |

## Open decisions

| Id | Decision | State |
| --- | --- | --- |
| OD-01 | Aggregator vendor | BLOCKED. Plaid is a candidate, not approved. |
| OD-02 | Household and business workspace boundaries | BLOCKED. Default is one authenticated user. |
| OD-03 | Provider balance beside the anchor-plus-entries book | PROPOSED in document 18. Needs founder acceptance. |
| OD-04 | Multi-currency in the first release | BLOCKED. Scenario 32 quarantines non-USD. |
| OD-05 | Receipt images remain device-only after bank import | PROPOSED to keep the current `DEVICE` rule. |
| OD-06 | Who selects mileage versus actual expenses | BLOCKED. Not a classifier output. |
| OD-07 | Webhook host and secret store | BLOCKED. Railway is the API host today. No bank webhook exists. |
| OD-08 | Initial history window | BLOCKED. Plaid's documented default is 90 days and the first-link maximum cited is 730. |
| OD-09 | Purge sample accounts before first real link | BLOCKED. |
| OD-10 | Merge order of #1705, #1706, #1713, and #1714 | BLOCKED. This sprint does not merge them. |
