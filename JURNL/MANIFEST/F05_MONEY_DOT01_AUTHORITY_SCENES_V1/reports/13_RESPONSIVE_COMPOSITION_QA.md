# 13 · Responsive composition QA (37 states × 9 viewports)

Probe: `15_PIXEL_COMPARISON_METHOD.md` C. Every cell is the AFTER build; `ok` = rendered, no page scroll, every visible control on screen or inside a scroller. `inner-scroll` = the content region scrolls inside itself (reachable).

| ID | 471x836 | 393x852 | 393x660 | 375x667 | 360x780 | 430x932 | 768x1024 | 834x1194 | 1440x900 |
|---|---|---|---|---|---|---|---|---|---|
| 01 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 02 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 03 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 04 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 05 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 06 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 07 | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | ok | inner-scroll |
| 08 | ok | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | ok |
| 09 | ok | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | ok |
| 10 | ok | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | ok |
| 11 | inner-scroll | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | inner-scroll |
| 12 | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | ok | inner-scroll |
| 13 | inner-scroll | ok | inner-scroll | inner-scroll | inner-scroll | ok | ok | ok | inner-scroll |
| 14 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 15 | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | ok | ok | ok | inner-scroll |
| 16 | ok | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | ok |
| 17 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 18 | ok | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | ok |
| 19 | ok | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | ok |
| 20 | ok | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | ok |
| 21 | ok | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | ok |
| 22 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 23 | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | ok | ok | ok | inner-scroll |
| 24 | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll |
| 25 | ok | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | ok |
| 26 | ok | ok | UNREACHABLE:d01-receipt-manual | ok | ok | ok | ok | ok | ok |
| 27 | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll |
| 28 | ok | ok | inner-scroll | inner-scroll | inner-scroll | ok | ok | ok | ok |
| 29 | ok | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | ok |
| 30 | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll |
| 31 | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll | inner-scroll |
| 32 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 33 | inner-scroll | ok | inner-scroll | inner-scroll | inner-scroll | ok | ok | ok | inner-scroll |
| 34 | ok | ok | inner-scroll | ok | ok | ok | ok | ok | ok |
| 35 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 36 | ok | ok | inner-scroll | ok | ok | ok | ok | ok | ok |
| 37 | inner-scroll | ok | inner-scroll | inner-scroll | ok | ok | ok | ok | inner-scroll |

**Reachable with no page scroll: BEFORE 321 / 333 · AFTER 332 / 333.**

Composition rules on phones (all width-first, #1709): tall phones add an olive-field seam above the bottom landscape and, on 03–05, open 40 % of it between the action rows (first row stays on its scene); short phones close the rows up (02–05) and clamp every content region to the screen (all overlays and lists). No pillarboxing on phones; tablets / desktop keep height-fit centring. No indiscriminate shrinking: papers keep their size and aspect; only row pitch and, on the tightest phones, row icon size change.
