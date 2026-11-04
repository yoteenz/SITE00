# JURNL runtime: interactive-surface inventory (read-only)

**What this covers.** The inventory is of committed HEAD `4d222f7c0`. While I was auditing, someone started changing the working tree (around 17:55–17:58 UTC). The new files are not in HEAD:
- untracked `R/surfaces/v3/V3Surfaces.tsx` and `R/surfaces/v3/jurnl-v3.css`
- untracked `R/global/GlobalMenu.tsx`
- `R/components/JurnlCornerChrome.tsx` modified: the menu now opens `GlobalMenu` instead of `AccountDrawer`
- `R/screens/AccountScreens.tsx` modified: `ConsentsSheet` is now exported (one line, so line numbers did not move)

The rows below describe HEAD. None of the WIP is mounted by any route except through the modified corner chrome.

**Path prefixes.**
- `R/` = `src/projects/jurnl/runtime/`
- `D/` = `src/projects/jurnl/data/`

**File shorthand in tables.**
- prim = `R/components/primitives.tsx`
- FS = `R/finance/FinanceSheets.tsx`
- CS = `R/finance/CreditSheets.tsx`
- SHS = `R/finance/SafeHorizonSheet.tsx`
- TMS = `R/finance/TodayMoneySheet.tsx`
- GS = `R/global/GlobalSheets.tsx`
- AcS = `R/screens/AccountScreens.tsx`
- JS = `R/screens/f05/surfaces/JurnlSurfaces.tsx`
- d01/… = `R/screens/f05/dot01/…`
- Any other bare `X.tsx` = `R/screens/X.tsx`

## Legend

### APPEARANCE codes

| Code | What it is | Where it is styled |
|---|---|---|
| **BD** | Generic bone drawer: `.jrn-overlay` + `.jrn-overlay__scrim` (dark 40% + blur) + `.jrn-drawer` (bone + noise, rounded top, grab bar, close icon). `/short` = 52% max height, `/long` = 86%, `/wine` = wine tone. | `R/jurnl-runtime.css:844-934`, wine `:880` |
| BD variants | `/form` = ivory `#f3ecdf` + pores + champagne top rule · `/analysis` = flat near-white, 92% max height · `/detail` = paper + wine hairline · `/filter` = ivory flat · `/confirm` = translucent bone · no suffix = default bone | `R/jurnl-expression.css:95-142` |
| **BM** | Centered 330 px bone modal (`.jrn-overlay--center > .jrn-modal`) | `jurnl-runtime.css:970-994` |
| **BS** | Full-screen bone sheet with a back bar (`.jrn-sheet`) | `jurnl-runtime.css:935-969` |
| **TS** | Founder torn-paper shell (`.jrn-ovl`, `.jrn-qa` / `.jrn-dr`), scaled by `--k`, light 10% blur scrim | `R/jurnl-overlays.css` |
| **DP** | DOT01 full-screen parchment overlay (`.jrn-d01-overlay`): `#241a13` base, SK03 env, torn 9-sliced `.d01-paper`, olive / quiet / danger `.d01-btn`, wine `.d01-alert`, lowercase cursive subtitle | `d01/jurnl-f05-dot01.css:685-699`, `:304-321`, `:466-500`, `:583-607` |
| **DPg** | The same kit inline on a DOT01 page (SK02_FIELD) | same file |
| **PP** | Parchment popover `.jrn-pop` (menu `:222`, calendar `:114`) | `R/screens/f05/surfaces/jurnl-f05-surfaces.css:56-70` |
| **RS** | Reference cream sheet `#f8f4ef` with photo tiles over a 50% dark scrim (`.jrn-ref__sheet` / `__scrim`) | `R/jurnl-reference.css:266-296` |
| **RP** | Reference-replica page controls (`.jrn-ref__*`) | — |
| **RA** | Root-authority hub hits (`.jrn-ra__hit` / `cta` / `line`) | — |
| **E2** | ENTRY v2 authority controls (`.jrn-e2__*`) | `R/jurnl-entry-v2.css` |
| **EN** | `.jrn-e2__note` serif inline note, no card | `jurnl-entry-v2.css:320-343` |
| **EP / SP** | `.jrn-error` blush/wine panel / `.jrn-success` panel | `jurnl-runtime.css:694-764` / `:765` |
| **TO** | Toast `.jrn-toast`, emerald or wine `--error` | `jurnl-runtime.css:776-800` |
| **PN** | `JurnlPanel` `.jrn-panel--{role}.jrn-home__panel` | prim:130-145 |
| **FF** | Family-frame archetype panels | `R/jurnl-archetypes.css`, `jurnl-frame.css` |
| **F02** | Setup frame `.jrn-setup` / `.jrn-choice` | `R/jurnl-setup.css` |
| **F01c** | Legacy F01 card screens | `R/jurnl-screens.css` |
| **MP** | F05 motion collage `.jrn-f05m__*` | `R/screens/f05/jurnl-f05-motion.css`, `jurnl-f05-carousel.css` |

### BEHAVIOR codes

| Code | Meaning | Source |
|---|---|---|
| **T** | `useOverlayFocus`: focus first focusable, Tab cycle, Escape closes, focus restored on close | prim:454-483 |
| **T01** | `Dot01Overlay` trap: first content control, Tab cycle, Escape, opener refocused | `d01/Dot01Frame.tsx:328-381` |
| **P** | `OverlayLayer` portal into `.jrn-overlay-host` | prim:72-76 |
| **Pp** | `JurnlPopover` portal into the closest `.jrn-d01` / `[data-jrn-surface-host]`, else `document.body`; outside-pointer dismiss, no trap | JS:25-27, 30-87 |
| **S** | Scrim click closes | — |
| **K** | Keyboard visual-viewport lift | — |
| **A** | `role=alert` / `role=status` | — |
| **O** | Opened through the store's single overlay id (`store.tsx:163`, `:405-407`; cleared by `go()` at `:223`; deep-linkable by `?overlay=` in design preview, `:294-298`) | `R/state/store.tsx` |
| **L** | Local `useState` | — |
| **I** | Inline in the screen tree (no portal) | — |

---

## 1. Registry: how families, DOTs and routes are declared

**Canonical family registry: `D/foundation/familyRegistry.ts:25-42`.** Each of F01–F16 has an id, name, route, parent_component, status and nav slot.
- Nav slots: F03 = HOME, F05 = MONEY, F08 = PLAN, F12 = CREDIT; every other family = null.
- Discovery hub links: `:45-62`.

**Other declarations:**
- **Project record:** `D/jurnlProject.ts:89-106`, which lists entry routes.
- **Design route tree (parents F05–F16 plus their children):** `D/familyRouteTree.ts:43-76`.
- **Per-family screen trees:**
  - F01: `D/f01/screens.ts:38-53` (F01.00–.13), `:60-64` (ENTRY v2, F01.14–.16), state overlays `:136-140`
  - F02: `D/f02/screens.ts:27-45`
  - F03 / F04: `D/f03/screens.ts`, `D/f04/screens.ts`
- **F05–F16 parent specs:** `D/parents/catalog.ts:27-305`.
- **F05–F16 parent-only contracts:** `D/f05f16/parentContracts.ts`.
- **Routes as actually mounted:** `R/JurnlRuntimeRoot.tsx:102-167`. Component maps are at `:63-85`, plus `SetupScreens.tsx:686-698` for F02.
- **Dock:** `R/components/ProductNav.tsx:111-117` (HOME→F03, MONEY→F05, ADD, PLAN→F08, CREDIT→F12).
- **Route resolution:** `R/state/store.tsx:126-131`. Screen-id reporting: `:268-292`.

**DOTs.** Only **F05 DOT 01** exists.
- Locations: art in `families/F05_MONEY/DOT01`, runtime in `R/screens/f05/dot01/*`, data in `D/f05/dot01/*`.
- There is no DOT registry or manifest in code.
- **Gating:**
  - `money/places` and `money/places/:placeId` show DOT01 only when the parent variant is `motion`. That variant comes from `?parent=motion`, remembered in sessionStorage key `jurnl.f05.parent` (`R/screens/f05/MoneyParentRoute.tsx:14-28`, `d01/Dot01Routes.tsx:11-21`).
  - The DOT01 detail routes are always on.
- DOT 02–04 appear only in comments (`R/screens/f05/microAssets.ts:2`, JS:2, `D/f05/dot01/corrections.ts:12`).
- The DOT01 screen ids F05.ENTRY, F05.SETTINGS, F05.REVIEW, F05.ATTENTION and F05.HISTORY, and also F07.SUBSCRIPTIONS, are **not** in `familyRouteTree`.

| Family | Name | Nav slot | Mounted routes → screen id (component) |
|---|---|---|---|
| F01 | ENTRY | — | `entry` F01.00 · `entry/value` .14 · `entry/benefits` .15 · `entry/begin` .16 · `entry/create` .01 · `entry/verify-email` .02 · `entry/sign-in` .03 · `entry/unlock` .04 · `entry/forgot-password` .05 · `entry/reset-sent` .06 · `entry/new-password` .07 · `entry/reset-success` .08 · `entry/biometric` .09 · `entry/device-trust` .10 · `entry/privacy` .11 · `entry/security` .12 · `entry/complete` .13 · index and `*` → EntryIndex |
| F02 | SETUP | — | `setup` .00 · `setup/household` .01 · `setup/accounts` .02 · `setup/accounts/name` .02.1 · `setup/income` .03 · `setup/commitments` .04 · `setup/priorities` .05 · `setup/priorities/goal` .05.1 · `setup/protected` .06 · `setup/boundaries` .07 · `setup/ready` .08 |
| F03 | TODAY | HOME | `today` F03.00 |
| F04 | ACTIVITY | (dock "ACTIVITY") | `activity` F04.00 |
| F05 | MONEY | MONEY | `money` F05.00 (cabinet, or motion when `?parent=motion`) · `money/places` F05.ACCOUNTS (cabinet or DOT01 06) · `money/places/:placeId` F05.ACCOUNT (cabinet or DOT01 02–05) · `…/:placeId/history` F05.HISTORY (07–10) · `…/settings` F05.SETTINGS (12) · `…/review` F05.REVIEW (13) · `…/attention` F05.ATTENTION (35) · `money/entries/:entryId` F05.ENTRY (11) · `money/transactions` F05.HISTORY all (31) |
| F06 | INCOME | — | `income` .00 · `income/:sourceId` F06.SOURCE |
| F07 | UPCOMING | — | `upcoming` .00 · `upcoming/subscriptions` F07.SUBSCRIPTIONS · `upcoming/:itemId` F07.ITEM |
| F08 | PLAN | PLAN | `plan` .00 · `plan/:intentionId` F08.ITEM |
| F09 | SAFE TO SPEND | — | `safe` .00 · `safe/why` · `safe/check` · `safe/reference` · `account` (F09.ACCOUNT, rendered as GS.SETTINGS) · `purchases/result/good-to-go`, `/quick-check-in`, `/doesnt-fit` (F09.RESULT.*) |
| F10 | PURCHASES | — | `purchases` .00 · `purchases/checked` F10.CHECKED · `purchases/:purchaseId` F10.OBJECT |
| F11 | TRIPS | — | `trips` · `trips/:tripId` |
| F12 | CREDIT | CREDIT | `credit` · `credit/:accountId` |
| F13 | PAYDOWN | — | `paydown` · `paydown/what-if` |
| F14 | GOALS | — | `goals` · `goals/:goalId` |
| F15 | AHEAD | — | `ahead` · `ahead/:branchId` (the hub links to `ahead/base`) |
| F16 | RECORDS | — | `records` · `records/:documentId` |
| — | review board | — | `parents` F05_F16.BOARD. `ParentAuthorityScreen` has **no route**: the filter at `JurnlRuntimeRoot.tsx:161-163` excludes every PARENTS id. |

