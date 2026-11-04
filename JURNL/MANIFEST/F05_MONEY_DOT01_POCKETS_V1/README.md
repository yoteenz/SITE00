# F05 MONEY · DOT 01 · Pocket context management (rename / delete)

Sprint `P0.JURNL.F05-MONEY.DOT01.POCKET-CONTEXT-MANAGEMENT-AND-RENAME-DELETE.UX1`.

- Base `d8438fc8`; draft PR #1707.
- Not merged, not deployed. No database was touched and no image was generated.

**One MANAGE POCKET menu, two ways in:**

- press and hold a Pocket (MONEY parent, ALL ACCOUNTS, a Pocket page's balance); right-click and Shift + F10 do the same;
- the three-dot MANAGE POCKET chip beside BACK on every Pocket page.

**Menu items:**

- **RENAME POCKET** is the canonical rename, by id.
- **DELETE POCKET** is the canonical archive of authorities 25 / 36: confirmation, blockers, and nothing erased.

User-facing PLACE is now POCKET.

- `reports/01–14`: start with `14_FOUNDER_REVIEW.md`, then `12_FUNCTIONAL_AND_FINANCIAL_TESTS.md`.
- `SCREENSHOTS/393x852`, `360x780` (from the E2E runs) and `375x667` (capture probe): the required states. All are real Chromium screenshots with synthetic data, stored as WebP.
- `tests/`: E2E, unit and capture results.
