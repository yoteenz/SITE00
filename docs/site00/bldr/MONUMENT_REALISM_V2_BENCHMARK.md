# BLDR monument realism V2: PLACE · ADVANCED benchmark

Sprint: `P0.SITE00.BLDR.MONUMENTS.V2-OPUS-SPATIAL-REALISM-AND-REFERENCE-PRESERVATION1`
Status: benchmark for founder review. One monument only. The default renderer is unchanged. Not merged, not deployed.

## How to view it

Append `realism=v2` to the PLACE room with ADVANCED selected:

```
/bldr/studio/place?reviewRoom=PLACE&realism=v2
```

The flag only applies when the composition is PLACE · ADVANCED (`isRealismBenchmark`). Any other path, or any other room, renders with the current engine even with the flag set. Without the flag, nothing changes anywhere.

## Why V1 still looked like V1

V1 changed material tokens on the same render model. The canvas is transparent and sits over a CSS photograph, so glass can only be painted: a transmission pass refracts empty alpha and the panes vanish. Every element is a unit cube scaled to size, so no element has a real edge, bevel, or thickness. Changing tokens on that model could not make it look physical.

## Method (renderer)

Hybrid composite, real-time WebGL (three.js r185):

1. The room plate is drawn inside the scene. It is the same `env/place.webp` photograph with the same `center 62% / cover` fit as the CSS layer, and it is not tone-mapped. The pixels around the object are therefore identical to today's page, and the stage's edge masks still apply. The plate URL and fit are read from the host's computed style, so they cannot drift.
2. Because the plate is now in the scene, `MeshPhysicalMaterial` transmission has real content to refract (screen-space refraction against the plate). The plate is a photograph, so the refraction is honest: it bends what is actually behind the object, and nothing is faked.
3. Each element is built at its true size, not as a scaled cube (`realism.ts`, `buildRealismBody`). The tween scales each body relative to that size, so the assembly animation is unchanged.

