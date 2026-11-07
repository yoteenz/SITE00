# CONNECTED BANKING AND MONEY END TO END · OPUS1

SPRINT: P0.JURNL.FOUNDER-ACTIVATION.CONNECTED-BANKING-AND-MONEY-END-TO-END.PRODUCTION-READINESS.OPUS1
STATUS: **PARTIAL / READY FOR FOUNDER-CONTROLLED VALIDATION**
DRAFT · DO NOT MERGE · DO NOT DEPLOY · NO DATABASE MUTATIONS · NO PAID PROVIDER ACTIVATION

## What is real in this branch

The code paths are real:
- Supabase Auth flows;
- revision-based server persistence;
- the Plaid adapter, built on the official SDK;
- the encrypted token vault;
- Transactions Sync, with the cursor advanced in the same transaction as its rows;
- verified webhooks;
- reconnect and disconnect;
- the ledger import, classification and reconciliation;
- Safe to Spend;
- the Connected Accounts UI.

They are tested against:
- a disposable Postgres with every JURNL migration (PGlite, the real Postgres engine);
- a scripted provider with **synthetic** data;
- a browser run of the real app against a **stubbed** network.

## What is NOT proven yet (external blockers)

- **The Plaid sandbox has not run.** `PLAID_CLIENT_ID` was not available to this session. The script is ready: `scripts/jurnl/banking/plaid-sandbox-validation.ts`. Its report is in `sandbox/`.
- **No real Supabase Auth server and no real email delivery were exercised.** There is no approved JURNL Supabase project, so registering a user would be a production auth mutation.
- **No real institution was connected.** This includes Uber Pro Card and Lyft Direct.
- **No migration was applied** to any hosted database.

## Index

| File | Deliverable |
|---|---|
| `01_FINAL_REPORT.md` | 30 · the final report, in the contract format |
| `02_FEATURE_STATUS_MATRIX.md` | the status of every feature |
| `03_AUTHENTICATION.md` | 03 · authentication |
| `04_PROVIDER_ADAPTER_AND_SYNC.md` | 04, 06, 07, 08 · adapter, sync engine, webhooks, connection health |
| `05_SANDBOX_AND_TEST_RESULTS.md` | 05 · results of every suite |
| `09_SECURITY_TOKENS_RLS.md` | 09, 21 · token storage, security and RLS |
| `10_MIGRATION_AND_IMPACT.md` | 10 · migration, impact and rollback |
| `11_MONEY_MODEL_AND_RECONCILIATION.md` | 11–18 · accounts, classification, overrides, reconciliation, cash, bills, Safe to Spend |
| `19_FOUNDER_ENTITLEMENT.md` | 19 · founder entitlement |
| `20_FOUNDER_E2E_33_STEPS.md` | 20 · the 33-step acceptance scenario |
| `22_RUNTIME_EVIDENCE.md` | 22, 23 · screenshots and recordings (images in the ZIPs) |
| `24_PROVIDER_COST_ANALYSIS.md` | 24 · provider cost |
| `25_LIVE_INSTITUTION_VALIDATION_MATRIX.md` | 25 · live institution validation |
| `26_ENVIRONMENT_CONFIGURATION.md` | 26 · environment configuration |
| `27_EXTERNAL_BLOCKERS_AND_FOUNDER_ACTIONS.md` | 27 · external blockers, and the shortest founder action list |
| `sandbox/plaid-sandbox-report.json` | the output of the live sandbox script (BLOCKED in this session) |
