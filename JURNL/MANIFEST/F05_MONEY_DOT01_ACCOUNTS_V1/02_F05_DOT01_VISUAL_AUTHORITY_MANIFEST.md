# 02 · Visual authority manifest (37 screens)

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.


- **Sources:** the 37 PNG authorities are 941 × 1672 RGB. Their SHA-256 values are in `JURNL/F05_MONEY_DOT01/INPUT_V9/README.md`, and the repository keeps WebP q92 copies.
- **Use:** they are comparison references only. No authority pixel is shown as runtime UI.
- **Status:** the package README says they are founder-review references, *not automatic approval of every financial control or text value*.

| # | Screen | Kind | Environment it was rendered on |
|---|---|---|---|
| 01 | MONEY · VIEW ALL ACCOUNTS (parent, ACCOUNTS collection) | route | SK01 (pixel pair) |
| 02 | BANK ACCOUNT | route | SK02 (pixel pair) |
| 03 | RIDESHARE CARD | route | SK02 (separate render) |
| 04 | CASH ON HAND | route | SK02 (separate render) |
| 05 | CREDIT CARD | route | SK02 (separate render) |
| 06 | ALL ACCOUNTS | route | SK02 (separate render) |
| 07 | BANK TRANSACTION HISTORY | route | SK02 (separate render) |
| 08 | RIDESHARE ACTIVITY | route | SK02 (separate render) |
| 09 | CASH USAGE HISTORY | route | SK02 (separate render) |
| 10 | CREDIT CARD ACTIVITY | route | SK02 (separate render) |
| 11 | TRANSACTION DETAIL | route | SK02 (separate render) |
| 12 | ACCOUNT DETAILS AND SETTINGS | route | SK02 (separate render) |
| 13 | ACCOUNT BALANCE REVIEW | route | SK02 (separate render) |
| 14 | ADD ACCOUNT | overlay | SK03 (separate render) |
| 15 | EDIT ACCOUNT | overlay | SK03 (separate render) |
| 16 | RECORD BANK TRANSACTION | overlay | SK03 (separate render) |
| 17 | ADD CASH | overlay | SK03 (separate render) |
| 18 | RECORD CASH SPENDING | overlay | SK03 (separate render) |
| 19 | RECORD CREDIT CARD PURCHASE | overlay | SK03 (separate render) |
| 20 | RECORD CREDIT CARD PAYMENT | overlay | SK03 (separate render) |
| 21 | ACCOUNT PURPOSE PREFERENCES | overlay | SK03 (separate render) |
| 22 | EMPTY ACCOUNTS | route state | SK02 (separate render) |
| 23 | BALANCE ADJUSTMENT REVIEW | overlay | SK03 (separate render) |
| 24 | TRANSACTION CORRECTION / REVERSAL | overlay | SK03 (separate render) |
| 25 | ACCOUNT ARCHIVE CONFIRMATION | overlay | SK03 (separate render) |
| 26 | CAPTURE RECEIPT | overlay | SK03 (pixel pair) |
| 27 | SCANNING RECEIPT | overlay state | SK03 (separate render) |
| 28 | REVIEW EXTRACTED PURCHASE | overlay state | SK03 (separate render) |
| 29 | RECEIPT EXCEPTION / DUPLICATE | overlay state | SK03 (separate render) |
| 30 | ACCOUNT SETUP DETAILS | overlay state | SK03 (separate render) |
| 31 | TRANSACTION SEARCH AND FILTER | route | SK02 (separate render) |
| 32 | REORDER ACCOUNTS | route state | SK02 (separate render) |
| 33 | TRANSACTION REVIEW | overlay state | SK03 (separate render) |
| 34 | RECEIPT CAPTURE FAILURE | overlay state | SK03 (separate render) |
| 35 | ACCOUNT NEEDS REVIEW | route | SK02 (separate render) |
| 36 | ARCHIVE BLOCKED | overlay state | SK03 (separate render) |
| 37 | CORRECTION / REVERSAL CONFIRMATION | overlay state | SK03 (separate render) |

## Alignment, measured (ECC, identity transform)

- **Pixel pairs:**
  - SK01 is pixel-aligned with authority 01;
  - SK02 with authority 02;
  - SK03 with authority 26.
- **The other 34 authorities** are separate renders: their statue and arch regions differ from the matching SIDEKICK by 15–57 %.
- **Consequence:** pixel fidelity can only be measured on 01, 02 and 26. Everywhere else, the runtime is the SIDEKICK environment with that screen's paper arrangement, which the contract anticipates ("many detail screens will require a different static arrangement of existing paper components, not a forced same-pixel scene"). Doc 13 measures every screen and keeps the two cases apart.

## Chrome each authority draws

The runtime follows each authority's chrome. The browser tests assert it: `the dock appears only where its authority draws it`, and `chips follow the authorities`.

- **Global dock (HOME / MONEY / ADD / PLAN / CREDIT):** only 01, 06 and 31. It sits inside the composition on the torn nav paper, at board y 1459–1662. Every other screen is full-bleed down to the bottom landscape.
- **Top-right chips:**
  - back on 02–29;
  - search + add on 01, 30, 31, 32, 33, 34, 35, 36 and 37.
- **JURNL tag:** the small torn upper-left identity paper is on every screen. Its lettering is live.