---

## 2. Surfaces, one table per family

Every F03–F16 screen also mounts the global dock, the corner chrome, Quick Add and Ask; those are listed once in GLOBAL. Per-family "QA/Ask" rows are the per-screen mount points.

### GLOBAL / cross-family

| # | FAM | DOT | SCREEN · ROUTE | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA / ENTITLEMENT |
|---|---|---|---|---|---|---|---|---|
| G01 | all app | — | all F03–F16, `account`, `parents` | always | `JurnlProductNav` `ProductNav.tsx:119-149` | `.jrn-nav` in three variants: default `jurnl-frame.css:32`; `marks=parent` fixed `jurnl-nav.css:4`; `marks=authority` `jurnl-f09-authority.css:490`. F05 motion / DOT01 re-seat it via root CSS vars (`f05/MoneyMotionParent.tsx:241-266`, `d01/Dot01Frame.tsx:282-307`). | Portal to nav host (`:148`); `aria-current` | ADD → overlay `quick-add` |
| G02 | all app | — | not on `entry*` / `setup*`; root hubs have no back chip | always | `JurnlCornerChrome` `R/components/JurnlCornerChrome.tsx:181-206` (HEAD) | `.jrn-corner` fixed, z30, `jurnl-f09-authority.css:272-282`; hidden on DOT01 (`jurnl-f05-dot01.css:703`); re-seated as a chip on F05 motion (`jurnl-f05-motion.css:461-515`) | I. Back always `go('today')`, never history | — |
| G03 | GS | — | any app route | corner MENU (`JurnlCornerChrome.tsx:166-168`) | `AccountDrawer` AcS:293-422 | TS, right-hand torn panel `.jrn-dr` (`jurnl-overlays.css:230-398`) | T P S K | session; currency; consent ASK_JURNL_CONTEXT; `settings.safeToSpendBuffer`; buffer-saved TO |
| G04 | GS | — | `account` page and drawer | CHANGE currency | `CurrencySheet` `SettingsScreens.tsx:8-34` | BD/filter/long; `.jrn-currency__row` buttons | T P S | CURRENCIES, `setCurrency`, `patchSettings` |
| G05 | GS | — | `account` page and drawer | PRIVACY & CONSENTS | `ConsentsSheet` AcS:72-81 | BD/form/long; three `JurnlToggle` with **no visible labels** (aria-label only) | T P S | setup draft consents |
| G06 | all app | — | every app screen | dock ADD; DOT01 add chip (`Dot01Frame.tsx:388`) | `QuickAddV2Sheet` GS:104-345 | TS bottom sheet `.jrn-qa` (`jurnl-overlays.css:55-228`); radio-like `.jrn-qa__opt`; inline error `:335-339` | T P S K O; saves without a toast | `quickAddTypesForFamily` (`D/foundation/quickAddRegistry.ts:69`); ledger, income, goal, purchase, trip creates; `quoteQuickAdd` |
| G07 | all app | — | every app screen | info icon; TODAY MORE; WHY LEARN MORE | `AskJurnlSheet` GS:33-50 | BD/confirm/long | T P S O | `D/foundation/askJurnl.ts`; `safeToSpend` |
| G08 | all | — | root | `showToast` (36 call sites) | `JurnlSuccessBanner` prim:436-449, rendered at `JurnlRuntimeRoot.tsx:96-100,185` | TO, z80 | I; A (polite); auto-dismiss 4.2 s (`store.tsx:213-219`); single slot | sync errors "SAVE FAILED" / "SESSION ENDED" (`store.tsx:300-323`, `:350-361`) |
| G09 | F05–F16 | — | child shells and frame hubs | always | `FamilyChrome` `R/components/FamilyChrome.tsx:6-23` | `.jrn-home__top` mark + info iconbtn | I | → overlay `ask` |
| G10 | F06,07,10,11,13,14,15,16 + shells | — | frame screens | overflow content | `JurnlPanelStack` NEXT / marks / "CONTINUED" `R/components/FamilyFrame.tsx:164-232` | `.jrn-frame__edge`, `.jrn-frame__next` | I; aria-live; offscreen panels inert; region focus (`:245-249`) | — |
| G11 | — | — | production with no config | fail closed | `JurnlProductionServiceScreen.tsx:5-20` (in `R/components/`) | plain `.jrn-entry`; mixed-case copy | I | `productionConfig` |
| G12 | all | — | design preview only | `?overlay=`, `?state=` | `store.tsx:138-163`, `:294-298`; `D/f01/screens.ts:136-140` | — | opens any overlay id | — |
| G13 | — | — | **not mounted** | — | `JurnlUpgradePanel` `R/monetization/JurnlMonetizationPrimitives.tsx:65-78` | `.jrn-mon` bordered field card (`jurnl-monetization.css`) | I | `upgradeSurfaceAllowedIn` is false for every family (`D/monetization/familyMonetization.ts:22-27`) |
| G14 | — | — | not mounted | — | `JurnlFeaturePreview` `:81-88` | `.jrn-mon--preview` | I | — |
| G15 | — | — | not mounted | — | `JurnlEntitlementNotice` `:91-99` | `.jrn-mon--notice` | A | entitlement failure copy |
| G16 | — | — | not mounted | — | `JurnlEntitlementGate` `:102-126` (feature lock / paywall) | `.jrn-mon-gate` | — | `clientGate(useJurnlEntitlements())` |
| G17 | — | — | not mounted | — | `JurnlUsageLimitNotice` `:129-138` | `.jrn-mon--usage` | A | `useUsageLimit` |
| G18 | — | — | not mounted | — | `JurnlPlanBadge` `:141-150` (membership) | `.jrn-mon-badge` emerald outline | I | `planById` |
| G19 | — | — | not mounted | — | `JurnlAddOnOffer` `:153-166` (add-on) | `.jrn-mon--addon` | I | `addOnById` |
| G20 | — | — | not mounted | — | `JurnlBillingStatus` `:169-177` (subscription) | `.jrn-mon-badge` | I | `subscriptionState` |
| G21 | — | — | not mounted | — | `JurnlTrialNotice` `:180-188` | `.jrn-mon--trial` | A | `trialActive` |
| G22 | — | — | unused | — | `ReferenceDock` `R/components/ReferenceStage.tsx:225-252` | `.jrn-ref__dock` | — | — |
| G23 | — | — | unused | — | `JurnlCheckbox` prim:293-302; also the unused `JurnlInput` prefix/suffix props (prim:239-248) | `.jrn-check` | — | — |

Notes on monetization:
- The entitlements provider is mounted with no consumers (`JurnlRuntimeRoot.tsx:180`, `R/monetization/JurnlEntitlements.tsx:16-31`).
- The primitives are used only in `tests/jurnlMonetizationFoundation.test.tsx`.

### F01 ENTRY

Files: `EntryScreens.tsx`, `RecoveryScreens.tsx`, `SecurityScreens.tsx`, `R/components/EntryV2Parts.tsx`.

