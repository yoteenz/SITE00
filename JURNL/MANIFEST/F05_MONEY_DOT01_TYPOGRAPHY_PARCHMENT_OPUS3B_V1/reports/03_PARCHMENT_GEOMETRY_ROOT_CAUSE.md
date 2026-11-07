# 03 · Parchment geometry root cause

## Title paper (overlays 14–37)

Every overlay draws its heading on the SK03 SIDEKICK's **own** baked heading paper (`F05_DOT01_SK03_FIELD.webp`), one shape for
23 authorities. Measured right edge of each authority's title paper (board px, from the authority masters; evidence
`evidence/heads_14_37.jpg`):

| ≈ 560–620 | ≈ 640 (= SK03) | ≥ 680 (wider than SK03) |
|---|---|---|
| 14, 15, 27, 31, 32, 34, 35, 36, 37 | 18, 19, 21, 23, 26, 28 | **16** (≈ 715), **17** (≈ 700, amphora over it), **20** (≈ 680), **29** (≈ 760), **30** (≈ 720); 24, 25, 33 (≈ 660) |

So the SK03 paper is the right silhouette for most overlays, but **too narrow and too tall** for 16 RECORD TRANSACTION (authority
paper ≈ 625 × 205, aspect ≈ 3.0–3.4; SK03 paper ≈ 590 × 237, aspect 2.5) and for 20 / 29 / 30. That is the "excessive parchment
height" and "text swallowed by oversized paper" on 16: the paper the title sat on was not the paper drawn.

## Field strips (16 / 18 / 19)

The purchase form carries one row more than drawn (MERCHANT is required by the ledger), so `strips-dense` (base) set the strip
paper (`--d01-img-strip`, the 19 action strip 9-sliced) at 80 board px with 4 px gaps and the labels at 22.8 board px — the paper
was not stretched (border-image slices 60 / 80, fill) but its type was a size too small and its value column too narrow
(label : value = 0.95 : 1.25 against the authority's ≈ 0.47).

## Actions (all overlays)

The actions were CSS rectangles (OPUS3A report 08), so there was no paper geometry to respect at all.

## Not causes (checked)

* `background-size: cover` on a paper — no paper uses it (papers are `img` layers or `border-image` 9-slices).
* Vertical stretching of torn papers — none: every 9-slice has fixed top / bottom slices; heights grow only in the plain fill.
* Generic min-heights — `.d01-btn` had `min-height: 48px`, `.d01-field` 48 px; the strip rows override to the authority pitch.
* Flex-grow in the content — `.jrn-d01__content > * { margin: auto 0 }` spreads papers on a tall phone; it never stretches one.
