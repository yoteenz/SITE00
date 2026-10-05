# Marketing website → Studio World commercial pipeline (P0 integration)

## Existing marketing architecture (audited)

| Key | Value |
|-----|--------|
| Public landing | `/evolve/marketing` |
| Services | `/evolve/marketing/services` |
| Intake | `/evolve/marketing/intake/:serviceId` |
| Client workspace | `/evolve/marketing/engagement/:engagementId` |
| Package model | `shared/site00-marketing/serviceTaxonomy.ts` (service category, not duplicate EVOLVE plan catalog) |
| Purchase | Intake → brief → authorize → `confirm-payment` → `provision` |
| Studio World handoff | `provisionMarketingEngagement` → production adapter + `site00_external_production_links` |
| Pricing authority | `shared/site00-evolve-commercial` — add-on dollars remain `FOUNDER_PRICING_REQUIRED` until wired |

## Integration added

- `shared/site00-marketing-commercial/` — entitlement templates, pipeline, audit constants
- `site00_marketing_engagements.commercial_state` (jsonb) — entitlement, marketing project, events, usage ledger
- Payment confirm → `ensureCommercialOnPayment` (ClientMarketingEntitlement from service category template)
- Provision → `ensureCommercialOnProvision` (links `studioWorldCampaignId` ↔ marketing project)
- API: `commercial-production-action`, `commercial-test-addon` (simulated purchase/credit until Stripe add-ons)
- Engagement workspace UI — compact allowance summary when commercial state exists

## Canonical journey

Marketing service category → entitlement template → payment activation → marketing project → Studio World campaign → production actions → usage ledger / commercial events.

Character vs new Actor: separate allowances; reuse (`USE_EXISTING`) does not consume creation buckets.

## Tests

`tests/p0SwMarketingCommercialPipelineIntegration1.test.ts` — package→entitlement→project→casting search→consume→add-on unblock→monthly reset.
