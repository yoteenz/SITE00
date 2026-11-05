# 03 — Existing connectivity audit

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

## Provider integrations

VERIFIED_IN_REPOSITORY. No Plaid, MX, Teller, Finicity, or Yodlee client, secret, link flow, or webhook handler exists in the inspected application tree. Searches for those names hit the structural blueprint, which names them in order to say they are absent, and product-utility text that marks the feed not implemented.

## OAuth and tokens

No financial-institution OAuth. Supabase auth is the user session. `serverSnapshotSync.ts` sends that session bearer token to the SITE 00 API. That token is not a bank token.

## Institution coverage

UNKNOWN for production JURNL. Nothing is connected, so coverage is empty. Document 05 records public Plaid facts separately and does not treat them as JURNL support.

## Consent

`syncSetupConsentsToRepository` writes `LINKED_ACCOUNTS` from the setup draft. The draft can be patched to CONNECTED without a provider. DESIGN_REQUIREMENT: consent becomes real only when a provider item is created and the user selects accounts.

## Account discovery and balances

`JurnlAccountRecord.is_connected` exists and is set false in `accountSeed.ts` and `accountMutations.ts`. Balances are derived, not fetched. Pending bank transactions are not ingested. Historical backfill does not exist.

## Refresh, webhooks, errors, reconnect, disconnect

None of these exist for a bank. Disconnect copy in F01 is a settings surface. `copy.ts` marks session revocation and data export as unsubstantiated. DESIGN_REQUIREMENT: those product promises stay withheld until the pipeline exists.

## Multiple institutions and accounts

The ledger already allows many accounts per repository, each with `account_id`. There is no institution object, no provider account id, and no per-institution health.

## Data deletion

Owner RLS lets a user delete their snapshot and record-file rows. There is no provider revocation step because there is no provider item. Receipt bytes are specified as device-only.

## What not to do

Do not request bank credentials in the app. Do not store them. A later provider must use its own hosted authentication.
