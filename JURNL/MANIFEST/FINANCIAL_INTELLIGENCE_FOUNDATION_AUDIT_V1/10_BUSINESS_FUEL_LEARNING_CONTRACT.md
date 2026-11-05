# 10 — Business fuel learning contract

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

Reference case. Not the product limit.

## Example

| Field | Value |
| --- | --- |
| Merchant | SHELL |
| Amount | $42.80 |
| Account | Connected checking |
| Initial type | EXPENSE |
| Initial category | TRANSPORT, subcategory FUEL only if the user or a receipt says fuel. The merchant name alone does not establish fuel. |
| Suggested purpose | Rideshare operating expense, asked, not applied |
| Activity | Uber, Lyft, both, or unknown |
| Allocation | Unknown until evidence or confirmation |
| Tax | Not deductible automatically |

## Question

Ask whether this purchase was for business-related driving. Offer personal transportation, convenience or other, mixed, and not sure. Do not offer a deductible checkbox.

## After confirmation

Store the classification on that event. Preserve the provider amount and raw description. Record the user, the time, and the fields confirmed. Add one piece of evidence toward a candidate rule. Do not enable the rule.

## Candidate rule

A starting product policy, not a statistical result: three consistent confirmations of the same narrow scope may make a candidate eligible for the user to approve. Approval is a separate act. The rule is not enabled by the third confirmation.

The narrowest scope that the evidence supports wins. For this case the honest first scope is merchant plus account plus a confirmed fuel signal, not "SHELL" alone. Amount is not part of identity and is not required to match.

## Refusals

- Do not treat every future Shell purchase as fuel.
- Do not treat every fuel purchase as entirely business.
- Do not treat a confirmed business purchase as a tax deduction.
- Do not learn a split ratio from one mixed receipt.
- Do not let one user's Shell answers affect anyone else.
