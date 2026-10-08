# Grok asset request manifest — Builder Hybrid Spatial Studio

**Sprint:** `P0.SITE00.BUILDER.HYBRID-SPATIAL-STUDIO.V1-OPUS-APPROVED-EXPERIENCE-DESIGN-AND-VISUAL-IMPLEMENTATION1`
**Status:** requested, not generated. Grok acts only when directed.

## Why these assets

No asset in the repo matches the approved architectural language: clear glass, translucent red acrylic, white marble plinths, white architectural space. The closest families (`public/site00/production-authority-assets/production-library-red-geometry-*`, `docs/site00/public-redesign/GROK_ASSET_PACK/*BLDR*`) use crystals, pyramids, dark scenes or organic red-striped interiors.

The Build Object is therefore a real-time three.js scene with **procedural** materials (`src/site00/builder-studio/buildObject/engine.ts`). That keeps it state-driven, but it cannot reach the photoreal reflections and stone of the references.

None of the assets below replaces the live object with a still. Each one feeds the live object, or covers a gap the live object cannot.

## Requests

| ID | Asset | Target | Purpose | Visual requirements | Size / ratio | Transparency | Format | Destination | Priority |
|---|---|---|---|---|---|---|---|---|---|
| **GA-01** | White architectural atrium HDRI | All five screens (scene environment) | Real reflections on glass and red acrylic, replacing the generic `RoomEnvironment` | White gallery atrium, soft daylight from top-left, faint warm floor bounce, no colour casts, no people, no red | 2048×1024 equirect | n/a | `.hdr` (RGBE) + 1K `.hdr` for mobile | `public/site00/builder-studio/env/atrium-2k.hdr`, `atrium-1k.hdr` | **P1** |
| **GA-02** | Carrara marble PBR set | Plinths and slabs (`marble`) | Replace the procedural marble with the references' grey-veined white marble | Seamless, white ground, grey veins of varied weight, no repeats visible at 3 m, matte-polished | 2048² (1024² mobile) | No | `.webp` albedo + roughness + normal | `public/site00/builder-studio/materials/marble-carrara/` | **P1** |
| **GA-03** | Nero marquina PBR set | FEEL study, IMMERSIVE direction (`darkMarble`) | The dark veined stone in the FEEL reference | Seamless, near-black ground, white veins | 1024² | No | `.webp` set | `…/materials/marble-nero/` | P2 |
| **GA-04** | Concrete + light stone PBR sets | Walls, floor slabs (`stone`, `concrete`) | Board-formed concrete and pale limestone | Seamless, fine grain, no stains | 1024² | No | `.webp` set | `…/materials/concrete/`, `…/materials/limestone/` | P2 |
| **GA-05** | Background atmosphere plates (×5) | Behind the object, one per room | The soft white architecture and distant red glass behind each reference object | Out of focus, very low contrast, white columns, one distant red glass mass upper right, matching each room's reference | 3000×1000 (3:1) | No | `.webp` | `public/site00/builder-studio/backdrops/{place,feel,work,pace,blueprint}.webp` | P2 |
| **GA-06** | Scale figures | All compositions | Replace the procedural capsule figures | Two standing adults, dark grey matte, 300–600 tris each, origin at feet, 1.75 m | n/a | n/a | `.glb` | `public/site00/builder-studio/models/figures.glb` | P3 |
| **GA-07** | Path still renders (SIMPLE / ADVANCED / CUSTOM / WORLD) | No-WebGL fallback, social preview | When WebGL is unavailable the stage shows text only. A still keeps the composition | Photoreal render of each PLACE composition (`compose('place', …)`) in the reference style, camera as `CAMERAS.place` | 1600×1000 | Yes (object on alpha) | `.webp` | `public/site00/builder-studio/stills/place-{simple,advanced,custom,world}.webp` | P2 |
| **GA-08** | Red acrylic micro-surface | Red elements (`red`, `redSolid`) | The subtle edge glow and internal depth of the reference acrylic | Very subtle roughness / normal variation, polished | 512² | No | `.webp` roughness + normal | `…/materials/acrylic-red/` | P3 |
| **GA-09** | AR export (per Blueprint) | Blueprint AR affordance (deferred) | The reference shows an AR button. AR needs a model of the client's composition | Not an image: an export pipeline from `BuildComposition` to `.glb` + `.usdz`. **Needs Composer** | n/a | n/a | `.glb` + `.usdz` | — | P3 (deferred) |

## Reference images

Founder references (attached to the sprint): REFERENCE 01 (four rooms), REFERENCE 02 (Blueprint). Side-by-side crops are in `comparisons/*-reference-vs-implementation.jpg`.

## Injection notes (for whoever wires them)

- **GA-01:** load with `RGBELoader`, then pass through `PMREMGenerator.fromEquirectangular` → `scene.environment` in `buildStage()`. Keep `environmentIntensity` near 0.5–0.7 so the white page does not blow out.
- **GA-02 to GA-04, GA-08:** swap the `stoneCanvas` textures in `createMaterials()` for loaded textures. Keep the procedural versions as the fallback while loading.
- **GA-05:** a large plane behind the object, `fog: false`, depth-write off, or a CSS layer behind the canvas with the canvas cleared to transparent.
- **Constraint:** the mobile bundle must stay light. Every asset needs a mobile size, and the page must stay usable while the assets load.
