# 09 · Date picker and account selector

Sprint `P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-SURFACES-AND-OVERLAY-AUTHORITY-CONVERGENCE.OPUS1` (addendum) · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

**Date picker (DESIGN_AUTHORITY_REQUIRED for the open state):** month header with previous / next (44 × 40), single-letter weekday row, 6-week grid, TODAY (and CLEAR where optional). Keyboard: arrows (day / week), Home / End (week), Page Up / Down (month, + Shift: year), Enter / Space choose, Escape closes; focus returns to the field. The field shows `NOV 4, 2026`; the stored value stays ISO `YYYY-MM-DD` (E2E asserts `data-value`).

**Account selector:** JURNL_SELECT over the active places filtered exactly as before (stable `account_id`s).
