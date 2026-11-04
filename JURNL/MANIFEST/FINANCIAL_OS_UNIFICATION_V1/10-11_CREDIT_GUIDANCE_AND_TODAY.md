# 10 · Credit-card payment and utilization planning  ·  11 · TODAY operating experience

## 10 · Credit (F12 stays the owner)

`data/f12/creditGuidance.ts`, `data/f12/creditStore.ts`, `runtime/finance/CreditSheets.tsx`.

**Card facts** (all entered by the user; nothing invented): balance owed now (ledger position), limit, credit available, statement balance, statement closing date (or day of month), payment due date (or day), minimum, **paid since statement** (card-payment IN legs after the closing date), minimum still due, statement still due, APR, promo APR + end, carried-balance answer, pay-from account, when the terms were entered. Missing items are listed by name.

Three separate tracks (PLAN A PAYMENT):

| Track | Shows | Never |
| --- | --- | --- |
| A · Avoid a late payment | Minimum, due date, days left, paid since statement, minimum remaining; PAST DUE / DUE SOON / SCHEDULED / MINIMUM PAID | Guesses a minimum or a date |
| B · Interest | Remaining statement balance to pay by the due date "IF YOUR CARD HAS A GRACE PERIOD. CHECK YOUR CARD TERMS." When a balance carried over: says a grace period may not apply. | Promises interest avoidance |
| C · Utilization | Balance ÷ limit (current or statement balance), a target **the user types**, target balance = floor(limit × target), payment = ceil(balance − target). Overall use across cards with a known limit; cards without a limit are listed, not guessed. | Shows or predicts a credit score; recommends a "perfect" %; claims a reporting date |

Cautions shown verbatim: "NOT A CREDIT SCORE. LOWER USE OF A LIMIT IS OFTEN VIEWED FAVORABLY, BUT NO TARGET GUARANTEES ANY SCORE CHANGE." · "THE STATEMENT CLOSING DATE AND THE DATE A CARD REPORTS ITS BALANCE ARE NOT ALWAYS THE SAME. ASK YOUR CARD ISSUER IF THE TIMING MATTERS."

**Paying from the rideshare card (doc 12 of the brief):** the source line reads, e.g., "UBER CARD HAS $240 RECORDED. $40 OF IT IS SET ASIDE FOR OTHER PAYMENTS. $60 IN OTHER BILLS PAID FROM IT ARE DUE FIRST. $140 IS FREE FOR THIS CARD." It accounts for other set-asides, other bills from that account due before the card, the recorded balance and its age. Actions: SET MONEY ASIDE · RECORD PAYMENT · CHANGE PAYMENT ACCOUNT · VIEW CARD DETAILS. No payment is ever made automatically.

Recording a payment = a CARD PAYMENT transfer (doc 06): owed down, source down, no grocery / food / travel expense created, minimum remaining updates (tests H, Q).

The old ADD A CARD flow that wrote a $5,000 limit, $25 minimum and day-15 due date is replaced by a form asking only for the name, balance owed and (optional) limit.

## 11 · TODAY (F03)

`data/f03/todayOperating.ts` (derived only), `runtime/finance/TodayMoneySheet.tsx`, `HomeScreens.tsx`.

The approved TODAY parent composition is unchanged (root-authority pixel diff vs main: 0.55 % at 393 px, 0.24 % at 1440 px — text only). What changed on the parent:

| Element | Before | After |
| --- | --- | --- |
| Attention slip | Fixed "RENT IS CLOSE" | Counted fact: "CARD PAYMENT PAST DUE" › "N BILLS ARE OVERDUE" › "N BILLS DUE THIS WEEK" › "CARD DUE FRIDAY"; nothing when nothing applies |
| Status line under the number | "A COMPUTED SIGNAL. PREVIEW." | "FROM BALANCES YOU ENTERED." (or "SAMPLE NUMBERS. ADD ACCOUNTS.") |
| COMING rows | "2026-11-06 · BILL" for everything, income included | "FRIDAY · CARD PAYMENT", amount still due |
| MOVED rows | "TODAY" forever | the entry's real relative date |

Everything else opens from the existing **SEE WHY** drawer: how the number is made (cash, bills due by date, card minimums, held / plans / goals / trips, with "INCLUDES $X YOU SET ASIDE. NOT TAKEN OFF TWICE."), where the money is (cash on hand, each account with kind, basis and age, money set aside, what each card owes), coming up (bills this week with set-aside / still needed, card payments, account shortfalls, over-set-aside accounts), earned today / this week, and optional next steps built from the data (ADD TODAY'S EARNINGS, SET ASIDE $45 FOR CAR INSURANCE, PAY VISA — $45 MINIMUM LEFT, MOVE MONEY: BANK IS $100 SHORT FOR BILLS, RECORD SPENDING).

## Propagation after an end-of-day entry (brief §13)

F06 record → F04 legs → F05 balances → F07 funding room → F08/F09 Safe to Spend → F12 "free for this card" → F03 earned + next steps. All are reads of the same records; nothing is copied.
