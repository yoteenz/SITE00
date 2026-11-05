# 04 · Shared interactive component inventory

Sprint `P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-SURFACES-AND-OVERLAY-AUTHORITY-CONVERGENCE.OPUS1` (addendum) · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Primitive | Implementation | Status |
|---|---|---|
| JURNL_SELECT | `runtime/screens/f05/surfaces/JurnlSurfaces.tsx` `JurnlSelect` (via kit `SelectInput`, history `FilterSelect`) | NEW, shared |
| JURNL_POPOVER | `JurnlPopover` (stage layer, flip, floor = dock top) | NEW, shared |
| JURNL_DATE_PICKER | `JurnlDateField` (via kit `TextInput type="date"`, history `FilterDate`) | NEW, shared |
| JURNL_SELECTION_SHEET | not needed: lists are short; the popover scrolls internally | — |
| JURNL_CONTEXT_MENU | no context menus in DOT 01 | — |
| JURNL_CONFIRMATION_DIALOG | `Dot01Overlay` (25, 36, 37) | existing |
| JURNL_FORM_FIELD | kit `Field` / `TextInput` (strips or sheet) | refined |
| JURNL_SEARCH_FILTER | `HistoryPage` filter panel | refined (controls), layout PARTIAL (31) |
| JURNL_VALIDATION_NOTICE | kit `Alert` | existing |
| JURNL_SUCCESS_FEEDBACK | saved overlays + laurel stamp | existing |
| JURNL_LOADING_OVERLAY | receipt scanning (engine progress) | existing |

One system: every DOT 01 select and date now goes through these primitives (0 native left).
