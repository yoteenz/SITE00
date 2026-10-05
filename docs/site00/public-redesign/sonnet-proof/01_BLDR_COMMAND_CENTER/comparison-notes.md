# 01_BLDR_COMMAND_CENTER

- **Authority:** `03_BLDR/01_BLDR_COMMAND_CENTER.jpg` (941×1672) — `authority.jpg` is the pack image resized to 390px wide.
- **Route:** `/bldr/state`  ·  **Component:** `BuilderCommandCenter`
- **Render:** `render.jpg` (viewport) · `render-full.jpg` (full page)
- **Visual status:** **PARTIAL**  ·  **Structure:** complete

## Known mismatches
- Tower is a flat slab SVG; authority is a rendered glass assembly with floating path panels (MACHINE.BLDR.TOWER slot).
- Path cards render 2×2 below 560px (authority 4-up); card art are placeholders (CARD.BLDR.PATH.*).
- Header lacks the authority's inline nav links (EXPLORE BUILD …); SEARCH omitted.
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).
- Bottom nav keeps the existing five-bay icon set; labels are ~10% larger than the authority.

## Structural questions
- STRUCTURAL: authority paths SITE/WORLD/SYSTEMS/EXTENSIONS vs current classes SITE/WORLD/ENTERPRISE/NOT SURE. SYSTEMS → enterprise; EXTENSIONS → discovery. Does EXTENSIONS need its own build class/assessment?

Asset slots: `ENV.BLDR.COMMAND_CENTER`, `MACHINE.BLDR.TOWER`, `CARD.BLDR.PATH.SITE`, `CARD.BLDR.PATH.WORLD`, `CARD.BLDR.PATH.SYSTEMS`, `CARD.BLDR.PATH.EXTENSIONS`
