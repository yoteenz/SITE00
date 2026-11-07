# 04 · Screen 03 RIDESHARE CARD — reconstruction

**Status: AUTHORITY_MATCH_CANDIDATE** (composition restored from the authority; founder approval pending). The page no
longer uses the generic 02 template.

## Composition (authority) → runtime

* AVAILABLE BALANCE (two lines) and the **gold** figure set straight on the exposed olive ground, left, with the authority's vertical rule beside them
* the keychain on its red-fabric / stone ground, right-middle, at authority scale
* the lower summary parchment with its engraved coastal landscape: SPENDABLE / PENDING / CARD STATUS between the art's own rules
* three action rows: TRANSACTION HISTORY · MANAGE CARD · CARD DETAILS
* the car wax seal on the title paper (authority-extracted) in place of 02's laurel

**Before:** 02's composition: CURRENT-BALANCE-style label and figure in the 02 balance-paper slot, the generic SK02 stats paper at right, the parent card thumbnail as a small identity tile in 02's scenic slot, rows SPENDABLE / SET ASIDE / PENDING, laurel seal.

**After:** the page's own scene band `[0, 548, 941, 1172]` (authority pixels; 39825 live-text px of 587184 reconstructed) with the
large keychain (leather car fob, brass key, ring, lemons and blossom) right-middle in it, live text at the authority's coordinates, SK02 strip papers seated on the authority's rows. No card
thumbnail, no SK02 balance / stats / scenic paper.

## Measured (authority px, 471 × 890 DSF 2, method 15-A)

Structure outside the live-text boxes — edge recall / precision / mean |Δ| (0–255):

| Region | BEFORE (#1713 `f7e2739c`) | OPUS1 (#1707 `0e930112`, founder-rejected) | AFTER (this sprint) |
|---|---|---|---|
| heading (y 0–548) | 0.905 / 0.906 / 23.7 | 0.905 / 0.907 / 23.6 | 0.924 / 0.913 / 21.7 |
| scene (band) | 0.382 / 0.611 / 79.7 | 0.376 / 0.627 / 73.6 | 0.991 / 0.982 / 7.5 |
| action rows (band foot – 1560) | 0.428 / 0.443 / 63.1 | 0.428 / 0.443 / 63.1 | 0.677 / 0.659 / 44.3 |

Live text — tight glyph boxes `[x0, y0, x1, y1]`, AFTER minus authority (px):

| Text | Authority | Runtime | Δleft | Δtop | Δright | Δbottom | size ratio |
|---|---|---|---|---|---|---|---|
| label | [102, 617, 324, 685] | [102, 617, 330, 686] | +0 | +0 | +6 | +1 | h 1.014 · w 1.027 |
| value | [98, 708, 350, 807] | [97, 710, 357, 811] | -1 | +2 | +7 | +4 | h 1.02 · w 1.032 |
| stat-1-label | [101, 890, 305, 914] | [103, 891, 306, 915] | +2 | +1 | +1 | +1 | h 1.0 · w 0.995 |
| stat-1-value | [506, 883, 595, 918] | [512, 886, 595, 920] | +6 | +3 | +0 | +2 | h 0.972 · w 0.933 |
| stat-2-label | [101, 962, 262, 985] | [102, 961, 260, 985] | +1 | -1 | -2 | +0 | h 1.042 · w 0.981 |
| stat-2-value | [555, 956, 595, 990] | [555, 956, 595, 990] | +0 | +0 | +0 | +0 | h 1.0 · w 1.0 |
| stat-3-label | [101, 1032, 338, 1055] | [102, 1031, 339, 1056] | +1 | -1 | +1 | +1 | h 1.083 · w 1.0 |
| stat-3-value | [468, 1032, 594, 1055] | [460, 1030, 595, 1057] | -8 | -2 | +1 | +2 | h 1.167 · w 1.071 |
| strip-1-label | [340, 1233, 730, 1258] | [340, 1204, 709, 1261] | +0 | -29 | -21 | +3 | h 2.231 · w 0.946 |
| strip-2-label | [340, 1377, 561, 1403] | [340, 1380, 539, 1406] | +0 | +3 | -22 | +3 | h 1.0 · w 0.901 |
| strip-3-label | [340, 1528, 757, 1585] | [340, 1530, 759, 1585] | +0 | +2 | +2 | +0 | h 0.966 · w 1.005 |

Strip-label offsets include the page's own figures vs the authority's sample figures (different string lengths move
the right edge); vertical offsets are the meaningful measure there.

## Remaining differences (honest)

* Action rows use **SK02's strip papers** and the founder's icons (Batches 01–04 / vectors), not the authority's own
  strip papers and line icons → rows region recall stays ≈ 0.6–0.7 (ASSET_MISMATCH, minor).
* The title on the heading paper is the shared heading (size / left inset within a few px of the authority; 03's longer
  name sits closer to the seal than the authority's) (TYPOGRAPHY_MISMATCH, minor).
* The MANAGE POCKET chip beside BACK is a product addition (Pocket sprint) the authority does not draw.
* The object is flattened in the band (no independent motion) until a native layer exists (report 07).
* Evidence: `evidence/priority/03_ENLARGED.webp`, `03_OVERLAY.webp`, `03_DIFF.webp`, `03_LAYERS.webp`, `03_SOURCE_MAP.webp`.
