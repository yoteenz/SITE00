# Completion control refinements

## Authority (FD-4)

Founder approved **control refinements only** — not a completion-page rebuild.

## Preserved

- Completion page layout, hero, summary, navigation, and success copy.
- Progress rail, menu drawer, step structure, P02/P03 check-on-press, P05 locked checkout.
- CTA destinations and checkout behavior.

## Refined (via shared DF components)

- **System B** marks on applicable check surfaces (services, add-ons, disclosures) align with ink-box + red-period checked state.
- **Focus / disabled / loading** continue to use existing SITE 00 DF tokens (Phase 1 focus ring, no generic blue rings).
- **Completion CTA** uses existing button components; no new circular or Material-style controls.

## Phone requirement integration

- Final completion blocked client-side when phone invalid/missing (with approved copy).
- Server `completeIntake` enforces phone for new completions; legacy `COMPLETE` records grandfathered.

## Verification

- Visual review route: `/foundation/review` (unchanged composition).
- Automated: `tests/digitalFoundationCommerce.test.ts`, `tests/dfFormControlConsolidatedA.test.ts`.
