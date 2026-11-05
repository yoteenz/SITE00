# 05 · Context menu: design and behaviour

## One menu

`PocketMenu` in `PocketManager.tsx`. Every entry point (hold, right-click, Shift + F10, the MANAGE POCKET chip) on every surface (parent, directory, Pocket page) opens this one component through `usePocketManager(where).open(id, anchor)`. `where` changes only what happens after a delete (doc 09).

## Design (a proposal: no authority draws an open menu)

| Element | Treatment |
|---|---|
| Surface | the shared **JURNL_POPOVER**: the founder's `F05_DOT01_14_LARGE_PARCHMENT_SHEET` 9-sliced as a torn sheet, warm double drop shadow. It portals into the stage layer (DOT 01 stage, or the parent stage via `data-jrn-surface-host`); there is no native context menu and no glass. |
| Title | MANAGE POCKET: JURNL Authority Serif, 15 px, 0.16 em tracking, centred |
| Pocket name | under the title, 12 px, ellipsised, over an **amber-gold rule** (`rgba(160,112,40,.55)`) |
| Items | RENAME POCKET (ink pencil) and DELETE POCKET (ink bin, **terracotta** text and border). Square-rounded 10 px parchment buttons, 46 px tall (≥ 44 px targets). |
| States | hover / focus: olive wash (terracotta for DELETE); focus ring 3 px gold |
| Motion | 160 ms rise / fall from the anchor side (transform and opacity only), none under reduced motion |
| Size | min 260 px, wants 240 px of height; flips above when there is less room below; never under the dock (06) |

## Behaviour

| Action | Result |
|---|---|
| Open | focus moves to RENAME POCKET (the menu mounts a frame after its anchor is measured; a callback ref focuses it when it arrives) |
| ↓ / ↑ | next / previous item (wraps) |
| Home / End | first / last item |
| Enter / Space | choose |
| Escape | closes and returns focus to the anchor (the held card or the chip). A window listener also catches Escape when focus has not reached the menu yet. |
| Tab | closes (focus moves on) |
| Press outside | closes, opens nothing (T01–T03 parent: an outside press, then the URL is unchanged) |
| Scroll / resize | the surface re-anchors |
| Screen reader | `role="menu"` named `MANAGE POCKET: <POCKET NAME>`; items `role="menuitem"`; the visual title and name are `aria-hidden` (the name is in the label) |

## One viewport

The menu is placed inside the stage and measured in E2E: inside the viewport on all four sizes, with no page scroll in either direction (T18). Axe finds no serious or critical violations with it open (T18).

Screenshots: `SCREENSHOTS/393x852/T02-directory-long-press-menu.webp`, `T02-parent-long-press-menu.webp`, `T06-pocket-detail-menu.webp` (and the same at 360 × 780 and 375 × 667).
