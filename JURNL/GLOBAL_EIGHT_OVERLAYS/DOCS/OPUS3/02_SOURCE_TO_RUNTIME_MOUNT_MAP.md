# 02 · Source-to-runtime mount map (OPUS3)

Layers: **L0** environment · **L1** compositional / backing art · **L2** live UI · **L3** independent foreground (none mounted).
Regions are fractions of the art `[x0, y0, x1, y1]`. The plate is always drawn at one uniform contain scale with the art's own
aspect ratio (`Shell.tsx useShellPlate`, `GlobalMenu.tsx`): nothing is stretched, cropped or recentred. Papers are `<img>` with
`object-fit: contain` inside an element whose `aspect-ratio` is the art's native ratio. Type sizes are container units of the plate,
clamped.

## OV08 · the shared menu environment: GlobalMenu, SAFE TO SPEND BUFFER, PRIVACY & CONSENTS

`OV08-SECTIONED-MENU-ENVIRONMENT.png` → `OV08_MENU_ENVIRONMENT.webp` (L0+L1). Founder authorities: BUFFER- / PRIVACY-AUTHORITY-VS-ARTWORK
(Grok4 `10_FOUNDER_AUTHORITY_COMPARISONS`), Grok2 `OPUS_MOUNT_MAP.md` ("L0 for the global menu, Safe to Spend Buffer, and Privacy"),
Grok4 `13_REVISED_OPUS_MOUNT_MAP.md` ("Reuse OV08-MENU-ENVIRONMENT.png for Buffer and Privacy").

| Surface | Component | Live region | Contents (all L2 unless noted) |
|---|---|---|---|
| all three | `GlobalMenu.tsx` / `ChildEnvironments.tsx` | tag `[0.352, 0.038, 0.575, 0.098]` | the JURNL wordmark on the blank tag paper (aria-hidden) |
| MENU | `GlobalMenu.tsx` `OV08_REGION` | head `[0.29, 0.125, 0.79, 0.265]` | MENU · *tools, settings & support* |
| MENU | | port `[0.075, 0.306, 0.745, 0.885]` (only scroll) | YOUR FINANCES · YOUR INTELLIGENCE · YOUR ACCOUNT, 12 / 12 rows, icons, states, dividers |
| BUFFER | `BufferEnvironment` `CH01_BOX` | head `[0.275, 0.118, 0.8, 0.284]` | SAFE TO SPEND / BUFFER · *a cushion you keep aside* · laurel ornament |
| BUFFER | | column `[0.08, 0.322, 0.758, 0.696]` (scrolls only for a long warning) | help line · gold rule · BUFFER AMOUNT (+ SAVED / CLEARED status) · **amount paper** (L1) with the amount field, its symbol, a divider and the currency selector · warnings · **effect paper** (L1) with EFFECT ON SAFE TO SPEND and the kept-aside figure |
| BUFFER | | coin `px(35, 2427, 1048, 581)` | **CH01_COIN_RESERVE** (L1, fixed art, 1:1 master pixels at the authority origin; top sliver clipped) |
| BUFFER | | actions `[0.0878, 0.846, 0.758, 0.911]` | **BACK paper** (L1, 42.9 % of the row as in the authority) · SAVE BUFFER (V3 olive control, gold rim) |
| PRIVACY | `PrivacyEnvironment` `CH02_BOX` | head `[0.275, 0.118, 0.8, 0.284]` | PRIVACY & / CONSENTS · *what jurnl may keep and use* · laurel ornament |
| PRIVACY | | list `[0.095, 0.306, 0.765, 0.776]` (only scroll) | YOUR CONSENTS: REMEMBER SETUP (switch), LINKED ACCOUNTS OPTIONAL (statement), NOTHING SOLD (statement), ASK JURNL CONTEXT (switch) · YOUR DATA: AI ACCESS, YOUR DATA, DATA EXPORT (*not available yet.*) |
| PRIVACY | | remove `[0.0809, 0.7813, 0.772, 0.858]` | **REMOVE ACCESS paper** (L1) with trash icon, label, *delete account · revoke access · turn ai off.*, chevron |
| PRIVACY | | back `px(315, 3108, 1206, 247)` | **BACK paper** (L1) |

Placements come from Grok4 `docs/ALPHA_STATS.json` `place` (plate pixels, the 864 authority grid × 7/3): amount (203, 1689),
effect (161, 2081), back_b (177, 3040), save (770, 3010), coins (35, 2427), remove (163, 2800), back_p (315, 3108). The amount and effect
papers flow inside the column at the authority's widths (1297 and 1367 of 2016 px); the coin and the two privacy papers are absolute.

The sprig's lowest leaf reaches x 0.142 at y 0.305, so both scroll regions start at y 0.306.

## OV05 · SEARCH

`OV05-SEARCH-OPEN-COMPOSITION.png` → `OV05_OPEN_COMPOSITION.webp` (L0+L1). `SearchDrawer.tsx` `OV05_OPEN`:
head `[0.335, 0.145, 0.905, 0.248]`, column `[0.335, 0.258, 0.905, 0.772]` (the authority's open paper, x 0.32–0.90, clear of the
notches on the paper's right edge). One column: field · ALL / POCKETS / ACTIVITY · count · results (`search-results`, the only scroll,
rows of their own height) · ALL ACTIVITY / ADVANCED SEARCH.

## OV04 · MANAGE POCKET

`OV04-RENAME-CREAM-TEXTFREE.png` → `OV04_RENAME_PAPER.webp`, `OV04-DELETE-BLUSH-TEXTFREE.png` → `OV04_DELETE_PAPER.webp` (L1).
`PocketManager.tsx`: the compact `JurnlPopover` keeps its paperclip (`.jed-pop-clip`) and the pocket's landscape (`.jed-pop-art`); its two
menu items wear the papers at their native ratio (1645 / 319, 1645 / 346) with live RENAME POCKET / DELETE POCKET labels. The popover's
own backdrop blurs the live page (`.jrn-pop-backdrop`, z 79, under the popover at z 80). OV04-MANAGE-NOTE is not mounted.

## Not mounted

CH01 / CH02 clean environments (founder correction), both header parchments (duplicate of the OV08 title paper), the SAVE BUFFER olive
paper (gold rim missing). Grok2 OV07 / OV01 (pending), unapproved OV06, the OV02 / OV03 shells and the OV04 full compositions remain
excluded (`07_EXCLUDED_AND_GATES/DO_NOT_USE.txt`); `overlays/eight/registry.ts` records OV01–05 / 07 / 08 as RETIRED and OV06 as
INSTALLED_NOT_MOUNTED, all with `runtime: null`. FD-12 / the approved F09 drawer is untouched.
