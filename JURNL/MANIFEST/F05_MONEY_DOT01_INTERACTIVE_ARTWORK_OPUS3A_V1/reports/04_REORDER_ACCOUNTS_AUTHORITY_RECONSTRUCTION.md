# 04 · REORDER ACCOUNTS (06) — authority reconstruction

Evidence: `evidence/06/06_reorder_authority_pre_base_after.webp` (crop x 475–900, y 1140–1315), `evidence/06/06_pair_authority_pre_base_after.webp`.

| Field | Value |
|---|---|
| CONTROL_ID | `d01-reorder` |
| SCREEN_ID | 06 ALL ACCOUNTS |
| AUTHORITY_REFERENCE | `06_ALL_ACCOUNTS.png`, box x 485–887, y 1154–1303 |
| CONTROL_PURPOSE | open REORDER ACCOUNTS (32); disabled with fewer than two pockets |
| VISIBLE_ARTWORK_COMPOSITION | coordinated torn parchment → engraved ↑↓ direction arrows → two-line live label |
| OUTER_SURFACE_SOURCE | `SCENES/F05_DOT01_ACTION06_REORDER.webp` (402 × 149, lifted from the authority) — EXACT_APPROVED_SOURCE |
| INNER_SURFACE_SOURCE | the same lifted paper |
| ICON_SOURCE | `SCENES/F05_DOT01_ICON06_REORDER.webp` (78 × 74, the authority's engraved arrows) — EXACT_APPROVED_SOURCE. **Not** the Batch 04 `08_reorder_grip` (a drag grip, a different purpose; it stays the drag handle of 32's rows) |
| ORNAMENT_SOURCE | none beyond the paper and the glyph |
| TEXT_SOURCE | live `REORDER` / `ACCOUNTS` (aria-label `REORDER ACCOUNTS`) |
| TEXT_STYLE | `JURNL Authority Serif`, 34 board px, uppercase, ink, two lines |
| EXPECTED_ASPECT_RATIO / WIDTH / HEIGHT | 2.70 · 402 · 149 board px |
| EXPECTED_POSITION | x 485, y 1154, right of ADD ACCOUNT (gap 14 px) |
| EXPECTED_LAYER_ORDER | scene → paper → glyph → label |
| EXPECTED_SHADOW | soft contact shadow under the paper |
| EXPECTED_INTERACTION_STATE | press / focus as ADD; disabled (dimmed, not focusable by click) with < 2 pockets |
| CURRENT_COMPONENT | `DirectoryAction` (`which="reorder"`) |
| CURRENT_GEOMETRY (board scale 1) | button 485, 1154, 402 × 149 · glyph 536, 1192, 78 × 74 · label 638, 1194, 202 × 72 |
| AUTHORITY_DIFFERENCES | Δ 0 px in position and size; label weight slightly lighter than the authority's lettering |
| REQUIRED_CORRECTION | none to the composition |
| MISSING_SOURCE_ASSETS | none |
| IMPLEMENTATION_STATUS | COMPLETE (METHOD B) |
| VISUAL_QA_STATUS | PASS |
| FOUNDER_APPROVAL_STATUS | PENDING |

Functional: `jurnl-f05-dot01.e2e.ts` and `jurnl-f05-pockets.e2e.ts` keep their reorder journeys (open 32, move by buttons and by
drag, order persisted in the repository); `S1` checks the visible composition and the hit area.
