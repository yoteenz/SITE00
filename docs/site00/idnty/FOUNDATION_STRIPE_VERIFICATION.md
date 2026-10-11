# Foundation Stripe verification

**Live collection:** NOT authorized this sprint. **Test-mode E2E checkout:** NOT executed against deployed webhook.

## Code paths (reviewed)

| Module | Role |
| --- | --- |
| `api/_lib/digitalFoundation/payment/stripeHostedCheckout.ts` | Hosted checkout session; reads `STRIPE_SECRET_KEY` / `SITE00_STRIPE_SECRET_KEY`; sim when `SITE00_DIGITAL_FOUNDATION_STRIPE_SIM=1` |
| `api/_lib/digitalFoundation/payment/webhookHandler.ts` | Signature via `STRIPE_WEBHOOK_SECRET` / `SITE00_STRIPE_WEBHOOK_SECRET` |
| `api/site00/digital-foundation-stripe-webhook.ts` | Public webhook route |

## Automated proof (not Stripe Dashboard)

- `tests/digitalFoundationCommerce.test.ts` (11 tests) — webhook simulation, idempotency, quote version guards — **PASS**
- `tests/digitalFoundationCriticalRepair.test.ts` — outdated quote rejection — **PASS**

## Production configuration checklist

| Item | Status |
| --- | --- |
| Test mode secret on staging API | **UNVERIFIED** |
| Live mode secret | **UNVERIFIED** (must not enable without founder) |
| Webhook endpoint URL registered in Stripe | **UNVERIFIED** |
| Signing secret on Railway | **UNVERIFIED** |
| Checkout return URLs (site00.com / foundation paths) | **UNVERIFIED** |
| Payment events durable in Postgres | **MISSING** (in-memory stripe event tracking in service layer) |
| Refund/dispute handling | Code paths exist; live **UNVERIFIED** |

## Required before Gate B PASS

1. Stripe test checkout from client UI → success URL → signed webhook to **deployed** API.
2. Confirm amount, currency, metadata (`artifact_id`, quote version) in session.
3. Duplicate webhook does not double-activate (re-test on staging).
4. Separate live-mode checklist with founder — no agent switch to live.
