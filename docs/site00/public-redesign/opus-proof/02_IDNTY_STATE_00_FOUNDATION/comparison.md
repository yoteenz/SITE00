# 02_IDNTY_STATE_00_FOUNDATION

- **Route:** `/idnty/starting-at-zero` · **Frame:** 390×693 (941×1672 / 1080×1920)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PASS

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

- Authority discrepancy (documented, not propagated): this image is drawn in the 941-family scale, ≈8% larger than the FOUNDATION question screens (panel top 388 vs family 363). FOUNDER DECISION (OPUS-SURGICAL-CLEANUP1): family continuity outranks the single inconsistent dimension — State 00 detail is normalised to the FOUNDATION family; hero, machine, rail, panel top/head and nav are measured IDENTICAL to 01_FOUNDATION_PRIMARY_GOAL at 390×693, 360×740, 430×932 and 390×844 (opus-continuity.json).

## Grok slots

- `ENV.IDNTY.ATRIUM`

## OPUS-SURGICAL-CLEANUP1 proof

- **Founder decision:** family continuity outranks this authority's ~8% larger 941-family scale. Normalised to the FOUNDATION family; the discrepancy is documented, not propagated.
- `continuity-foundation.jpg`: STATE 00 DETAIL | PRIMARY GOAL at 390×693. `continuity-foundation-390x844.jpg`: the same at the tall-phone frame.
- `after-360x740.png`, `after-430x932.png`, `after-390x844.png`: other widths. `after-convergence1.png`: the previous Opus capture (unchanged geometry).
- `../../opus-continuity.json`: header, hero, side note, machine, rail, active node, panel top/head, numeral and nav are **identical** to `01_FOUNDATION_PRIMARY_GOAL` at all four sizes.
- **After:** PASS.
