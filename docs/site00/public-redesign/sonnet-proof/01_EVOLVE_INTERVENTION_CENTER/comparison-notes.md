# 01_EVOLVE_INTERVENTION_CENTER

- **Authority:** `04_EVOLVE/01_EVOLVE_INTERVENTION_CENTER.jpg` (1080×1920) — `authority.jpg` is the pack image resized to 390px wide.
- **Route:** `/evolve/state`  ·  **Component:** `EvolveInterventionCenter`
- **Render:** `render.jpg` (viewport) · `render-full.jpg` (full page)
- **Visual status:** **PARTIAL**  ·  **Structure:** complete

## Known mismatches
- Property machine is a three-layer wireframe; authority is a rendered glass building with red intervention blocks (MACHINE.EVOLVE.PROPERTY_TOWER).
- Authority highlights the IDNTY nav bay on this EVOLVE page; implementation highlights a contextual EVOLVE bay (flagged as an authority inconsistency).
- Cards 3-up (matches) but art placeholders (CARD.EVOLVE.PATH.*).
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).
- Bottom nav keeps the existing five-bay icon set; labels are ~10% larger than the authority.

Asset slots: `ENV.EVOLVE.INTERVENTION_CENTER`, `MACHINE.EVOLVE.PROPERTY_TOWER`, `CARD.EVOLVE.PATH.REFINE`, `CARD.EVOLVE.PATH.INSTALL`, `CARD.EVOLVE.PATH.TRANSFORM`
