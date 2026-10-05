# 01_FOUNDATION_PRIMARY_GOAL

- **Authority:** `02_IDNTY/01_FOUNDATION/01_FOUNDATION_PRIMARY_GOAL.jpg` (1080×1920) — `authority.jpg` is the pack image resized to 390px wide.
- **Route:** `/idnty/starting-at-zero/goal`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Render:** `render.jpg` (viewport) · `render-full.jpg` (full page)
- **Visual status:** **PARTIAL**  ·  **Structure:** complete

## Known mismatches
- Tile icons are generic live-SVG line icons (authority icons are bespoke).
- Tile labels ~7.5px at 5 columns; authority tiles are taller with more padding.
- Header third line shows the state quote; authority shows QUESTION 01 there (counter lives in the panel body here, per the secondary-progress rule).
- Machine is an SVG scaffold: lacks glossy material/bloom and node density; ~15% smaller than the authority; hero body copy overlaps the machine's left rings (authority keeps the text column ~130px).
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

## Functional notes
- Single-select (radio semantics); legacy multi-value goal answers display the first value.

Asset slots: `ENV.IDNTY.ATRIUM`, `MACHINE.IDNTY.FOUNDATION.ORB`
