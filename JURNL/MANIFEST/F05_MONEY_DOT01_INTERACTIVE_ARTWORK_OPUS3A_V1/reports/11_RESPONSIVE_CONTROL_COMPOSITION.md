# 11 · Responsive control composition

All 37 states at 393 × 852, 471 × 836, 393 × 660 (full census) and 06 / 14 / 16 / 20 / 25 / 36 / 37 at all ten sprint viewports
(360 × 780 … 1440 × 900). The pills keep their silhouette at every size (caps drawn at their own aspect; only the plain middle
extends), the 06 pair keeps its lifted papers (board-scaled), no control turns into a rounded rectangle at any breakpoint.

| Viewport | States | Page scroll | Controls off screen (not in a scroller) | Title lines out of the safe zone | Text runs leaving their paper | Icon/text collisions | Failed |
|---|---|---|---|---|---|---|---|
| 360x780 | 7 | 0 | 0 | 0 | 1 | 0 | 0 |
| 375x667 | 7 | 0 | 0 | 0 | 0 | 0 | 0 |
| 393x660 | 37 | 0 | 3 | 0 | 2 | 11 | 0 |
| 393x852 | 37 | 0 | 2 | 0 | 1 | 14 | 0 |
| 430x932 | 7 | 0 | 0 | 0 | 0 | 0 | 0 |
| 471x836 | 37 | 0 | 2 | 0 | 8 | 10 | 0 |
| 768x1024 | 7 | 0 | 0 | 0 | 8 | 0 | 0 |
| 834x1194 | 7 | 0 | 0 | 0 | 16 | 0 | 0 |
| 1024x768 | 7 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1440x900 | 7 | 0 | 0 | 0 | 0 | 0 | 0 |

Captures: `evidence/responsive/` (FULL package).

## Reading the census (every non-zero cell explained)

* **Controls off screen (393 × 852 / 471 × 836: 2; 393 × 660: 3)** — 01 (the MONEY parent motion rail: CASH / CREDIT cards to the
  right of the horizontal rail, OPUS3 gate 5) on every phone, plus 26 ENTER MANUALLY at 393 × 660 (OPUS3 gate 7). Both are the
  same on the base. No DOT 01 V9 overlay control is off screen after; 16 / 18 / 19 were re-measured at six phone sizes with the
  final scan block (0 off screen; the interim 52-px SCAN RECEIPT pushed the pair off a 360 / 393 phone and was corrected).
* **Title lines out of the safe zone: 0 everywhere.** The first delivery had 1 per phone viewport — 32 REORDER ACCOUNTS, a page
  title whose ACCOUNTS ended 1–2 px past its 430-px page box (identical on the base). The continuation's measured title clamp
  sets it at 75.0 px instead of 75.9 and it sits inside; no other title needed the clamp (census diff: only 32's size changed).
* **Text runs leaving their paper (360 × 780: 1)** — 16's CATEGORY select: SELECT CATEGORY ellipsises in its own box at 360 px
  (the unclipped range overhangs by 2 px); the full value is the button's accessible name and is listed in the listbox.
* **Text runs leaving their paper (471 × 836: 8)** — 01 parent rail card names (2 px), identical on the base.
* **Text runs leaving their paper (768 × 1024: 8 · 834 × 1194: 16)** — 14 type cards and 16 / 20 select values on tablets: the
  em box of 21–22 px type overhangs its own line box by 3 px (vertical, 2 px tolerance); the ink sits well inside its field and
  card (FULL package `evidence/responsive/16-834x1194.png`, `14-834x1194.png`).
* **Icon / text collisions (10–14 per phone viewport)** — 07–10 and 31 ledger rows: a wrapped second line's empty em-box ascent
  touches the bottom 2–3 px of the row icon (`metrics/collision_check_31.json`); unchanged from the base; no ink overlap. Plus 27 / 28's CATEGORY select at 393 px: the ellipsised value's
  unclipped range runs under its chevron (the visible ellipsis stops before it); the same on the base (before: 07 3 · 08 2 ·
  09 1 · 27 1 · 28 1 · 31 3–7).
