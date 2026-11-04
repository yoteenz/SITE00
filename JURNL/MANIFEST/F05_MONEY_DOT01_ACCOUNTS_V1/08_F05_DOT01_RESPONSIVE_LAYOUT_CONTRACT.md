# 08 · Responsive layout contract

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

| Viewport | Board | What happens |
|---|---|---|
| 471 × 836 (the authorities' 9:16) | u = 0.50, no crop, no seam | the board maps onto the authority one to one; the fidelity comparisons (doc 13) are taken here |
| 360 × 780 · 393 × 852 · 430 × 932 (phones, 9:19.5) | width-fit, up to 30 board px cropped per side (stone and fabric only) | the extra height is shared between the papers inside the field zone; the heading, JURNL tag and bottom landscape stay fixed; nothing is stretched |
| 834 × 1194 (tablet) · 1440 × 900 (desktop) | height-fit, centred | the sides show a blurred, darkened copy of the same environment; chips and dock stay on the board |

## Invariants (browser test `responsive …`, run at all five sizes)

At every size, for the directory, an account page, a history and the RECORD overlay:

- the page never scrolls sideways;
- no button is smaller than 24 × 24 px (strips and primary buttons are ≥ 44 px tall on phones);
- chips and the dock are fully on screen;
- inputs keep ≥ 16 px type, so iOS does not zoom.

## Chrome per screen

- **Dock:** only on 06 and 31 (and the parent), seated on SK01's torn nav paper inside the composition.
- **Everywhere else:** full-bleed to the bottom landscape.
- **Corner chrome:** the shell's global back and menu chip are not drawn on DOT 01 pages (no authority has them). A focused overlay covers the whole screen, including the dock where there is one.
