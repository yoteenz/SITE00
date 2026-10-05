# 01_BLDR_COMMAND_CENTER

- **Route:** `/bldr/state` · **Frame:** 390×693 (941×1672 / 1080×1920)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PARTIAL — GROK DEPENDENCY ONLY

## Measured landmarks

| Landmark | SONNET | OPUS |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 346×51 | y64 x23 351×43 |
| Machine box | y278 x22 346×256 | y50 x130 190×260 |
| Card row | y564 x22 346×549 | y368 x16 358×205 |
| First card | y564 x22 169×270 | y368 x16 87×205 |
| NOT SURE bar | y1123 x22 346×130 | y582 x16 358×56 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1337 | 708 |

## Changes

- Page was 1337px tall (machine 256px stacked under the hero, 2×2 cards 270px tall) → fits 390×693 like the authority.
- Header carries the existing primary links (EXPLORE · BUILD · EVOLVE · ABOUT) at 4.6px.
- Tower re-drawn in page coordinates x130→320, y50→310 with the four path panels hugging it.
- ONE row of four 87×205 cards; titles fitted to one line (EXTENSIONS 11px); CTA pills 16px.
- NOT SURE bar: glyph · copy · divider · outlined CTA pill (authority).

## Remaining

- Tower glass/material and card vignettes are Grok — they dominate the authority composition.

## Grok slots

- `ENV.BLDR.COMMAND_CENTER`
- `MACHINE.BLDR.TOWER`
- `CARD.BLDR.PATH.SITE`
- `CARD.BLDR.PATH.WORLD`
- `CARD.BLDR.PATH.SYSTEMS`
- `CARD.BLDR.PATH.EXTENSIONS`
