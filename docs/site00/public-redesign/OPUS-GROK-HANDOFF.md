# OPUS → GROK HANDOFF

**Sprint:** `P0.SITE00.PUBLIC-REDESIGN.OPUS-CONVERGENCE1`. Grok fabricates and injects assets. **Grok does not edit React, CSS or layout.** Page geometry is final: every slot below was measured in the live page at the authority frame.

## How injection works

1. Produce the asset at the **target pixels** listed (3× the measured CSS box), in the expected format.
2. Upload it to the SITE 00 asset bucket. Then register `slotId → url` in `PUBLIC_REDESIGN_ASSET_URLS` (`src/site00/authority/publicRedesignAssetSlots.ts`). That is the only code change, and it is a data entry.
3. `AssetSlot` swaps the neutral placeholder for an `<img>` (`object-fit` per the slot's crop behaviour) and sets `data-asset-status="injected"`. No layout changes.
4. Re-run the proof: `bash scripts/site00-cache-proof-fonts.sh && SITE00_AUTHORITY_PACK_DIR=… node scripts/site00-public-redesign-opus-proof.mjs --phase grok`, then compare with `after.png`.

## Absolute rules

- **No text** in any asset: no labels, no numbers, no UI, no logos with words. All copy is live DOM.
- **Never** crop, trace or reuse the authority screenshots. They are blueprints, not sources.
- **Don't redesign pages.** Don't move, resize or restyle panels, cards, machines or navigation.
- Transparent machine and illustration assets must align with the live SVG scaffold in the same box (same axis, same centre). The SVG stays mounted underneath, so the asset adds material, not a new silhouette.
- IDNTY machines are now **LIVE_CODE** (optional material pass only). The four silhouettes must stay distinct: orb, hex lattice, waveform, four-point star.
- Plates are full-bleed behind content. Keep the luminous white, red-signal, architectural family. No dark or cyberpunk treatment, no beauty or fashion drift.

## What NOT to touch

- Panels, cards, header, bottom nav, state numerals (00–03 are live SVG), the 00–03 rail, question controls and review rows.
- Origin's existing production plates (`resolveOriginBackgroundByViewport`) stay until `ENV.ORIGIN.*` is injected.
- The 16 routes still waiting for authority (`SONNET-ROUTE-AUTHORITY-MAP.md`).

## Slots

**47 Grok-required slots** (33 critical for fidelity) · **5 converted to LIVE_CODE** (optional material pass only).

| Slot | Kind | Target px | Transparent | Crop | Measured box (CSS px @ frame) | Critical |
|---|---|---|---|---|---|---|
| `ENV.ORIGIN.COLLAPSED` | IMAGE-LIKE (photographic environment plate) | 1170×2532 | no | cover | 390×693 at (0,0) @ 390x693 | YES |
| `ENV.ORIGIN.EXPANDED` | IMAGE-LIKE (photographic environment plate) | 1170×2532 | no | cover | 390×693 at (0,0) @ 390x693 | YES |
| `CARD.ORIGIN.IDNTY` | IMAGE-LIKE (vignette thumbnail) | 400×560 | no | cover | 110×114 at (17,465) @ 390x693 | YES |
| `CARD.ORIGIN.BLDR` | IMAGE-LIKE (vignette thumbnail) | 400×560 | no | cover | 110×114 at (140,465) @ 390x693 | YES |
| `CARD.ORIGIN.EVOLVE` | IMAGE-LIKE (vignette thumbnail) | 400×560 | no | cover | 110×114 at (263,465) @ 390x693 | YES |
| `ILLUSTRATION.ORIGIN.IDENTITY` | ILLUSTRATION (technical red-line / material render, transparent) | 560×560 | yes | contain | 112×112 at (217,230) @ 390x693 | — |
| `ILLUSTRATION.ORIGIN.BLDR` | ILLUSTRATION (technical red-line / material render, transparent) | 560×560 | yes | contain | 112×112 at (217,230) @ 390x693 | — |
| `ILLUSTRATION.ORIGIN.EVOLVE` | ILLUSTRATION (technical red-line / material render, transparent) | 560×560 | yes | contain | 112×112 at (217,230) @ 390x693 | — |
| `ILLUSTRATION.ORIGIN.EVOLVE_PATH.REFINE` | ILLUSTRATION (technical red-line / material render, transparent) | 400×400 | yes | contain | 80×80 at (35,444) @ 390x693 | — |
| `ILLUSTRATION.ORIGIN.EVOLVE_PATH.INSTALL` | ILLUSTRATION (technical red-line / material render, transparent) | 400×400 | yes | contain | 80×80 at (150,444) @ 390x693 | — |
| `ILLUSTRATION.ORIGIN.EVOLVE_PATH.TRANSFORM` | ILLUSTRATION (technical red-line / material render, transparent) | 400×400 | yes | contain | 80×80 at (258,444) @ 390x693 | — |
| `ENV.IDNTY.ATRIUM` | IMAGE-LIKE (photographic environment plate) | 1170×2532 | no | cover | 390×705 at (0,0) @ 390x693 | YES |
| `ENV.BLDR.COMMAND_CENTER` | IMAGE-LIKE (photographic environment plate) | 1170×2532 | no | cover | 390×708 at (0,0) @ 390x693 | YES |
| `MACHINE.BLDR.TOWER` | ILLUSTRATION (technical red-line / material render, transparent) | 760×900 | yes | contain | 190×260 at (130,50) @ 390x693 | YES |
| `CARD.BLDR.PATH.SITE` | IMAGE-LIKE (vignette thumbnail) | 400×360 | no | cover | 79×62 at (20,390) @ 390x693 | YES |
| `CARD.BLDR.PATH.WORLD` | IMAGE-LIKE (vignette thumbnail) | 400×360 | no | cover | 79×62 at (111,390) @ 390x693 | YES |
| `CARD.BLDR.PATH.SYSTEMS` | IMAGE-LIKE (vignette thumbnail) | 400×360 | no | cover | 79×62 at (201,390) @ 390x693 | YES |
| `CARD.BLDR.PATH.EXTENSIONS` | IMAGE-LIKE (vignette thumbnail) | 400×360 | no | cover | 79×62 at (292,390) @ 390x693 | YES |
| `ENV.BLDR.PATH.OVERVIEW` | IMAGE-LIKE (photographic environment plate) | 1170×1000 | no | cover | 390×332 at (0,0) @ 390x693 | YES |
| `ENV.BLDR.PATH.SITE` | IMAGE-LIKE (photographic environment plate) | 1170×1000 | no | cover | 390×319 at (0,0) @ 390x693 | YES |
| `ENV.BLDR.PATH.WORLD` | IMAGE-LIKE (photographic environment plate) | 1170×1000 | no | cover | 390×334 at (0,0) @ 390x693 | YES |
| `ENV.BLDR.PATH.SYSTEMS` | IMAGE-LIKE (photographic environment plate) | 1170×1000 | no | cover | 390×319 at (0,0) @ 390x693 | YES |
| `ENV.BLDR.PATH.EXTENSIONS` | IMAGE-LIKE (photographic environment plate) | 1170×1000 | no | cover | 390×326 at (0,0) @ 390x693 | YES |
| `ILLUSTRATION.BLDR.PATH.PANEL.OVERVIEW` | ILLUSTRATION (technical red-line / material render, transparent) | 420×420 | yes | contain | 100×90 at (204,271) @ 390x693 | — |
| `ILLUSTRATION.BLDR.PATH.PANEL.SITE` | ILLUSTRATION (technical red-line / material render, transparent) | 420×420 | yes | contain | 100×90 at (204,271) @ 390x693 | — |
| `ILLUSTRATION.BLDR.PATH.PANEL.WORLD` | ILLUSTRATION (technical red-line / material render, transparent) | 420×420 | yes | contain | 100×90 at (204,271) @ 390x693 | — |
| `ILLUSTRATION.BLDR.PATH.PANEL.SYSTEMS` | ILLUSTRATION (technical red-line / material render, transparent) | 420×420 | yes | contain | 100×90 at (204,271) @ 390x693 | — |
| `ILLUSTRATION.BLDR.PATH.PANEL.EXTENSIONS` | ILLUSTRATION (technical red-line / material render, transparent) | 420×420 | yes | contain | 100×90 at (204,271) @ 390x693 | — |
| `ENV.EVOLVE.INTERVENTION_CENTER` | IMAGE-LIKE (photographic environment plate) | 1170×2532 | no | cover | 390×703 at (0,0) @ 390x693 | YES |
| `MACHINE.EVOLVE.PROPERTY_TOWER` | ILLUSTRATION (technical red-line / material render, transparent) | 760×900 | yes | contain | 230×276 at (139,74) @ 390x693 | YES |
| `CARD.EVOLVE.PATH.REFINE` | IMAGE-LIKE (vignette thumbnail) | 400×360 | no | cover | 107×62 at (20,390) @ 390x693 | YES |
| `CARD.EVOLVE.PATH.INSTALL` | IMAGE-LIKE (vignette thumbnail) | 400×360 | no | cover | 107×62 at (141,390) @ 390x693 | YES |
| `CARD.EVOLVE.PATH.TRANSFORM` | IMAGE-LIKE (vignette thumbnail) | 400×360 | no | cover | 107×62 at (263,390) @ 390x693 | YES |
| `ENV.EVOLVE.PATH.REFINE` | IMAGE-LIKE (photographic environment plate) | 1170×1100 | no | cover | 390×319 at (0,0) @ 390x693 | YES |
| `ENV.EVOLVE.PATH.INSTALL` | IMAGE-LIKE (photographic environment plate) | 1170×1100 | no | cover | 390×319 at (0,0) @ 390x693 | YES |
| `ENV.EVOLVE.PATH.TRANSFORM` | IMAGE-LIKE (photographic environment plate) | 1170×1100 | no | cover | 390×322 at (0,0) @ 390x693 | YES |
| `ILLUSTRATION.EVOLVE.PATH.PANEL.REFINE` | ILLUSTRATION (technical red-line / material render, transparent) | 420×420 | yes | contain | 108×100 at (250,351) @ 390x693 | — |
| `ILLUSTRATION.EVOLVE.PATH.PANEL.INSTALL` | ILLUSTRATION (technical red-line / material render, transparent) | 420×420 | yes | contain | 108×100 at (250,351) @ 390x693 | — |
| `ILLUSTRATION.EVOLVE.PATH.PANEL.TRANSFORM` | ILLUSTRATION (technical red-line / material render, transparent) | 420×420 | yes | contain | 108×100 at (250,351) @ 390x693 | — |
| `ENV.LOCATIONS.ARCH` | IMAGE-LIKE (photographic environment plate) | 1170×2532 | no | cover | 390×986 at (0,0) @ 390x693 | YES |
| `CARD.LOCATIONS.BLDR` | IMAGE-LIKE (vignette thumbnail) | 520×300 | no | cover | 176×61 at (176,123) @ 390x693 | YES |
| `CARD.LOCATIONS.EVOLVE` | IMAGE-LIKE (vignette thumbnail) | 520×300 | no | cover | 176×61 at (176,194) @ 390x693 | YES |
| `CARD.LOCATIONS.SITES` | IMAGE-LIKE (vignette thumbnail) | 520×300 | no | cover | 176×61 at (176,265) @ 390x693 | YES |
| `CARD.LOCATIONS.SERVICES` | IMAGE-LIKE (vignette thumbnail) | 520×300 | no | cover | 176×61 at (176,336) @ 390x693 | YES |
| `CARD.LOCATIONS.SYSTEM` | IMAGE-LIKE (vignette thumbnail) | 520×300 | no | cover | 176×61 at (176,407) @ 390x693 | YES |
| `CARD.LOCATIONS.ABOUT` | IMAGE-LIKE (vignette thumbnail) | 520×300 | no | cover | 176×61 at (176,478) @ 390x693 | YES |
| `CARD.LOCATIONS.JOURNAL` | IMAGE-LIKE (vignette thumbnail) | 520×300 | no | cover | 176×61 at (176,549) @ 390x693 | YES |

## Slot briefs

### `ENV.ORIGIN.COLLAPSED`

- **Create:** DOUBLE-ZERO LANDMARK COURTYARD — COLLAPSED ORIGIN. EXISTING ORIGIN ENVIRONMENT ASSET STAYS MOUNTED UNTIL REPLACED.
- **Source authority:** `01_ORIGIN_MAIN`
- **Placement:** FULL-BLEED, BEHIND HEADER / HERO / CARDS
- **Measured box:** 390×693 CSS px at (0,0) on `01_ORIGIN_MAIN` (390x693); container radius `0px`
- **Target pixels:** 1170×2532 · aspect 9:19.5 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.ORIGIN.COLLAPSED`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `ENV.ORIGIN.EXPANDED`

- **Create:** DOUBLE-ZERO LANDMARK WITH WATERFALL SKYLINE — EXPANDED PANEL STATE (CLEAN, NO BAKED PANELS).
- **Source authority:** `02_ORIGIN_IDNTY_EXPANDED`, `03_ORIGIN_BLDR_EXPANDED`, `04_ORIGIN_EVOLVE_EXPANDED`
- **Placement:** FULL-BLEED; LOWER 2/3 IS COVERED BY THE GLASS PANEL
- **Measured box:** 390×693 CSS px at (0,0) on `02_ORIGIN_IDNTY_EXPANDED` (390x693); container radius `0px`
- **Target pixels:** 1170×2532 · aspect 9:19.5 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.ORIGIN.EXPANDED`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `CARD.ORIGIN.IDNTY`

- **Create:** IDNTY CARD ATRIUM VIGNETTE (TREE, WHITE ARCH).
- **Source authority:** `01_ORIGIN_MAIN`
- **Placement:** ORIGIN CARD 01 — FILLS CARD BACKGROUND
- **Measured box:** 110×114 CSS px at (17,465) on `01_ORIGIN_MAIN` (390x693); container radius `0px`
- **Target pixels:** 400×560 · aspect 400:560 · crop `cover` · mask: none (container radius clips)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.ORIGIN.IDNTY`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.ORIGIN.BLDR`

- **Create:** BLDR CARD STUDIO VIGNETTE (GLASS DISPLAY, PLINTH).
- **Source authority:** `01_ORIGIN_MAIN`
- **Placement:** ORIGIN CARD 02 — FILLS CARD BACKGROUND
- **Measured box:** 110×114 CSS px at (140,465) on `01_ORIGIN_MAIN` (390x693); container radius `0px`
- **Target pixels:** 400×560 · aspect 400:560 · crop `cover` · mask: none (container radius clips)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.ORIGIN.BLDR`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.ORIGIN.EVOLVE`

- **Create:** EVOLVE CARD LANDSCAPE VIGNETTE (CLIFF ROAD, SKYLINE).
- **Source authority:** `01_ORIGIN_MAIN`
- **Placement:** ORIGIN CARD 03 — FILLS CARD BACKGROUND
- **Measured box:** 110×114 CSS px at (263,465) on `01_ORIGIN_MAIN` (390x693); container radius `0px`
- **Target pixels:** 400×560 · aspect 400:560 · crop `cover` · mask: none (container radius clips)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.ORIGIN.EVOLVE`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `ILLUSTRATION.ORIGIN.IDENTITY`

- **Create:** RED-LINE FACIAL GEOMETRY WIREFRAME (IDENTITY PANEL HERO).
- **Source authority:** `02_ORIGIN_IDNTY_EXPANDED`
- **Placement:** EXPANDED IDENTITY PANEL — RIGHT OF TITLE
- **Measured box:** 112×112 CSS px at (217,230) on `02_ORIGIN_IDNTY_EXPANDED` (390x693); container radius `0px`
- **Target pixels:** 560×560 · aspect 560:560 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.ORIGIN.IDENTITY`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.ORIGIN.BLDR`

- **Create:** RED-LINE ISOMETRIC BUILD LATTICE (BUILDER PANEL HERO).
- **Source authority:** `03_ORIGIN_BLDR_EXPANDED`
- **Placement:** EXPANDED BUILDER PANEL — RIGHT OF TITLE
- **Measured box:** 112×112 CSS px at (217,230) on `03_ORIGIN_BLDR_EXPANDED` (390x693); container radius `0px`
- **Target pixels:** 560×560 · aspect 560:560 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.ORIGIN.BLDR`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.ORIGIN.EVOLVE`

- **Create:** RED-LINE EXPLODED PROPERTY LATTICE (EVOLVE PANEL HERO).
- **Source authority:** `04_ORIGIN_EVOLVE_EXPANDED`
- **Placement:** EXPANDED EVOLVE PANEL — RIGHT OF TITLE
- **Measured box:** 112×112 CSS px at (217,230) on `04_ORIGIN_EVOLVE_EXPANDED` (390x693); container radius `0px`
- **Target pixels:** 560×560 · aspect 560:560 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.ORIGIN.EVOLVE`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.ORIGIN.EVOLVE_PATH.REFINE`

- **Create:** REFINE PATH VIGNETTE (CONCENTRIC ORBIT).
- **Source authority:** `04_ORIGIN_EVOLVE_EXPANDED`
- **Placement:** EVOLVE PANEL — CHOOSE YOUR PATH COLUMN 01
- **Measured box:** 80×80 CSS px at (35,444) on `04_ORIGIN_EVOLVE_EXPANDED` (390x693); container radius `0px`
- **Target pixels:** 400×400 · aspect 400:400 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.ORIGIN.EVOLVE_PATH.REFINE`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.ORIGIN.EVOLVE_PATH.INSTALL`

- **Create:** INSTALL PATH VIGNETTE (LAYERED LATTICE).
- **Source authority:** `04_ORIGIN_EVOLVE_EXPANDED`
- **Placement:** EVOLVE PANEL — CHOOSE YOUR PATH COLUMN 02
- **Measured box:** 80×80 CSS px at (150,444) on `04_ORIGIN_EVOLVE_EXPANDED` (390x693); container radius `0px`
- **Target pixels:** 400×400 · aspect 400:400 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.ORIGIN.EVOLVE_PATH.INSTALL`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.ORIGIN.EVOLVE_PATH.TRANSFORM`

- **Create:** TRANSFORM PATH VIGNETTE (STAR + ORBITS).
- **Source authority:** `04_ORIGIN_EVOLVE_EXPANDED`
- **Placement:** EVOLVE PANEL — CHOOSE YOUR PATH COLUMN 03
- **Measured box:** 80×80 CSS px at (258,444) on `04_ORIGIN_EVOLVE_EXPANDED` (390x693); container radius `0px`
- **Target pixels:** 400×400 · aspect 400:400 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.ORIGIN.EVOLVE_PATH.TRANSFORM`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ENV.IDNTY.ATRIUM`

- **Create:** LUMINOUS WHITE ATRIUM — CIRCULAR DAIS, STEPS, PLANTERS, RING LIGHT. SHARED ACROSS EVERY IDNTY STATE AND STEP (CONTINUITY).
- **Source authority:** `01_IDNTY_DIAGNOSTIC_OVERVIEW`, `02_IDNTY_STATE_00_FOUNDATION`, `03_IDNTY_STATE_01_REFINE`, `04_IDNTY_STATE_02_EVOLUTION`, `05_IDNTY_STATE_03_BUILD_READY`, `01_FOUNDATION_PRIMARY_GOAL`, `02_FOUNDATION_AUDIENCE`, `03_FOUNDATION_TIMELINE`, `04_FOUNDATION_BUDGET`, `05_FOUNDATION_REVIEW`, `01_REFINE_EXISTING_ASSETS`, `02_REFINE_CONDITION`, `03_REFINE_GAPS`, `04_REFINE_REVIEW`, `01_EVOLUTION_AREAS`, `02_EVOLUTION_GOALS`, `03_EVOLUTION_TIMELINE`, `04_EVOLUTION_REVIEW`, `01_BUILD_READY_VERIFICATION`, `02_BUILD_READY_EVIDENCE`, `03_BUILD_READY_AUTHORITY_CHECK`, `04_BUILD_READY_REVIEW_VERIFICATION`
- **Placement:** FULL-BLEED BEHIND THE HERO + MACHINE; PANEL SITS OVER THE LOWER REGION
- **Measured box:** 390×705 CSS px at (0,0) on `01_IDNTY_DIAGNOSTIC_OVERVIEW` (390x693); container radius `0px`
- **Target pixels:** 1170×2532 · aspect 9:19.5 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.IDNTY.ATRIUM`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `ENV.BLDR.COMMAND_CENTER`

- **Create:** SAME WHITE ATRIUM FAMILY AS IDNTY, BUILD-DAIS VARIANT.
- **Source authority:** `01_BLDR_COMMAND_CENTER`
- **Placement:** FULL-BLEED BEHIND HERO + MACHINE
- **Measured box:** 390×708 CSS px at (0,0) on `01_BLDR_COMMAND_CENTER` (390x693); container radius `0px`
- **Target pixels:** 1170×2532 · aspect 9:19.5 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.BLDR.COMMAND_CENTER`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `MACHINE.BLDR.TOWER`

- **Create:** STACKED GLASS-SLAB ASSEMBLY TOWER WITH RED INSERTS AND FLOATING PATH PANELS.
- **Source authority:** `01_BLDR_COMMAND_CENTER`
- **Placement:** MACHINE STAGE CENTER, ABOVE DAIS
- **Measured box:** 190×260 CSS px at (130,50) on `01_BLDR_COMMAND_CENTER` (390x693); container radius `0px`
- **Target pixels:** 760×900 · aspect 760:900 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `MACHINE.BLDR.TOWER`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `CARD.BLDR.PATH.SITE`

- **Create:** SITE PATH CARD ILLUSTRATION (SKYLINE TOWERS WITH RED PLANES).
- **Source authority:** `01_BLDR_COMMAND_CENTER`
- **Placement:** COMMAND CENTER CARD 01 — TOP REGION
- **Measured box:** 79×62 CSS px at (20,390) on `01_BLDR_COMMAND_CENTER` (390x693); container radius `3px`
- **Target pixels:** 400×360 · aspect 400:360 · crop `cover` · mask: none (container radius clips)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.BLDR.PATH.SITE`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.BLDR.PATH.WORLD`

- **Create:** WORLD PATH CARD ILLUSTRATION (TERRACED PLATES WITH TREES).
- **Source authority:** `01_BLDR_COMMAND_CENTER`
- **Placement:** COMMAND CENTER CARD 02 — TOP REGION
- **Measured box:** 79×62 CSS px at (111,390) on `01_BLDR_COMMAND_CENTER` (390x693); container radius `3px`
- **Target pixels:** 400×360 · aspect 400:360 · crop `cover` · mask: none (container radius clips)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.BLDR.PATH.WORLD`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.BLDR.PATH.SYSTEMS`

- **Create:** SYSTEMS PATH CARD ILLUSTRATION (SERVER-RACK STACK).
- **Source authority:** `01_BLDR_COMMAND_CENTER`
- **Placement:** COMMAND CENTER CARD 03 — TOP REGION
- **Measured box:** 79×62 CSS px at (201,390) on `01_BLDR_COMMAND_CENTER` (390x693); container radius `3px`
- **Target pixels:** 400×360 · aspect 400:360 · crop `cover` · mask: none (container radius clips)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.BLDR.PATH.SYSTEMS`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.BLDR.PATH.EXTENSIONS`

- **Create:** EXTENSIONS PATH CARD ILLUSTRATION (FLOATING RED CUBES).
- **Source authority:** `01_BLDR_COMMAND_CENTER`
- **Placement:** COMMAND CENTER CARD 04 — TOP REGION
- **Measured box:** 79×62 CSS px at (292,390) on `01_BLDR_COMMAND_CENTER` (390x693); container radius `3px`
- **Target pixels:** 400×360 · aspect 400:360 · crop `cover` · mask: none (container radius clips)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.BLDR.PATH.EXTENSIONS`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `ENV.BLDR.PATH.OVERVIEW`

- **Create:** DAYLIGHT BUILDER ATRIUM — GLASS PATH PANELS OVER A ROUND TABLE.
- **Source authority:** `02_BLDR_OVERVIEW`
- **Placement:** UPPER 36% OF THE SCREEN; GLASS PANEL COVERS THE REST
- **Measured box:** 390×332 CSS px at (0,0) on `02_BLDR_OVERVIEW` (390x693); container radius `0px`
- **Target pixels:** 1170×1000 · aspect 1170:1000 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.BLDR.PATH.OVERVIEW`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `ENV.BLDR.PATH.SITE`

- **Create:** RED-INSERT GLASS BUILDING OVER A WHITE TERRACE.
- **Source authority:** `03_BLDR_SITE`
- **Placement:** UPPER 36% OF THE SCREEN
- **Measured box:** 390×319 CSS px at (0,0) on `03_BLDR_SITE` (390x693); container radius `0px`
- **Target pixels:** 1170×1000 · aspect 1170:1000 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.BLDR.PATH.SITE`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `ENV.BLDR.PATH.WORLD`

- **Create:** RED GLOBE WITH TERRACED PLATES AND WATERFALL BACKDROP.
- **Source authority:** `04_BLDR_WORLD`
- **Placement:** UPPER 36% OF THE SCREEN
- **Measured box:** 390×334 CSS px at (0,0) on `04_BLDR_WORLD` (390x693); container radius `0px`
- **Target pixels:** 1170×1000 · aspect 1170:1000 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.BLDR.PATH.WORLD`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `ENV.BLDR.PATH.SYSTEMS`

- **Create:** SERVER-STACK TOWER WITH SYSTEM ARCHITECTURE / FLOW PANELS.
- **Source authority:** `05_BLDR_SYSTEMS`
- **Placement:** UPPER 36% OF THE SCREEN
- **Measured box:** 390×319 CSS px at (0,0) on `05_BLDR_SYSTEMS` (390x693); container radius `0px`
- **Target pixels:** 1170×1000 · aspect 1170:1000 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.BLDR.PATH.SYSTEMS`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `ENV.BLDR.PATH.EXTENSIONS`

- **Create:** DISPLAY-CASE GALLERY WITH PLUG-IN / ADD-ON LIBRARY PANELS.
- **Source authority:** `06_BLDR_EXTENSIONS`
- **Placement:** UPPER 36% OF THE SCREEN
- **Measured box:** 390×326 CSS px at (0,0) on `06_BLDR_EXTENSIONS` (390x693); container radius `0px`
- **Target pixels:** 1170×1000 · aspect 1170:1000 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.BLDR.PATH.EXTENSIONS`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `ILLUSTRATION.BLDR.PATH.PANEL.OVERVIEW`

- **Create:** RED-LINE CUBE LATTICE (PANEL HEADER).
- **Source authority:** `02_BLDR_OVERVIEW`
- **Placement:** PANEL HEADER RIGHT
- **Measured box:** 100×90 CSS px at (204,271) on `02_BLDR_OVERVIEW` (390x693); container radius `0px`
- **Target pixels:** 420×420 · aspect 420:420 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.BLDR.PATH.PANEL.OVERVIEW`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.BLDR.PATH.PANEL.SITE`

- **Create:** RED-LINE BUILDING LATTICE (PANEL HEADER).
- **Source authority:** `03_BLDR_SITE`
- **Placement:** PANEL HEADER RIGHT
- **Measured box:** 100×90 CSS px at (204,271) on `03_BLDR_SITE` (390x693); container radius `0px`
- **Target pixels:** 420×420 · aspect 420:420 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.BLDR.PATH.PANEL.SITE`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.BLDR.PATH.PANEL.WORLD`

- **Create:** RED-LINE TERRACE LATTICE (PANEL HEADER).
- **Source authority:** `04_BLDR_WORLD`
- **Placement:** PANEL HEADER RIGHT
- **Measured box:** 100×90 CSS px at (204,271) on `04_BLDR_WORLD` (390x693); container radius `0px`
- **Target pixels:** 420×420 · aspect 420:420 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.BLDR.PATH.PANEL.WORLD`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.BLDR.PATH.PANEL.SYSTEMS`

- **Create:** RED-LINE SYSTEM-STACK LATTICE (PANEL HEADER).
- **Source authority:** `05_BLDR_SYSTEMS`
- **Placement:** PANEL HEADER RIGHT
- **Measured box:** 100×90 CSS px at (204,271) on `05_BLDR_SYSTEMS` (390x693); container radius `0px`
- **Target pixels:** 420×420 · aspect 420:420 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.BLDR.PATH.PANEL.SYSTEMS`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.BLDR.PATH.PANEL.EXTENSIONS`

- **Create:** RED-LINE LAYERED SLAB STACK (PANEL HEADER).
- **Source authority:** `06_BLDR_EXTENSIONS`
- **Placement:** PANEL HEADER RIGHT
- **Measured box:** 100×90 CSS px at (204,271) on `06_BLDR_EXTENSIONS` (390x693); container radius `0px`
- **Target pixels:** 420×420 · aspect 420:420 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.BLDR.PATH.PANEL.EXTENSIONS`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ENV.EVOLVE.INTERVENTION_CENTER`

- **Create:** WHITE ATRIUM WITH LAYERED GLASS PROPERTY UNDER INTERVENTION.
- **Source authority:** `01_EVOLVE_INTERVENTION_CENTER`
- **Placement:** FULL-BLEED BEHIND HERO + MACHINE
- **Measured box:** 390×703 CSS px at (0,0) on `01_EVOLVE_INTERVENTION_CENTER` (390x693); container radius `0px`
- **Target pixels:** 1170×2532 · aspect 9:19.5 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.EVOLVE.INTERVENTION_CENTER`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `MACHINE.EVOLVE.PROPERTY_TOWER`

- **Create:** THREE-LAYER GLASS PROPERTY (SURFACE / SYSTEM / FOUNDATION) WITH RED INTERVENTION BLOCKS.
- **Source authority:** `01_EVOLVE_INTERVENTION_CENTER`
- **Placement:** MACHINE STAGE CENTER
- **Measured box:** 230×276 CSS px at (139,74) on `01_EVOLVE_INTERVENTION_CENTER` (390x693); container radius `0px`
- **Target pixels:** 760×900 · aspect 760:900 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `MACHINE.EVOLVE.PROPERTY_TOWER`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `CARD.EVOLVE.PATH.REFINE`

- **Create:** REFINE PATH CARD ILLUSTRATION (HALF-RED ORBIT TARGET).
- **Source authority:** `01_EVOLVE_INTERVENTION_CENTER`
- **Placement:** PATH CARD 01 — TOP REGION
- **Measured box:** 107×62 CSS px at (20,390) on `01_EVOLVE_INTERVENTION_CENTER` (390x693); container radius `3px`
- **Target pixels:** 400×360 · aspect 400:360 · crop `cover` · mask: none (container radius clips)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.EVOLVE.PATH.REFINE`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.EVOLVE.PATH.INSTALL`

- **Create:** INSTALL PATH CARD ILLUSTRATION (RED-INSERT SLAB STACK).
- **Source authority:** `01_EVOLVE_INTERVENTION_CENTER`
- **Placement:** PATH CARD 02 — TOP REGION
- **Measured box:** 107×62 CSS px at (141,390) on `01_EVOLVE_INTERVENTION_CENTER` (390x693); container radius `3px`
- **Target pixels:** 400×360 · aspect 400:360 · crop `cover` · mask: none (container radius clips)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.EVOLVE.PATH.INSTALL`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.EVOLVE.PATH.TRANSFORM`

- **Create:** TRANSFORM PATH CARD ILLUSTRATION (EXPLODED CUBE ASSEMBLY).
- **Source authority:** `01_EVOLVE_INTERVENTION_CENTER`
- **Placement:** PATH CARD 03 — TOP REGION
- **Measured box:** 107×62 CSS px at (263,390) on `01_EVOLVE_INTERVENTION_CENTER` (390x693); container radius `3px`
- **Target pixels:** 400×360 · aspect 400:360 · crop `cover` · mask: none (container radius clips)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.EVOLVE.PATH.TRANSFORM`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `ENV.EVOLVE.PATH.REFINE`

- **Create:** CURRENT-STATE / TARGET-STATE PANELS AROUND A GLASS CUBE ON A DAIS.
- **Source authority:** `02_EVOLVE_REFINE`
- **Placement:** UPPER 45% OF THE SCREEN
- **Measured box:** 390×319 CSS px at (0,0) on `02_EVOLVE_REFINE` (390x693); container radius `0px`
- **Target pixels:** 1170×1100 · aspect 1170:1100 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.EVOLVE.PATH.REFINE`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `ENV.EVOLVE.PATH.INSTALL`

- **Create:** SYSTEM MODULES / INTEGRATION LAYERS AROUND A MACHINE STACK.
- **Source authority:** `03_EVOLVE_INSTALL`
- **Placement:** UPPER 45% OF THE SCREEN
- **Measured box:** 390×319 CSS px at (0,0) on `03_EVOLVE_INSTALL` (390x693); container radius `0px`
- **Target pixels:** 1170×1100 · aspect 1170:1100 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.EVOLVE.PATH.INSTALL`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `ENV.EVOLVE.PATH.TRANSFORM`

- **Create:** EXISTING / TRANSFORMED PANELS AROUND AN EXPLODED GLASS ASSEMBLY.
- **Source authority:** `04_EVOLVE_TRANSFORM`
- **Placement:** UPPER 45% OF THE SCREEN
- **Measured box:** 390×322 CSS px at (0,0) on `04_EVOLVE_TRANSFORM` (390x693); container radius `0px`
- **Target pixels:** 1170×1100 · aspect 1170:1100 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.EVOLVE.PATH.TRANSFORM`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `ILLUSTRATION.EVOLVE.PATH.PANEL.REFINE`

- **Create:** CONCENTRIC TARGET (PANEL HEADER).
- **Source authority:** `02_EVOLVE_REFINE`
- **Placement:** PANEL HEADER RIGHT
- **Measured box:** 108×100 CSS px at (250,351) on `02_EVOLVE_REFINE` (390x693); container radius `0px`
- **Target pixels:** 420×420 · aspect 420:420 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.EVOLVE.PATH.PANEL.REFINE`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.EVOLVE.PATH.PANEL.INSTALL`

- **Create:** LAYERED LATTICE (PANEL HEADER).
- **Source authority:** `03_EVOLVE_INSTALL`
- **Placement:** PANEL HEADER RIGHT
- **Measured box:** 108×100 CSS px at (250,351) on `03_EVOLVE_INSTALL` (390x693); container radius `0px`
- **Target pixels:** 420×420 · aspect 420:420 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.EVOLVE.PATH.PANEL.INSTALL`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ILLUSTRATION.EVOLVE.PATH.PANEL.TRANSFORM`

- **Create:** STAR + ORBITAL NET (PANEL HEADER).
- **Source authority:** `04_EVOLVE_TRANSFORM`
- **Placement:** PANEL HEADER RIGHT
- **Measured box:** 108×100 CSS px at (250,351) on `04_EVOLVE_TRANSFORM` (390x693); container radius `0px`
- **Target pixels:** 420×420 · aspect 420:420 · crop `contain` · mask: none (container radius clips)
- **Format:** PNG or WebP with alpha · transparency REQUIRED · image-like: no — illustration
- **Text:** absent · **Integration:** register URL for `ILLUSTRATION.EVOLVE.PATH.PANEL.TRANSFORM`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: LIVE SVG LINEWORK SCAFFOLD (CSS/SVG).

### `ENV.LOCATIONS.ARCH`

- **Create:** WARM MARBLE ARCHWAY CORRIDOR WITH LIGHT SHAFTS; DOUBLE-ZERO LANDMARK AT THE BASE.
- **Source authority:** `01_LOCATIONS_MAIN`
- **Placement:** FULL-BLEED BEHIND THE DIRECTORY
- **Measured box:** 390×986 CSS px at (0,0) on `01_LOCATIONS_MAIN` (390x693); container radius `0px`
- **Target pixels:** 1170×2532 · aspect 9:19.5 · crop `cover` · mask: none; wash gradient overlays lower 30%
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `ENV.LOCATIONS.ARCH`; renders inside the existing `AssetSlot` box (z-index 0 within its container); fallback stays: NEUTRAL LUMINOUS WHITE GRADIENT (CSS).

### `CARD.LOCATIONS.BLDR`

- **Create:** BLDR ROW — STUDIO WITH GLASS DISPLAY.
- **Source authority:** `01_LOCATIONS_MAIN`
- **Placement:** ROW RIGHT HALF
- **Measured box:** 176×61 CSS px at (176,123) on `01_LOCATIONS_MAIN` (390x693); container radius `0px`
- **Target pixels:** 520×300 · aspect 520:300 · crop `cover` · mask: CSS mask: left 0→30% transparent→opaque (row fade)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.LOCATIONS.BLDR`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.LOCATIONS.EVOLVE`

- **Create:** EVOLVE ROW — TERRACE WITH TREE AND SKYLINE.
- **Source authority:** `01_LOCATIONS_MAIN`
- **Placement:** ROW RIGHT HALF
- **Measured box:** 176×61 CSS px at (176,194) on `01_LOCATIONS_MAIN` (390x693); container radius `0px`
- **Target pixels:** 520×300 · aspect 520:300 · crop `cover` · mask: CSS mask: left 0→30% transparent→opaque (row fade)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.LOCATIONS.EVOLVE`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.LOCATIONS.SITES`

- **Create:** SITES ROW — CLIFFSIDE SPIRE CITY.
- **Source authority:** `01_LOCATIONS_MAIN`
- **Placement:** ROW RIGHT HALF
- **Measured box:** 176×61 CSS px at (176,265) on `01_LOCATIONS_MAIN` (390x693); container radius `0px`
- **Target pixels:** 520×300 · aspect 520:300 · crop `cover` · mask: CSS mask: left 0→30% transparent→opaque (row fade)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.LOCATIONS.SITES`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.LOCATIONS.SERVICES`

- **Create:** SERVICES ROW — SHOWROOM WITH DISPLAY.
- **Source authority:** `01_LOCATIONS_MAIN`
- **Placement:** ROW RIGHT HALF
- **Measured box:** 176×61 CSS px at (176,336) on `01_LOCATIONS_MAIN` (390x693); container radius `0px`
- **Target pixels:** 520×300 · aspect 520:300 · crop `cover` · mask: CSS mask: left 0→30% transparent→opaque (row fade)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.LOCATIONS.SERVICES`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.LOCATIONS.SYSTEM`

- **Create:** SYSTEM ROW — GLASS CYLINDER MACHINERY.
- **Source authority:** `01_LOCATIONS_MAIN`
- **Placement:** ROW RIGHT HALF
- **Measured box:** 176×61 CSS px at (176,407) on `01_LOCATIONS_MAIN` (390x693); container radius `0px`
- **Target pixels:** 520×300 · aspect 520:300 · crop `cover` · mask: CSS mask: left 0→30% transparent→opaque (row fade)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.LOCATIONS.SYSTEM`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.LOCATIONS.ABOUT`

- **Create:** ABOUT ROW — DOUBLE-ZERO WALL RELIEF WITH TREES.
- **Source authority:** `01_LOCATIONS_MAIN`
- **Placement:** ROW RIGHT HALF
- **Measured box:** 176×61 CSS px at (176,478) on `01_LOCATIONS_MAIN` (390x693); container radius `0px`
- **Target pixels:** 520×300 · aspect 520:300 · crop `cover` · mask: CSS mask: left 0→30% transparent→opaque (row fade)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.LOCATIONS.ABOUT`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

### `CARD.LOCATIONS.JOURNAL`

- **Create:** JOURNAL ROW — MOUNTAIN TERRACE WITH TABLE.
- **Source authority:** `01_LOCATIONS_MAIN`
- **Placement:** ROW RIGHT HALF
- **Measured box:** 176×61 CSS px at (176,549) on `01_LOCATIONS_MAIN` (390x693); container radius `0px`
- **Target pixels:** 520×300 · aspect 520:300 · crop `cover` · mask: CSS mask: left 0→30% transparent→opaque (row fade)
- **Format:** WebP/JPEG, sRGB, no alpha · transparency none · image-like: yes
- **Text:** absent · **Integration:** register URL for `CARD.LOCATIONS.JOURNAL`; renders inside the existing `AssetSlot` box (z-index 1 within its container); fallback stays: NEUTRAL WARM-WHITE GRADIENT (CSS).

## Converted to LIVE_CODE (no Grok asset required)

- `MACHINE.IDNTY.FOUNDATION.ORB` — GLOSSY RED SPHERE (OPTIONAL MATERIAL UPGRADE OVER THE SVG ORB). An optional transparent material overlay may be supplied at 1170×900, registered to the live SVG.
- `MACHINE.IDNTY.PARTIAL.LATTICE` — TRANSLUCENT RED HEX LATTICE VOLUME (OPTIONAL MATERIAL UPGRADE OVER THE SVG). An optional transparent material overlay may be supplied at 1170×900, registered to the live SVG.
- `MACHINE.IDNTY.EVOLUTION.WAVES` — CONCENTRIC ELLIPSE WAVEFORM (OPTIONAL MATERIAL UPGRADE OVER THE SVG). An optional transparent material overlay may be supplied at 1170×900, registered to the live SVG.
- `MACHINE.IDNTY.AUTHORITY.STAR` — GLOSSY RED FOUR-POINT STAR (OPTIONAL MATERIAL UPGRADE OVER THE SVG). An optional transparent material overlay may be supplied at 1170×900, registered to the live SVG.
- `ILLUSTRATION.BLDR.FRAMEWORK.STEP` — FIVE FRAMEWORK STEP ILLUSTRATIONS (ORBIT, LAYERS, RINGS, HEX, HELIX) — SHARED ACROSS PATHS. An optional transparent material overlay may be supplied at 240×240, registered to the live SVG.

## Unslotted art noticed during convergence (founder/Opus to slot before Grok fabricates)

- `02_BLDR_OVERVIEW` shows small path thumbnails inside THE BUILDER PATH columns. No slot exists, so the columns are text-only. Don't fabricate until a slot id is added.
- `02_REFINE_CONDITION` cards and `01_EVOLUTION_AREAS` cards use denser line illustrations in the authority. Live icons stand in today. Promote them to slots only if the founder wants the richer art.
