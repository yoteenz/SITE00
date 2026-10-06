# Baked-UI Guard + Contamination Guard

**Sprint:** P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1
**Source of truth:** `shared/studioos-visual-authority/hybrid-authority.ts`. `BAKED_UI_GUARD.json` is generated.

## Baked UI

A plate that already contains a button, label, nav cell or logo produces **UI on UI** once the deterministic layer is placed over it: a doubled button, a ghost label, two logos.

**Method**
1. Every deterministic zone becomes a **reserved region** on the plate. That covers product and system zones, and any slot with a precision kind.
2. OCR the plate. Any legible glyph anywhere rejects it, because plates carry no text.
3. Score each reserved region with the CENTER_STAGE salience method: 0.55 × local edge energy + 0.30 × saturation + 0.15 × bright luminance. The mean must be **≤ 0.12**.
4. A person checks every reserved region at 100 %: no button shapes, pills, nav cells, icon glyphs, logo-like marks or ghost labels.

A reserved region may carry material and light only (plaster, paper, stone, shadow). It is the quiet surface the UI sits on.

**Reject on:** UI_ON_UI · DUPLICATE_BUTTON · DUPLICATE_LOGO · DUPLICATE_NAV · GHOST_LABEL · LEGIBLE_TEXT · ICON_GLYPH.

**Generator QA:** NO_RANDOM_COPY · NO_RANDOM_LOGO · NO_NAV · NO_UI_BUTTONS · NO_WRONG_APP · NO_WRONG_FAMILY · NO_TYPOGRAPHY_DEPENDENCY · NO_BROKEN_DEVICE_CHROME · NO_UNRELATED_CONTENT.

## Contamination

The founder-run F09 T03 pass rendered "A QUIETER YOU", "BEGIN YOUR JOURNEY" and a journal cover, all from another JURNL surface. One guard per territory is locked **before** the generation call. It holds:
- `required_copy`: every string the composite may show
- `forbidden_copy`: phrases from other surfaces or families
- `allowed_reference_assets` (path + sha256 + role) and `forbidden_reference_assets`
- `prompt_hashes` and `blueprint_hash`
- `run_rules`: one plate per run, a fresh session with no prior images, hashes checked before the call, the output OCR'd and hashed

`checkContamination(guard, observedText, plate)`:
- **Plate mode:** any glyph invalidates the plate.
- **Composite mode:** every string must be contract copy. A forbidden phrase invalidates the composite unless that exact string is approved copy (GROW is forbidden; PLAN TODAY. GROW FREELY. is the approved tagline).
