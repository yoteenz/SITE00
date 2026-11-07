# 25 · LIVE INSTITUTION VALIDATION MATRIX

Every row is **NOT TESTED**: no live testing has been approved and no production credentials exist. The founder operates each test personally, through the app's own **CONNECT A BANK**, which opens Plaid's hosted Link. **Never share a bank password in chat or logs.**

**A row passes only when** (sprint section 35):
- Link completes;
- the accounts are returned;
- the balances arrive;
- real transactions arrive;
- a later sync brings new or changed activity.

A catalog listing alone is not a pass.

| Target | Catalog check | Link | Accounts | Balances | Transactions | Pending → posted | Ongoing sync | Reconnect | Status |
|---|---|---|---|---|---|---|---|---|---|
| Founder checking | — | — | — | — | — | — | — | — | NOT TESTED |
| Founder rideshare payout card | — | — | — | — | — | — | — | — | NOT TESTED |
| Founder credit card | — | — | — | — | — | — | — | — | NOT TESTED |
| Additional supported account | — | — | — | — | — | — | — | — | NOT TESTED |
| Uber Pro Card | NOT RUN (needs keys) | — | — | — | — | — | — | — | NOT TESTED |
| Lyft Direct | NOT RUN (needs keys) | — | — | — | — | — | — | — | NOT TESTED |

## How each payout card is checked

`GET /api/jurnl/bank?op=catalog&target=UBER_PRO_CARD|LYFT_DIRECT`, or the PAYOUT CARDS rows in the panel.
- **Queries:** Uber Pro Card / Branch, and Lyft Direct / Payfare.
- **Names:** only names returned by the provider are kept. No institution id is hard-coded.
- **Results:**
  - LISTED_WITH_TRANSACTIONS → *UNVERIFIED*: "LISTED BY THE PROVIDER. NOT CONFIRMED UNTIL YOU CONNECT IT AND YOUR TRANSACTIONS ARRIVE."
  - Anything else → *UNAVAILABLE / MANUAL*: "NOT AVAILABLE TO CONNECT. RECORD THIS CARD BY HAND."
- **Sandbox vs production:** the sandbox catalog is a test catalog. Real listings must be checked with **production** keys.
- **Institutions:** that a card is run through a program manager (Branch, Payfare) or a bank (Stride Bank, Evolve Bank & Trust) is not treated as proof. Only a completed connection with transactions counts.
- **No second aggregator** was added. A second provider can be added through the `BankingProvider` interface after founder approval.

## Account mapping once connected

| Provider type / subtype | JURNL account type | Counted in Safe to Spend by default |
|---|---|---|
| depository / checking | CHECKING | yes |
| depository / savings, money market, CD | SAVINGS | no |
| depository / prepaid, cash management | DEBIT_CARD (a payout card when the name matches UBER, LYFT, BRANCH or PAYFARE; this is a preference flag only) | yes |
| credit | CREDIT_CARD | no (it is a liability) |
| loan | LOAN | no |

The founder's preferred uses (bank for bills, rideshare card for card payments and transfers, credit cards for food, cash for tips) are preferences, not restrictions.
