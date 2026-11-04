# 15 — Founder stabilization review

**Status: FOUNDER_REVIEW (draft PR, stacked on #1705). Nothing is merged, deployed or migrated.**

## Your four decisions: all four are in

| | You decided | What you will see |
|---|---|---|
| D1 | A 30-day Safe to Spend, plus a view up to the next income | The Safe to Spend screen now says `NEXT 30 DAYS · TO DEC 3 · CHANGE` under the amount, in place of a date printed from the reference image that was wrong every day but one. Tap it, or use SEE WHY on TODAY, to switch to **BEFORE NEXT INCOME**. That view runs the same calculation up to your next expected paycheck. The 30-day number never changes when you switch, and expected income is never counted as money you have. With no paycheck date recorded, it says so and offers to add one. Daily earnings are not forecast. |
| D2 | Keep card minimums in Safe to Spend | Each card's minimum still due is taken off once. Only a payment the card has confirmed in this statement cycle lowers it. A payment on its way says `STILL OWES $X UNTIL THE CARD CONFIRMS IT`. If you also entered the card payment as a bill, link it to the card and it is not taken off twice. If it is not linked, JURNL keeps counting it and asks you to link it. |
| D3 | SET MONEY ASIDE on both Plan and the bill page | Plan → SET MONEY ASIDE → FOR A BILL opens the same set-aside as the bill page. Change it in one place and the other shows the same amount. Money set aside is still in your account, and it is never taken off Safe to Spend twice. |
| D4 | Plain headlines | Twelve family headlines are now straightforward, for example `YOUR CARDS, WHAT YOU OWE AND WHEN.` and `YOUR SAVINGS GOALS.`. TODAY now reads `YOUR MONEY.`, which fits inside the original headline's space; `YOUR MONEY NOW.` ran into the olive branch and statue. `PLAN TODAY. GROW FREELY.` and the approved editorial lines are untouched. |

## The accounting correction you asked for: money on its way

Your example: RIDESHARE $300, BANK $100, move $80.

| What happened | RIDESHARE | BANK | IN TRANSIT | Available in the two |
|---|---|---|---|---|
| Planned, or started but not left | 300 | 100 | 0 | 400 |
| **Left rideshare, not in the bank yet** | **220** | **100** | **80** | **320** |
| Arrived | 220 | 180 | 0 | 400 |

- Money in transit is in neither account. You cannot spend it or pay a bank bill with it until it arrives.
- Confirming "arrived" twice adds it once.
- A transfer whose money has left cannot be deleted; mark it arrived or failed instead.
- A cash deposit on its way works the same way.
- Transfers recorded before this change as "still on its way" now show **NEEDS CONFIRMATION** and change nothing until you say what happened. JURNL never guesses.

Card payments use the same steps in card words: PAYMENT SCHEDULED → PAYMENT SUBMITTED → PAID FROM ACCOUNT · CARD NOT CONFIRMED → CARD CONFIRMED PAYMENT (or FAILED or REVERSED).

## Also fixed

- TODAY no longer shows sample bills (RENT $1,800, GROCERIES $120) next to your real balances. With no bills entered it says `NO BILLS ADDED`.
- TODAY's MORE now opens a drawer with ASK JURNL. ASK JURNL had been unreachable; it says honestly that no live AI is connected.
- A bill's EDIT is a direct button.

## Tests

- **7 / 7 long-standing E2E failures fixed at the cause, plus the 2 F01 unit failures.** No test was weakened or removed.
- **New invariant tests:** 27/27, covering T01–T28. Sprint-1 invariants: 40/40.
- **JURNL unit tests:** 707/707.
- **New journeys:** 64/64 at phone-small, phone, tablet and desktop.
- **Existing E2E:** 204/207 in one heavy run. The 3 are one long journey that timed out under machine load; it passes when run alone, at its usual speed.
- **Build:** passes.
- **Screens:** the pixel difference against #1705 is under 1% on every hub; only the changed words differ.

## Still blocked, and what unblocks it

**Live security proof (two QA users, one cannot see the other's data) did not run, because the secrets are not set.** Add these nine as GitHub Actions secrets, then run the existing live-proof workflow. Never paste them into code, comments or ZIPs.

```
SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_ANON_KEY, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
JURNL_QA_USER_A_EMAIL, JURNL_QA_USER_A_PASSWORD, JURNL_QA_USER_B_EMAIL, JURNL_QA_USER_B_PASSWORD
```

## For you to decide

1. Approve or edit the replacement headlines (doc 09, every row marked `PENDING_REVIEW`).
2. Confirm `YOUR MONEY.` as the TODAY headline.
3. Merge order: review #1705 first, then this PR (it will be retargeted to `main`).
