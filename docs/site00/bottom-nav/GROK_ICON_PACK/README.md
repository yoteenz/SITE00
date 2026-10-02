Superseded by `BOTTOM_NAV_ICON_FAMILY` V1. These files stay as lineage. Do not wire them.

# SITE 00 bottom nav — Grok icon pack

Icon fabrication only. These files are not wired into Production navigation.

Order is unchanged: HUB, INBOX, DESIGN, EXPERIENCE, EXPRESSION, LIBRARY, ACTIVITY.

## Delivery

Seven transparent PNGs in `outputs/`. Each canvas is 512×512. The glyph is centered, charcoal (`#141414`), with no text, background, shadow, or gradient. SITE 00 red is not baked in. The host active state applies red.

SVG masters in `masters/` use one stroke weight (26px on the 512 canvas), miter joins, and square cuts. `scripts/site00-bottom-nav-icons.mjs` rebuilds the PNGs from those constructions.

## Semantics

| File | Meaning | Source |
| --- | --- | --- |
| `01_HUB.png` | House outline, no door | Authority HUB |
| `02_INBOX.png` | Envelope | New family member |
| `03_DESIGN.png` | Geometric leaf with a center vein | Current DESIGN, redrawn in the line family. Not stacked-layers WORK |
| `04_EXPERIENCE.png` | Triangle with a center stem | Current EXPERIENCE, sharp family corners |
| `05_EXPRESSION.png` | Hexagonal ring | Current EXPRESSION |
| `06_LIBRARY.png` | Isometric cube with a diamond on the top face | Authority LIBRARY |
| `07_ACTIVITY.png` | Pulse ending in a charcoal ring | Authority ACTIVITY. Replaces the clock. Ring is charcoal, not red |

## Do not

Do not rename the destinations, replace DESIGN with WORK, replace the triangle or hex with other symbols, bake a nav bar, or swap these files into `src/site00/components/productionHub/icons.tsx` until a wiring sprint says so.
