# 01_IDNTY_DIAGNOSTIC_OVERVIEW

- **Route:** `/idnty/state` · **Frame:** 390×693 (941×1672 / 1080×1920)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PASS

## Measured landmarks

| Landmark | SONNET | OPUS |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×240 | y30 x0 390×320 |
| 00–03 rail | y372 x30 330×28 | y346 x81 228×20 |
| Card row | y428 x22 346×501 | y393 x16 358×201 |
| First card | y428 x22 169×246 | y393 x16 87×201 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1069 | 705 |

## Changes

- Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
- Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
- Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
- State cards: 2×2 (cards cut by the nav) → ONE row of four 86×188 cards like the authority; codes as light plain-zero numerals; CTA pills 18px with outlined/filled arrow discs.
- Overview machine: orb + tilted orbit + capsule frame at (207,195).
- IDENTITY INVESTMENT row at y≈610 (authority 600).

## Remaining

- Atrium plate (Grok).
- Card glyphs are compact live SVG (authority line art is denser).

## Grok slots

- `ENV.IDNTY.ATRIUM`
