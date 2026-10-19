# Visual regression report — Phase 1

**Reference boards:** Opus2 finalized boards 01A–07 (authority commit `c5a773381`). Phase 1 intentionally does **not** implement board-only proposals (sheet selector, System B, progression redesign).

## Compared surfaces

- P02 Business Information on design review route (`DigitalFoundationReviewPage` + `P02Intake`)
- Portal record chips (CSS only; no layout change)

## Expected deltas (authorized)

- Required asterisks on BUSINESS NAME, PRIMARY CONTACT, EMAIL ADDRESS
- OPTIONAL sublabel on BUSINESS TYPE, CONTACT NUMBER, and optional P03 reveal fields
- CONTACT NUMBER label + backup helper line (phone not required yet)
- Slightly stronger focus ring on focused inputs (solid red)
- Portal category chips: bordered uppercase tabs instead of native button chrome

## Not changed (must match live intake)

- Field shell cards, spacing rhythm, uppercase chrome typography
- Native Business Type control (still `<select>`)
- Progress rail, menu drawer, CTAs
- Checkbox/radio visuals in P03 services (System B deferred)

## Evidence

Screenshots under `/opt/cursor/artifacts/df-phase1-visual/`.
