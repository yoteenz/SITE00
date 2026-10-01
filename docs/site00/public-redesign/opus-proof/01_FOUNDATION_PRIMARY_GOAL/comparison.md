# 01_FOUNDATION_PRIMARY_GOAL

- **Route:** `/idnty/starting-at-zero/goal` · **Frame:** 390×693 (941×1672 / 1080×1920)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PASS

## Measured landmarks

| Landmark | SONNET | OPUS |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y28 x0 390×300 |
| 00–03 rail | y372 x30 330×28 | y321 x81 228×20 |
| Working panel | y428 x22 346×446 | y363 x18 354×264 |
| Panel code | y459 x39 65×41 | y376 x33 50×31 |
| Question title | y561 x39 312×18 | y430 x33 324×14 |
| First option / row | y608 x39 58×84 | y465 x33 61×51 |
| Actions / CTA | y807 x23 344×67 | y574 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 959 | 697 |

## Changes

- Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
- Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
- Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
- 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
- Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
- Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
- Head third line = QUESTION 01 (OF 04 visually hidden for AT); Sonnet's second QUESTION 01 OF 04 + segment row removed (authority has none for FOUNDATION).
- Question title 15.7 → 11.8px one line; tiles 58×84 → 61×51, 17px icons, 5.2px labels (two lines max).
- Footer: BACK 68×24 · ✓ SAVED · CONTINUE 120×25 pinned right.

## Remaining

- Atrium plate (Grok). Orb material (glossy) approximated with SVG gradients.

## Grok slots

- `ENV.IDNTY.ATRIUM`
