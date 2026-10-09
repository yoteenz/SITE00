# Business Growth — Opus visual handoff V1

Composer delivers **data contracts only** in this sprint. Opus implements experience when founder enables flags.

## Design principles

- Inherit SITE 00 luminous / architectural language — not generic SaaS pricing cards  
- Business Ambition is a **natural continuation** of Foundation intake, not a second wall of questions  
- Do not present Growth services as **purchasable** until commercial status is `FOUNDER_APPROVED`  
- Show **separated** quote sections: Foundation base · Foundation add-ons · Growth · BLDR · Third-party · Recurring (inactive)

## Surfaces to design

| Surface | Data source |
| --- | --- |
| Business Ambition step | `BusinessAmbitionIntake`, `BUSINESS_AMBITION_GOAL_OPTIONS`, `adaptiveContextFieldsForGoals()` |
| Recommendations | `GrowthServiceRecommendation[]` with category badges |
| Service selection | `SelectedGrowthService[]` — explicit opt-in, no preselected paid lines |
| Bundle comparison | `BGI.BUSINESS_GROWTH_PACKAGE` (hidden until founder configures) |
| Investment review | `UnifiedCommercialQuoteSections` |
| Delivery timeline | `GrowthDeliveryMilestone[]`, `formatBusinessDayRange()` |
| Roadmap | `BusinessGrowthRoadmap` |
| Milestone views | `FOUNDATION_READY` vs `FULL_PROJECT` vs `BLDR_OPPORTUNITY` |

## Recommendation category UI

Map categories to calm, educational copy:

- NEEDED NOW  
- RECOMMENDED NEXT  
- OPTIONAL  
- FUTURE OPPORTUNITY  
- SPECIALIST REVIEW REQUIRED  
- NOT RECOMMENDED  

## Hooks / server (Composer — do not fork)

- Foundation artifact API: `/api/site00/digital-foundation-artifact`  
- Growth bundle: `attachGrowthContextToFoundationPayload()` when flag on  
- Events: `BUSINESS_GROWTH_EVENTS` constants  

## BLDR boundary

Presence Launch → link/create BLDR opportunity; never show as Foundation add-on line item.

## AIO boundary

Show referral cards from `AIO_REFERRAL_HINTS` — separate company, separate billing.

## Flags

All Growth UI gated by `isBusinessGrowthIntelligenceActive()` until founder activation.
