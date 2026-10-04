# Icon + asset manifest

## Sources

| Pack | File | Contains |
|---|---|---|
| DWS_SONNET_LITE · 05_SYSTEM_PACKS | `01_ICON_PACK_AUTHORITY.jpg` (1586×992) | 8 icon sections on **one composite sheet**; no per-icon files |
| DWS_SONNET_LITE · 05_SYSTEM_PACKS | `02_ASSET_PACK_AUTHORITY.jpg` (1586×992) | 10 component / asset sections on **one composite sheet** |
| DWS_SONNET_LITE · 01–04 | 21 desktop / tablet / mobile / interaction authorities | composition authority only (not asset files) |
| PARENT_3VIEW_AUTHORITY_LITE_v1 | 12 three-view boards (6 Design) | composition and density authority |

Both sheets are committed under `docs/site00/design-pack/sources/` and hash-locked in `public/site00/production-authority-assets/design-pack/SOURCE.json`.
- **Extraction:** `scripts/site00-design-pack-extract.py` makes exact native-resolution crops. Nothing is traced, redrawn or generated.
- **Resolver:** `designPackAssets.ts` is the only resolver.

Classes:
- **CANONICAL_USED:** the supplied asset is now on screen.
- **CANONICAL_AVAILABLE_NOT_USED:** extracted and resolvable, but no Design parent surface has a slot for it.
- **NO_CANONICAL_ASSET:** the pack has no such asset.
- **LIVE_RUNTIME:** the pack README says to render this as live React/CSS/SVG ("prefer live SVG for functional icons"; navigation, tabs, panels, buttons and so on).
- **LEGACY_SUBSTITUTE:** a stand-in was found.

## Icon pack (`01_ICON_PACK_AUTHORITY.jpg`)

| Section | Asset | File | Intended use | Before | Now | Class |
|---|---|---|---|---|---|---|
| 03 PIPELINE STAGE ICONS | INTELLIGENCE, CONCEPT, EXPERIENCE, SURFACES, ASSETS, AUTHORITY, PRODUCTION | `design-pack/stages/0N-*.png` | Design pipeline stage objects | CSS gradient orbs (`Orb` / `.pxa-orb--0..4`) | stage *i* uses pack stage *i mod 7*, in all 6 modes | **CANONICAL_USED** (7/7); substitute removed |
| 02 WORKSPACE MODE ICONS | same 7 renders | (identical renders to 03) | mode marks | — | served by the 03 crops | CANONICAL_USED (same files) |
| 01 NAVIGATION | HUB (house) | `design-pack/icons/nav-hub.png`; keyed into `bottom-nav/01_HUB.png` | Production HUB tab; icon families | diamond stack (a duplicate of DESIGN) | house glyph in the bottom nav; tile in ASSETS · ICON FAMILIES | **CANONICAL_USED**; substitute replaced |
| 01 NAVIGATION | WORK, LIBRARY (hex-cube) | `icons/nav-work.png`, `icons/nav-library.png` | icon families | text tiles "CORE / UI / SYSTEM" | ASSETS · ICON FAMILIES | **CANONICAL_USED** |
| 01 NAVIGATION | ACTIVITY, EXIT, MENU, DROPDOWN, SEARCH, SETTINGS, USER | `icons/nav-*.png` | host / global UI | host chrome uses live SVG (`IcMenu`, `IcChevD`, …) | resolvable; host chrome is out of scope and LIVE_RUNTIME by pack rule | CANONICAL_AVAILABLE_NOT_USED (no parent-mode slot) |
| 04 OBJECT / SYSTEM | CUBE / SYSTEM, CONCENTRIC RINGS, GEOMETRIC LATTICE | `icons/object-*.png` | visual-language objects | text tiles "ICONS / LOGOS / MOTION" | BRAND · 02 VISUAL LANGUAGE | **CANONICAL_USED** |
| 04 OBJECT / SYSTEM | UI FRAME, STACK / LAYERS, CLOUD | `icons/object-*.png` | platform objects | text tiles "HYBRID / NATIVE" | SURFACES · 04 APP SURFACES | **CANONICAL_USED** |
| 04 OBJECT / SYSTEM | NETWORK, ROUTE MAP, CUBE / SYSTEM | `icons/object-*.png` | icon families | text tiles | ASSETS · 02 ICON FAMILIES | **CANONICAL_USED** |
| 04 OBJECT / SYSTEM | ORBITAL SPHERE, DATABASE | `icons/object-*.png` | objects | — | resolvable | CANONICAL_AVAILABLE_NOT_USED (no slot) |
| 05 ACTION (10), 06 STATUS (10), 07 REVIEW (10) | create … lock | not extracted | functional controls | live UI (buttons, chips) | — | LIVE_RUNTIME (pack rule) |
| 08 STRUCTURAL GEOMETRY (16) | point … wave | not extracted | visual-language metaphors | — | — | CANONICAL_AVAILABLE_NOT_USED (no slot in the parent modes) |

