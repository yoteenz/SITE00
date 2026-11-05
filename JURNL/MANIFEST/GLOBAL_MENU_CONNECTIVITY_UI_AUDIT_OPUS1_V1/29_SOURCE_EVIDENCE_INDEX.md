# 29 · Source evidence index

Method: read-only `git show`, `git grep`, `git log -S` / `--all`, `merge-base`, and the GitHub PR list. Four read-only sub-investigations ran
(menu history, current navigation, financial features, visual authorities); their claims were cross-checked against the paths below.

## Trees

| Ref | SHA |
|---|---|
| inspected | `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` `4ddbac6ced7fd43213d22ffd6d26524336ee37aa` |
| main / preview/tunnel | `e413590e1` |
| integration/jurnl-production-workspace | `7752eae2f` |
| claude/jurnl-financial-os-unification-um0u93 | `c56691ecb` |
| claude/jurnl-f05-dot01-artwork-typography-um0u93 | `c34ef288f` (merge-base `550a6f83d`) |
| cursor/jurnl-financial-intelligence-audit-4e5a | `5aeeee0a4` (FIA, PR #1715) |

## Historical commits cited

| SHA | Date | What |
|---|---|---|
| `fa6b882b4` | 10-05 | AskSheet currency selector |
| `d2915e32d` | 10-05 | conversion from canonical USD; rate disclosure (`HomeScreens.tsx:302-308`) |
| `4c1d19378` | 10-05 | Wave 1 settings (GS.SETTINGS); disclosure removed; Ask JURNL added |
| `6f1a002aa` | 10-06 | first hamburger |
| `435abbeb8` | 10-07 | AccountScreens.tsx (page 3-up + drawer) |
| `e35cc99d2` | 10-07 | JurnlCornerChrome |
| `653fb65a5` | 10-07 | hamburger → AccountDrawer |
| `0583f03b6`, `e9a582133` | 10-08 | superseded editorial menu shell |
| `edb37eca4`, `d30f544ab` | 10-08 | F09 drawer shell + blur |
| `48229e9f3` | 10-08 | F09 drawer authority added |
| `3fac5e546` | 11-04 | V3 GlobalMenu (RC-1) |
| `d6992b3fc` | 11-04 | V3 merged to the tunnel |
| `8e0b8d861` | 11-04 | editorial menu head |
| `1ef7535d6` | 11-05 | current menu script line |

## Current code paths (at `4ddbac6ce`)

`src/projects/jurnl/runtime/`:
* `global/GlobalMenu.tsx:84-95,101-225`
* `components/JurnlCornerChrome.tsx:14-85`
* `screens/AccountScreens.tsx:44-107,160-270,304-427`
* `screens/SettingsScreens.tsx:8-34`
* `global/GlobalSheets.tsx:40-45,123-164`
* `screens/SecurityScreens.tsx:217-620`
* `screens/SetupScreens.tsx:238-286`
* `screens/SafeToSpendScreens.tsx:168,175,328-339`
* `screens/f05/dot01/DetailPages.tsx:146`
* `state/store.tsx:77-78,209-213`
* `JurnlRuntimeRoot.tsx:129-135`
* `ProductNav.tsx:18-24`

`src/projects/jurnl/data/`:
* `foundation/connectionProvider.ts`
* `foundation/accounts.ts:14-70`
* `foundation/accountMutations.ts:34-40`
* `foundation/accountSeed.ts:14-41`
* `foundation/consent.ts:3-48`
* `foundation/settings.ts:6-33`
* `foundation/askJurnl.ts:33-50`
* `foundation/categories.ts:30-60`
* `repository/consentSync.ts:7-22`
* `home/currency.ts:3-474`
* `home/money.ts:24-27`
* `f09/safeToSpend.ts:130-425`
* `ledger/accounting.ts:67-366`
* `f02/contract.ts`
* `f02/setupDraft.ts:13,60`

Server: `api/jurnl/ask-context.ts`, `server/routes.ts:114`.

## Authorities and manifests

Authority images:
* `JURNL/F09_SAFE/AUTHORITIES/F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg` (464a758c63f0)
* `JURNL/F09_SAFE/REFERENCE_REPLICA1/REPLICA_MANIFEST.json` (APPROVED 01–09)
* `JURNL/F05_MONEY_DOT01/INPUT_V9/AUTHORITIES/01–37` (hashes in 21)
* `JURNL/F05_MONEY_DOT01/INPUT_V9/SIDEKICKS/SK01–SK03`
* `JURNL/F02_SETUP/{CHILDREN,GRANDCHILDREN,INTERACTIONS}`; `public/jurnl/f02-setup/authorities/F02.ST.CONNECTED.jpg`
* `JURNL/MANIFEST/JURNL_EDITORIAL_OVERLAYS_OPUS2_V1/input/FOUNDER_EIGHT_PANEL_BOARD.webp` (252343d723df)
* `JURNL/MANIFEST/JURNL_GLOBAL_INTERACTIVE_V3_V1/` (README "Nothing … founder-approved")
* `JURNL/OVERLAYS_EDITORIAL_REDESIGN1/HAMBURGER_MENU/README.md` (SUPERSEDED 2026-10-08)

Contracts and plans:
* `JURNL/MANIFEST/JURNL_EXCHANGE_RATE_CONTRACT.json`
* `JURNL/MANIFEST/JURNL_CURRENCY_CATALOG.json`
* `docs/jurnl/structural-completion/JURNL_GLOBAL_SYSTEMS_MAP.json` (GS.SETTINGS)
* `JURNL/MANIFEST/FINANCIAL_INTELLIGENCE_FOUNDATION_AUDIT_V1/01–28` (at `5aeeee0a4`)

Notes: `motherboard/MEMORY.md` (~15100, ~15352, ~16782, ~16820 at `4ddbac6ce`).

## Tests touching these surfaces

* `tests/jurnlGlobalInteractiveV3.test.tsx:44`
* `e2e/jurnl/jurnl-global-interactive-v3.e2e.ts:38`
* `tests/jurnlOverlayReplica1.test.tsx`
* `tests/jurnlFinancialStabilization.test.ts:381`
* `tests/jurnlWave1Global.test.ts:17-18`
* `e2e/jurnl/jurnl-global-systems.e2e.ts:33-37`

## Not verified

* The live tunnel SHA.
* The V3 master PNG (GitHub release only, not in the repo).
* Ancestry before the shallow graft roots `f8a8e9e39` / `ed49d4958`.
