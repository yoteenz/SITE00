# 11 · Grok asset mapping and approval (Batch 05 / 06)

Grok micro-assets are **secondary** to the authority scenes. This sprint mounted **no new Grok asset** and used **none**
for the 03 / 04 / 05 compositions (their art is authority-extracted, report 07). The OPUS1 qualification (cherry-picked
unchanged, `BATCH_05_06_REVIEW.json`, test `jurnlF05MicroAssetsB0506.test.ts` B1–B5) still governs:

* counts: {"CORRECTION_REQUIRED": 7, "EXACT_APPROVED_SOURCE_REUSE": 6, "REJECTED": 6, "VISUALLY_QUALIFIED_CANDIDATE": 1}
* mounted with runtime art: only `F05.D01.CTRL.BACK.PARCHMENT.LIGHT` (CANDIDATE_FOR_REVIEW, back chip on paper tone) and
  `F05.D01.SURFACE.ACTION.TORN` (EXACT_SOURCE_REUSE of the founder's own strip paper); the dock keeps its vectors.
* known issues respected: **B05-02** specular gloss + checker residue (not mounted) · **B05-03** stray leaves on the
  frame (not mounted) · **B06-02** scan beam is a 100 % opaque 528 435 px halo with a 13 px core (not mounted) ·
  21:9 assets are **never stretched** (not mounted where a different aspect is needed).
* no bulk mounting; nothing is approved by being registered (`founderApproval: PENDING` on all 20).

| Registry id | Grok file | px | checker residue % | classification | decision | founder | note |
|---|---|---|---|---|---|---|---|
| `F05.D01.CTRL.BACK.PARCHMENT.LIGHT` | B05_01_LIGHT_PARCHMENT_BACK_TILE.png | 1360×1360 | 0.1 | VISUALLY_QUALIFIED_CANDIDATE | MOUNT_FOR_FOUNDER_REVIEW | PENDING | one torn tile with the ink arrow, as 02 / 14 / 26 / 27 draw it; replaces the 9-sliced blank paper + Batch 01 arrow (visible slice seams). Cl |
| `F05.D01.CTRL.BACK.PARCHMENT.DARK` | B05_02_DARK_BORDERED_BACK_TILE.png | 1360×1360 | 26.4 | CORRECTION_REQUIRED | NOT_MOUNTED | PENDING | worse than the runtime: dark olive fill, thick brass rim and a specular highlight; 06 / 07 draw a flat translucent amber-brown tile with a t |
| `F05.D01.SURFACE.BACK.FRAME` | B05_03_ENGRAVED_BACK_FRAME.png | 1360×1360 | 32.4 | CORRECTION_REQUIRED | NOT_MOUNTED | PENDING | corner leaves are not in any authority, and no authority draws a frame around the back chip. Opaque checker residue around the rim. |
| `F05.D01.SURFACE.ACTION.TORN` | B05_04_TORN_PARCHMENT_ACTION_STRIP.png | 1200×183 | 0.1 | EXACT_APPROVED_SOURCE_REUSE | ALREADY_MOUNTED_AS_SOURCE | PENDING | pixel-identical to F05_DOT01_19_PARCHMENT_ACTION_STRIP (alpha and colour MAD 0.0 on every opaque pixel); the runtime already renders that la |
| `F05.D01.SURFACE.ACTION.MOSS` | B05_05_MOSS_PRIMARY_BUTTON_SURFACE.png | 3136×1344 | 26.3 | CORRECTION_REQUIRED | NOT_MOUNTED | PENDING | brass rim not in the authority (14 / 26 draw a dark olive pill with a lighter olive edge); 4.1 : 1 material vs 7–9 : 1 controls (would need  |
| `F05.D01.SURFACE.ACTION.CREAM` | B05_06_CREAM_SECONDARY_BUTTON_SURFACE.png | 3136×1344 | 23.7 | CORRECTION_REQUIRED | NOT_MOUNTED | PENDING | smooth rim with a double olive line; 26 / 34 draw a deckled cream pill; 4.5 : 1 vs 7–9 : 1; opaque checker residue. |
| `F05.D01.SURFACE.CHIP.PARCHMENT` | B05_07_PARCHMENT_FILTER_CHIP.png | 3136×1344 | 16.3 | REJECTED | NOT_MOUNTED | PENDING | wrong form: 21 / 31 draw smooth rounded pills (cream with a thin ink border, or olive when selected); the candidate is a torn paper scrap. O |
| `F05.D01.SURFACE.FIELD.PAPER` | B05_08_ENGRAVED_PAPER_INPUT_FIELD.png | 3136×1344 | 26.0 | CORRECTION_REQUIRED | NOT_MOUNTED | PENDING | dark olive rim not in the authority (14 / 16 fields are light deckled cream with a soft inner shadow); 4.1 : 1 vs ≈ 11 : 1 fields; opaque ch |
| `F05.D01.SURFACE.ACCOUNT.TILE` | B05_09_ILLUSTRATED_ACCOUNT_CARD_TILE.png | 2304×1296 | 24.4 | REJECTED | NOT_MOUNTED | PENDING | the founder card compositions (F05_DOT01_05–07) already mounted on 06 match the authority (06 converged in S7); a generated stand-in would l |
| `F05.D01.SURFACE.RECEIPT.TAB` | B05_10_TORN_RECEIPT_PREVIEW_TAB.png | 3136×1344 | 24.5 | REJECTED | NOT_MOUNTED | PENDING | a blank torn panel; the founder layers 16 / 17 (receipt frame and torn receipt strip) already cover this role with exact source art. Opaque  |
| `F05.D01.OVERLAY.RECEIPT.SCAN.CORNERS` | B06_01_RECEIPT_SCANNER_FOUR_CORNERS.png | 1360×1360 | 28.3 | CORRECTION_REQUIRED | NOT_MOUNTED | PENDING | 26 / 27 draw thin white L brackets (≈ 6 px at 941); the candidate is a thick cream / gold bracket with opaque checker squares beside each co |
| `F05.D01.OVERLAY.RECEIPT.SCAN.BEAM` | B06_02_RECEIPT_SCANNING_BEAM.png | 3136×1344 | 0.2 | CORRECTION_REQUIRED | NOT_MOUNTED | PENDING | the amber line is right, but the "halo" is the provider checkerboard tinted by the glow (opaque warm squares in a lens shape), not a soft al |
| `F05.D01.OVERLAY.RECEIPT.DUPLICATE` | B06_03_DUPLICATE_RECEIPT_COMPARISON_MARK.png | 1360×1360 | 25.8 | REJECTED | NOT_MOUNTED | PENDING | 29 draws a small dark red circle with a white ⇄ between CURRENT RECEIPT and POSSIBLE MATCH; the candidate is a large embossed bronze pair of |
| `F05.D01.OVERLAY.EDIT.COMPARISON` | B06_04_ORIGINAL_TO_REVISED_BADGE.png | 1360×1360 | 20.6 | REJECTED | NOT_MOUNTED | PENDING | 37 draws a small dark olive circle with a white →; the candidate is a bronze coin with two documents. Opaque checker residue. |
| `F05.D01.ICON.NAV.HOME` | B06_05_DOCK_HOME.png | 1024×1024 | 0.0 | EXACT_APPROVED_SOURCE_REUSE | VECTOR_KEPT | PENDING | raster of the shipping vector path; the runtime keeps the vector (sharper, state colours, accessibility). |
| `F05.D01.ICON.NAV.MONEY` | B06_06_DOCK_MONEY.png | 1024×1024 | 0.0 | EXACT_APPROVED_SOURCE_REUSE | VECTOR_KEPT | PENDING | raster of the shipping vector path; vector kept. |
| `F05.D01.ICON.NAV.ADD` | B06_07_DOCK_ADD.png | 1024×1024 | 0.0 | EXACT_APPROVED_SOURCE_REUSE | VECTOR_KEPT | PENDING | raster of the shipping vector path; vector kept. |
| `F05.D01.ICON.NAV.PLAN` | B06_08_DOCK_PLAN.png | 1024×1024 | 0.0 | EXACT_APPROVED_SOURCE_REUSE | VECTOR_KEPT | PENDING | raster of the shipping vector path; vector kept. |
| `F05.D01.ICON.NAV.CREDIT` | B06_09_DOCK_CREDIT.png | 1024×1024 | 0.0 | EXACT_APPROVED_SOURCE_REUSE | VECTOR_KEPT | PENDING | raster of the shipping vector path; vector kept. |
| `F05.D01.SURFACE.STATUS.RED` | B06_10_TERRACOTTA_CAUTION_STATUS_SURFACE.png | 3136×1344 | 25.9 | REJECTED | NOT_MOUNTED | PENDING | wrong form: 29 / 34 / 36 draw a flat torn red paper panel; the candidate is a curled ribbon banner with folded tails. Opaque checker residue |

**Founder decisions needed** (report 20): approve / reject the light back tile candidate; commission corrections for the
seven CORRECTION_REQUIRED files; confirm the six rejections.
