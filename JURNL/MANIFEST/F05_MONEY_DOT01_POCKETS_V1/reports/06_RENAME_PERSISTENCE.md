# 06 · RENAME POCKET: validation and persistence

## Surface

`RenamePocketOverlay` is a DOT 01 overlay on SK03 FIELD, titled RENAME POCKET with the subtitle *the name only changes*. One parchment sheet holds:

- CURRENT NAME (read-only row);
- POCKET NAME (prefilled, full-width stacked field, 16 px or more so iOS does not zoom, `maxlength` 80), with the hint BALANCES AND HISTORY STAY AS THEY ARE;
- the error, when there is one (`role="alert"`);
- CANCEL and SAVE NAME.

Escape and CANCEL close it and return focus to where the menu was opened.

## Validation (`data/f05/dot01/pocketName.ts` `checkPocketName`, then the canonical `renameAccount`)

| Rule | Behaviour | Why this strict and no stricter |
|---|---|---|
| Control characters (U+0000–U+001F, U+007F) | refused: REMOVE THE UNSUPPORTED CHARACTERS. | invisible characters break display and search; nothing else is filtered (accents, digits, &, ' and emoji are kept) |
| Whitespace | trimmed, inner runs collapsed to one space (`  travel   fund  ` → `TRAVEL FUND`) | normalises without refusing |
| Empty / 1 character | refused: ENTER A NAME OF AT LEAST 2 CHARACTERS. | the canonical rename's existing 2-character minimum |
| Over 80 characters | refused, and the field's `maxlength` stops typing at 80 | matches the add / edit fields (`TextInput` default 80) |
| Same name (any case or spacing) | treated as **unchanged**: the surface closes and nothing is written (idempotent) | |
| Duplicate of another **active** Pocket | refused by the canonical rename: ANOTHER POCKET IS ALREADY CALLED CASH ON HAND. | existing rule; archived names may be reused, as before |
| Archived / missing Pocket | refused by the canonical rename (POCKET NOT FOUND) | the menu never offers it (P10) |

Uppercasing is the canonical rename's own rule; JURNL displays names in capitals everywhere.

## Persistence

- `renameAccount(id, name)` writes the **same account record by id** (`ACCOUNT_RENAMED` commit, `updated_at` refreshed). No new account; the balance, type, purposes, order, entries, amounts, settlement and credit attributes are untouched.
- The commit goes through the repository as every edit does: device store now, cloud sync when signed in. There is no parallel Pocket store.
- Readers resolve the account by id, so the new name shows on: the Pocket page title, the ALL ACCOUNTS card, the MONEY parent paper and its aria label, the history rows (ACCOUNT column, search), the transaction detail (ACCOUNT USED), the selects, the archive and delete surfaces.

## Transfer titles (fixed this sprint, display only)

A transfer or card-payment leg is stored with a title naming the other Pocket as it was then, e.g. "TRANSFER FROM BANK ACCOUNT" (`ledgerOps.buildTransfer`). After a rename these rows still said BANK ACCOUNT. Rewriting the stored entries would be a ledger change, so it was not done. Instead `history.ts` `entryLabel(entry, accounts)` reads the title with the other Pocket's **current** name, by `counterparty_account_id`:

- it applies only to a linked leg whose title is exactly the generated `TRANSFER|PAYMENT TO|FROM <name>` in the leg's own direction;
- a title changed by hand reads as recorded;
- no amount or effect changes, and search uses the new name.

## Proved

| Test | Proves |
|---|---|
| unit P01 / T07 | the stored snapshot has the new name under the same id, once |
| unit P02 / T08 | the Pocket view, the MONEY parent reading and the history rows read the new name |
| unit P03 / T09 | the money picture (tracked assets, available), the held amount and every entry's id / amount / account are identical before and after |
| unit P04–P06 / T10 | empty, short, too long, control characters and whitespace rules; a duplicate refused with nothing changed; same-name idempotent |
| unit P11 / T08 | the IN leg of a transfer reads TRANSFER FROM EVERYDAY POCKET, its stored title is unchanged, and searching "everyday" finds it |
| E2E T07 / T08 / T09 | a rename from the chip shows POCKET RENAMED and the new title. It survives a reload, appears on the card, the parent paper and the activity list (no row still says BANK ACCOUNT), and the balance and every entry are unchanged. |
| E2E T10 | blank, duplicate and control-character names are refused in the browser, the stored name is unchanged, and CANCEL returns focus to the card |
