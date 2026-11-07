# 06 · TEST RESULTS

All runs were on this branch against the dev server on :5174. The base is the OPUS1 head **97fbdaeb4** (draft PR #1724), run from a separate worktree on :5175. Exchange rates are stubbed in every E2E run.

## Summary

| Check | Result |
|---|---|
| Typecheck (`tsc --noEmit`) | **clean** |
| Build (`npm run build`) | **pass**: `verify-production-dist: OK (471 JS assets)`. 34 art files are emitted; the 4 under 4 KB are inlined. Not deployed. |
| Unit, JURNL (`vitest run tests/jurnl`) | **966 / 966** in 57 files: 957 from OPUS1, plus `jurnlOverlayMicroAssetsOpus5.test.tsx` (9) |
| OPUS5 browser spec `jurnl-overlay-micro-assets-opus5.e2e.ts` | **45 / 45** on mobile, tablet and desktop (15 each) |
| `mobile` 393×852: menu recovery, OPUS4 motion, interactive V3, OPUS1 utility icons, global systems (Quick Add) — 73 tests | **73 / 73** after the assertion updates below (menu recovery rerun 18 / 18); base 73 / 73 |
| `small` 360×780: editorial overlays, pockets (rename / delete), motion pilot, carousel, DOT 01 — 88 tests | branch 60 passed, 27 failed, 1 skipped; base 58 passed, 29 failed, 1 skipped. **26 fail on both heads**; 1 branch-only and 3 base-only failures are environment flakes (below) |
| **New functional, financial or privacy regressions** | **0** |

## What the OPUS5 tests prove

**Unit, `tests/jurnlOverlayMicroAssetsOpus5.test.tsx`:**
- **R1:** the 59 masters and 3 candidates match the handoff manifest and `SHA256SUMS.txt`.
- **R2:** each of the 38 runtime copies is registered with its source and runtime hash.
- **R3:** held, unfit, superseded, blocked, comparison and candidate files never reach the runtime, and no master is imported directly.
- **C1:** the art is decorative.
- **C2:** the art switch has role switch and aria-checked; the track follows the value; there is one thumb.
- **C3:** the CSS is scoped to `.jrn`; no circle or background is added; transitions run only with motion allowed.
- **P1:** PRIVACY has eight row icons and two art switches, no CSS switch is left, and the statements carry no switch.
- **P2:** MENU has 12 destinations in three sections, 11 art icons with BUFFER held, and one chevron per row.
- **P3:** F09 and OV07 carry no GROK2 art.

**E2E, `e2e/jurnl/jurnl-overlay-micro-assets-opus5.e2e.ts`, on every project:**
- **P1:** PRIVACY's art, with no line glyph and no CSS switch left.
- **P2:** tap, Space and reload agree, and OFF stays OFF.
- **M1:** the menu art, BUFFER held, rows open and return, the BUFFER (i).
- **A1:** MONEY ACTION chevrons, then ADD A POCKET's type art, check disc and papers. The selected-state ink works, and a pocket still saves.
- **A2:** MOVE MONEY marks and papers, and Escape returns focus.
- **A3:** SEARCH's magnifier inside the field, the POCKETS bank and the result marks.
- **A4:** MANAGE POCKET's pencil, trash and chevrons on the existing papers, and RENAME still opens.
- **A5:** F09 and OV07 carry no GROK2 art.
- **R1:** reduced motion.
- **V ×6:** responsive.

## Existing tests updated, none weakened

Each update keeps the previous exact list of shells and papers. It adds an exact expectation for the GROK2 art: a named asset per slot, a fixed count, or counts that must equal the number of rows. A duplicate, a missing art or a stray image still fails.

| Test | Change |
|---|---|
| `tests/jurnlCleanArtworkOpus3.test.tsx` D1 | Shells and papers are still unique and exact. **+** BUFFER: exactly `GROK2.B06-INFO`. **+** PRIVACY: the exact 16 GROK2 ids, plus one asset per slot. |
| `tests/jurnlCleanArtworkOpus3.test.tsx` D3 | SEARCH and MENU art layers unchanged. **+** the field and POCKETS marks once each. **+** 11 unique menu icons and 12 chevrons. |
| `e2e/jurnl/jurnl-global-menu-recovery.e2e.ts` C0 / C4 / C20 | The art list is unchanged. **+** the field and POCKETS marks once, and one mark per result row. |
| `e2e/jurnl/jurnl-global-menu-recovery.e2e.ts` C5 | The objectFit check now targets the paper image (`img.jsp-paper__art`), because a button now holds the paper, the icon and the chevron. |
| `e2e/jurnl/jurnl-global-menu-recovery.e2e.ts` C6 | The papers are unchanged. **+** exactly `GROK2.B06-INFO`. |
| `e2e/jurnl/jurnl-global-menu-recovery.e2e.ts` C7 | The papers are unchanged. **+** the exact GROK2 list, plus two tracks. |

## Pre-existing failures (reported separately)

These **26 fail on both heads**. They are the same categories recorded in OPUS4: URLs carrying a query, the accounts rail, and timeouts or crashes under load.

| Spec | Tests |
|---|---|
| editorial overlays | B1 (SEARCH → result URL) |
| carousel | 01, 11, 24, 25, both 26, the short drag |
| DOT 01 | 02–05, VIEW ALL → back, dock placement, chips, axe, responsive, reduced motion |
| motion pilot | 4, 8 / 9 / 13 / 19 / 20, 15–18, route frames, 14 |
| pockets | T01 ×2, T04, T06, T13 / T15 / T17, T14 |

**Branch-only: pockets T07 / T08 / T09 (rename persists after reload).** It fails with `page.goto: Page crashed` on its fourth full navigation. Repeated with one worker:
- branch: 1 / 3, then 3 / 6 failed;
- base: 0 / 3, then **5 / 6 failed** (3 timeouts and 2 `Page crashed`), while the container was short of memory (the run ended with exit 137 and a worker restart).

The failure is environmental on both heads. Its rename, persistence and reader assertions passed whenever the page did not crash.

**Base-only:** editorial A2, carousel 07–10 and DOT 01 typography. They pass on the branch and are flakes recorded on both heads in OPUS1 / OPUS4.

Logs, JSON reports and the repeat runs are in the full evidence ZIP under `TESTS/`.
