# 01 · Existing account management audit

Sprint `P0.JURNL.F05-MONEY.DOT01.POCKET-CONTEXT-MANAGEMENT-AND-RENAME-DELETE.UX1` · base `d8438fc8` (PR #1707, draft).

What JURNL already had for managing an account, before this sprint. It was read first so the new menu reuses it
instead of adding a parallel path.

## Canonical operations (data layer)

| Operation | Where | What it does | Reused here |
|---|---|---|---|
| Rename | `data/ledger/ledgerOps.ts` `renameAccount(accountId, newName)` | trims, uppercases, needs ≥ 2 characters, refuses a name another **active** account already has, writes the account by id (`ACCOUNT_RENAMED` commit). It also backfills `account_id` on old entries that named the account only by text. | **Yes**: RENAME POCKET calls it unchanged |
| Archive | `data/foundation/accountMutations.ts` `archiveAccount(id)` | sets `status: ARCHIVED`, keeps the record and every entry | through the safe wrapper below |
| Safe archive | `data/f05/dot01/archive.ts` `archiveAccountSafely(id)` + `archiveBlockers(id)` | refuses while anything depends on the place (6 blocker kinds, doc 08), checks again at the moment of archiving, removes the id from the saved order | **Yes**: DELETE POCKET calls it unchanged |
| Hard delete | none | JURNL has no operation that erases an account | not added (doc 07) |

## Existing surfaces

| Surface | Route / trigger | Rename | Archive |
|---|---|---|---|
| DOT 01 · ACCOUNT SETTINGS (authority 12) | `money/places/:id/settings` | EDIT ACCOUNT overlay → `renameAccount` | ARCHIVE ACCOUNT (25) / ARCHIVE BLOCKED (36) → `archiveAccountSafely` |
| DOT 01 · ALL ACCOUNTS (06) | `money/places` | no | no |
| DOT 01 · Pocket page (02–05) | `money/places/:id` | no (only via ACCOUNT DETAILS → settings) | no (same) |
| MONEY motion parent | `money?parent=motion` | no | no |
| Cabinet MONEY hub (the default) | `money` / `?parent=cabinet` → place page | EDIT drawer → `renameAccount` | ARCHIVE drawer → **raw `archiveAccount`, no blocker check** |

## Interaction audit

- No long-press, right-click, ContextMenu key or overflow control existed anywhere in JURNL.
- The account cards (06), the parent papers and the Pocket pages were tap-to-open only. Renaming or archiving took three steps (page → ACCOUNT DETAILS → EDIT / ARCHIVE).
- The parent papers sit inside the swipe carousel, which captures the pointer while a swipe moves. So a hold has to survive pointer capture, and a swipe has to cancel it.
- The directory's reorder mode has its own drag handles (a grip with pointer capture). It renders a separate list, so the cards' hold handlers are not present while reordering.

## Findings carried into this sprint

1. **Reuse, don't fork.** The new menu calls the same `renameAccount` and `archiveAccountSafely`, with no new store and no new mutation.
2. **The cabinet hub archive bypasses the blockers.** Pre-existing and outside DOT 01; not changed here (the default hub's behaviour is not this sprint's to change). It is listed as a gate in doc 14: route it through `archiveAccountSafely`.
3. **Renaming did not reach transfer titles.** Transfer legs store a title with the other place's name ("TRANSFER FROM BANK ACCOUNT"). After a rename those rows kept the old name. Fixed at read time (doc 06); no stored entry is rewritten.
4. **The popover's dock floor never engaged.** `.jrn-nav` is `position: fixed`, so its `offsetParent` is always null. A surface opened near the bottom of 06 on a tablet could sit under the dock. Fixed in `JurnlSurfaces.tsx` (doc 11).
