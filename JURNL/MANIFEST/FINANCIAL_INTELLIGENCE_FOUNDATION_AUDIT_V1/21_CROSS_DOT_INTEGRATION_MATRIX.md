# 21 — Cross-dot integration matrix

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

Status words describe the inspected tree, not the artwork.

| Output | Status | Evidence | Target rule |
| --- | --- | --- | --- |
| F05 MONEY totals | PARTIALLY IMPLEMENTED | Derived from the manual ledger in `accounting.ts` and read by the MONEY parent. | Imported posted events flow through the same functions. Transfers and card payments stay out of income and out of a second expense. |
| DOT 01 accounts | PARTIALLY IMPLEMENTED | Manual pockets, `is_connected` false, balance basis, corrections, device receipts. | Connection status, as-of, and coverage. Artwork unchanged. |
| DOT 02 transfers | PARTIALLY IMPLEMENTED | Full user-recorded state machine. No bank match. | Provider legs attach to the same states. |
| DOT 03 commitments | PARTIALLY IMPLEMENTED | Obligations the user records. | Confirmed series can feed them. Likely series cannot post. |
| DOT 04 outlook | PARTIALLY IMPLEMENTED | Forecasts from the manual book. | Forecasts read confirmed recurrence and unverified items stay labeled. |
| Safe to Spend | PARTIALLY IMPLEMENTED | Stabilization work is in the inspected ancestry (PR #1706, not merged to `main`). Uses the ledger and obligations. | Unconfirmed and in-transit amounts follow the existing in-transit rule. |
| Credit | PARTIALLY IMPLEMENTED | Card liability math exists. | Provider limit and payment match. |
| Plan | UNSUPPORTED as a consumer of imported purpose. | No purpose axis. | Later. |
| Activity | UNSUPPORTED as a consumer of business-fuel classification. | No classification engine. | Later. Business fuel is one input, not the feed. |
| Notifications | UNSUPPORTED for sync health and review. | No bank sync. | Reconnect, discrepancy, and review. No "AI is certain" copy. |
| Review queue | PROPOSED | Absent. | Document 12. |

Double count is a test failure: a card purchase plus its payment, a transfer's two legs, a parent plus its splits, a pending plus its posted successor.
