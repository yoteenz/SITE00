# 27 · EXTERNAL BLOCKERS AND THE SHORTEST FOUNDER ACTION LIST

## Exact external blockers

| # | Blocker | What it blocks | Evidence |
|---|---|---|---|
| B-1 | The founder supplied the client id in chat (used for the run only). Plaid rejects the sandbox secret injected by the proxy as malformed (`INVALID_FIELD: secret must be a properly formatted, non-empty string`), including after a re-save. | All live Plaid sandbox runs: Link, sync, webhooks, reset login, remove, catalog | `sandbox/plaid-sandbox-report.json` (status BLOCKED) |
| B-2 | There is no JURNL Supabase project approved for auth or migrations. Registering on the production project would be a production mutation, which is not authorized. | Real registration, email delivery, sign-in, reset, RLS on a hosted database, founder grant creation | read-only checks found no JURNL tables in any project |
| B-3 | plaid.com is outside this environment's allowed hosts (only sandbox.plaid.com and cdn.plaid.com are allowed). | Reading Plaid's pricing and docs pages directly. Pricing facts came from search results instead. | `24_PROVIDER_COST_ANALYSIS.md` |
| B-4 | Running downloaded GoTrue / PostgREST binaries was refused by this session's safety policy. | A full local Supabase stack. PGlite (the Postgres engine) was used for the database and RLS instead. | — |
| B-5 | No live institution testing has been approved and no Plaid Production access exists. | Gate H: checking, credit card, Uber Pro Card, Lyft Direct | `25_LIVE_INSTITUTION_VALIDATION_MATRIX.md` |
| B-6 | No deployment is authorized. | Gate I | sprint header |

## Founder actions, shortest path (in order)

1. **F-1 · Plaid sandbox.** Re-save the **Sandbox** secret for `sandbox.plaid.com` (Plaid Dashboard → Developers → Keys → Sandbox column: the 30-character secret, no prefix or spaces). Then run:
   `PLAID_CLIENT_ID=<sandbox client id> JURNL_PLAID_SECRET_VIA_PROXY=1 npx tsx scripts/jurnl/banking/plaid-sandbox-validation.ts`
2. **F-2 · Staging Supabase.** Approve a staging Supabase project for JURNL (separate from production). There:
   - apply the 3 JURNL migrations;
   - turn on email confirmation;
   - configure SMTP;
   - add the `/jurnl/app/**` redirect URL.
3. **F-3 · Founder grant.** Create your FOUNDER_FULL grant on staging (admin endpoint).
4. **F-4 · Plaid Production request.** Read the per-Item Transactions price shown on that page. Choose the Trial plan or Pay-as-you-go, and leave Auth off. Complete Plaid's security questionnaire.
5. **F-5 · Approve spend.** Approve (or decline) 3–4 Items × the Transactions monthly rate. Under the Trial plan this is $0 up to 10 Items until you upgrade.
6. **F-6 · Deploy to staging.** Authorize a staging deploy of the API (Railway) and SPA, with the env in `26_ENVIRONMENT_CONFIGURATION.md`, and set `JURNL_BANK_WEBHOOK_URL`.
7. **F-7 · Live validation.** Connect your checking account, payout card and credit card yourself through **CONNECT A BANK**, then fill in `25_LIVE_INSTITUTION_VALIDATION_MATRIX.md`. Never type a bank password anywhere but Plaid's Link window.

## Founder decisions recorded (not made by the agent)

- **D-1 · Who may connect banks.** The default is founder only (`JURNL_BANKING_ACCESS=FOUNDER_ONLY`). Opening it to all users needs a billing decision, because every Item costs money.
- **D-2 · Account deletion vs grant audit retention.** The grants migration keeps audit rows (FK RESTRICT), which blocks deleting the founder's auth user. Decide the retention policy.
- **D-3 · Entry points.** There is no new MONEY or ALL ACCOUNTS button: adding one is a new visual element, and that is not authorized. The connection is reached from the MONEY menu (CONNECTED ACCOUNTS & SYNC) and the account page. Approve a placement if you want one on MONEY itself.
- **D-4 · Long names on the MONEY drawers.** Long pocket names overlap the amount. This happens with long names typed by hand too, so it is a layout limit, not a banking change. It needs a design fix (clamp or truncation).
