# Mobile editorial sheet

- Portal: `document.body`, class `idnty-sel-sheet`
- **FD-6:** `border-top: 2px solid var(--df-red)`, square panel (no radius)
- Title: **SELECT BUSINESS TYPE** (`sheetTitle`)
- Dismiss: **CANCEL** (no value change)
- Options: 48px rows, red period + inset edge when selected
- Selection: immediate `onChange` + close (no Apply)
- Scroll: internal list with `safe-area-inset-bottom` padding
- Focus: `useDfScrollLock` + `useDfDialogFocus`; Escape → cancel
- Opens after blurring active text field
