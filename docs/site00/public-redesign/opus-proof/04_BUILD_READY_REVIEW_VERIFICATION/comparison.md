# 04_BUILD_READY_REVIEW_VERIFICATION

- **Route:** `/idnty/build-ready/review` · **Frame:** 390×693 (941×1672 / 1080×1920)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PASS

## Measured landmarks

| Landmark | SONNET | OPUS |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y311 x81 228×20 |
| Working panel | y420 x22 346×437 | y353 x18 354×286 |
| Panel code | y465 x39 65×41 | y369 x33 50×31 |
| First option / row | y599 x39 58×107 | y451 x33 61×86 |
| Actions / CTA | y790 x23 344×67 | y587 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 942 | 710 |

## Changes

- Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
- Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
- Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
- 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
- Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
- 5 domain tiles 62×86; EVIDENCE STATUS with the star glyph (authority) instead of a node glyph; REVIEW VERIFICATION in strong black.

## Remaining

- —

## Grok slots

- `ENV.IDNTY.ATRIUM`
