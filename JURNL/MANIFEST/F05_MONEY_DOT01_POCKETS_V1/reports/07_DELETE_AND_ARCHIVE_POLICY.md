# 07 · DELETE POCKET and the archive policy

## Policy

**DELETE POCKET is the canonical archive of authorities 25 / 36. Nothing is erased.**

- `archiveAccountSafely(id)`, unchanged: the account is kept with `status: ARCHIVED`. It leaves every active view (doc 09), and its entries, receipts, corrections and audit stay.
- It is **refused while anything depends on the Pocket** (doc 08), with the same `archiveBlockers` the archive uses. The check runs again at the moment of confirming.
- **Money is never moved for you.** Archiving a Pocket that still holds money is allowed, as authority 25 draws it ("TOTAL MONEY MAY CHANGE"). The confirmation states the amount ("$77 LEAVES YOUR HELD TOTAL"). The established invariant D53 and E2E 25 cover this and were not altered.
- **Commitments are never cancelled silently.** Open transfers, bills, expected income, reserved money and default purposes block the delete, and a card that still owes blocks it too.
- **No hard delete.** JURNL has no erase operation, and adding one is out of scope for this sprint. Doc 14, decision D1, asks whether a Pocket with no entries at all may ever be erased permanently.

## Surface

`ArchiveOverlay` with `mode="delete"` (`sheets/AccountSheets.tsx`): the same component as 25 / 36, with Pocket wording. Archive mode, as used by ACCOUNT SETTINGS, is unchanged.

| State | Title | Content | Actions |
|---|---|---|---|
| Allowed | **DELETE THIS POCKET?** *before you continue* | the Pocket and its balance; an alert: DELETING ARCHIVES THIS POCKET: IT LEAVES YOUR ACTIVE POCKETS, AND ITS HISTORY STAYS AVAILABLE IN ACTIVITY. Then NO NEW TRANSACTIONS, HISTORY AND RECEIPTS STAY SAVED, and TOTAL MONEY MAY CHANGE ($X LEAVES YOUR HELD TOTAL). | **KEEP POCKET** (first, and the initial focus) · **CONFIRM DELETE** (terracotta, bin glyph) |
| Blocked | **DELETE POCKET** *action blocked* | alert (`role="alert"`): THIS POCKET CANNOT BE DELETED YET. THESE MUST BE RESOLVED FIRST. Then one row per blocker with what to do. | **KEEP POCKET** · **RESOLVE ISSUES** (closes this surface and goes where the first blocker is resolved; for a card that owes, the card's page with PAY) |

- **Explicit confirmation.** Choosing DELETE POCKET in the menu only opens this surface. Nothing is written until CONFIRM DELETE. KEEP POCKET comes first and holds the initial focus, so an Enter carried over from the menu cannot delete.
- **Branded, not native.** It is a DOT 01 overlay, with no `alert()` or `confirm()`.
- **Dismissal.** KEEP POCKET, Escape and CLOSE all keep the Pocket and return focus to the menu's anchor.

## Proved

| Test | Proves |
|---|---|
| E2E T11 | the delete surface opens with DELETE THIS / POCKET?, HISTORY AND RECEIPTS STAY SAVED, CONFIRM DELETE and KEEP POCKET; KEEP POCKET holds focus; the Pocket is still ACTIVE in storage while it is open |
| E2E T12 | KEEP POCKET, and Escape, leave it ACTIVE and in the directory |
| E2E T13 / T15 | a confirmed delete leaves the Pocket ARCHIVED with every entry and amount identical, and its BOOKSHOP entry still in ACTIVITY |
| E2E T14 | BANK (an unfinished transfer, bills, expected income) and the CREDIT CARD (owes) are refused with their blockers listed, there is no CONFIRM DELETE, and they stay ACTIVE. On the card, RESOLVE ISSUES closes the surface and shows the card's PAY. |
| unit P07–P10 | a pending transfer blocks; an owing card blocks; a delete archives, keeps the entries and leaves the active and parent readings; a deleted Pocket cannot be renamed |
