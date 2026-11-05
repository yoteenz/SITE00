# 05 · Menu regression root causes

Evidence: VERIFIED_HISTORICAL_CODE (SHAs below) and VERIFIED_CURRENT_CODE (`4ddbac6ce`). Lineage is in 03 and 03a.

**No capability was deleted.** Every earlier settings destination still exists. The losses are in *where* the capabilities are reached, plus one removed
disclosure.

## RC-1: the V3 menu put the ACCOUNT drawer one level deeper, behind an unrelated label

| Field | Value |
|---|---|
| Last known good | V4 `653fb65a5` (2026-10-07) → V5b `edb37eca4` (2026-10-08). The hamburger `f09-menu` opened `AccountDrawer` directly, showing DISPLAY CURRENCY, CONNECTION · SET UP, ASK JURNL CONTEXT, SAFE TO SPEND BUFFER, PRIVACY & CONSENTS and SIGN OUT. Still the behaviour on `c56691ecb`, `7752eae2f` and `main` `e413590e1`. |
| Founder rule | motherboard `MEMORY.md` (~line 15100 at `4ddbac6ce`): "Hamburger opens the account drawer; ACCOUNT opens the page … Do not send the hamburger to `go('account')`". The F09 drawer reference `JURNL/F09_SAFE/AUTHORITIES/F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg` and REFERENCE_REPLICA1 06 carry role **APPROVED** (`REPLICA_MANIFEST.json`). |
| First change | V6 `3fac5e546` (2026-11-04 18:54, branch `claude/jurnl-global-interactive-v3-um0u93`, this agent's V3 sprint), merged to the tunnel by `d6992b3fc`. `f09-menu` now opens `GlobalMenu`. |
| Current behaviour | `GlobalMenu` rows: ACCOUNT & PROFILE · PREFERENCES · PRIVACY & DATA · MY MEMBERSHIP · EXPLORE ADD-ONS · HELP & SUPPORT · SIGN OUT. The drawer opens only from **PREFERENCES** (`JurnlCornerChrome.tsx:51`); it is the drawer's only opener. |
| Broken navigation | (a) Four capabilities are no longer named on the first surface: CURRENCY, CONNECTION, ASK JURNL CONTEXT, SAFE TO SPEND BUFFER. (b) PREFERENCES does not describe a financial safeguard or a bank connection. (c) Closing the drawer clears all panels; it does not return to the menu (PRIVACY, MEMBERSHIP and ADD-ONS do return). |
| Missing component / state | none: the components are intact (the drawer changed by 23 lines at `3fac5e546`) |
| Feature flag | none |
| Route mismatch | none (panel state, not routes) |
| Kind | **presentation and navigation omission** |
| Functionality elsewhere | yes: drawer and ACCOUNT page 1 |
| Severity | **HIGH**. Founder-visible: "the menu appears to have lost established capabilities". The financial safeguard (buffer) and the connection status lose discoverability. |
| Smallest safe restoration | Keep `GlobalMenu` (V3 / board-08 work is valid newer work). **Add rows**: CONNECTED ACCOUNTS & SYNC, CURRENCY & EXCHANGE, SAFE TO SPEND BUFFER (YOUR FINANCES), ASK JURNL (YOUR INTELLIGENCE). Each opens the **existing** drawer card, sheet or route; no duplicate pages. Rename PREFERENCES → keep it as the AccountDrawer opener only if the founder wants the approved F09 drawer kept as a whole (FD-01). Do **not** revert to V5b. |

Confirmed regressions under RC-1:

| Id | Capability | Before | After |
|---|---|---|---|
| MR-1 | DISPLAY CURRENCY | 1 tap | 2 |
| MR-2 | CONNECTION | 1 | 2 |
| MR-3 | ASK JURNL CONTEXT | 1 | 2 |
| MR-4 | SAFE TO SPEND BUFFER | 1 | 2 |

## RC-2: the exchange-rate disclosure was removed

| Field | Value |
|---|---|
| Last known good | `d2915e32d` (2026-10-05) "fix(jurnl): convert display amounts from canonical USD". The AskSheet currency selector (`runtime/screens/HomeScreens.tsx:302-308`) showed `fx.error` and `fx.disclosure`: "RATE UPDATED … · USD x CODE" and "JURNL CONVERTS DISPLAYED AMOUNTS USING THE LATEST AVAILABLE EXCHANGE RATE. ORIGINAL VALUES STAY PRESERVED." |
| First change | `4c1d19378` (2026-10-05, Wave 1): the selector moved to Settings, without the disclosure or the error line |
| Current | `CurrencySheet` (`SettingsScreens.tsx:8-33`) lists currencies only and closes silently on failure (`:21-24`). `useExchangeState` / `disclosure` are exported (`data/home/money.ts:24,27`), but no runtime surface reads them. The exchange contract (`JURNL/MANIFEST/JURNL_EXCHANGE_RATE_CONTRACT.json`) still specifies the disclosure. |
| Kind | presentation omission; the data dependency survives |
| Severity | MEDIUM (converted amounts shown with no rate or as-of) |
| Smallest safe restoration | render `disclosure` and `lastError` in `CurrencySheet` |

Confirmed regression: **MR-5**.

## Not regressions (never existed, or not reduced)

* **Bank linking / Plaid.** It never existed: `git log --all -S Plaid -- src/projects/jurnl` is empty. CONNECTION was always a label to `money/places`
  plus the F02 preview. Status: REQUIRED_NOT_DESIGNED → 08.
* **Ask JURNL conversation.** It never existed (explanation-only since `4c1d19378` / `435abbeb8`). The regression is only its entry point (MR-3).
* **HELP & SUPPORT, DATA EXPORT, LEGAL, NOTIFICATIONS, SECURITY, CALENDAR.** Placeholders since `435abbeb8`. The V3 menu exposes HELP at one tap now, which is an improvement in reach but still a placeholder.
* **PRIVACY & CONSENTS.** Still 1 tap (renamed PRIVACY & DATA).
* **MY MEMBERSHIP / EXPLORE ADD-ONS.** New in V6.

## Defects found while tracing (not regressions; each has evidence)

| Id | Defect | Evidence |
|---|---|---|
| D-01 | ASK JURNL CONTEXT toggle-off can be undone by the AI-device sync; the gate also accepts AI_NATURAL_LANGUAGE alone | `AccountScreens.tsx:54-60`; `repository/consentSync.ts:21-22`; `askJurnl.ts:39` |
| D-02 | Buffer entered in the display currency, applied as USD | `AccountScreens.tsx:388,401`; `safeToSpend.ts:144-147`; `:107` hard-coded `$` |
| D-03 | Sign out: no confirm, the surface stays open, no redirect (all 3 entries) | `store.tsx:209-213`; `GlobalMenu.tsx:95`; `AccountScreens.tsx:266,418` |
| D-04 | UnlockFolio `unlock-feature` is a no-op button; MANAGE MEMBERSHIP has no handler | `GlobalMenu.tsx:211,158` |
| D-05 | F01.11 export request shows "WE'LL SEND YOUR DATA TO YOUR EMAIL SOON." with no backend | `SecurityScreens.tsx:346-348`; `data/f01/copy.ts:313` |
| D-06 | The setup consents are persisted but have no runtime consumer | `consentSync.ts:7-12`; grep finds no reader |
| D-07 | The two currency stores can disagree (Ask context vs `formatMoney`) | `askJurnl.ts:33`; `currency.ts` |
| D-08 | ACCOUNT page shows the dock with HOME active | `AccountScreens.tsx:175` |

## Hidden capabilities (IMPLEMENTED_BUT_HIDDEN)

* **F01.11 PRIVACY PRIMER** (`/entry/privacy`): AI access, export request, delete account, revoke, disable AI.
* **F01.12 SECURITY PRIMER** (`/entry/security`): biometric, device trust, session revoke.

The corner chrome is hidden on `entry*` (`JurnlCornerChrome.tsx:72`), and no settings surface links to either primer, so neither is reachable after onboarding. The smallest
restoration is to link PRIVACY & CONSENTS → F01.11 tools and SECURITY → F01.12 from the ACCOUNT page and the menu, reusing the existing screens.
