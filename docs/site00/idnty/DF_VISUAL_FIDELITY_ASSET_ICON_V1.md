# Digital Foundation — visual fidelity asset + icon pass (V1)

Founder references (7/7) live in `docs/site00/idnty/df-visual-fidelity-v1/`.

## Mounted system (live React, not screenshot plates)

| ID | Role | Implementation | Status |
| --- | --- | --- | --- |
| DF-A01 | P01 threshold chamber | `objects.tsx` `DfThresholdHero` SVG | Recovered vector; red locked to `#E50107` |
| DF-A02 | Crown / side structure | `DfCrownObject` | Same family |
| DF-A03 | Corner fragment | `DfCornerFragment` | Same family |
| DF-I01 | Monoline icon set | `icons.tsx` `DfIcon` | Stroke 1.25, round caps/joins |

Photoreal generations that baked headlines were **rejected** and not mounted (sprint forbids baking functional type into plates).

## Screen coverage

| Screen | Client route | This pass |
| --- | --- | --- |
| P01–P06 | `/foundation/:token` views | Icon + red + existing architecture |
| P07 overview | `OVERVIEW` interim | Same shell tokens |
| P08–P15, records, location, runbook detail | Not separate client views | Not rebuilt (business surfaces stay on existing ops contracts) |

Business logic, pricing, and checkout were not changed.
