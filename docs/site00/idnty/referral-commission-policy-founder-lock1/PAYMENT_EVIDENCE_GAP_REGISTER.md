# Payment evidence gap register

Source: Opus3 `26_API_AND_BACKEND_GAP_MATRIX.md` (G-RF-06, G-RF-08, G-RF-12) reconciled with FD-R04.

**Live commission accrual is blocked** until these are implemented under a separate approved implementation sprint (webhook changes require explicit approval per Opus3 handoff).

## Required persisted evidence

| Field / capability | Status (repository today) | Required for FD-R04 |
| --- | --- | --- |
| Payment intent id | Not reliably persisted | Yes |
| Checkout session id | Partial / inconsistent | Yes |
| Verified payment status | Webhook-dependent | Yes |
| Collected amount (minor units) | **Gap** — webhook does not persist amount | Yes |
| Currency | Partial | Yes |
| Eligible base-package amount (50000) | Must be derivable from line items | Yes |
| Payment timestamp | Partial | Yes — starts 14-day hold |
| Refund ids / refunded amount | Weak / broken matching | Yes — FD-R06 |
| Dispute / chargeback state | **Gap** | Yes |
| Webhook event ids | Partial | Yes — idempotency |
| Idempotency controls | Incomplete | Yes — no double commission |
| Artifact linkage | Partial | Yes |
| Partner attribution linkage | Partial — durable attach at create (FD-R07) | Yes |

## Prohibited shortcuts

- Do not mark commissions payable from frontend-only checkout success  
- Do not reconstruct unknown payments from UI state  
- Do not fabricate missing Stripe fields  

## `commissionStatusFromPaymentEvidence`

Exists but **unused** — wire only after evidence persistence is complete and tested.
