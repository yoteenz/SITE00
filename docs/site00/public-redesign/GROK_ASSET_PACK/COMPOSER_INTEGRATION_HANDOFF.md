# Composer integration handoff

Sprint: `P0.SITE00.PUBLIC-REDESIGN.GROK-SURGICAL-FABRICATION1`
Date: 2026-10-01
Registry: `docs/site00/public-redesign/GROK_ASSET_PACK/ASSET_REGISTRY.json`
Outputs: `docs/site00/public-redesign/GROK_ASSET_PACK/outputs/`

No page, route, CSS, or React files were changed. Composer injects these files into the existing Opus slots.

## How to inject

1. Read `ASSET_REGISTRY.json`. One row per `asset_id`.
2. File bytes are `output_path`. Canonical filename is mandatory. Do not rename.
3. `slot_id` equals `asset_id`. Pair with the Opus slot of the same id.
4. `surface` is `MOBILE_WEB` for every spec. `surface_derivation` tells later surfaces what to do. Do not invent a second world for tablet, desktop, or app.
5. Environments are opaque WebP. Transparent objects are PNG with a real alpha channel. Do not flatten them onto white.
6. Honor `mask_ownership`, `shadow_ownership`, and `reflection_ownership` from the registry. Do not add a CSS shadow when the row says `SHADOW_SEPARATE_ASSET` unless a separate shadow asset exists (none were fabricated). Environments are `NO_SHADOW` / `NONE`.
7. Card images are the image region only. The live card frame, title, and CTA stay in code.
8. Red-line illustrations and glossy machines are the image-owned objects. Do not also draw the live SVG in the same pixels.

## Surface derivation

| Classification | Count | Composer action |
| --- | --- | --- |
| EXTENDED_CANVAS | environments that already include the wider view in the master | Crop later surfaces from the same file. Do not regenerate. |
| SAME_ASSET_DIFFERENT_CROP | cards and some environments | This file is the mobile master. Other surfaces crop it. |
| NOT_APPLICABLE | transparent objects | Use the PNG as-is on every surface. |

`ENV.ORIGIN.EXPANDED` is an extended canvas of `ENV.ORIGIN.COLLAPSED` (same double-zero, skyline revealed). `ENV.BLDR.PATH.OVERVIEW` is a center crop of `ENV.BLDR.COMMAND_CENTER`, not a new world. The compiler edge from overview to `ENV.BLDR.PATH.EXTENSIONS` was not followed.

## Dependency notes

Compiler cycles (do not re-introduce):

- `ENV.EVOLVE.PATH.REFINE` and `ENV.EVOLVE.PATH.INSTALL` depended on each other. Both were parented to `ENV.EVOLVE.INTERVENTION_CENTER`.
- `ENV.BLDR.PATH.OVERVIEW` depended on `ENV.BLDR.PATH.EXTENSIONS`, which depends on the command center. Overview was cropped from the command center.

## Founder flags before treating a family as closed

- `ENV.LOCATIONS.ARCH` — pale stone arch, not warm marble. Cards inherit that master. Flag: REFINE.
- `ENV.BLDR.PATH.SYSTEMS` — white module column in the atrium, not a literal server rack. Flag: REFINE.

## Superseded generations

Recorded on each registry row in `supersedes` (OpenArt history ids). Do not use those URLs. Canonical files already point at the corrected generation.

## Not in this pack

Icon assets: 0. Micro-assets: 0. The 52-spec pack has no `ICON_ASSET` or `MICRO_ASSET` rows. Live SVG icons stay in code.
