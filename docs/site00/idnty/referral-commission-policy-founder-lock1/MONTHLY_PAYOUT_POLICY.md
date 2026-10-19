# Monthly payout policy — FD-R05 / FD-R16

## Cadence

- **Frequency:** Monthly  
- **Target payout date:** **15th** of each month  
- **Minimum threshold:** **None**

## Inclusion rules

A commission enters a payout batch only if it:

1. Passed the **14-day holding period** (FD-R04)  
2. Has **verified payment evidence** for the qualifying base package  
3. Meets **attribution** requirements (FD-R07–R09)  
4. Has **no unresolved** refund/fraud dispute  
5. Received **founder approval**  
6. Partner has required **payee documentation** (when FD-R10 finalized)  
7. Was **not previously paid**

Commissions becoming eligible after the monthly approval cutoff roll to the **next** cycle. **No backdating.**

## Execution

- **Automatic bank transfer:** **DISABLED**  
- **Automatic commission approval:** **DISABLED**  
- **Founder workspace:** **Record-only** external payments  

## Recorded payout payload (minimum)

Partner id · commission id(s) · amount paid · payment date · external payment method · external reference · recording actor · recording timestamp · optional evidence · audit event.

**RECORD PAYMENT** and **SEND PAYMENT** remain distinct; SEND is not authorized.
