# Commission state transitions

Reconciles founder lock **FD-R04–R06** with Opus3 commission vocabulary (`founder-workspace-referrals-authority-opus3/07_REFERRALS_STATE_MATRIX.md`, doc 16).

## Canonical functional states

| State | Meaning |
| --- | --- |
| TRACKED | Attribution or pre-payment observation |
| NOT YET ELIGIBLE | Paid conversion recorded but hold/refund/dispute gates open |
| ELIGIBLE | Hold satisfied; awaiting founder approval |
| PENDING APPROVAL | In founder approval queue (may alias ELIGIBLE in UI) |
| APPROVED | Approved for a payout cycle |
| PAID | External payment recorded with audit record |
| DISPUTED | Refund, chargeback, or evidence conflict |
| ADJUSTED | Post-paid correction (new row; original preserved) |
| REVERSED | Unpaid commission cancelled (e.g. pre-payout full refund) |

## Forbidden shortcuts

- No **TRACKED → PAID**
- No **PAID** without external payment record + audit
- No double commission from webhook retries (idempotency required)
- No second commission for same qualifying base purchase

## Transition audit (required fields)

Every financial state change records: previous state, new state, triggering event, verified evidence reference, timestamp, acting user/service, reason, terms/policy version.

## Mapping to payout workspace

Opus3 **RECORD PAYMENT** moves **APPROVED → PAID** only after founder records external payment details. **SEND PAYMENT** remains disabled (FD-R16).
