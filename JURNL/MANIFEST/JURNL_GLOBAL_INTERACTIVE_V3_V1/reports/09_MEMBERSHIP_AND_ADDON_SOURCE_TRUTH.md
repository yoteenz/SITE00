# 09 · Membership and add-on source truth

Sources: `JurnlEntitlementsProvider` (resolved entitlements; presentation only), `data/monetization/plans.ts`,
`capabilities.ts`, `addOns.ts`, `contract.ts`. No price, purchase URL, billing date, payment method or provider exists.

| Surface | Shows | From |
|---|---|---|
| MY MEMBERSHIP · YOUR PLAN | `JURNL FREE` · ACTIVE · `N CAPABILITIES INCLUDED` | `effectivePlanId`, registry name, `capabilities.length` |
| MY MEMBERSHIP · INCLUDED | first six capability labels + "AND N MORE INCLUDED" | capability registry labels |
| MY MEMBERSHIP · ACTIVE ADD-ONS | granted add-ons, or NO ADD-ONS YET | `addOns.granted` |
| MY MEMBERSHIP · billing | "BILLING IS NOT SET UP YET. NOTHING CAN BE BOUGHT…" | plan `billingStatus: NOT_CONFIGURED`, `billingProvider: NONE` |
| MANAGE MEMBERSHIP | static, NOT AVAILABLE YET | no billing route exists |
| EXPLORE ADD-ONS | TRAVEL · PREMIUM CREDIT · MAJOR PURCHASE PREP · BUSINESS TAX | registry (all `DRAFT`, `billingType: TBD`) |
| add-on state | COMING SOON for all four | `addOnState`: AVAILABLE only if live + billing defined + eligible |
| UNLOCK | what it grants, which plans it is for, COMING SOON notice, NOT NOW | registry |
| unknown state | "WE COULDN'T LOAD YOUR PLAN DETAILS. YOUR CORE JURNL FEATURES STILL WORK." | fail closed |

V3's invented items (FOUNDER · Lifetime Access, EARLY INSIGHTS, TRAVEL PLANNER, LEGACY TOOLS, MARKET CONTEXT) were
**not** implemented. Add-on illustrations reuse approved V9 art (coastal panel, temple composition, receipt stack, the
parent credit card) — assignment is a founder decision (report 24).
