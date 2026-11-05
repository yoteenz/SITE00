# 13 — User correction and rule versioning

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

VERIFIED_IN_REPOSITORY. `EntryCorrection` already stores time, reason, and the prior amount, merchant, category, account, date, and memo. The comment on `LedgerEntry.correction_history` says the values before each change are kept and never rewritten. That pattern is the one to extend. It does not yet store purpose, allocation, rule id, or a classification source.

DESIGN_REQUIREMENT. A correction records the prior classification, the new classification, the user, the time, and the rule version that had applied, if any. The raw provider amount stays. One correction of a Shell purchase from business fuel to personal convenience removes that row from the business rule's support and opens a rule review. It does not reclassify other Shell rows.

Historical bulk change:

1. List the affected events.
2. Explain the change in plain language.
3. Require confirmation.
4. Append history on each row.
5. Version or disable the rule so the future does not undo the correction.

Disable sets `automation_enabled` false and `disabled_at`. The version remains readable so past rows can still explain themselves. Export and deletion are per owner (document 19).

A rule explanation is the scope plus the confirmation count plus the version. It is not a probability.
