# 09 · Safe to Spend — accounting invariant

`computeSafeToSpend` (F09) is still the single formula owner. F03 and F04 read it; nothing recomputes it.

```
SAFE TO SPEND = CASH
              − BILLS DUE        Σ (amount − paid) for every ACTIVE bill / subscription occurrence due from today
                                 through today + 30 days (overdue included); each occurrence once
              − CARD PAYMENTS    Σ (minimum − paid since the statement) for each card due in the same window
              − HELD − SAFETY BUFFER − PLANS − GOALS − PURCHASES − TRIPS            (unchanged)

CASH = Σ money held in asset accounts marked "counts toward Safe to Spend" (+ unassigned recorded entries, flagged)
```

## Invariants (each has a test in `tests/jurnlFinancialInvariants.test.ts`)

| # | Rule | Test |
| --- | --- | --- |
| S1 | Money set aside for a bill is **part of** that bill's still-due amount, never an extra deduction. | N |
| S2 | Set-asides for one payment are capped at what is still due. | O, reassign |
| S3 | A credit purchase does not change CASH; the card owes more. | G |
| S4 | A paid occurrence leaves BILLS DUE (its payment already lowered CASH). Partial payments leave only the rest. | L, partial |
| S5 | A card minimum that is fully paid drops out of CARD PAYMENTS. | Q |
| S6 | Recurrence yields scheduled occurrences only: a weekly bill counts every occurrence in the window, a yearly bill 11 months away counts none. | K |
| S7 | A plan line linked to a tracked bill is not counted again under PLANS. | code (`linkedPlanAssigned`) |
| S8 | With real accounts and no bills entered, BILLS DUE is $0. Sample bills only accompany sample cash (no eligible account, or only the two seeded sample accounts, whose balances read SAMPLE BALANCE). | R6 fix, invariant V |
| S9 | Coverage is per account: if bills set to come from BANK exceed what BANK holds, the shortfall is reported even when the total is positive. Cash elsewhere is not assumed to pay a bank bill. | shortfall test |
| S10 | If spending later leaves an account holding less than is set aside in it, the over-commitment is reported. | O |

## The founder's example (test N)

| Line | Value |
| --- | --- |
| Bank (only account counting) | $500 |
| Car insurance due in 3 days | $140 |
| Set aside toward it | $95 |
| **Safe to Spend** | **$360** (not $265) |
| Funding line | $95 OF $140 SET ASIDE · $45 STILL NEEDED |
| `reservedForPayments` / `unfundedCommitments` | $95 / $45 |

## Reported separately (never folded into the number)

`totalAssets` (all asset accounts), `owedOnCards`, `reservedForPayments`, `unfundedCommitments`, `billLines[]`, `cardLines[]`, `accountShortfalls[]`, `overSetAside[]`, `unassignedEntries`.

## What changed from the pre-sprint formula

1. CASH comes from account positions; credit purchases no longer lower it (R1).
2. BILLS DUE uses occurrences in a documented 30-day window and the amount still due, instead of one full amount per bill regardless of date or payment.
3. Card minimums still due are included (R5).
4. No sample bills against real balances (R6).
5. Completeness codes are shown in words (`COMPLETENESS_LABEL`); `SOURCE_LABEL` replaces raw source codes.
