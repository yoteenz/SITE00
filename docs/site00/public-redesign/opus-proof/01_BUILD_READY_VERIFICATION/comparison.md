# 01_BUILD_READY_VERIFICATION

- **Route:** `/idnty/build-ready/verification` · **Frame:** 390×693 (941×1672 / 1080×1920)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PASS

## Measured landmarks

| Landmark | SONNET | OPUS |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y311 x81 228×20 |
| Working panel | y420 x22 346×537 | y353 x18 354×295 |
| Panel code | y450 x39 65×41 | y366 x33 50×31 |
| Question title | y550 x39 312×36 | y420 x33 324×14 |
| First option / row | y630 x39 312×48 | y463 x33 324×25 |
| Actions / CTA | y889 x23 344×67 | y595 x19 352×52 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1041 | 718 |

## Changes

- Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
- Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
- Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
- 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
- Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
- Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
- BUILD READY rail at y321 / panel 352; head: IDENTITY AUTHORITY VERIFICATION, no counter row (authority).
- Star machine with five identity-domain nodes; node fill = what the PERSON supplied (provisional), never verification.
- Domain rows 25px: icon · name · mark · status · node glyph · chevron.

## Remaining

- Atrium plate (Grok).

## Grok slots

- `ENV.IDNTY.ATRIUM`
