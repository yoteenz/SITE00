# 06 · Tests and validation

All runs: 2026-11-05, Chromium (Playwright), production build served by `vite preview`. Exchange rates in E2E come from a route stub;
no live provider is called.

| Check | Result |
|---|---|
| Typecheck (`tsc --noEmit`) | 2 errors, both pre-existing and identical on base `4ddbac6ce` (`Dot01Frame.tsx:549`, `f05MotionLayout.ts:132`, files this branch does not touch). 0 new |
| Production build (`vite build` + `verify-production-dist`) | PASS (471 JS assets checked) |
| JURNL unit (`vitest`, all 52 `tests/jurnl*` files) | **894 / 894 PASS** |
| New unit `tests/jurnlGlobalMenuRecovery.test.tsx` | 26 / 26: buffer B1–B8, consent C1–C5, export E1, menu N1–N4, honest destinations H1–H5, assets A1–A3 |
| E2E, 11 suites × mobile 393×852 / tablet 834×1194 / desktop 1440×900 | **198 / 198 PASS** (clean rerun). The first run had 3 R3 failures caused by the test's own selector, which also matched the sheet's close button; the selector was fixed and the test was not weakened |
| New E2E `jurnl-global-menu-recovery.e2e.ts` | R1–R9 on 3 projects, plus S1 at 360×640 and 393×660 |
| E2E `jurnl-editorial-overlays.e2e.ts` (small 360×780) | 8 / 9. **B1 SEARCH fails identically on base `4ddbac6ce`**: Cursor's `mergeMoneySearchParams` appends `?parent=motion&c=accounts`, and the test expects a bare URL. Pre-existing, not introduced here |
| iOS Safari | **UNVERIFIED** (no WebKit device in this environment) |

Suites in the 198: global-menu-recovery, global-interactive-v3, global-systems, golden-journey, entry-setup, a11y-core (axe),
family-reachability, persistence, production-hardening, core-mutations, product-utility-journeys.

## Existing tests changed (contract updates, not weakening)

* `tests/jurnlGlobalInteractiveV3.test.tsx` M2: the four V3 groups became three sections. It now asserts all 15 section and row
  labels and all 13 triggers, where before it checked 10 labels and 8 triggers.
* `e2e/jurnl-global-interactive-v3.e2e.ts`:
  * G1: section names.
  * G2: PREFERENCES now opens the preferences folio and must not open the account drawer. ACCOUNT & PROFILE opens the approved
    drawer, then the page, with no overlay left behind. The PRIVACY & CONSENTS check adds the ASK JURNL CONTEXT switch.
* `e2e/jurnl-editorial-overlays.e2e.ts` B4: the classical head is the OV08 shell. The test asserts the shell image is visible and
  takes no taps, and that the headline is live.

## Runtime measurements (after; `capture_menu_destinations.ts` and `capture_editorial_overlays.ts`)

* **Page scroll.** 0 page-scroll violations on any captured overlay or destination at 393×852, 393×660, 360×640, 430×932, 820×1180
  and 1440×900.
* **Menu.** All 12 rows present at every size. The olive field is the only scroll container; it scrolls on short phones, and every
  row, SIGN OUT included, is reachable inside it with a tap target of at least 44 px (E2E S1).
* **Unreachable menu actions.** 0.
