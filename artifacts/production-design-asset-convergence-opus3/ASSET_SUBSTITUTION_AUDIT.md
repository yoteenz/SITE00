# Asset substitution audit: root cause

## Why the supplied icon and asset pack never reached the screen

Established from code and live DOM inspection, not guessed. Three causes compounded.

1. **The pack was never extracted into the repo.**
   - `DWS_SONNET_LITE/05_SYSTEM_PACKS` ships its icons and assets only as two composite JPG sheets.
   - No earlier sprint cut them into files. `git ls-files` and `git log --all` have no crop of either sheet.
   - So there was nothing to import, and implementations filled the slots with stand-ins.
2. **Stand-ins were authored directly into the shared renderer** (`DesignChamber.tsx` `PanelVis` + `primitives.tsx`):
   - pipeline: `Orb` → `.pxa-orb--0..4` CSS gradient balls and squares, standing in for the 7 rendered stage objects
   - `swatches`: six hard-coded hex blocks, standing in for the 8 material swatches
   - `phones` / `frames`: empty `<i>` boxes styled as devices, standing in for the 07 device frames
   - `grid`: text tiles (`ICONS / LOGOS / MOTION`, `CORE / UI / SYSTEM`, `WINDOWS / MACOS / WEB`, `HYBRID / NATIVE`), standing in for the icon families
3. **A post-declaration override loop in `designChamberConfig.ts`** replaced every panel plate and every On Your Table plate *after* the config was declared:
   - `panel.plates → AUTHORITY_ASSETS.boards[mode]`
   - `card.plate → TABLE_ART[mode][i]`

   This is the "fallback takes precedence" failure. Even after pack plates were placed in the config, the live DOM still showed the generated `production-design-board-*` / `experience-world` / `library-red-geometry` plates. Confirmed by reading `style.backgroundImage` in the live page before the fix.

Not the cause: wrong relative paths, a missing Vite copy, or a duplicate icon resolver. `public/` is served and copied to `dist/` as-is (verified: `dist/site00/production-authority-assets/design-pack/` exists after the build).

## Fixes
- **Extraction:** `scripts/site00-design-pack-extract.py` makes exact crops into `public/site00/production-authority-assets/design-pack/`, with `SOURCE.json` holding the sheet sha256 and crop box per file. The sheets are committed under `docs/site00/design-pack/sources/`.
- **One resolver:** `designPackAssets.ts`. Every Design consumer imports from it, and `DESIGN_PACK_FILES` lists every referenced file (a test asserts each exists and is in the manifest).
- **Stand-ins removed:**
  - `Orb` and all `.pxa-orb*` rules
  - the `phones` / `frames` / `grid` vis types and their CSS
  - the hex swatches

  New vis types `icons` and `devices` render pack files, and `swatches` renders pack swatches.
- **Override loop fixed:** it now replaces only legacy row imagery and never a `/design-pack/` file (`isDesignPackAsset`). Pack panels (`icons`, `devices`, `swatches`) no longer get the generated board art painted behind them.

## Substitutions found → status

| # | Substitute | Where | Canonical replacement | Status |
|---|---|---|---|---|
| 1 | CSS gradient orbs (×5 variants) | pipeline, all 6 modes | icon pack 03 stage renders | **removed / replaced** |
| 2 | hex colour swatches | BRAND 04, ASSETS 04 | asset pack 09 swatches | **replaced** |
| 3 | empty CSS phone boxes | EXPERIENCE 03, SURFACES 01 / 02, ASSETS 05 | asset pack 07 device frames | **replaced** |
| 4 | empty CSS frame boxes | COMPILER 04 | asset pack 07 device frames | **replaced** |
| 5 | text-tile "icons" | BRAND 02, SURFACES 03 / 04, ASSETS 02 | icon pack 01 / 04 tiles, asset pack 07 | **replaced** |
| 6 | override loop forcing board art over plates | config, all modes | respects pack files | **fixed** |
| 7 | generated plates in pack-semantic slots | ASSETS 03 panel + table, SURFACES 05 + table, ASSETS COMPONENT table | asset pack 08 plates / 09 swatch | **replaced** |
| 8 | HUB nav glyph = DESIGN diamond stack | bottom nav (all Production) | icon pack 01 HUB house | **replaced** |
| 9 | generated chamber backdrop (`designAtrium`), overview mark (`designCore`), legacy row photos in BRAND / COMPILER / ASSETS-01 panels | chamber | none in the pack at that size or subject (the pack's atrium is a 278×168 thumbnail) | kept; residual |

**Fallback icons found 8, removed 8** (rows 1–5 and 8). **Fallback assets found 4, removed 3** (rows 6–7 fixed; row 9 kept, no canonical equivalent).
