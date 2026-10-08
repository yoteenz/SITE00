# Grok asset request manifest — Builder Hybrid Spatial Studio

**Sprints:** `…VISUAL-IMPLEMENTATION1` (first issue) · `…APPROVED-VISUAL-IMPLEMENTATION-AND-FOUNDER-REVIEW1` (this revision)
**Status:** requested, **not generated**. Grok acts only when directed. No asset in the repo matches the approved language (clear glass, translucent red acrylic, white Carrara plinths, white architectural space). The Build Object is a live three.js scene with procedural materials (`src/site00/builder-studio/buildObject/engine.ts`).

**Rule for every asset:** an asset feeds the live object or covers what the live object cannot. **No asset replaces the state-driven Build Object with a still.** Every room keeps reacting to the client's choices.

## Status legend

| Status | Meaning |
|---|---|
| **ASSET BLOCKED** | Essential for reference fidelity. The procedural stand-in visibly misses the reference. |
| **ASSET PARTIAL** | The procedural stand-in is acceptable for review, and the asset would refine it. |
| **DEFERRED** | Not needed until a later decision. |

## Shared scene facts (all assets)

| Fact | Value |
|---|---|
| Room cameras | Fitted to the composition bounds. PLACE az −30° / el 8° · FEEL az −14° / el 5° · WORK az −32° / el 13° · PACE az −26° / el 12° · BLUEPRINT az −24° / el 13°. Perspective, ~35 mm feel. |
| Light | Soft daylight from upper left. Faint warm floor bounce. Neutral tone mapping. No coloured light. |
| Colour | Warm white page `#F2F0EC`. Ink `#0C0C0C`. SITE 00 red `#D8121F` (acrylic reads `#E5222A` lit, `#B70C17` in shadow). |
| FEEL palettes | MODERN (glass / red / stone / marble) · BOLD (tinted glass / solid red / concrete) · EDITORIAL (glass / red / marble) · IMMERSIVE (dark glass / red / nero marble) |

---

### GA-01 · White architectural atrium HDRI — **ASSET BLOCKED**

| Field | Value |
|---|---|
| Source | Grok (render or synthesis), founder-approved before use |
| Room | All five (scene environment) |
| Purpose | Real reflections on glass and red acrylic, replacing the generic `RoomEnvironment` |
| Geometry | Interior gallery atrium: tall white walls, column rhythm, high clerestory light, no furniture |
| Materials | Matte white plaster, pale stone floor |
| Lighting | Overcast daylight through upper-left clerestory. Soft, no hard sun patches. |
| Colour | Neutral white (D65); faint warm floor bounce. No red. No people. |
| Camera | Equirectangular from object height (~1.2 m) |
| Dimensions | 2048×1024 (desktop), 1024×512 (mobile) |
| Aspect | 2:1 |
| Transparency | n/a |
| Crops | none (full sphere) |
| Format | `.hdr` (RGBE), plus a 1K version |
| Destination | `public/site00/builder-studio/env/atrium-2k.hdr`, `atrium-1k.hdr` |
| Usage rules | Environment only; never shown as a background. `environmentIntensity` 0.5–0.7. Keep the procedural `RoomEnvironment` as the fallback while loading. |

### GA-02 · Carrara marble PBR set — **ASSET BLOCKED**

| Field | Value |
|---|---|
| Source | Grok texture synthesis |
| Room | All (plinths and slabs, material `marble`) |
| Purpose | The references' grey-veined white plinths |
| Geometry | Flat tileable surface |
| Materials | Polished-honed Carrara: white ground, grey veins of varied weight |
| Lighting | Flat, unlit albedo (no baked light) |
| Colour | Ground `#F4F3F0`; veins `#9A9893`–`#5E5C59` |
| Camera | Orthographic top-down |
| Dimensions | 2048² (desktop), 1024² (mobile) |
| Aspect | 1:1, seamless |
| Transparency | no |
| Crops | Seamless tile, with no visible repeat at 3 m |
| Format | `.webp` albedo + roughness + normal |
| Destination | `public/site00/builder-studio/materials/marble-carrara/` |
| Usage rules | Swap into `createMaterials()`; the procedural canvas stays the fallback. |

### GA-03 · Nero marquina PBR set — **ASSET PARTIAL**

| Field | Value |
|---|---|
| Source / Room / Purpose | Grok · 02 FEEL (IMMERSIVE study), blueprint mass · the dark veined stone in the FEEL reference |
| Geometry / Materials | Tileable; near-black marble with white veins |
| Lighting / Colour | Unlit albedo · ground `#141414`, veins `#E6E4E0` |
| Camera / Dimensions / Aspect | Orthographic · 1024² · 1:1 seamless |
| Transparency / Crops / Format | no · seamless · `.webp` set |
| Destination | `public/site00/builder-studio/materials/marble-nero/` |
| Usage rules | IMMERSIVE palette (`darkMarble`) only |

### GA-04 · Board-formed concrete + pale limestone PBR sets — **ASSET PARTIAL**

