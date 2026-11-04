# 08 — Legacy transfer compatibility report

## Problem

Before this sprint a transfer recorded as `STILL ON ITS WAY` was stored as two legs with `status: 'PENDING'` and no settlement. Both legs counted immediately, so the destination appeared to hold money that had not arrived. Those records already exist on devices.

## Rule (read-time normalization, no data rewrite)

`legSettlement(entry, today)` in `data/ledger/accounting.ts`:

| Stored record | Read as |
|---|---|
| Has an explicit `settlement` (new records) | that settlement |
| Dated after today | SCHEDULED |
| Two-leg (TRANSFER / CARD_PAYMENT) with `status: 'PENDING'` and no settlement | **NEEDS_RECONCILIATION**: neither leg changes a balance |
| Anything else (cleared transfers, expenses, income, daily earnings) | SETTLED, exactly as before |

- **Nothing is invented.** A legacy pending transfer is not assumed to have arrived, left, or failed.
- **The person is asked.** TODAY shows `N TRANSFERS TO CONFIRM`, and the transfer opens with LEFT / ARRIVED / CANCEL / FAILED.
- **Effect on stored data:** none. The repository schema stays at v5 and is additive (`settlement?`, `settlement_history?` are optional). No migration runs and no stored balance is modified. A confirmation writes a new settlement on the two legs through the normal atomic commit.
- **Visible effect on balances:** a device that had a legacy pending transfer will see the destination balance drop by that amount until the person confirms the transfer arrived. This is the intended correction: the earlier number counted money that had not arrived.

## Other legacy records

| Record kind | Change |
|---|---|
| Cleared transfers and card payments | none (SETTLED) |
| Single-leg pending expenses or income | none (single-leg PENDING keeps its earlier meaning) |
| Daily earnings | none (I10) |
| Server repository (`SERVER_SYNC`) | Same read-time rule. No API or schema change; nothing deployed. |

## Proof

- Unit T12: a legacy pending pair changes nothing, shows as NEEDS CONFIRMATION, can be confirmed, and confirming twice credits once.
- Sprint-1 suites that read legacy records (`jurnlFinancialInvariants`, `jurnlWave*`, `jurnlF03F04Runtime`) all pass.
