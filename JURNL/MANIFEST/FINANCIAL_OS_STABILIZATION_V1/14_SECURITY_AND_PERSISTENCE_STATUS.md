# 14 — Security and persistence status

## Live production proof: PREREQUISITE_BLOCKED

`npx tsx scripts/jurnl/live-proof-prerequisite-precheck.ts`, run 2026-11-03 in this session:

```
gate_status: PREREQUISITE_BLOCKED
missing_secret_names: SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_ANON_KEY, VITE_SUPABASE_ANON_KEY,
                      SUPABASE_SERVICE_ROLE_KEY, JURNL_QA_USER_A_EMAIL, JURNL_QA_USER_A_PASSWORD,
                      JURNL_QA_USER_B_EMAIL, JURNL_QA_USER_B_PASSWORD
migration_local: true
migration_remote: UNKNOWN
user_a_ready: false
user_b_ready: false
```

- The cross-user RLS test **did not run**. It is reported as blocked, not failed.
- No credential was invented, requested in source, or written to a PR comment or ZIP. Only secret **names** appear above.
- RLS was not weakened and the live-proof workflow was not bypassed.
- Local unit and integration tests are not presented as live production proof.
- **To unblock (founder or admin):** add the nine secrets above to the repository's Actions secrets, with two distinct QA identities, then run the existing live-proof workflow. Nothing in this PR changes that workflow.

## What this PR changes in persistence

| Area | Change | Risk |
|---|---|---|
| Device repository (`localStorage jurnl.repository.v5.{userId}`) | Schema v5 is unchanged and additive. `LedgerEntry.settlement?` and `settlement_history?` are optional. `JurnlObligation.linked_card_account_id?` is optional. | Old snapshots load unchanged. Legacy pending transfers are re-read as NEEDS_RECONCILIATION at read time (doc 08); stored records are not rewritten. |
| Server repository (`/api/jurnl/repository`, `SERVER_SYNC`) | **No API change.** The server stores the snapshot as one JSON document, scoped to the user. The new optional fields travel inside it. | None. Nothing deployed. |
| Database | **No migration, no SQL, no production mutation.** | — |
| Storage keys | No new localStorage or sessionStorage keys. | — |
| Atomic writes | Every new mutation (transfer steps, card links, set-asides from Plan) goes through `JurnlRepository.commit` (one persist, one notification). | — |
| Stored balances | Never modified. Positions are always recomputed from entered balance + settled entries. | — |

## Boundaries kept

- **Auth.** Auth, the session and the production fail-closed rule are unchanged. The two F01 unit tests that failed locally were fixed by giving the test the configuration CI gives it (doc 10). The product's fail-closed behaviour was not changed or bypassed.
- **E2E fixtures.** Fixtures seed the E2E user's own device repository through `addInitScript`, as before. The `resetJurnlE2eSeedFlag` fix only skips a sessionStorage read on `about:blank`, where no app origin exists. It does not cross a storage boundary.
- **Banks and payments.** No bank integration, no payment initiation, no external network call added. Every settlement step is recorded by the person and labelled `RECORDED BY YOU · NOT CONFIRMED BY A BANK`.
- **Ask JURNL.** No live AI provider. The drawer opens with the honest fallback (`NO LIVE AI PROVIDER`), asserted in E2E.
- **Credit.** No credit-score prediction was added.
- **Test data.** All test data is synthetic (`@jurnl.test` users; RIDE, BANK, CASH, VISA). No founder banking data was used.

## Status lines

- PRODUCTION_SECURITY_PROOF: **PREREQUISITE_BLOCKED**
- PRODUCTION_DB_MUTATIONS: **NONE**
- PRODUCTION_DEPLOYMENT: **NONE**
- FINANCIAL_DATA_MIGRATION: **NONE REQUIRED.** Additive optional fields, plus read-time normalization of legacy pending transfers.
