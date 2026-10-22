# 27 · Financial audit requirements

Applies to commissions (doc 16) and payouts (doc 17). Nothing here moves money; these are the controls a later implementation must satisfy before any production terms version is activated.

## 1. Ledger integrity
| # | Requirement |
| --- | --- |
| F-01 | All amounts are **integer minor units** with an ISO currency; formatting happens only at the UI edge. |
| F-02 | Commission, adjustment, payout and payment-record rows are **append-only**. Corrections are new signed rows; deletes are not allowed (RLS + no DELETE grants). |
| F-03 | Every row stores the **terms version** and **calculation snapshot** used. |
| F-04 | `SUM(commission entries + adjustments) per partner` reconciles to `owed + paid`. A nightly check writes a reconciliation event; differences raise a SYSTEM alert. |
| F-05 | Each payout total equals the sum of its lines. A recorded payment equals the payout total, or creates an ADJUSTED payout. |
| F-06 | State transitions are validated server-side against the state machine. Illegal transitions are rejected and logged. |
| F-07 | Idempotency keys on every write: engine transitions `(entry, event)`, payment record `(payout, reference)`, business events (`idempotency_key` unique — exists). |

## 2. Evidence
| # | Requirement |
| --- | --- |
| F-08 | Payment evidence stores processor ids (payment intent / charge), the amount captured and the currency. **Gap G-RF-08:** the webhook does not do this today. |
| F-09 | Refund evidence stores the refund id and amount (partial supported). **Gap G-RF-09:** `recordRefund` treats every refund as full. |
| F-10 | Dispute (chargeback) events are handled and linked. **Gap G-RF-10:** there is no dispute handling today. |
| F-11 | A manual attribution correction stores the reason, the evidence reference, the actor and the before/after values. |

## 3. Approval and separation of duties
| # | Requirement |
| --- | --- |
| F-12 | Only the founder role may approve, adjust, record or reverse (server-checked; no preview bypass — `TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW` must not apply to these endpoints). |
| F-13 | FD-R18 decides whether a second reviewer is required above a threshold, and whether recorder ≠ approver. |
| F-14 | No bulk approval until F-13 is decided. |
| F-15 | Approving is blocked when the payment is refunded or disputed, the partner is not ACTIVE at capture, or the terms version is missing. |

## 4. Payee and tax
| # | Requirement |
| --- | --- |
| F-16 | Payee documentation (FD-R10) is ON FILE before the first payment is recorded; stored encrypted, outside the workspace UI, with access logged. |
| F-17 | Year-end totals per payee are reportable (1099 readiness, if FD-R10 applies). |
| F-18 | Banking details are never stored in workspace tables; only method type and last four. |

## 5. Audit trail
| # | Requirement |
| --- | --- |
| F-19 | Every financial action emits a `referral_business_event` with actor, time, before/after, correlation id. |
| F-20 | Events are exportable (CSV) by period for the accountant; export itself is logged. |
| F-21 | Retention: financial events kept ≥ 7 years (confirm with the accountant); visit-level data shorter (doc 23). |

## 6. Monthly close (proposed procedure)
1. Freeze the period, with no new approvals dated in it.
2. Run reconciliation (F-04, F-05).
3. Compare recorded payments with the bank statement and mark them RECONCILED.
4. Export events and totals.
5. Founder signs off; a close event is written.
