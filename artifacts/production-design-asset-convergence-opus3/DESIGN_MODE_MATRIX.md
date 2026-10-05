# Design mode matrix

| Mode | Panels (pack assets now used) | Pipeline | On Your Table | No-scroll (5 viewports) | Mobile | Tablet | Desktop |
|---|---|---|---|---|---|---|---|
| BRAND | 02 VISUAL LANGUAGE: pack object icons; 04 COLOR & MATERIAL: pack swatches | 5 pack stage renders | unchanged (board plates) | 5/5 | CONVERGED | CONVERGED | CONVERGED |
| EXPERIENCE | 03 EXPERIENCE STATES: pack device frames | 5 | unchanged | 5/5 | CONVERGED | CONVERGED | CONVERGED |
| SURFACES | 01 / 02 / 03: pack mobile / tablet / desktop frames; 04: pack UI-frame / stack / cloud icons; 05: pack plates | 5 | DESKTOP SURFACES: pack plate | 5/5 | CONVERGED | CONVERGED | CONVERGED |
| COMPILER | 04 FAMILIES & EXPRESSIONS: pack device trio | 5 | unchanged | 5/5 (tablet was +3px) | CONVERGED | CONVERGED | CONVERGED |
| ASSETS | 02 ICON FAMILIES: 6 pack icons; 03 ENVIRONMENT PLATES: 4 pack plates; 04 MATERIALS: pack swatches; 05 TEMPLATES: pack device trio | 5 | ENVIRONMENT PLATES: pack atrium; COMPONENT ASSETS: pack swatch | 5/5 | CONVERGED | CONVERGED | CONVERGED |
| VIEWPORT | live device preview + controls (unchanged) | 7-stage strip | unchanged | 5/5 | CONVERGED | CONVERGED | CONVERGED |

Shared across all six:
- one `DesignModeBar` (six modes, active in red)
- one `DesignChamber` renderer and one pack resolver
- one pipeline and On Your Table grammar
- the shared host top (top-nav clip detector 42/42 clean on the six modes × 7 widths)
- the shared bottom nav with DESIGN active (36-root matrix 36/36)

CONVERGED means compared live against the matching frame of the PARENT_3VIEW board (`*/{mobile,tablet,desktop}/board-vs-live.jpg`) and fitting without page scroll.
