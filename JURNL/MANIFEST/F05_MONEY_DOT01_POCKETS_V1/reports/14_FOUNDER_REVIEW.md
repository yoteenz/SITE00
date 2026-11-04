# 14 · Founder review

Sprint `P0.JURNL.F05-MONEY.DOT01.POCKET-CONTEXT-MANAGEMENT-AND-RENAME-DELETE.UX1`.

- Nothing deployed.
- Nothing merged.
- No database touched.
- No image generated.
- No paid provider used.

## What you can now do

- **Press and hold any Pocket** to get MANAGE POCKET: on MONEY, in ALL ACCOUNTS, or on its own page's balance. Right-click and Shift + F10 do the same.
- On a Pocket's page, the **three-dot chip** beside BACK opens the same menu.
- **RENAME POCKET** changes the name everywhere at once and nothing else.
- **DELETE POCKET** asks first (DELETE THIS POCKET? · KEEP POCKET / CONFIRM DELETE).
  - It archives: the Pocket leaves every list, and its history stays.
  - It is refused, with the reasons and a way to resolve them, while anything still depends on the Pocket.
- PLACE is now **POCKET** wherever the app speaks.

## Decisions for you

| # | Decision | Built as | Options |
|---|---|---|---|
| D1 | Should a Pocket with **no history at all** be erasable for good? | no: DELETE is always the archive; JURNL has no hard delete | keep archive-only (recommended: reversible, nothing lost) · add a permanent erase for empty Pockets only |
| D2 | The authorities draw **ACCOUNT** (ALL ACCOUNTS, ADD / EDIT / ARCHIVE ACCOUNT, ACCOUNT HISTORY, ACCOUNT DETAILS, NO ACCOUNTS YET…). Should those read POCKET too? | kept as drawn | keep · switch to POCKET (copy only; the screens were composed with these words) |
| D3 | Should **money held** in a Pocket block its deletion? | no, as authority 25 draws (TOTAL MONEY MAY CHANGE); the confirmation states the amount leaving the held total | keep · block until the balance is 0 or moved |
| D4 | Approve the **proposed surfaces** (no authority draws them): the MANAGE POCKET menu, RENAME POCKET, the DELETE wording on 25 / 36 | built from the parchment sheet, the SK03 overlay and 25 / 36 | approve · send an authority for any of them |
| D5 | The three-dot glyph is drawn in the chip line set | line glyph | approve · supply an engraved "more" glyph (Batch 05 / 06), which mounts through the registry |
| D6 | Hold timing: 520 ms, 10 px movement tolerance | as stated | approve · adjust |

## Gates not closed

| Gate | State |
|---|---|
| iOS Safari / a real iPhone | **BLOCKED**: no WebKit or device here. Callout and selection suppression are in place; iOS has no vibration API. Needs a device pass. |
| Cabinet MONEY hub (the default) ARCHIVE | pre-existing: archives with the raw `archiveAccount`, **without** the blockers. Not changed here (outside DOT 01). Recommended next: route it through `archiveAccountSafely`. |
| Live RLS proof | PREREQUISITE_BLOCKED (no QA secrets), as before |
| Authority for the menu, rename and delete wording | D4 |

## Where to look

- `SCREENSHOTS/393x852/`: the six required states, plus the parent hold and the duplicate-name refusal.
- `SCREENSHOTS/375x667/` and `SCREENSHOTS/360x780/`: the same on compact phones.
- `reports/12_FUNCTIONAL_AND_FINANCIAL_TESTS.md`: every result.
