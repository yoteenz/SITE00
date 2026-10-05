# P0.SITE00-COMMERCIAL-CANON-AND-FULFILLMENT-SPINE1

Canonical commercial + fulfillment spine (post audit PR #1250). **No Stripe. No new prices. No website redesign.**

## Dual pricing resolution (Part 1)

| | Tree A (CANONICAL) | Tree B (LEGACY DISPLAY) |
|--|--|--|
| **Location** | `shared/site00-evolve-commercial/catalog.ts` | `shared/site00-evolve-pricing/catalog.ts` |
| **Role** | Managed EVOLVE SKUs, cents, admin assign | `/evolve/plans` SaaS-style display |
| **Billing** | Intended authority | **Blocked** via `assertNoSilentLegacyBilling('site00-evolve-pricing')` |

**Normalization:** `shared/site00-commercial-canon/serviceCatalog.ts` → `getSite00ServiceCatalog()`

## Canonical source (Part 2)

- **Site00ServiceCatalog** — one `serviceId` + `packageId` per audited surface (25)
- Legacy aliases — `shared/site00-commercial-canon/legacyAliases.ts`

## Fulfillment families (Part 4)

`IDENTITY` · `BUILDER_SIMPLE` · `BUILDER_CUSTOM_WORLD` · `MARKETING_CAMPAIGN` · `RECURRING_RETAINER` · `ADD_ON` · `CUSTOM_QUOTE` · `EVOLVE_PLATFORM`

## Adapters (Parts 8–15)

Interface: `ServiceFulfillmentAdapter` in `fulfillmentAdapter.ts`  
Registry: `registerAllSite00FulfillmentAdapters()` — Marketing reuses PR #1249 paths (`marketing-campaign-fulfillment`)

## Founder decisions

`COMMERCIAL_FOUNDER_DECISIONS` — 12 entries in `founderDecisions.ts`

## Wiring matrix v2

`buildWiringMatrixV2()` in `wiringMatrixV2.ts`

## Tests

`tests/p0Site00CommercialCanonAndFulfillmentSpine1.test.ts`
