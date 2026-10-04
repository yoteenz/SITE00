# P0.STUDIOOS.PRODUCTION.DESIGN.ASSET-AUTHORITY-CONVERGENCE.OPUS3

This refines the six DESIGN parent modes (BRAND · EXPERIENCE · SURFACES · COMPILER · ASSETS · VIEWPORT). It does not restart them.

- **Canonical pack, actually used.** `DWS_SONNET_LITE/05_SYSTEM_PACKS` is extracted (exact crops of the two supplied sheets) into `public/site00/production-authority-assets/design-pack/`, resolved only through `designPackAssets.ts`. On screen now: 18 pack icon files and 14 pack visual assets, plus the HUB home glyph in the shared bottom nav. All CSS and text stand-ins in the Design renderer are removed.
- **Root cause** (`ASSET_SUBSTITUTION_AUDIT.md`): the pack was never extracted, stand-ins were hard-coded in the renderer, and a config override loop painted generated art over any plate placed in config.
- **No-scroll parent contract.** The Design body fills the frame and the chamber flexes. 30/30 mode × viewport cases have no page scroll (before: 18/30).
- **Read:** both ZIPs, `PACK_MANIFEST.txt`, `SONNET_README.txt`, `00_DOCS/README.md` and `manifest.{json,csv}`; all 6 Design three-view boards were inspected.

## Files
- `scripts/site00-design-pack-extract.py`, `docs/site00/design-pack/sources/*.jpg`, `public/.../design-pack/**` + `SOURCE.json`
- `src/site00/components/productionAuthority/designPackAssets.ts` *(new resolver)*
- `DesignChamber.tsx` (pack stage renders, `icons` / `devices` / swatch vis), `designChamberConfig.ts` (pack slots, override loop fixed), `primitives.tsx` (`Orb` removed)
- `src/site00/styles/site00-production-design-pack.css` *(new: frame contract, pack styles, compaction)*; dead orb and stand-in rules removed from `site00-production-authority{,-opus}.css`
- `src/site00/components/productionHub/bottom-nav/01_HUB.png`: keyed from the pack's HUB glyph
- `tests/productionDesignAssetConvergenceOpus3.test.ts` *(19 tests)*; `productionAuthorityConvergenceOpus2.test.ts` allow-list extended

## Proof
- `<mode>/{mobile,tablet,desktop}/`: `live-*.jpg` (5 viewports), `board-vs-live.jpg` (PARENT_3VIEW frame vs live), `before-after.jpg`
- `PACK_CONTACT_SHEET.jpg`: every extracted file
- `NO_SCROLL_REPORT{,_BEFORE}.json`, `TOP_NAV_CLIP_REPORT.json` (42/42), `MATRIX_36.json` (36/36)
