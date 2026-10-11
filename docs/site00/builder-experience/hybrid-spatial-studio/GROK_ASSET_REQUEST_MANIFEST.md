# Grok asset request manifest — Builder Hybrid Spatial Studio

**Sprints:**
- `…VISUAL-IMPLEMENTATION1` (first issue)
- `…APPROVED-VISUAL-IMPLEMENTATION-AND-FOUNDER-REVIEW1`
- `…OPUS-CREATIVE-FIDELITY-AND-INTERACTION-REFINEMENT1` (Creative Refinement 1)
- **Reference Fidelity 2** (this revision; see `REFERENCE_FIDELITY_2.md`)

**Status: requested, not generated.** Grok acts only when directed. Nothing in this manifest has been produced by Grok.

**Interim (Reference Fidelity 2).** Per the founder's reference-led hybrid direction ("recover existing assets first"), the studio now composites the live Build Object over **interim** plates and a reflection map derived from one recovered SITE 00 asset (see Discovery). They stand in for GA-05 and GA-01 until Grok delivers. The final briefs below are unchanged in intent.

The Build Object is a live three.js scene with procedural materials (`src/site00/builder-studio/buildObject/engine.ts`). Every room keeps reacting to the client's choices.

**Rules for every asset:**
- An asset feeds the live object, or covers what the live object cannot.
- No asset replaces the state-driven Build Object with a still.
- No asset is a flattened page background carrying UI.
- No asset carries text.
- No full-screen UI is requested as an image.

## Immersive Blueprint (no new asset request)

The interactive Blueprint sprint is built entirely from live geometry, materials and DOM annotation. It adds **no new Grok dependency**:
- the exploded layers, page homes, feature modules and staged assembly all come from live geometry;
- red illumination is a material state;
- markers and callouts are live text.

It still benefits from GA-05 and GA-01 like every room. Labels and interactions must never be baked into a plate.

## What changed in this revision

Reference Fidelity 2 samples the palette from the approved references themselves. Every asset below now specifies these values:

| Role | Value |
|---|---|
| Page | `#F5F3F3` (Blueprint reveal `#F3F1F2` → `#F8F6F7`) |
| Ink | `#0A0A0A` |
| Red | `#E50107` |
| Colour temperature | Near-neutral, faintly warm. Never the rejected beige (`#F2F0EC`), and not Creative Refinement 1's cool `#F4F4F6`. |

The brief fields follow the sprint's production-brief list, and each asset has a validation rule and a priority.

## Discovery: what exists, and why none of it is mounted

Searched:
- `public/site00/**`, `src/site00/assets/**`
- `docs/site00/public-redesign/GROK_ASSET_PACK/**`
- The design-pack plates
- The Supabase storage paths referenced by BLDR code

**Recovered and in use: 1** — the atrium render below, processed into interim plates and a reflection map by `scripts/site00/builder-studio-qa/build-env-plates.cjs`.

| Candidate | Size | Verdict |
|---|---|---|
| `public/site00/production-authority-assets/production-design-atrium-authority-v1.jpg` | 1920×823 | **In use as an interim source.** It has the right language: a luminous white atrium with a Carrara floor and glass columns. Only its lower storeys (glass balconies, polished floor) are cut, defocused and lifted into the reference background band. That gives five per-room plates (4–5 KB each) in `public/site00/builder-studio/env/{place,feel,work,pace,blueprint}.webp`. The whole image becomes the reflection map `atrium-reflection.webp` (21 KB). Its central red rod and ring ceiling are never used. Grok's GA-05 and GA-01 should still be produced *from* this language at full resolution. |
| `public/site00/production-hub/production/hub/chamber/atmosphere.webp` | 1296×2304 | **Style anchor only.** A hub chamber with a glowing red cylinder at its centre, which would read as a second object. |
| `docs/site00/public-redesign/GROK_ASSET_PACK/outputs/img-env-idnty-atrium-master.webp` | 1170×2532 | **Not suitable.** The IDNTY atrium is warm, with planting and a curved plinth. Wrong family and wrong temperature. |
| `public/site00/production-authority-assets/design-pack/plates/main-atrium.jpg` | 278×168 | **Unusable.** Thumbnail resolution. |
| `public/site00/project-tabs/staged/raster/plate-material-atmosphere.jpg` | 1280×720 | **Not suitable.** A project-tab material plate, not an architectural space. |
| Supabase BLDR icons (4) and loader `.mp4` | — | **Not fetchable** from this environment (the proxy blocks `*.supabase.co`). They are icons and a loader, not environments or materials. |

