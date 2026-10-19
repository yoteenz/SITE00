# 17 · Payout workspace specification

Boards: R21–R25, R44. Components RF-060…RF-064; overlays RO-14…RO-17.

## 1. Position
SITE 00 has **no payout provider** (`payout_live: false`; Stripe Connect blocked in platform economics). Payouts are paid **outside SITE 00**, for example by bank transfer from the business account, and are then **recorded** here with a reference. **RECORD PAYMENT ≠ SEND PAYMENT.** There is no SEND button anywhere. The disabled control reads *NO PAYOUT PROVIDER (FD-R16)*. A payout is **never** marked paid because it was approved.

## 2. Payout object

| Field | Notes |
| --- | --- |
| Payout ref | Display reference `PO-0005`; database id never shown |
| Partner | One partner per payout |
| Lines | APPROVED commission entries (and negative adjustments) included; each line moves to SCHEDULED |
| Total | Sum of lines (minor units); must be ≥ the FD-R05 minimum, if any |
| Planned date | ESTIMATED until recorded |
| Method | Type + last four only (BANK TRANSFER · ••7730). Full banking details are never stored in the workspace |
| Payee documentation | Status ON FILE / MISSING (FD-R10); documents kept outside the workspace UI |
| State | SCHEDULED · RECORDED (PAID) · FAILED (recorded as failed) · REVERSED |
| Payment record | Amount, paid-on date, method, reference, optional receipt, actor, time, idempotency key |

## 3. Pages
- **Ledger:** PAYOUT · PARTNER · AMOUNT · METHOD · STATE · DATE.
- **Signals:** APPROVED UNPAID · TOTAL PAID OUT · REVERSED / ADJUSTED · PENDING APPROVAL.
- **Policy banner** at the top, always.
- **Inspector:** lines, totals, payee status, checklist (APPROVED · PAID OUTSIDE SITE 00 · PAYMENT RECORDED WITH REFERENCE · RECONCILED TO STATEMENT), then RECORD PAYMENT · SEND (disabled).

## 4. Record payment flow (RO-15 → RO-16)
1. **RECORD PAYMENT:** amount paid*, paid on*, method*, reference*, receipt (optional).
   - Notice: *RECORDS A PAYMENT ALREADY MADE OUTSIDE SITE 00. IT DOES NOT SEND MONEY.*
   - Footnote: *IDEMPOTENCY KEY = PAYOUT ID + REFERENCE · A SECOND SUBMIT CANNOT CREATE A SECOND PAYMENT.*
2. **Validation (os=error):**
   - the amount must equal the payout total;
   - a different amount offers *RECORD AS PARTIAL → ADJUSTED PAYOUT*;
   - the reference is required;
   - the date cannot be in the future.
3. **CONFIRM PAYMENT:** summary, then *MARK PAID*.
   - Lines move SCHEDULED → PAID.
   - The payout moves to RECORDED.
   - Events are written.
4. **Errors:**
   - On a network failure, nothing changes and the form keeps its entries.
   - A retry with the same reference is a no-op.

## 5. Reversal (RO-17)
Founder-only. Used when a recorded payment bounced or was recorded in error.
- A reason and a reference are required.
- It creates negative entries; it never deletes rows.
- Lines return to APPROVED, or REVERSED if the commission is reversed too.

## 6. Controls (detail in doc 27)
- Payee documentation must be ON FILE before the first recording (FD-R10).
- No banking data in client-visible records, partner cards, notifications, search or logs.
- Separation of duties is planned via FD-R18: a recording actor and an approving actor.

## 7. Partner view
- The portal shows payout history with the method type only, plus the next planned payout tagged ESTIMATED.
- No other partner's data is visible.
