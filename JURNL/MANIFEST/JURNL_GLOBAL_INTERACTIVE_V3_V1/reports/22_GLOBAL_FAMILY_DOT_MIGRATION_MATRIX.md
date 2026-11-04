# 22 · Global family / DOT migration matrix

Every surface of the inventory (report 02, committed `4d222f7c`) with its status after this sprint. STATUS legend: MIGRATED_AND_TESTED · MIGRATED_VISUAL_REVIEW_PENDING · ALREADY_CONFORMANT (V9 DOT 01 authority / approved F09 replica) · DEFERRED_AUTHORITY_MISSING (phases 4–5: no family-reviewed V3 composition yet; opt-in `material="v3"` exists) · DEFERRED_FUNCTIONAL_DEPENDENCY (monetization primitives with no billing / no allowed family) · BLOCKED · NOT_IMPLEMENTED. FOUNDER_APPROVAL_STATUS is PENDING on every row.

## New surfaces (not in the inventory: they did not exist)

| SURFACE | FAMILY | STATUS | VISUAL_FAMILY | TEST_EVIDENCE |
|---|---|---|---|---|
| GLOBAL MENU | GLOBAL | MIGRATED_AND_TESTED | A navigation drawer | unit M1–M3 · E2E G1, G2, G4 |
| MY MEMBERSHIP | GLOBAL | MIGRATED_AND_TESTED | G membership folio | unit E1–E3 · E2E G3, G4 |
| EXPLORE ADD-ONS | GLOBAL | MIGRATED_AND_TESTED | H collection | unit E4, E5 · E2E G3, G4 |
| UNLOCK | GLOBAL | MIGRATED_AND_TESTED | I unlock folio | unit E6 · E2E G3 |
## Totals (inventory rows)

| STATUS | rows |
|---|---|
| DEFERRED_AUTHORITY_MISSING | 242 |
| ALREADY_CONFORMANT | 40 |
| MIGRATED_AND_TESTED | 9 |
| DEFERRED_FUNCTIONAL_DEPENDENCY | 8 |
| MIGRATED_VISUAL_REVIEW_PENDING | 4 |
| **total** | **303** |

| Family | MIGRATED_AND_TESTED | MIGRATED_VISUAL_REVIEW_PENDING | ALREADY_CONFORMANT | DEFERRED_AUTHORITY_MISSING | DEFERRED_FUNCTIONAL_DEPENDENCY |
|---|---|---|---|---|---|
| GLOBAL | 3 | 0 | 3 | 9 | 8 |
| F01 | 0 | 0 | 0 | 54 | 0 |
| F02 | 0 | 0 | 0 | 18 | 0 |
| F03 | 0 | 0 | 0 | 10 | 0 |
| F04 | 0 | 0 | 0 | 14 | 0 |
| F05 | 5 | 4 | 37 | 19 | 0 |
| F06 | 0 | 0 | 0 | 11 | 0 |
| F07 | 0 | 0 | 0 | 19 | 0 |
| F08 | 0 | 0 | 0 | 8 | 0 |
| F09 | 1 | 0 | 0 | 23 | 0 |
| F10 | 0 | 0 | 0 | 9 | 0 |
| F11 | 0 | 0 | 0 | 7 | 0 |
| F12 | 0 | 0 | 0 | 13 | 0 |
| F13 | 0 | 0 | 0 | 5 | 0 |
| F14 | 0 | 0 | 0 | 7 | 0 |
| F15 | 0 | 0 | 0 | 5 | 0 |
| F16 | 0 | 0 | 0 | 9 | 0 |
| Review | 0 | 0 | 0 | 2 | 0 |

Row counting note: a few inventory tables carry sub-header / continuation rows, so the row total here can differ slightly from the inventory's own count of 303 surfaces; the statuses are per table row.

| V3 search drawer | GLOBAL | NOT_IMPLEMENTED | B ledger | report 11 (authority conflict U3) |

## GLOBAL / cross-family

