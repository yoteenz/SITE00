# 11 — Adaptive rule engine specification

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

PROPOSED_ARCHITECTURE. No table is created in this sprint.

## Lifecycle

1. Observe a posted event.
2. Suggest from the narrowest enabled rule. If none, suggest nothing or a clearly labeled AI suggestion.
3. User confirms or corrects.
4. Accumulate evidence on a candidate. Evidence is the confirmation ids.
5. When policy is met, propose the rule. Three consistent confirmations is the default eligibility threshold and is not proof.
6. User approves, edits the scope, or dismisses.
7. Only an approved and enabled rule classifies later matches.
8. Exceptions and corrections create a review of that rule version.
9. Disable or version. Do not delete history.

## Scopes, narrowest first

1. Recurring payment series id.
2. Exact provider merchant id plus account plus a transaction signal (fuel MCC only if the provider actually sent it, or a user-confirmed subtype).
3. Merchant plus business activity.
4. Merchant plus account.
5. Exact normalized merchant, still user-approved, never automatic.
6. Custom rule the user wrote.

A broader rule does not override a narrower one. A disabled rule does not match.

## Candidate schema (not migrated)

`rule_id`, `tenant_id`, `owner_id`, `rule_type`, `match_scope`, `match_criteria`, `category`, `subcategory`, `purpose`, `business_context`, `activity_context`, `allocation_policy`, `evidence_references`, `confirmation_count`, `confidence_metadata` (classes only, no invented probability), `approval_status` (CANDIDATE, PROPOSED, APPROVED, REJECTED, DISABLED), `automation_enabled`, `version`, `created_at`, `updated_at`, `disabled_at`, `last_applied_at`, `correction_history`, `provenance`.

## Alignment

Store rules outside `LedgerEntry`. The entry keeps `learned_rule_id` and the version applied. Snapshots today are one JSON document per user (`jurnl_user_snapshots`). Phase 0 decides whether rules live in that snapshot or in relational tables. Cross-user queries are forbidden either way.

## Safeguards

Different categories can require a higher threshold later. Tax context cannot be the output of a merchant rule. A rule cannot set an amount. A rule cannot match across owners.
