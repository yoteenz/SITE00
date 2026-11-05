# 02 · Global interactive-surface inventory

Read-only sweep of committed `4d222f7c` (every route in `JurnlRuntimeRoot.tsx:102-167`, every component, inline
surfaces included). The full table — one row per surface with FAMILY · DOT · SCREEN / ROUTE · TRIGGER · COMPONENT
(file:line) · APPEARANCE · BEHAVIOR · DATA / ENTITLEMENT — is `02_APPENDIX_FULL_INVENTORY.md` beside this file.

## Registry (derived, not assumed)

* Families: **16** (F01 ENTRY … F16 RECORDS) from `data/foundation/familyRegistry.ts:25-42`; dock slots F03 HOME,
  F05 MONEY, F08 PLAN, F12 CREDIT; plus a global layer and the review board.
* DOTs: **1** — F05 DOT 01 (no DOT registry exists in code; DOT 02–04 appear only in comments).

## Counts (rows)

| Family | Surfaces | | Family | Surfaces |
|---|---|---|---|---|
| GLOBAL | 23 (12 mounted, 11 defined-unmounted incl. 9 monetization) | | F09 | 24 |
| F01 | 54 | | F10 | 9 |
| F02 | 18 | | F11 | 7 |
| F03 | 10 | | F12 | 13 |
| F04 | 14 | | F13 | 5 |
| F05 | 65 (24 cabinet / motion + 41 DOT 01) | | F14 | 7 |
| F06 | 11 | | F15 | 5 |
| F07 | 19 | | F16 | 9 |
| F08 | 8 | | board | 2 |
| | | | **total** | **303** |

Call sites: `JurnlDrawer` 77 (43 without an expression), `Dot01Overlay` 20, `JurnlModal` 6, `JurnlSheet` 2,
`JurnlPopover` 3, `SelectionSheet` 2, `JurnlErrorPanel` 18, `JurnlSuccessPanel` 4, DOT 01 `Alert` 29, `showToast` 36.

## Findings that shaped this sprint

* The hamburger opened the F09 account folio (every preference inside the drawer) — no secondary-navigation menu.
* MEMBERSHIP / ADD-ON / UNLOCK: primitives exist, **nothing mounts them**; `upgradeSurfaceAllowedIn` is false everywhere.
* DOT 01 pages open bone drawers (MOVE MONEY) — a visual break inside the V9 world.
* PRIVACY & CONSENTS showed three switches with **no visible words**.
* `JurnlProductionServiceScreen` was the only mixed-case system screen in source.
* `SelectionSheet` has no portal / focus trap / Escape (recorded, report 24).
