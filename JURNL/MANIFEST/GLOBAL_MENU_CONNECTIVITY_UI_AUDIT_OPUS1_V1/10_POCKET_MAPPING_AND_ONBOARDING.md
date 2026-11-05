# 10 · Pocket mapping and account identity

Evidence classes:
* **VERIFIED_CURRENT_CODE**: the current model.
* **DESIGN_REQUIREMENT**: the mapping UX.

Source contracts: FI audit 04 (connected account), 07 (canonical transaction), 17 (transfer and card reconciliation), 24 (migration).

## Current pocket model (inspected `4ddbac6ce`)

| Concern | Today | Evidence |
|---|---|---|
| Account record | `JurnlAccountRecord`: `account_id`, `display_name`, `account_type`, `balance`, `is_manual`, `is_connected` (always false), `balance_entered_by_user…` | `src/projects/jurnl/data/foundation/accounts.ts:26` |
| Creation | `createManualAccount` (ADD A POCKET, board 02; DOT 01 14 ADD ACCOUNT) | `data/foundation/accountMutations.ts:40` |
| Balance basis | `balanceBasis()` → ENTERED_BY_YOU / NOT_VERIFIED / SAMPLE; **BANK_CONFIRMED never produced** | `data/ledger/accounting.ts:106` |
| Kinds | CHECKING, SAVINGS, DEBIT_CARD (payout flag RIDESHARE PAY), CREDIT_CARD (liability + limit), CASH, LOAN, OTHER | `MoneyOverlays.tsx` TYPE_GLYPH; `MoneyScreens.tsx` AddPlaceSheet |
| Rename / delete / archive | MANAGE POCKET (rename, delete); DOT 01 25 archive with blockers (36) | `screens/f05/dot01/PocketManager.tsx`, `sheets/AccountSheets.tsx` |
| Institution object | **absent**: no institution id, no provider account id, no item | FI audit 03 |

## Required identity (FI audit 05 ingestion port; DESIGN_REQUIREMENT)

`pocket(account_id)` 1 ← 0..1 `provider_account(provider_id, provider_item_id, provider_account_id)` N → 1 `institution item`.

* JURNL ids are never the provider ids.
* One provider account maps to exactly one pocket.
* A pocket can stay manual.

## UX states (each a variant of CX-07 MAP TO POCKETS unless noted)

| State | When | UI | Default | Never |
|---|---|---|---|---|
| NEW CONNECTED POCKET | no plausible existing pocket | proposed name (provider nickname, user-editable), kind, purpose, payout-card flag | create | invent a balance |
| CONNECT EXISTING POCKET | user picks an existing manual pocket | pocket picker (DOT 01 32 rows) | — | merge silently |
| POSSIBLE DUPLICATE ACCOUNT | type + mask/name resembles a manual pocket | side-by-side (DOT 01 29 composition) | ask | auto-link |
| SELECT ACCOUNT TO IMPORT | several discovered accounts | CX-06 include marks | none selected until the user chooses (or all eligible, founder decision FD-07) | import unselected accounts |
| KEEP EXISTING MANUAL HISTORY | linking to a pocket with manual entries | explanation + "manual entries stay; imported rows are matched, not overwritten" | keep | delete manual rows |
| LINK SOURCE TO EXISTING POCKET | confirmed link | pocket shows BALANCE SOURCE: BANK (as of …) beside the entered anchor (FI audit 18 OD-03) | — | recompute provider balance from imports |
| REMOVE CONNECTION BUT KEEP HISTORY | disconnect (CX-14 default) | pocket returns to MANUAL_ONLY, imported rows stay labelled IMPORTED | keep | delete without consent |
| DISCONNECT AND REMOVE ELIGIBLE DATA | disconnect, second option | list of what is removed (imported rows, provider ids) vs kept (manual entries, receipts on device) | — | claim provider deletion before confirmation |

Further rules:
* **Renaming** a pocket never renames the provider account.
* **Excluding** a pocket hides it from totals and keeps its history (CS-33).
* **Archiving** a connected pocket first offers disconnect. DOT 01 36 blockers apply: an active transfer, a balance remaining, or recurring.
* **Multiple connections** to the same institution show as one institution with several items. Duplicate items (the same login twice) are a
  POSSIBLE DUPLICATE warning at CX-03 return.

## Onboarding placement

* **F02 SETUP step F02.02 "WHERE IT LIVES"** (authority `JURNL/F02_SETUP/CHILDREN/F02.02_ACCOUNTS.jpg`) is the first-run entry. CONNECT AN
  ACCOUNT should start CX-02, not the simulated `patchSetup({accounts:'CONNECTED'})`.
* **NAME AN ACCOUNT (F02.02.1)** stays as the manual alternative.
* The F02 family's own visual language (plaster and linen) differs from F05 DOT 01. Founder decision FD-05: whether setup
  connection screens use F02 or F05 / SK03 compositions.
