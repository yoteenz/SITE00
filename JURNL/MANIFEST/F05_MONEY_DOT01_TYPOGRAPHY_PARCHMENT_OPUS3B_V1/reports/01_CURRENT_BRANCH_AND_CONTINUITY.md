# 01 · Current branch and continuity

| Item | Value |
|---|---|
| Parents | OPUS3 (`c4787f382`) and OPUS3A (run in the same branch and commit: both correct the same title papers, action surfaces and type) |
| SHA_BEFORE | `8e0b8d86182ab56f3f1aa4cd1d268a2e7d415ac0` |
| Branch | `claude/jurnl-f05-dot01-artwork-typography-um0u93` |
| SHA_AFTER | see report 16 |
| Draft PR | none (not requested) |

Affected components (identified before any change):

| Component | File | Role in the defect |
|---|---|---|
| `Dot01Board` / `titleSize` / heading box | `runtime/screens/f05/dot01/Dot01Frame.tsx`, CSS `.jrn-d01[data-env^='SK03'] .jrn-d01__heading` | the overlay title was fitted to a 520-px box wider than the SK03 paper (report 02) |
| `PurchaseFlow` (16 / 18 / 19 / 28) | `sheets/EntrySheets.tsx` | the pilot form: scan block, strips, actions |
| strip rows | CSS `[data-fields^='strips']`, `strips-dense` | label / value type and columns |
| kit `Button` | `kit.tsx`, CSS `.d01-btn` | action surface and type |
| content type scale | `Dot01Frame.tsx` `--d01-s` | cap 1.25 broke authority-relative type on tablets |

Not changed: the canonical ledger, the financial services, the data model, the editorial (V3) overlays, the OPUS3 scenes.

## Continuation (same branch, re-issued brief)

Continued from `8079962d3` (see OPUS3A report 01): per-screen seals 21–29, 16 / 20 tile proportion, 25 glyph rule, and the
measured title clamp (report 04). Reports updated in place.

