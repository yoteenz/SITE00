# 06 · FUNCTIONAL REGRESSION RESULTS

All runs were on this branch against the dev server on :5174. The BEFORE head is **9fc523fdd**, the head of #1723; it ran in a separate worktree on :5175. Every E2E run stubs the exchange-rate provider, so no live service is called.

## Summary

| Check | Result |
|---|---|
| Typecheck (`tsc --noEmit`) | **clean** (exit 0) |
| Build (`npm run build`) | **pass**: `verify-production-dist: OK (471 JS assets)`. The four WebPs are emitted as hashed files (57–64 KB each). Not deployed. |
| Unit, JURNL (`tests/jurnl*`) | **957 / 957** in 56 files: the 948 from OPUS4, plus `jurnlUtilityIconFamilyOpus1.test.tsx` (9) |
| Unit, whole repository (900 files) | 11,551 passed, 92 failed, 2 skipped. **All 92 are outside JURNL and pre-existing** (below) |
| OPUS1 browser spec `jurnl-utility-icons-opus1.e2e.ts` | **54 / 54**: mobile 18, tablet 18, desktop 18 |
| `mobile` 393×852: menu recovery, OPUS4 motion, interactive V3 (47 tests) | **47 / 47** on the branch; 47 / 47 on BEFORE |
| `small` 360×780: editorial overlays, motion pilot, carousel (44 tests) | branch 29 passed, 14 failed, 1 skipped; BEFORE 30 / 13 / 1. **13 fail identically on both heads**, and 1 is a flake on both heads |
| `tablet` and `desktop`: menu recovery, OPUS4 motion, V3, editorial (112 tests) | 96 passed, 4 failed, 12 skipped. **All 4 are pre-existing or flaky on both heads** |
| **New regressions** | **0** |
| MONEY financial behaviour | Unchanged. No financial, routing, storage or data code was edited. ADD A POCKET and MOVE MONEY still save through their own flows (editorial A2 / A3, small project). |

## What the OPUS1 browser spec proves (per project)

| Test | Proves |
|---|---|
| U1 | SEARCH, ADD and MENU each wear their artwork once. The artwork is decoded, has `alt=""` and `aria-hidden`, has no pointer events, and has no line glyph. The button has no border, background, background image or shadow, and keeps its 12 px square-rounded hit area. Names and trigger ids are kept, and each control is rendered once. Order is SEARCH, ADD, MENU on one row, with one disc size and no overlap. |
| U2 | Touch targets are 44 tall. The chips fill the approved pitch without overlapping, and the hamburger is at least 38 wide. |
| U3 | SEARCH opens SEARCH. Its close wears the CLOSE artwork, is at least 44 × 44, and closes the overlay. Escape closes it. Focus returns to SEARCH. |
| U4 | ADD opens the MONEY ACTION SHEET; ADD A POCKET and MOVE MONEY open from it. Each close wears the CLOSE artwork once, is at least 44 × 44, and closes. Focus returns to ADD. No page scroll. |
| U5 | MENU opens the global menu, with `aria-expanded` set while it is open. CLOSE MENU wears the CLOSE artwork and closes. Escape closes. Focus returns to MENU. |
| U6 | BUFFER and PRIVACY close on the CLOSE artwork, at least 44 × 44, on screen. |
| U7 | Tab reaches the controls and shows a visible focus ring (the chips keep their 5 px gold ring; MENU has a solid ring of at least 2 px). Enter and Space activate. No control is disabled. |
| U8 | Pressing gives a scale of 0.955 while held and 1 after release. Sliding off before release opens nothing. The artwork has no idle animation. |
| U9 | After leaving MONEY, other hubs render one hamburger with the line glyph, and no utility artwork remains. |
| R1 | With reduced motion: transition 0 s, no compression on press, and the control still opens its sheet. |
| V ×6 | At 360×640, 393×660, 393×852, 430×932, 820×1180 and 1440×900: the three controls are on screen and loaded, with one disc size and no overlap; no page scroll; the SEARCH close is on screen at 44 × 44 or more. |
| T ×2 | At 820×1180 and 834×1194 with the menu open, the CLOSE is a full target and is never covered; the hamburger steps aside only while they overlap, and comes back focused. |

