# 04 — Credit minimum ↔ Safe to Spend reconciliation (D2)

## Rule

A card's minimum still due is deducted from Safe to Spend **once**, through the card.

```
remainingMinimumAfterPending = max(0, minimum
                                      − confirmed payments in this statement cycle
                                      − payments on their way that will reach the card by the due date)
```

| Payment | Counts toward the minimum? | Shown as |
|---|---|---|
| Confirmed by the card (both legs SETTLED), dated after `statementClosingDate` | Yes: reduces `remainingMinimumAfterPending` and the card balance | `CONFIRMED THIS CYCLE` |
| Left the account, card not confirmed (IN_TRANSIT) | Reduces the amount still to send. The **card balance is unchanged**. | `ON ITS WAY · CARD NOT CONFIRMED` |
| Submitted, not left yet (PENDING), or scheduled on or before the due date | Reduces the amount still to send, and the money is held back once as a committed transfer, not as a second minimum | `PAYMENT SUBMITTED` / `PAYMENT SCHEDULED` |
| Recorded before settlement tracking existed (NEEDS_RECONCILIATION) | Treated as pending until the person confirms it | `NEEDS CONFIRMATION` |
| No statement date known | Cannot be placed in a cycle. It goes to `unmatchedPayments`, and **the minimum stays due** | `PAYMENTS NOT MATCHED TO A STATEMENT` |
| Extra payment above the minimum | Never becomes an additional minimum | — |
| Simulated paydown (F13 what-if) | Changes nothing | — |

When a minimum is fully covered by payments on their way, the card's safety state is the new **PAYMENT_PENDING** (`PAYMENT ON ITS WAY`). It is not `MINIMUM_PAID`. The toast after recording a card payment says `STILL OWES {X} UNTIL THE CARD CONFIRMS IT`.

## No double deduction with bills

A person may also have entered the card payment as a bill ("VISA PAYMENT").

| Bill | Behaviour |
|---|---|
| Linked to the card (`linked_card_account_id`) while the card's minimum is known | Skipped from bills in Safe to Spend and from upcoming. The bill page shows `obligation-linked-card` with the card's state. MARK PAID opens the card payment sheet, because a bill payment cannot settle a card. |
| Linked to the card, but the card has no known minimum | Counted as a bill (nothing else covers it) |
| Not linked, but the name or account suggests it is the card payment | **Still counted**, and listed in `possibleDuplicates`. The bill page shows `obligation-possible-duplicate` with `LINK TO {CARD}` (`upcoming-link-card`). Nothing is dropped silently. |

## Proof

- **Unit:** T11 (in transit → card not settled, minimum counted once), T16 (linked bill counted once; unlinked flagged), T17 (only confirmed in-cycle payments reduce the minimum; unmatched without a statement), T18 (extra and simulated payments), T26 (utilization never assumes a pending payment arrived).
- **E2E (×4 viewports):** `card payment on its way…`, `D2 a bill that is the card payment is counted once, through the card`.
