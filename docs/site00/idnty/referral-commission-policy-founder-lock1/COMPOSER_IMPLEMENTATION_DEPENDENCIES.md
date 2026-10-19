# Composer implementation dependencies

Policy lock **does not** authorize implementation. Opus3 handoff phases apply with these **hard prerequisites**:

## P0 — Before live commission accrual

1. **Payment evidence recovery** (`PAYMENT_EVIDENCE_GAP_REGISTER.md`) including amount, ids, refunds, disputes, idempotency  
2. **Attribution enforcement** — 90-day window, durable artifact attach, collision exceptions (FD-R07–R08)  
3. **Terms versioning** — partner fee in minor units, cap enforcement ≤ 5000  
4. **Founder approval + 14-day hold** job or scheduler (FD-R04)  
5. **No SEND PAYMENT** — record-only payout entities (FD-R16)  

## Phase mapping (Opus3 doc 32)

| Phase | Blocker lifted by |
| --- | --- |
| P4 Attribution | FD-R07–R09 decided; needs durable store + resolver |
| P6 Commission engine | FD-R01–R04 decided; needs payment evidence + cap validation |
| P8 Payout workspace | FD-R05–R06, R16 decided; needs payout tables + record UI |
| P3 Partner activation | FD-R17 decided; fix AIO fixture (G-RF-22) before ACTIVE |
| P11 Print | FD-R13–R14 partial + FD-R17; QR durability (doc 21) |

## Explicit non-starters

- Live Stripe webhook changes without separate approval (handoff global rule)  
- Production Supabase migrations without approved migration sprint  
- Automatic payouts or commission approval  

## Suggested next implementation sprint (after evidence)

1. Payment evidence persistence + tests  
2. Commission state machine (doc 16 + this lock’s transitions)  
3. Founder workspace read models with empty states  
4. AIO planned partner UI + fixture fix (no activation)  
