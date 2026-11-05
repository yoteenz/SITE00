# JURNL bills and obligations audit

## Canonical record

`JurnlObligation` (`src/projects/jurnl/data/foundation/obligations.ts`) — owner **F07**.

## Type distinction today

| Type | Representation |
| --- | --- |
| Bills | Obligation `kind: BILL` (default on create) |
| Subscriptions | Model only; UI defaults to BILL |
| Debt payments | F12 credit → **projected** into upcoming (`CREDIT_PAYMENT`) |
| Planned purchases | F10 purchase objects + reserve |
| Savings goals | F14 goals + set-aside |
| Transfers | Ledger entries (F04 / Quick Add) |

Users **can** add repeating bills via F07; they **cannot** mark paid, skip occurrence, or partial pay at obligation level.

## Status dimensions (conceptual vs implemented)

| Dimension | Implemented? |
| --- | --- |
| PLANNED / UPCOMING / DUE / OVERDUE | **Yes** via `projectUpcoming` + buckets |
| PARTIALLY_FUNDED / FUNDED | **No** per obligation |
| PAID | **No** obligation payment state |
| CANCELLED | Archive/delete only |

## Required functions gap analysis

| Function | Status |
| --- | --- |
| Add / edit bill | PARTIAL (amount edit; no due date edit in sheet) |
| Recurrence | PARTIAL (cadence only) |
| Mark paid | NOT_IMPLEMENTED |
| Partial payment | NOT_IMPLEMENTED |
| Skip / reschedule occurrence | NOT_IMPLEMENTED (`skipped_once` field unused in UI) |
| Payment history per bill | NOT_IMPLEMENTED |

## Unified upcoming view

F07 timeline **already unifies** income, obligations, credit payments — good foundation. Missing: **funding progress** and **subscription vs essential** filter.

**Classification:** EXISTING_BUT_UNCLEAR for pay lifecycle; EXISTING_BUT_FRAGMENTED for funding.
