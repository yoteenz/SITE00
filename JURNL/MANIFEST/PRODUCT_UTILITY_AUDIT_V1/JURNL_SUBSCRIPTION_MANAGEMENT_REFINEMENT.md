# JURNL subscription management refinement

## Current state

| Question | Answer |
| --- | --- |
| First-class subscription records? | **Model yes** (`ObligationKind SUBSCRIPTION`); **UI treats all adds as BILL** |
| Owner family | **F07 UPCOMING** (canonical `JurnlObligation`) |
| Dedicated subscriptions view? | **No** |
| Auto-detection from bank? | **No** (no provider integration) |

## Supported today (F07)

- Name, amount (USD), cadence **WEEKLY \| MONTHLY** only in add sheet
- `next_due_date` defaults to today on create (not user-picked in add form)
- Edit: amount only; END deletes obligation
- Status: ACTIVE / PAUSED / ARCHIVED in model — **limited UI** for pause/archive

## Unsupported / partial

- Quarterly / annual cadence in add UI (model `RecurrenceType` may allow more — not exposed)
- Payment account, category, trial, promo price, price-change history
- Cancellation vs archive copy (“END” does not explain merchant cancel)
- Monthly equivalent / annual totals
- Filter ACTIVE / PAUSED / CANCELLED subscriptions
- Subscription-specific sort (next renewal)

## Recommended placement (no F17)

**Primary home:** F07 UPCOMING — add panel **“SUBSCRIPTIONS”** filtering `kind === 'SUBSCRIPTION'`.

**Secondary surfaces:**

- F03 TODAY — next renewal line (FACT: next due from projection)
- F09 WHY — include subscription subtotal in upcoming breakdown (already in sum)

## Entry form priority (founder)

1. Name  
2. Price  
3. Frequency (weekly/monthly/quarterly/annual)  
4. Next renewal date  
5. Optional: payment account, category  

## Normalization rules (blueprint)

- Weekly → monthly equivalent: `amount * 52 / 12`
- Annual → monthly: `amount / 12`
- Display totals as **estimated** when cadence mixed

## Classification

**EXISTING_BUT_FRAGMENTED** — reuse obligations; refine UI and `kind` selection; add subscriptions panel.
