# 01 · Repository and implementation reconciliation

**Sprint:** P0.JURNL.PERSONAL-FINANCIAL-OPERATING-SYSTEM.UNIFIED-ACCOUNTING-AND-UTILITY-CONVERGENCE1
**Main baseline:** `e413590e1318be18c41e59c598880322c1f10a5c` (merge of PR #1702)
**Branch:** `claude/jurnl-financial-os-unification-um0u93`
**PR #1704 (audit, draft, open):** head `4fbc463e`, base = same main SHA.

## PR #1704 reconciliation

| Item | Action |
| --- | --- |
| `JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1/*` (18 files) | Imported verbatim (identical additions merge cleanly whichever PR lands first) |
| `tests/jurnlProductUtilityAudit1.test.ts` | Imported verbatim (file-existence test) |
| `scripts/jurnl/product-utility-audit/*` | Imported verbatim (string extractor) |
| `e2e/jurnl/jurnl-product-utility-journeys.e2e.ts` | Imported verbatim; its triggers (`upcoming-add-name`, `-amount`, `-save`, `upcoming-edit-amount`, `-save`) are kept by the new F07 forms |
| `motherboard/MEMORY.md` change | **Not imported** (unrelated append, would conflict) |
| PR #1701 / #1703 (logo / identity) | Not touched |

Audit numbers checked against the files: the CSV has **245 rows**; `plain_language_extract_meta.json` says **22 flagged** (the #1704 PR body and this sprint brief say 38). Every CSV `recommended_text` field was empty. Doc 12 completes the matrix from the actual source.

## Findings before any change (verified in code)

| # | Finding | Evidence | Severity |
| --- | --- | --- | --- |
| R1 | Safe to Spend cash added **every** user-entered entry regardless of account. A credit-card purchase lowered cash. | `f09/safeToSpend.ts` `cashForSafeToSpend` summed all `ADDED` entries | P0 accounting |
| R2 | Ledger entries referenced accounts by **display name** only; no stable account id, no transaction class. | `home/moneyTypes.ts` `LedgerEntry.account: string` | P0 integrity |
| R3 | Transaction ids were `tx-add-${count+1}`: after a delete, the next id repeated an existing one. | `deviceRepository.appendTransaction` | P0 duplication |
| R4 | No per-bill funding, no mark-paid, no partial payment, no skip / reschedule, no payment history (as #1704 found). | `f07/obligationsStore.ts`, `UpcomingScreens.tsx` | P0 utility |
| R5 | Card minimums appeared in UPCOMING but were **not** in Safe to Spend. | `upcomingProjection.ts` vs `computeSafeToSpend` | P1 accounting |
| R6 | With real accounts and no bills, Safe to Spend still subtracted the preview's sample RENT + GROCERIES ($1,920) that the user never sees. | `computeSafeToSpend` MOCK fallback | P0 honesty |
| R7 | Credit add flow wrote invented terms (limit, minimum, due day). | `CreditScreens.tsx` add sheet | P0 honesty |
| R8 | Editing a balance overwrote the entered balance, so entries already recorded were counted again. | `MoneyScreens` `EditPlaceSheet`, `TermsSheet` | P0 accounting |
| R9 | TODAY attention slip was fixed text ("RENT IS CLOSE"); F09 WHY screen exposed raw codes (`NEEDS_SETUP`, `ACCOUNTS`, `SETUP`). | `HomeScreens.tsx`, `SafeToSpendScreens.tsx` | P1 language |
| R10 | `upcomingFor()` labelled every upcoming item `BILL`, including income. | `home/money.ts` | P2 |

## Persistence truth

- Financial records live in the **device repository** (`localStorage` key `jurnl.repository.v5.{userId}`), user-scoped.
- Optional server sync pushes the whole snapshot to `PUT /api/jurnl/repository` (user-scoped, RLS); the server validates only object shape and `userId`, so additive fields need **no migration**.
- No bank, card or payout provider exists (`JURNL_BANK_CONNECTION_PROVIDER = PROVIDER_UNAVAILABLE`). Nothing in this sprint is bank-confirmed.

## Baseline tests (before changes)

- `npx vitest run tests/jurnl*`: **636 / 638 pass**. The 2 failures are in F01 production-mode rendering (`jurnlF01Runtime` "no debug surface…", `jurnlMonetizationFoundation` "no F01 paywall regression"). They are unrelated to finance and still fail identically after this sprint.
