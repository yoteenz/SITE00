# 05 · SANDBOX AND TEST RESULTS

Branch `claude/jurnl-connected-banking-activation-um0u93`. Source is the OPUS5 head `b6b2f2693`. All values are synthetic.

| Check | Result |
|---|---|
| Typecheck (`tsc --noEmit`, src + shared) | **clean** |
| Typecheck, new API code (temporary config including `api/_lib/jurnlBanking`, `api/jurnl/bank*`, `repository`, `server/vercelAdapter`) | **clean** apart from 2 pre-existing errors in untouched files (`internalGrantStore.ts`, `vercelAdapter.ts:9`) |
| Production build (`npm run build`) | **pass**: `verify-production-dist: OK (472 JS assets checked)` |
| Unit, JURNL scope (`vitest run tests/jurnl tests/jurnl*`) | __UNIT__ |
| — of which connected banking (`tests/jurnl/banking/*`, 7 files) | **121 / 121** |
| Plaid **sandbox** (live): `scripts/jurnl/banking/plaid-sandbox-validation.ts` | **BLOCKED**: `PLAID_CLIENT_ID` is not available (`sandbox/plaid-sandbox-report.json`) |
| Browser E2E, connected banking (`jurnl-connected-banking.e2e.ts`) | **9 / 9** (mobile, tablet and desktop × 3) |
| Browser E2E regression (mobile) | __E2E__ |

## Connected-banking suites

| File | Tests | What it proves |
|---|---|---|
| `migrationRls.test.ts` | 17 | Migrations apply in order; RLS on every table; cross-user isolation; secrets and webhooks unreadable; browser cannot write; snapshot compare-and-swap (stale revision JR409, mode mismatch JR422, no bypass, audit); atomic apply (replay refused, failed batch leaves cursor and rows unchanged, removals kept); disconnect keeps history; cascade delete; webhook dedupe |
| `bankingService.test.ts` | 21 | Connect (one Item, encrypted token, all pages, cursor); multiple accounts; failed connection stores nothing; same Item twice is not duplicated; duplicate institution login removed at the provider; link tokens (new and update, ownership); modify, remove and pending → posted in place; mutation-during-pagination restart; rate limit (retry, then SYNC_ERROR, cursor kept); outage; not ready; concurrent sync SUPERSEDED; reauth → reconnect keeps the Item and history; disconnect partial failure removes nothing, success revokes first; deletion; unverified webhook refused; duplicate ignored; out-of-order safe; ITEM events; token never leaks; vault tamper, AAD and rotation; catalog listing ≠ connectivity |
| `plaidAdapter.test.ts` | 17 | Real ES256 webhook signatures: valid, missing, altered body, stale, wrong key, wrong algorithm, whitespace; Plaid error → health mapping (12 codes); field mapping; Transactions-only default products |
| `bankApiHttp.test.ts` | 5 | `config` gives names only; 401 / 503 / 403 (no founder grant); HTTP founder flow; no access token or cursor in any response |
| `ledgerInvariants.test.ts` | 22 | Requirements **A–L**, plus cash withdrawal, balance anchoring and purity |
| `founderAcceptance.test.ts` | 33 | The 33-step founder scenario (`20_FOUNDER_E2E_33_STEPS.md`) |
| `dataModes.test.ts` | 6 groups | Mode mapping; preview unchanged; a real account starts empty (no sample cash or bills); a real bill never takes a sample amount; hydrate decisions (server wins, CAS upload, conflict copy, preview and other-user copies ignored, offline) |

## Defects the tests found (all fixed)

1. Snapshot audit rows were blocked by RLS. The write became a scoped SECURITY DEFINER, and direct table writes were revoked.
2. "AUTOPAY" in a utility payee was read as a credit-card payment.
3. A re-linked institution created a second account instead of reusing its history.
4. A daily-earnings leg recorded after the bank balance was double-counted on top of a balance that already contained the matched payout.
5. The real app had no menu: the corner chrome assumed the path `/runtime/` (found by the browser E2E).
6. MONEY said "PREVIEW LINK" and "NO BANK CONNECTED" for connected accounts (found by the browser E2E).
7. A host route imported the runtime directly, breaking the host / project firewall (existing test).

## Not run, and why

- **Plaid sandbox:** no client id (B-1).
- **Real Supabase Auth and email:** no approved project (B-2).
- **iOS Safari:** there is no iOS device or simulator in this environment.
- **Lint:** `package.json` has no lint script. The strict TypeScript settings (`noUnusedLocals`, `noUnusedParameters`, `strict`) act as the static check.