| Field | Value |
|---|---|
| Source / Room / Purpose | Grok · all (`stone`, `concrete`) · walls and floor slabs |
| Geometry / Materials | Tileable; fine-grain concrete with faint board marks; pale limestone |
| Lighting / Colour | Unlit · concrete `#C9C6C1`, limestone `#E7E2D8` |
| Camera / Dimensions / Aspect | Orthographic · 1024² · 1:1 seamless |
| Transparency / Crops / Format | no · seamless · `.webp` set |
| Destination | `…/materials/concrete/`, `…/materials/limestone/` |
| Usage rules | Swap in `createMaterials()` with the procedural fallback |

### GA-05 · Atmosphere plates ×5 (one per room) — **ASSET BLOCKED**

| Field | Value |
|---|---|
| Source | Grok render, matched to each reference room |
| Room | 01 PLACE · 02 FEEL · 03 WORK · 04 PACE · 05 BLUEPRINT |
| Purpose | The soft white architecture and the distant red glass mass behind each reference object |
| Geometry | Out-of-focus colonnade and walls. One distant red glass volume, upper right. No foreground object. |
| Materials | White plaster, glass, red acrylic |
| Lighting | Same as GA-01 |
| Colour | Very low contrast; red only in the distant mass |
| Camera | That room's camera above, with a long-lens depth-of-field blur |
| Dimensions | 3000×1000 (desktop), 1500×500 (mobile) |
| Aspect | 3:1 |
| Transparency | no |
| Crops | Safe centre band of 60% height. The object occupies the centre third. |
| Format | `.webp` |
| Destination | `public/site00/builder-studio/backdrops/{place,feel,work,pace,blueprint}.webp` |
| Usage rules | CSS layer behind a transparent canvas, or a far plane with `fog: false`. Never carries text or UI. |

### GA-06 · Scale figures — **ASSET PARTIAL**

| Field | Value |
|---|---|
| Source / Room / Purpose | Grok model · all compositions · replace the procedural capsule figures |
| Geometry | Two standing adults, neutral pose, 300–600 tris each, origin at feet, 1.75 m |
| Materials / Lighting / Colour | Matte dark grey `#2B2B2B`, no texture · scene light · single colour |
| Camera / Dimensions / Aspect | n/a · n/a · n/a |
| Transparency / Crops / Format | n/a · n/a · `.glb` |
| Destination | `public/site00/builder-studio/models/figures.glb` |
| Usage rules | Scale only; never a character |

### GA-07 · Path stills (SIMPLE · ADVANCED · CUSTOM · WORLD) — **ASSET PARTIAL**

| Field | Value |
|---|---|
| Source / Room / Purpose | Grok photoreal render of `compose('place', …)` · 01 PLACE · fallback when WebGL is unavailable, and social preview |
| Geometry / Materials | Exactly the PLACE compositions in `buildObject/composition.ts`, MODERN palette |
| Lighting / Colour / Camera | GA-01 light · shared colours · PLACE camera (az −30°, el 8°) |
| Dimensions / Aspect | 1600×1000 · 8:5 |
| Transparency / Crops | Object on alpha · object centred with a 10% margin |
| Format / Destination | `.webp` · `public/site00/builder-studio/stills/place-{simple,advanced,custom,world}.webp` |
| Usage rules | Only when WebGL is unavailable. Never replaces the live object where WebGL works. |

### GA-08 · Red acrylic micro-surface — **ASSET PARTIAL**

| Field | Value |
|---|---|
| Source / Room / Purpose | Grok · all red elements (`red`, `redSolid`) · subtle edge glow and internal depth |
| Geometry / Materials | Tileable micro-surface; polished acrylic |
| Lighting / Colour | Unlit · n/a (roughness and normal only) |
| Camera / Dimensions / Aspect | Orthographic · 512² · 1:1 seamless |
| Transparency / Crops / Format | no · seamless · `.webp` roughness + normal |
| Destination | `public/site00/builder-studio/materials/acrylic-red/` |
| Usage rules | Very subtle; the colour stays `#D8121F` |

### GA-09 · AR export (per Blueprint) — **DEFERRED**

| Field | Value |
|---|---|
| Source / Room / Purpose | Not an image: an export pipeline `BuildComposition` → `.glb` + `.usdz` · 05 BLUEPRINT · the reference's AR control |
| Remaining fields | n/a until founder and Composer decide on AR (the Build Object data contract has no AR field) |
| Destination / Usage rules | — · No inert AR button ships before this exists |

## Founder review surfaces

The founder Blueprint review uses the same live Build Object (`BuildThumbnail`) for each submitted version. **No separate asset is requested for it.**

## Injection notes

- **GA-01:** `RGBELoader` → `PMREMGenerator.fromEquirectangular` → `scene.environment` in `buildStage()`.
- **GA-02 to GA-04 and GA-08:** load textures into `createMaterials()`, keeping the procedural canvases as the loading fallback.
- **GA-05:** a CSS layer behind a transparent canvas (preferred), or a far plane.
- **Mobile budget:** every asset needs a mobile size, and the page must stay usable while assets load. The three.js chunk is already lazy (530 kB / 133 kB gzip).
