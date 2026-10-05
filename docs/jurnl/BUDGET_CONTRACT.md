# FAMILY PRODUCTION BUDGET CONTRACT

Data contract only — **no billing dashboard** in this sprint.
Implementation: `shared/site00-product-families/productionBudget.ts` · JURNL baseline + F01 record:
`src/projects/jurnl/data/f01/contract.ts` · shown in DESIGN: `/production/jurnl/design?mode=compiler&inspect=budget`.

## Project baseline (`ProjectBudgetBaseline`) — JURNL

| Field | Value |
|-------|-------|
| Generation | GPT IMAGE 2.5 SUNBURST · 2K · 9:16 · AUTO-ENHANCE OFF |
| Credits / standard generation | 170 |
| Credit price | $0.003 (5,000 = $15) |
| Standard generation cost | ≈ $0.51 |
| Base estimate | 42,331 credits |
| Realistic range | 52,000 – 53,100 credits |
| Safe ceiling (full JURNL) | 60,000 credits ≈ $180 |

## Family record (`FamilyBudgetRecord`)

`familyId`, `tracking` (`TRACKED` | `LEGACY_PARTIAL`), `creditsBefore`, `creditsAfter`, `familyCredits`, `assetGenerations`,
`screenGenerations`, `interactionGenerations`, `recoveryGenerations`, `cumulativeCredits`, `safeCeilingRemaining`, `notes`.

- `buildFamilyBudgetRecord(baseline, priorRecords, input)` derives `familyCredits` from before/after, and `cumulativeCredits` +
  `safeCeilingRemaining` from the project's earlier records.
- A **`TRACKED` record without `creditsBefore` / `creditsAfter` throws** — from F02 forward both numbers must be captured at
  the start and end of the family's generation work.

## JURNL F01 (legacy)

| Field | Value |
|-------|-------|
| tracking | LEGACY_PARTIAL (before/after never captured) |
| familyCredits | 7,054 (reconstructed: ~3,484 family + 170 harvest parent + 1,700 interaction authorities + 1,700 uppercase regen) |
| screenGenerations / interactionGenerations | 15 / 21 |
| cumulativeCredits | 7,054 |
| safeCeilingRemaining | 52,946 |

## Storage

Records live with the family contract (`generationBudget` field) in the project's data module, so they are versioned with the
family and readable by the DESIGN inspector. When a server-side ledger exists, the same shape is the row schema.
