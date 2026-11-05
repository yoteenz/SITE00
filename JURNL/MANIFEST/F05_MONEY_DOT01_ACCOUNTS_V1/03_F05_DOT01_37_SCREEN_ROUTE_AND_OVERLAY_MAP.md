# 03 · 37 screens → routes, overlays and states

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

The 37 authorities map to 7 routes, plus states of those routes and one overlay switch. No route was created per screen.

- **Routes:**
  - `/money/places` (directory, empty state, reorder mode);
  - `/money/places/:id` (the four account kinds);
  - `/money/places/:id/history`, `…/settings`, `…/review` and `…/attention`;
  - `/money/entries/:entryId`;
  - `/money/transactions`.
- **Opt-in:** these screens are active when the MONEY parent pilot is on (`/money?parent=motion`, remembered for the session). Otherwise the existing places screens stay, so the default MONEY hub doesn't regress. The new addresses always open DOT 01 pages.
- **Overlays:** one switch, `sheets/Dot01Sheets.tsx`, with the state union `edit | add-account | add-cash | spend | record | receipt | card-payment | transfer | purposes | archive | correct | adjust`.
  - Each overlay is a full paper composition, portaled above the page. The page stays mounted underneath, keeping its URL filters, scroll position and carousel collection.
  - Escape and the back chip close an overlay, and focus returns to the control that opened it.