| # | FAM | DOT | SCREEN · ROUTE | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA / ENTITLEMENT | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|---|
| G01 | all app | — | all F03–F16, `account`, `parents` | always | `JurnlProductNav` `ProductNav.tsx:119-149` | `.jrn-nav` in three variants: default `jurnl-frame.css:32`; `marks=parent` fixed `jurnl-nav.css:4`; `marks=authority` `jurnl-f09-authority.css:490`. F05 motion / DOT01 re-seat it via root CSS vars (`f05/MoneyMotionParent.tsx:241-266`, `d01/Dot01Frame.tsx:282-307`). | Portal to nav host (`:148`); `aria-current` | ADD → overlay `quick-add` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| G02 | all app | — | not on `entry*` / `setup*`; root hubs have no back chip | always | `JurnlCornerChrome` `R/components/JurnlCornerChrome.tsx:181-206` (HEAD) | `.jrn-corner` fixed, z30, `jurnl-f09-authority.css:272-282`; hidden on DOT01 (`jurnl-f05-dot01.css:703`); re-seated as a chip on F05 motion (`jurnl-f05-motion.css:461-515`) | I. Back always `go('today')`, never history | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| G03 | GS | — | any app route | corner MENU (`JurnlCornerChrome.tsx:166-168`) | `AccountDrawer` AcS:293-422 | TS, right-hand torn panel `.jrn-dr` (`jurnl-overlays.css:230-398`) | T P S K | session; currency; consent ASK_JURNL_CONTEXT; `settings.safeToSpendBuffer`; buffer-saved TO | MIGRATED_AND_TESTED | GLOBAL MENU (V3 A); the F09 folio is now PREFERENCES |
| G04 | GS | — | `account` page and drawer | CHANGE currency | `CurrencySheet` `SettingsScreens.tsx:8-34` | BD/filter/long; `.jrn-currency__row` buttons | T P S | CURRENCIES, `setCurrency`, `patchSettings` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| G05 | GS | — | `account` page and drawer | PRIVACY & CONSENTS | `ConsentsSheet` AcS:72-81 | BD/form/long; three `JurnlToggle` with **no visible labels** (aria-label only) | T P S | setup draft consents | MIGRATED_AND_TESTED | V3 D material + visible switch words |
| G06 | all app | — | every app screen | dock ADD; DOT01 add chip (`Dot01Frame.tsx:388`) | `QuickAddV2Sheet` GS:104-345 | TS bottom sheet `.jrn-qa` (`jurnl-overlays.css:55-228`); radio-like `.jrn-qa__opt`; inline error `:335-339` | T P S K O; saves without a toast | `quickAddTypesForFamily` (`D/foundation/quickAddRegistry.ts:69`); ledger, income, goal, purchase, trip creates; `quoteQuickAdd` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| G07 | all app | — | every app screen | info icon; TODAY MORE; WHY LEARN MORE | `AskJurnlSheet` GS:33-50 | BD/confirm/long | T P S O | `D/foundation/askJurnl.ts`; `safeToSpend` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| G08 | all | — | root | `showToast` (36 call sites) | `JurnlSuccessBanner` prim:436-449, rendered at `JurnlRuntimeRoot.tsx:96-100,185` | TO, z80 | I; A (polite); auto-dismiss 4.2 s (`store.tsx:213-219`); single slot | sync errors "SAVE FAILED" / "SESSION ENDED" (`store.tsx:300-323`, `:350-361`) | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| G09 | F05–F16 | — | child shells and frame hubs | always | `FamilyChrome` `R/components/FamilyChrome.tsx:6-23` | `.jrn-home__top` mark + info iconbtn | I | → overlay `ask` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| G10 | F06,07,10,11,13,14,15,16 + shells | — | frame screens | overflow content | `JurnlPanelStack` NEXT / marks / "CONTINUED" `R/components/FamilyFrame.tsx:164-232` | `.jrn-frame__edge`, `.jrn-frame__next` | I; aria-live; offscreen panels inert; region focus (`:245-249`) | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| G11 | — | — | production with no config | fail closed | `JurnlProductionServiceScreen.tsx:5-20` (in `R/components/`) | plain `.jrn-entry`; mixed-case copy | I | `productionConfig` | MIGRATED_AND_TESTED | system copy uppercased |
| G12 | all | — | design preview only | `?overlay=`, `?state=` | `store.tsx:138-163`, `:294-298`; `D/f01/screens.ts:136-140` | — | opens any overlay id | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| G13 | — | — | **not mounted** | — | `JurnlUpgradePanel` `R/monetization/JurnlMonetizationPrimitives.tsx:65-78` | `.jrn-mon` bordered field card (`jurnl-monetization.css`) | I | `upgradeSurfaceAllowedIn` is false for every family (`D/monetization/familyMonetization.ts:22-27`) | DEFERRED_FUNCTIONAL_DEPENDENCY | unmounted; no billing, no family allows upgrade surfaces |
| G14 | — | — | not mounted | — | `JurnlFeaturePreview` `:81-88` | `.jrn-mon--preview` | I | — | DEFERRED_FUNCTIONAL_DEPENDENCY | unmounted; no billing, no family allows upgrade surfaces |
| G15 | — | — | not mounted | — | `JurnlEntitlementNotice` `:91-99` | `.jrn-mon--notice` | A | entitlement failure copy | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| G16 | — | — | not mounted | — | `JurnlEntitlementGate` `:102-126` (feature lock / paywall) | `.jrn-mon-gate` | — | `clientGate(useJurnlEntitlements())` | DEFERRED_FUNCTIONAL_DEPENDENCY | unmounted; no billing, no family allows upgrade surfaces |
| G17 | — | — | not mounted | — | `JurnlUsageLimitNotice` `:129-138` | `.jrn-mon--usage` | A | `useUsageLimit` | DEFERRED_FUNCTIONAL_DEPENDENCY | unmounted; no billing, no family allows upgrade surfaces |
| G18 | — | — | not mounted | — | `JurnlPlanBadge` `:141-150` (membership) | `.jrn-mon-badge` emerald outline | I | `planById` | DEFERRED_FUNCTIONAL_DEPENDENCY | unmounted; no billing, no family allows upgrade surfaces |
| G19 | — | — | not mounted | — | `JurnlAddOnOffer` `:153-166` (add-on) | `.jrn-mon--addon` | I | `addOnById` | DEFERRED_FUNCTIONAL_DEPENDENCY | unmounted; no billing, no family allows upgrade surfaces |
| G20 | — | — | not mounted | — | `JurnlBillingStatus` `:169-177` (subscription) | `.jrn-mon-badge` | I | `subscriptionState` | DEFERRED_FUNCTIONAL_DEPENDENCY | unmounted; no billing, no family allows upgrade surfaces |
| G21 | — | — | not mounted | — | `JurnlTrialNotice` `:180-188` | `.jrn-mon--trial` | A | `trialActive` | DEFERRED_FUNCTIONAL_DEPENDENCY | unmounted; no billing, no family allows upgrade surfaces |
| G22 | — | — | unused | — | `ReferenceDock` `R/components/ReferenceStage.tsx:225-252` | `.jrn-ref__dock` | — | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| G23 | — | — | unused | — | `JurnlCheckbox` prim:293-302; also the unused `JurnlInput` prefix/suffix props (prim:239-248) | `.jrn-check` | — | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F01 ENTRY

