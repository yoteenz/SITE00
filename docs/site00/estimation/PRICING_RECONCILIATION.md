# Pricing reconciliation and presentation policy

Sprint: `P0.SITE00.SCOPE-ESTIMATION.EVEN-ENDPOINT-MONTH-RANGE-NORMALIZATION1`  
Previous sprint: `P0.SITE00.SCOPE-ESTIMATION.PRICING-POSITIONING-AND-SYMMETRIC-RANGE-RECONCILIATION1`

Policy version: `1.1.0`  
Previous policy version: `1.0.0` (superseded)  
Code: `src/studioos/estimation/presentation.ts`  
Estimator version: `1.0.0` (mathematics unchanged)

Builder, Blueprint, and the internal estimator all read `toClientBlueprintEstimate()`. That function normalizes once from the raw result. The rounded strings are not passed back into costing, platform fees, or the ledger.

## Timeline rule

Week windows use whole numbers and even endpoints.

- The low end moves up to the next even week when the canonical week is odd or fractional. It does not move earlier.
- The high end moves up to the next even week. It is not rounded down.
- If either end would move more than two weeks past the canonical value, the result is flagged for review instead of being treated as a silent restyle.

Example: canonical 14.79–18.90 weeks, previously shown as 15–19 weeks, now shown as 16–20 weeks.

FOUNDER DISPLAY POLICY: client-facing timeline range endpoints use even numbers only. This applies to weeks and months. Raw calculations remain unchanged.

Month windows are used once the rounded high week is 20 or more. The month integers are the nearest whole months of those rounded weeks. Both month endpoints then move to even numbers the same way week endpoints do: an odd number moves up to the next even number. If that would collapse a real span onto one number, the high end opens by two. A client does not see a single month where the estimator produced a range.

The 16–20 week display is the even form of a canonical window under 20 weeks, such as 15–19 weeks. The integer table below is the shared even-endpoint rule. It is not a second pass over an already displayed label.

Superseded rule from policy 1.0.0: “Months are rounded outward and are not forced even.” That rule produced 6–7 months and 9–13 months. It is no longer in effect.

Examples of the even rule, applied to the integer range before display:

| Integer range | Even display |
| --- | --- |
| 1–1 | 2–2 |
| 1–2 | 2–4 |
| 5–7 | 6–8 |
| 6–7 | 6–8 |
| 7–9 | 8–10 |
| 8–11 | 8–12 |
| 9–12 | 10–12 |
| 10–13 | 10–14 |
| 15–19 | 16–20 |
| 16–20 | 16–20 |

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

Raw values stay on the estimate result. The display column is policy 1.1.0.

| Fixture | Raw weeks | Policy 1.0.0 display | Policy 1.1.0 display |
| --- | --- | --- | --- |
| SIMPLE_SERVICE | 7.70–9.84 | 8–10 weeks · $5K–$7K | 8–10 weeks · $5K–$7K |
| STANDARD_EDITORIAL | 14.79–18.90 | 16–20 weeks · $16K–$22K | 16–20 weeks · $16K–$22K |
| ADVANCED_COMMERCE | 22.67–28.96 | 6–7 months · $27K–$35K | 6–8 months · $27K–$35K |
| LARGE_PRODUCT | 33.38–42.65 | 8–10 months · $43K–$56K | 8–10 months · $43K–$56K |
| PORTAL_SYSTEM | 38.88–53.20 | 9–13 months · $51K–$71K | 10–12 months · $51K–$71K |
| SPATIAL_WORLD | 50.42–68.98 | 12–16 months · $69K–$94K | 12–16 months · $69K–$94K |
| ZERO_FAMILIES | 3.00–5.08 | 4–6 weeks · $3K–$4K | 4–6 weeks · $3K–$4K |

The commerce case is the founder example 5–7 months. Policy 1.0.0 showed 6–7 months. Policy 1.1.0 shows 6–8 months. The portal case is the founder example 9–12 months. Policy 1.0.0 showed 9–13 months. Policy 1.1.0 shows 10–12 months. The editorial case stays 16–20 weeks.

Builder reference rows, including the smallest site and priority variants, are in `docs/site00/builder-experience/BUILDER_PRICING_EVIDENCE.json`. That file is generated from the same formatter. It is not a published price list.

## Founder decisions still open

1. Keep $3,000 and $10,000 as starting floors, distinct from scoped fixture ranges.
2. Accept 16–20 weeks and $16K–$22K as the client display for the standard editorial fixture.
3. Accept 6–8 months as the client display for the commerce fixture. The raw window remains 22.67–28.96 weeks.
4. Accept 10–12 months as the client display for the portal fixture. The raw window remains 38.88–53.20 weeks.
5. Accept the covering investment corrections ($16K floor, $56K large-product high, $51K–$71K portal) as display only.
6. Do not replace public `FROM $4K+` / `FROM $10K+` / `FROM $25K+` anchors until a separate approval.

No production price change is authorized by this policy.
