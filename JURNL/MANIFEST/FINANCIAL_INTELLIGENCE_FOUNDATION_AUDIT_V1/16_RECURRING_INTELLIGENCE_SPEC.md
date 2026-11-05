# 16 — Recurring intelligence specification

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

VERIFIED_IN_REPOSITORY. Entries have `recurring: boolean` and obligations have their own schedule. `RecurrenceType` exists (`NONE` through `IRREGULAR`). Nothing infers a series from imported history, because nothing is imported.

DESIGN_REQUIREMENT.

Detection may propose LIKELY RECURRING from repeated posted events. It must not write CONFIRMED until the user confirms. ONE_TIME and UNKNOWN stay available. Variable amounts (utilities) can share a series without sharing an amount.

Uses:

- COMMITMENTS and upcoming payments read CONFIRMED series and user-entered obligations.
- OUTLOOK and Safe to Spend may show a forecast from a confirmed series.
- A LIKELY series is labeled as not yet confirmed and is not money already spent.
- A future occurrence is never a ledger expense.

The existing rule that entries dated after today do not change balances stays in force. A forecast is a read model.