| # | DOT | SCREEN · ROUTE | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F01-01 | — | F01.00 WELCOME `entry` | onboarding | `WelcomeScreen` EntryScreens:141-174 | E2 olive / cream buttons on plate | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-02 | — | F01.14 VALUE `entry/value` | onboarding | `:177-205` | E2 | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-03 | — | F01.15 BENEFITS `entry/benefits` | onboarding | `:208-242` | E2 slips | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-04 | — | F01.16 BEGIN `entry/begin` | onboarding | `:245-266` | E2 | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-05 | — | F01.01 CREATE `entry/create` | form | `E2Field` ×4 with password reveal, `E2Check` agree: `:379-420`; `EntryV2Parts.tsx:91-216` | E2 underline fields | I | `auth.signUp` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-06 | — | F01.01 | password focus or typing | requirements `:410-419` | `.jrn-e2__reqs` | I | `passwordRuleState` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-07 | — | F01.01 | validate / EMAIL_IN_USE | notes and errors `:368-378`, `:431-435`; `EntryV2Parts.tsx:175-179`, `:232-276` | EN | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-08 | — | F01.01 | TERMS / PRIVACY links (`:423-429`) | `LegalDrawer` `:457-494` with `JurnlInlineExpansion` sections | BD/default/long | T P S O | legal copy is placeholder (`pendingText`) | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-09 | — | F01.01 / .03 | APPLE / GOOGLE | `SocialAuthBoundary` `:65-100`: native handoff (prim:647-700), then unavailable modal | BM (wine alert icon) | T P; scrim disabled while waiting; O | `auth.social` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-10 | — | F01.01 | submit | E2Button loading `:442` | E2 | — | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-11 | — | F01.* | network errors | `useNetworkToast` `:56-62` | TO error | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-12 | — | F01.02 VERIFY `entry/verify-email` | link expired / valid | notes `:569-577` | EN (success tone) | A | `?link=` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-13 | — | F01.02 | OPEN EMAIL APP | `MailHandoff` `:106-124`, `JurnlExternalHandoff` prim:640-644 | BM | T P S O | `bridge.openExternal` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-14 | — | F01.02 | USE A DIFFERENT EMAIL | `ChangeEmailDrawer` `:598-635` | BD/short + `JurnlInput` | T P S O | `auth.changeEmail` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-15 | — | F01.02 | resend | toast `:533-540`, forced `:510-515` | TO | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-16 | — | F01.03 SIGN IN `entry/sign-in` | form | `E2Field` ×2, `E2Check` keep `:741-760` | E2 | I | `auth.signIn` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-17 | — | F01.03 | auth errors | notes `:685-690`, `:740` | EN with action | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-18 | — | F01.03 | LOCKED / `?state=locked` | locked drawer `:700-719` | BD/short/wine | T P S O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-19 | — | F01.03 | CONTACT SUPPORT | `MailHandoff` SUPPORT `:720` | BM | T P S | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-20 | — | F01.04 UNLOCK `entry/unlock` | forced state | session-expired / reauth panels `:815-823` | EP | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-21 | — | F01.04 | Face ID fail | error with TRY AGAIN `:831-838` | EP (destructive) | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-22 | — | F01.04 | UNLOCK | native handoff `:850-864` | BM glyph + pulse | T P O | `bridge.requestBiometric` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-23 | — | F01.04 | USE PASSWORD | `UsePasswordSheet` `:915-956` | BS + password `JurnlInput` | T P O | `auth.signIn` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-24 | — | F01.04 | SWITCH ACCOUNT | drawer `:866-893` | BD/long | T P S O | `device.remembered` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-25 | — | F01.04 | SIGN OUT | confirmation `JurnlModal` `:894-910` | BM | T P S O | `signOut` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-26 | — | F01.05 FORGOT `entry/forgot-password` | form | `JurnlInput` + error, RecoveryScreens:59-60 | `.jrn-field`, EP | A | `auth.requestPasswordReset` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-27 | — | F01.06 RESET SENT | expired | error `:95-102` | EP | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-28 | — | F01.06 | OPEN MAIL / RESEND | `:113`, toast `:82` | BM, TO | T P | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-29 | — | F01.07 NEW PW `entry/new-password` | invalid link | block error `:178-185` | EP block | A | `validateResetToken` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-30 | — | F01.07 | form | password ×2, errors, requirements `:194-209` | `.jrn-field`, `.jrn-reqs` | A | `auth.resetPassword` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-31 | — | F01.07 | forced network | toast `:139-144` | TO error | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-32 | — | F01.08 RESET SUCCESS | `?banner=1` | toast `:225-230` | TO | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-33 | — | F01.09 BIOMETRIC `entry/biometric` | result | success / unavailable / failed panels, SecurityScreens:74-97 | SP / EP | A | `device.biometric` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-34 | — | F01.09 | ENABLE FACE ID | native handoff `:107-121` | BM | T P O | bridge | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-35 | — | F01.09 | DENIED | drawer `:122-140` | BD/short | T P S O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-36 | — | F01.09 | enabled | toast `:50` | TO | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-37 | — | F01.10 TRUST `entry/device-trust` | LEARN | drawer `:194-202` | BD/long | T P S O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-38 | — | F01.10 | forced state | trusted / verify-required panels + mail `:169-179`, `:203` | SP / EP, BM | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-39 | — | F01.10 | TRUST | toast `:150` | TO | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-40 | — | F01.11 PRIVACY `entry/privacy` | DETAILS | drawer `:243-254` | BD/long | T P S O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-41 | — | F01.11 | row YOUR DATA | `PrivacyDrawer` `:268-282` | BD/long | T P S O | session | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-42 | — | F01.11 | CONNECTED ACCOUNTS | `:284-294` | BD/long | T P S O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-43 | — | F01.11 | AI ACCESS | 5 `JurnlToggle` + SAVE toast `:296-329` | BD/long | T P S O | `device.ai`, `syncDeviceAiToRepository` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-44 | — | F01.11 | DATA EXPORT | `:331-368` + success panel | BD/long, SP | T P S O | `exportRequested` (no real export) | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-45 | — | F01.11 | REMOVE ACCESS | `:370-401` + warning panel + toast | BD/long, EP | T P S O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-46 | — | F01.11 | DELETE ACCOUNT | `DeleteAccountModal` `:406-435` | BM wine, destructive | T P S O | `auth.deleteAccount` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-47 | — | F01.12 SECURITY `entry/security` | DETAILS | full sheet `:472-481` | BS | T P O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-48 | — | F01.12 | BIOMETRIC row | drawer with toggle + `JurnlChoice` ×2 + toast `:505-541` | BD/long | T P S O | `device.biometricMethod` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-49 | — | F01.12 | DEVICE | drawer with badge button + toast `:543-566` | BD/long | T P S O | `deviceTrust` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-50 | — | F01.12 | CONNECTED | `:568-577` | BD/long | T P S O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-51 | — | F01.12 | DATA | `:579-592` | BD/long | T P S O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-52 | — | F01.12 | SESSIONS | `:594-615` | BD/long | T P S O | `auth.listSessions` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-53 | — | F01.12 | REVOKE | `RevokeSessionModal` `:620-657` (confirm, then revoked) | BM wine / emerald | T P S O | `auth.revokeSession` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F01-54 | — | F01.13 COMPLETE `entry/complete` | onboarding | checklist `:660-690` | F01c | I | session / device | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F02 SETUP

| # | DOT | SCREEN · ROUTE | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F02-01 | — | all F02 | always | `Frame` back iconbtn + SETUP + progress segments `:93-159`, `:37-45` | F02 on ENV plates | I | `setupDraft` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-02 | — | F02.00 `setup` | onboarding / resume | CONTINUE / START OVER `:169-202` | F02 | I | `resetSetup` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-03 | — | F02.01 household | select | `JurnlChoice` radiogroup `:220-229` | `.jrn-choice` | I | `patchSetup` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-04 | — | F02.02 accounts | select | choices `:263-270` | `.jrn-choice` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-05 | — | F02.02 | CONNECT AN ACCOUNT | permission drawer `:271-299` (plate swaps to ENV.QUIET) | BD/default/long | T P S O | preview flag only | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-06 | — | F02.02 | connected | success panel `:258-262` | SP | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-07 | — | F02.02 | permission continue | toast `:286` | TO | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-08 | — | F02.02 / .04 / .06 | SKIP FOR NOW | `SkipSheet` `:654-684` | BD/short, footer only | T P S O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-09 | — | F02.02.1 `setup/accounts/name` | form | input + error + kind choices `:325-332` | `.jrn-field`, `.jrn-choice` | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-10 | — | F02.03 income | form / validation | error panel + cadence + amount `:357-365` | EP, `.jrn-field` | A | `isSetupAmount` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-11 | — | F02.04 commitments | empty | "NONE YET" `:393-402` | F02 list | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-12 | — | F02.04 | ADD ANOTHER / `?state=validation` | `AddSheet` `:420-458` | BD/default/long | T P S O | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-13 | — | F02.05 priorities | select | `JurnlChoice` multi, max 3 `:481-487` | `.jrn-choice` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-14 | — | F02.05.1 goal | form | error + input + horizon `:510-518` | EP, `.jrn-field` | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-15 | — | F02.06 protected | form | error + input `:549-558` | EP, `.jrn-field` | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-16 | — | F02.07 boundaries | toggles | `Consent` ×3 `:587-591`, `:603-614` | `.jrn-toggle` | I | consents | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-17 | — | F02.07 | READ THE BOUNDARY | disclosure `:592-598` | `.jrn-row` | `aria-expanded` | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F02-18 | — | F02.08 ready | select | summary + voice choice `:638-649` | `.jrn-choice` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F03 TODAY (`today`, `RootAuthorityStage`)

