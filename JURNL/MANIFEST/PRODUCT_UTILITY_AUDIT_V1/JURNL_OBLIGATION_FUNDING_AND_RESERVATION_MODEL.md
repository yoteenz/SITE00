# JURNL obligation funding and reservation model

## Definitions (target semantics)

| Term | Meaning |
| --- | --- |
| Account balance | Sum of eligible account `available_balance` + manual ledger delta |
| Reserved | Earmarked for a purpose — **tracking only**, not a bank transfer |
| Available | Balance after commitments per STS formula |
| Paid | Recorded outflow linked to obligation (ledger) |

## Current implementation (`computeSafeToSpend`)

Deductions from cash:

`upcoming + protected + safetyBuffer + assigned + goalReserved + purchaseReserved + tripReserved`

- **`upcoming`:** sum of **full** obligation amounts (F07), not net of any per-bill reserve
- **`assigned`:** sum of F08 plan `assigned_amount` (global intentions)
- **`goalReserved`:** F14 set-aside totals
- **Trips / purchases:** entity-level `reserved_amount`

**Risk DEF-FIN-001:** If per-obligation funding is added as a **second** deduction without adjusting `upcoming`, Safe to Spend would **double-count**.

## Recommended mechanism (preserve architecture)

1. Add **`funded_amount`** (or use plan link) on obligation **or** require `linked_obligation_id` on plan intentions.
2. STS **`upcoming`** should use **`max(0, amount - funded_amount)`** per obligation (or move funded portion to `assigned` bucket with explicit link).
3. UI shows: **Due $140 · Set aside $95 · Still need $45** (FACT fields only).
4. On **mark paid**, create ledger OUTFLOW, reset/advance `next_due_date`, reduce funded_amount.

## Existing reuse

- F11 trip funding UI pattern (`reserved_amount / target_budget`) — **template for obligation funding drawer**
- F08 assign flow — wire to `linked_obligation_id` instead of orphan pool

## Reservation invariants (audit)

| # | Status |
| --- | --- |
| Reserve does not create money | PASS (amounts are numeric flags) |
| Same obligation double-deduct | **FAIL** if funding added naively |
| Reserve ≠ bank hold | PASS (no copy claims bank hold) |

**Classification:** EXISTING capability in trips/goals/plan; **MISSING** for bills/subscriptions.
