# 09 · Parchment and layer geometry (authority px, 941 × 1672)

All boxes are `[x, y, w, h]` unless noted; source of truth: `families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENES.json`
(03–05, written by the extraction script) and `F05_DOT01_GEOMETRY.json › SK02` (02).

## Layer stack (every account page)

| Layer | 02 BANK | 03 RIDESHARE | 04 CASH | 05 CREDIT |
|---|---|---|---|---|
| L0 environment | SK02_FIELD (V9, papers lifted) | SK02_FIELD | SK02_FIELD | SK02_FIELD |
| L1 main art | balance paper `[44,596,410,295]` (vt jrn-place) · stats `[485,597,434,297]` · scenic `[26,852,882,321]` | **scene band** `[0,548,941,624]` (vt jrn-place) · **seal** `[21,326,164,168]` | **scene band** `[0,542,941,596]` (vt) | **scene band** `[0,548,941,496]` (vt) |
| L1 strip papers | SK02 strips 1–3 in place | SK02 strips 1–3 seated on 3 rows | SK02 strips 1, 2, 3, 1 on 4 rows | SK02 strips 1, 2, 3, 1 on 4 rows |
| L2 live text | label · figure · 3 stat rows + 2 drawn rules | label (2 lines) · gold figure · 3 rows (rules in the art) | label · figure · 3 rows (rules in the art) | label · figure · OWED between drawn rules · 3 rows (rules in the art) |
| L2 buttons | 3 strip buttons | 3 | 4 | 4 (moss / terracotta tiles) |
| L3 chips | MANAGE POCKET · BACK | idem | idem | idem |

The band's top and bottom 22 px are an alpha ramp, so it seats into the field and under the title paper's torn edge
with no seam; the first action row covers the band's foot at the authority position and on tall phones (report 13).

## Live-text slots (box top-left, width, size; `on` = band top for 03–05)

| Slot | 03 | 04 | 05 |
|---|---|---|---|
| label | x 100 y 610 w 300 · 42 px · 2 lines · leading 0.92 · track 0.03 em · cream | x 420 y 590 w 410 · 40 px · 1 line · track 0.14 em · centred · cream | x 88 y 639 w 350 · 30 px · track 0.11 em · centred · cream |
| figure | x 90 y 700 w 290 · 116 px · left · **gold** | x 420 y 641 w 410 · 107 px · centred · cream | x 88 y 697 w 350 · 111 px · centred · cream |
| caption | — | — | OWED x 88 y 838 w 350 · 31 px · track 0.22 em · upright, 92 px rules |
| stat rows | x 100 w 506 · tops 882 / 952 / 1022 · 34 px · figure 1.1 em | x 415 w 467 · tops 794 / 864 / 933 · 32.5 px · figure 1.15 em · track 0.02 em | x 505 w 382 · tops 596 / 670 / 750 · 25.5 px · figure 1.6 em · leading 1.18 (AVAILABLE / CREDIT on two lines) |
| hold (long-press) | `[84,598,300,214]` | `[418,588,416,162]` | `[84,632,358,252]` |

## Action rows (authority positions) and their papers

| Page | Rows `[x, y, w, h]` | Paper (own aspect, centred on the row) | Label |
|---|---|---|---|
| 02 | SK02 strips `[36,1149,876,137]` `[33,1272,875,147]` `[34,1405,878,143]` | identical | 41 px |
| 03 | `[30,1180,876,132]` `[30,1325,876,132]` `[30,1470,876,140]` | 876 × 137 / 147 / 143 | 35 px |
| 04 | `[40,1139,856,120]` `[40,1256,856,120]` `[40,1375,856,120]` `[40,1494,856,122]` | 856 × 134 / 144 / 139 / 134 | 37 px |
| 05 | `[40,1032,862,118]` `[40,1154,862,120]` `[40,1284,862,120]` `[40,1415,862,122]` | 862 × 135 / 145 / 140 / 135 | 35 px |

Strip papers are **never squashed**: each keeps SK02's own aspect (unit test A5) and overlaps its neighbour a little,
as SK02's own strips do (1149–1286 / 1272–1419).