| # | DOT | SCREEN · ROUTE | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F01-01 | — | F01.00 WELCOME `entry` | onboarding | `WelcomeScreen` EntryScreens:141-174 | E2 olive / cream buttons on plate | I | — |
| F01-02 | — | F01.14 VALUE `entry/value` | onboarding | `:177-205` | E2 | I | — |
| F01-03 | — | F01.15 BENEFITS `entry/benefits` | onboarding | `:208-242` | E2 slips | I | — |
| F01-04 | — | F01.16 BEGIN `entry/begin` | onboarding | `:245-266` | E2 | I | — |
| F01-05 | — | F01.01 CREATE `entry/create` | form | `E2Field` ×4 with password reveal, `E2Check` agree: `:379-420`; `EntryV2Parts.tsx:91-216` | E2 underline fields | I | `auth.signUp` |
| F01-06 | — | F01.01 | password focus or typing | requirements `:410-419` | `.jrn-e2__reqs` | I | `passwordRuleState` |
| F01-07 | — | F01.01 | validate / EMAIL_IN_USE | notes and errors `:368-378`, `:431-435`; `EntryV2Parts.tsx:175-179`, `:232-276` | EN | A | — |
| F01-08 | — | F01.01 | TERMS / PRIVACY links (`:423-429`) | `LegalDrawer` `:457-494` with `JurnlInlineExpansion` sections | BD/default/long | T P S O | legal copy is placeholder (`pendingText`) |
| F01-09 | — | F01.01 / .03 | APPLE / GOOGLE | `SocialAuthBoundary` `:65-100`: native handoff (prim:647-700), then unavailable modal | BM (wine alert icon) | T P; scrim disabled while waiting; O | `auth.social` |
| F01-10 | — | F01.01 | submit | E2Button loading `:442` | E2 | — | — |
| F01-11 | — | F01.* | network errors | `useNetworkToast` `:56-62` | TO error | A | — |
| F01-12 | — | F01.02 VERIFY `entry/verify-email` | link expired / valid | notes `:569-577` | EN (success tone) | A | `?link=` |
| F01-13 | — | F01.02 | OPEN EMAIL APP | `MailHandoff` `:106-124`, `JurnlExternalHandoff` prim:640-644 | BM | T P S O | `bridge.openExternal` |
| F01-14 | — | F01.02 | USE A DIFFERENT EMAIL | `ChangeEmailDrawer` `:598-635` | BD/short + `JurnlInput` | T P S O | `auth.changeEmail` |
| F01-15 | — | F01.02 | resend | toast `:533-540`, forced `:510-515` | TO | A | — |
| F01-16 | — | F01.03 SIGN IN `entry/sign-in` | form | `E2Field` ×2, `E2Check` keep `:741-760` | E2 | I | `auth.signIn` |
| F01-17 | — | F01.03 | auth errors | notes `:685-690`, `:740` | EN with action | A | — |
| F01-18 | — | F01.03 | LOCKED / `?state=locked` | locked drawer `:700-719` | BD/short/wine | T P S O | — |
| F01-19 | — | F01.03 | CONTACT SUPPORT | `MailHandoff` SUPPORT `:720` | BM | T P S | — |
| F01-20 | — | F01.04 UNLOCK `entry/unlock` | forced state | session-expired / reauth panels `:815-823` | EP | A | — |
| F01-21 | — | F01.04 | Face ID fail | error with TRY AGAIN `:831-838` | EP (destructive) | A | — |
| F01-22 | — | F01.04 | UNLOCK | native handoff `:850-864` | BM glyph + pulse | T P O | `bridge.requestBiometric` |
| F01-23 | — | F01.04 | USE PASSWORD | `UsePasswordSheet` `:915-956` | BS + password `JurnlInput` | T P O | `auth.signIn` |
| F01-24 | — | F01.04 | SWITCH ACCOUNT | drawer `:866-893` | BD/long | T P S O | `device.remembered` |
| F01-25 | — | F01.04 | SIGN OUT | confirmation `JurnlModal` `:894-910` | BM | T P S O | `signOut` |
| F01-26 | — | F01.05 FORGOT `entry/forgot-password` | form | `JurnlInput` + error, RecoveryScreens:59-60 | `.jrn-field`, EP | A | `auth.requestPasswordReset` |
| F01-27 | — | F01.06 RESET SENT | expired | error `:95-102` | EP | A | — |
| F01-28 | — | F01.06 | OPEN MAIL / RESEND | `:113`, toast `:82` | BM, TO | T P | — |
| F01-29 | — | F01.07 NEW PW `entry/new-password` | invalid link | block error `:178-185` | EP block | A | `validateResetToken` |
| F01-30 | — | F01.07 | form | password ×2, errors, requirements `:194-209` | `.jrn-field`, `.jrn-reqs` | A | `auth.resetPassword` |
| F01-31 | — | F01.07 | forced network | toast `:139-144` | TO error | A | — |
| F01-32 | — | F01.08 RESET SUCCESS | `?banner=1` | toast `:225-230` | TO | A | — |
| F01-33 | — | F01.09 BIOMETRIC `entry/biometric` | result | success / unavailable / failed panels, SecurityScreens:74-97 | SP / EP | A | `device.biometric` |
| F01-34 | — | F01.09 | ENABLE FACE ID | native handoff `:107-121` | BM | T P O | bridge |
| F01-35 | — | F01.09 | DENIED | drawer `:122-140` | BD/short | T P S O | — |
| F01-36 | — | F01.09 | enabled | toast `:50` | TO | A | — |
| F01-37 | — | F01.10 TRUST `entry/device-trust` | LEARN | drawer `:194-202` | BD/long | T P S O | — |
| F01-38 | — | F01.10 | forced state | trusted / verify-required panels + mail `:169-179`, `:203` | SP / EP, BM | A | — |
| F01-39 | — | F01.10 | TRUST | toast `:150` | TO | A | — |
| F01-40 | — | F01.11 PRIVACY `entry/privacy` | DETAILS | drawer `:243-254` | BD/long | T P S O | — |
| F01-41 | — | F01.11 | row YOUR DATA | `PrivacyDrawer` `:268-282` | BD/long | T P S O | session |
| F01-42 | — | F01.11 | CONNECTED ACCOUNTS | `:284-294` | BD/long | T P S O | — |
| F01-43 | — | F01.11 | AI ACCESS | 5 `JurnlToggle` + SAVE toast `:296-329` | BD/long | T P S O | `device.ai`, `syncDeviceAiToRepository` |
| F01-44 | — | F01.11 | DATA EXPORT | `:331-368` + success panel | BD/long, SP | T P S O | `exportRequested` (no real export) |
| F01-45 | — | F01.11 | REMOVE ACCESS | `:370-401` + warning panel + toast | BD/long, EP | T P S O | — |
| F01-46 | — | F01.11 | DELETE ACCOUNT | `DeleteAccountModal` `:406-435` | BM wine, destructive | T P S O | `auth.deleteAccount` |
| F01-47 | — | F01.12 SECURITY `entry/security` | DETAILS | full sheet `:472-481` | BS | T P O | — |
| F01-48 | — | F01.12 | BIOMETRIC row | drawer with toggle + `JurnlChoice` ×2 + toast `:505-541` | BD/long | T P S O | `device.biometricMethod` |
| F01-49 | — | F01.12 | DEVICE | drawer with badge button + toast `:543-566` | BD/long | T P S O | `deviceTrust` |
| F01-50 | — | F01.12 | CONNECTED | `:568-577` | BD/long | T P S O | — |
| F01-51 | — | F01.12 | DATA | `:579-592` | BD/long | T P S O | — |
| F01-52 | — | F01.12 | SESSIONS | `:594-615` | BD/long | T P S O | `auth.listSessions` |
| F01-53 | — | F01.12 | REVOKE | `RevokeSessionModal` `:620-657` (confirm, then revoked) | BM wine / emerald | T P S O | `auth.revokeSession` |
| F01-54 | — | F01.13 COMPLETE `entry/complete` | onboarding | checklist `:660-690` | F01c | I | session / device |

### F02 SETUP

File: `SetupScreens.tsx`.

| # | DOT | SCREEN · ROUTE | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F02-01 | — | all F02 | always | `Frame` back iconbtn + SETUP + progress segments `:93-159`, `:37-45` | F02 on ENV plates | I | `setupDraft` |
| F02-02 | — | F02.00 `setup` | onboarding / resume | CONTINUE / START OVER `:169-202` | F02 | I | `resetSetup` |
| F02-03 | — | F02.01 household | select | `JurnlChoice` radiogroup `:220-229` | `.jrn-choice` | I | `patchSetup` |
| F02-04 | — | F02.02 accounts | select | choices `:263-270` | `.jrn-choice` | I | — |
| F02-05 | — | F02.02 | CONNECT AN ACCOUNT | permission drawer `:271-299` (plate swaps to ENV.QUIET) | BD/default/long | T P S O | preview flag only |
| F02-06 | — | F02.02 | connected | success panel `:258-262` | SP | I | — |
| F02-07 | — | F02.02 | permission continue | toast `:286` | TO | A | — |
| F02-08 | — | F02.02 / .04 / .06 | SKIP FOR NOW | `SkipSheet` `:654-684` | BD/short, footer only | T P S O | — |
| F02-09 | — | F02.02.1 `setup/accounts/name` | form | input + error + kind choices `:325-332` | `.jrn-field`, `.jrn-choice` | A | — |
| F02-10 | — | F02.03 income | form / validation | error panel + cadence + amount `:357-365` | EP, `.jrn-field` | A | `isSetupAmount` |
| F02-11 | — | F02.04 commitments | empty | "NONE YET" `:393-402` | F02 list | I | — |
| F02-12 | — | F02.04 | ADD ANOTHER / `?state=validation` | `AddSheet` `:420-458` | BD/default/long | T P S O | — |
| F02-13 | — | F02.05 priorities | select | `JurnlChoice` multi, max 3 `:481-487` | `.jrn-choice` | I | — |
| F02-14 | — | F02.05.1 goal | form | error + input + horizon `:510-518` | EP, `.jrn-field` | A | — |
| F02-15 | — | F02.06 protected | form | error + input `:549-558` | EP, `.jrn-field` | A | — |
| F02-16 | — | F02.07 boundaries | toggles | `Consent` ×3 `:587-591`, `:603-614` | `.jrn-toggle` | I | consents |
| F02-17 | — | F02.07 | READ THE BOUNDARY | disclosure `:592-598` | `.jrn-row` | `aria-expanded` | — |
| F02-18 | — | F02.08 ready | select | summary + voice choice `:638-649` | `.jrn-choice` | I | — |

### F03 TODAY (`today`, `RootAuthorityStage`)

File: `HomeScreens.tsx`.

| # | DOT | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|
| F03-01 | — | SEE WHY (`HomeScreens:138-142`) | `TodayMoneySheet` TMS:27-114 + `HorizonBody` SHS:70-113, with period Chips | BD/analysis/long | T P S O | `computeTodayOperating` (`D/f03/todayOperating.ts`), `computeNextIncomeView` |
| F03-02 | — | MORE footer (`:252-254`) | `TodayMoreSheet` `:268-285` | BD/detail/long | T P S O | routes |
| F03-03 | — | data | attention slip + STALE REFRESH `:145-157` | paper slip PNG on plate | I | `operating.attention` |
| F03-04 | — | `?state=error` | ERROR + RETRY `:163-171` | RA text | I | — |
| F03-05 | — | no accounts | EMPTY + RETURN TO ACCOUNTS `:172-180` | RA | I | — |
| F03-06 | — | state | LOADING / PARTIAL / no-bills `:162`, `:204-222` | RA | I | — |
| F03-07 | — | MORE / LESS | COMING inline expansion `:185-214` | RA | `data-expanded` | `upcomingFor` |
| F03-08 | — | dock ADD | Quick Add F03 `:111` | TS | G06 | — |
| F03-09 | — | — | Ask F03 `:112` | BD | G07 | — |
| F03-10 | — | links | discovery footer `:242-257` | RA | I | `JURNL_FAMILY_DISCOVERY` |

### F04 ACTIVITY (`activity`)

File: `HomeScreens.tsx`.

