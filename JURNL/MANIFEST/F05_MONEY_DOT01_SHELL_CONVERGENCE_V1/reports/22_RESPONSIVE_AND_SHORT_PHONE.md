# 22 · Responsive and short phone

Viewports: 360 × 780, 375 × 667, 393 × 660, 393 × 852, 430 × 932, 471 × 836 (reference ratio), 768 × 1024, 834 × 1194, 1024 × 768,
1440 × 900. 471 × 836 is the 9:16 reference, not a substitute for small-phone QA. Probe: scripts/jurnl/f05-motion-pilot/probe_dot01_37_states.ts.

## 37 states × 10 viewports

|  | BEFORE (d6992b3fc) | AFTER |
|---|---|---|
| cells measured | 370 | 370 |
| state failed to open | 10 | 0 |
| page-level scroll | 0 | 0 |
| cells with an off-screen control (not in a scroller) | 10 | 10 |
| cells whose board foot is below the fold | 108 | 105 |
| cells with an internal scroller in use | 115 | 115 |

Off-screen controls AFTER:

| # | Viewport | Controls |
|---|---|---|
| 01 | 1024x768 | f05m-place-visa |
| 01 | 360x780 | f05m-place-cash, f05m-place-visa |
| 01 | 375x667 | f05m-place-cash, f05m-place-visa |
| 01 | 393x660 | f05m-place-cash, f05m-place-visa |
| 01 | 393x852 | f05m-place-cash, f05m-place-visa |
| 01 | 430x932 | f05m-place-cash, f05m-place-visa |
| 01 | 471x836 | f05m-place-cash, f05m-place-visa |
| 01 | 768x1024 | f05m-place-cash, f05m-place-visa |
| 01 | 834x1194 | f05m-place-cash, f05m-place-visa |
| 26 | 393x660 | d01-receipt-manual |

Off-screen controls BEFORE:

| # | Viewport | Controls |
|---|---|---|
| 01 | 471x836 | f05m-place-cash, f05m-place-visa |
| 01 | 393x852 | f05m-place-cash, f05m-place-visa |
| 01 | 360x780 | f05m-place-cash, f05m-place-visa |
| 01 | 375x667 | f05m-place-cash, f05m-place-visa |
| 01 | 393x660 | f05m-place-cash, f05m-place-visa |
| 01 | 430x932 | f05m-place-cash, f05m-place-visa |
| 01 | 768x1024 | f05m-place-cash, f05m-place-visa |
| 01 | 834x1194 | f05m-place-cash, f05m-place-visa |
| 01 | 1024x768 | f05m-place-visa |
| 26 | 393x660 | d01-receipt-manual |