| # | Screen | Kind | Route / overlay | Opened from | Component | Environment | Dock | Chips | Test hook |
|---|---|---|---|---|---|---|---|---|---|
| 01 | MONEY · VIEW ALL ACCOUNTS (parent, ACCOUNTS collection) | route | `/money?parent=motion (c=accounts)` | MONEY tab | `MoneyMotionParent` | SK01 (full, layered) | yes (parent nav paper) | search · add · menu | `[data-jrn-f05-stage]` |
| 02 | BANK ACCOUNT | route | `/money/places/:id (bank kinds)` | parent paper, ALL ACCOUNTS | `AccountPage` | SK02_FIELD + SK02 papers | no | back | `d01-account` |
| 03 | RIDESHARE CARD | route | `/money/places/:id (payout debit)` | same | `AccountPage` | SK02_FIELD + SK02 papers | no | back | `d01-account` |
| 04 | CASH ON HAND | route | `/money/places/:id (cash)` | same | `AccountPage` | SK02_FIELD + SK02 papers | no | back | `d01-account` |
| 05 | CREDIT CARD | route | `/money/places/:id (credit card / loan)` | same | `AccountPage` | SK02_FIELD + SK02 papers | no | back | `d01-account` |
| 06 | ALL ACCOUNTS | route | `/money/places` | VIEW ALL ACCOUNTS, back from a place | `DirectoryPage` | SK02_FIELD | yes (SK01 nav paper in the composition) | back | `d01-directory` |
| 07 | BANK TRANSACTION HISTORY | route | `/money/places/:id/history` | ACCOUNT HISTORY strip | `HistoryPage` | SK02_FIELD | no | back | `d01-history` |
| 08 | RIDESHARE ACTIVITY | route | `/money/places/:id/history (payout)` | TRANSACTION HISTORY strip | `HistoryPage` | SK02_FIELD | no | back | `d01-history` |
| 09 | CASH USAGE HISTORY | route | `/money/places/:id/history (cash)` | USAGE HISTORY strip | `HistoryPage` | SK02_FIELD | no | back | `d01-history` |
| 10 | CREDIT CARD ACTIVITY | route | `/money/places/:id/history (card)` | TRANSACTION HISTORY strip | `HistoryPage` | SK02_FIELD | no | back | `d01-history` |
| 11 | TRANSACTION DETAIL | route | `/money/entries/:entryId` | any history row | `TransactionDetailPage` | SK02_FIELD | no | back | `d01-entry` |
| 12 | ACCOUNT DETAILS AND SETTINGS | route | `/money/places/:id/settings` | ACCOUNT / CARD / CASH DETAILS strip | `SettingsPage` | SK02_FIELD | no | back | `d01-settings-page` |
| 13 | ACCOUNT BALANCE REVIEW | route | `/money/places/:id/review` | BALANCE REVIEW strip (settings) | `BalanceReviewPage` | SK02_FIELD | no | back | `d01-review-page` |
| 14 | ADD ACCOUNT | overlay | `add-account` | ADD ACCOUNT (06), empty state (22) | `AddAccountOverlay` | SK03_FIELD | covered | back | `d01-add-account` |
| 15 | EDIT ACCOUNT | overlay | `edit` | RENAME ACCOUNT (12), MANAGE CARD (03) | `EditAccountOverlay` | SK03_FIELD | covered | back | `d01-edit-account` |
| 16 | RECORD BANK TRANSACTION | overlay | `record` | RECORD TRANSACTION (07) | `PurchaseFlow (withType)` | SK03_FIELD | covered | back | `d01-record` |
| 17 | ADD CASH | overlay | `add-cash` | ADD CASH strip (04) | `AddCashOverlay` | SK03_FIELD | covered | back | `d01-add-cash` |
| 18 | RECORD CASH SPENDING | overlay | `spend (cash)` | RECORD CASH SPENDING strip (04, 09) | `PurchaseFlow (cash)` | SK03_FIELD | covered | back | `d01-record` |
| 19 | RECORD CREDIT CARD PURCHASE | overlay | `spend (card)` | RECORD PURCHASE strip (05, 10) | `PurchaseFlow (card)` | SK03_FIELD | covered | back | `d01-record` |
| 20 | RECORD CREDIT CARD PAYMENT | overlay | `card-payment` | MAKE A PAYMENT strip (05) | `CardPaymentOverlay` | SK03_FIELD | covered | back | `d01-card-payment` |
| 21 | ACCOUNT PURPOSE PREFERENCES | overlay | `purposes` | EDIT PURPOSES strip (12) | `PurposesOverlay` | SK03_FIELD | covered | back | `d01-purposes` |
| 22 | EMPTY ACCOUNTS | route state | `/money/places (no places)` | first use | `DirectoryPage (empty)` | SK02_FIELD | no | back | `d01-empty-accounts` |
| 23 | BALANCE ADJUSTMENT REVIEW | overlay | `adjust` | ADD ADJUSTMENT strip (13) | `AdjustmentOverlay` | SK03_FIELD | covered | back | `d01-adjust` |
| 24 | TRANSACTION CORRECTION / REVERSAL | overlay | `correct (options)` | CORRECT TRANSACTION strip (11) | `CorrectionOverlay` | SK03_FIELD | covered | back | `d01-correct` |
| 25 | ACCOUNT ARCHIVE CONFIRMATION | overlay | `archive (no blockers)` | ARCHIVE ACCOUNT strip (12), EDIT (15) | `ArchiveOverlay` | SK03_FIELD | covered | back | `d01-archive` |
| 26 | CAPTURE RECEIPT | overlay | `receipt (capture)` | SCAN RECEIPT (07–10, 16, 18, 19) | `ReceiptFlow` | SK03 (full, papers baked; live lettering, live camera) | covered | back | `d01-receipt-capture` |
| 27 | SCANNING RECEIPT | overlay state | `receipt (scanning)` | a photo taken or uploaded | `ReceiptFlow` | SK03_FIELD | covered | back | `d01-receipt-scanning` |
| 28 | REVIEW EXTRACTED PURCHASE | overlay state | `purchase form with read values` | OCR finished | `PurchaseFlow` | SK03_FIELD | covered | back | `d01-review-purchase` |
| 29 | RECEIPT EXCEPTION / DUPLICATE | overlay state | `purchase duplicate step` | a likely duplicate found | `PurchaseFlow` | SK03_FIELD | covered | back | `d01-receipt-duplicate` |
| 30 | ACCOUNT SETUP DETAILS | overlay state | `add-account with a kind chosen` | a kind chosen in 14 | `AddAccountOverlay` | SK03_FIELD | covered | search · add | `d01-add-account` |
| 31 | TRANSACTION SEARCH AND FILTER | route | `/money/transactions (?q, from, to, type, category, status, sort, account)` | search chip, VIEW ALL | `HistoryPage (all)` | SK02_FIELD | yes (SK01 nav paper in the composition) | search · add | `d01-history` |
| 32 | REORDER ACCOUNTS | route state | `/money/places (reorder mode)` | REORDER (06) | `DirectoryPage (ReorderList)` | SK02_FIELD | no | search · add | `d01-reorder` |
| 33 | TRANSACTION REVIEW | overlay state | `purchase review step` | RECORD … / SAVE PURCHASE | `PurchaseFlow` | SK03_FIELD | covered | search · add | `d01-transaction-review` |
| 34 | RECEIPT CAPTURE FAILURE | overlay state | `receipt (failed)` | unreadable photo, timeout, unsupported file | `ReceiptFlow` | SK03_FIELD | covered | search · add | `d01-receipt-failure` |
| 35 | ACCOUNT NEEDS REVIEW | route | `/money/places/:id/attention` | NEEDS REVIEW badge (06) | `NeedsReviewPage` | SK02_FIELD | no | search · add | `d01-attention-page` |
| 36 | ARCHIVE BLOCKED | overlay state | `archive (with blockers)` | ARCHIVE ACCOUNT while something depends on it | `ArchiveOverlay` | SK03_FIELD | covered | search · add | `d01-archive-blocked` |
| 37 | CORRECTION / REVERSAL CONFIRMATION | overlay state | `correct (confirm)` | CONTINUE in 24 | `CorrectionOverlay` | SK03_FIELD | covered | search · add | `d01-correct-confirm` |

Code lives in `src/projects/jurnl/runtime/screens/f05/dot01/` (pages) and `…/dot01/sheets/` (overlays). Routes are in `runtime/JurnlRuntimeRoot.tsx` and `dot01/Dot01Routes.tsx`.