| # | DOT | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|
| F04-01 | — | type | SEARCH `JurnlInput` (search icon, 160 ms debounce) + LOOKING FOR + CLEAR `:302-309`, `:337`, `:345-352` | `.jrn-field`, `.jrn-act__query` | I | `applyActivityFilter` |
| F04-02 | — | FILTER (`:338`) | `FilterSheet` `:429-482` (4 fieldsets of toggle chips) | BD/filter/long | T P S O | ledger filter |
| F04-03 | — | filter active | summary + CLEAR FILTERS `:353-360` | `.jrn-act__filters` | I | — |
| F04-04 | — | SPENDING / `?record=spending` (`:313-317`) | `SpendingSheet` FS:511-559 | BD/form/long | T P S O | `recordExpense`, `suggestAccount`, TO |
| F04-05 | — | row tap | `DetailSheet` view `:499-685` | BD/detail | T P S O | ledger, `transferViews` |
| F04-06 | — | EDIT | edit form `:587-627` with ad-hoc account chips | BD/form | T P | `updateLedgerEntry` |
| F04-07 | — | DELETE | confirmation `:553-585` | BD/confirm + inline error | T P | `removeLinkedEvent` |
| F04-08 | — | TRANSFER STATUS | → `TransferDetailSheet` `:549-551`, FS:375-451 | BD/detail | T P | `recordTransferStep` |
| F04-09 | — | `?state=empty` | empty `:368-373` | `.jrn-ledger__empty` | I | — |
| F04-10 | — | no match | no-matches state + clear buttons `:374-389` | `.jrn-ledger__empty` | I | — |
| F04-11 | — | state | loading / error with RETRY `:361-364` | EP block | A | — |
| F04-12 | — | chrome | back / ACCOUNT (gear) / ASK `:325-330` | iconbtns | I | — |
| F04-13 | — | dock ADD | Quick Add F04 `:422` | TS | G06 | — |
| F04-14 | — | info | Ask F04 `:424` | BD | G07 | — |

### F05 MONEY

