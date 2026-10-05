# Opus High — Production asset handoff

REFERENCE SCREEN = COMPOSITION AUTHORITY  
ASSET MANIFEST = CONTENT SLOT AUTHORITY (`src/site00/productionAssets/routeAssetManifests.ts`)  
PRODUCTION ASSET REGISTRY = SOURCE ASSET AUTHORITY (`src/site00/productionAssets/productionAssetRegistry.ts`)  
REPO DATA = COPY / STATE / RELATIONSHIP AUTHORITY (`public/site00/production-authority-assets/`, nav masters)

KEEP THE FUNCTION. REBUILD / REFINE THE LOOK. REFERENCE = DESIGN AUTHORITY.

DO NOT RECREATE AN ASSET THAT ALREADY EXISTS.

Before substituting any visual:

1. Check the route manifest.
2. Check `getProductionAsset(id)` / `productionAssetPaths`.
3. Use the mounted file under `public/site00/production-authority-assets/` or nav masters.

If a slot is `MISSING_SOURCE_ASSET` or `SOURCE_MATCH_UNCERTAIN` on the manifest, do not silently improvise or generate a stand-in and call it canonical.

OpenArt project `Q7IHYCEK3RPn2c1ConEG` recent history is mostly LIBRARY composition boards. Those boards are not the underlying plates. GROK1 plate history IDs are recorded in `public/site00/production-authority-assets/SOURCE.md`.

DO NOT GENERATE RESIDENT STAND-INS.

Mounted resident portraits under `public/site00/production-authority-assets/shared/residents/`:

- SW-001 Etta Vale — `resident.sw001.etta.portrait` (USED_BY_AUTHORITY). Use this file. Founder-pack full-body and uniform frames are variants only.
- SW-002 Zuri Xu — identity confirmed. Runtime portrait `resident.sw002.zuri.portrait` (founder closeup, EXACT face match to the OpenArt candidate). The candidate file stays a variant, not a second person. Not an authority-screen pose.
- SW-003 Jules Mercer — `resident.sw003.jules.portrait` (USED_BY_AUTHORITY). A locs cluster in the founder pack is only a PROBABLE match (different hair). Do not swap the mounted portrait for that cluster.
- SW-004 Noa Kline — `resident.sw004.noa.portrait` (IDENTITY_CONFIRMED). Use this file. Full-body is `resident.sw004.noa.fullBody`.
- SW-005 Caspian Reed — `resident.sw005.caspian.portrait` (USED_BY_AUTHORITY).
- SW-006 Iona Wells — `resident.sw006.iona.portrait` (USED_BY_AUTHORITY). Glam gown is an alternate mode, not the default portrait.
- SW-007 Marlowe Saint — `resident.sw007.marlowe.portrait` (IDENTITY_CONFIRMED).
- SW-008 Elio Vahn — `resident.sw008.elio.portrait` (IDENTITY_CONFIRMED). Do not confuse him with Caspian.

Use only the variant the manifest names. Residents are not roles, actors, characters, or inhabitants. Do not paint residents from the empty expression stage plate. Experience zone/portal files were not found as standalone plates; responsive boards stay composition authority. Founder portraits are USER_SUPPLIED with UNKNOWN_OPENART_PROVENANCE. The lite JPEG is an interim mount — original `SW Team(1).zip` was not in the workspace.
