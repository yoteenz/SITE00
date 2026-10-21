# Stripe test proof

## Code path (verified in repo)

1. `acceptQuote` + `markQuoteCommerciallyReady` → `assessQuotePayability` ok  
2. `createCheckoutSession` → Stripe hosted checkout (`stripeHostedCheckout.ts`) or simulated when secret missing  
3. Webhook: `webhookHandler.ts` — signature verification + idempotent `site00_df_stripe_events`  
4. `simulateStripeCheckoutCompleted` — **tests only**; not a production/staging substitute

## Live staging (2026-10-21)

| Item | Status |
| --- | --- |
| Webhook secret configured (health) | Present |
| Secret key configured (health) | Present |
| Key mode in health | `unrecognized` on deploy `34d9afa` (prefix not logged) |
| Test checkout session created | **NOT_TESTED** (no founder session on agent) |
| Signed webhook received | **NOT_TESTED** |
| Paid → activation | **NOT_TESTED** live |

## Phase 3B code improvement (branch)

`detectStripeKeyMode()` now treats `rk_test_` / `rk_live_` restricted keys as test/live (requires redeploy to appear in health).

## Founder proof steps

1. Sign in on staging SPA.  
2. Complete synthetic journey through quote accept.  
3. Open Stripe checkout (test card `4242…`).  
4. Confirm webhook in Stripe dashboard → staging API logs / `site00_df_stripe_events` row.  
5. Confirm client portal shows paid/activation — **not** success URL alone.

## Gates F / G / H

| Gate | Status |
| --- | --- |
| F — test checkout | **NOT_TESTED** |
| G — signed webhook | **NOT_TESTED** |
| H — activation | PARTIAL (simulated tests PASS)
