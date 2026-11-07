# 02 · Generic overlay root cause

`GENERIC_OVERLAY_COMPOSITION_ARCHITECTURE_PRESERVED` — exact sources:

| Responsible | Where | What it imposed |
|---|---|---|
| `JurnlDrawer` | runtime/components/primitives.tsx:486 | one fixed geometry for every sheet: full-width `jrn-drawer--short/long` block, grab handle, head (title + lead + top-right close), vertically stacked `jrn-drawer__body`, uniform `jrn-drawer__foot`; `material="v3"` only re-skinned it (border-image parchment) — the layout stayed |
| `Chips` | runtime/finance/FinanceSheets.tsx:58 | every option a full-width `jrn-btn--secondary` row in `jrn-home__choices` → ADD A POCKET's five permanent account-type rows, MOVE MONEY's stacked FROM / TO rows, four stacked settlement rows |
| `AccountChips` | FinanceSheets.tsx:70 | FROM / TO as two unrelated chip stacks: no expression of a source, a destination or a direction |
| call sites | MoneyMotionParent.tsx (`f05m-actions-sheet`: `JurnlDrawer size="short"` + two `JurnlButton`s), MoneyScreens.tsx `AddPlaceSheet` (`JurnlDrawer size="long"` + `Chips`), FinanceSheets.tsx `TransferSheet` (`JurnlDrawer material="v3" size="long"`) | the founder's three rejected surfaces |
| `SelectionSheet` | screens/CheckPurchaseScreens.tsx:78 | no focus containment, no Escape (legacy) |

Correction: the behaviour host is separated from composition (`EditorialOverlay`, report 04). The three rejected sheets no
longer use `JurnlDrawer` / `Chips`; their logic (state, validation, `createManualAccount`, `recordTransfer`, settlement
states, duplicate guard) is unchanged. 74 `JurnlDrawer` call sites remain elsewhere (report 18).