The approved reference images in `hybrid-spatial-studio/comparisons/` are **design authority, not assets**. They are not mounted, cropped into the UI, or used as backgrounds.

## Status legend

| Status | Meaning |
|---|---|
| **ASSET BLOCKED** | Essential for reference fidelity. The procedural stand-in visibly misses the reference (see the comparison sheets). |
| **ASSET PARTIAL** | The procedural stand-in is acceptable for review; the asset would refine it. |
| **DEFERRED** | Not needed until a later decision. |

Priority runs from **P1** (install first) to **P3**.

## Shared scene facts (all assets)

**Cameras.** Perspective, roughly a 35 mm feel. The renderer fits each room's camera to the composition bounds.

| Room | Azimuth | Elevation |
|---|---|---|
| PLACE | −30° | 9° |
| FEEL · MODERN | −16° | 6° |
| FEEL · BOLD | −26° | 9° |
| FEEL · EDITORIAL | −6° | 4° |
| FEEL · IMMERSIVE | −32° | 7° |
| WORK | −24° | 11° |
| PACE | −26° | 12° |
| BLUEPRINT | −24° | 13° |

**Light.** Soft, high daylight from the upper left (sun 2.45, hemisphere `#FFFFFF` / `#DDE1E7`). A cool fill from the right (`#F1F5FB`). Neutral tone mapping (exposure 0.94). No coloured light.

**Colour.**
- Page `#F5F3F3`, ink `#0A0A0A`, reference red `#E50107`. The floor comes from the plate (shadow-catcher floor in the scene).
- SITE 00 red `#E5231B`: acrylic `#E5141E` lit, `#B8170F` in shadow.
- Glass `#E4EBEE`.

**Colour temperature.** Near-neutral, faintly warm, as sampled from the references. **No beige.**

**FEEL palettes:**
| Direction | Materials |
|---|---|
| MODERN | concrete / glass / stone / red / glass / marble |
| BOLD | solid red ×3 / nero / glass / concrete |
| EDITORIAL | marble / glass / marble / red / glass / stone |
| IMMERSIVE | tinted glass / nero / red |

---

### GA-05 · Atmosphere plates ×5, one per room — **ASSET BLOCKED · P1** (interim plates installed)

| Field | Value |
|---|---|
| ID | `GA-05-{PLACE,FEEL,WORK,PACE,BLUEPRINT}` |
| Room | 01 PLACE · 02 FEEL · 03 WORK · 04 PACE · 05 BLUEPRINT |
| Purpose | The soft white architecture behind each reference object: the depth the procedural backdrop (pale columns + one faint red mass) only suggests |
| Visual reference | Approved room references (`comparisons/room{1..4}-…`, `blueprint-…`): upper background bands. Style anchor: `production-design-atrium-authority-v1.jpg`, without its central red rod and ring. |
| Composition | Out-of-focus colonnade and walls receding upper left to right. One distant red glass volume, upper right, ≤4% of the frame. No foreground object, no people, no floor horizon line in the centre band. |
| Dimensions | 3000×1000 desktop · 1500×500 mobile |
| Aspect | 3:1 |
| Surface | CSS layer behind the transparent canvas (`.bs-object__host`) |
| Camera | That room's camera above, long lens, strong depth-of-field blur (nothing sharp) |
| Lighting | As the shared scene: high upper-left daylight, cool fill |
| Colour temperature | Near-neutral, faintly warm. Whites `#E4E0DD`–`#FBF9F8` (the reference band). Contrast ≤ 14%. |
| Transparency | No (opaque, blends into `#F5F3F3` at all four edges) |
| Format | `.webp`, quality 78, ≤ 180 KB desktop / ≤ 70 KB mobile |
| Responsive crop | Safe centre band of 60% height; object occupies the centre third. Mobile crops the centre 1:1 for 390–430 px stages. |
| Destination | `public/site00/builder-studio/env/{place,feel,work,pace,blueprint}.webp` (replacing the interim plates in place; the studio CSS already points there) |
| Validation | Live capture at 390×844 and 1440×900. The Build Object stays the brightest-contrast element. Text over the stage stays ≥ 4.5:1. Edges show no seam against `#F5F3F3`. Nothing reads as a second object. Replaces the interim `env/*.webp` one for one. |

### GA-01 · White architectural atrium HDRI — **ASSET BLOCKED · P1** (interim reflection map installed)

