# 03 · ADD ACCOUNT (06) — authority reconstruction

Evidence: `evidence/06/06_add_authority_pre_base_after.webp` (authority · pre-OPUS3 `d6992b3fc` · base `8e0b8d861` · after, the same
board-px crop x 70–480, y 1150–1315), `evidence/06/06_full_authority_pre_base_after.webp`, `evidence/controls/layer_sources.webp`.

## Per-control authority contract

| Field | Value |
|---|---|
| CONTROL_ID | `d01-add-account` |
| SCREEN_ID | 06 ALL ACCOUNTS |
| AUTHORITY_REFERENCE | `06_ALL_ACCOUNTS.png` (V9 master, 941 × 1672), box x 80–471, y 1163–1303 |
| CONTROL_PURPOSE | open ADD ACCOUNT (14) |
| VISIBLE_ARTWORK_COMPOSITION | torn paper with an irregular exterior → dark-olive fibre interior → framed plus (cream outline square + plus) → two-line live label |
| OUTER_SURFACE_SOURCE | `SCENES/F05_DOT01_ACTION06_ADD.webp` (391 × 140, lifted from the authority, its lettering masked) — EXACT_APPROVED_SOURCE |
| INNER_SURFACE_SOURCE | the same lifted paper (the olive interior is part of it) |
| ICON_SOURCE | `SCENES/F05_DOT01_ICON06_ADD.webp` (82 × 78, the authority's own framed plus) — EXACT_APPROVED_SOURCE; Batch 01 `04_add_symbol` rejected for 06 (bronze filled tile, report 05) |
| ORNAMENT_SOURCE | none drawn beyond the paper and the glyph |
| TEXT_SOURCE | live `ADD` / `ACCOUNT` (aria-label `ADD ACCOUNT`) |
| TEXT_STYLE | `JURNL Authority Serif`, 34 board px, uppercase, cream, two lines |
| EXPECTED_ASPECT_RATIO / WIDTH / HEIGHT | 2.79 · 391 · 140 board px |
| EXPECTED_POSITION | x 80, y 1163 (board), left of REORDER, 14 px gap, under the card grid |
| EXPECTED_LAYER_ORDER | scene (SK01_FIELD) → paper → glyph → label |
| EXPECTED_SHADOW | soft contact shadow under the paper |
| EXPECTED_INTERACTION_STATE | press: paper lifts 2 px with a shorter shadow; focus: gold ring; never disabled |
| CURRENT_COMPONENT | `DirectoryAction` (`DirectoryPage.tsx:165`), one `<button>` over the whole paper |
| CURRENT_ARTWORK_SOURCES | ACTION06_ADD (paper) |
| CURRENT_ICON_SOURCE | ICON06_ADD |
| CURRENT_CSS_STYLES | `.d01-dir__action-art { filter: drop-shadow(0 7px 9px rgba(16,12,4,.5)) }`, `:active` press, no background on the button |
| CURRENT_GEOMETRY (measured at board scale 1, 941 × 1672) | button 80, 1163, 391 × 140 · glyph 140, 1190, 82 × 78 · label 244, 1192, 182 × 76 |
| CURRENT_RENDERED_RESULT | `evidence/06/06_add_authority_pre_base_after.webp`, bottom panel |
| AUTHORITY_DIFFERENCES | Δ position 0 px, Δ size 0 px (box, glyph, label); the live label is a touch lighter in weight than the authority's lettering |
| REQUIRED_CORRECTION | none to the composition (done in OPUS3); this sprint verified it and the founder's "generic button" description against the pre-OPUS3 head |
| MISSING_SOURCE_ASSETS | none |
| IMPLEMENTATION_STATUS | COMPLETE (METHOD B: exact lifted paper + exact lifted glyph + live text + CSS shadow) |
| VISUAL_QA_STATUS | PASS (crop comparison; E2E S1) |
| FOUNDER_APPROVAL_STATUS | PENDING |

## Interaction evidence

E2E `S1` (`jurnl-f05-dot01-artwork-type.e2e.ts`): art = ACTION06_ADD, glyph = ICON06_ADD, label text, ≥ 44 px, centre tap reaches the
button, no CSS background, ADD left of REORDER, Enter opens ADD ACCOUNT. OPUS3's `jurnl-f05-dot01-directory.e2e.ts` D1/D2/D4/D7:
the pair stays on screen for 1 · 2 · 4 · 7 pockets and the papers never pass under it.
