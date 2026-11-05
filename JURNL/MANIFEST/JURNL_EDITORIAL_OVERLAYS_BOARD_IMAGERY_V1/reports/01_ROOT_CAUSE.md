# 01 · Why the overlays looked generic and stretched (verified in the code)

## Stretched

| Layer | Before | Effect |
|---|---|---|
| headline paper `.jed-head__paper` | `background-size: 100% 100%` of the 1200 × 517 heading parchment | its torn rim was scaled differently on every box |
| action paper `.jed-action__paper` | `background-size: 100% 100%` of the 1200 × 696 torn panel, on boxes from ≈ 3 : 1 (01) to ≈ 2.7 : 1 (footer) | the rim was squashed vertically by up to 1.8× (the "stretched" papers) |
| dark action `.jed-action__strip` | `background-size: 100% 100%` of the 1200 × 281 receipt strip, which itself carries a pill | a pill inside a pill, stretched |

## Generic

| Overlay | Before | Board |
|---|---|---|
| 01 | rectangular, torn-clipped crops: the SK01 bust (a rectangle of wall around it), the 04 / 05 scene bands for the amphora and the coin, the engraved coast | the bust cut out; the amphora and the coin cut out over the ends of their papers; red drapes; a painted village |
| 02 | the 22 temple seal | the bronze laurel medallion with the money bag; a coin stack at the balance; one large sheet under every field and the two pills |
| 03 | the bronze laurel seal with reorder arrows; the bust and arch as torn rectangles | the red wax seal with white arrows; the bust cut out; lemons and the arch with its coast |
| 04 | a rectangle of the V9 receipt stack (binder clip and paper) as the clip; a 78 × 52 thumbnail; no blur | a copper paper clip; the red drape under the fragment; the pocket's painted art torn into the corner; the page blurred behind |
| 05 | an arch rectangle and the receipt paper stack | the arch and coast (mirrored); three ledgers on a red drape; a painted coast along the foot; one large sheet |
| 06 | the F09 replica's grey plaster shell, with a grey bust and an olive sprig | a dark ground; a warm parchment sheet; the classical-head laurel medallion; columns; a painted landscape; a red drape; a dark SIGN OUT strip |
| 07 | a small CSS ⚠ disc; blockers on flat oxblood; a temple-coast rectangle as the "stone" | the bronze laurel ⚠ medallion; a crumpled oxblood drape; BLOCKERS on a torn parchment card; a column |
| 08 | a small torn rectangle of the bust | the bust cut out; the MENU paper; a lemon; the arch and coast down the right edge; a red drape down the left; a dark torn sheet under the sections |

The board's unique subjects existed only on the board, so they had never been lifted:

* the medallions, the wax seal, the clip, the ledgers, the coin stack, the columns, the drapes and the painted landscapes;
* the board's amphora and coin, which differ from the 06 card art.

## Correction

* **Papers**: every paper is now 9-sliced (`border-image … fill`), so the torn rim keeps its drawn scale at any box size.
* **Footer actions**: they draw the SK03 SIDEKICK's own lifted pills (caps 9-sliced).
* **Lifted subjects** (report 02) are mounted with `EdLift`:
  * placement is in **board units**, `--jb = 100cqw / panel width`, so one board px of the panel equals the folio's width ÷ the panel's width;
  * each sits at its board rect, at every phone width;
  * its height follows its own aspect, so it is never stretched.
