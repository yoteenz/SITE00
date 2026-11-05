# 08 · Dependency blocking matrix

Source: `data/f05/dot01/archive.ts` `archiveBlockers(id)`, unchanged and shared by ARCHIVE ACCOUNT (25 / 36) and DELETE POCKET.

| Kind | Blocks when | Shown as | Resolve by (RESOLVE ISSUES) | Why it blocks |
|---|---|---|---|---|
| `ACTIVE_TRANSFER` | a transfer to or from the Pocket is PENDING, SCHEDULED, IN TRANSIT or NEEDS CONFIRMATION | ACTIVE TRANSFER: N TRANSFERS ARE NOT FINISHED. RECORD WHAT HAPPENED FIRST. | ALL ACCOUNTS | archiving would strand a half-settled movement of money |
| `RESERVED_FUNDS` | an ACTIVE reservation (a bill or card payment set aside) sits in the Pocket | RESERVED FUNDS: … MOVE OR RELEASE IT FIRST. | UPCOMING | reserved money would vanish from Safe to Spend's reasoning |
| `DEFAULT_ACCOUNT` | the Pocket is the usual account for a purpose (spending, bills, card payments…) | DEFAULT PAYMENT ACCOUNT: USUAL ACCOUNT FOR …. CHOOSE ANOTHER POCKET FIRST. | the Pocket's settings (purposes) | new entries would default to an archived Pocket |
| `RECURRING_PAYMENT` | an ACTIVE bill or subscription is paid from it | RECURRING PAYMENT: PHONE, STREAMING, INSURANCE ARE PAID FROM THIS POCKET. | UPCOMING | the next bill would have no source |
| `EXPECTED_INCOME` | expected or late income is due into it | EXPECTED INCOME: PAYCHECK IS EXPECTED INTO THIS POCKET. | INCOME | the next income would land nowhere |
| `OPEN_BALANCE` | a liability (card, loan) still shows money owed | OPEN BALANCE: THIS CARD STILL SHOWS MONEY OWED. ARCHIVING WOULD HIDE A DEBT. | the card's page (PAY) | it would hide a debt |

**Not a blocker: money held in an asset Pocket.** Authority 25 draws TOTAL MONEY MAY CHANGE, and the established tests D53 and E2E 25 archive a place that holds money. The confirmation states the amount that leaves the held total. JURNL never moves it automatically, so the person moves it first if they want it kept in the total. Doc 14, decision D3, asks whether held money should block instead.

## Synthetic worlds used

| Pocket (world) | Blockers | Delete |
|---|---|---|
| BANK ACCOUNT (DOT 01 world) | ACTIVE_TRANSFER (3), RECURRING_PAYMENT (PHONE, STREAMING, INSURANCE), EXPECTED_INCOME (PAYCHECK) | refused (T14, screenshot D2) |
| CREDIT CARD (DOT 01 world) | OPEN_BALANCE | refused (T14) |
| NEIGHBOURHOOD CREDIT UNION EVERYDAY CHECKING (many + 2 entries) | none ($77 held) | allowed (T11–T13, T15, T17) |
| BANK ACCOUNT (one-Pocket world) | none | allowed → EMPTY state (T16) |
