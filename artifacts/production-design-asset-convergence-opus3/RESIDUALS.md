# Residuals / conflicts

## Residual differences
1. **LIBRARY open-book icon: NO_CANONICAL_ASSET.**
   - No open-book glyph exists in either pack, the repo, or the icon families in git history (`BOTTOM_NAV_ICON_FAMILY_V1`: three volumes; `GROK_ICON_PACK`).
   - The PARENT_3VIEW boards draw LIBRARY as vertical books. The DWS icon pack draws it as a hex cube.
   - The current three-volume glyph is kept. An approved open-book file is needed to change it; it was not invented.
2. **Pack resolution.** The packs ship only as 1586×992 composite sheets, so every crop is small: stage renders 76px, icon tiles 48–64px, plates up to 278×168, swatches about 80×41. They read well at the sizes used (≤56px stages, panel thumbnails). They are not suitable for large or full-bleed use, which is why the chamber backdrop keeps the generated atrium.
3. **Kept generated / legacy art** where the pack has no equivalent: the chamber backdrop, the overview core mark, the VISUAL AUTHORITIES and CONCEPT TERRITORIES and BRAND ESSENCE / APPLICATIONS plates (generated board art), and the On Your Table cards of BRAND, EXPERIENCE, COMPILER and VIEWPORT.
4. **Light-tile crops.** Pack crops keep their light sheet tile and are blended with `mix-blend-mode: multiply` onto the light workspace. Over darker panel art, a faint tile edge can show.
5. **Proportions.** Desktop hero is 56% (target 45–55%). The table is 16–17% on desktop and tablet (target 18–24%) and 35% on 360×640. 1280×720 has a 60% hero. See `NO_SCROLL_MATRIX.md`.
6. **Design descendants** (`/design/references|skins|history|more`) still use the older live-SVG `DesignDwSectionIcon` / `Site00HubIcons` set. That is LIVE_RUNTIME for functional icons under the pack's own rule, and was not redesigned. Their shared inheritance (host, mode bar, bottom nav, HUB glyph) carries this sprint's fixes.
7. **Unused but resolvable:** 7 navigation icons, 2 object icons, 2 swatches and the 16 structural-geometry icons (not extracted) have no slot in the parent modes.

## Conflicts
1. **"Use the file" vs the pack's own rule.** The brief says to use the supplied files and never redraw. The pack has no per-icon files, and its README says "PREFER LIVE SVG FOR FUNCTIONAL ICONS … USE 05_SYSTEM_PACKS AS VISUAL VOCABULARY".
   - **Resolution:** visual objects (stage renders, icon tiles shown as content, device frames, plates, swatches) are exact crops of the supplied sheets.
   - Functional controls (host chrome, buttons, chips, tabs) stay live, as the pack directs.
2. **HUB glyph.** The PARENT_3VIEW boards are inconsistent: the HUB and LIBRARY boards draw HUB as a diamond stack, the Design boards draw a house. The brief ("architectural home") and the DWS icon pack (house) decide it: house.
3. **Pack nav set.** The DWS pack's footer nav is HUB · WORK · LIBRARY · ACTIVITY · EXIT. The Production nav keeps its seven tabs (shared, unchanged except HUB).
4. **Older test.** `productionAuthorityConvergenceOpus2.test.ts` limited table plates to the earlier shipped plate list. It now also allows `DESIGN_PACK_FILES`; the intent (distinct, shipped, on disk) is kept.
