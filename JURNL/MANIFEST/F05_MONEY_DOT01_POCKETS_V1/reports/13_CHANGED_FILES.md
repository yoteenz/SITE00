# 13 · Changed files

Base `d8438fc8`. Branch `claude/jurnl-f05-money-motion-pilot-um0u93` (PR #1707, draft).

## New

| File | Purpose |
|---|---|
| `src/projects/jurnl/runtime/screens/f05/dot01/PocketManager.tsx` | `useLongPress`, `PocketMenu`, `RenamePocketOverlay`, `usePocketManager` (the one manager) |
| `src/projects/jurnl/data/f05/dot01/pocketName.ts` | `checkPocketName`, `POCKET_NAME_MAX` (pre-check before the canonical rename) |
| `tests/jurnlF05Pockets.test.ts` | unit P01–P11 |
| `e2e/jurnl/jurnl-f05-pockets.e2e.ts` | browser T01–T19 |
| `JURNL/MANIFEST/F05_MONEY_DOT01_POCKETS_V1/**` | this evidence |

## Modified: behaviour

| File | Change |
|---|---|
| `runtime/screens/f05/dot01/AccountPage.tsx` | MANAGE POCKET chip, balance hold area, manager node; an archived Pocket renders POCKET NOT FOUND |
| `runtime/screens/f05/dot01/DirectoryPage.tsx` | hold on each card, manager node |
| `runtime/screens/f05/MoneyMotionParent.tsx` | hold on each paper (composed with the press state), manager node, `data-jrn-surface-host` on the stage |
| `runtime/screens/f05/dot01/kit.tsx` | `AccountCard` accepts the hold handlers, `aria-keyshortcuts`, `aria-description` |
| `runtime/screens/f05/dot01/Dot01Frame.tsx` | chip glyph `more`, chip `menu` state (`aria-haspopup` / `aria-expanded`), click event passed to the chip handler |
| `runtime/screens/f05/dot01/sheets/AccountSheets.tsx` | `ArchiveOverlay` `mode="delete"` (DELETE THIS POCKET? / blocked) with `onDone`; archive mode unchanged |
| `runtime/screens/f05/surfaces/JurnlSurfaces.tsx` | popover carries the parchment sheet itself (for the parent stage); dock floor reads the fixed dock's client rects |
| `runtime/screens/f05/surfaces/jurnl-f05-surfaces.css` | menu styles, hold styles |
| `data/f05/dot01/history.ts` | `entryLabel`: transfer leg titles read the other Pocket's current name (display only) |
| `runtime/screens/f05/dot01/DetailPages.tsx` | transaction detail MERCHANT uses that label |

## Modified: copy only (PLACE → POCKET)

`runtime/screens/MoneyScreens.tsx`, `HomeScreens.tsx`, `SafeToSpendScreens.tsx`, `runtime/finance/FinanceSheets.tsx`, `TodayMoneySheet.tsx`, `dot01/NotFoundPage.tsx`, `data/f01/copy.ts`, `data/parents/catalog.ts`, `data/familyRouteTree.ts`, `data/f05/moneyCarousel.ts`, `data/f05/dot01/{archive,accountOrder,reconciliation}.ts`, `data/f06/dailyEarnings.ts`. Regenerated: `docs/jurnl/structural-completion/F05_MONEY_STRUCTURAL_BLUEPRINT.json`, `JURNL_CANONICAL_PRODUCT_GRAPH.json`.

## Modified: tests

- Expected copy: `tests/jurnlF01DesignWorkspace.test.tsx`, `tests/jurnlF03F04Runtime.test.tsx`, `tests/jurnlRootAuthorityReconstruction1.test.tsx`, `e2e/jurnl/jurnl-f05-{carousel,motion-pilot,dot01}.e2e.ts`.
- `jurnl-f05-dot01.e2e.ts`: the Pocket-page chip row is now `['d01-manage', 'd01-back']`.
- `e2e/jurnl/helpers/jurnl-dot01-world.ts`: `purchase` exported.
- `playwright.config.ts`: the 'small' project also runs the Pocket spec.

## Not changed

These files were not changed:

- canonical balances and the money picture;
- Safe to Spend / F07, transfer settlement, credit, reservations, receipts, posting and audit;
- auth and entitlements;
- `ledgerOps`, `accounting`, `accountMutations`, `archive.ts` logic (copy only) and the repository.

There is no new store, migration or dependency.
