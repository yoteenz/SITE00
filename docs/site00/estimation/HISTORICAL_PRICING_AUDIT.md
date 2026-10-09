# Historical pricing audit

Sprint: `P0.SITE00.SCOPE-ESTIMATION.PRICING-POSITIONING-AND-SYMMETRIC-RANGE-RECONCILIATION1`

Estimator version `1.0.0` is on main (ancestor `b34a6e5e`). This audit does not change public prices, floors, or the calculation.

## Four commercial layers

| Layer | What it is | Binding | Where it lives |
| --- | --- | --- | --- |
| Starting investment | Entry price for a defined minimum scope | No | Historical concept and `buildFloors` |
| Project estimate | Range from the actual selections | No | `estimateProject()` |
| Final proposal | Founder-reviewed offer | No | Not produced by the calculator |
| Agreed contract value | Accepted, versioned commitment | Yes | Not an illustrative fixture |

A Builder preview and a Blueprint are project estimates. They are not quotes and they are not contracts.

## Historical offers vs the engine

| Offer | Historical starting concept | Estimator floor today | Meaning |
| --- | --- | --- | --- |
| Simple layout | About $3,000 | $3,000 (`SIMPLE`) | Starting investment. Includes about 2 family units. |
| Custom build | About $10,000 | $10,000 (`CUSTOM`) | Starting investment. Includes about 8 family units. |
| Advanced | No separate historical poster price | $6,000 | Calibration midpoint between the two starts. Not a published offer. |

Public marketing anchors elsewhere on the site (`FROM $4K+`, `FROM $10K+`, `FROM $25K+`) were not edited.

## What the reported fixtures actually are

They are fully scoped illustrative configurations in `fixtures.ts`. They are not starting prices, not founder-approved public prices, and not agreed contracts.

| Fixture | What it models | Previous client display | Commercial meaning |
| --- | --- | --- | --- |
| SIMPLE_SERVICE | Three light families on a service site | 8–10 weeks · $5K–$7K | Project estimate above the $3,000 floor |
| STANDARD_EDITORIAL | Six editorial families, bespoke visual system | 15–19 weeks · $17K–$22K | Project estimate |
| ADVANCED_COMMERCE | Commerce site with payments | 5–7 months · $27K–$35K | Project estimate |
| LARGE_PRODUCT | Sixteen mixed families | 8–10 months · $43K–$55K | Project estimate |
| SPATIAL_WORLD | World scope, no page families | 12–16 months · $69K–$94K | Project estimate, world weights still calibration-needed |
| PORTAL_SYSTEM | System-heavy portal | 9–12 months · $52K–$70K | Project estimate, not in the original reported list |
| ZERO_FAMILIES | Empty site at the simple floor | 3–5 weeks · $3K–$4K | Closest fixture to the historical simple start |

## Conflicts for founder review

1. The $3,000 and $10,000 figures are starting floors. The simple fixture at $5K–$7K is a scoped site, not a contradiction of the floor.
2. Public site copy still says SITE from $4K+. That anchor is not the estimator floor and was not changed.
3. Fixture displays are not approved to replace those public anchors.
4. World and portal weights remain calibration-needed. Their ranges are estimates, not price cards.

No historical price was rewritten.
