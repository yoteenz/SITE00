# Refund and dispute policy — FD-R06

## Before commission paid (unpaid / approved-not-paid)

- **Full refund** of qualifying base-package payment → **REVERSED** (or equivalent) on associated unpaid commission  
- **Dispute / chargeback opened** → **DISPUTED** until verified outcome  

## After commission paid

- Do **not** delete or rewrite the original **PAID** commission row  
- Create an **ADJUSTED** (or linked adjustment) record with audit trail  
- Flag for **founder review**  
- Recovery/offset against future commissions only where partner agreement and law permit  
- **No automated clawback** from external bank accounts  

## Partial refunds and ambiguous evidence

→ **Founder review**; do not auto-calculate pro-rata unless a future FD-R06 amendment explicitly adopts a formula.

## Implementation note

Refund/dispute identifiers must link to payment evidence (see `PAYMENT_EVIDENCE_GAP_REGISTER.md`) before automated state transitions are trusted.
