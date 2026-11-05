# 27 — Source evidence index

Inspected tree: `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ `8ba653faf`
Worktree: `/tmp/site00-jurnl-integration-wt`
Default branch `main` @ `e413590e1` does not contain `src/projects/jurnl/data/ledger/accounting.ts`.
None of the financial-OS pull requests below are merged to `main`.
Tagline: PLAN TODAY. GROW FREELY.
Sprint: P0.JURNL.FINANCIAL-INTELLIGENCE.CONNECTED-TRANSACTION-UNDERSTANDING-AND-ADAPTIVE-LEARNING-FOUNDATION.AUDIT1
Application code: unchanged. Database: unchanged. Paid calls: none.


Evidence classes:

- VERIFIED_IN_REPOSITORY — read in the inspected tree.
- VERIFIED_IN_TESTS — covered by a named test in that tree.
- VERIFIED_WITH_PROVIDER_DOCS — public page read on 4 Nov 2026 (America/Chicago). Not a live JURNL connection.
- DESIGN_REQUIREMENT — required by this sprint. Not implemented.
- PROPOSED_ARCHITECTURE — design for a later implementation sprint. Not implemented.
- UNKNOWN — not established by repository evidence or a cited source.
- BLOCKED — needs a founder or vendor decision before build.

All repository rows were read from `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ `8ba653faf` in `/tmp/site00-jurnl-integration-wt` unless noted.

| Claim | Class | Path | Symbol |
| --- | --- | --- | --- |
| No aggregator is integrated | VERIFIED_IN_REPOSITORY | `scripts/jurnl/structural-blueprint/model.ts` | F02.02 / B12 text |
| Bank feed not implemented | VERIFIED_IN_REPOSITORY | `JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1/JURNL_CURRENT_PRODUCT_UTILITY_BASELINE.md` | Bank/Plaid feed |
| Book = anchor + entries | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/ledger/accounting.ts` | module comment, `BalanceBasis` |
| BANK_CONFIRMED never produced | VERIFIED_IN_REPOSITORY | `accounting.ts` | `BalanceBasis` comment |
| Settlement states | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/ledger/transferSettlement.ts` | state machine |
| No bank confirmation of settlement | VERIFIED_IN_REPOSITORY | `transferSettlement.ts` | provider comment |
| Transfer duplicate warning | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/ledger/ledgerOps.ts` | `findDuplicateTransfer` |
| Ledger entry shape | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/home/moneyTypes.ts` | `LedgerEntry`, `EntryCorrection` |
| Txn classes and categories | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/foundation/categories.ts` | `TxnClass`, `JURNL_SPEND_CATEGORIES` |
| Pocket purposes | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/ledger/purposes.ts` | `MoneyPurpose` |
| Connected flag forced false | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/foundation/accountMutations.ts` | `is_connected: false` |
| Pocket-added copy | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/runtime/screens/f05/MoneyMotionParent.tsx` | toast body |
| Account detail copy | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/runtime/screens/f05/dot01/DetailPages.tsx` | NO BANK CONNECTION |
| Consent flags including AI | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/repository/consentSync.ts` | `patchConsent` |
| Snapshot sync is not a bank | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/repository/serverSnapshotSync.ts` | `pullServerSnapshot` |
| RLS on JURNL tables | VERIFIED_IN_REPOSITORY | `supabase/migrations/20261006103000_jurnl_production_persistence.sql` | policies |
| Security claims withheld | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/f01/copy.ts` | C01–C04 |
| Purchase duplicate heuristic | VERIFIED_IN_REPOSITORY | `src/projects/jurnl/data/f05/dot01/receipt.ts` | `findDuplicatePurchase` |
| No model client in JURNL src | VERIFIED_IN_REPOSITORY | `src/projects/jurnl` search | no anthropic/openai/claude matches |
| Ledger absent on main | VERIFIED_IN_REPOSITORY | `origin/main` @ `e413590e1` | `git cat-file` failed for `accounting.ts` |
| Financial PRs unmerged | VERIFIED_IN_REPOSITORY | GitHub PRs #1705 #1706 #1713 #1714 | draft, open |
| Plaid pending versus posted | VERIFIED_WITH_PROVIDER_DOCS | https://plaid.com/docs/transactions/transactions-data/ | fetched 4 Nov 2026 |
| Plaid history window | VERIFIED_WITH_PROVIDER_DOCS | https://plaid.com/docs/transactions/troubleshooting/ | 90 default, extend only on first link |
| Plaid sync webhook | VERIFIED_WITH_PROVIDER_DOCS | https://plaid.com/docs/transactions/sync-migration/ | `SYNC_UPDATES_AVAILABLE` |
| Uber Pro Card coverage flag | VERIFIED_WITH_PROVIDER_DOCS | https://plaid.com/documents/us_institution_coverage.csv generated 2026-10-16 | `ins_133030` balance and transactions bits are 1 |
| Uber's Plaid instructions | VERIFIED_WITH_PROVIDER_DOCS | Uber help article 7819985296411, updated 1 Dec 2025 | not a JURNL test |
| Lyft Direct issuer | VERIFIED_WITH_PROVIDER_DOCS | Lyft Help 360022461073 | Payfare. Plaid compatibility UNKNOWN |
| Rule schema, splits, review queue, ingestion | DESIGN_REQUIREMENT | this folder | not in the database |
| Forty tests | DESIGN_REQUIREMENT | `22_40_SCENARIO_TEST_CONTRACT.md` | not automated |

Provider docs were read to bound the design. They are not evidence that JURNL has a Plaid account or that a production item would succeed.
