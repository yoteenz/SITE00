# 02_IDNTY_STATE_00_FOUNDATION

- **Route:** `/idnty/starting-at-zero` · **Frame:** 390×693 (941×1672 / 1080×1920)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PARTIAL — OPUS VISUAL WORK REMAINS

## Measured landmarks

| Landmark | SONNET | OPUS |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y321 x81 228×20 |
| Working panel | y428 x22 346×376 | y363 x18 354×254 |
| Panel code | y452 x39 65×41 | y376 x33 50×31 |
| Actions / CTA | y744 x39 312×46 | y574 x33 324×28 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 888 | 693 |

## Changes

- Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
- Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
- Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
- 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
- Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
- Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
- Detail body: WHAT THIS MEANS 6.6px, facts row, CTA 28px pill.

## Remaining

- This authority is drawn in the 941-family scale (≈8% larger than the 1080-family question screens of the same state): panel top 388 vs live 363, type ≈8% smaller. Matching it would move the hero/machine between detail and question, which breaks the continuity rule — founder decision (one geometry per state chosen).

## Grok slots

- `ENV.IDNTY.ATRIUM`
