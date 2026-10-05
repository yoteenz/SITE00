# SITE 00 — Creative Direction: Context Classification + Reference-to-Production Methodology

Canonical, brand-agnostic methodology. Persisted here so every future brand (EVOLVE, Identity, Builder, Studio World, email production, social/brand campaigns, website/application graphics, video preproduction) inherits it instead of re-deriving it per sprint. First formalized during the NDX BOOK three-direction reference-locked production cleanup.

This document governs **asset production** once a direction is being produced. See `docs/site00/CORE_DIRECTION_METHODOLOGY.md` for the layer above it — **sequencing and gating**: when a direction may exist at all, when it may be expanded, and what founder approval locks.

## 1. Brand expression context classification (mandatory, before Creative Direction is produced)

Before any Creative Direction territory is produced for a brand, classify its **dominant expression context**. Do not force every brand through the same presentation (e.g. a website mockup is not always the correct "proof" of a brand).

```ts
type BrandExpressionContext =
  | 'SOCIAL_FIRST_EDITORIAL'   // primary public expression is feed/carousel/story/reel content
  | 'ECOMMERCE_FIRST'
  | 'SERVICE_BUSINESS'
  | 'PRODUCT_PLATFORM'
  | 'CREATOR_BRAND'
  | 'ENTERTAINMENT_MEDIA'
  | 'HOSPITALITY'
  | 'PHYSICAL_RETAIL'
  | 'HYBRID';
```

`CreativeBrief.primaryContext` (see `api/_lib/site00Evolve/creativeDirection/types.ts`) carries this classification per organization. It is set once per brief and drives which proof surfaces are prioritized in the Creative Direction UI.

**NDX BOOK → `SOCIAL_FIRST_EDITORIAL`.** Its primary public expression is Instagram feeds, carousels, stories, reels/short-form video, social graphics, editorial franchises, recurring content series, and campaign moments — not a website. Creative Direction for a `SOCIAL_FIRST_EDITORIAL` brand must prioritize, in this order: feed behavior → post families → carousel systems → story systems → reel/short-form systems → photography/art direction → graphic devices → typography behavior → recurring editorial franchises → motion principles → campaign extensibility. A website mockup is never the primary proof for this context.

## 2. Reference decomposition (mandatory, before implementation)

For every founder-approved reference board, produce a **visual production manifest** before writing any rendering code. Each meaningful visual component gets a row with:

`ASSET_ID · DIRECTION · REFERENCE_REGION · PURPOSE · CLASSIFICATION · GENERATION_METHOD · BACKGROUND_TREATMENT · COMPOSITE_BEHAVIOR · RESPONSIVE_BEHAVIOR · FIDELITY_MODE · PROMPT · NEGATIVE_PROMPT · EXPECTED_OUTPUT · FINAL_DESTINATION`

See `docs/studio-world/ndxbook/NDXBOOK_CD_REFERENCE_DECOMPOSITION.md` for a worked example across three simultaneous directions.

## 3. Code-native vs. generated-asset decision (mandatory per component)

| Classification | Use when the visual depends on... |
|---|---|
| `CODE_NATIVE` | Real typography, paragraphs/headings whose wording changes, rules/borders, simple grids, accessible text, simple geometric marks/diagrams, progress indicators, UI controls, responsive structural layout, repeatable metadata |
| `GENERATED_ASSET` | Photographic realism, physical paper/folds, complex lighting/shadow/refraction, analog imperfection, photographed collage, dimensional objects, editorial photography, printed artifacts, human imagery, atmospheric/light fields |
| `HYBRID_COMPOSITION` | FAL generates the physical/visual material; code applies exact marks, readable text, labels, dynamic data, typography, and controlled overlays on top |

Do not generate everything through FAL. Do not recreate everything with CSS. Choose per-component, and record the choice in the manifest.

## 4. FAL production pipeline (per `GENERATED_ASSET` / `HYBRID_COMPOSITION` row)

```
inspect reference region → determine fidelity mode → write production-spec prompt (subject,
material, camera perspective, composition, crop, lighting, physical treatment, texture, contrast,
color behavior, isolation requirement, shadow behavior, background requirement, intended
placement, negative constraints) → generate candidate → inspect candidate → reject if visually
incorrect → refine prompt → regenerate → approve only when usable → required treatment →
responsive derivatives where appropriate → integrate → compare final composition against reference
```

Fidelity modes: `EXACT_RECONSTRUCTION` (reference-conditioned when a usable reference crop/attachment is technically available to the model) · `DIRECTED_VARIATION` (text-to-image against a tightly specified production prompt when no reference file is available to the pipeline, or when the exact object itself does not need to match pixel-for-pixel) · `NET_NEW_GENERATION` (spec-only, e.g. motion/animation behavior documented for a future video pass).

Regeneration on rejection is a normal, expected pipeline step — not a failure.

## 5. Background treatment (mandatory declaration per generated asset)

`KEEP_BACKGROUND | REMOVE_BACKGROUND | GENERATE_TRANSPARENT_IF_SUPPORTED | MASK_AND_COMPOSITE | FULL_BLEED`

Never leave this implicit. When `REMOVE_BACKGROUND` / `MASK_AND_COMPOSITE` is declared:

```
generation → inspection → background removal → edge inspection → cleanup if required → compositing
```

Image background removal uses `fal-ai/birefnet/v2` (see `POST_PROCESSORS` in `api/_lib/site00Assts/postProcess/registry.ts`, id `BACKGROUND_REMOVE_IMAGE`). Never fake transparency with CSS blend modes. Never paste a generated object's original studio backdrop into a composition where it is meant to float.

## 6. Composite mapping (mandatory per placed asset)

Every asset placed into a composition gets an explicit map — canvas, position (normalized/percentage where useful), size, rotation, crop, anchor, z-index, overlap relationship, masking, shadow, blend behavior, safe area, and an **independently authored** mobile recomposition (never a proportional shrink of the desktop map). See `compositeMaps.ts` alongside each territory's asset registry for the schema in code.

## 7. Visual QA loop (mandatory, minimum two cycles per direction)

No implementation is complete because tests pass, assets generated, build passed, or the page renders. Each direction requires: render → inspect against the approved reference → classify any discrepancy (concept / asset / composition / scale / typography / color / spacing / density / material / responsive) → fix → rerender → compare again, at least twice, before calling a direction production-ready.

## 8. Productization

This methodology is universal across SITE 00 Creative Direction, Identity, Builder, EVOLVE, Studio World, email production, social/brand campaigns, content production, identity assets, website/application graphics, campaign photography, and video pre/production. New brand Creative Direction work should start from step 1 (context classification) rather than defaulting to a generic template.