| # | DOT | SCREEN · ROUTE | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F05-01 | — | F05.00 cabinet `money` | ADD A POCKET slot (`MoneyScreens:184`) | `AddPlaceSheet` MoneyScreens:421-445 (opened at `:124`) | BD/default/long | T P S L | `createManualAccount` |
| F05-02 | — | cabinet | no pockets | empty copy `:137-149` | RA | I | — |
| F05-03 | — | cabinet | — | Quick Add / Ask `:122-123` | TS / BD | G06 / G07 | — |
| F05-04 | — | F05.00 motion `money?parent=motion` | "+" chip (`MoneyMotionParent:602-604`) | actions sheet `:612-619` | BD/short over collage | T P S L | — |
| F05-05 | — | motion | ADD paper / sheet | `AddPlaceSheet` + POCKET ADDED toast `:620-631` | BD + TO | T P | `createManualAccount` |
| F05-06 | — | motion | MOVE MONEY paper (`:367-374`) | `TransferSheet` `:632`, FS:307-372 | BD/form | T P | `recordTransfer` |
| F05-07 | — | motion | COMMITTED / AVAILABLE metrics, OUTLOOK panel (`:304-309`, `:298`) | `SafeHorizonSheet` `:633` | BD/analysis | T P | `computeNextIncomeView` |
| F05-08 | — | motion | transfer tokens / TRANSFERS panels (`:461-476`) | `TransferDetailSheet` `:634` | BD/detail | T P | `transferViews` |
| F05-09 | — | motion | long-press / right-click / Shift+F10 on a pocket paper (`:145-146`, `:394-403`) | `PocketMenu` `d01/PocketManager.tsx:120-171` (long press `:40-117`) | PP menu | Pp into `.jrn-f05m[data-jrn-surface-host]`; `role=menu`; Escape (window); no trap | — |
| F05-10 | — | motion | RENAME POCKET | `RenamePocketOverlay` `PocketManager:174-216` + toast `:241-251` | DP | T01 P | `renameAccount`, `checkPocketName` |
| F05-11 | — | motion | DELETE POCKET | `ArchiveOverlay` delete mode `d01/sheets/AccountSheets.tsx:234-342` + toast | DP + `.d01-alert` / danger | T01 P | `archiveBlockers`, `archiveAccountSafely` |
| F05-12 | — | motion | swipe / prev / next / dots | carousel `MoneyMotionParent:540-596`; `R/screens/f05/useMoneyCarousel.ts` | MP | aria-live announce | `computeMoneyCarousel` |
| F05-13 | — | motion | empty / mock data | NO POCKETS paper + basis note `:350-357`, `:536` | MP | I | — |
| F05-14 | — | motion | search chip (`:599-601`) | → `activity` | MP chip | I | — |
| F05-15 | — | motion | — | Quick Add / Ask `:609-610` | TS / BD | G06 / G07 | — |
| F05-16 | — | F05.ACCOUNTS cabinet `money/places` | ADD A PLACE | `AddPlaceSheet` MoneyScreens:275, `:281-283` | BD | T P L | — |
| F05-17 | — | F05.ACCOUNTS cabinet | MOVE MONEY / `?move=&to=` | `TransferSheet` `:235`, `:278`, `:284` | BD/form | T P | — |
| F05-18 | — | F05.ACCOUNTS cabinet | USUAL ACCOUNTS | `PurposeSheet` FS:477-507 (list, then edit at `:482-489`) | BD/detail → form | T P | `setPurposeAccount` |
| F05-19 | — | F05.ACCOUNTS cabinet | NOT FINISHED rows | `OpenTransfersPanel` FS:454-473 → detail `:286` | PN detail → BD | T P | — |
| F05-20 | — | F05.ACCOUNTS cabinet | none / unassigned | empty + unassigned notice `:254-258`, `:274` | PN empty / detail | I | — |
| F05-21 | — | F05.ACCOUNT cabinet `money/places/:id` | EDIT | `EditPlaceSheet` `:447-473` | BD/default | T P | `renameAccount`, `setAccountBalance` |
| F05-22 | — | F05.ACCOUNT cabinet | MOVE MONEY | `TransferSheet` `:373` | BD/form | T P | — |
| F05-23 | — | F05.ACCOUNT cabinet | ARCHIVE | archive / delete drawer with blockers `:374-408` | BD/default (no expression) | T P | `archiveBlockers` |
| F05-24 | — | F05.ACCOUNT cabinet | bad id | not-found panel `:307-316` | PN empty | I | — |
| F05-25 | DOT01-06 | F05.ACCOUNTS `money/places` | — | ALL ACCOUNTS grid + NEEDS REVIEW badge, `d01/DirectoryPage.tsx:49-60` | DPg | I | `reviewIssues` |
| F05-26 | DOT01-14/30 | F05.ACCOUNTS | ADD ACCOUNT / add chip / empty-state kinds | `AddAccountOverlay` `AccountSheets:33-115` | DP (radio cards, `TextInput`, `ChipChoice`, Alert) | T01 P | `createManualAccount` |
| F05-27 | DOT01-22 | F05.ACCOUNTS | no accounts | `EmptyAccounts` `DirectoryPage:98-130` | DPg | I | — |
| F05-28 | DOT01-32 | F05.ACCOUNTS | REORDER | `ReorderList` `:132-212` (grip drag + up/down) | DPg | aria-live; inline mode | `setAccountOrder` |
| F05-29 | DOT01 | F05.ACCOUNTS | hold a card | `PocketMenu` + Rename / Delete `:24-25`, `:56`, `:92` | PP / DP | Pp into `.jrn-d01` | — |
| F05-30 | DOT01 | F05.ACCOUNTS | — | dock on nav paper + Quick Add / Ask, `Dot01Frame:312-314` | MP nav | G01 / G06 / G07 | — |
| F05-31 | DOT01-02..05 | F05.ACCOUNT `money/places/:id` | action strips | `d01/AccountPage.tsx:56-78`, `:153-165` | DPg strips | I | `accountView` |
| F05-32 | DOT01 | F05.ACCOUNT | MANAGE POCKET chip / hold balance | `PocketMenu` `:137`, `:178` | PP | Pp; `aria-haspopup=menu` | — |
| F05-33 | DOT01 | F05.ACCOUNT | MOVE MONEY | `TransferSheet` `:59`, `:183` | **BD (bone) over the parchment page** | T P | — |
| F05-34 | DOT01-15 | F05.ACCOUNT / SETTINGS | MANAGE CARD / RENAME | `EditAccountOverlay` `AccountSheets:117-179` (native checkbox with `role=switch`, `:161`) | DP | T01 P | `include_in_net_worth`, purposes |
| F05-35 | DOT01-17 | F05.ACCOUNT (cash) | ADD CASH | `AddCashOverlay` `d01/sheets/EntrySheets.tsx:252-329` (form, review, done) | DP | T01 P | `previewTransfer`, `correctAccountBalance` |
| F05-36 | DOT01-20 | F05.ACCOUNT (credit) | MAKE A PAYMENT | `CardPaymentOverlay` `EntrySheets:337-406` (form, review, done) | DP | T01 P | `saveTransfer` |
| F05-37 | DOT01-16/18/19 | F05.ACCOUNT / HISTORY | RECORD … | `PurchaseFlow` form `EntrySheets:51-250`, form at `:209-249`; TYPE select switches flow (`:230`; `Dot01Sheets.tsx:56-71`) | DP strips | T01 P | `previewPurchase` |
| F05-38 | DOT01-28 | PurchaseFlow | receipt read | REVIEW PURCHASE: uncertain fields flagged, suggested total `:226`, `:233-236` | DP | T01 | `ReceiptRead` |
| F05-39 | DOT01-29 | PurchaseFlow | duplicates found | POSSIBLE DUPLICATE `:145-170` | DP + wine alert | T01, A | duplicates |
| F05-40 | DOT01-33 | PurchaseFlow | RECORD | TRANSACTION REVIEW with impact `:172-207` | DP | T01 | `savePurchase` |
| F05-41 | DOT01 | PurchaseFlow | saved | PURCHASE RECORDED `:126-143` | DP + wax seal | T01, A | `saveReceiptImage` |
| F05-42 | DOT01-26 | PurchaseFlow / HISTORY | SCAN RECEIPT | CAPTURE `d01/sheets/ReceiptFlow.tsx:200-252` (live camera `:58-83`, file inputs `:136-141`) | DP on SK03 baked frame | T01 P | `getUserMedia`, `checkReceiptFile` |
| F05-43 | DOT01-27 | ReceiptFlow | photo chosen | SCANNING progress `:152-172` | DP | aria-live | `receiptOcr.ts` |
| F05-44 | DOT01-34 | ReceiptFlow | read failed | CAPTURE FAILURE `:174-198` | DP + wine alert | T01, A | — |
| F05-45 | DOT01-07..10/31 | F05.HISTORY `…/history`, `money/transactions` | type | search input `type=search`, `d01/HistoryPage.tsx:102-110` | DPg `.d01-field` | I | `searchHistory` |
| F05-46 | DOT01-31 | F05.HISTORY | FILTER | filter chips: FROM/TO `JurnlDateField`, ACCOUNT/TYPE/CATEGORY/STATUS/**SORT** `JurnlSelect`, CLEAR `:106-128`, `:214-235` | PP listbox / calendar | Pp; URL params (replace) | — |
| F05-47 | DOT01 | F05.HISTORY | none / no match / >200 | notes `:131-134`, `:171` | DPg | aria-live count `:130` | — |
| F05-48 | DOT01 | F05.HISTORY (place) | RECORD / SCAN RECEIPT | `:173-182` | DPg | → F05-37 / F05-42 | — |
| F05-49 | DOT01-31 | `money/transactions` | chips | search focus / Quick Add + dock `:194-203` | DPg | G06 | — |
| F05-50 | DOT01-11 | F05.ENTRY `money/entries/:id` | strips | EDIT / REASSIGN / VIEW RECEIPT (`window.open`) / CORRECT, `d01/DetailPages.tsx:92-98` | DPg | I | `getReceiptImage` |
| F05-51 | DOT01 | F05.ENTRY | linked entry | owner alert + chip `:99-109` | `.d01-alert` | A | `correctionCheck` |
| F05-52 | DOT01-24 | F05.ENTRY | CORRECT | options radiogroup `d01/sheets/CorrectionSheets.tsx:258-278` | DP | T01 | — |
| F05-53 | DOT01-24 | F05.ENTRY | EDIT / CATEGORY / ACCOUNT | correction form `:232-256` | DP | T01 | `previewCorrection` |
| F05-54 | DOT01-37 | F05.ENTRY | CONTINUE | CONFIRM CORRECTION + VIEW ORIGINAL `:166-230` | DP | T01 | `applyCorrection`, `reverseEntry` |
| F05-55 | DOT01 | F05.ENTRY | done | CORRECTION SAVED `:153-164` | DP + seal | T01, A | — |
| F05-56 | DOT01 | F05.ENTRY | refused | refused alert + owner `:70-80` | DP + alert | A | — |
| F05-57 | DOT01-12 | F05.SETTINGS `…/settings` | — | settings rows + strips `DetailPages:140-161` | DPg | I | `reconciliationOf` |
| F05-58 | DOT01-21 | F05.SETTINGS | EDIT PURPOSES | `PurposesOverlay` `AccountSheets:181-227` | DP | T01 P | `setPurposeAccount` |
| F05-59 | DOT01-25/36 | F05.SETTINGS | ARCHIVE | `ArchiveOverlay` archive mode (confirm / blocked / done) `:234-342` | DP + danger / alert | T01 P | `archiveAccountSafely` |
| F05-60 | DOT01-13 | F05.REVIEW `…/review` | — | actual-balance input, difference band, status pill, alerts, MARK RECONCILED `DetailPages:196-237` | DPg (`FigurePair` input) | A | `markReconciled` |
| F05-61 | DOT01-23 | F05.REVIEW | ADD ADJUSTMENT | `AdjustmentOverlay` `CorrectionSheets:283-326` | DP | T01 P | `adjustToActual` |
| F05-62 | DOT01-35 | F05.ATTENTION `…/attention` | — | issue list + MARK RESOLVED + ALL CLEAR `DetailPages:255-315` | DPg | I | `reviewIssues`, `markIssueResolved` |
| F05-63 | DOT01 | any DOT01 page | archived / bad id | `NotFoundPage` `d01/NotFoundPage.tsx:5-26` | DPg | I | — |
| F05-64 | DOT01 | DOT01 overlays and filters | select | `JurnlSelect` JS:109-224 | PP listbox | Pp; WAI-ARIA combobox; Escape / Tab | — |
| F05-65 | DOT01 | DOT01 overlays and filters | date | `JurnlDateField` JS:261-400 | PP calendar | Pp; dialog `aria-modal=false`; grid keys | — |

### F06 INCOME

Files: `IncomeScreens.tsx`, FS.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F06-01 | — | F06.00 `income` | ADD DAILY EARNINGS (`IncomeScreens:145`), `?add=earnings` (`:53`) | `DailyEarningsSheet` FS:116-205 | BD/form/long | T P S L | `saveDailyEarnings` |
| F06-02 | — | F06.00 | day row (`:115`) | `EarningsDetailSheet` FS:207-261 | BD/detail | T P | — |
| F06-03 | — | F06.00 | REMOVE | confirmation + toast FS:213-232 | BD/confirm/short, TO | T P | `deleteDailyEarnings` |
| F06-04 | — | F06.00 | after save | `AfterEarningsSheet` FS:264-287 | BD/confirm | T P | routes |
| F06-05 | — | F06.00 | ADD EXPECTED, `?add=expected` | `AddIncomeSheet` `:197-222` (ad-hoc cadence chips, date error) | BD/default/long | T P, A | `createIncomeSource` |
| F06-06 | — | F06.00 | none | state copy `:88-95` | FF ledger | I | — |
| F06-07 | — | F06.00 | — | Quick Add / Ask `:70-71` | TS / BD | G06 / G07 | — |
| F06-08 | — | F06.SOURCE `income/:id` | EDIT | `EditIncomeSheet` `:224-235` | BD/default | T P | `upsertIncomeSource` |
| F06-09 | — | F06.SOURCE | MARK RECEIVED / ARCHIVE | `:184-190` (ARCHIVE has **no confirmation**) | `.jrn-btn` | I | `receiveIncome`, `deleteIncomeSource` |
| F06-10 | — | F06.SOURCE | bad id | not found `:160-166` | PN empty | I | — |
| F06-11 | — | F06.SOURCE | — | Quick Add / Ask (`IncomeShell` `:22-40`) | TS / BD | G06 / G07 | — |

### F07 UPCOMING

Files: `UpcomingScreens.tsx`, FS, CS.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F07-01 | — | F07.00 `upcoming` | ADD A BILL OR SUBSCRIPTION (`:125`) | `ObligationFormSheet` FS:565-627 | BD/form | T P L | `createBillOrSubscription` |
| F07-02 | — | F07.00 | none | state line `:96-101` | FF timeline | I | — |
| F07-03 | — | F07.00 | — | Quick Add / Ask `:87-88` | TS / BD | G06 / G07 | — |
| F07-04 | — | F07.ITEM `upcoming/:id` | SET MONEY ASIDE | `SetAsideSheet` FS:636-697 (inline REDUCE / RELEASE) | BD/form | T P | reservations |
| F07-05 | — | F07.ITEM | MARK PAID | `PayObligationSheet` FS:699-744 | BD/form | T P | `markObligationPaid` |
| F07-06 | — | F07.ITEM | MARK PAID (linked card) | `CardPaymentSheet` CS:136-182 | BD/form | T P | `recordTransfer` |
| F07-07 | — | F07.ITEM | EDIT | `ObligationFormSheet` (existing) `:233` | BD/form | T P | `editBillOrSubscription` |
| F07-08 | — | F07.ITEM | MORE | `ObligationMoreSheet` action menu FS:746-825 (menu at `:809-824`) | BD/detail | T P | — |
| F07-09 | — | F07.ITEM | CHANGE THIS DATE | short form FS:756-762 | BD/form/short | T P | `rescheduleObligationOccurrence` |
| F07-10 | — | F07.ITEM | STOP TRACKING | confirmation FS:764-768 | BD/confirm/short | T P | `setObligationStatus` |
| F07-11 | — | F07.ITEM | PAYMENT HISTORY | history drawer + UNDO FS:770-807 | BD/detail | T P | `undoObligationPayment` |
| F07-12 | — | F07.ITEM | possible duplicate | warning panel + LINK `:221-227` | PN detail | I | `computeSafeToSpend().possibleDuplicates` |
| F07-13 | — | F07.ITEM | linked / cancelled | notice panels `:213-220` | PN | I | — |
| F07-14 | — | F07.ITEM | bad id / income or card item | `:146-179` | PN | I | `projectUpcoming` |
| F07-15 | — | F07.SUBSCRIPTIONS `upcoming/subscriptions` | SHOW | view-filter Chips `:265` | `.jrn-home__choices` | I | `subscriptionsIn` |
| F07-16 | — | F07.SUBSCRIPTIONS | — | next renewal + empty "NONE HERE" `:266-267` | PN | I | `subscriptionTotals` |
| F07-17 | — | F07.SUBSCRIPTIONS | ADD A SUBSCRIPTION | form `:281`, `:283` | BD/form | T P | — |
| F07-18 | — | children | — | Quick Add / Ask (`UpcomingShell` `:27-45`) | TS / BD | G06 / G07 | — |
| F07-19 | — | F07.* | save / pay / skip / date / undo | toasts FS:588, `:727`, `:759`, `:780`, `:815` | TO | A | — |

### F08 PLAN

File: `PlanScreens.tsx`.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F08-01 | — | F08.00 `plan` | SET MONEY ASIDE CTA (`:136-138`) | `AddIntentionSheet` `:194-225` | BD/form | T P L | `createPlanIntention`, `useBillSetAsideRows` |
| F08-02 | — | F08.00 | pick a bill | → `SetAsideSheet` `:202-204` | BD/form | T P | reservations |
| F08-03 | — | F08.00 | tabs | index tabs `:106-110` | RA `.jrn-ra__tab` | I | — |
| F08-04 | — | F08.00 | none | "NOTHING IS ARRANGED YET" `:116-119` | RA | I | — |
| F08-05 | — | F08.00 | — | Quick Add / Ask `:74-75` | TS / BD | G06 / G07 | — |
| F08-06 | — | F08.ITEM `plan/:id` | ASSIGN AMOUNT | `AssignSheet` `:227-236` | BD/form | T P | `updatePlanIntention` |
| F08-07 | — | F08.ITEM | REMOVE | confirmation `:180-185` | BD/confirm | T P | `archivePlanIntention` |
| F08-08 | — | F08.ITEM | bad id | not found `:154-161` | PN empty | I | — |

### F09 SAFE TO SPEND (+ ACCOUNT / GS.SETTINGS)

Files: `SafeToSpendScreens.tsx`, `CheckPurchaseScreens.tsx`, AcS, `LockedPurchaseResultScreen.tsx`.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F09-01 | — | F09.00 `safe` | "NEXT 30 DAYS · … · CHANGE" (`:183-185`) | `SafeHorizonSheet` SHS:115-123 | BD/analysis | T P L; overlay host forced fixed on this screen (`jurnl-f09-authority.css:47-50`) | `computeNextIncomeView` |
| F09-02 | — | F09.00 | monogram | → `account` `:175-177` | `.jrn-f09a__account` | I | session initials |
| F09-03 | — | F09.00 | SEE WHY / CHECK A PURCHASE | `:186-188`, `:207-215` | `.jrn-f09a__*` | I | — |
| F09-04 | — | F09.00 | — | Quick Add / Ask `:218-219` | TS / BD | G06 / G07 | — |
| F09-05 | — | F09.00.REFERENCE `safe/reference` | SEE WHY / CHECK pill | `:89-150` + Quick Add / Ask | RP | I | — |
| F09-06 | — | F09.WHY `safe/why` | CHANGE WHAT'S HELD (`:299-302`) | `HoldSheet` `:325-336` | BD/form | T P L | `protectedAmount`, buffer |
| F09-07 | — | F09.WHY | CONTINUE | CONFIRM THE HOLD, stacked over F09-06 `:337-342` | BD/confirm | T P | `patchSetup`, `patchSettings` |
| F09-08 | — | F09.WHY | LEARN MORE | → Ask `:308` | BD | G07 | — |
| F09-09 | — | F09.WHY | — | Quick Add / Ask `:252-253` | TS / BD | G06 / G07 | — |
| F09-10 | — | F09.CHECK `safe/check` | type / chips | amount + $25/$50/$100/$250 chips `:184-209` (**`$` hard-coded**) | RP `.jrn-ref__amount-input` | I | — |
| F09-11 | — | F09.CHECK | SELECT A CATEGORY | `SelectionSheet` `:78-137`, `:240-255` | RS | **not portaled, no focus trap, no Escape**; scrim is a button | static `PURCHASE_CATEGORIES` |
| F09-12 | — | F09.CHECK | SELECT ACCOUNT | `SelectionSheet` `:256-271` | RS | same as F09-11 | static `PAY_WITH_ACCOUNTS` (not the user's accounts) |
| F09-13 | — | F09.CHECK | CHECK with no amount | error toast `:159-162` | TO error | A | — |
| F09-14 | — | F09.CHECK | — | Quick Add / Ask `:173-175` | TS / BD | G06 / G07 | — |
| F09-15 | — | F09.ACCOUNT `account` | NEXT / BACK / dots | 3-page folio AcS:149-266 (Pill `:102-110`, Dots tablist `:112-122`) | RP on account plate | I | — |
| F09-16 | — | F09.ACCOUNT | CHANGE | → `CurrencySheet` (G04) `:192-195`, `:165` | BD/filter | T P | — |
| F09-17 | — | F09.ACCOUNT | toggle | ASK JURNL CONTEXT switch `:204-212` (Toggle `:83-90`) | `.jrn-ref__toggle` | `role=switch` | `patchConsent` |
| F09-18 | — | F09.ACCOUNT | type / SAVE BUFFER | `MoneyField` `:93-100` (**`$` hard-coded**) + toast `:63-66` | RP, TO | I | `safeToSpendBuffer` |
| F09-19 | — | F09.ACCOUNT | PRIVACY & CONSENTS | → `ConsentsSheet` (G05) `:237`, `:166` | BD/form | T P | — |
| F09-20 | — | F09.ACCOUNT | PROFILE, NOTIFICATIONS, SECURITY, CALENDAR PREFERENCES, DATA EXPORT, HELP & SUPPORT, LEGAL | "NOT IN THIS PREVIEW YET" error toast `:67`, `:179`, `:236`, `:238-239`, `:252-254` | TO error | A | — |
| F09-21 | — | F09.ACCOUNT | SIGN OUT | direct `signOut` `:255`, **no confirmation** (drawer version `:407` is the same) | RP card | I | session |
| F09-22 | — | F09.ACCOUNT | CONNECTION | → `money/places` `:197` | RP | I | `honestAccountsConnectionLabel` |
| F09-23 | — | F09.ACCOUNT | — | Quick Add / Ask `:167-168` | TS / BD | G06 / G07 | — |
| F09-24 | — | F09.RESULT.GOOD / CHECK_IN / OVER `purchases/result/*` | route | `LockedPurchaseResultScreen.tsx:14-20`: a static PNG with text baked into the image | `.jrn-locked-result` (unscoped, `jurnl-f10-checked.css:25`) | none | — |

### F10 PURCHASES

Files: `PurchasesScreens.tsx`, `PurchaseCheckedScreen.tsx`.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F10-01 | — | F10.00 `purchases` | ADD / CONSIDER (`:275`, `:311`) | `ConsiderSheet` `:359-370` | BD/form | T P L | `createPurchase` |
| F10-02 | — | F10.00 | none | empty plinth `:267-270` | FF object | I | — |
| F10-03 | — | F10.00 | focus item | verdict orbit + line `:276-292` | FF | I | `purchaseAffordability` |
| F10-04 | — | F10.00 | — | Quick Add / Ask (authority marks) `:244-245` | TS / BD | G06 / G07 | — |
| F10-05 | — | F10.OBJECT `purchases/:id` | LET IT GO | confirmation `:349-354` | BD/confirm | T P | `archivePurchase` |
| F10-06 | — | F10.OBJECT | DECIDE / I BOUGHT IT | `:343-346` (I BOUGHT IT has **no confirmation**) | `.jrn-btn` | I | `markPurchaseBought` |
| F10-07 | — | F10.OBJECT | bad id | not found `:329-336` | PN | I | — |
| F10-08 | — | F10.CHECKED `purchases/checked` | from CHECK / DECIDE | result card (FIT / CHECK_IN / OVER badge, impact) + 2 actions `PurchaseCheckedScreen:101-195` | `.jrn-f10c` light card on terrace plate | I; overlay host forced fixed (`jurnl-f10-checked.css:68`) | `classifyPurchaseCheck` |
| F10-09 | — | F10.CHECKED | — | Quick Add / Ask `:191-192` | TS / BD | G06 / G07 | — |

### F11 TRIPS

File: `TripsScreens.tsx`.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F11-01 | — | F11.00 `trips` | ADD A DESTINATION / PLAN ANOTHER | `TripEditSheet` `:406-419` | BD/form | T P L | `createTrip` |
| F11-02 | — | F11.00 | none | route "NOT SET" `:292-323` | FF route | I | — |
| F11-03 | — | F11.00 | — | Quick Add / Ask `:283-284` | TS / BD | G06 / G07 | — |
| F11-04 | — | F11.TRIP `trips/:id` | FUND THE TRIP | `FundingSheet` `:421-433` | BD/form | T P | `updateTrip` |
| F11-05 | — | F11.TRIP | CANCEL | confirmation `:396-401` | BD/confirm | T P | `archiveTrip` |
| F11-06 | — | F11.TRIP | MARK COMPLETE | **no confirmation** `:388-390` | `.jrn-btn` | I | `completeTrip` |
| F11-07 | — | F11.TRIP | bad id | not found `:366-373` | PN | I | — |

### F12 CREDIT

Files: `CreditScreens.tsx`, CS.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F12-01 | — | F12.00 `credit` | HOW MUCH IS USED (`:147-150`) | `UtilizationSheet` `:223-242` | BD/analysis | T P L | `overallUtilization` |
| F12-02 | — | F12.00 | ADD A CARD OR LOAN | `AddCardSheet` `:244-259` | BD/form | T P | `createManualAccount` |
| F12-03 | — | F12.00 | none | empty copy `:109-114`, `:131` | RA | I | — |
| F12-04 | — | F12.00 | — | Quick Add / Ask `:80-81` | TS / BD | G06 / G07 | — |
| F12-05 | — | F12.ACCOUNT `credit/:id` | PLAN A PAYMENT | `CardPlanSheet` CS:57-134 | BD/analysis | T P | `creditGuidance` |
| F12-06 | — | F12.ACCOUNT | SET MONEY ASIDE | → `SetAsideSheet` CS:76-81 | BD/form | T P | reservations |
| F12-07 | — | F12.ACCOUNT | CHANGE PAYMENT ACCOUNT | PAY FROM short drawer CS:82-87 | BD/form/short | T P | `upsertCreditTerms` |
| F12-08 | — | F12.ACCOUNT | RECORD PAYMENT | `CardPaymentSheet` CS:136-182 (duplicate override) | BD/form | T P | `recordTransfer` |
| F12-09 | — | F12.ACCOUNT | CARD TERMS | `CardTermsSheet` CS:184-252 (12 fields + validation) | BD/form | T P, A | `upsertCreditTerms`, `setAccountBalance` |
| F12-10 | — | F12.ACCOUNT | NOT FINISHED | `OpenTransfersPanel` → `TransferDetailSheet` `:209`, `:218` | PN, BD | T P | — |
| F12-11 | — | F12.ACCOUNT | data | payment-safety signal panel `:203` | PN signal | I | `paymentSafety` |
| F12-12 | — | F12.ACCOUNT | not a card | panel `:183-190` | PN | I | — |
| F12-13 | — | F12.* | payment saved | toast CS:168 | TO | A | — |

### F13 PAYDOWN

File: `PaydownScreens.tsx`.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F13-01 | — | F13.00 `paydown` | SET / CHANGE THE PLAN | `ChangePathSheet` `:159-174` (ad-hoc strategy chips) | BD/form | T P L | `upsertPaydownPlan` |
| F13-02 | — | F13.00 | no debt | empty + ADD A CARD OR LOAN `:82-93` | FF stair | I | — |
| F13-03 | — | F13.00 | partial | notice `:120` | FF | A | `simulatePaydownProjection` |
| F13-04 | — | F13.00 | — | Quick Add / Ask `:72-73` | TS / BD | G06 / G07 | — |
| F13-05 | — | F13.WHAT_IF `paydown/what-if` | type / KEEP | TRY EXTRA input + KEEP THIS PATH `:146`, `:153` | `.jrn-field` | I | — |

### F14 GOALS

File: `GoalsScreens.tsx`.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F14-01 | — | F14.00 `goals` | NAME A GOAL | `NameGoalSheet` `:142-153` | BD/form | T P L | `createGoal` |
| F14-02 | — | F14.00 | none | copy `:64-65` | FF spread | I | — |
| F14-03 | — | F14.00 | — | Quick Add / Ask `:55-56` | TS / BD | G06 / G07 | — |
| F14-04 | — | F14.GOAL `goals/:id` | SET MONEY ASIDE | goal `SetAsideSheet` `:169-177` | BD/form | T P | `setGoalAside` |
| F14-05 | — | F14.GOAL | EDIT | `EditGoalSheet` `:155-167` | BD/form | T P | `updateGoal` |
| F14-06 | — | F14.GOAL | LET IT GO | confirmation `:132-137` | BD/confirm | T P | `archiveGoal` |
| F14-07 | — | F14.GOAL | bad id | not found `:102-109` | PN | I | — |

### F15 AHEAD

File: `AheadScreens.tsx`.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F15-01 | — | F15.00 `ahead` | shortfall | warning banner `:95-99` | `.jrn-hz__risk` | A | `projectAhead` |
| F15-02 | — | F15.00 | thin / none | empty window `:77`, `:127-131` | FF horizon | I | — |
| F15-03 | — | F15.00 | TRY ANOTHER PATH | → `ahead/base` `:137` | `.jrn-btn` | I | — |
| F15-04 | — | F15.00 | — | Quick Add / Ask `:69-70` | TS / BD | G06 / G07 | — |
| F15-05 | — | F15.BRANCH `ahead/:id` | LET THIS BRANCH GO | `:160` | `.jrn-btn` | I | — |

### F16 RECORDS

File: `RecordsScreens.tsx`.

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA |
|---|---|---|---|---|---|---|---|
| F16-01 | — | F16.00 `records` | type | FIND A RECORD (search) `JurnlInput` `:96` | `.jrn-field` | I | `listRecords(query)` |
| F16-02 | — | F16.00 | no match | NO RECORDS MATCH `:102-106` | FF | A | — |
| F16-03 | — | F16.00 | none | NO RECORDS YET `:89-90` | FF index | I | — |
| F16-04 | — | F16.00 | ADD A RECORD | `AddRecordSheet` `:181-197` (ad-hoc kind chips) | BD/form | T P L | `createRecord` |
| F16-05 | — | F16.00 | — | Quick Add / Ask `:68-69` | TS / BD | G06 / G07 | — |
| F16-06 | — | F16.DOCUMENT `records/:id` | LINK RECORD | link drawer `:164-170` | BD/form | T P | `updateRecord` |
| F16-07 | — | F16.DOCUMENT | REMOVE | confirmation `:171-176` | BD/confirm | T P | `archiveRecord` |
| F16-08 | — | F16.DOCUMENT | UNLINK | **no confirmation** `:161` | `.jrn-btn` | I | — |
| F16-09 | — | F16.DOCUMENT | bad id | not found `:138-145` | PN | I | — |

### Review board (no family)

| # | SCREEN | COMPONENT | APPEARANCE | Notes |
|---|---|---|---|---|
| B-01 | `parents` | status buttons + family buttons, `ParentScreens.tsx:94-144` | bone field, `jrn-btn--utility` / `approval` | sessionStorage `jurnl.parentReview` |
| B-02 | **unrouted** | `ParentAuthorityScreen` `ParentScreens.tsx:41-92` (BOARD, gear, ask, disabled "NOT OPEN YET", discovery links, Quick Add / Ask) | review rail | dead code |

---

## 3a. Overlay roots, portal hosts and z-index layers

1. **Runtime root `.jrn`.**
   - Mounted at `R/JurnlRuntimeRoot.tsx:176`.
   - Its CSS at `jurnl-runtime.css:~70-88` sets `text-transform: uppercase` globally.
2. **Nav host `.jrn-nav-host`.**
   - Mounted at `JurnlRuntimeRoot.tsx:192`; context `ProductNav.tsx:109`; portal `:148`; z4 at `jurnl-frame.css:22-28`.
   - **`.jrn .jrn-nav` is defined three times:** `jurnl-frame.css:32-46` (z3), `jurnl-home.css:235-246` (z3) and `jurnl-nav.css:89`.
   - Fixed variants: `jurnl-nav.css:4` (`parent`) and `jurnl-f09-authority.css:490` (`authority`).
   - F05 motion and DOT01 move the dock by setting CSS vars on the root (`MoneyMotionParent.tsx:241-266`, `Dot01Frame.tsx:282-307`).
3. **Overlay host `.jrn-overlay-host`.**
   - Mounted at `JurnlRuntimeRoot.tsx:193`; context prim:71; CSS absolute, inset 0, z60, `pointer-events: none` (`jurnl-runtime.css:834-843`).
   - **Two per-screen overrides make it `position: fixed`:** F09.00 (`jurnl-f09-authority.css:47-50`) and F10.CHECKED (`jurnl-f10-checked.css:68-71`).
4. **`OverlayLayer` portal** (prim:72-76). It returns null until the host ref exists, so the first commit of a deep-linked overlay renders nothing.
5. **`.jrn-overlay` wrapper** (z60, `jurnl-runtime.css:844-851`) with `.jrn-overlay__scrim` (dark 40% + blur, `:852-859`).
   - Used by `JurnlDrawer`, `JurnlSheet`, `JurnlModal` and `JurnlNativeHandoff` (prim:540-567, `:575-587`, `:615-635`, `:670-698`).
   - `.jrn-sheet` sits at z1 inside it (`:935-943`); the keyboard override is `jurnl-home.css:513-520`.
6. **Duplicate wrapper `.jrn-ovl`** (z60, `jurnl-overlays.css:6-12`) with its own scrim `.jrn-ovl__scrim` (light 10% + blur, `:14-21`).
   - Used by `QuickAddV2Sheet` (GS:198-199) and `AccountDrawer` (AcS:312-313).
   - Has its own scaling and keyboard handling (`R/components/OverlayAuthority.tsx:23-84`).
7. **Duplicate full-screen layer `.jrn-d01-overlay`** (position fixed, z60, opaque; `jurnl-f05-dot01.css:685-699`).
   - Mounted through `OverlayLayer` (`Dot01Frame.tsx:375-380`), with its **own focus trap** (`:331-371`).
   - The DOT01 page stage `.jrn-d01` is itself fixed (`jurnl-f05-dot01.css:6-9`), as is `.jrn-f05m` (`jurnl-f05-motion.css:12-20`).
8. **Popover `.jrn-pop`** (z80, `jurnl-f05-surfaces.css:56-70`).
   - Portals into `.jrn-d01` or `[data-jrn-surface-host]`, falling back to **`document.body`** (JS:25-27, `:81-86`).
   - `data-jrn-surface-host` is set at `MoneyMotionParent.tsx:495`.
   - The body fallback would escape `.jrn` style scoping.
9. **Un-layered `SelectionSheet`.** `.jrn-ref__scrim` / `.jrn-ref__sheet` render inline inside the scaled reference stage (`CheckPurchaseScreens.tsx:106-135`; `jurnl-reference.css:266-282`). It has no z-index, no portal, no focus trap and no Escape.
10. **Toast `.jrn-toast`.**
    - z80, absolute (`jurnl-runtime.css:776-790`), rendered inline at the root (`JurnlRuntimeRoot.tsx:96-100,185`).
    - It sits above every overlay and shares z80 with the popover.
11. **Corner chrome `.jrn-corner`** (fixed, z30, `jurnl-f09-authority.css:272-282`).
    - Rendered at the root by the provider (`JurnlCornerChrome.tsx:164-170`, HEAD).
    - Hidden on DOT01 (`jurnl-f05-dot01.css:703-705`); re-seated on F05 motion (`jurnl-f05-motion.css:461-515`).
12. **Screen-internal z-index:**
    - `.jrn-env` z0 (`jurnl-environment.css:9`) and `.jrn-col` z2 (`jurnl-runtime.css:1055`)
    - center stage z1 (`jurnl-center-stage.css:336`)
    - F09 authority z0–z3 (`jurnl-f09-authority.css:98,142,209,357`)
    - F10 checked z0–z2 (`jurnl-f10-checked.css:116-221`)
    - reference z0–z1 (`jurnl-reference.css:100,107`)
    - home z3 (`jurnl-home.css:245`)
    - F05 motion z1–z3 (`jurnl-f05-motion.css:257,357,404`)
    - carousel z0 (`jurnl-f05-carousel.css:25`)
    - DOT01 z2 (`jurnl-f05-dot01.css:827`)
13. **Overlay-state mechanisms (duplicated):**
    - the store's single overlay id (`store.tsx:163`, `:405-407`, `?overlay=` at `:294-298`)
    - per-screen `useState` sheets (most screens)
    - the `Dot01SheetState` switch with handoff (`Dot01Sheets.tsx:15-78`)
    - `usePocketManager` (`PocketManager.tsx:224-269`)
    - `SelectionSheet` local state
14. **Focus management (duplicated):**
    - `useOverlayFocus` (prim:454-483); its focusable selector skips `select`, `textarea` and `a`
    - the `Dot01Overlay` trap
    - `PocketMenu`, which listens for Escape on the window and uses roving focus (`PocketManager.tsx:125-154`)
    - `JurnlSelect` / `JurnlDateField` keyboard handling (JS:140-173, `:286-311`)
    - frame region focus (`FamilyFrame.tsx:245-249`)
    - DOT01 page-heading focus (`Dot01Frame.tsx:179-184`)
    - `SelectionSheet`: none
15. **WIP, untracked, appeared during the audit:**
    - `R/surfaces/v3/V3Surfaces.tsx`, which says everything renders through `OverlayLayer` and `useOverlayFocus`
    - `R/surfaces/v3/jurnl-v3.css`, which adds `.jv3-host` as `position: fixed` (`jurnl-v3.css:94`)
    - `R/global/GlobalMenu.tsx`, now imported by the modified `JurnlCornerChrome.tsx`

**Duplicates in short:**
- Four separate z60 overlay layers (host, `.jrn-overlay`, `.jrn-ovl`, `.jrn-d01-overlay`), plus one un-layered sheet.
- Three scrim styles (dark 40%, light 10%, reference dark 50%).
- Three portal targets (overlay host, nav host, popover stage host or body).
- z80 shared by toast and popover.
- `.jrn-nav` defined three times.
- Two screen-specific overlay-host position overrides.

## 3b. Shared form controls and who uses which

- **`JurnlInput`** (prim:181-290). Floating label `.jrn-field`; value forced to uppercase on change except for passwords.
  - Used for text, email, password (with reveal), search (F04 `HomeScreens:337`, F16 `RecordsScreens:96`), money (`inputMode=decimal`, no formatting or symbol) and dates (plain-text "YYYY-MM-DD").
  - **Callers:**
    - F01: `EntryScreens:632`, `:953`; `RecoveryScreens:59`, `:194-204`
    - F02: `SetupScreens` ×5
    - F04: HomeScreens ×3
    - finance sheets: FS ×22 and CS ×14, covering F03, F04, F05, F06, F07, F08 and F12
    - families: `MoneyScreens` ×5 · `IncomeScreens` ×5 · `PlanScreens` ×2 · `SafeToSpendScreens` ×2 · `PurchasesScreens` ×2 · `TripsScreens` ×4 · `CreditScreens` ×3 · `PaydownScreens` ×2 · `GoalsScreens` ×6 · `RecordsScreens` ×4
- **`E2Field` / `E2Check`** (`EntryV2Parts.tsx:91-216`): underline field and checkbox, F01.01 and F01.03 only.
- **Money inputs: seven implementations.**
  1. `JurnlInput` decimal (above).
  2. `.jrn-qa__amount` with the currency symbol (GS:265-283).
  3. Account-page `MoneyField` `.jrn-ref__money-input`, with a hard-coded `$` (AcS:93-100).
  4. Drawer `.jrn-dr__money`, with the currency symbol (AcS:375-392).
  5. Check-a-purchase `.jrn-ref__amount-input` + preset chips, with a hard-coded `$` (`CheckPurchaseScreens:184-209`).
  6. DOT01 `TextInput` with `inputMode=decimal` (`d01/kit.tsx:171-183`).
  7. DOT01 `FigurePair` input (`kit.tsx:77-90`).
- **Selects / choice groups:**
  - **`JurnlSelect`** (JS:109-224): DOT01 only, via `SelectInput` (`kit.tsx:185-191`) and `FilterSelect` (`HistoryPage:214-224`).
  - **`Chips` / `AccountChips`** (FS:58-82; aria-pressed `.jrn-btn--secondary` in `.jrn-home__choices`): FS, CS, SHS, TMS, `UpcomingScreens:265`, `MoneyScreens:436,440`.
  - **Hand-built copies of the same chip pattern:** `FilterSheet` (`HomeScreens:448-479`), activity edit (`:618-624`), `AddIncomeSheet` (`IncomeScreens:215-219`), `ChangePathSheet` (`PaydownScreens:167-171`), `AddRecordSheet` (`RecordsScreens:189-193`), `CurrencySheet` (`SettingsScreens:12-31`).
  - **`JurnlChoice`** radio / multi rows (prim:315-330): all of F02, plus F01.12 biometric method.
  - **Quick Add `.jrn-qa__opt`** radio-like buttons (GS:229-325).
  - **`SelectionSheet` photo tiles** (F09.CHECK).
  - **DOT01 `ChipChoice`** multi (`kit.tsx:193-207`), plus `role=radio` card and strip groups (`AccountSheets:78-87`, `CorrectionSheets:263-271`).
- **Date fields: three implementations.**
  1. `JurnlInput` text "YYYY-MM-DD": FS:163, 364, 555, 612, 616, 737, 760; CS:176, 240, 242, 247; `IncomeScreens:213,232`.
  2. `JurnlDateField` calendar popover (JS:261-400): DOT01 `EntrySheets:238,320,396`, `CorrectionSheets:242`, `HistoryPage` FROM/TO.
  3. TODAY / YESTERDAY chips (FS:164).
  - Quick Add has no date field.
- **Toggles: five implementations.**
  1. `JurnlToggle` (prim:305-311): F01.11 (`SecurityScreens:324`), F01.12 (`:531`), F02.07 (`SetupScreens:611`), GS `ConsentsSheet` (AcS:76-78, no visible labels).
  2. `.jrn-ref__toggle` (AcS:83-90).
  3. `.jrn-dr__toggle` (AcS:366-368).
  4. A native `<input type=checkbox role=switch>` (`AccountSheets:161`).
  5. `E2Check` checkboxes.
  - `JurnlCheckbox` (prim:293-302) is unused.
- **Search:** `JurnlInput` with the search icon (F04), `JurnlInput` (F16), native `type=search` (DOT01 `HistoryPage:105`), and the motion-parent search chip that routes to `activity`.
- **Other controls:**
  - native file inputs (`ReceiptFlow:138-139`)
  - camera `<video>` (`:217`)
  - reorder grip and up/down buttons (`DirectoryPage:174-188`)
  - reveal-password buttons (prim:270-281; `EntryV2Parts:161-173`)

## 3c. Case and cursive

**Context.** The `.jrn` root uppercases everything visually (`jurnl-runtime.css:84`). Lower-case source text therefore only shows as lowercase where CSS sets `text-transform: none`. Those exceptions are passwords (`jurnl-runtime.css:113,433,453`; `jurnl-entry-v2.css:194,214`) and the two script classes below.

**Mixed or lower case in source, displayed uppercase by CSS:**
- `R/components/JurnlProductionServiceScreen.tsx:10,13-16`: "Production persistence…", "Supabase:", "API base:", "Server persistence flag:", "Contact support…". This is the only fully mixed-case system screen, and screen readers read it in mixed case.
- `ParentScreens.tsx:120` renders `parent.summary` from `D/parents/catalog.ts:47,71,…`, sentence case (review board).
- `AheadScreens.tsx:159`: `'base'` fallback.
- The baked purchase-result PNGs (`LockedPurchaseResultScreen.tsx:2-10`) have text inside the image, so case cannot be controlled at all.
- The data and copy layer (`D/f01/copy.ts`, `D/monetization/copy.ts`, the ledger error strings) is uppercase.

**Cursive font.** `'JURNL Script'` is Pinyon Script, declared at `R/screens/f05/jurnl-f05-motion.css:4-10`, with `text-transform: none`. It is used only in two places:
1. **`.jrn-f05m__script`** (`jurnl-f05-motion.css:132-139`): `MoneyMotionParent.tsx:522` "where your money lives". Lowercase.
2. **`.jrn-d01__script`** (`jurnl-f05-dot01.css:126-132`, `:1217-1221`), rendered at `Dot01Frame.tsx:239`. **Every subtitle is lowercase:**
   - `DirectoryPage:81`: "reorder accounts", "nothing added yet"
   - `DetailPages:168`: "account settings"; `:303`: "needs attention"
   - `HistoryPage:190`: "search and filter"
   - `PocketManager:193`: "the name only changes"
   - `AccountSheets:69`: "create a new account"; `:191`: "how this account is used"; `:252`: "action blocked" / "before you continue"
   - `EntrySheets:148`: "something needs your attention"; `:174`: "review before saving"; `:212`: "check before saving"
   - `ReceiptFlow:154`: "pulling in the details"; `:176`: "something went wrong"; `:210`: "take a clear photo"
   - `CorrectionSheets:171`: "review the changes"; `:234,259`: "fix or reverse this entry"; `:305`: "review before saving"

No other surface uses a cursive face.

## Counts

| Family | Surfaces |
|---|---|
| GLOBAL | 23 (12 mounted + 11 defined but unmounted: 9 monetization, ReferenceDock, JurnlCheckbox) |
| F01 | 54 |
| F02 | 18 |
| F03 | 10 |
| F04 | 14 |
| F05 | 65 (24 cabinet / motion + 41 DOT01) |
| F06 | 11 |
| F07 | 19 |
| F08 | 8 |
| F09 | 24 |
| F10 | 9 |
| F11 | 7 |
| F12 | 13 |
| F13 | 5 |
| F14 | 7 |
| F15 | 5 |
| F16 | 9 |
| Board | 2 |
| **Total** | **303 rows** (278 family rows + 23 global + 2 board) |

Call sites by component (HEAD, excluding WIP):
- `JurnlDrawer` 77, of which 43 have no expression variant (expression form 27 / analysis 5 / detail 7 / filter 2 / confirmation 11)
- `Dot01Overlay` 20
- `JurnlModal` 6
- `JurnlSheet` 2
- `JurnlNativeHandoff` 3
- `JurnlExternalHandoff` 1
- `JurnlPopover` 3
- `SelectionSheet` 2
- `JurnlErrorPanel` 18
- `JurnlSuccessPanel` 4
- `E2Note` 5
- DOT01 `Alert` 29
- `showToast` 36
- `QuickAddV2Sheet` 34 and `AskJurnlSheet` 34 (per-screen mounts)

## Migration-relevant inconsistencies

- **Visual mismatch on DOT01:** DOT01 pages open bone drawers. `TransferSheet` appears at `AccountPage:183` and from `Dot01Sheets` `transfer`.
- **No visible labels:** the three `ConsentsSheet` toggles show no text (AcS:76-78).
- **Display currency ignored:** `$` is hard-coded at `CheckPurchaseScreens:187,205` and AcS:96.
- **Accessibility gap:** `SelectionSheet` has no portal, focus trap or Escape.
- **Destructive or irreversible actions with no confirmation:** F06 ARCHIVE, F10 I BOUGHT IT, F11 MARK COMPLETE, F16 UNLINK, and ACCOUNT SIGN OUT (both the page and the drawer).
- **Nav `current` differs between hub and children:** F06 hub = MONEY but child = HOME (`IncomeScreens:67` vs `:29`); F14 hub = PLAN but child = HOME (`GoalsScreens:52` vs `:23`).
- **Silent save:** Quick Add saves with no toast.
- **Unscoped CSS:** `.jrn-locked-result` is not scoped under `.jrn`.
- **Missing from the route tree:** the DOT01 screen ids and F07.SUBSCRIPTIONS.
- **No feature locks to migrate yet:** the monetization, upgrade, membership and add-on surfaces exist but nothing mounts them, and `upgradeSurfaceAllowedIn` is false for every family.
