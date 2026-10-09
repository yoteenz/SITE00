# Grok asset request manifest — Digital Foundation client (Board 01 + Board 02)

**Sprint:** `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V1-OPUS-CLIENT-ENTRY-INTAKE-COMMERCE-VISUAL-IMPLEMENTATION1`
**Status:** requested, **not generated**. Grok acts only when directed. The founder approves each asset before it is used.
**Authority:** the approved Board 01 / Board 02 references and the audit's asset families DF-A01..A05 (`SITE00_DIGITAL_FOUNDATION_EXPERIENCE_AUTHORITY_BLUEPRINT_V1.md` §05).

## Why these assets are needed

No asset in the repo matches the Digital Foundation architecture. The IDNTY Grok outputs (orb, lattice, star, atrium) and the dark red-geometry renders show a different language.

Until these renders exist, the client renders crisp **vector stand-ins** of the same architecture (`src/site00/foundation-client/objects.tsx`):

- white chamber
- glass Foundation Plate with the etched "01 DIGITAL FOUNDATION"
- red translucent threshold plates
- stone plinth
- red glass crown columns
- corner fragment

The stand-ins are reviewable, but they read as illustration, not as the photoreal architecture on the boards. That gap is the largest visual mismatch in this sprint.

**Integration is already built.** Set each delivered path in `DF_ARCHITECTURE_RENDERS` (`objects.tsx`). The slot then swaps the vector for the raster with no layout change. Every slot is decorative: `aria-hidden`, and never carries client data.

## Status legend

| Status | Meaning |
|---|---|
| **ASSET BLOCKED** | Essential for reference fidelity. The vector stand-in visibly misses the reference |
| **ASSET PARTIAL** | The stand-in is acceptable for review; the asset refines it |
| **DEFERRED** | Not needed until a later board |

## Shared facts (all assets)

| Fact | Value |
|---|---|
| Palette | Warm white page `#F3F2EF`. Ink `#0C0C0C`. SITE 00 red `#D3121B`: translucent acrylic reads `#F04A50` lit and `#A80C13` in shadow |
| Materials | Clear low-iron glass with white edge highlights. Translucent red acrylic plates. Honed white Carrara with grey veining. Matte white plaster walls |
| Light | Soft overcast daylight from upper right. Faint warm floor bounce. No coloured light except what passes through the red acrylic |
| Camera | Eye level slightly above the plinth. ~35 mm feel. Gentle two-point perspective, as on the boards |
| Never include | Phone frames · device status bars · people · logos other than the etched plate text · client names · dark backgrounds · gradients as decoration · serif type · new metaphors (orbs, stars, lattices) |
| Motion | Stills only. The UI handles reduced motion. No video is requested |
| Delivery | `.webp` (quality 82) + `.png` master. Alpha where stated. Destination `public/site00/idnty/digital-foundation/` |

---

### DF-G01 · Threshold chamber hero (P01) — **ASSET BLOCKED**

| Field | Value |
|---|---|
| Family | DF-A01 |
| Parent | P01 FOUNDATION ENTRY (`IDNTY / 001`) |
| Purpose | The first impression: the client's foundation as an object being set into place |
| Geometry | White chamber with plaster walls on the left and right, and a pale stone floor. A low Carrara plinth runs left to right with a step down at the right. On the plinth, left of centre, sits a large clear glass cube (the Foundation Plate). Behind and through its right side rise two tall red translucent acrylic slabs: one tall, one shorter in front. A third thin red plate is visible through the glass |
| Etching | Left face of the cube: "01" (condensed numerals) over "DIGITAL / FOUNDATION" (tracked caps), lightly frosted. No other text |
| Lighting | Upper-right daylight. Red light spills onto the plinth top under the slabs |
| Composition | The object fills the lower 70%. The upper-left quarter stays calm and light, because the lede sits above it on mobile |
| Dimensions | Mobile 1170×954 (slot 390×318 @3x). Desktop 1600×1800 (slot ~568×640 @2.8x) |
| Transparency | None. Full-bleed chamber; the UI fades the top edge |
| Crops | Mobile: centred on the cube and slabs, slab tops ~10% below the frame. Desktop: same scene, taller, more floor |
| Destination | `…/df-hero-mobile.webp`, `…/df-hero-desktop.webp` |
| Usage | `DF_ARCHITECTURE_RENDERS.hero`. P01 only |

### DF-G02 · Crown architecture — Recommendation (P04) — **ASSET BLOCKED**

| Field | Value |
|---|---|
| Family | DF-A02, variant STANDARD |
| Parent | P04 RECOMMENDATION |
| Purpose | Architectural crown at the top right, behind the headline |
| Geometry | Stacked concrete/marble blocks, cropped by the right edge. One tall red translucent column at the centre-right. White glass panes in front with edge highlights |
| Composition | Mass on the right 55%. The left 35% fades to the page colour so the headline stays legible. The bottom 40% fades out so the lede and lists stay clean |
| Dimensions | Mobile 690×1020 (slot ~230×340 @3x). Desktop 1560×2100 |
| Transparency | **Alpha** on the left and bottom fades (no baked page colour) |
| Destination | `…/df-crown-p04.webp` |
| Usage | `DF_ARCHITECTURE_RENDERS.crown`. Also P05 and P06 until G03 and G04 exist |

### DF-G03 · Crown architecture — Review + Checkout (P05) — **ASSET PARTIAL**

| Field | Value |
|---|---|
| Family | DF-A02 variant |
| Difference from G02 | Red column with an angled top, plus a smaller lower red plate in front of the column's left edge, as on the P05 board |
| Other fields | As G02 |
| Destination | `…/df-crown-p05.webp` |

### DF-G04 · Crown architecture — Activation (P06) — **ASSET PARTIAL**

| Field | Value |
|---|---|
| Family | DF-A02 variant |
| Difference from G02 | Taller red column with a second, shorter red block to its right, reading as "complete and standing" |
| Other fields | As G02 |
| Destination | `…/df-crown-p06.webp` |

### DF-G05 · Corner fragment (P02 onward) — **ASSET PARTIAL**

| Field | Value |
|---|---|
| Family | DF-A03 |
| Parents | P02–P06 and the interim overview, at the bottom-right corner behind the footer code |
| Geometry | A red translucent prism with a lit top and a darker side face. A small shorter red plate to its right. Pale glass and stone shards to the left |
| Composition | Red mass in the right 45%. The left fades to transparent. It must not obscure the `IDNTY / 00N` footer code: keep the top-left 60% light |
| Dimensions | 360×270 (slot 112×84 @3x). Desktop 720×540 |
| Transparency | **Alpha** |
| Destination | `…/df-corner.webp` |
| Usage | `DF_ARCHITECTURE_RENDERS.corner` |

### DF-G06 · Hero still for reduced motion / social — **DEFERRED**

There is no animation in Board 01/02, so no separate still is needed. Revisit with P11's completion burst (Board 04).

---

## Hand-off checklist for Grok

1. Generate G01 and G02 first (blocked). G03–G05 refine.
2. Match the shared palette and materials. Compare each render beside the board crop before delivery.
3. Deliver to `public/site00/idnty/digital-foundation/`. Opus wires the paths into `DF_ARCHITECTURE_RENDERS` and re-runs `scripts/site00/df-client-qa/df-client-responsive.cjs` for side-by-side review.
4. Founder approves. No asset ships without approval.
