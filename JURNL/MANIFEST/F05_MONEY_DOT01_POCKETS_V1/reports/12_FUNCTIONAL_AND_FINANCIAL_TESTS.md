# 12 · Functional and financial tests

All runs use synthetic worlds in Chromium (Playwright) and vitest. Nothing real is involved: no account, server or database.

## Required tests T01–T20

| # | Requirement | Where | Result |
|---|---|---|---|
| T01 | tap a Pocket opens its page | E2E `T01 / T02 / T03` (directory and parent), `T04` (a 60 ms tap) | PASS ×4 sizes |
| T02 | long press opens the menu | E2E `T01 / T02 / T03` ×2, `T03` (balance paper); touch on phones, mouse on tablet / desktop | PASS ×4 |
| T03 | a long press does not navigate | same: URL unchanged 400 ms after release; Escape restores focus | PASS ×4 |
| T04 | a scroll does not open the menu | E2E `T04`: 60 px finger move, wheel scroll during a hold, horizontal carousel swipe | PASS ×4 |
| T05 | reorder still works | E2E `T05` (after a hold) + existing `06 / 32` and `32 · cancelling a reorder` | PASS ×4 |
| T06 | the top-right icon opens the same menu | E2E `T06`: name, `aria-haspopup`, `aria-expanded`, position beside BACK, first item focused, Escape → chip | PASS ×4 |
| T07 | rename persists after reload | E2E `T07 / T08 / T09` (reload) · unit P01 | PASS ×4 · PASS |
| T08 | every reference updates | E2E (page title, card, parent paper, activity rows incl. transfer titles) · unit P02, P11 | PASS ×4 · PASS |
| T09 | financial values unchanged by a rename | E2E (balance cents, every entry's id / amount / account / direction, account count) · unit P03 (money picture, held, entries) | PASS ×4 · PASS |
| T10 | invalid names rejected | E2E `T10` (blank, duplicate, control character; CANCEL) · unit P04–P06 | PASS ×4 · PASS |
| T11 | delete needs confirmation | E2E `T11 / T12` (still ACTIVE while the surface is open; KEEP POCKET focused) | PASS ×4 |
| T12 | cancel keeps the Pocket | E2E `T11 / T12` (KEEP POCKET, and Escape) | PASS ×4 |
| T13 | history intact | E2E `T13 / T15 / T17` (entries identical, BOOKSHOP still in ACTIVITY) · unit P09 | PASS ×4 · PASS |
| T14 | a blocked archive is respected | E2E `T14` (BANK: transfer / bills / income; CARD: owes; RESOLVE ISSUES → card PAY) · existing `36` · unit P07, P08 | PASS ×4 · PASS |
| T15 | a successful archive removes the Pocket | E2E `T13 / T15 / T17` (directory, count, MONEY paper, account select) · existing `25` · unit P09 | PASS ×4 · PASS |
| T16 | the empty-state navigation is valid | E2E `T16` (last Pocket deleted from MONEY → empty paper; ALL ACCOUNTS → NO ACCOUNTS YET) | PASS ×4 (it ran; no skip) |
| T17 | browser back works | E2E `T13 / T15 / T17` (removed address → POCKET NOT FOUND; back / forward valid) | PASS ×4 |
| T18 | no page scroll | E2E `T18` + T02 / T06 / R1 / D1 / D2 checks; capture probe at 375 × 667 and 393 × 852 (`tests/capture_measurements.json`, 26 states, 0 scroll, menus inside the viewport) | PASS |
| T19 | keyboard and screen reader | E2E `T19` (Shift + F10, arrows, Home / End, Enter, Escape, focus restore; parent too) · `T18` axe 0 serious / critical on menu, rename, delete and the page | PASS ×4 |
| T20 | existing DOT 01 financial tests pass | `tests/jurnlF05Dot01.test.ts` 61 / 61 · full JURNL unit suite (below) | PASS |

## Suites

| Suite | Result |
|---|---|
| Pocket unit `tests/jurnlF05Pockets.test.ts` | **11 / 11** |
| DOT 01 financial invariants `tests/jurnlF05Dot01.test.ts` | **61 / 61** |
| JURNL unit suite (`tests/jurnl*`, 45 files) | **809 / 809** |
| Pocket E2E `jurnl-f05-pockets` (14 tests × small 360 × 780 / mobile 393 × 852 / tablet 834 × 1194 / desktop 1440 × 900) | **56 / 56** |
| All F05 E2E, five specs × four sizes (pockets, dot01, dot01-camera with real on-device OCR, carousel, motion pilot) | **312 passed · 0 failed · 8 skipped** (the same 8 skips as the previous sprint's F05 run, 256 + 8; the 56 new Pocket tests make 312) |
| After the last two fixes (KEEP POCKET first; RESOLVE ISSUES closes first): pockets + dot01 × four sizes | see `tests/e2e_final.txt` |
| `tsc --noEmit` | PASS |
| Build (`npm run build`: tsc + vite + verify-production-dist) | see `tests/build.txt` |

## Financial non-regression

- No canonical calculation changed: balances, the money picture, Safe to Spend / F07, transfer settlement, credit, reservations, receipts, posting and audit.
- A rename writes only `display_name` and `updated_at`, by id (P03, T09).
- A delete is the existing archive. It writes only `status: ARCHIVED` and the saved order (P09, T13), and every entry and amount is unchanged.
- Two display readers changed:
  - `history.ts` `entryLabel` gives transfer titles the current name;
  - `DetailPages` uses that label.
  Neither touches an amount or an effect.

## Not verified

- **iOS Safari / a real iPhone:** no WebKit and no device in this environment (BLOCKED).
- **Live RLS:** PREREQUISITE_BLOCKED (no QA secrets).