## Existing tests updated, none weakened

Each change replaces an exact list with the same exact list **plus the CLOSE artwork exactly once**. A duplicate, a missing shell or a stray image still fails.

| Test | Before | Now |
|---|---|---|
| `tests/jurnlCleanArtworkOpus3.test.tsx` D1 (BUFFER, PRIVACY sources) | the shell's asset ids | the same ids plus `F05.UTILITY.CLOSE.GOLD` |
| `tests/jurnlCleanArtworkOpus3.test.tsx` D3 (SEARCH, MENU sources) | `['OV05_SEARCH_SHELL']`, `['OV08_MENU_ENVIRONMENT']` | each plus `F05.UTILITY.CLOSE.GOLD` |
| `e2e/jurnl/jurnl-global-menu-recovery.e2e.ts` C0 / C4 / C20 (SEARCH) | `img` count 1 | the image ids are exactly `['F05.UTILITY.CLOSE.GOLD', 'OV05_SEARCH_SHELL']` |
| `e2e/jurnl/jurnl-global-menu-recovery.e2e.ts` C6 (BUFFER) | four CH01 ids | the four plus `F05.UTILITY.CLOSE.GOLD` |
| `e2e/jurnl/jurnl-global-menu-recovery.e2e.ts` C7 (PRIVACY) | three CH02 ids | the three plus `F05.UTILITY.CLOSE.GOLD` |

## Pre-existing failures (reported separately)

### E2E

| Test | Project | Cause, same on both heads |
|---|---|---|
| editorial B1 (SEARCH → result URL) | small, tablet, desktop | Navigation keeps `?parent=motion&c=accounts`, and the test anchors the URL with `$` (OPUS4 category "URL with query"). |
| carousel 01, 11, 24 (`papers: 6`), 25 (`f05m-place-cash right 515 > 360.5`), both 26, the short drag; motion pilot 4 and 15–18 | small | The accounts rail. These tests expect four fixed papers (OPUS4 category "Accounts rail"). |
| motion pilot 8 / 9 / 13 / 19 / 20, route frames, 14 (reduced motion) | small | Timeout after the URL with query (OPUS4). |
| editorial A2 (ADD A POCKET grid: 3 columns, expected 2) | tablet, desktop | Fails on BEFORE at tablet and desktop. The wider plate fits three columns. The branch passed it once at tablet. |
| menu recovery C6 (BUFFER with the keyboard, `buffer-back` below the plate) | tablet, desktop | Flaky on both heads after the viewport resize: repeated ×3 on each project, branch 1 / 6 failed, BEFORE 2 / 6 failed. |
| carousel 07–10 ("dock identical") | small | Flaky on both heads under 3 workers: repeated ×6, branch 1 / 6, BEFORE 1 / 6. It passes 4 / 4 with 1 worker. The dock contains none of the changed controls. |

### Unit (whole repository)

All 92 failing tests are in 59 files outside JURNL. None of them references JURNL, and the diff touches none of `api/`, `shared/`, `src/site00` or `tests/visualReconstruction*`.

- **90** fail on BEFORE too. Examples: Brand Lore needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; `visualReconstruction*`, `site00ExpressionEngine*`, `ndx*` and `founderCreativeIngestion*` fail with the same messages.
- `P0.VR.1D.2 … explicit fixture fallback` fails on any full checkout. It expects fixture substitution, but the tracked canonical boards `visual-references/founder/ndxbook/*-mood-board.png` exist, so the resolver returns them. It passed on BEFORE only because the BEFORE worktree is a sparse checkout without `visual-references/`.
- `projects?action=index … four canonical founder projects` compares the registry's slugs with the index (4 versus 5). It was skipped on BEFORE because its file failed earlier, and none of its code is touched.

## Logs

The evidence ZIP holds the raw Playwright and vitest output under `TESTS/`: line and JSON reports for both heads, the repeat runs, and the per-test failure messages.
