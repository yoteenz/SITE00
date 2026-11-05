# 01 · Executive findings

Sprint: P0.JURNL.GLOBAL-MENU.CONNECTED-ACCOUNTS-AND-FINANCIAL-INTELLIGENCE.UI-COVERAGE-REGRESSION-AUDIT.OPUS1. Audit only.

* Inspected: `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ `4ddbac6ced7fd43213d22ffd6d26524336ee37aa` (PR #1714, current JURNL integration tip).
* Live preview: LIVE_RUNTIME_UNVERIFIED.

## Gap B: the menu did not lose code. It lost the first-surface reach of four established capabilities.

* **10 historical menu versions** were recovered (V0 `4c1d19378` → V6c `1ef7535d6`; table in 03a).
* From 2026-10-07 (`653fb65a5`) the hamburger opened the founder-**APPROVED** F09 ACCOUNT drawer:
  DISPLAY CURRENCY · CONNECTION · ASK JURNL CONTEXT · SAFE TO SPEND BUFFER · PRIVACY & CONSENTS · SIGN OUT. `main` still does.
* On 2026-11-04 `3fac5e546` (the V3 global menu, never founder-approved) made the hamburger open a new 7-row menu, and put the whole drawer behind
  **PREFERENCES**. A safeguard and a bank-connection status now sit under a label that describes neither (root cause RC-1).
* **5 confirmed regressions**:
  * MR-1…4: currency, connection, Ask context and buffer moved from 1 tap to 2, under an unrelated label.
  * MR-5: the exchange-rate disclosure (rate and update time) was removed by `4c1d19378` (root cause RC-2).
* **Nothing was deleted.** All destinations survive.
* **12 hidden or moved capabilities**:
  * 4 behind PREFERENCES.
  * 8 implemented in onboarding F01.11 / F01.12 but unreachable after it: AI access, export request, delete account, revoke, disable AI, biometric, device trust, session revoke.
* **10 placeholder destinations**:
  * HELP & SUPPORT (menu and page), PROFILE, NOTIFICATIONS, SECURITY, CALENDAR, DATA EXPORT, LEGAL.
  * MANAGE MEMBERSHIP.
  * The UNLOCK no-op.
* **One misleading confirmation:** F01.11 export says "WE'LL SEND YOUR DATA" with no backend.

## Status of the named capabilities

| Capability | Status |
|---|---|
| Currency & exchange | **ACTIVE_BUT_PARTIAL, HIDDEN.** Live USD-based conversion (open.er-api.com, 24 h fresh / 7 d cache, honest USD fallback). Disclosure lost (MR-5); silent failure. No converter ever existed. FX execution is not offered and must not be implied. |
| Safe to Spend buffer | **ACTIVE_AND_FUNCTIONAL** in the calculation (`safeToSpend.ts:328-329`). **HIDDEN** in the menu. **Defect:** entered in the display currency, applied as USD. |
| Privacy & consents | **ACTIVE_BUT_PARTIAL.** 3 of 9 versioned consents shown; no runtime consumer; strongest tools hidden in F01.11. |
| Ask JURNL | **PRESENT_BUT_PLACEHOLDER** (explanation-only, by design; never conversational). The context toggle has an OFF defect. Its entry was lost from the menu. |
| Connected banking | **SIMULATED.** No provider has ever existed (`git log -S Plaid` empty). `JURNL_BANK_CONNECTION_PROVIDER = PROVIDER_UNAVAILABLE`. The F02 preview patch labels itself "PREVIEW ONLY — NO LIVE BANK LINK". |
| Membership / add-ons | **ACTIVE** (read-only) / **PARTIAL** (dead unlock button). |
| Help & support | **PLACEHOLDER.** |
| Sign out | **ACTIVE_BUT_PARTIAL** (no confirm, no redirect). |

## Gap A: connected banking is fully specified here, with no artwork generated

**30 slots → 34 states → 14 compositions** (08, 09).
* **9** reuse approved or review-stage DOT 01 / board compositions with live content (22 EMPTY, 21, 32, 30 + 29, 33 + 23, SK03 seal, 12 + 35, 36 / board 07, 25).
* **5** need new compositions:
  * institution discovery;
  * the secure handoff (the provider screen itself is PROVIDER_HOSTED and never drawn);
  * processing / first sync;
  * the imported-history coverage timeline;
  * connected accounts & sync.
* These are drawn as **7 authority screens**, with two state variants: first-sync progress and needs-attention.

Further coverage:
* 16 automatic-import states (11).
* 25 intelligence states (12, 13, 18), mapped to the Financial Intelligence Foundation Audit (PR #1715, `5aeeee0a4`).
* The business-fuel case is a full UI flow (13).

## Visual production plan (not executed)

* **Screen authorities:** 28 new (23 compositions + 5 state variants) in **7 four-up batches** (22).
* **Reuse:** 37 existing authorities or assets (21).
* **Shells and art:** 11 new inner-shell candidates and 4 independent-art candidates (23).
* **SIDEKICKs:** none new for connectivity (SK01/02/03 suffice). One optional candidate (SK04 intelligence study) is a founder decision.
* **Inventory:** 107 screens and states (20).

## Notable conflict

This agent's own branch `c34ef288f` (not on the tunnel tip) re-skinned the APPROVED F09 drawer with pending board-06 imagery and re-pointed a replica
test. It must not merge without founder decision FD-12.

## Boundaries kept

| Item | Result |
|---|---|
| Application code modified | NO |
| Bank connections | 0 |
| Provider API calls | 0 |
| Generations | 0 |
| Paid credits | 0 |
| Database mutations | 0 |
| Deploy / merge | none |
