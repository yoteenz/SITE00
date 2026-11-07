# 02 · POCKET terminology convergence

Rule applied: **PLACE / PLACES → POCKET / POCKETS in every user-facing string**. Internal names are unchanged:

- tables, record types and `account_*` fields;
- routes (`money/places`, `money/places/:placeId`);
- test ids (`d01-place-*`, `money-edit-place`, `f05m-place-*`);
- persistence contracts.

## What changed (copy only, 53 strings)

| File | Examples |
|---|---|
| `runtime/screens/MoneyScreens.tsx` (cabinet hub) | POCKETS (h1), ADD A POCKET, SEE ALL POCKETS., EDIT POCKET, ARCHIVE POCKET, BACK TO POCKETS, YOUR MONEY IS IN 4 POCKETS. |
| `runtime/screens/f05/MoneyMotionParent.tsx` | NO POCKETS YET, ADD A POCKET, BETWEEN YOUR POCKETS, POCKET ADDED, VIEW ALL ACCOUNTS: 4 POCKETS (aria), HELD … IN YOUR POCKETS |
| `runtime/screens/f05/dot01/DirectoryPage.tsx` | YOUR POCKETS (list name), 4 POCKETS · $… HELD (summary) |
| `runtime/screens/f05/dot01/NotFoundPage.tsx` | POCKET NOT FOUND, THIS POCKET IS NOT IN YOUR RECORDS |
| `runtime/screens/HomeScreens.tsx`, `SafeToSpendScreens.tsx`, `finance/FinanceSheets.tsx`, `finance/TodayMoneySheet.tsx` | OPEN POCKETS, ADD A CASH POCKET IN MONEY, MONEY → POCKETS |
| `data/f05/moneyCarousel.ts`, `data/f05/dot01/{archive,accountOrder,reconciliation}.ts`, `data/f06/dailyEarnings.ts` | ADD A POCKET FIRST, CHOOSE ANOTHER POCKET FIRST, EACH POCKET CAN APPEAR ONLY ONCE, NO BALANCE HAS BEEN ENTERED FOR THIS POCKET |
| `data/f01/copy.ts`, `data/parents/catalog.ts`, `data/familyRouteTree.ts` | KEEP POCKETS AND DEBTS APART, FOUR POCKETS, OPEN A POCKET, route-tree labels POCKETS / POCKET |

The structural blueprint artifacts derive from the catalog and route-tree labels, so they were regenerated (`scripts/jurnl/structural-blueprint/build.ts`):

- `docs/jurnl/structural-completion/F05_MONEY_STRUCTURAL_BLUEPRINT.json`
- `JURNL_CANONICAL_PRODUCT_GRAPH.json`

A sweep of `src/projects/jurnl` for quoted strings containing PLACE / PLACES finds only the internal prop value `'PLACE'` of `NotFoundPage` (it renders as POCKET).

## New copy (this sprint)

MANAGE POCKET · RENAME POCKET · DELETE POCKET · CURRENT NAME · POCKET NAME · SAVE NAME · POCKET RENAMED · DELETE THIS POCKET? · KEEP POCKET · CONFIRM DELETE · POCKET DELETED · THIS POCKET CANNOT BE DELETED YET · ANOTHER POCKET IS ALREADY CALLED ….

## Kept as drawn (founder decision)

The DOT 01 authorities draw **ACCOUNT** on these screens:

- ALL ACCOUNTS and VIEW ALL ACCOUNTS;
- ADD ACCOUNT, EDIT ACCOUNT, ARCHIVE ACCOUNT and REORDER ACCOUNTS;
- ACCOUNT HISTORY and ACCOUNT DETAILS;
- NO ACCOUNTS YET and ADD FIRST ACCOUNT.

ACCOUNT is not PLACE, and these words are baked into the approved authority compositions. So they were left as drawn. Doc 14, decision D2, asks whether they should also read POCKET.

## Tests updated for the copy (expected text only, no behaviour)

- `tests/jurnlF01DesignWorkspace.test.tsx`, `tests/jurnlF03F04Runtime.test.tsx`, `tests/jurnlRootAuthorityReconstruction1.test.tsx`
- `e2e/jurnl/jurnl-f05-carousel.e2e.ts` (ADD A POCKET FIRST), `jurnl-f05-motion-pilot.e2e.ts` (/7 POCKETS/), `jurnl-f05-dot01.e2e.ts` (4 POCKETS)
