# 01 — Executive product correction

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

## Correction

JURNL is a connected, intelligent financial workspace. Supported accounts should synchronize. The user should not have to type every deposit, card purchase, bill payment, transfer, refund, or routine transaction.

Manual entry, reconciliation, and correction stay available. They are not the default recordkeeping path.

This correction supersedes the manual-first assumption that the current build implements.

## What the build does today

VERIFIED_IN_REPOSITORY. The inspected tree records money the user enters. `accounting.ts` states that every balance is an entered anchor plus the effect of recorded entries, and that `BANK_CONFIRMED` is never produced because no provider exists. `HoldingClass` says an external account's balance is entered by the user and that no bank feed exists in this build. New accounts are created with `is_connected: false`. The MONEY parent toast after adding a pocket says the balance is what the user entered and that no bank is connected.

## What must become true

DESIGN_REQUIREMENT. Provider sync supplies source facts. Deterministic accounting accepts those facts. Classification, purpose, learning, and insights sit on top and cannot rewrite amounts, identities, or balances.

## Gap in one page

| Concern | Today | Target |
| --- | --- | --- |
| Account connection | Simulated. F02 can mark a draft CONNECTED. Blocker B12. | Real consent, token, account selection, health. |
| Transactions | User-recorded `LedgerEntry`. | Imported canonical events plus manual and corrections. |
| Types | `TxnClass` has eight values. | The sprint type list, mapped onto those classes without collapsing purpose into them. |
| Purpose | Account-purpose defaults (`MoneyPurpose`) choose a pocket. They do not describe a purchase. | A purpose dimension on the event. |
| Learning | Absent. | User-owned rules, explicit approval, corrections. |
| Tax | Domain id exists. No determination engine. | Context only. Never an automatic deduction. |
| AI | Consent flags only. No JURNL model client in `src/projects/jurnl`. | Suggestions with a hard boundary. Optional. |

## Not in this sprint

No schema migration, no provider account, no UI change, no merge.
