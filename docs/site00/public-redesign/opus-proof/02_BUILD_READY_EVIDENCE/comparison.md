# 02_BUILD_READY_EVIDENCE

- **Route:** `/idnty/build-ready/evidence` · **Frame:** 390×693 (941×1672 / 1080×1920)
- **Files:** `authority.jpg` (pack image resized to 390 wide — reference only, never shipped) · `before.png` (Sonnet `a86c8cd`, real Martian Mono) · `after.png` (Opus) · `comparison.jpg` (AUTHORITY | SONNET | OPUS) · `*-full.jpg` full-page · `metrics-*.json` (incl. measured asset-slot boxes)
- **Before:** PARTIAL · **After:** PASS

## Measured landmarks

| Landmark | SONNET | OPUS |
|---|---|---|
| Header wordmark | y32 x22 82×17 | y14 x30 59×10 |
| Hero title | y86 x22 200×57 | y65 x30 150×42 |
| Machine box | y130 x22 346×232 | y28 x0 390×300 |
| 00–03 rail | y364 x30 330×28 | y311 x81 228×20 |
| Working panel | y420 x22 346×737 | y353 x18 354×294 |
| Panel code | y450 x39 65×41 | y366 x33 50×31 |
| Question title | y554 x39 312×36 | y416 x33 324×14 |
| First option / row | y634 x39 312×96 | y454 x33 324×28 |
| Actions / CTA | y1089 x23 344×67 | y601 x19 352×45 |
| Bottom nav | y629 x0 390×64 | y633 x0 390×60 |
| Document height | 1241 | 717 |

## Changes

- Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
- Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
- Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
- 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
- Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
- Evidence rows 29px, quiet chips (4.3px).
- OPUS-SURGICAL-CLEANUP1 (evidence step only): body top 9→5, question→rows gap 9→4, row 31→29 (padding 2.5→2, status gap 2.5→2), name column fitted to EXPERIENCE (58→52) + icon/chevron columns 22/12→20/10 + chip side padding 4.5→3.5 and tracking .04→.02em so 3 chips + "+N" never wrap; actions top padding 13→6. Type sizes unchanged. Tall phones keep the width-scaled row unit so chips never wrap.

## Remaining

- None structural. CONTINUE pill y607→632 at 390×693 (authority 606→628); rows from y454 at a 29px pitch (authority 452 / 30).

## Grok slots

- `ENV.IDNTY.ATRIUM`

## OPUS-SURGICAL-CLEANUP1 proof

- `after-convergence1.png`: before this sprint. The CONTINUE pill bottom was at y669, under the nav (633).
- `after.png`: after. The CONTINUE pill sits at y607→632 (authority 606→628).
- `after-360x740.png`, `after-430x932.png`, `after-390x844.png`: CONTINUE above the nav at every size, chips on one line.
- `continuity-build-ready.jpg`: VERIFICATION | EVIDENCE | AUTHORITY CHECK | REVIEW at 390×693.
  - Shared landmarks are identical with VERIFICATION.
  - AUTHORITY CHECK / REVIEW differ only by their authority-drawn extra head line.
- **After:** PASS.
