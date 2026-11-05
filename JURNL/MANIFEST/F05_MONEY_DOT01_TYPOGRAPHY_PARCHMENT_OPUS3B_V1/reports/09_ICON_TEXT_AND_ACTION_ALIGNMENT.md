# 09 · Icon / text and action alignment

Pill geometry (independent boxes): PILL = the lifted surface; CAPS = `border-width: 0 var(--d01-btn-cap)` (no text there);
ICON = inline glyph 1.15 em, 10 px gap; TEXT = one line between the caps; HIT AREA = the whole `<button>` (≥ 44 px). A label
longer than its pill would overflow its content box: the census flags it (none after). Collisions are measured per line box
against real icons (not against a full-bleed card illustration, which is the control's surface).

| # | Screen | Icon/text collisions before | after | Text leaving its paper before | after | After: which |
|---|---|---|---|---|---|---|
| 01 | MONEY DOT 01 VIEW ALL ACCOUNTS | 0 | 0 | 8 | 8 | BANK in f05m-place-bank by 2; ACCOUNT in f05m-place-bank by 2; RIDESHARE in f05m-place-ride by 2; CARD in f05m-place-ride by 2; CASH in f05m-place-cash by 2; ON HAND in f05m-place-cash by 2; CREDIT in f05m-place-visa by 2; CARD in f05m-place-visa by 2 |
| 02 | BANK ACCOUNT | 0 | 0 | 0 | 0 | — |
| 03 | RIDESHARE CARD | 0 | 0 | 0 | 0 | — |
| 04 | CASH ON HAND | 0 | 0 | 0 | 0 | — |
| 05 | CREDIT CARD | 0 | 0 | 0 | 0 | — |
| 06 | ALL ACCOUNTS | 0 | 0 | 0 | 0 | — |
| 07 | BANK TRANSACTION HISTORY | 3 | 3 | 0 | 0 | — |
| 08 | RIDESHARE ACTIVITY | 1 | 1 | 0 | 0 | — |
| 09 | CASH USAGE HISTORY | 1 | 1 | 0 | 0 | — |
| 10 | CREDIT CARD ACTIVITY | 0 | 0 | 0 | 0 | — |
| 11 | TRANSACTION DETAIL | 0 | 0 | 0 | 0 | — |
| 12 | ACCOUNT DETAILS AND SETTINGS | 0 | 0 | 0 | 0 | — |
| 13 | ACCOUNT BALANCE REVIEW | 0 | 0 | 0 | 0 | — |
| 14 | ADD ACCOUNT | 0 | 0 | 0 | 0 | — |
| 15 | EDIT ACCOUNT | 0 | 0 | 0 | 0 | — |
| 16 | RECORD BANK TRANSACTION | 0 | 0 | 0 | 0 | — |
| 17 | ADD CASH | 0 | 0 | 0 | 0 | — |
| 18 | RECORD CASH SPENDING | 0 | 0 | 0 | 0 | — |
| 19 | RECORD CREDIT CARD PURCHASE | 0 | 0 | 0 | 0 | — |
| 20 | RECORD CREDIT CARD PAYMENT | 0 | 0 | 0 | 0 | — |
| 21 | ACCOUNT PURPOSE PREFERENCES | 0 | 0 | 0 | 0 | — |
| 22 | EMPTY ACCOUNTS | 0 | 0 | 0 | 0 | — |
| 23 | BALANCE ADJUSTMENT REVIEW | 0 | 0 | 0 | 0 | — |
| 24 | TRANSACTION CORRECTION / REVERSAL | 0 | 0 | 0 | 0 | — |
| 25 | ACCOUNT ARCHIVE CONFIRMATION | 0 | 0 | 0 | 0 | — |
| 26 | CAPTURE RECEIPT | 0 | 0 | 0 | 0 | — |
| 27 | SCANNING RECEIPT | 0 | 0 | 0 | 0 | — |
| 28 | REVIEW EXTRACTED PURCHASE | 0 | 0 | 0 | 0 | — |
| 29 | RECEIPT EXCEPTION / DUPLICATE | 0 | 0 | 0 | 0 | — |
| 30 | ACCOUNT SETUP DETAILS | 0 | 0 | 0 | 0 | — |
| 31 | TRANSACTION SEARCH AND FILTER | 5 | 5 | 0 | 0 | — |
| 32 | REORDER ACCOUNTS | 0 | 0 | 0 | 0 | — |
| 33 | TRANSACTION REVIEW | 0 | 0 | 0 | 0 | — |
| 34 | RECEIPT CAPTURE FAILURE | 0 | 0 | 0 | 0 | — |
| 35 | ACCOUNT NEEDS REVIEW | 0 | 0 | 0 | 0 | — |
| 36 | ARCHIVE BLOCKED | 0 | 0 | 0 | 0 | — |
| 37 | CORRECTION / REVERSAL CONFIRMATION | 0 | 0 | 0 | 0 | — |

Buttons whose label overflows (after): 0 [].