| Field | Value |
|---|---|
| ID | `GA-01-ATRIUM` |
| Room | All five (scene environment) |
| Purpose | Real reflections on glass, steel and red acrylic, replacing the generic `RoomEnvironment` |
| Visual reference | `production-design-atrium-authority-v1.jpg` (language), approved room references (reflection character) |
| Composition | Interior gallery atrium: tall white walls, column rhythm, high clerestory light, no furniture, no red light sources |
| Dimensions | 2048×1024 desktop · 1024×512 mobile |
| Aspect | 2:1 equirectangular |
| Surface | `scene.environment` only, never visible |
| Camera | Equirectangular from object height (~1.2 m) |
| Lighting | Overcast daylight through upper-left clerestory; no hard sun patches |
| Colour temperature | Near-neutral; no red |
| Transparency | n/a |
| Format | `.hdr` (RGBE) 2K + 1K |
| Responsive crop | none (full sphere) |
| Destination | `public/site00/builder-studio/env/atrium-2k.hdr`, `atrium-1k.hdr` |
| Validation | Glass edges and red acrylic show soft window reflections. No colour cast on white marble (sample stays within ±2 of neutral). Load ≤ 400 KB on mobile. `RoomEnvironment` remains the fallback while loading. |

### GA-02 · Carrara marble PBR set — **ASSET BLOCKED · P2**

| Field | Value |
|---|---|
| ID | `GA-02-CARRARA` |
| Room | All: plinths and slabs (`marble`) |
| Purpose | The references' grey-veined white plinths. The procedural canvas veins read thinner and more regular. |
| Visual reference | Plinths in `room1`/`room4` references; floor of `production-design-atrium-authority-v1.jpg` |
| Composition | Flat tileable surface; veins of varied weight, diagonal drift, no repeating motif |
| Dimensions | 2048² desktop · 1024² mobile |
| Aspect | 1:1 seamless |
| Surface | `createMaterials().marble` map + roughness + normal |
| Camera | Orthographic top-down |
| Lighting | Unlit albedo (no baked light) |
| Colour temperature | Neutral. Ground `#D6D4D2`, bold angular veins `#2B2A2A`–`#5A5856` (the interim procedural texture matches this). |
| Transparency | No |
| Format | `.webp` albedo + roughness + normal (KTX2 optional) |
| Responsive crop | Seamless tile; no visible repeat at 3 m |
| Destination | `public/site00/builder-studio/materials/marble-carrara/` |
| Validation | Side-by-side with the reference plinth at 390×844. Total set ≤ 600 KB desktop / ≤ 220 KB mobile. The procedural canvas stays the fallback. |

### GA-06 · Scale figures — **ASSET PARTIAL · P2**

| Field | Value |
|---|---|
| ID | `GA-06-FIGURES` |
| Room | All compositions |
| Purpose | Replace the procedural capsule figures with the references' standing silhouettes |
| Visual reference | Figure pairs in the `room2` (FEEL) and `blueprint` references |
| Composition | Two standing adults, neutral pose, origin at feet, 1.75 m |
| Dimensions | 300–600 tris each |
| Aspect | n/a |
| Surface | In-scene meshes (`figure` material) |
| Camera / Lighting | Scene camera and light |
| Colour temperature | Matte graphite `#2C2E32`, no texture |
| Transparency | n/a |
| Format | `.glb` (Draco) |
| Responsive crop | n/a |
| Destination | `public/site00/builder-studio/models/figures.glb` |
| Validation | Reads as scale, never as a character. ≤ 60 KB. Shadow-casting unchanged. |

### GA-03 · Nero marquina PBR set — **ASSET PARTIAL · P3**

| Field | Value |
|---|---|
| ID | `GA-03-NERO` |
| Room | 02 FEEL (BOLD mass, IMMERSIVE floor and runner) |
| Purpose | The dark veined stone in the FEEL references |
| Visual reference | Dark slabs in the `room2` reference thumbnails |
| Composition | Tileable; near-black marble with fine white veins |
| Dimensions / Aspect | 1024² · 1:1 seamless |
| Surface | `createMaterials().darkMarble` |
| Camera / Lighting | Orthographic · unlit |
| Colour temperature | Cool. Ground `#1C1E21`, veins `#E4E6E8`. |
| Transparency / Format | No · `.webp` set |
| Responsive crop | Seamless |
| Destination | `public/site00/builder-studio/materials/marble-nero/` |
| Validation | IMMERSIVE and BOLD captures. ≤ 200 KB set. |

