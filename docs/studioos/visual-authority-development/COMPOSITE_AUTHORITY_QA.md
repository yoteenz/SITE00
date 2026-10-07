# Composite Authority QA

**Sprint:** P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1
**Source of truth:** `shared/studioos-visual-authority/hybrid-authority.ts`. `COMPOSITE_AUTHORITY_QA.json` is generated.

`checkCompositeAuthority({ blueprint, ownership, profile, composite, renderer_model })` → `AUTHORITY_READY` | `COMPOSITE_AUTHORITY_REQUIRED`.

> **SCENE PLATE + OVERLAY IS NOT A FINISHED AUTHORITY.** Composition intent + brand world + official logo / type + bespoke art direction + deterministic product UI is. (Added by P0.JURNL.F09-SAFE-TO-SPEND.THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1, after two F09 composite rounds passed every mechanical check and were founder-rejected.)

## What must hold

1. **The blueprint and the ownership map are ready.**
2. **Art layers.** There is one accepted plate for every generator-owned or COMPOSITE layer. Each plate:
   - comes from the profile renderer, never a local approximation
   - passes generator QA
   - passes the baked-UI guard
   - is clean of contamination
3. **Deterministic layers.** Every deterministic or COMPOSITE layer has its deterministic source.
4. **Composite QA.** Every item passes:
   - EXACT_LOGO · EXACT_COPY · EXACT_NAV · EXACT_ICONS · EXACT_CTA · EXACT_FINANCIAL_VALUE
   - NO_OVERFLOW · NO_COLLISIONS · NO_GLITCHING · NO_MISSING_NAV_ITEMS
   - NO_BAKED_UI_UNDER_LIVE_UI · NO_DOUBLE_LOGO · NO_DOUBLE_TEXT
5. **Anti-AI.** The creative-direction anti-AI flags are applied to the composite, and a MATERIAL flag blocks. The flags now include **METAPHOR_CONSUMED_PAGE** and **DATA_NOT_ENCODED**.
6. **Richness audit** (1–5 per dimension; each ≥ 3, mean ≥ 3.8). The dimensions are:
   - ENVIRONMENT_DEPTH · MATERIAL_VARIETY · OBJECT_DETAIL · GRAPHIC_DESIGN_DETAIL · LIGHT_SHADOW
   - BRAND_INTEGRATION · PRODUCT_LAYERING · CUSTOM_ELEMENTS · COMPOSITIONAL_TENSION · VISUAL_WIT

   A sparse layout with the right colours is not rich.
7. **Product clarity ≤ 2 seconds.** On a SAFE TO SPEND-class page, the primary signal is understood without interpreting the metaphor.
8. **Finish audit (authored-authority standard).** Every item passes; a composite with no finish audit is not ready:
   - NO_VISIBLE_SCAFFOLDING: no blank plates, tags or panels, empty mockup zones, guide boxes, debug borders or placeholder primitives in the final image
   - NO_DEVICE_CHROME: no status bar, home indicator, phone or browser frame inside the authority view
   - OBJECT_FULLY_REALIZED · WORLD_AT_BENCHMARK (at or above the project's approved art-driven image)
   - UNIFIED_LIGHT_GRADE_GRAIN: overlays share the scene's light direction, grade and grain
   - TYPE_INTEGRITY · LOGO_OFFICIAL_INTEGRATED · CONCEPT_DISTINCT
9. **Founder verdict.** A REJECTED verdict blocks authority even when every check above passes.

## Typography defects (creative-direction audit)

Two defects were added after the F09 render: **MISSING_COPY** (for example, "TRIPS." dropped from the T02 sentence) and **MUTATED_MARK** (the official mark redrawn as a three-leaf sprig).
