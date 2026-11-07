# 11 · Automatic transaction import: UX contract

Evidence class: DESIGN_REQUIREMENT. Nothing below exists today.
* Transactions are user-recorded `LedgerEntry` (FI audit 01).
* No backfill exists, and no pending ingestion.

Functional source: FI audit 06 (ingestion), 07 (canonical model), 08 (type invariants), 12 (confidence), 17 (transfers and cards),
18 (balance truth). This document defines only what the user sees.

## Freshness language (applies everywhere)

| Data condition | Shown as | Never |
|---|---|---|
| Last sync inside the provider's normal lag | `UPDATED 2:14 PM` | LIVE · REAL-TIME |
| Older than the lag | `DELAYED · LAST UPDATED YESTERDAY 6:02 PM` (amber chip) | silent |
| Sync failed | `COULDN'T UPDATE · SHOWING <date>` | an empty list |
| Pending | `PENDING` chip, excluded from posted totals | counted as spent twice |
| Manual pocket | `ENTERED BY YOU` | BANK |

## States

| # | State | Surface | What the user sees | Action |
|---|---|---|---|---|
| I-01 | Import starting | CX-05 | "GETTING YOUR ACTIVITY" + account list | continue in background |
| I-02 | Historical backfill | CX-05 | per-account progress (counts, date range reached) | — |
| I-03 | In progress (later syncs) | quiet chip on pocket / MONEY | `UPDATING…` then `UPDATED <time>` | — |
| I-04 | Completed | CX-09 entry card | "128 TRANSACTIONS FROM <bank> · 3 NEED YOU" | REVIEW |
| I-05 | Pending transactions | activity rows | PENDING chip; amount may change; may never post | — |
| I-06 | Pending → posted | activity row updates in place | no duplicate row; the "was pending" note is in its history | — |
| I-07 | Duplicate review | CX-09 queue | possible duplicate of an imported row (same provider id never happens; heuristic only) | KEEP BOTH / SAME TRANSACTION |
| I-08 | Possible manual-record match | CX-09 queue | "THIS MATCHES A PURCHASE YOU RECORDED" (receipt, date, amount) | MATCH / KEEP SEPARATE |
| I-09 | Classification processing | row sub-label | `ORGANIZING…` (never blocks the amount) | — |
| I-10 | Awaiting clarification | review queue (FI audit 12 LOW) | the question, not a guess | answer / skip |
| I-11 | Partial coverage | CS-13 / CS-29 | which accounts or dates are missing | RETRY |
| I-12 | Data delayed | chip | as-of time | REFRESH if supported |
| I-13 | Sync unavailable | CS-23 / CS-24 | product unavailable | manual entry |
| I-14 | Import error | CS-20 | plain cause | TRY AGAIN |
| I-15 | Retry | inline | progress | — |
| I-16 | User-confirmed correction | transaction detail | correction stored beside the provider amount; history shows both | UNDO |

## Invariants the UI must make visible (FI audit 08 / 17)

* **Internal transfers.** A transfer between the user's own pockets appears once as a MOVE, never as income plus spending.
  The existing MOVE MONEY copy states "NOT INCOME OR SPENDING".
* **Card payments.** Paying a credit card appears as a card payment, never as a second purchase. The existing
  `transfer-effect` note covers this for manual entry.
* **Ledger edits.** Imported rows carry an IMPORTED mark. They are never editable in amount. Classification and notes are editable.