### GA-04 · Fine concrete + pale stone PBR sets — **ASSET PARTIAL · P3**

| Field | Value |
|---|---|
| ID | `GA-04-CONCRETE`, `GA-04-STONE` |
| Room | All (`concrete`, `stone`, `travertine`) |
| Purpose | Walls and slabs. MODERN's first plate and BOLD's mass. |
| Visual reference | Grey plates in the `room2` reference |
| Composition | Tileable; fine-grain concrete with faint form lines; pale cool stone |
| Dimensions / Aspect | 1024² · 1:1 seamless |
| Surface | `createMaterials().concrete / .stone / .travertine` |
| Camera / Lighting | Orthographic · unlit |
| Colour temperature | Cool. Concrete `#C8CACD`, stone `#DADCDF`. **No warm limestone.** |
| Transparency / Format | No · `.webp` set |
| Responsive crop | Seamless |
| Destination | `…/materials/concrete/`, `…/materials/stone/` |
| Validation | FEEL MODERN / BOLD captures. ≤ 200 KB per set. |

### GA-08 · Red acrylic micro-surface — **ASSET PARTIAL · P3**

| Field | Value |
|---|---|
| ID | `GA-08-ACRYLIC` |
| Room | All red elements (`red`, `redSolid`) |
| Purpose | Subtle edge glow and internal depth on the red cores and modules |
| Visual reference | Red glass in every reference |
| Composition | Tileable micro-surface; polished acrylic |
| Dimensions / Aspect | 512² · 1:1 seamless |
| Surface | Roughness + normal on the red materials |
| Camera / Lighting | Orthographic · unlit |
| Colour temperature | n/a (no colour map; the colour stays `#E5141E`) |
| Transparency / Format | No · `.webp` roughness + normal |
| Responsive crop | Seamless |
| Destination | `public/site00/builder-studio/materials/acrylic-red/` |
| Validation | Red hue unchanged (ΔE < 2 against the current render). ≤ 80 KB. |

### GA-07 · Path stills (SIMPLE · ADVANCED · CUSTOM · WORLD) — **ASSET PARTIAL · P3**

| Field | Value |
|---|---|
| ID | `GA-07-{SIMPLE,ADVANCED,CUSTOM,WORLD}` |
| Room | 01 PLACE |
| Purpose | Fallback when WebGL is unavailable; social preview |
| Visual reference | `creative-refinement-qa/matrix/place-*.png` (the live compositions) |
| Composition | Exactly the PLACE compositions in `buildObject/composition.ts`, MODERN palette |
| Dimensions | 1600×1000 |
| Aspect | 8:5 |
| Surface | `<img>` inside `.bs-stage` only when WebGL fails |
| Camera | PLACE camera (az −30°, el 9°) |
| Lighting / Colour temperature | Shared scene · cool neutral |
| Transparency | Object on alpha |
| Format | `.webp` with alpha |
| Responsive crop | Object centred with a 10% margin |
| Destination | `public/site00/builder-studio/stills/place-{simple,advanced,custom,world}.webp` |
| Validation | Never shown where WebGL works (forced-WebGL-off capture only) |

### GA-09 · AR export (per Blueprint) — **DEFERRED**

| Field | Value |
|---|---|
| ID | `GA-09-AR` |
| Room | 05 BLUEPRINT |
| Purpose | The reference's AR control |
| What it is | Not an image: an export pipeline `BuildComposition` → `.glb` + `.usdz` |
| Remaining fields | n/a until the founder and Composer decide on AR (the Build Object data contract has no AR field) |
| Validation | No inert AR button ships before this exists. None ships today. |

## Founder review surfaces

The founder Blueprint review uses the same live Build Object (`BuildThumbnail`) for each submitted version. **No separate asset is requested for it.**

## Injection notes (for whoever installs an approved asset)

- **GA-01:** `RGBELoader` → `PMREMGenerator.fromEquirectangular` → `scene.environment` in `buildStage()`.
- **GA-02 to GA-04 and GA-08:** load the textures into `createMaterials()`, keeping the procedural canvases as the loading fallback.
- **GA-05:** a CSS layer behind the transparent canvas (preferred), or a far plane with `fog: false`.
- **Mobile budget:** every asset has a mobile size, and the page must stay usable while assets load. Test on a real phone before enabling. The three.js chunk is already lazy (530 kB / 133 kB gzip).
- **Do not claim fidelity** until the P1 assets are installed and recaptured against the references.
