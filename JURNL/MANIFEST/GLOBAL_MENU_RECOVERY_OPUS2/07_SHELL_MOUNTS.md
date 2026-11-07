# 07 · Shell mounts: OV01–OV05, OV07 (and OV08)

The founder re-sent the assets as `JURNL_GLOBAL_EIGHT_OVERLAYS_PART1.zip` (eight shells and the docs) and `PART2.zip` (nine
foregrounds and SK04).
* **Integrity.** All 18 files are byte-for-byte identical to the copies installed from the asset-download branch (sha256 equal), and
  so are the handoff docs. The install and the registry are unchanged.
* **Quality.** These are the same palette-quantized PNGs; full-quality RGBA originals would need a re-export from OpenArt.

## How a shell is mounted

`runtime/surfaces/editorial/Shell.tsx` is the host for these overlays.

* **One uniform scale.** The shell is drawn at one contain scale inside the runtime's overlay host. The plate keeps the shell's exact
  9:16 ratio, so nothing is cropped, recentred or stretched (E2E O1–O7 check the drawn ratio).
* **Placement by fractions.** Every live label, value and control is placed on the shell's own wells and folios as fractions of the
  shell. The fractions were measured on the installed PNG with a ruler overlay, so controls stay on their wells at every size.
* **Type.** Text uses container units of the plate, clamped. Inputs stay at 16 px so iOS does not zoom.
* **No duplicate art.** No second sculpture, foliage, medal or scene is layered on a shell. The old editorial decor layers (SK01 bust,
  arch, lemons, temple seal, oxblood branch, receipt clip, temple stone) are no longer drawn on these six overlays.
* **Foregrounds.** FG01–FG09 are already inside their shells and are not mounted.
* **Behaviour.** The editorial host's behaviour is unchanged: portal, scrim, dialog semantics, focus trap, Escape, focus return.
* **Close.** Every shell overlay has a live square-rounded close at the top end, except OV04: there, a tap outside the card closes it.
* **Triggers.** Every functional trigger and test id is kept, so existing journeys select controls by the same names.

## Regions (fractions [x0, y0, x1, y1] of the shell)

| Shell | Live content on it |
|---|---|
| OV01 MONEY ACTION | head on the paper [0.24 0.19 0.90 0.315]. ADD A POCKET on the upper folio [0.075 0.395 0.62 0.585], beside the shell's amphora. MOVE YOUR MONEY on the lower folio [0.07 0.625 0.60 0.815], beside its coin |
| OV02 ADD A POCKET | name well [0.127 0.287 0.884 0.333]. The five type panels (BANK · SAVINGS / DEBIT · CREDIT / CASH); the baked dark first panel is covered by cream when BANK is not chosen. Rideshare-pay choice or the card's limit on the paper [0.11 0.616 0.90 0.659]. Balance well [0.118 0.666 0.733 0.714], beside the coin stacks. The honesty note [0.10 0.72 0.50 0.767]. CANCEL paper and the SAVE POCKET dark strip |
| OV03 MOVE MONEY | head with the honesty line. FROM and TO wells: the pocket and its figure on the well paper right of the shell's illustrated inset, the pocket choices in a strip under it; the oxblood direction seal between them is the shell's. WHERE IS THE MONEY NOW: 4 chips on the paper under TO. Amount well, effect / error line, date and note sharing the date well. CANCEL paper and the RECORD dark strip |
| OV04 MANAGE POCKET | placed full-frame (not cropped to the card) at 90 % of the screen width, so the card is about 85 % wide, over a code blur of the live page. MANAGE POCKET and the pocket name on the upper sheet. RENAME on the upper strip, DELETE on the salmon strip. The paperclip and coast are the shell's. Only a press that starts outside the card closes it, so the release of the long press that opened it does not |
| OV05 SEARCH | search well [0.325 0.287 0.935 0.353]. Three filter chips. The result rows land on the four blank rows (height 6.1 %, pitch 7.15 %) and snap back onto them while the list, the only scroll container, scrolls. ALL ACTIVITY and ADVANCED SEARCH on the paper below the rows. The arch, sea, velvet and blank ledgers are the shell's |
| OV07 ARCHIVE / DELETE BLOCKED | title on the velvet beside the shell's bronze caution medallion. The pocket, its figure and why on the first band. The real blockers on the shell's two blank rows; more than two scroll in place, and the region is keyboard-focusable. RESOLVE ISSUES on the dark strip, KEEP on the paper strip. The bust and column are the shell's |
| OV08 GLOBAL MENU | see 01 |
| OV06 ACCOUNT SETTINGS | **not mounted**. The approved F09 AccountDrawer stays controlling. OV06 has a different layout (three rows plus a sign-out strip), so it needs founder decision FD-12 |

## Behaviour notes

* **OV02.** The credit-card limit and the rideshare-pay choice have no baked well. They are live fields with their own light well,
  on the free paper between the type panels and the balance well.
* **OV03.** The note shares the date well, split at 58 %. The status chips are 4 short labels (ARRIVED · IN TRANSIT · PENDING ·
  LATER); each chip's full meaning is its accessible name. IT HAPPENED TWICE appears on the effect line when a duplicate is
  refused.
* **OV07.** The DOT 01 search / add chips are not drawn on this shell.
