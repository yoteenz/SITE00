# Pricing reconciliation and presentation policy

Sprint: `P0.SITE00.SCOPE-ESTIMATION.PRICING-POSITIONING-AND-SYMMETRIC-RANGE-RECONCILIATION1`

Policy version: `1.0.0`  
Code: `src/studioos/estimation/presentation.ts`  
Estimator version: `1.0.0` (mathematics unchanged)

Builder, Blueprint, and the internal estimator all read `toClientBlueprintEstimate()`. That function normalizes once from the raw result. The rounded strings are not passed back into costing, platform fees, or the ledger.

## Timeline rule

Week windows use whole numbers and even endpoints.

- The low end moves up to the next even week when the canonical week is odd or fractional. It does not move earlier.
- The high end moves up to the next even week. It is not rounded down.
- If either end would move more than two weeks past the canonical value, the result is flagged for review instead of being treated as a silent restyle.

Example: canonical 14.79–18.90 weeks, previously shown as 15–19 weeks, now shown as 16–20 weeks.

Month windows stay in months once the canonical high week is 20 or more. Months are rounded outward (ceiling) and are not forced onto even numbers. 8–10 and 12–16 stay as they are. 5–7 and 9–12 move only where the previous rounding understated the canonical weeks, and those moves are flagged.

## Investment rule

The displayed band must contain the calculated low and high.

The increment depends on the expected investment:

| Expected investment | Increments considered |
| --- | --- |
| Under $10,000 | $500 and $1,000 |
| $10,000–$49,999 | $1,000 and $2,000 |
| $50,000 and above | $1,000 and $5,000 |

The tighter covering band is used. $17K–$22K becomes $16K–$22K because $16,999.20 is inside $16K and outside a $17K floor. Internal dollars stay $16,999.20–$21,721.20.

Platform percentages are not normalized. Transaction amounts and payouts are not rounded by this policy.

## Fixture before / after

Display only. Raw weeks and dollars are unchanged.

| Fixture | Previous display | Presentation 1.0.0 | Review |
| --- | --- | --- | --- |
| SIMPLE_SERVICE | 8–10 weeks · $5K–$7K | 8–10 weeks · $5K–$7K | No |
| STANDARD_EDITORIAL | 15–19 weeks · $17K–$22K | 16–20 weeks · $16K–$22K | No |
| ADVANCED_COMMERCE | 5–7 months · $27K–$35K | 6–7 months · $27K–$35K | Yes, months |
| LARGE_PRODUCT | 8–10 months · $43K–$55K | 8–10 months · $43K–$56K | No |
| PORTAL_SYSTEM | 9–12 months · $52K–$70K | 9–13 months · $51K–$71K | Yes, months |
| SPATIAL_WORLD | 12–16 months · $69K–$94K | 12–16 months · $69K–$94K | No |
| ZERO_FAMILIES | 3–5 weeks · $3K–$4K | 4–6 weeks · $3K–$4K | No |

Builder reference rows, including the smallest site and priority variants, are in `docs/site00/builder-experience/BUILDER_PRICING_EVIDENCE.json`. That file is generated from the same formatter. It is not a published price list.

## Founder decisions still open

1. Keep $3,000 and $10,000 as starting floors, distinct from scoped fixture ranges.
2. Accept 16–20 weeks and $16K–$22K as the client display for the standard editorial fixture.
3. Review 6–7 months against the previous 5–7 months for the commerce fixture. The shift avoids promising a shorter month than the canonical weeks support. It was not snapped to 6–8.
4. Review 9–13 months against the previous 9–12 months for the portal. The previous high month rounded the canonical weeks down.
5. Accept the covering investment corrections ($16K floor, $56K large-product high, $51K–$71K portal) as display only.
6. Do not replace public `FROM $4K+` / `FROM $10K+` / `FROM $25K+` anchors until a separate approval.

No production price change is authorized by this policy.
