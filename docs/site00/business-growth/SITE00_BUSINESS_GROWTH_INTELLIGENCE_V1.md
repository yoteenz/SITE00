# SITE 00 — Business Growth Intelligence V1

Sprint: `P0.SITE00.BUSINESS-GROWTH-INTELLIGENCE.V1-FOUNDATION-AMBITION-SERVICE-CATALOG-AND-DYNAMIC-DELIVERY1`

## Status

| Area | Status |
| --- | --- |
| Service category **BUSINESS GROWTH** | **IMPLEMENTED** (contracts) |
| Public activation | **NOT AUTHORIZED** |
| Live Growth charges | **NONE** |
| Growth catalog prices | **PROPOSED — founder approval pending** |
| Recurring Growth Operations | **NOT ACTIVATED** |

## Architecture

- **Module:** `shared/site00-business-growth-intelligence/`
- **Version:** `bgi-v1` / catalog `bgi-catalog-v1`
- **Preserves:** IDNTY Digital Foundation ($500 base unchanged), BLDR estimator authority, EVOLVE identity, Invitation 001 attribution
- **Integration:** `api/_lib/digitalFoundation/growthBridge.ts` + optional `intake.business_ambition` on `DigitalFoundationIntake`

## Service families

1. VISIBILITY — Business Visibility Audit  
2. PRESENCE — Presence Launch (BLDR)  
3. OPPORTUNITY — Opportunity Readiness, Application/Procurement Support  
4. SALES SYSTEMS — (catalog slot for future)  
5. GROWTH OPERATIONS — future recurring (not active)

## Business Ambition

Canonical intake contract: `businessAmbition.ts` — goals, skip, adaptive context fields.  
Must appear **before** final Foundation recommendation when `SITE00_BUSINESS_GROWTH_INTELLIGENCE_V1` is enabled.

## Engines

| Engine | Path |
| --- | --- |
| Recommendations | `recommendationEngine.ts` |
| Quote sections | `quoteComposition.ts` |
| Delivery / milestones | `deliveryEngine.ts` |
| Roadmap | `roadmap.ts` |
| Opportunity provenance (future) | `opportunityProvenance.ts` |
| AIO boundaries | `aioReferralBoundaries.ts` |

## Feature flags (default off)

- `SITE00_BUSINESS_GROWTH_INTELLIGENCE_V1`
- `SITE00_BUSINESS_AMBITION_INTAKE_V1`
- `SITE00_BUSINESS_GROWTH_CHECKOUT_V1`

## Founder governance

Growth lines with `PROPOSED_NOT_ACTIVE` **do not** increase Stripe checkout totals. Only `FOUNDER_APPROVED` lines compose into `one_time_total_minor` when checkout flag is explicitly enabled.

## Tests

`tests/businessGrowthIntelligence.test.ts`

## Next sprint

`P0.SITE00.BUSINESS-GROWTH-INTELLIGENCE.V1-CLIENT-EXPERIENCE-AND-ROADMAP-OPUS1` — Opus visual layer.
