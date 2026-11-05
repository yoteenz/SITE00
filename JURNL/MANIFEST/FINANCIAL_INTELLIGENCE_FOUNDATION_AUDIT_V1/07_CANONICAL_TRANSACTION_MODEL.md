# 07 — Canonical transaction model

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

## Existing shape

VERIFIED_IN_REPOSITORY. `LedgerEntry` in `moneyTypes.ts` already has id, merchant, amount, direction (`INCOME | EXPENSE`), when, account, category, clearance (`PENDING | CLEARED`), recurring boolean, memo, source (`MOCK | ADDED`), obligation link, `account_id`, `txn_class`, `occurred_on`, `recorded_at`, confirmation, origin family, transfer link, settlement, `correction_history`, device receipt, and `source_values`.

`TxnClass` is `INCOME | EXPENSE | TRANSFER | CREDIT_PURCHASE | CREDIT_PAYMENT | DEBT_PAYMENT | REFUND | ADJUSTMENT`.

`SourceType` already names `IMPORT` and `CONNECTED` and is unused by a pipeline.

## Compatibility

Do not replace `LedgerEntry` with a second ledger. PROPOSED_ARCHITECTURE: keep it as the user-facing book and add the missing dimensions beside it.

Required additions, none of which are in the database today:

| Dimension | Today | Addition |
| --- | --- | --- |
| Owner / tenant | Snapshot is per auth user. | Explicit `owner_id` on every new financial table. |
| Connected account | `account_id` is internal. | `provider_account_id` on the account, not on every display string. |
| Source provider and source record id | Absent. | Required for imported rows. Manual rows leave them null. |
| Raw description | `merchant` is already uppercased for display. `source_values.merchant` keeps typed text. | Raw provider description is a third field. Never overwrite it. |
| Normalized merchant | Absent. | Separate from raw description. |
| Currency | Implicit. | ISO code. Minor units. |
| Authorized date and posted date | `occurred_on` is one date. | Both, plus source status. |
| Financial purpose, activity, business context | Absent on the entry. `MoneyPurpose` is a pocket preference. | Entry-level fields. |
| Recurring relationship | Boolean. | Series id plus CONFIRMED, LIKELY, ONE_TIME, UNKNOWN. |
| Transfer, refund, obligation | Partial via `link` and `obligation_id`. | Keep them. Add refund link. |
| Classification source, confidence class, learned rule id, user confirmation | `confirmation` is four values and is not a learning record. | New classification record. |
| Reconciliation status | Leg settlement exists for transfers. | Account-level coverage status in addition. |
| Tax context | Absent. | Enum that defaults to UNDETERMINED. |
| Provenance | `source` is MOCK or ADDED. | PROVIDER, MANUAL, CORRECTION, with raw id. |

`direction` stays a sign helper. It must not be the only type. A card payment can be an outflow and still be `CREDIT_PAYMENT`.

## Ownership

The canonical amount, currency, source id, and account effect are owned by the ledger gate. Classification columns are owned by the rule engine and are revisable. Raw payload is owned by ingestion and is immutable.
