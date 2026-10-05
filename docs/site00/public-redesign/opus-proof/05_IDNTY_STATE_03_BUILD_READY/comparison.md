# 05_IDNTY_STATE_03_BUILD_READY

- **Route:** `/idnty/build-ready` · **Frame:** 390×849 (850×1850)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PASS

## Measured landmarks

| Landmark | SONNET | OPUS |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y22 x30 59×10 |
| Hero title | y86 x22 200×57 | y76 x30 150×42 |
| Machine box | y130 x22 346×232 | y67 x-47 484×372 |
| 00–03 rail | y364 x30 330×28 | y394 x47 296×26 |
| Working panel | y420 x22 346×410 | y448 x18 354×310 |
| Panel code | y444 x39 65×41 | y465 x35 58×36 |
| Actions / CTA | y768 x39 312×46 | y708 x35 320×32 |
| Bottom nav | y785 x0 390×64 | y789 x0 390×60 |
| Document height | 914 | 849 |

## Changes

- Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
- Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
- Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
- 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
- Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
- Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
- Detail machine = star with concentric rings and crosshair beads (domain nodes appear only in the verification flow, as drawn).
- "NO IDNTY PURCHASE REQUIRED" set as a two-line statement (8.6px) instead of a 3-line price.

## Remaining

- Honesty deviation kept: verification copy + BEGIN VERIFICATION (authority: "locked and verified … ENTER BLDR").

## Grok slots

- `ENV.IDNTY.ATRIUM`
