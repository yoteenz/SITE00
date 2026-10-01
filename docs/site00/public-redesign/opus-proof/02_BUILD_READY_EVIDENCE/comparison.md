# 02_BUILD_READY_EVIDENCE

- **Route:** `/idnty/build-ready/evidence` · **Frame:** 390×693 (941×1672 / 1080×1920)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PARTIAL — OPUS VISUAL WORK REMAINS

## Measured landmarks

| Landmark | SONNET | OPUS |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y311 x81 228×20 |
| Working panel | y420 x22 346×737 | y353 x18 354×330 |
| Panel code | y450 x39 65×41 | y366 x33 50×31 |
| Question title | y554 x39 312×36 | y420 x33 324×14 |
| First option / row | y634 x39 312×96 | y463 x33 324×30 |
| Actions / CTA | y1089 x23 344×67 | y631 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1241 | 754 |

## Changes

- Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
- Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
- Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
- 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
- Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
- Evidence rows 29px, quiet chips (4.3px).

## Remaining

- Rows run ≈4px taller than the authority because three source chips + status share each row; the panel footer scrolls ≈30px under the nav at 390×693 (reachable).

## Grok slots

- `ENV.IDNTY.ATRIUM`
