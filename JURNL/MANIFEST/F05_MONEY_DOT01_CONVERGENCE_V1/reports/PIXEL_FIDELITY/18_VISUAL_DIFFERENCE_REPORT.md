# 18 · Visual difference report

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

Comparator `compare_dot01.py` (unchanged) at 471 × 836, same authorities, before vs after. MAD is diagnostic only: live data, the separate-render environments and missing art all move it; acceptance is by inspection of the triptychs.

**MAD improved on 18 screens, worse on 11, unchanged on 8.**

| # | Screen | MAD before | MAD after | Δ |
|---|---|---|---|---|
| 01 | MONEY DOT 01 VIEW ALL ACCOUNTS | 6.2 % | 6.2 % | +0.0 |
| 02 | BANK ACCOUNT | 6.9 % | 6.8 % | -0.2 |
| 03 | RIDESHARE CARD | 21.4 % | 21.3 % | -0.1 |
| 04 | CASH ON HAND | 22.2 % | 22.2 % | +0.0 |
| 05 | CREDIT CARD | 19.9 % | 19.6 % | -0.2 |
| 06 | ALL ACCOUNTS | 17.7 % | 16.1 % | -1.6 |
| 07 | BANK TRANSACTION HISTORY | 15.5 % | 15.6 % | +0.0 |
| 08 | RIDESHARE ACTIVITY | 21.5 % | 21.5 % | +0.0 |
| 09 | CASH USAGE HISTORY | 20.7 % | 20.8 % | +0.0 |
| 10 | CREDIT CARD ACTIVITY | 21.1 % | 21.1 % | +0.0 |
| 11 | TRANSACTION DETAIL | 20.1 % | 19.8 % | -0.3 |
| 12 | ACCOUNT DETAILS AND SETTINGS | 17.5 % | 16.8 % | -0.7 |
| 13 | ACCOUNT BALANCE REVIEW | 24.5 % | 24.3 % | -0.2 |
| 14 | ADD ACCOUNT | 24.2 % | 25.7 % | +1.4 |
| 15 | EDIT ACCOUNT | 19.7 % | 19.4 % | -0.4 |
| 16 | RECORD BANK TRANSACTION | 20.8 % | 20.8 % | +0.1 |
| 17 | ADD CASH | 23.7 % | 25.5 % | +1.8 |
| 18 | RECORD CASH SPENDING | 21.1 % | 23.2 % | +2.0 |
| 19 | RECORD CREDIT CARD PURCHASE | 17.6 % | 18.6 % | +1.0 |
| 20 | RECORD CREDIT CARD PAYMENT | 17.9 % | 20.7 % | +2.9 |
| 21 | ACCOUNT PURPOSE PREFERENCES | 21.2 % | 20.4 % | -0.8 |
| 22 | EMPTY ACCOUNTS | 24.3 % | 24.2 % | -0.1 |
| 23 | BALANCE ADJUSTMENT REVIEW | 20.7 % | 21.0 % | +0.2 |
| 24 | TRANSACTION CORRECTION / REVERSAL | 20.4 % | 19.7 % | -0.7 |
| 25 | ACCOUNT ARCHIVE CONFIRMATION | 23.1 % | 21.5 % | -1.6 |
| 26 | CAPTURE RECEIPT | 10.1 % | 10.0 % | -0.1 |
| 27 | SCANNING RECEIPT | 22.5 % | 21.5 % | -1.0 |
| 28 | REVIEW EXTRACTED PURCHASE | 20.0 % | 19.6 % | -0.4 |
| 29 | RECEIPT EXCEPTION / DUPLICATE | 27.0 % | 26.8 % | -0.3 |
| 30 | ACCOUNT SETUP DETAILS | 21.8 % | 20.4 % | -1.3 |
| 31 | TRANSACTION SEARCH AND FILTER | 18.3 % | 18.6 % | +0.3 |
| 32 | REORDER ACCOUNTS | 21.5 % | 21.5 % | +0.0 |
| 33 | TRANSACTION REVIEW | 19.7 % | 20.7 % | +1.0 |
| 34 | RECEIPT CAPTURE FAILURE | 21.4 % | 22.4 % | +1.0 |
| 35 | ACCOUNT NEEDS REVIEW | 23.3 % | 23.3 % | +0.0 |
| 36 | ARCHIVE BLOCKED | 29.5 % | 28.3 % | -1.3 |
| 37 | CORRECTION / REVERSAL CONFIRMATION | 18.8 % | 19.0 % | +0.1 |

Where MAD rises, the cause is a deliberate authority element that differs from a separate-render environment (e.g. a paper chip drawn where that authority's background differs) — verified in the triptychs.
