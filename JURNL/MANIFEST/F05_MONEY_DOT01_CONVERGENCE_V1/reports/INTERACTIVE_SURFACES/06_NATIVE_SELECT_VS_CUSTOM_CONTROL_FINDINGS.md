# 06 · Native select vs custom control findings

Sprint `P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-SURFACES-AND-OVERLAY-AUTHORITY-CONVERGENCE.OPUS1` (addendum) · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

**Native controls found: 6 `<select>` + 6 `<input type="date">` (before). After: 0.**

| Location | Before | After |
|---|---|---|
| `dot01/kit.tsx` `SelectInput` (13 uses) | `<select>` | `JurnlSelect` |
| `HistoryPage` filters: account, type, category, status, sort | 5 × `<select>` | 5 × `JurnlSelect` |
| kit `TextInput type="date"` (record, add cash, card payment, correction) | 4 × date input | `JurnlDateField` |
| `HistoryPage` FROM / TO | 2 × date input | `JurnlDateField` (optional, CLEAR) |

On iOS a `<select>` opens a platform menu (translucent material, system font) and `<input type="date">` a wheel; neither can be styled reliably. The JURNL controls keep the semantics a screen reader needs (combobox / listbox, dialog / grid), keyboard operation and stable values. Out of DOT 01 scope: the generic `TransferSheet` (MOVE MONEY) and family sheets keep their own controls (DOT 02).