## Asset pack (`02_ASSET_PACK_AUTHORITY.jpg`)

| Section | Asset | File | Before | Now | Class |
|---|---|---|---|---|---|
| 07 DEVICE FRAMES | DESKTOP 16:9, TABLET 4:3, MOBILE 9:19 | `design-pack/devices/*.png` | empty CSS phone / frame shapes (`.pxa-vis--phones`, `--frames`) and text tiles "WINDOWS / MACOS / WEB" | SURFACES 01 / 02 / 03, EXPERIENCE 03, COMPILER 04, ASSETS 05 | **CANONICAL_USED**; substitutes removed |
| 08 ENVIRONMENT PLATES | MAIN ATRIUM, CROP 01–04 | `design-pack/plates/*.jpg` | legacy row photos (`PW_IMG.experienceRows`) and a generated pyramid-city plate | ASSETS 03, SURFACES 05, ASSETS and SURFACES table cards | **CANONICAL_USED** |
| 09 MATERIAL SWATCHES | 8 swatches | `design-pack/swatches/*.jpg` | six hard-coded hex blocks | BRAND 04 COLOR & MATERIAL, ASSETS 04 MATERIALS & COMPONENTS (6 shown), ASSETS table | **CANONICAL_USED** (6 of 8 on screen; all 8 resolvable) |
| 06 PIPELINE TILES | same 7 stage renders | (served by icon pack 03) | CSS orbs | pipeline | CANONICAL_USED |
| 01 PANEL SHELLS, 02 DRAWERS, 03 BUTTONS / CHIPS, 04 TABS, 05 REVIEW CARDS, 10 UTILITY WIDGETS | component language | — | live CSS components | unchanged | LIVE_RUNTIME (pack rule: "LIVE REACT/CSS/SVG FOR … PANELS, CARDS, …") |

## Production bottom nav

| Tab | Asset | Status |
|---|---|---|
| HUB | icon pack · 01 NAVIGATION · HUB (house) | **now used** (was the DESIGN diamond stack, duplicated) |
| INBOX, DESIGN, EXPERIENCE, EXPRESSION, ACTIVITY | existing keyed family (`bottom-nav/*.png`) | unchanged; they already match the parent boards |
| LIBRARY | **no open-book asset exists** | unchanged (three volumes). Neither pack, the repo, nor `BOTTOM_NAV_ICON_FAMILY_V1` / `GROK_ICON_PACK` in git history has an open book. The parent boards' LIBRARY is vertical books too, and the icon pack's LIBRARY is a hex cube. NO_CANONICAL_ASSET (see RESIDUALS) |

## Totals
- **Canonical icons found:** 83 icon cells on the icon sheet: 8 sections; the 7 stage renders appear twice. All 7 stages, all 10 navigation icons and all 10 object icons were extracted (27 files plus the HUB nav mask).
- **Canonical visual assets found:** 16 discrete asset files on the asset sheet (3 device frames, 5 plates, 8 swatches), all extracted. The component-language sections are LIVE_RUNTIME.
- **Previously used:** 0 pack icons and 0 pack visual assets. The pack had never been extracted into the repo; see `ASSET_SUBSTITUTION_AUDIT.md`.
- **Now used on screen:**
  - **Icons:** 18 distinct pack icon files (7 stage renders; 3 navigation: hub, work, library; 8 object: cube-system, concentric-rings, geometric-lattice, ui-frame, stack-layers, cloud, network, route-map), plus the HUB bottom-nav mask keyed from the pack's HUB glyph.
  - **Visual assets:** 14 of 16 (3 device frames, 5 plates, 6 swatches). GRAPHITE and NEUTRAL PAPER are extracted and resolvable, but not shown; the panels show 6 of the 8 swatches.
