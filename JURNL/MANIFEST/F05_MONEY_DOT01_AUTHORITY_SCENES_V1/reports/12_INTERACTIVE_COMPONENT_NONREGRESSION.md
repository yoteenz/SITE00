# 12 · Interactive component non-regression

**F05 + financial E2E** (7 suites × 4 projects: small 360×780 · mobile 393×852 · tablet 834×1194 · desktop 1440×900, production build via `vite preview`, 2 workers): **376 passed · 0 failed · 0 flaky · 8 skipped**. The 8 skips are the suites' own per-project conditions (tablet frame captures, touch vs mouse drag, the five-size responsive test run once on `small`), unchanged from earlier sprints.

| Surface | Covered by (E2E, every project) | Result |
|---|---|---|
| JURNL_SELECT (category, account, filter) | dot01 `18 · cash spending…`, `19 · a card purchase…`, `07 / 31 · history search and filters…`, `31 · narrowed to one account` | pass |
| DATE_PICKER | dot01 `16–20 entries`, `24 / 37 · a correction shows original vs revised…` | pass |
| POPOVER / listbox layer | dot01 `overlays trap focus, close on Escape, return focus…`; pockets `T19 · Shift + F10…` | pass |
| CONTEXT_MENU (MANAGE POCKET) | pockets `T01–T06` (hold on ALL ACCOUNTS, MONEY parent and the Pocket page balance; the chip) | pass |
| CONFIRMATION_DIALOG | pockets `T11 / T12 · delete asks first`, `T14`, `T13 / T15 / T17`; dot01 `36 · archiving is blocked…`, `25 · …archived` | pass |
| Pocket rename / delete | pockets `T07–T10`, `T13–T17` | pass |
| Receipt scanning (on-device OCR) | dot01 `26 → 27 → 28 → 33`, `29`, `34`, `26 · a PDF is refused`; camera `26 · TAKE PHOTO opens a live preview…` | pass |
| Entry (16–20) | dot01 entries block | pass |
| Reconciliation (13 / 23) | dot01 `13 / 23 · tracked, actual and difference stay apart…` | pass |
| Account pages 02–05 (this sprint) | dot01 `02–05 · each kind opens its own page with live, id-bound values…`; pockets `T03 · a hold on a Pocket page balance…` (hold box now on the authority balance area) | pass |
| Responsive / touch / 16 px inputs | dot01 `nothing overflows sideways, controls stay on screen and touchable…` | pass |
| Accessibility | dot01 `no serious or critical axe violations…`; pockets `T18 / T19` | pass |
| Reduced motion | dot01 `no animation runs…` | pass |

## Run history (complete)

1. DOT 01 + Pockets on the dev server, mobile, 3 workers: 40 passed, 3 failed with `Page crashed` / load timeout while
   capture jobs ran in parallel; the 3 re-run alone: 3 passed.
2. Full set on the dev server, 2 workers: stopped at 102 / 384 — repeated `Page crashed`, `ERR_INSUFFICIENT_RESOURCES`
   and runtime-never-mounted timeouts across suites (including financial suites this sprint does not touch): the
   long-running dev server under load, not the code.
3. Full set on a **production build** (`vite preview`, the repo's CI path): stopped at 152 / 384 after one real failure
   (below), on every project where it ran.
4. After the fix, full set on a fresh production build: **376 passed · 0 failed · 8 skipped**.

## Defect found and fixed (pre-existing, production builds only)

The full run on a **production build** (`vite preview`; earlier sprints ran E2E on the dev server) failed
`T11 / T12 · delete asks first; KEEP POCKET changes nothing` on every project: the delete confirmation opened with focus
on its corner **CLOSE** chip instead of **KEEP POCKET**. Reproduced on a production build of the untouched base #1713
`f7e2739c` (small + mobile), so it predates this sprint; on the dev server React StrictMode's double effect run hid it.
Cause: `Dot01Overlay` focused the first control in DOM order, and the overlay's chips render before its content.
Fix (`Dot01Frame.tsx`): an overlay opens on its **first content control** (a form's first field, a confirmation's safe
choice), exactly as each later step already did; overlays without a content region keep their first control. The test
is unchanged.

Trigger ids are unchanged (`d01-strip-*`, `d01-balance`, `d01-pocket-hold`, `d01-manage`, `d01-back`); no test was
edited or weakened. Unit: 823 / 823 JURNL tests pass (211 files), including the new
`jurnlF05AccountScenes.test.ts` (8).
