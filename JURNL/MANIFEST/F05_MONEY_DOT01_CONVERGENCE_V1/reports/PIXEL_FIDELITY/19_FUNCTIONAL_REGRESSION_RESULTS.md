# 19 · Functional regression results

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Suite | Result |
|---|---|
| JURNL unit suite (the repository tests folder, 44 files) | 798 / 798 (44 files) |
| Financial + F05 unit (invariants, stabilization, DOT 01 D01–D60, carousel, pilot) | 158 / 158 (invariants 40, stabilization 27, DOT 01 61, carousel 10, pilot 20) |
| `tsc --noEmit` | PASS |
| Build (`npm run build`: tsc + vite + verify-production-dist) | PASS (tsc + vite + verify-production-dist, 471 JS assets; release manifest site00-v272-be8718b) |
| F05 E2E (dot01, dot01-camera, carousel, motion-pilot × small / mobile / tablet / desktop) | 256 passed · 0 failed · 0 flaky · 8 skipped (of 264) |
| Interactive surfaces probe (9 states × 2 sizes) | see addendum doc 13 |

Only E2E interaction helpers changed (native `selectOption` → `choose()` on the parchment listbox; the date check reads `data-value`). No assertion about money, entries or balances was changed. No canonical financial file was edited (`git diff --stat` on `data/ledger`, `data/f07`, `data/f05/dot01`: 0 files).
