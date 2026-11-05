# 03a · Historical menu versions (companion to 03_HISTORICAL_MENU_INVENTORY.csv)

These were recovered with `git log -S`, `git show <sha>:<path>` and `git log --all` (VERIFIED_HISTORICAL_CODE).

| # | SHA | Date (UTC) | Trigger → what it opens | Component / file | Labels |
|---|---|---|---|---|---|
| pre | `fa6b882b4`, `d2915e32d` | 10-05 | not a menu | `AskSheet`, `screens/HomeScreens.tsx` | DISPLAY CURRENCY selector; at `d2915e32d` "JURNL CONVERTS DISPLAYED AMOUNTS USING THE LATEST AVAILABLE EXCHANGE RATE. ORIGINAL VALUES STAY PRESERVED." with a rate line |
| V0 | `4c1d19378` | 10-05 | gear "ACCOUNT" (`today-account`, `activity-account`) → `go('account')` | `AccountSettingsScreen` (GS.SETTINGS), `screens/SettingsScreens.tsx` | PROFILE · DISPLAY CURRENCY [CHANGE] · CONNECTION · ASK JURNL CONTEXT · SAFE TO SPEND BUFFER [SAVE BUFFER] · SETUP CONSENTS · SIGN OUT. **Removed the Ask-sheet currency selector and its rate disclosure.** |
| V1 | `6f1a002aa` | 10-06 | **first hamburger** `f09-menu` (F09 header) → `go('account')` | `SafeToSpendScreens.tsx` | same as V0 |
| V2 | `435abbeb8` | 10-07 15:40 | phone `f09-menu` → `AccountDrawer`; wide → page; `account-menu` → drawer | `AccountScreens.tsx` created; route `account` → `AccountScreen` (3 pages) | page P1: PROFILE, DISPLAY CURRENCY, CONNECTION, ASK JURNL CONTEXT, SAFE TO SPEND BUFFER · P2: NOTIFICATIONS, PRIVACY & CONSENTS, SECURITY, WEEK START & DATE FORMAT · P3: DATA EXPORT, HELP & SUPPORT, LEGAL, SIGN OUT · **drawer**: ACCOUNT · PROFILE · DISPLAY CURRENCY/CHANGE · CONNECTION/SET UP · ASK JURNL CONTEXT · SAFE TO SPEND BUFFER/SAVE BUFFER · PRIVACY & CONSENTS · SIGN OUT |
| V3 | `e35cc99d2` | 10-07 21:45 | global `JurnlCornerChrome`: screen menu if registered (`useCornerMenu`), else `go('account')` | `components/JurnlCornerChrome.tsx` | same as V2 |
| **V4** | **`653fb65a5`** | 10-07 22:25 | **switch 1**: hamburger → `AccountDrawerHost` → `AccountDrawer` on every app screen ("Open the account drawer from the hamburger instead of the account page") | `JurnlCornerChrome.tsx` | V2 drawer labels |
| V5a | `0583f03b6`, `e9a582133` | 10-08 | same | drawer on `global/overlays/ACCOUNT_MENU_SHELL.webp` (editorial redesign, later **SUPERSEDED 2026-10-08**: `JURNL/OVERLAYS_EDITORIAL_REDESIGN1/HAMBURGER_MENU/README.md`) | same |
| V5b | `edb37eca4`, `d30f544ab` | 10-08 | same | drawer on `F09_ACCOUNT_DRAWER_SHELL.webp`, layout `OVR_DRAWER` (`layout/overlayReferenceLayout.ts`); authority `JURNL/F09_SAFE/AUTHORITIES/F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg` (`48229e9f3`) | same. **Unchanged on `c56691ecb`, `7752eae2f` and `main` `e413590e1`.** |
| **V6** | **`3fac5e546`** | 11-04 18:54 | **switch 2**: `f09-menu` → `GlobalMenu`; `AccountDrawer` behind PREFERENCES (merged to the tunnel by `d6992b3fc`) | `global/GlobalMenu.tsx` | YOUR ACCOUNT: ACCOUNT & PROFILE / PREFERENCES / PRIVACY & DATA · MEMBERSHIP & ACCESS: MY MEMBERSHIP / EXPLORE ADD-ONS · SUPPORT: HELP & SUPPORT · SIGN OUT |
| V6b | `8e0b8d861` | 11-04 22:22 | same | editorial head (bust, lemon, MENU paper) | script "tools, membership and more" |
| V6c | `1ef7535d6` | 11-05 08:47 | same (**current at `4ddbac6ce`**) | same | script "tools, membership, preferences & more" |
| side | `c34ef288f` | 11-05 | same | board-08 imagery (`EdLift`); not on the tunnel tip | script "tools, membership and more" |

**HISTORICAL_MENU_VERSIONS: 10** (V0–V6c). The "pre" AskSheet selector and the side branch are listed for lineage but not counted.

Founder-referenced authorities:
* The F09 drawer reference (`F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg`), and motherboard rule ~line 15100 at `4ddbac6ce`: "Hamburger opens the account
  drawer; ACCOUNT opens the page … Do not send the hamburger to `go('account')`".
* The V3 menu package README (`JURNL/MANIFEST/JURNL_GLOBAL_INTERACTIVE_V3_V1/`) says "Nothing in this package is founder-approved".
* Board 08 is at founder review (`JURNL_EDITORIAL_OVERLAYS_OPUS2_V1/reports/13_GLOBAL_MENU_REBUILD.md`, approval PENDING).
