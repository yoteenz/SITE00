# 02 · Current shell architecture

```
JurnlScreen (F05 family, singlePlate)
└─ Dot01Frame (page) / Dot01Overlay (portal, focus trap)        runtime/screens/f05/dot01/Dot01Frame.tsx
   └─ Dot01Board  — one 941 × 1672 board scaled by u, translated by ox
      L0 env        SK01_FIELD · SK02 · SK02_FIELD · SK03 · SK03_FIELD   (sliced at the env seam; elastic tile on tall phones)
      L1 layers     SIDEKICK papers, motion PNGs, authority scene bands (03 / 04 / 05 / 22), 06 papers / actions
      L2 live type  JURNL mark, title on the heading paper, one cursive line; board-px figures (`board(L)` renderer)
      L3 chips      back / search / add / manage, laid out from the right edge
   └─ content      screen-px region mapped from a board rect (forms, lists); clamps + scrolls inside on short phones
   └─ JurnlProductNav (06, 31 only) on the torn nav paper; positioned from NAV_RECT via boardToScreen
```

Common environment vs screen composition (this sprint): the environment (L0) is now chosen per authority family, and the
screen-specific composition (papers, actions, figures) is placed by the page in board coordinates instead of document flow:

* `SK01_FIELD` (new env) = F05_MOTION_SIDEKICK, SK01 with its account papers, title paper and seal removed (the parent's own
  text-free plate). It grows inside its sheet at the parent's seam (y 1190) with the parent's sheet tile; its nav paper is
  baked (one owner — the frame no longer draws a second nav paper on it; an empty marker keeps the dock geometry testable).
* `absorb` (new, opt-in per page): on a screen SHORTER than 9:16, instead of letting the board's foot (landscape, nav paper,
  dock) fall below the fold, the page takes slack out at its seam (lower slice overlaps the upper one inside plain sheet,
  feathered) and otherwise fits the board to the height. Pages that do not opt in keep the existing behaviour.
* `maxCrop` per page: 06 crops at most 24 board px a side (its papers reach x 28…915).

Dock: global JurnlProductNav, unchanged (canonical vectors), placed on the nav paper's NAV_RECT.


## Environment per surface (after this sprint)

| # | Screen | Runtime environment (L0 + owned layers) | Before |
|---|---|---|---|
| 01 | MONEY DOT 01 VIEW ALL ACCOUNTS | SK01 (F05_MOTION_SIDEKICK) | SK01 (F05_MOTION_SIDEKICK) |
| 02 | BANK ACCOUNT | SK02_FIELD + SK02 papers | SK02_FIELD + SK02 papers |
| 03 | RIDESHARE CARD | SK02_FIELD + SCENE_03 band | SK02_FIELD + SCENE_03 band |
| 04 | CASH ON HAND | SK02_FIELD + SCENE_04 band | SK02_FIELD + SCENE_04 band |
| 05 | CREDIT CARD | SK02_FIELD + SCENE_05 band | SK02_FIELD + SCENE_05 band |
| 06 | ALL ACCOUNTS | SK01_FIELD + CARD06 papers + ACTION06 surfaces | SK02_FIELD + flow grid (SK01 card thumbnails) + generic strip |
| 07 | BANK TRANSACTION HISTORY | SK02_FIELD + papers | SK02_FIELD + papers |
| 08 | RIDESHARE ACTIVITY | SK02_FIELD + papers | SK02_FIELD + papers |
| 09 | CASH USAGE HISTORY | SK02_FIELD + papers | SK02_FIELD + papers |
| 10 | CREDIT CARD ACTIVITY | SK02_FIELD + papers | SK02_FIELD + papers |
| 11 | TRANSACTION DETAIL | SK02_FIELD + papers | SK02_FIELD + papers |
| 12 | ACCOUNT DETAILS AND SETTINGS | SK02_FIELD + papers | SK02_FIELD + papers |
| 13 | ACCOUNT BALANCE REVIEW | SK02_FIELD + papers | SK02_FIELD + papers |
| 14 | ADD ACCOUNT | SK03_FIELD + papers | SK03_FIELD + papers |
| 15 | EDIT ACCOUNT | SK03_FIELD + papers | SK03_FIELD + papers |
| 16 | RECORD BANK TRANSACTION | SK03_FIELD + papers | SK03_FIELD + papers |
| 17 | ADD CASH | SK03_FIELD + papers | SK03_FIELD + papers |
| 18 | RECORD CASH SPENDING | SK03_FIELD + papers | SK03_FIELD + papers |
| 19 | RECORD CREDIT CARD PURCHASE | SK03_FIELD + papers | SK03_FIELD + papers |
| 20 | RECORD CREDIT CARD PAYMENT | SK03_FIELD + papers | SK03_FIELD + papers |
| 21 | ACCOUNT PURPOSE PREFERENCES | SK03_FIELD + papers | SK03_FIELD + papers |
| 22 | EMPTY ACCOUNTS | SK02_FIELD + SCENE_22 band + SEAL_22 | SK02_FIELD + generic panel / tiles |
| 23 | BALANCE ADJUSTMENT REVIEW | SK03_FIELD + papers | SK03_FIELD + papers |
| 24 | TRANSACTION CORRECTION / REVERSAL | SK03_FIELD + papers | SK03_FIELD + papers |
| 25 | ACCOUNT ARCHIVE CONFIRMATION | SK03_FIELD + papers | SK03_FIELD + papers |
| 26 | CAPTURE RECEIPT | SK03 (full, baked) | SK03 (full, baked) |
| 27 | SCANNING RECEIPT | SK03_FIELD + papers | SK03_FIELD + papers |
| 28 | REVIEW EXTRACTED PURCHASE | SK03_FIELD + papers | SK03_FIELD + papers |
| 29 | RECEIPT EXCEPTION / DUPLICATE | SK03_FIELD + papers | SK03_FIELD + papers |
| 30 | ACCOUNT SETUP DETAILS | SK03_FIELD + papers | SK03_FIELD + papers |
| 31 | TRANSACTION SEARCH AND FILTER | SK02_FIELD + papers | SK02_FIELD + papers |
| 32 | REORDER ACCOUNTS | SK02_FIELD (reorder list) | SK02_FIELD (reorder list) |
| 33 | TRANSACTION REVIEW | SK03_FIELD + papers | SK03_FIELD + papers |
| 34 | RECEIPT CAPTURE FAILURE | SK03_FIELD + papers | SK03_FIELD + papers |
| 35 | ACCOUNT NEEDS REVIEW | SK02_FIELD + papers | SK02_FIELD + papers |
| 36 | ARCHIVE BLOCKED | SK03_FIELD + papers | SK03_FIELD + papers |
| 37 | CORRECTION / REVERSAL CONFIRMATION | SK03_FIELD + papers | SK03_FIELD + papers |
