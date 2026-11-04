# 03 · Account-purpose preferences  ·  04 / 05 · Daily earnings, cash and digital accounting

## 03 · Usual accounts (smart defaults, never rules)

`data/ledger/purposes.ts`. Resolution: (1) the account the user chose for that purpose, if still active and it fits; (2) the default role; (3) nothing, with a plain explanation of what to add. JURNL never routes money to an unrelated account, and every sheet still lets the user pick any account.

| Purpose | Default role | Can be a credit card? |
| --- | --- | --- |
| BILLS, SUBSCRIPTIONS, BUY NOW PAY LATER, SHOPPING, EVERYDAY SPENDING | BANK ACCOUNT | yes |
| FOOD, GROCERIES, TRAVEL | CREDIT CARD | yes |
| CASH PURCHASES, CASH TIPS | CASH ON HAND | cash tips: no |
| CREDIT CARD PAYMENTS, RIDESHARE EARNINGS | RIDESHARE PAYOUT CARD | no (must hold money) |
| SAVINGS | SAVINGS ACCOUNT | no |

Stored in `settings.purposeAccounts` (purpose → account_id), separate from every financial entry. UI: MONEY → PLACES → USUAL ACCOUNTS (list + change + "USE THE DEFAULT"). Used by: RECORD SPENDING (category → suggested account, shown as a sentence, overridable), Quick Add default account (EVERYDAY SPENDING), bill / subscription "PAID FROM", daily earnings receiving accounts, card "PAY FROM", MOVE MONEY defaults.

Missing example: "NO ACCOUNT IS SET FOR SAVINGS. ADD A SAVINGS ACCOUNT IN MONEY, OR CHOOSE ANY ACCOUNT BELOW."

## 04 · Daily earnings (F06 → ADD DAILY EARNINGS)

`data/f06/dailyEarnings.ts`, `runtime/finance/FinanceSheets.tsx` (`DailyEarningsSheet`, `EarningsDetailSheet`, `AfterEarningsSheet`).

Fields: work date (TODAY / YESTERDAY chips or YYYY-MM-DD), income source (UBER, LYFT, DELIVERY, HOURLY JOB, HOME HEALTHCARE, OTHER WORK or typed), "DO YOUR DIGITAL EARNINGS ALREADY INCLUDE TIPS?", digital earnings, digital tips, cash tips, digital receiving account, cash location, notes. Live totals: **TOTAL EARNED · DIGITAL MONEY RECEIVED · CASH MONEY RECEIVED**.

| Mode | Digital received | Total earned |
| --- | --- | --- |
| A · tips included | digital earnings | digital earnings + cash tips |
| B · tips separate | digital earnings + digital tips | that + cash tips |

Mode A refuses digital tips larger than the digital earnings they are part of. Example (A): 180 incl. 25 tips + 15 cash → 195 earned, 180 to UBER CARD, 15 to CASH.

**One save = one source record + at most two linked legs** (`link { kind: DAILY_EARNINGS, id, leg: DIGITAL | CASH }`), both class INCOME, CLEARED, dated the work date. No pending payout is created: the money is recorded as received instantly.

| Action | Result |
| --- | --- |
| Save | Record + legs in one commit |
| Same source, same day again | Refused: "UBER EARNINGS FOR NOV 3, 2026 ARE ALREADY RECORDED. OPEN THAT DAY TO CHANGE IT." (another source the same day is fine) |
| Edit | Legs rewritten in place (same ids); a leg no longer needed is removed. Balances move by the difference only. Revision appended. |
| Remove | Legs removed; record kept as DELETED with its revision history |
| Receiving into a credit card | Refused with the reason |
| Totals | Today, this week (Monday start), this month — each day once |

After saving, optional next steps (nothing moves until chosen): SET MONEY ASIDE FOR A BILL · PLAN A CREDIT CARD PAYMENT · MOVE MONEY TO THE BANK · PUT MONEY TOWARD SAVINGS · SEE WHAT IS AVAILABLE · DONE FOR TODAY.

Expected income (paychecks on a schedule) stays as before, renamed **ADD EXPECTED INCOME**, so hourly or home-healthcare pay can be either a scheduled source or a daily entry.

## 05 · Cash and digital accounting

| Event | Cash | Digital account | Card owed |
| --- | --- | --- | --- |
| Cash tip $22 | +22 | — | — |
| Digital earnings $180 | — | +180 (chosen account only) | — |
| Cash purchase $12.45 (cash $100) | → $87.55 | — | — |
| Debit purchase $25 (bank $500) | — | bank → $475 | — |
| Credit purchase $65 (owed $400) | — | — | → $465 |

Verified in unit tests A, B, E, F, G and in the Playwright journeys (UI balances).
