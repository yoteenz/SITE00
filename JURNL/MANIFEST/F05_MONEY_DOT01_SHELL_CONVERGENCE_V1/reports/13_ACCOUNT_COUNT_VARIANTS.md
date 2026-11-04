# 13 · Account-count variants

No fake accounts: each world is the first N records of the synthetic `many` world; the layout returns exactly N cells (unit test C2).

| Pockets | Composition | Authority status |
|---|---|---|
| 0 | authority 22 EMPTY ACCOUNTS (its own band, report 16) | AUTHORITY_MATCH_CANDIDATE |
| 1 | one 06 paper centred in the card zone, on the SK01 sheet | proposal — FOUNDER_REVIEW_REQUIRED |
| 2 | one row of two, centred in the zone | proposal — FOUNDER_REVIEW_REQUIRED |
| 3 | 2 + 1, the single paper centred under the pair | proposal — FOUNDER_REVIEW_REQUIRED |
| 4 | the authority 2 × 2 at its own coordinates | AUTHORITY_MATCH_CANDIDATE |
| ≥ 5 | the card zone scrolls inside itself (two rows + the top of a third, fading under the action row); the page never scrolls | proposal — FOUNDER_REVIEW_REQUIRED |

Long names: two balanced lines, shrink to 27 px, then ellipsis (full name in the accessible label). Large figures shrink to 40 px.
The action row, landscape and dock never move with the count (unit test C3).

## Measured (after; board px; DSF 2 captures in evidence/06_counts)

| Pockets | Viewport | u | Papers drawn | Card zone scrolls | ADD ACCOUNT top (board y) | Page scroll | State |
|---|---|---|---|---|---|---|---|
| 0 | 393x660 | 0.3976 | 0 | no | — | no | EMPTY (22) |
| 0 | 393x852 | 0.4461 | 0 | no | — | no | EMPTY (22) |
| 0 | 471x836 | 0.5036 | 0 | no | — | no | EMPTY (22) |
| 1 | 393x660 | 0.4401 | 1 | no | 990.7 | no |  |
| 1 | 393x852 | 0.4401 | 1 | no | 1427 | no |  |
| 1 | 471x836 | 0.5274 | 1 | no | 1076 | no |  |
| 2 | 393x660 | 0.4401 | 2 | no | 990.7 | no |  |
| 2 | 393x852 | 0.4401 | 2 | no | 1427 | no |  |
| 2 | 471x836 | 0.5274 | 2 | no | 1076 | no |  |
| 3 | 393x660 | 0.3947 | 3 | no | 1163 | no |  |
| 3 | 393x852 | 0.4401 | 3 | no | 1427 | no |  |
| 3 | 471x836 | 0.5 | 3 | no | 1163 | no |  |
| 4 | 393x660 | 0.3947 | 4 | no | 1163 | no |  |
| 4 | 393x852 | 0.4401 | 4 | no | 1427 | no |  |
| 4 | 471x836 | 0.5 | 4 | no | 1163 | no |  |
| 5 | 393x660 | 0.4339 | 5 | yes | 1012 | no |  |
| 5 | 393x852 | 0.4401 | 5 | no | 1427 | no |  |
| 5 | 471x836 | 0.5274 | 5 | yes | 1076 | no |  |
| 7 | 393x660 | 0.4339 | 7 | yes | 1012 | no |  |
| 7 | 393x852 | 0.4401 | 7 | yes | 1427 | no |  |
| 7 | 471x836 | 0.5274 | 7 | yes | 1076 | no |  |
