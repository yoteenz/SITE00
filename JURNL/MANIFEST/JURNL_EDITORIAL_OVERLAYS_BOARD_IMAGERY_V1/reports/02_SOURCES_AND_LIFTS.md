# 02 · Sources and lifts

Script: `scripts/jurnl/f05-motion-pilot/lift_editorial_board_parts.py` (re-runnable; `JURNL_ED_PREVIEW=<dir>` writes checker previews).
Provenance: `src/projects/jurnl/families/F05_MONEY/EDITORIAL/F05_ED_PARTS.json` (board sha256 `252343d723df3568…`, SK01 sha256 `b68e5012f29fd47a…`).
Contact sheet: `evidence/parts/F05_ED_PARTS_contact_sheet.webp`.

Every part is a crop of approved pixels plus an alpha. Nothing was generated, no image model and no paid provider was used.

* **grabcut**: OpenCV GrabCut (classical graph cut) seeded by measured boxes and polygons.
* **disc / poly**: a measured geometric mask.
* **red / copper**: a colour key (the drapes, the clip's wire).
* The ledgers' gilt spine lettering was removed with Telea inpainting from the spine's own leather, so no text is baked in.
* The 07 drape keeps only its crumpled torn rim. Where the board lettered or laid cards, the alpha is 0 and the runtime's flat oxblood shows under live text.

Board lifts are stored at 2× the board, resampled with Lanczos plus a light unsharp mask. The board is 1448 × 1086, so a panel is about 346 px wide. That is about 1 board px per CSS px at 393, so on a DSF 3 phone these lifts are about 3× upsampled. They are softer than the SK01 / V9 art. That is the honest limit of the only source the board's own subjects exist in.

| Runtime file | Source | Box (source px) | Mask | Size | Subject |
|---|---|---|---|---|---|
| `F05_ED_BUST.webp` | SK01_PARENT_MONEY.png | [150, 0, 560, 352] | grabcut | 341 × 351 | SK01 bust (the same marble head the board draws in 01 / 03 / 08); GrabCut, lower cut at the SK01 heading paper. |
| `F05_ED_B01_AMPHORA.webp` | founder board, panel 01 | [232, 310, 324, 422] | grabcut | 166 × 210 | the copper amphora over the end of ADD A POCKET |
| `F05_ED_B01_COIN.webp` | founder board, panel 01 | [232, 424, 344, 536] | disc | 206 × 206 | the silver coin over the end of MOVE MONEY |
| `F05_ED_B01_FABRIC.webp` | founder board, panel 01 | [18, 140, 364, 600] | red | 692 × 884 | the red drapes behind the papers (colour key) |
| `F05_ED_B02_MEDALLION.webp` | founder board, panel 02 | [392, 140, 510, 246] | grabcut | 200 × 178 | the bronze laurel medallion with the money bag |
| `F05_ED_B02_COINS.webp` | founder board, panel 02 | [578, 470, 690, 542] | grabcut | 183 × 118 | the coin stack beside the opening balance |
| `F05_ED_B02_FABRIC.webp` | founder board, panel 02 | [378, 140, 715, 600] | red | 613 × 759 | the red drape behind the medallion |
| `F05_ED_B03_SEAL.webp` | founder board, panel 03 | [864, 330, 938, 386] | grabcut | 140 × 99 | the red wax direction seal with its white arrows |
| `F05_ED_B04_CLIP.webp` | founder board, panel 04 | [1129, 264, 1193, 340] | copper | 111 × 139 | the copper paper clip |
| `F05_ED_B04_FABRIC.webp` | founder board, panel 04 | [1083, 290, 1283, 540] | red | 383 × 494 | the red drape under the fragment |
| `F05_ED_B05_BOOKS.webp` | founder board, panel 05 | [18, 848, 132, 1022] | poly | 217 × 348 | the stack of three ledgers (spine lettering inpainted away) |
| `F05_ED_B05_FABRIC.webp` | founder board, panel 05 | [18, 974, 218, 1058] | red | 361 × 124 | the red drape under the ledgers |
| `F05_ED_B06_MEDALLION.webp` | founder board, panel 06 | [384, 644, 524, 770] | grabcut | 259 × 227 | the bronze laurel medallion with the classical head |
| `F05_ED_B06_COLUMNS.webp` | founder board, panel 06 | [378, 920, 448, 1058] | poly | 137 × 272 | the two columns at the lower left |
| `F05_ED_B06_LANDSCAPE.webp` | founder board, panel 06 | [432, 980, 715, 1058] | poly | 566 × 156 | the painted landscape under SIGN OUT |
| `F05_ED_B06_FABRIC.webp` | founder board, panel 06 | [378, 704, 438, 944] | red | 120 × 462 | the red drape at the left edge |
| `F05_ED_B07_MEDALLION.webp` | founder board, panel 07 | [744, 664, 850, 776] | grabcut | 194 × 179 | the bronze laurel medallion with the caution sign |
| `F05_ED_B07_COLUMN.webp` | founder board, panel 07 | [1016, 840, 1070, 1058] | poly | 108 × 436 | the column at the right |
| `F05_ED_B07_FABRIC.webp` | founder board, panel 07 | [728, 644, 1070, 1058] | red | 647 × 785 | the oxblood drape as one sheet: its outline filled and every hole (lettering, medallion, cards) inpainted from the drape itself |
| `F05_ED_B08_FABRIC.webp` | founder board, panel 08 | [1083, 644, 1143, 1058] | red | 120 × 824 | the red drape along the left edge |
| `F05_ED_B01_COAST.webp` | founder board, panel 01 | [18, 538, 282, 600] | poly | 528 × 122 | the painted coastal village at the lower left |

Unchanged approved art also mounted in the overlays:

* V9 `F05_DOT01_01_HEADING_PARCHMENT`, `_09_BLANK_TORN_PARCHMENT`, `_13_TORN_PARCHMENT_PANEL` and `_14_LARGE_PARCHMENT_SHEET`, all 9-sliced.
* `_04_LEMON_BRANCH_BLOSSOMS`, `_10_SMALL_OLIVE_FOLIAGE`, `_03_OLIVE_BRANCH_RED_FABRIC`.
* `SK02_FIELD_TILE`.
* The SK01 arch region (painted).
* The SK03 cream / dark pills, for the footer actions.
