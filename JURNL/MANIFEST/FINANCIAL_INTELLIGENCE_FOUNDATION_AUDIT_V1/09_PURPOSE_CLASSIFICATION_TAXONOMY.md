# 09 — Purpose classification taxonomy

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

Merchant category is not purpose. The existing `JURNL_SPEND_CATEGORIES` list (housing, food, clothing, membership, income, transport, utilities, health, travel, debt payment, transfer, other) stays the category axis. It is not extended into a rideshare-only tree.

DESIGN_REQUIREMENT. These axes are independent:

1. Transaction type (document 08).
2. Merchant or payee, raw and normalized.
3. Category, from the existing spend list, plus a later subcategory that does not replace the category.
4. Purpose. Examples: household living, payroll, rideshare operations, personal transportation, savings, debt service. `MoneyPurpose` pocket defaults are not this axis. A later mapping may suggest a pocket. It must not overwrite purpose.
5. Activity. Examples: none, a named job, Uber, Lyft, both, unknown. Empty for users who are not working a gig.
6. Business or personal allocation, as a percent of the source amount.
7. Recurring status: CONFIRMED, LIKELY, ONE_TIME, UNKNOWN.
8. Obligation relationship, using the existing obligation id when a bill was paid.
9. Tax context: UNDETERMINED unless a future tax setting, year, method, and evidence say otherwise.
10. Confidence class (document 12).
11. Provenance: PROVIDER_FACT, DETERMINISTIC_RULE, USER_CONFIRMED, LEARNED_RULE, AI_SUGGESTION, UNVERIFIED.

## Inference limits

A gas-station merchant can be fuel, groceries, a car wash, or unknown. An online marketplace can be home supplies or business equipment. A software charge can be work or personal. None of these are known from the merchant category alone.

When the axes that affect reporting are unknown, the event still posts, and the unknown axes go to review. The engine must not invent line items.

## Universal versus rideshare

Rideshare purposes live in the activity and purpose vocabularies as optional values. They are not seeded as the default category for every user. A payroll household never sees a rideshare question unless an imported description or an existing rule makes it relevant.
