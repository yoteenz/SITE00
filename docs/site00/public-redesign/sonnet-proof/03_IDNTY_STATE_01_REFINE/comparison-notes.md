# 03_IDNTY_STATE_01_REFINE

- **Authority:** `02_IDNTY/00_DIAGNOSTIC/03_IDNTY_STATE_01_REFINE.jpg` (850×1850) — `authority.jpg` is the pack image resized to 390px wide.
- **Route:** `/idnty/some-pieces-exist`  ·  **Component:** `IdentityDiagnosticFlow(mode=detail)`
- **Render:** `render.jpg` (viewport) · `render-full.jpg` (full page)
- **Visual status:** **PARTIAL**  ·  **Structure:** complete

## Known mismatches
- Machine is an SVG scaffold: lacks glossy material/bloom and node density; ~15% smaller than the authority; hero body copy overlaps the machine's left rings (authority keeps the text column ~130px).
- Hex lattice lacks the translucent volume, drop-lines and node cloud.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

Asset slots: `ENV.IDNTY.ATRIUM`, `MACHINE.IDNTY.PARTIAL.LATTICE`