Rejected for the benchmark: offline renders (they don't follow live selections), a full 3D room (it would replace the approved plates), and SSAO/GTAO post passes. Depth-based AO darkens glass panels, and it costs a full extra pass on phones.

## Geometry

| Element | Current | V2 |
| --- | --- | --- |
| Glass rooms (`vol-a`, `vol-b`) | one painted cube, 12 square frame bars, 1-px mullion lines | 4 wall panels and a roof panel, each 22 mm thick, plus 12 beveled chrome frame members and real mullion bars (11 mm) standing proud of the glass. All merged into 2 draw calls per room |
| Glass deck | painted cube | a 60 mm solid glass floor plate with beveled edges and a framed rim |
| Red spine (`core`) | painted cube, opacity 0.92 | beveled acrylic block (30 mm radius) with a transmissive shell around a dense inset core |
| Red beam / slab face (`beam`, `core-2`) | painted cubes | beveled solid acrylic bars, attenuated through their real thickness |
| Marble plinth | cube with a 1-px outline | 35 mm beveled slab. Its UVs are unfolded so each vein continues over the arris and down the face |
| Stone wall | cube with a hairline | beveled stone slab |
| Figures | unchanged | unchanged |

The silhouette is unchanged. A test checks that every V2 body's bounds equal the element size (plus frame thickness on glass).

## Materials

- **Glass:** transmission 1, ior 1.52, thickness equal to the panel, cool attenuation, roughness 0.035. Clearcoat is removed, because a second reflecting layer read as a milky veil. Fresnel comes from the ior alone.
- **Red acrylic:** ior 1.49, attenuation colour `#E50107`. On the solid spine, attenuation runs over the clear rim, so the rims and bevels stay brighter and translucent around the dense core (also `#E50107`). On thin bars it runs over their full thickness. Polished (roughness 0.05) with a clearcoat on desktop.
- **Marble:** new procedural Carrara, painted at 2048² on desktop and 1024² on phones. It has soft drifts along one bedding direction, 14 fine primary veins, 40 hair veins, and a matched roughness map, so the veins are slightly less polished than the ground. Clearcoat on desktop. The light, warm-white luxury palette stays (`#e4e1dd` ground).
- **Frames:** chrome-white metal (dark chrome on dark glass) with bevels, so they catch a highlight line.

## Lighting

- The existing key, fill, front and hemisphere lights and the atrium reflection map are unchanged.
- Baked contact occlusion: a soft decal sized to each footprint under every element standing on the plinth, and under the plinth on the floor. The shadow map gives direction; the decals give the darkening where surfaces meet.
- Red bounce: a soft `#E50107` tint baked onto the marble around the spine's base. A point light was tried first and rejected, because it left a specular hotspot on the polished surfaces.
- No bloom, no neon, no emissive glow beyond the existing low red emissive.

## Mobile

- **Idle:** the benchmark draws nothing once settled. The current engine sways at about 20 fps forever (5,278 draw calls in 3 idle seconds in the harness); V2 makes 0.
- **Adaptive quality:** on a phone the refraction buffer starts at 0.75 resolution. If assembly frames run long (median over 34 ms), the buffer drops to 0.5 first, then the pixel ratio steps down by 0.25, never below 1×. No effect is switched off. The current tier is exposed as `data-quality`.
- **Phone tier geometry:** fewer bevel segments, frame members at 1 segment, no clearcoat, 1024² marble.
- **Context release:** the engine is rebuilt when ADVANCED is toggled, and V2 releases its WebGL context on dispose.

## Measured (Chrome headless, SwiftShader software GL)

These are software-raster numbers. They are valid as a ratio between the two renderers, not as phone frame rates. Real-GPU timing still needs a device pass.

| Tier | Renderer | Draws / frame | Triangles / frame | Forced frame | Idle draws (3 s) | Heap after 8 mount/dispose |
| --- | --- | --- | --- | --- | --- | --- |
| Phone 393×852 @3× | current | 182 | 3.6k | 106.7 ms | 5,278 | −2.0 MB |
| Phone 393×852 @3× | V2 | 42 | 22.3k | 222.7 ms (2.1×) | 0 | +5.4 MB (cached marble canvases, one-time) |
| Desktop 1440×900 | current | 182 | 3.6k | 334.4 ms | 1,638 | +1.0 MB |
| Desktop 1440×900 | V2 | 42 | 41.0k | 754.1 ms (2.25×) | 0 | +1.0 MB |

A V2 frame costs about 2.1–2.25× a current frame, mostly from the transmission pass, which re-renders the opaque scene. V2 draws only when something changes, while the current engine redraws continuously. Over a typical visit, V2 does less total GPU work.

Finding on the current path, not changed here: disposed engines keep their WebGL context until GC. Repeated mounts log "Too many active WebGL contexts". V2 calls `forceContextLoss()`. The current path should get the same fix in the rollout.

## Thumbnails

With the flag, the ADVANCED card's still is rendered through the same V2 path, with the card's own plate (`center 70%`) inside the image, so the card matches the hero. The other three cards stay on the current renderer until rollout, so within the benchmark the ADVANCED card looks different from its neighbours.

## Regression checks

- Selection, persistence and room flow: with the flag, ADVANCED → SIMPLE moves `aria-checked`, and the stage switches back to the current renderer (`data-realism` cleared). SIMPLE → ADVANCED returns to V2, the selection survives a reload, and FEEL with the flag stays on the current renderer. No page errors.
- WebGL unavailable: "3D VIEW UNAVAILABLE ON THIS DEVICE" plus the description; cards still work.
- Page layout, typography, cards, tabs, navigation: unchanged at 390×844, 393×852, 834×1194 and 1440×900 (see the full-page comparisons).
- Tests: `tests/bldrMonumentRealismV2.test.ts` (7), V1 realism (4), composition (17), anatomy (31), studio model (12), review model (3). Typecheck and production build pass.

## Known limits of this benchmark

- Transmission cannot see other transmissive surfaces. A rear pane seen through a front pane shows its frame and mullions but not its own reflection. The red keeps an opaque core partly so that it stays visible through glass.
- The plate is 640×407, so refracted content is as soft as the plate itself.
- The marble has no planar reflection of the red (environment reflections only), and the red casts a neutral shadow, not a tinted one.
- "Blueprint reflects the actual selections" is a Blueprint-family item and is not part of this single-monument benchmark.
- Blueprint inspection (`lit` red illumination) has no V2 dressing yet. It must be designed before the Blueprint rollout.

## Rollout, after approval only

`realism.ts` already handles every glass, red and stone element, so a rollout widens `isRealismBenchmark` family by family. In order:

1. PLACE (all four paths).
2. FEEL (tinted and dark glass, slate and warm marble need palette tuning).
3. WORK.
4. PACE.
5. BLUEPRINT (needs a V2 `lit` state).

Each family gets its own before/after board. The current-path context fix lands with step 1.

Artifacts: `/opt/cursor/artifacts/bldr-v2/` (before/after full page and stage at four viewports, side-by-side boards, a detail board, the no-WebGL fallback). Manifest: `MONUMENT_REALISM_V2_BENCHMARK.json`.
