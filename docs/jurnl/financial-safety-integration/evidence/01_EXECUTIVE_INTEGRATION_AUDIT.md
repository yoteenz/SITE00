# Executive integration audit

**Sprint:** P0.JURNL.F05-MONEY.FINANCIAL-SAFETY-BRANCH-RECONCILIATION-AND-PREVIEW-ALIGNMENT.V1  
**Status:** FOUNDER_REVIEW (isolated candidate ready; no main merge)  
**Integration candidate branch:** `cursor/jurnl-financial-safety-integration-4e5a`  
**Candidate SHA:** `cbb75d80600cbdc07a01108fd2e0562d60c3131a`  
**Base (#1707 HEAD before safety work):** `eaf179bb73614cf8c4c11dd703eeb4ce99021007`

## Summary

- Verified open PR HEADs #1705–#1709 match sprint historical refs (unchanged at fetch time).
- Preserved #1705 → #1706 → #1707 chain; built candidate from #1707, not from `integration/jurnl-production-workspace` (that branch diverges and drops Opus DOT01 surfaces).
- **Card overpayment:** moved shared guard into `validateTransferFinancialLimits` + `buildTransfer` (authoritative); DOT 01 preview delegates to same module.
- **Cabinet archive bypass:** `MoneyScreens.tsx` F05 cabinet place detail now uses `archiveAccountSafely` / `archiveBlockers` (was raw `archiveAccount`).
- **PR #1709:** cherry-picked full-bleed commits onto candidate (width-first scale + root-authority viewport anchor); not redundant with #1707.
- **Preview:** live tunnel lineage file shows pinned SHA `ad7ac177` (PR #1709) — **not** aligned with this candidate; attestation via dev `data-site00-preview-build` + `X-Site00-Preview-Commit` header documented.
- **Tests:** JURNL unit 810/810 pass on candidate; targeted financial suites 160/160 pass; build PASS.
