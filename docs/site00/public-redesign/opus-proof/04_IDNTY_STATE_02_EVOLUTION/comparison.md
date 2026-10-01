# 04_IDNTY_STATE_02_EVOLUTION

- **Route:** `/idnty/ready-for-evolution` · **Frame:** 390×849 (850×1850)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PASS

## Measured landmarks

| Landmark | SONNET | OPUS |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y22 x30 59×10 |
| Hero title | y86 x22 200×57 | y76 x30 150×42 |
| Machine box | y130 x22 346×240 | y25 x-47 484×372 |
| 00–03 rail | y372 x30 330×28 | y394 x47 296×26 |
| Working panel | y428 x22 346×376 | y448 x18 354×298 |
| Panel code | y452 x39 65×41 | y465 x35 58×36 |
| Actions / CTA | y744 x39 312×46 | y696 x35 320×32 |
| Bottom nav | y785 x0 390×64 | y789 x0 390×60 |
| Document height | 888 | 849 |

## Changes

- Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
- Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
- Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
- 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
- Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
- Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
- Waveform registered lower in the tall family (centre ≈268).
- Head title READY FOR / EVOLUTION wraps at the authority width (≈100px column).

## Remaining

- Atrium plate (Grok).

## Grok slots

- `ENV.IDNTY.ATRIUM`
