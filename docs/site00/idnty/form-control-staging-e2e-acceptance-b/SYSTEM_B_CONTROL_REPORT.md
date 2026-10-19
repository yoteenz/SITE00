# System B control report

## Live staging

**NOT VERIFIED** — bundle missing `df-check--on` marker.

## Automated

| Surface | Evidence |
| --- | --- |
| P03 services | Sprint A CSS + `EntryIntake` `ServiceRow` |
| P04 add-ons | `Recommendation.tsx` |
| P05 disclosures | `CheckoutActivation.tsx` |
| Markup tests | `tests/dfFormControlConsolidatedA.test.ts` |

## Post-deploy

Verify red period in ink box on tap; no double-toggle; saved/restored checked state matches services catalog values.
