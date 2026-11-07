# 21 · Changed files and commits

Base `c4787f382` → `claude/jurnl-editorial-overlays-um0u93` (SHA in the final response).

| File | Change |
|---|---|
| `runtime/surfaces/editorial/Editorial.tsx` (new) | behaviour host + composition primitives (EdArt, EdHead, EdAction, EdChoices, EdSeal, EdGlyph), the art registry and regions |
| `runtime/surfaces/editorial/jurnl-editorial.css` (new) | the compositions (action, register, transfer, search, account) + 04 / 07 / 08 additions |
| `runtime/surfaces/editorial/MoneyOverlays.tsx` (new) | 01 MoneyActionSheet, 03 PocketPick, type glyphs |
| `runtime/surfaces/editorial/SearchDrawer.tsx` (new) | 05 GlobalSearchDrawer + `searchRecords` |
| `runtime/screens/f05/MoneyMotionParent.tsx` | action sheet → MoneyActionSheet; search chip opens the drawer |
| `runtime/screens/MoneyScreens.tsx` | AddPlaceSheet recomposed (logic unchanged) |
| `runtime/finance/FinanceSheets.tsx` | TransferSheet recomposed (logic unchanged) |
| `runtime/screens/f05/dot01/PocketManager.tsx` | clip + kind art on MANAGE POCKET |
| `runtime/screens/f05/dot01/sheets/AccountSheets.tsx` | stone on ARCHIVE BLOCKED |
| `runtime/global/GlobalMenu.tsx` | classical head on the menu |
| `runtime/screens/CheckPurchaseScreens.tsx` | SelectionSheet focus trap + Escape |
| `runtime/surfaces/v3/V3Surfaces.tsx` | `useStableFocus` exported |
| `tests/jurnlEditorialOverlays.test.tsx` (new), `e2e/jurnl/jurnl-editorial-overlays.e2e.ts` (new), `playwright.config.ts` | tests |
| `scripts/jurnl/f05-motion-pilot/capture_editorial_overlays.ts` (new) | evidence capture |
