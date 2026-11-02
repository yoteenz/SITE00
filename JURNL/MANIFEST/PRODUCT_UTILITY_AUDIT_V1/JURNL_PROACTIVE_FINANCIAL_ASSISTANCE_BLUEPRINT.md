# JURNL proactive financial assistance blueprint

**Not implemented this sprint.** Defines assistive patterns using existing data only.

## Classification system

| Class | Example | Delivery today |
| --- | --- | --- |
| FACT | “Rent is due Friday.” | Possible via `projectUpcoming` |
| CALCULATION | “You still need $45 for car insurance.” | **Blocked** — no funded_amount |
| PROJECTION | “Safe to spend $820.” | F09 STS |
| POSSIBLE_PATTERN | “Two $15 charges look similar.” | NOT_IMPLEMENTED |
| SUGGESTED_ACTION | “Add $45 to this bill.” | NOT_IMPLEMENTED |
| USER_CONFIRMATION_REQUIRED | “Mark internet bill paid?” | NOT_IMPLEMENTED |

## Opportunities (data-backed only)

| Signal | Source | UI surface | Push? |
| --- | --- | --- | --- |
| Upcoming shortfall | obligation amount − funded | F03 attention, F07 row | No push infra verified |
| Subscription renewal | obligation `next_due_date` | F03, F07 | — |
| Income allocation prompt | new ledger INCOME | Post Quick Add toast | PARTIAL |
| Price change | obligation history | — | **Needs history table** |
| Monthly recurring total | obligations filter | F07 header | CALCULATION |
| Due follow-up | overdue status | F07 OVERDUE bucket | FACT |

## Rules

- No automatic payment execution
- No auto-cancel subscription with merchant
- Do not treat overdue as “unpaid confirmed”
- Ask JURNL remains **explanatory**, not primary workflow (existing global sheet)

## P2 priority

After P0 funding + subscription clarity + plain language on F03/F07/F09.