| # | DOT | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|
| F03-01 | — | SEE WHY (`HomeScreens:138-142`) | `TodayMoneySheet` TMS:27-114 + `HorizonBody` SHS:70-113, with period Chips | BD/analysis/long | T P S O | `computeTodayOperating` (`D/f03/todayOperating.ts`), `computeNextIncomeView` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F03-02 | — | MORE footer (`:252-254`) | `TodayMoreSheet` `:268-285` | BD/detail/long | T P S O | routes | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F03-03 | — | data | attention slip + STALE REFRESH `:145-157` | paper slip PNG on plate | I | `operating.attention` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F03-04 | — | `?state=error` | ERROR + RETRY `:163-171` | RA text | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F03-05 | — | no accounts | EMPTY + RETURN TO ACCOUNTS `:172-180` | RA | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F03-06 | — | state | LOADING / PARTIAL / no-bills `:162`, `:204-222` | RA | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F03-07 | — | MORE / LESS | COMING inline expansion `:185-214` | RA | `data-expanded` | `upcomingFor` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F03-08 | — | dock ADD | Quick Add F03 `:111` | TS | G06 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F03-09 | — | — | Ask F03 `:112` | BD | G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F03-10 | — | links | discovery footer `:242-257` | RA | I | `JURNL_FAMILY_DISCOVERY` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F04 ACTIVITY (`activity`)

| # | DOT | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|
| F04-01 | — | type | SEARCH `JurnlInput` (search icon, 160 ms debounce) + LOOKING FOR + CLEAR `:302-309`, `:337`, `:345-352` | `.jrn-field`, `.jrn-act__query` | I | `applyActivityFilter` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-02 | — | FILTER (`:338`) | `FilterSheet` `:429-482` (4 fieldsets of toggle chips) | BD/filter/long | T P S O | ledger filter | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-03 | — | filter active | summary + CLEAR FILTERS `:353-360` | `.jrn-act__filters` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-04 | — | SPENDING / `?record=spending` (`:313-317`) | `SpendingSheet` FS:511-559 | BD/form/long | T P S O | `recordExpense`, `suggestAccount`, TO | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-05 | — | row tap | `DetailSheet` view `:499-685` | BD/detail | T P S O | ledger, `transferViews` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-06 | — | EDIT | edit form `:587-627` with ad-hoc account chips | BD/form | T P | `updateLedgerEntry` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-07 | — | DELETE | confirmation `:553-585` | BD/confirm + inline error | T P | `removeLinkedEvent` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-08 | — | TRANSFER STATUS | → `TransferDetailSheet` `:549-551`, FS:375-451 | BD/detail | T P | `recordTransferStep` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-09 | — | `?state=empty` | empty `:368-373` | `.jrn-ledger__empty` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-10 | — | no match | no-matches state + clear buttons `:374-389` | `.jrn-ledger__empty` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-11 | — | state | loading / error with RETRY `:361-364` | EP block | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-12 | — | chrome | back / ACCOUNT (gear) / ASK `:325-330` | iconbtns | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-13 | — | dock ADD | Quick Add F04 `:422` | TS | G06 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F04-14 | — | info | Ask F04 `:424` | BD | G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F05 MONEY

