# 07 · Scene-coordinate contract

Reference: the V9 authority, 941 × 1672 px (verified on every PNG). One board in those px, scaled by `u`:
* phones (w ≤ 520): width-first, u = w / (941 − 2·crop) with crop ≤ 30 (06: ≤ 24, so no paper edge is cut)
* tablets / desktop: u = h / 1672, centred (ox > 0)
* taller than 9:16: `extra` = h / u − 1672 > 0 is inserted at the env seam (SK01 sheet tile / SK02 / SK03 field tile)
* shorter than 9:16 (pages with `absorb`): up to `absorb` px are taken out at the seam (extra < 0), then u = h / (1672 − absorb)

## 06 ALL ACCOUNTS (directoryScene.ts, board px)

| Region | Box / rule |
|---|---|
| SAFE_AREA_TOP | chips at y ≈ 40–110 (JURNL tag paper, amber back chip) |
| HERO_REGION | 0–330 (statue, lemons, arch — SK01_FIELD) |
| TITLE_REGION | SK01 title paper [70, 323, 615, 590] + laurel seal [26, 323, 167, 451]; live title on the heading [172, 356, 612, 552] |
| CONTENT_REGION (card zone) | y 594 → 1150 + extra; 2 × 2 cells at x {30, 474}, y {625, 877} (the 06 papers' own corners) |
| ACTION_REGION | ADD [80, 1163, 471, 1303], REORDER [485, 1154, 887, 1303], + extra |
| FOREGROUND_REGION | SK01 sheet foot + coastal engraving y ≈ 1300–1450 (+ extra) |
| DOCK_REGION | nav paper [19, 1459, 930, 1662] (+ extra), five cells NAV_RECT [34, 1478, 904, 1616] |
| SAFE_AREA_BOTTOM | the board's foot = the viewport's bottom (no strip reserved) |
| Z-ORDER | L0 SK01_FIELD → L1 title paper, seal → L1 papers (drop shadow) → L1 action surfaces → L2 type → L3 chips → dock |

Counts: 4 → authority 2 × 2; 3 → 2 + 1 centred; 1–2 → one row centred in the zone; ≥ 5 → the zone scrolls inside itself (two
rows + the top of a third, fading under the action row). `absorb`: 1–2 → zone slack (269), 3–4 → 0 (exact 2 × 2, fitted
instead), ≥ 5 → keeps 1.5 rows.

## 22 EMPTY ACCOUNTS
Band [0, 552, 941, 1540] lifted from 22; seam y 994 (plain sheet under the copy); tall phones: 40 % of extra opens the olive above
the wallet, 60 % grows the sheet; heading y 806, copy y 902, type papers [60/480, 1012/1162, …], ADD FIRST ACCOUNT [63, 1332, 875, 1430],
LEARN ACCOUNT TYPES [105, 1455, 833, 1537]; `absorb` 12 then fitted. The env's own landscape follows below the band.

No arbitrary per-screen transforms: every value above is a measured authority coordinate or a rule on `extra`.
