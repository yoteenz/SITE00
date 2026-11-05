# 09 · After a delete: removal and navigation

## Removal

Every reader lists **active** accounts only, so an archived Pocket disappears from all of them on the same repository tick, with no extra bookkeeping:

| Surface | Reader | Verified |
|---|---|---|
| ALL ACCOUNTS cards and the POCKETS summary count | `listActiveAccounts` / money picture | E2E T15 (6 POCKETS, card gone) |
| MONEY parent papers, VIEW ALL ACCOUNTS count, the carousel | `computeMoneyParentReading` (active, saved order) | E2E T15, unit P09 |
| Saved order | `archiveAccountSafely` removes the id from `accountOrder` | existing |
| Account selects (record, transfer, filters, reassign) | active accounts | E2E T15 (`d01-account` listbox has no option) |
| Held / owed totals | money picture over active accounts | unit P09 |

The history is not removed. The entries stay, and ACTIVITY still lists them (T13).

## Navigation

| Deleted from | Then |
|---|---|
| A Pocket page (chip or balance hold) | the page is left at once. In-app **back** returns to where the person came from (ALL ACCOUNTS or MONEY), falling back to ALL ACCOUNTS when there is no in-app history. Toast: **POCKET DELETED**: IT LEFT YOUR ACTIVE POCKETS. ITS HISTORY STAYS SAVED. |
| ALL ACCOUNTS | stays; the card is gone; same toast |
| MONEY parent | stays; the paper is gone; same toast |
| The last Pocket | MONEY shows its empty paper (NO POCKETS YET / ADD A POCKET), and ALL ACCOUNTS shows the authority 22 empty state (NO ACCOUNTS YET, ADD FIRST ACCOUNT) (T16) |

**The app never navigates to a missing id.**

- A removed Pocket's address (`money/places/<id>`, from a bookmark or browser history) renders **POCKET NOT FOUND**, with a way back, instead of a ghost page. It has no MANAGE POCKET chip and no stale balance.
- Its sub-pages stay readable, because history is kept: ACCOUNT HISTORY is shown read-only with no RECORD, and ACCOUNT DETAILS reads ARCHIVED.

**Browser back / forward (T17).** After the delete, back and forward across the removed address land on valid pages: the previous page, or POCKET NOT FOUND. Nothing crashes or redirects in a loop.

Screenshots: `SCREENSHOTS/393x852/D3-delete-success.webp` (directory with the toast), `D4-empty-accounts-after-delete.webp`.