| # | DOT | SCREEN · ROUTE | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F05-01 | — | F05.00 cabinet `money` | ADD A POCKET slot (`MoneyScreens:184`) | `AddPlaceSheet` MoneyScreens:421-445 (opened at `:124`) | BD/default/long | T P S L | `createManualAccount` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-02 | — | cabinet | no pockets | empty copy `:137-149` | RA | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-03 | — | cabinet | — | Quick Add / Ask `:122-123` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-04 | — | F05.00 motion `money?parent=motion` | "+" chip (`MoneyMotionParent:602-604`) | actions sheet `:612-619` | BD/short over collage | T P S L | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-05 | — | motion | ADD paper / sheet | `AddPlaceSheet` + POCKET ADDED toast `:620-631` | BD + TO | T P | `createManualAccount` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-06 | — | motion | MOVE MONEY paper (`:367-374`) | `TransferSheet` `:632`, FS:307-372 | BD/form | T P | `recordTransfer` | MIGRATED_VISUAL_REVIEW_PENDING | V3 D task sheet (functional suites pass) |
| F05-07 | — | motion | COMMITTED / AVAILABLE metrics, OUTLOOK panel (`:304-309`, `:298`) | `SafeHorizonSheet` `:633` | BD/analysis | T P | `computeNextIncomeView` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-08 | — | motion | transfer tokens / TRANSFERS panels (`:461-476`) | `TransferDetailSheet` `:634` | BD/detail | T P | `transferViews` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-09 | — | motion | long-press / right-click / Shift+F10 on a pocket paper (`:145-146`, `:394-403`) | `PocketMenu` `d01/PocketManager.tsx:120-171` (long press `:40-117`) | PP menu | Pp into `.jrn-f05m[data-jrn-surface-host]`; `role=menu`; Escape (window); no trap | — | MIGRATED_AND_TESTED | V3 C fragment |
| F05-10 | — | motion | RENAME POCKET | `RenamePocketOverlay` `PocketManager:174-216` + toast `:241-251` | DP | T01 P | `renameAccount`, `checkPocketName` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-11 | — | motion | DELETE POCKET | `ArchiveOverlay` delete mode `d01/sheets/AccountSheets.tsx:234-342` + toast | DP + `.d01-alert` / danger | T01 P | `archiveBlockers`, `archiveAccountSafely` | MIGRATED_AND_TESTED | blocked state = V3 F caution inside the V9 frame (confirm state keeps V9); HELD_BALANCE blocker |
| F05-12 | — | motion | swipe / prev / next / dots | carousel `MoneyMotionParent:540-596`; `R/screens/f05/useMoneyCarousel.ts` | MP | aria-live announce | `computeMoneyCarousel` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-13 | — | motion | empty / mock data | NO POCKETS paper + basis note `:350-357`, `:536` | MP | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-14 | — | motion | search chip (`:599-601`) | → `activity` | MP chip | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-15 | — | motion | — | Quick Add / Ask `:609-610` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-16 | — | F05.ACCOUNTS cabinet `money/places` | ADD A PLACE | `AddPlaceSheet` MoneyScreens:275, `:281-283` | BD | T P L | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-17 | — | F05.ACCOUNTS cabinet | MOVE MONEY / `?move=&to=` | `TransferSheet` `:235`, `:278`, `:284` | BD/form | T P | — | MIGRATED_VISUAL_REVIEW_PENDING | V3 D task sheet (functional suites pass) |
| F05-18 | — | F05.ACCOUNTS cabinet | USUAL ACCOUNTS | `PurposeSheet` FS:477-507 (list, then edit at `:482-489`) | BD/detail → form | T P | `setPurposeAccount` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-19 | — | F05.ACCOUNTS cabinet | NOT FINISHED rows | `OpenTransfersPanel` FS:454-473 → detail `:286` | PN detail → BD | T P | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-20 | — | F05.ACCOUNTS cabinet | none / unassigned | empty + unassigned notice `:254-258`, `:274` | PN empty / detail | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-21 | — | F05.ACCOUNT cabinet `money/places/:id` | EDIT | `EditPlaceSheet` `:447-473` | BD/default | T P | `renameAccount`, `setAccountBalance` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-22 | — | F05.ACCOUNT cabinet | MOVE MONEY | `TransferSheet` `:373` | BD/form | T P | — | MIGRATED_VISUAL_REVIEW_PENDING | V3 D task sheet (functional suites pass) |
| F05-23 | — | F05.ACCOUNT cabinet | ARCHIVE | archive / delete drawer with blockers `:374-408` | BD/default (no expression) | T P | `archiveBlockers` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-24 | — | F05.ACCOUNT cabinet | bad id | not-found panel `:307-316` | PN empty | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F05-25 | DOT01-06 | F05.ACCOUNTS `money/places` | — | ALL ACCOUNTS grid + NEEDS REVIEW badge, `d01/DirectoryPage.tsx:49-60` | DPg | I | `reviewIssues` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-26 | DOT01-14/30 | F05.ACCOUNTS | ADD ACCOUNT / add chip / empty-state kinds | `AddAccountOverlay` `AccountSheets:33-115` | DP (radio cards, `TextInput`, `ChipChoice`, Alert) | T01 P | `createManualAccount` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-27 | DOT01-22 | F05.ACCOUNTS | no accounts | `EmptyAccounts` `DirectoryPage:98-130` | DPg | I | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-28 | DOT01-32 | F05.ACCOUNTS | REORDER | `ReorderList` `:132-212` (grip drag + up/down) | DPg | aria-live; inline mode | `setAccountOrder` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-29 | DOT01 | F05.ACCOUNTS | hold a card | `PocketMenu` + Rename / Delete `:24-25`, `:56`, `:92` | PP / DP | Pp into `.jrn-d01` | — | MIGRATED_AND_TESTED | V3 C fragment |
| F05-30 | DOT01 | F05.ACCOUNTS | — | dock on nav paper + Quick Add / Ask, `Dot01Frame:312-314` | MP nav | G01 / G06 / G07 | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-31 | DOT01-02..05 | F05.ACCOUNT `money/places/:id` | action strips | `d01/AccountPage.tsx:56-78`, `:153-165` | DPg strips | I | `accountView` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-32 | DOT01 | F05.ACCOUNT | MANAGE POCKET chip / hold balance | `PocketMenu` `:137`, `:178` | PP | Pp; `aria-haspopup=menu` | — | MIGRATED_AND_TESTED | V3 C fragment |
| F05-33 | DOT01 | F05.ACCOUNT | MOVE MONEY | `TransferSheet` `:59`, `:183` | **BD (bone) over the parchment page** | T P | — | MIGRATED_VISUAL_REVIEW_PENDING | V3 D task sheet (functional suites pass) |
| F05-34 | DOT01-15 | F05.ACCOUNT / SETTINGS | MANAGE CARD / RENAME | `EditAccountOverlay` `AccountSheets:117-179` (native checkbox with `role=switch`, `:161`) | DP | T01 P | `include_in_net_worth`, purposes | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-35 | DOT01-17 | F05.ACCOUNT (cash) | ADD CASH | `AddCashOverlay` `d01/sheets/EntrySheets.tsx:252-329` (form, review, done) | DP | T01 P | `previewTransfer`, `correctAccountBalance` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-36 | DOT01-20 | F05.ACCOUNT (credit) | MAKE A PAYMENT | `CardPaymentOverlay` `EntrySheets:337-406` (form, review, done) | DP | T01 P | `saveTransfer` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-37 | DOT01-16/18/19 | F05.ACCOUNT / HISTORY | RECORD … | `PurchaseFlow` form `EntrySheets:51-250`, form at `:209-249`; TYPE select switches flow (`:230`; `Dot01Sheets.tsx:56-71`) | DP strips | T01 P | `previewPurchase` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-38 | DOT01-28 | PurchaseFlow | receipt read | REVIEW PURCHASE: uncertain fields flagged, suggested total `:226`, `:233-236` | DP | T01 | `ReceiptRead` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-39 | DOT01-29 | PurchaseFlow | duplicates found | POSSIBLE DUPLICATE `:145-170` | DP + wine alert | T01, A | duplicates | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-40 | DOT01-33 | PurchaseFlow | RECORD | TRANSACTION REVIEW with impact `:172-207` | DP | T01 | `savePurchase` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-41 | DOT01 | PurchaseFlow | saved | PURCHASE RECORDED `:126-143` | DP + wax seal | T01, A | `saveReceiptImage` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-42 | DOT01-26 | PurchaseFlow / HISTORY | SCAN RECEIPT | CAPTURE `d01/sheets/ReceiptFlow.tsx:200-252` (live camera `:58-83`, file inputs `:136-141`) | DP on SK03 baked frame | T01 P | `getUserMedia`, `checkReceiptFile` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-43 | DOT01-27 | ReceiptFlow | photo chosen | SCANNING progress `:152-172` | DP | aria-live | `receiptOcr.ts` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-44 | DOT01-34 | ReceiptFlow | read failed | CAPTURE FAILURE `:174-198` | DP + wine alert | T01, A | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-45 | DOT01-07..10/31 | F05.HISTORY `…/history`, `money/transactions` | type | search input `type=search`, `d01/HistoryPage.tsx:102-110` | DPg `.d01-field` | I | `searchHistory` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-46 | DOT01-31 | F05.HISTORY | FILTER | filter chips: FROM/TO `JurnlDateField`, ACCOUNT/TYPE/CATEGORY/STATUS/**SORT** `JurnlSelect`, CLEAR `:106-128`, `:214-235` | PP listbox / calendar | Pp; URL params (replace) | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-47 | DOT01 | F05.HISTORY | none / no match / >200 | notes `:131-134`, `:171` | DPg | aria-live count `:130` | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-48 | DOT01 | F05.HISTORY (place) | RECORD / SCAN RECEIPT | `:173-182` | DPg | → F05-37 / F05-42 | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-49 | DOT01-31 | `money/transactions` | chips | search focus / Quick Add + dock `:194-203` | DPg | G06 | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-50 | DOT01-11 | F05.ENTRY `money/entries/:id` | strips | EDIT / REASSIGN / VIEW RECEIPT (`window.open`) / CORRECT, `d01/DetailPages.tsx:92-98` | DPg | I | `getReceiptImage` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-51 | DOT01 | F05.ENTRY | linked entry | owner alert + chip `:99-109` | `.d01-alert` | A | `correctionCheck` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-52 | DOT01-24 | F05.ENTRY | CORRECT | options radiogroup `d01/sheets/CorrectionSheets.tsx:258-278` | DP | T01 | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-53 | DOT01-24 | F05.ENTRY | EDIT / CATEGORY / ACCOUNT | correction form `:232-256` | DP | T01 | `previewCorrection` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-54 | DOT01-37 | F05.ENTRY | CONTINUE | CONFIRM CORRECTION + VIEW ORIGINAL `:166-230` | DP | T01 | `applyCorrection`, `reverseEntry` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-55 | DOT01 | F05.ENTRY | done | CORRECTION SAVED `:153-164` | DP + seal | T01, A | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-56 | DOT01 | F05.ENTRY | refused | refused alert + owner `:70-80` | DP + alert | A | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-57 | DOT01-12 | F05.SETTINGS `…/settings` | — | settings rows + strips `DetailPages:140-161` | DPg | I | `reconciliationOf` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-58 | DOT01-21 | F05.SETTINGS | EDIT PURPOSES | `PurposesOverlay` `AccountSheets:181-227` | DP | T01 P | `setPurposeAccount` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-59 | DOT01-25/36 | F05.SETTINGS | ARCHIVE | `ArchiveOverlay` archive mode (confirm / blocked / done) `:234-342` | DP + danger / alert | T01 P | `archiveAccountSafely` | MIGRATED_AND_TESTED | blocked state = V3 F caution inside the V9 frame (confirm state keeps V9); HELD_BALANCE blocker |
| F05-60 | DOT01-13 | F05.REVIEW `…/review` | — | actual-balance input, difference band, status pill, alerts, MARK RECONCILED `DetailPages:196-237` | DPg (`FigurePair` input) | A | `markReconciled` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-61 | DOT01-23 | F05.REVIEW | ADD ADJUSTMENT | `AdjustmentOverlay` `CorrectionSheets:283-326` | DP | T01 P | `adjustToActual` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-62 | DOT01-35 | F05.ATTENTION `…/attention` | — | issue list + MARK RESOLVED + ALL CLEAR `DetailPages:255-315` | DPg | I | `reviewIssues`, `markIssueResolved` | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-63 | DOT01 | any DOT01 page | archived / bad id | `NotFoundPage` `d01/NotFoundPage.tsx:5-26` | DPg | I | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-64 | DOT01 | DOT01 overlays and filters | select | `JurnlSelect` JS:109-224 | PP listbox | Pp; WAI-ARIA combobox; Escape / Tab | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |
| F05-65 | DOT01 | DOT01 overlays and filters | date | `JurnlDateField` JS:261-400 | PP calendar | Pp; dialog `aria-modal=false`; grid keys | — | ALREADY_CONFORMANT | V9 DOT 01 authority (V3 materials inside where a V3 family applies) |

## F06 INCOME

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F06-01 | — | F06.00 `income` | ADD DAILY EARNINGS (`IncomeScreens:145`), `?add=earnings` (`:53`) | `DailyEarningsSheet` FS:116-205 | BD/form/long | T P S L | `saveDailyEarnings` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F06-02 | — | F06.00 | day row (`:115`) | `EarningsDetailSheet` FS:207-261 | BD/detail | T P | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F06-03 | — | F06.00 | REMOVE | confirmation + toast FS:213-232 | BD/confirm/short, TO | T P | `deleteDailyEarnings` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F06-04 | — | F06.00 | after save | `AfterEarningsSheet` FS:264-287 | BD/confirm | T P | routes | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F06-05 | — | F06.00 | ADD EXPECTED, `?add=expected` | `AddIncomeSheet` `:197-222` (ad-hoc cadence chips, date error) | BD/default/long | T P, A | `createIncomeSource` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F06-06 | — | F06.00 | none | state copy `:88-95` | FF ledger | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F06-07 | — | F06.00 | — | Quick Add / Ask `:70-71` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F06-08 | — | F06.SOURCE `income/:id` | EDIT | `EditIncomeSheet` `:224-235` | BD/default | T P | `upsertIncomeSource` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F06-09 | — | F06.SOURCE | MARK RECEIVED / ARCHIVE | `:184-190` (ARCHIVE has **no confirmation**) | `.jrn-btn` | I | `receiveIncome`, `deleteIncomeSource` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F06-10 | — | F06.SOURCE | bad id | not found `:160-166` | PN empty | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F06-11 | — | F06.SOURCE | — | Quick Add / Ask (`IncomeShell` `:22-40`) | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F07 UPCOMING

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F07-01 | — | F07.00 `upcoming` | ADD A BILL OR SUBSCRIPTION (`:125`) | `ObligationFormSheet` FS:565-627 | BD/form | T P L | `createBillOrSubscription` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-02 | — | F07.00 | none | state line `:96-101` | FF timeline | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-03 | — | F07.00 | — | Quick Add / Ask `:87-88` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-04 | — | F07.ITEM `upcoming/:id` | SET MONEY ASIDE | `SetAsideSheet` FS:636-697 (inline REDUCE / RELEASE) | BD/form | T P | reservations | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-05 | — | F07.ITEM | MARK PAID | `PayObligationSheet` FS:699-744 | BD/form | T P | `markObligationPaid` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-06 | — | F07.ITEM | MARK PAID (linked card) | `CardPaymentSheet` CS:136-182 | BD/form | T P | `recordTransfer` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-07 | — | F07.ITEM | EDIT | `ObligationFormSheet` (existing) `:233` | BD/form | T P | `editBillOrSubscription` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-08 | — | F07.ITEM | MORE | `ObligationMoreSheet` action menu FS:746-825 (menu at `:809-824`) | BD/detail | T P | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-09 | — | F07.ITEM | CHANGE THIS DATE | short form FS:756-762 | BD/form/short | T P | `rescheduleObligationOccurrence` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-10 | — | F07.ITEM | STOP TRACKING | confirmation FS:764-768 | BD/confirm/short | T P | `setObligationStatus` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-11 | — | F07.ITEM | PAYMENT HISTORY | history drawer + UNDO FS:770-807 | BD/detail | T P | `undoObligationPayment` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-12 | — | F07.ITEM | possible duplicate | warning panel + LINK `:221-227` | PN detail | I | `computeSafeToSpend().possibleDuplicates` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-13 | — | F07.ITEM | linked / cancelled | notice panels `:213-220` | PN | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-14 | — | F07.ITEM | bad id / income or card item | `:146-179` | PN | I | `projectUpcoming` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-15 | — | F07.SUBSCRIPTIONS `upcoming/subscriptions` | SHOW | view-filter Chips `:265` | `.jrn-home__choices` | I | `subscriptionsIn` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-16 | — | F07.SUBSCRIPTIONS | — | next renewal + empty "NONE HERE" `:266-267` | PN | I | `subscriptionTotals` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-17 | — | F07.SUBSCRIPTIONS | ADD A SUBSCRIPTION | form `:281`, `:283` | BD/form | T P | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-18 | — | children | — | Quick Add / Ask (`UpcomingShell` `:27-45`) | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F07-19 | — | F07.* | save / pay / skip / date / undo | toasts FS:588, `:727`, `:759`, `:780`, `:815` | TO | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F08 PLAN

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F08-01 | — | F08.00 `plan` | SET MONEY ASIDE CTA (`:136-138`) | `AddIntentionSheet` `:194-225` | BD/form | T P L | `createPlanIntention`, `useBillSetAsideRows` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F08-02 | — | F08.00 | pick a bill | → `SetAsideSheet` `:202-204` | BD/form | T P | reservations | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F08-03 | — | F08.00 | tabs | index tabs `:106-110` | RA `.jrn-ra__tab` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F08-04 | — | F08.00 | none | "NOTHING IS ARRANGED YET" `:116-119` | RA | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F08-05 | — | F08.00 | — | Quick Add / Ask `:74-75` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F08-06 | — | F08.ITEM `plan/:id` | ASSIGN AMOUNT | `AssignSheet` `:227-236` | BD/form | T P | `updatePlanIntention` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F08-07 | — | F08.ITEM | REMOVE | confirmation `:180-185` | BD/confirm | T P | `archivePlanIntention` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F08-08 | — | F08.ITEM | bad id | not found `:154-161` | PN empty | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F09 SAFE TO SPEND (+ ACCOUNT / GS.SETTINGS)

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F09-01 | — | F09.00 `safe` | "NEXT 30 DAYS · … · CHANGE" (`:183-185`) | `SafeHorizonSheet` SHS:115-123 | BD/analysis | T P L; overlay host forced fixed on this screen (`jurnl-f09-authority.css:47-50`) | `computeNextIncomeView` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-02 | — | F09.00 | monogram | → `account` `:175-177` | `.jrn-f09a__account` | I | session initials | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-03 | — | F09.00 | SEE WHY / CHECK A PURCHASE | `:186-188`, `:207-215` | `.jrn-f09a__*` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-04 | — | F09.00 | — | Quick Add / Ask `:218-219` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-05 | — | F09.00.REFERENCE `safe/reference` | SEE WHY / CHECK pill | `:89-150` + Quick Add / Ask | RP | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-06 | — | F09.WHY `safe/why` | CHANGE WHAT'S HELD (`:299-302`) | `HoldSheet` `:325-336` | BD/form | T P L | `protectedAmount`, buffer | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-07 | — | F09.WHY | CONTINUE | CONFIRM THE HOLD, stacked over F09-06 `:337-342` | BD/confirm | T P | `patchSetup`, `patchSettings` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-08 | — | F09.WHY | LEARN MORE | → Ask `:308` | BD | G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-09 | — | F09.WHY | — | Quick Add / Ask `:252-253` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-10 | — | F09.CHECK `safe/check` | type / chips | amount + $25/$50/$100/$250 chips `:184-209` (**`$` hard-coded**) | RP `.jrn-ref__amount-input` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-11 | — | F09.CHECK | SELECT A CATEGORY | `SelectionSheet` `:78-137`, `:240-255` | RS | **not portaled, no focus trap, no Escape**; scrim is a button | static `PURCHASE_CATEGORIES` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-12 | — | F09.CHECK | SELECT ACCOUNT | `SelectionSheet` `:256-271` | RS | same as F09-11 | static `PAY_WITH_ACCOUNTS` (not the user's accounts) | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-13 | — | F09.CHECK | CHECK with no amount | error toast `:159-162` | TO error | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-14 | — | F09.CHECK | — | Quick Add / Ask `:173-175` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-15 | — | F09.ACCOUNT `account` | NEXT / BACK / dots | 3-page folio AcS:149-266 (Pill `:102-110`, Dots tablist `:112-122`) | RP on account plate | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-16 | — | F09.ACCOUNT | CHANGE | → `CurrencySheet` (G04) `:192-195`, `:165` | BD/filter | T P | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-17 | — | F09.ACCOUNT | toggle | ASK JURNL CONTEXT switch `:204-212` (Toggle `:83-90`) | `.jrn-ref__toggle` | `role=switch` | `patchConsent` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-18 | — | F09.ACCOUNT | type / SAVE BUFFER | `MoneyField` `:93-100` (**`$` hard-coded**) + toast `:63-66` | RP, TO | I | `safeToSpendBuffer` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-19 | — | F09.ACCOUNT | PRIVACY & CONSENTS | → `ConsentsSheet` (G05) `:237`, `:166` | BD/form | T P | — | MIGRATED_AND_TESTED | V3 D material + visible switch words |
| F09-20 | — | F09.ACCOUNT | PROFILE, NOTIFICATIONS, SECURITY, CALENDAR PREFERENCES, DATA EXPORT, HELP & SUPPORT, LEGAL | "NOT IN THIS PREVIEW YET" error toast `:67`, `:179`, `:236`, `:238-239`, `:252-254` | TO error | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-21 | — | F09.ACCOUNT | SIGN OUT | direct `signOut` `:255`, **no confirmation** (drawer version `:407` is the same) | RP card | I | session | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-22 | — | F09.ACCOUNT | CONNECTION | → `money/places` `:197` | RP | I | `honestAccountsConnectionLabel` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-23 | — | F09.ACCOUNT | — | Quick Add / Ask `:167-168` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F09-24 | — | F09.RESULT.GOOD / CHECK_IN / OVER `purchases/result/*` | route | `LockedPurchaseResultScreen.tsx:14-20`: a static PNG with text baked into the image | `.jrn-locked-result` (unscoped, `jurnl-f10-checked.css:25`) | none | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F10 PURCHASES

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F10-01 | — | F10.00 `purchases` | ADD / CONSIDER (`:275`, `:311`) | `ConsiderSheet` `:359-370` | BD/form | T P L | `createPurchase` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F10-02 | — | F10.00 | none | empty plinth `:267-270` | FF object | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F10-03 | — | F10.00 | focus item | verdict orbit + line `:276-292` | FF | I | `purchaseAffordability` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F10-04 | — | F10.00 | — | Quick Add / Ask (authority marks) `:244-245` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F10-05 | — | F10.OBJECT `purchases/:id` | LET IT GO | confirmation `:349-354` | BD/confirm | T P | `archivePurchase` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F10-06 | — | F10.OBJECT | DECIDE / I BOUGHT IT | `:343-346` (I BOUGHT IT has **no confirmation**) | `.jrn-btn` | I | `markPurchaseBought` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F10-07 | — | F10.OBJECT | bad id | not found `:329-336` | PN | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F10-08 | — | F10.CHECKED `purchases/checked` | from CHECK / DECIDE | result card (FIT / CHECK_IN / OVER badge, impact) + 2 actions `PurchaseCheckedScreen:101-195` | `.jrn-f10c` light card on terrace plate | I; overlay host forced fixed (`jurnl-f10-checked.css:68`) | `classifyPurchaseCheck` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F10-09 | — | F10.CHECKED | — | Quick Add / Ask `:191-192` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F11 TRIPS

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F11-01 | — | F11.00 `trips` | ADD A DESTINATION / PLAN ANOTHER | `TripEditSheet` `:406-419` | BD/form | T P L | `createTrip` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F11-02 | — | F11.00 | none | route "NOT SET" `:292-323` | FF route | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F11-03 | — | F11.00 | — | Quick Add / Ask `:283-284` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F11-04 | — | F11.TRIP `trips/:id` | FUND THE TRIP | `FundingSheet` `:421-433` | BD/form | T P | `updateTrip` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F11-05 | — | F11.TRIP | CANCEL | confirmation `:396-401` | BD/confirm | T P | `archiveTrip` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F11-06 | — | F11.TRIP | MARK COMPLETE | **no confirmation** `:388-390` | `.jrn-btn` | I | `completeTrip` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F11-07 | — | F11.TRIP | bad id | not found `:366-373` | PN | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F12 CREDIT

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F12-01 | — | F12.00 `credit` | HOW MUCH IS USED (`:147-150`) | `UtilizationSheet` `:223-242` | BD/analysis | T P L | `overallUtilization` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-02 | — | F12.00 | ADD A CARD OR LOAN | `AddCardSheet` `:244-259` | BD/form | T P | `createManualAccount` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-03 | — | F12.00 | none | empty copy `:109-114`, `:131` | RA | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-04 | — | F12.00 | — | Quick Add / Ask `:80-81` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-05 | — | F12.ACCOUNT `credit/:id` | PLAN A PAYMENT | `CardPlanSheet` CS:57-134 | BD/analysis | T P | `creditGuidance` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-06 | — | F12.ACCOUNT | SET MONEY ASIDE | → `SetAsideSheet` CS:76-81 | BD/form | T P | reservations | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-07 | — | F12.ACCOUNT | CHANGE PAYMENT ACCOUNT | PAY FROM short drawer CS:82-87 | BD/form/short | T P | `upsertCreditTerms` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-08 | — | F12.ACCOUNT | RECORD PAYMENT | `CardPaymentSheet` CS:136-182 (duplicate override) | BD/form | T P | `recordTransfer` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-09 | — | F12.ACCOUNT | CARD TERMS | `CardTermsSheet` CS:184-252 (12 fields + validation) | BD/form | T P, A | `upsertCreditTerms`, `setAccountBalance` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-10 | — | F12.ACCOUNT | NOT FINISHED | `OpenTransfersPanel` → `TransferDetailSheet` `:209`, `:218` | PN, BD | T P | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-11 | — | F12.ACCOUNT | data | payment-safety signal panel `:203` | PN signal | I | `paymentSafety` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-12 | — | F12.ACCOUNT | not a card | panel `:183-190` | PN | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F12-13 | — | F12.* | payment saved | toast CS:168 | TO | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F13 PAYDOWN

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F13-01 | — | F13.00 `paydown` | SET / CHANGE THE PLAN | `ChangePathSheet` `:159-174` (ad-hoc strategy chips) | BD/form | T P L | `upsertPaydownPlan` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F13-02 | — | F13.00 | no debt | empty + ADD A CARD OR LOAN `:82-93` | FF stair | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F13-03 | — | F13.00 | partial | notice `:120` | FF | A | `simulatePaydownProjection` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F13-04 | — | F13.00 | — | Quick Add / Ask `:72-73` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F13-05 | — | F13.WHAT_IF `paydown/what-if` | type / KEEP | TRY EXTRA input + KEEP THIS PATH `:146`, `:153` | `.jrn-field` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F14 GOALS

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F14-01 | — | F14.00 `goals` | NAME A GOAL | `NameGoalSheet` `:142-153` | BD/form | T P L | `createGoal` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F14-02 | — | F14.00 | none | copy `:64-65` | FF spread | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F14-03 | — | F14.00 | — | Quick Add / Ask `:55-56` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F14-04 | — | F14.GOAL `goals/:id` | SET MONEY ASIDE | goal `SetAsideSheet` `:169-177` | BD/form | T P | `setGoalAside` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F14-05 | — | F14.GOAL | EDIT | `EditGoalSheet` `:155-167` | BD/form | T P | `updateGoal` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F14-06 | — | F14.GOAL | LET IT GO | confirmation `:132-137` | BD/confirm | T P | `archiveGoal` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F14-07 | — | F14.GOAL | bad id | not found `:102-109` | PN | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F15 AHEAD

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F15-01 | — | F15.00 `ahead` | shortfall | warning banner `:95-99` | `.jrn-hz__risk` | A | `projectAhead` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F15-02 | — | F15.00 | thin / none | empty window `:77`, `:127-131` | FF horizon | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F15-03 | — | F15.00 | TRY ANOTHER PATH | → `ahead/base` `:137` | `.jrn-btn` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F15-04 | — | F15.00 | — | Quick Add / Ask `:69-70` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F15-05 | — | F15.BRANCH `ahead/:id` | LET THIS BRANCH GO | `:160` | `.jrn-btn` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## F16 RECORDS

| # | DOT | SCREEN | TRIGGER | COMPONENT | APPEARANCE | BEHAVIOR | DATA | STATUS | NOTE |
|---|---|---|---|---|---|---|---|---|---|
| F16-01 | — | F16.00 `records` | type | FIND A RECORD (search) `JurnlInput` `:96` | `.jrn-field` | I | `listRecords(query)` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F16-02 | — | F16.00 | no match | NO RECORDS MATCH `:102-106` | FF | A | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F16-03 | — | F16.00 | none | NO RECORDS YET `:89-90` | FF index | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F16-04 | — | F16.00 | ADD A RECORD | `AddRecordSheet` `:181-197` (ad-hoc kind chips) | BD/form | T P L | `createRecord` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F16-05 | — | F16.00 | — | Quick Add / Ask `:68-69` | TS / BD | G06 / G07 | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F16-06 | — | F16.DOCUMENT `records/:id` | LINK RECORD | link drawer `:164-170` | BD/form | T P | `updateRecord` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F16-07 | — | F16.DOCUMENT | REMOVE | confirmation `:171-176` | BD/confirm | T P | `archiveRecord` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F16-08 | — | F16.DOCUMENT | UNLINK | **no confirmation** `:161` | `.jrn-btn` | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| F16-09 | — | F16.DOCUMENT | bad id | not found `:138-145` | PN | I | — | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

## Review board (no family)

| # | SCREEN | COMPONENT | APPEARANCE | Notes | STATUS | NOTE |
|---|---|---|---|---|---|---|
| B-01 | `parents` | status buttons + family buttons, `ParentScreens.tsx:94-144` | bone field, `jrn-btn--utility` / `approval` | sessionStorage `jurnl.parentReview` | DEFERRED_AUTHORITY_MISSING | phase 4–5 |
| B-02 | **unrouted** | `ParentAuthorityScreen` `ParentScreens.tsx:41-92` (BOARD, gear, ask, disabled "NOT OPEN YET", discovery links, Quick Add / Ask) | review rail | dead code | DEFERRED_AUTHORITY_MISSING | phase 4–5 |

