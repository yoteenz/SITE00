# 01 — Baseline reconciliation

Sprint: `P0.JURNL.FINANCIAL-OS.FOUNDER-DECISIONS-TRANSFER-SETTLEMENT-AND-E2E-STABILIZATION1`
Checked on 2026-11-03, before editing and again before delivery.

## Repository state

| Item | Value | Verified how |
|---|---|---|
| `main` | `e413590e1318be18c41e59c598880322c1f10a5c` | `git fetch origin main`; unchanged since PR #1705 was opened |
| PR #1705 (unified financial OS) | OPEN · DRAFT · head `c56691ecb8d087cd38190dd1b1fd55d45706e262` · base `main` | GitHub PR list |
| PR #1704 (product utility audit) | OPEN · DRAFT · head `4fbc463e403343154c516a1158d4ce3e1202d212` · base `main` | GitHub PR list |
| PR #1701 (logo recovery) | OPEN · DRAFT · not touched | GitHub PR list |
| PR #1703 (identity V2) | OPEN · DRAFT · not touched | GitHub PR list |
| Merged PRs relevant to JURNL since #1705 | none (#1702 merged before #1705 was cut, already in `main`) | GitHub PR list |

No PR is assumed to be merged. Nothing was merged, deployed or migrated.

## Integration method

- **Branch:** `claude/jurnl-financial-os-stabilization-um0u93`, created from PR #1705's head `c56691ec`.
- **Draft PR:** one, with base `claude/jurnl-financial-os-unification-um0u93` (stacked on #1705). Its diff is only this sprint's work.
- **If #1705 merges first:** retarget this PR to `main`. No rebase is needed because the history is linear on top of `c56691ec`.
- **If #1705 changes:** rebase this branch on its new head. The stabilization commits only touch JURNL files.
- **PR #1704:** its journeys spec (`e2e/jurnl/jurnl-product-utility-journeys.e2e.ts`) was already carried into #1705. This sprint repairs two of its journeys (B and H; see doc 10). #1704's audit documents are used as the copy source for doc 09 and are not modified.

## Prior evidence preserved

`JURNL/MANIFEST/FINANCIAL_OS_UNIFICATION_V1/` is unchanged. This sprint writes only to `JURNL/MANIFEST/FINANCIAL_OS_STABILIZATION_V1/`.

## Baseline facts this sprint started from (from #1705 evidence, re-verified)

| Fact | #1705 claim | Re-verified |
|---|---|---|
| Existing JURNL E2E | 160 pass · 21 failing instances · 7 distinct failures on main/mobile | Reproduced the 7 on `main` (mobile): see doc 10 |
| JURNL unit | 678/680 · 2 F01 production-mode failures | Reproduced both; root cause ENVIRONMENT_CONFIGURATION (doc 10) |
| Pending transfer defect | "STILL ON ITS WAY" applied both legs immediately | Confirmed in `isEffective` (only date-gated). Fixed (docs 06–08) |
| F09 printed date | — | Found: the parent showed a hardcoded `AVAILABLE THROUGH OCT 18`. Removed (doc 03) |
| Card minimum | — | Found: any payment, confirmed or not and in any cycle, reduced the minimum. Fixed (doc 04) |

## Financial modules inspected before changing formulas

- `data/ledger/accounting.ts` (positions, effects, effectiveness)
- `data/ledger/ledgerOps.ts` (transfers, card payments, removal)
- `data/f09/safeToSpend.ts` (the single Safe to Spend owner)
- `data/f12/creditGuidance.ts` and `creditStore.ts` (card facts, minimum projections)
- `data/foundation/upcomingProjection.ts`
- `data/f07/obligationLifecycle.ts` and `reservations.ts` (bills and set-asides)
- `data/f08` (plans)
- `data/f03/todayOperating.ts`

All their consumers were traced with grep before any change. Each formula change is listed in doc 16.
