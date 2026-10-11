# SITE 00 — Digital Foundation Artifact V1

## Product doctrine

**Digital Foundation** is a standalone **IDNTY** product under SITE 00:

```
SITE 00 → IDNTY → DIGITAL FOUNDATION
```

It is a **persistent personalized artifact** (one opaque link per lead) that evolves:

PROSPECT → INTAKE → RECOMMENDATION → QUOTE → PAYMENT → PROJECT → COMPLETION → BUILD OPPORTUNITY

It is not a throwaway form, PDF, or separate payment URL.

## Commercial model

- Base service: **configurable** via `shared/site00-digital-foundation/commercialConfig.ts` (default **$500** USD, integer **minor units**).
- Turnaround: configurable base **2–3 business days**; add-ons adjust timeline via `timelineEngine.ts`.
- Third-party costs (domain, Workspace/M365, etc.) are **disclosed separately** — not implied as included unless configured.

## Code map

| Concern | Path |
|--------|------|
| Types + catalog | `shared/site00-digital-foundation/` |
| Quote engine | `shared/site00-digital-foundation/quoteEngine.ts` |
| Timeline engine | `shared/site00-digital-foundation/timelineEngine.ts` |
| Lifecycle | `shared/site00-digital-foundation/lifecycle.ts` |
| Recommendation | `shared/site00-digital-foundation/recommendationEngine.ts` |
| Service (V1 memory store) | `api/_lib/digitalFoundation/service.ts` |
| Payment abstraction | `api/_lib/digitalFoundation/payment/types.ts` |
| Stripe hosted checkout V1 | `api/_lib/digitalFoundation/payment/stripeHostedCheckout.ts` |
| Webhook | `api/site00/digital-foundation-stripe-webhook.ts` |
| Public API | `api/site00/digital-foundation-artifact.ts` |
| Founder console API | `api/admin/site00-foundation.ts` |
| Public route | `/foundation/:token` |
| Admin routes | `/admin/site00/foundation`, `/admin/site00/foundation/:id` |
| Schema (persistence) | `supabase/migrations/20261008160000_site00_digital_foundation_artifact_v1.sql` |

## Feature flags

- `SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1`
- `SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1`
- `SITE00_DIGITAL_FOUNDATION_PORTAL_V1`
- `SITE00_DIGITAL_FOUNDATION_BUILD_UPSELL_V1`

Browser: `VITE_SITE00_DIGITAL_FOUNDATION_*` mirrors server flags (see `featureFlags.ts`).

## Stripe V1

- **Hosted Checkout** only (embedded checkout reserved on payment adapter interface).
- **Test mode**: set `STRIPE_SECRET_KEY` (sk_test_…) and `STRIPE_WEBHOOK_SECRET`; or use sim mode when unset (`SITE00_DIGITAL_FOUNDATION_STRIPE_SIM=1` / vitest).
- **Never** mark `PAID` from success redirect — only webhook / verified simulation.
- Metadata: `artifact_id`, `quote_id`, `quote_version`, `lead_id`, `referral_source_id`, `service_type`.

## Referrals

Canonical kinds: AIO, SISTER_REA, DIRECT, CLIENT_REFERRAL, SITE00, CUSTOM — no hardcoded individuals.

Funnel stages tracked on lead: REFERRED → OPENED → STARTED → QUOTED → ACCEPTED → PAID → COMPLETE → BUILD_INTEREST → BUILD_BOOKED.

## Micro client portal

Same `/foundation/:token` after payment: project stages, **Needs you**, approvals, activity via event ledger.

## Completion + build upsell

Founder marks complete → ownership record + **FoundationBuildCredit** (default **$200**, **30 days**, configurable).

Build interest captured without requiring website purchase. Concept preview is labeled **CONCEPT PREVIEW — NOT FINAL DESIGN**.

## SITE 00 migration path

- `DigitalFoundationLead` → future SITE 00 client/contact
- Artifact → project/workspace entry
- Intake → IDNTY project data
- Completion → BUILD_READY context
- Build interest → BLDR opportunity

## Security

- No passwords in intake.
- Opaque token only in URL — no PII or payment state in path.

## Fixtures

`shared/site00-digital-foundation/fixtures/scenarios.ts` — scenarios A–M for QA/tests; admin `materialize-fixture` action.

## Visual authority

V1 is **functional shell only** (`site00-digital-foundation.css`). Opus sprint owns final experience authority.
