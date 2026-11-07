# 05 · RECORD TRANSACTION (16) — before / after

Authority: `16_RECORD_BANK_TRANSACTION.png` (V9 master). SIDEKICK: SK03 (`F05_DOT01_SK03_FIELD.webp` environment). Motion layers:
V9 asset 12 (wide torn banner), the SK03 action sheet (pills). Runtime: `PurchaseFlow` (`sheets/EntrySheets.tsx`) in
`Dot01Overlay` (`Dot01Frame.tsx`). Evidence: `evidence/16/16_full_authority_before_after_board_px.webp` and the four crops
(heading · scan block · rows · action), board px; AFTER also at 471 × 836 / 393 × 852 / 393 × 660 in `evidence/compare/16.webp`.

## Measurements (board px of the 941 × 1672 board; runtime measured at 471 × 836 through the DOM)

| Element | Authority 16 | Before (`8e0b8d861`) | After |
|---|---|---|---|
| A · title | RECORD x 192–470 · TRANSACTION x 192–685, cap ≈ 50, pitch 64 | 66.9 px type, box x 196–716; TRANSACTION right edge 685 **vs paper edge 605 → 80 px over the paper** | 64.1 px type on the wide paper, box x 192–684; TRANSACTION right 660 vs paper edge 699 → **inside by 39 px** |
| B · title paper | x ≈ 90–715, y 296–500 (≈ 625 × 205) | SK03 paper x 50–640, y 318–555 (590 × 237, taller and narrower) | V9 wide torn banner x 0–724, y 298–497 (724 × 199, uniform scale, mirrored; the cut end bleeds under the seal) |
| seal | bank temple, disc ≈ 96, 374, r 68 | the SK03 SIDEKICK's generic laurel seal | **16's own seal** (lifted, disc 96, 374, r 68), over the paper |
| C · alignment / line breaks | left at x 192, two lines | left 196, two lines | left 192, two lines, leading 0.94 |
| D · scan block | paper y 524–821 (297); art: receipt + cart in white brackets on a tan patch | y 566–820 (254); art: Batch 04 camera micro-asset | y 523–848 (325); art: **authority 16's own illustration** (lifted) |
| SCAN RECEIPT | dark pill 521 × 99, type ≈ 40 | CSS rectangle 492 × 75, type 26.4 | **SK03 dark pill** 518 × 97, type 40.6 |
| MANUAL ENTRY | cream pill 515 × 82, type ≈ 32 | CSS cream rectangle 492 × 75, 26.4 | **SK03 cream pill** 518 × 83, type 32.3 |
| E–J · strips (rows) | 6 strips, y 828–1444, pitch ≈ 99 (NOTES 114); label / value cap ≈ 20 (≈ 29 px type) | 7 strips, y 838–1420, pitch 84; label 22.8, value 29–30; value column 0.95 : 1.25 | 7 strips, y 861–1443, pitch 84; label 27.6, value 31.3 (select 14 px floor); value column 0.78 : 1.42 (value field x 412–881) |
| K · RECORD TRANSACTION | dark pill x 129–813 (684 × 88), type ≈ 33 | CSS rectangle full width (881 × 94), 26.4 | **SK03 dark pill** x 127–814 (687 × 92), type 32.3, centred |
| M · environment | SK03 scene | unchanged | unchanged (SK03_FIELD) |
| N · lower scenic foreground | landscape under the action | unchanged | unchanged |
| content footprint | 524 → 1570 | 566 → 1514 | 523 → 1548 |

## What remains different (honest)

* The form carries seven strips (MERCHANT is required by the ledger; the authority draws six), so the strip pitch is 84 instead
  of 99 — the scan block is a little taller (its illustration keeps its own aspect) and the whole form ends 22 px higher than drawn.
* (closed in the continuation) the strip icon tiles now have the drawn proportion (2.9 × 2.0 fs ≈ 88 × 61 board px at a 471 phone).
* The title is 64 px where the authority's lettering is ≈ 68–71 px (the runtime serif is wider per letter: 0.66 em vs 0.6 em).
* The authority's labels are a shade heavier.

Live controls, validation and financial semantics are unchanged: E2E R2 records a purchase through the form (merchant, amount,
category, RECORD TRANSACTION → TRANSACTION REVIEW), and the existing DOT 01 suites (save, review, duplicate detection, receipt OCR)
run unchanged (report 13).
