# 03 · 37-screen BEFORE matrix

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

BEFORE = runtime at `f23032ac`, captured at 471 × 836 (the authorities' aspect). Screenshots: `before/<id>-<viewport>.webp`; comparisons: `before_after/<id>_AUTHORITY_BEFORE_AFTER.webp`.

| # | Screen | Authority file | MAD before | Main discrepancy before |
|---|---|---|---|---|
| 01 | MONEY DOT 01 VIEW ALL ACCOUNTS | `01_MONEY_DOT01_VIEW_ALL_ACCOUNTS.webp` | 6.2 % | chips, type weight and micro-assets (see doc 02) |
| 02 | BANK ACCOUNT | `02_BANK_ACCOUNT.webp` | 6.9 % | chips, type weight and micro-assets (see doc 02) |
| 03 | RIDESHARE CARD | `03_RIDESHARE_CARD.webp` | 21.4 % | authority composition differs: dark band with gold figure, keychain art, SPENDABLE paper (keychain art requires source recovery) |
| 04 | CASH ON HAND | `04_CASH_ON_HAND.webp` | 22.2 % | authority composition differs: large amphora left, cream figure on dark band, two-row paper (amphora layer requires source recovery) |
| 05 | CREDIT CARD | `05_CREDIT_CARD.webp` | 19.9 % | authority composition differs: figure on dark band with OWED rule, stats paper right, coin art (coin layer requires source recovery) |
| 06 | ALL ACCOUNTS | `06_ALL_ACCOUNTS.webp` | 17.7 % | chips, type weight and micro-assets (see doc 02) |
| 07 | BANK TRANSACTION HISTORY | `07_BANK_TRANSACTION_HISTORY.webp` | 15.5 % | authority is a plain DATE / TRANSACTION / AMOUNT ledger table without search; runtime keeps search + filters (structural) |
| 08 | RIDESHARE ACTIVITY | `08_RIDESHARE_ACTIVITY.webp` | 21.5 % | authority rows carry scene thumbnails and a payout summary (structural) |
| 09 | CASH USAGE HISTORY | `09_CASH_USAGE_HISTORY.webp` | 20.7 % | authority rows carry scene thumbnails and a cash summary (structural) |
| 10 | CREDIT CARD ACTIVITY | `10_CREDIT_CARD_ACTIVITY.webp` | 21.1 % | authority header pairs CURRENT BALANCE + AVAILABLE CREDIT; plain table (structural) |
| 11 | TRANSACTION DETAIL | `11_TRANSACTION_DETAIL.webp` | 20.1 % | authority sets the receipt preview beside the rows and four action rows (structural) |
| 12 | ACCOUNT DETAILS AND SETTINGS | `12_ACCOUNT_DETAILS_AND_SETTINGS.webp` | 17.5 % | authority row set and toggles differ (structural) |
| 13 | ACCOUNT BALANCE REVIEW | `13_ACCOUNT_BALANCE_REVIEW.webp` | 24.5 % | authority: large TRACKED / ACTUAL figures, DIFFERENCE band, status block (structural) |
| 14 | ADD ACCOUNT | `14_ADD_ACCOUNT.webp` | 24.2 % | form fields below the type cards are laid out differently from the authority |
| 15 | EDIT ACCOUNT | `15_EDIT_ACCOUNT.webp` | 19.7 % | authority purpose tags, balance tracking and status actions arrangement |
| 16 | RECORD BANK TRANSACTION | `16_RECORD_BANK_TRANSACTION.webp` | 20.8 % | per-screen seal (bank column) not supplied; MERCHANT row added (required by the purchase rules); scan art is Batch 04 (style refinement) |
| 17 | ADD CASH | `17_ADD_CASH.webp` | 23.7 % | authority header art (amphora with coins) and coin seal not supplied |
| 18 | RECORD CASH SPENDING | `18_RECORD_CASH_SPENDING.webp` | 21.1 % | amphora seal not supplied; authority receipt slip under the heading |
| 19 | RECORD CREDIT CARD PURCHASE | `19_RECORD_CREDIT_CARD_PURCHASE.webp` | 17.6 % | coin seal not supplied |
| 20 | RECORD CREDIT CARD PAYMENT | `20_RECORD_CREDIT_CARD_PAYMENT.webp` | 17.9 % | card seal not supplied; notice wording block differs slightly |
| 21 | ACCOUNT PURPOSE PREFERENCES | `21_ACCOUNT_PURPOSE_PREFERENCES.webp` | 21.2 % | chip surfaces await Batch 05 (CHIP.PARCHMENT); bank / primary-use rows |
| 22 | EMPTY ACCOUNTS | `22_EMPTY_ACCOUNTS.webp` | 24.3 % | add tiles and empty message arrangement |
| 23 | BALANCE ADJUSTMENT REVIEW | `23_BALANCE_ADJUSTMENT_REVIEW.webp` | 20.7 % | authority: TRACKED / ACTUAL papers, ADJUSTMENT AMOUNT band (structural) |
| 24 | TRANSACTION CORRECTION / REVERSAL | `24_TRANSACTION_CORRECTION_REVERSAL.webp` | 20.4 % | receipt preview beside the rows (structural) |
| 25 | ACCOUNT ARCHIVE CONFIRMATION | `25_ACCOUNT_ARCHIVE_CONFIRMATION.webp` | 23.1 % | account summary paper with scene thumbnail |
| 26 | CAPTURE RECEIPT | `26_CAPTURE_RECEIPT.webp` | 10.1 % | chips, type weight and micro-assets (see doc 02) |
| 27 | SCANNING RECEIPT | `27_SCANNING_RECEIPT.webp` | 22.5 % | scan corners / beam await Batch 06; step list falls below the fold at 393 × 852 (internal scroll) |
| 28 | REVIEW EXTRACTED PURCHASE | `28_REVIEW_EXTRACTED_PURCHASE.webp` | 20.0 % | receipt preview beside the read values (structural) |
| 29 | RECEIPT EXCEPTION / DUPLICATE | `29_RECEIPT_EXCEPTION_DUPLICATE.webp` | 27.0 % | duplicate comparison papers + red notice await Batch 06 (OVERLAY.RECEIPT.DUPLICATE, STATUS.RED) |
| 30 | ACCOUNT SETUP DETAILS | `30_ACCOUNT_SETUP_DETAILS.webp` | 21.8 % | field list arrangement |
| 31 | TRANSACTION SEARCH AND FILTER | `31_TRANSACTION_SEARCH_AND_FILTER.webp` | 18.3 % | authority filter chips row + thumbnail list (structural) |
| 32 | REORDER ACCOUNTS | `32_REORDER_ACCOUNTS.webp` | 21.5 % | six-dot grip art (Batch 04 / 08 is a menu glyph, held) |
| 33 | TRANSACTION REVIEW | `33_TRANSACTION_REVIEW.webp` | 19.7 % | receipt preview left, totals paper (structural) |
| 34 | RECEIPT CAPTURE FAILURE | `34_RECEIPT_CAPTURE_FAILURE.webp` | 21.4 % | caution surface (Batch 06) |
| 35 | ACCOUNT NEEDS REVIEW | `35_ACCOUNT_NEEDS_REVIEW.webp` | 23.3 % | account summary card with scene; review-issue rows |
| 36 | ARCHIVE BLOCKED | `36_ARCHIVE_BLOCKED.webp` | 29.5 % | padlock wax seal (SEAL.LOCK.EMBOSSED, no batch) |
| 37 | CORRECTION / REVERSAL CONFIRMATION | `37_CORRECTION_REVERSAL_CONFIRMATION.webp` | 18.8 % | original → revised comparison badge (Batch 06) |
