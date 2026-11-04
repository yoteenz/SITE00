# 12 · Accessibility and focus management

Sprint `P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-SURFACES-AND-OVERLAY-AUTHORITY-CONVERGENCE.OPUS1` (addendum) · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Check | Evidence |
|---|---|
| Combobox semantics, active descendant | interactive probe: `aria-expanded=true`, `aria-activedescendant` set while open (S2, S4, S6, S7, S9) |
| Focus stays on the field while open; returns after choice | S3: focus on `d01-category`, collapsed |
| Calendar takes focus on the chosen / today cell | S5, S8 |
| axe (E2E) | 12 passed · 0 failed · 0 skipped |
| Escape closes the list without closing the overlay | `stopPropagation` in both controls |
