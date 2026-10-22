# 16 · Commission engine specification

Boards: R16–R20, R44. Components RF-050…RF-055; overlays RO-11, RO-12, RO-13.

**No rate, fee, basis, window or trigger is proposed.** Every input is a founder decision (FD-R01…FD-R06). Specimen amounts follow EXAMPLE TERMS E-1 / E-2, labelled *EXAMPLE · NOT A PROPOSED RATE*. They exist only to show layout and arithmetic.

## 1. Principle
**REFERRED ≠ CONVERTED ≠ ELIGIBLE ≠ APPROVED ≠ PAID.** Each step needs its own evidence. A commission never advances because the client asked, the partner asked, or time passed. It advances only on **server evidence** (payment webhook, refund evidence) or a **founder action with a reason**.

## 2. State machine

| State | Entered when | Leaves to | Evidence / actor |
| --- | --- | --- | --- |
| **TRACKED** | Attribution captured for a DF artifact | NOT YET ELIGIBLE · REVERSED | Attribution row |
| **NOT YET ELIGIBLE** | A payment is seen but the trigger (FD-R04) is not met (e.g. refund window open) | ELIGIBLE · REVERSED · ADJUSTED | Payment evidence |
| **ELIGIBLE** | Trigger met; **amount locked** from the terms version + basis | PENDING APPROVAL | Engine |
| **PENDING APPROVAL** | Submitted to the founder (automatic on eligibility) | APPROVED · ADJUSTED · REVERSED | Founder queue |
| **APPROVED** | Founder approves (RO-12); snapshot stored | SCHEDULED · ADJUSTED · REVERSED | Founder |
| **SCHEDULED** | Included in a payout (FD-R05) | PAID · ADJUSTED · REVERSED | Payout creation |
| **PAID** | The payout's payment is **recorded** (RO-15 → RO-16) | DISPUTED · ADJUSTED (clawback) | Founder record |
| **ADJUSTED** | Signed correction entry (partial refund, error) | PENDING APPROVAL (re-approve) | Founder (RO-13) or engine (refund) |
| **REVERSED** | Full refund, disqualification, or founder reversal | — (terminal) | Engine / founder |
| **DISPUTED** | Chargeback or contested attribution after PAID or APPROVED | ADJUSTED · REVERSED · back to prior | Processor dispute / founder |

**Mapping to the repository `CommissionEntryStatus`:**

| Sprint state | Repository status |
| --- | --- |
| TRACKED | CANDIDATE |
| NOT YET ELIGIBLE | PENDING |
| ELIGIBLE | QUALIFIED |
| PENDING APPROVAL | *new* |
| APPROVED | APPROVED |
| SCHEDULED | PAYABLE |
| PAID | PAID |
| ADJUSTED | *new* (adjustment rows) |
| REVERSED | REVERSED / DISQUALIFIED (with reason) |
| DISPUTED | *new* |

Board R19 shows this table.

## 3. Calculation (locked at eligibility)

```
collected payment (minor units, from processor evidence)
 − pass-through costs            (FD-R02: e.g. domain registration, third-party licences)
 − processor fees / taxes        (FD-R02)
 − refunds to date
 = BASIS
 × rate (basis points)  or  fixed amount per qualifying client         (FD-R01, FD-R03, terms version n)
 = COMMISSION   (integer minor units; rounding rule: half-up to the cent — FD-R02 to confirm)
 capped by FD-R10 cap if any
```

- **Integers only.** No floating point anywhere in the pipeline.
- The calculation snapshot is stored with: terms version, inputs, outputs, engine version, time.
- A later terms change never recalculates an ELIGIBLE or later entry. Corrections are explicit ADJUSTED entries.
- When an input is missing (no amount on the payment), the entry stays NOT YET ELIGIBLE with reason *PAYMENT AMOUNT NOT RECORDED*. This is gap G-RF-08: today the webhook does not persist the amount.

## 4. Ledger (UI)
- **Columns:** CLIENT (+ commission id) · PARTNER · TERMS (E-n EXAMPLE) · BASIS · AMOUNT · STATE · DATE.
- **Filters:** ALL · PENDING APPROVAL · APPROVED · SCHEDULED · PAID · ADJUSTED · REVERSED · DISPUTED, with counts.
- **Signals:** PENDING APPROVAL · APPROVED UNPAID · TOTAL PAID OUT · REVERSED / ADJUSTED. Definitions are in doc 07.
- **Negative rows** (reversals) are kept, shown with a minus sign, and never deleted.

## 5. Approval (RO-12) and adjustment (RO-13)
- **Approve:** shows partner, amount, basis note, terms version.
  - The copy *APPROVAL DOES NOT PAY. IT ADDS THE AMOUNT TO THE NEXT PAYOUT. PAYMENT IS RECORDED SEPARATELY.*
  - Buttons: CANCEL · APPROVE.
- **Adjust:** a signed amount and a mandatory reason, plus reference evidence. It creates an adjustment row; the original is kept and approval is required again.
- **Blocked:**
  - approving when the payment is refunded or disputed;
  - approving without an active terms version;
  - approving your own referral (FD-R18 separation, once a second actor exists).

## 6. Engine responsibilities (server, RF-055)
1. Subscribe to payment and refund evidence. Each transition is idempotent and keyed by `(commission_id, event_id)`.
2. Fix the existing **`commissionLedger.ts:45` bug**: `agreement_version` must be the partner's terms version, not the rules version.
3. Wire `eligibility.ts commissionStatusFromPaymentEvidence`, which exists but is unused, or replace it.
4. Emit business events for every transition (COMMISSION_CANDIDATE … COMMISSION_REVERSED + new APPROVED / ADJUSTED / DISPUTED).
5. Never move money. Never call a payout provider.

## 7. What can be built before policy approval
- State machine, ledger UI, approval UI, audit events, and calculation code with **no default terms**.
- Unit tests with fixture terms clearly marked TEST.

What needs approval first: any production terms version, any ELIGIBLE transition in production, and any display of amounts to partners.
