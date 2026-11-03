# 06 · Transfers and liabilities  ·  07 · Subscriptions and bills  ·  08 · Money set aside

## 06 · Transfers (F05 → PLACES → MOVE MONEY) and card payments

`buildTransfer` in `data/ledger/ledgerOps.ts`.

- Two linked legs: OUT of the source, IN to the destination (`link { kind: TRANSFER, leg }`). Total money held is unchanged; never income or spending; counted once in totals (OUT leg).
- Destination is a credit card or loan → the same two legs are a **CARD PAYMENT** (`CREDIT_PAYMENT` / `DEBT_PAYMENT`): source down, amount owed down, no new spending.
- Refused: same account twice, amount ≤ 0, money **out of** a credit card ("RECORD A PURCHASE INSTEAD").
- Duplicate guard: the same amount between the same two accounts within 3 days is refused with the date of the first one, unless the user confirms "IT HAPPENED TWICE". The same matcher (`findDuplicateTransfer`) is the hook for any future import.
- Status: ARRIVED or STILL ON ITS WAY (PENDING; balances already include both legs). Future dates are scheduled and change nothing until the date.
- Removal: both legs together (Activity → DELETE BOTH SIDES). Every toast says "RECORDED BY YOU, NOT CONFIRMED BY A BANK."

## 07 · Bills and subscriptions (F07 stays the owner; no F17)

`data/f07/obligationLifecycle.ts`, `data/f07/subscriptions.ts`, `UpcomingScreens.tsx`.

Obligation fields added (all optional, backward compatible): `anchor_day`, `category`, `trial_end_date`, `notes`, `price_history[]`, `occurrence_log[]`, `cancelled_at`, `paused_at`; statuses `CANCELLED`, `COMPLETED`; cadence `QUARTERLY`.

| Need | How |
| --- | --- |
| Add / edit (name, price, kind, frequency, next due / renewal date, paid from, category, trial end, notes) | `ObligationFormSheet` |
| Change due date | Edit (moves the schedule; payments and set-asides of that occurrence move with it) |
| Change payment account | Edit → PAID FROM |
| Mark paid | One ledger entry (`obligation_id`, `occurrence_date`, `link BILL_PAYMENT`). Full payment advances to the next date; one-time bills become COMPLETED. Paid with a card → CREDIT_PURCHASE. |
| Partial payment | Same entry; the occurrence stays open with the rest due. Paying more than is due is refused. |
| Skip | No money, next date, set-asides carried forward. Refused if part is paid. |
| Reschedule | Moves only this occurrence; the schedule after it keeps its anchor day. |
| Correct a mistaken payment | PAYMENT HISTORY → UNDO THIS PAYMENT (most recent): entry removed, due date restored, logged as PAYMENT_UNDONE. |
| Pause / resume / stop tracking | Paused = kept, not counted. STOP TRACKING says "IT DOES NOT CANCEL ANYTHING WITH THE COMPANY"; history kept; set-asides released. |
| Month-end / leap year | `addMonthsClamped` keeps the anchor day: 31 → Feb 28 / Feb 29 → Mar 31; Feb 29 yearly → Feb 28 → Feb 29 in the next leap year |

Activity never copies a bill: it shows the one payment entry, which links back to the bill.

**SUBSCRIPTIONS** (`upcoming/subscriptions`): ACTIVE · RENEWING SOON (7 days) · PAUSED · STOPPED TRACKING. Header: count, monthly equivalent, annual equivalent ("ESTIMATED" when frequencies are mixed), next renewal. Factors: weekly × 52 / 12, every 2 weeks × 26 / 12, quarterly / 3, yearly / 12. One-time charges have no monthly equivalent.

## 08 · Money set aside for bills

`data/f07/reservations.ts`. A reservation earmarks money **already in one account** toward one payment occurrence. It is not a payment, not a transfer, moves nothing, creates nothing (tests M, N).

| Operation | Rule |
| --- | --- |
| Add | Capped at what is still due for that occurrence; capped at what the account holds outside its other set-asides. Refusals give exact numbers, e.g. "BANK HAS $360 NOT ALREADY SET ASIDE. SETTING ASIDE $400 WOULD BE $40 MORE THAN IT HOLDS." |
| Reduce / release | Per account |
| Reassign | Same account, new payment, capped by the new payment's need |
| Mark paid | Money set aside in the paying account is used first; anything above what is still due is released (or kept for the next occurrence if chosen). The toast says which. |
| Later over-commitment | Reported in Safe to Spend (`overSetAside`) and TODAY |

Bill page shows: DUE · AMOUNT · "$95 OF $140 SET ASIDE · $45 STILL NEEDED" · PAID FROM.
