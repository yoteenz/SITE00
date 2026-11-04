# 16 · Accessibility and touch targets

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Check | Result |
|---|---|
| axe on DOT 01 pages and overlays (E2E) | 12 passed · 0 failed · 0 skipped |
| JURNL_SELECT | select-only combobox: button `role=combobox`, `aria-expanded`, `aria-controls` (only while open), `aria-activedescendant`, options `role=option` + `aria-selected`; label via `aria-labelledby` |
| JURNL_DATE_PICKER | `aria-haspopup=dialog`, grid with one tab stop, day buttons with full spoken dates, month live region |
| Focus | stays on the field while a list is open; returns to the field after a choice or Escape; overlay focus trap unchanged and contains the popover |
| Touch | option rows ≥ 44 px; day cells ≥ 38 px within a 7-column grid; chips keep the enlarged invisible hit area |
| Live text | every label, value and state is DOM text; micro-assets are `aria-hidden` |
| Reduced motion | popover rise removed |
