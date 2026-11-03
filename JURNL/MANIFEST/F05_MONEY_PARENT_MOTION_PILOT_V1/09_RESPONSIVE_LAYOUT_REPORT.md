# 09 — Responsive layout report

Geometry lives in one pure module, `runtime/screens/f05/f05MotionLayout.ts`, which is unit-tested.

- **Board:** every layer sits in a 1024-wide board in source px of the approved composite, scaled by `u` (screen px per source px).
- **Scale rule:** `u = min(W / (1024 − 2·35), H / 1536)`. Phones may lose up to 35 source px of stone at each side (nothing interactive); taller and wider screens fit the height.
- **Extra height:** goes to an **elastic panel** (top slice · seamless panel tile · bottom slice). No pixel is stretched; the papers keep the approved size.
- **Minimum sizes:** CSS floors keep labels ≥ 9.5 screen px, names ≥ 11 px and notes ≥ 7.5 px. Every control's hit area is ≥ 44 screen px.

## Per viewport (4 accounts, measured from the layout module)

| Size | u | Board (css) | Side crop (src px) | Elastic (src px) | Papers / page | 4 accounts show | Card (css) | Name / amount (css) | Label / figure (css) | Dock |
|---|---|---|---|---|---|---|---|---|---|---|
| **360 × 780** | 0.377 | 386 × 780 | 35 | 531 | 6 | 4 cards + ADD + MOVE (3 rows) | 156 × 70 | 11.0 / 18.1 | 9.5 / 19.6 | 53 px on the nav paper |
| **393 × 852** | 0.412 | 422 × 852 | 35 | 532 | 6 | 4 + ADD + MOVE | 171 × 77 | 11.9 / 19.8 | 9.5 / 21.4 | 58 px |
| 512 × 768 (2:3 fidelity) | 0.500 | 512 × 768 | 0 | 0 | 4 | **the approved four, on the approved rects** | 207 × 92 | 14.5 / 24 | 11 / 26 | 70 px |
| **834 × 1194** | 0.777 | 796 × 1194 | 0 (19 px ambient each side) | 0 | 4 | the approved four | 322 × 143 | 22.5 / 37.3 | 17.1 / 40.4 | 109 px |
| **1440 × 900** | 0.586 | 600 × 900 | 0 (420 px ambient each side) | 0 | 4 | the approved four | 243 × 108 | 17 / 28.1 | 12.9 / 30.5 | 82 px |

## Mobile (initial creative authority)

- **Composition:** width-fit with a 35 px stone crop. The bust, lemons, arch, seal, title paper, band and papers keep their approved relationships.
- **Extra height (roughly 220 css px on 19.5:9 phones):** a third row (6 places per page, or the ADD A PLACE / MOVE MONEY papers), plus capped gaps. It is never a stretched image.
- **What this costs:** the panel is taller than in the approved picture, and its reconstructed parchment shows more between rows (doc 02, rows 12–13).

## Tablet and desktop: an intentional column, not a stretched phone

The composition keeps its exact 2:3 proportions at full height, centred. The sides are an ambient, blurred and darkened copy of the same environment, and the board's own edges feather into it (3 % mask), so there is no rectangular seam.

- **Dock:** sits on the board's nav paper (CSS variables from the layout), not the default floating dock.
- **Desktop:** reads as a framed collage column. A dedicated wide composition (side panels for activity, upcoming) would need a wide master and founder direction, so it was not invented.

## Content states (E2E at all four sizes)

| State | Layout |
|---|---|
| 0 accounts | one wide NO PLACES YET paper; COMMITTED / AVAILABLE "—" with a caption |
| 1 account | the account paper + ADD A PLACE |
| 2–3 accounts | the account papers + ADD + MOVE in free slots |
| 4 accounts | 2:3 / tablet / desktop: the approved four (ADD and MOVE via "+"). Phones: + a row with ADD and MOVE |
| > capacity | pages of 4 or 6; dots button, ← / →, swipe; the last page also offers ADD / MOVE in free slots |
| Long names | balanced two lines, scaled to 0.84 / 0.7 / 0.6, clipped with an ellipsis; the full name stays in the accessible name |
| Long amounts | shrink to 0.84 / 0.72 / 0.62 to stay inside their column; never abbreviated |

## Safety

- **No page scroll:** the stage is `position: fixed; inset: 0`. E2E check 18: document scroll size ≤ viewport, and a wheel leaves `scrollY = 0`.
- **No hidden essentials:** every paper, figure, chip, the menu and the dock buttons lie fully inside the viewport (E2E check 17, all four sizes).
- **Safe areas:** the dock sits on the nav paper but never inside the home-indicator zone (`bottom: max(nav paper, env(safe-area-inset-bottom))`). On a notched phone it can therefore sit up to about 18 px above the paper's centre. The board is drawn edge to edge behind the status bar. The three corner chips sit at the approved top, but never above `safe-area-inset-top + 8 px`. The JURNL tag is environment artwork and may sit partly under a notch, as the root hubs' lockups do.
- **Not verified:** a physical iPhone with a home indicator. Mobile Safari was **not available** in this environment (Chromium only); see doc 10.
