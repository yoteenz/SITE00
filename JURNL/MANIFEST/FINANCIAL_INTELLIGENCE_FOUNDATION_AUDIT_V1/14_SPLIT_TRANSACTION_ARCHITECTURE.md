# 14 — Split transaction architecture

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

PROPOSED_ARCHITECTURE. `LedgerEntry` has no split lines. Receipt OCR can read item lines into `EntryReceipt.extracted.items`. Those items are a scan, not a posted split. The image stays on the device.

## Rules

- The parent canonical amount remains the provider or manual amount. Example: bank charge $60.00 stays $60.00.
- Lines are allocations. Business fuel $45.00 and personal purchase $15.00.
- Lines must sum to the parent in minor units.
- Currency is the parent currency. No line converts currency.
- Rounding: compute in minor units. The last line absorbs the remainder only when the user entered percents. The user sees that remainder before save. A remainder the user did not accept stays UNALLOCATED and blocks a "fully classified" state. It does not get a silent category.
- Partial allocation is allowed. The residual is explicit.
- A correction versions the lines and keeps the parent amount (scenario 24).
- Splits do not create extra bank legs and do not change a verified balance.
- A receipt link is evidence. It does not by itself set the split.
- Reporting sums lines. Account totals sum parents. A test must fail if both are added into the same expense total.

## Ownership

Parent amount: ledger gate. Lines: user classification, revisable. Sum check: deterministic, before save.
