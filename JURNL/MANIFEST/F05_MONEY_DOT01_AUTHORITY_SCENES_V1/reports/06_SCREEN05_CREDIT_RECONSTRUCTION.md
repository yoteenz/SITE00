# 06 · Screen 05 CREDIT CARD — reconstruction

**Status: AUTHORITY_MATCH_CANDIDATE** (composition restored from the authority; founder approval pending). The page no
longer uses the generic 02 template.

## Composition (authority) → runtime

* CURRENT BALANCE and the cream figure on the olive ground, left, with OWED upright between two rules
* the credit panel upper-right: CREDIT LIMIT / AVAILABLE CREDIT (two lines) / DUE DATE between the art's own rules, figures 1.6× the labels
* the bronze coin over the red fabric fold with olive sprig, right, at authority scale
* four action rows with moss / terracotta tiles: MAKE A PAYMENT · RECORD PURCHASE · TRANSACTION HISTORY · CARD DETAILS

**Before:** 02's composition: figure in the 02 balance slot on the dark field, the SK02 stats paper, the parent credit-card thumbnail as identity tile, rows at a fixed pitch.

**After:** the page's own scene band `[0, 548, 941, 1044]` (authority pixels; 44875 live-text px of 466736 reconstructed) with the
large bronze laureate coin over red fabric in it, live text at the authority's coordinates, SK02 strip papers seated on the authority's rows. No card
thumbnail, no SK02 balance / stats / scenic paper.

## Measured (authority px, 471 × 890 DSF 2, method 15-A)

Structure outside the live-text boxes — edge recall / precision / mean |Δ| (0–255):

| Region | BEFORE (#1713 `f7e2739c`) | OPUS1 (#1707 `0e930112`, founder-rejected) | AFTER (this sprint) |
|---|---|---|---|
| heading (y 0–548) | 0.929 / 0.943 / 20.5 | 0.931 / 0.945 / 20.2 | 0.931 / 0.945 / 20.2 |
| scene (band) | 0.314 / 0.511 / 78.8 | 0.303 / 0.566 / 63.8 | 0.989 / 0.962 / 8.7 |
| action rows (band foot – 1560) | 0.520 / 0.579 / 64.0 | 0.520 / 0.579 / 64.0 | 0.643 / 0.731 / 45.8 |

Live text — tight glyph boxes `[x0, y0, x1, y1]`, AFTER minus authority (px):

| Text | Authority | Runtime | Δleft | Δtop | Δright | Δbottom | size ratio |
|---|---|---|---|---|---|---|---|
| label | [94, 646, 431, 667] | [98, 645, 426, 666] | +4 | -1 | -5 | -1 | h 1.0 · w 0.973 |
| value | [133, 706, 412, 813] | [141, 705, 384, 813] | +8 | -1 | -28 | +0 | h 1.009 · w 0.871 |
| caption | [104, 847, 423, 869] | [96, 848, 431, 869] | -8 | +1 | +8 | +0 | h 0.957 · w 1.05 |
| stat-1-label | [507, 615, 695, 633] | [507, 614, 691, 632] | +0 | -1 | -4 | -1 | h 1.0 · w 0.979 |
| stat-1-value | [771, 611, 883, 644] | [755, 608, 885, 638] | -16 | -3 | +2 | -6 | h 0.912 · w 1.159 |
| stat-2-label | [507, 681, 666, 729] | [507, 679, 647, 726] | +0 | -2 | -19 | -3 | h 0.98 · w 0.881 |
| stat-2-value | [775, 687, 884, 722] | [770, 684, 885, 722] | -5 | -3 | +1 | +0 | h 1.083 · w 1.055 |
| stat-3-label | [508, 770, 647, 788] | [507, 767, 636, 785] | -1 | -3 | -11 | -3 | h 1.0 · w 0.929 |
| stat-3-value | [768, 765, 885, 795] | [769, 763, 885, 792] | +1 | -2 | +0 | -3 | h 0.968 · w 0.992 |
| strip-1-label | [330, 1081, 619, 1105] | [330, 1081, 604, 1106] | +0 | +0 | -15 | +1 | h 1.04 · w 0.948 |
| strip-2-label | [330, 1204, 635, 1229] | [330, 1204, 644, 1229] | +0 | +0 | +9 | +0 | h 1.0 · w 1.029 |
| strip-3-label | [330, 1333, 721, 1357] | [330, 1334, 720, 1359] | +0 | +1 | -1 | +2 | h 1.04 · w 0.997 |
| strip-4-label | [332, 1465, 549, 1490] | [333, 1465, 547, 1491] | +1 | +0 | -2 | +1 | h 1.038 · w 0.986 |

Strip-label offsets include the page's own figures vs the authority's sample figures (different string lengths move
the right edge); vertical offsets are the meaningful measure there.

## Remaining differences (honest)

* Action rows use **SK02's strip papers** and the founder's icons (Batches 01–04 / vectors), not the authority's own
  strip papers and line icons → rows region recall stays ≈ 0.6–0.7 (ASSET_MISMATCH, minor).
* The title on the heading paper is the shared heading (size / left inset within a few px of the authority; 03's longer
  name sits closer to the seal than the authority's) (TYPOGRAPHY_MISMATCH, minor).
* The figure face is narrower than the authority's (height matched within 1 %, width ≈ 0.87): the authority's figure is set in a wider cut than the JURNL serif.
* The MANAGE POCKET chip beside BACK is a product addition (Pocket sprint) the authority does not draw.
* The object is flattened in the band (no independent motion) until a native layer exists (report 07).
* Evidence: `evidence/priority/05_ENLARGED.webp`, `05_OVERLAY.webp`, `05_DIFF.webp`, `05_LAYERS.webp`, `05_SOURCE_MAP.webp`.
