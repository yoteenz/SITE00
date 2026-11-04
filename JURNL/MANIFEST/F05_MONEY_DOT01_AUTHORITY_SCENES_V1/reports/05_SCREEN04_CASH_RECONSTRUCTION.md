# 05 · Screen 04 CASH ON HAND — reconstruction

**Status: AUTHORITY_MATCH_CANDIDATE** (composition restored from the authority; founder approval pending). The page no
longer uses the generic 02 template.

## Composition (authority) → runtime

* TOTAL ON HAND (one line, wide tracking) and the cream figure centred on the olive ground, right
* the amphora with lemon and stone base, lower-left, at authority scale
* the smaller summary parchment (right) with BILLS SET ASIDE / SPENDING CASH / LAST UPDATED, and the landscape strip under it
* four action rows: ADD CASH · RECORD CASH SPENDING · USAGE HISTORY · CASH DETAILS

**Before:** 02's composition with four rows forced to a fixed 118 px pitch, the parent cash-card thumbnail as identity tile, rows BILLS SET ASIDE / SPENDING CASH / NOT LEFT YET.

**After:** the page's own scene band `[0, 542, 941, 1138]` (authority pixels; 40378 live-text px of 560836 reconstructed) with the
large terracotta amphora lower-left in it, live text at the authority's coordinates, SK02 strip papers seated on the authority's rows. No card
thumbnail, no SK02 balance / stats / scenic paper.

## Measured (authority px, 471 × 890 DSF 2, method 15-A)

Structure outside the live-text boxes — edge recall / precision / mean |Δ| (0–255):

| Region | BEFORE (#1713 `f7e2739c`) | OPUS1 (#1707 `0e930112`, founder-rejected) | AFTER (this sprint) |
|---|---|---|---|
| heading (y 0–548) | 0.905 / 0.930 / 23.2 | 0.905 / 0.932 / 23.2 | 0.909 / 0.932 / 23.1 |
| scene (band) | 0.349 / 0.631 / 87.3 | 0.301 / 0.629 / 80.6 | 0.986 / 0.977 / 7.9 |
| action rows (band foot – 1560) | 0.408 / 0.497 / 62.4 | 0.408 / 0.497 / 62.4 | 0.628 / 0.734 / 46.0 |

Live text — tight glyph boxes `[x0, y0, x1, y1]`, AFTER minus authority (px):

| Text | Authority | Runtime | Δleft | Δtop | Δright | Δbottom | size ratio |
|---|---|---|---|---|---|---|---|
| label | [428, 599, 816, 628] | [428, 599, 816, 627] | +0 | +0 | +0 | -1 | h 0.967 · w 1.0 |
| value | [511, 647, 747, 743] | [508, 650, 742, 749] | -3 | +3 | -5 | +6 | h 1.031 · w 0.992 |
| stat-1-label | [418, 801, 671, 824] | [419, 802, 683, 826] | +1 | +1 | +12 | +2 | h 1.042 · w 1.043 |
| stat-1-value | [841, 799, 880, 832] | [839, 801, 880, 829] | -2 | +2 | +0 | -3 | h 0.853 · w 1.05 |
| stat-2-label | [417, 871, 672, 894] | [418, 873, 680, 896] | +1 | +2 | +8 | +2 | h 1.0 · w 1.027 |
| stat-2-value | [800, 869, 881, 902] | [799, 868, 880, 902] | -1 | -1 | -1 | +0 | h 1.029 · w 1.0 |
| stat-3-label | [417, 940, 653, 963] | [419, 942, 660, 965] | +2 | +2 | +7 | +2 | h 1.0 · w 1.021 |
| stat-3-value | [768, 940, 882, 963] | [757, 941, 881, 968] | -11 | +1 | -1 | +5 | h 1.167 · w 1.087 |
| strip-1-label | [330, 1189, 467, 1216] | [330, 1188, 477, 1215] | +0 | -1 | +10 | -1 | h 1.0 · w 1.072 |
| strip-2-label | [330, 1306, 745, 1333] | [333, 1305, 773, 1332] | +3 | -1 | +28 | -1 | h 1.0 · w 1.06 |
| strip-3-label | [330, 1425, 578, 1452] | [330, 1424, 773, 1479] | +0 | -1 | +195 | +27 | h 2.0 · w 1.783 |
| strip-4-label | [330, 1540, 661, 1602] | [336, 1544, 560, 1571] | +6 | +4 | -101 | -31 | h 0.444 · w 0.678 |

Strip-label offsets include the page's own figures vs the authority's sample figures (different string lengths move
the right edge); vertical offsets are the meaningful measure there.

## Remaining differences (honest)

* Action rows use **SK02's strip papers** and the founder's icons (Batches 01–04 / vectors), not the authority's own
  strip papers and line icons → rows region recall stays ≈ 0.6–0.7 (ASSET_MISMATCH, minor).
* The title on the heading paper is the shared heading (size / left inset within a few px of the authority; 03's longer
  name sits closer to the seal than the authority's) (TYPOGRAPHY_MISMATCH, minor).
* The MANAGE POCKET chip beside BACK is a product addition (Pocket sprint) the authority does not draw.
* The object is flattened in the band (no independent motion) until a native layer exists (report 07).
* Evidence: `evidence/priority/04_ENLARGED.webp`, `04_OVERLAY.webp`, `04_DIFF.webp`, `04_LAYERS.webp`, `04_SOURCE_MAP.webp`.
