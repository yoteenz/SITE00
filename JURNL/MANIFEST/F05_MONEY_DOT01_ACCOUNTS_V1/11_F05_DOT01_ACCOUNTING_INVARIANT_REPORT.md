# 11 · Accounting invariants

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

`tests/jurnlF05Dot01.test.ts` runs on the synthetic world RIDE $300 · BANK $100 · CASH $100 · VISA owes $400 of $2,000. Every mutation goes through `ledgerOps`.

**61 / 61 pass.** The full JURNL unit suite (44 files) gives **798 / 798**: the 737 that passed before this sprint, plus these 61.

- **Financial invariant suites:** `jurnlFinancialInvariants` and `jurnlFinancialStabilization` were not changed.
- **Pilot unit tests:** three expectations in `jurnlF05MotionPilot.test.ts` were updated, each for an intended design change from the V9 authority 01:
  - four places plus VIEW ALL ACCOUNTS;
  - SK01 has no separate tag paper;
  - the seal settles from `scale(1.04)` with no rotation.

| # | Invariant | Result |
|---|---|---|
| D01 | with no saved order the natural order is kept | PASS |
| D02 | a saved order is applied to ALL ACCOUNTS and the MONEY parent | PASS |
| D03 | an order that misses, repeats or invents a place is refused and nothing is saved | PASS |
| D04 | reordering changes no balance, id or entry | PASS |
| D05 | keyboard moves swap neighbours and stop at the ends | PASS |
| D06 | a place added after the order was saved appears after the ordered ones | PASS |
| D07 | the MONEY parent shows the first four places of the saved order | PASS |
| D08 | assets show money held; the card shows what is owed, never as money held | PASS |
| D09 | available credit = limit − owed; a card without a limit shows none (never invented) | PASS |
| D10 | kinds follow the account type (bank · payout · cash · credit) | PASS |
| D11 | money on its way in or waiting to leave is shown apart, not as held | PASS |
| D12 | a place history lists only that place, newest first | PASS |
| D13 | search matches merchant, category and notes (any case) | PASS |
| D14 | filters: dates, category, type, largest first | PASS |
| D15 | a card purchase raises what is owed (effect on the card is +), a bank purchase lowers money held | PASS |
| D16 | unsettled transfer legs are listed with their state and move nothing | PASS |
| D17 | category choices come from the records | PASS |
| D18 | preview writes nothing; save writes exactly the previewed entry | PASS |
| D19 | saving the same preview twice is refused (no double entry) | PASS |
| D20 | a card purchase raises what the card owes and moves no cash | PASS |
| D21 | a cash purchase lowers cash on hand only | PASS |
| D22 | a receipt attaches to that single entry (never a second transaction) | PASS |
| D23 | an archived place cannot take new purchases | PASS |
| D24 | the user text is kept as typed beside the canonical display form | PASS |
| D25 | invalid amounts and empty merchants are refused before anything is written | PASS |
| D26 | the same receipt image is a duplicate whatever the amount | PASS |
| D27 | same amount within a day at the same merchant is a likely duplicate | PASS |
| D28 | a different amount, or more than a day apart, is not a duplicate | PASS |
| D29 | a duplicate is only flagged in the preview; nothing is blocked or saved automatically | PASS |
| D30 | merchant, date, total, subtotal, tax and items are read | PASS |
| D31 | a total that cannot be read stays empty (never guessed) and is flagged | PASS |
| D32 | totals that do not add up are flagged | PASS |
| D33 | low engine confidence and empty text are flagged | PASS |
| D34 | ISO, US and written dates are read; impossible dates are not | PASS |
| D35 | only photos up to 12 MB are accepted; PDFs get an honest message | PASS |
| D36 | a correction keeps the entry id, applies the new amount and appends what it replaced | PASS |
| D37 | reassigning a bank purchase to the card makes it a credit purchase (cash back, card owes more) | PASS |
| D38 | two corrections keep both earlier versions in order | PASS |
| D39 | a reversal removes the entry from every balance and keeps a full copy in the audit | PASS |
| D40 | an entry cannot be reversed twice | PASS |
| D41 | transfer legs, income and balance corrections are changed by their owners, not here | PASS |
| D42 | a correction that changes nothing reports no change | PASS |
| D43 | tracked, actual and difference are separate numbers; nothing is stored for the actual | PASS |
| D44 | a place with a difference can never be marked reconciled | PASS |
| D45 | the adjustment is one balance correction (ADJUSTMENT: not income, not spending), with the reason | PASS |
| D46 | after the adjustment the place can be marked reconciled; the mark goes stale when the balance moves | PASS |
| D47 | a zero difference records nothing | PASS |
| D48 | cards reconcile on what is owed (an actual owed above tracked raises the debt) | PASS |
| D49 | an unconfirmed old transfer is a review issue that cannot just be dismissed | PASS |
| D50 | a card that still owes cannot be archived | PASS |
| D51 | an unfinished transfer blocks both places | PASS |
| D52 | a default purpose, a recurring bill, expected income and reserved money each block | PASS |
| D53 | a place with nothing depending on it is archived; its history stays and it leaves the order | PASS |
| D54 | preview writes nothing | PASS |
| D55 | a completed card payment lowers the bank and what the card owes by the same amount | PASS |
| D56 | a submitted or scheduled payment moves nothing yet (never treated as settled) | PASS |
| D57b | the canonical guard refuses recording the same payment twice the same day | PASS |
| D57 | saving the same transfer twice is refused | PASS |
| D58 | cash withdrawn from the bank is a transfer, not income | PASS |
| D59 | a card cannot be paid more than it owes, and cash cannot go below zero (nothing would vanish from the picture) | PASS |
| D60 | the money picture still balances after DOT 01 entries (tracked = held + in transit) | PASS |

## Findings on the canonical engine (not changed here)

- **Card overpayment:** `buildTransfer` accepts paying a card more than it owes, and paying from cash more than cash holds. The card's position stops at 0, so the extra would vanish from the picture.
  - DOT 01's preview refuses both: a card payment is never more than the card owes after the payments already recorded, and cash never goes below 0. A bank overdraft is allowed, with a warning (D59).
  - The canonical engine and the DOT 02 transfer sheet are unchanged. Founder decision: apply the same guard there?
- **Uppercase storage:** `buildEntry` stores the merchant and memo uppercased, and `createManualAccount` does the same for account names.
  - DOT 01 now keeps what the user typed in `entry.source_values` (D24). Receipt values are kept exactly as read, in `entry.receipt.extracted`.
  - Account names are still stored uppercased (canonical, shared by every family).
