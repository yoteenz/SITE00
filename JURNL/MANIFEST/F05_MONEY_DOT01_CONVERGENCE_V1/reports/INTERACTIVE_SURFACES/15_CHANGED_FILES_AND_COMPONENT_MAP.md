# 15 · Changed files and component map

Sprint `P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-SURFACES-AND-OVERLAY-AUTHORITY-CONVERGENCE.OPUS1` (addendum) · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

20 files changed (`git diff --stat f23032ac..be8718b7`):

| File | Role |
|---|---|
| `e2e/jurnl/jurnl-f05-dot01.e2e.ts` | E2E: choose() helper for the parchment listbox; date via data-value (no assertion on money changed) |
| `scripts/jurnl/f05-motion-pilot/extract_micro_assets.py` | micro-asset derivatives (trim + resize only) + manifest |
| `src/projects/jurnl/families/F05_MONEY/MICRO_ASSETS/MICRO_ASSETS_MANIFEST.json` | source SHA-256, registry ID, sizes for the 40 derivatives |
| `src/projects/jurnl/families/F05_MONEY/MICRO_ASSETS/BATCH_0{1..4}/*.webp (40 files)` | runtime derivatives of the founder's Batches 01–04 |
| `src/projects/jurnl/runtime/screens/f05/MicroIcon.tsx` | one micro-asset slot with the line glyph as fallback |
| `src/projects/jurnl/runtime/screens/f05/microAssets.ts` | registry: 69 founder IDs (40 available, 20 pending Batch 05 / 06, 9 no batch / baked) |
| `src/projects/jurnl/runtime/screens/f05/surfaces/JurnlSurfaces.tsx` | JURNL_POPOVER, JURNL_SELECT, JURNL_DATE_PICKER |
| `src/projects/jurnl/runtime/screens/f05/surfaces/jurnl-f05-surfaces.css` | parchment surface styles |
| `src/projects/jurnl/runtime/screens/f05/dot01/Dot01Frame.tsx` | chip tones + widths, overlay title rule, OVERLAY_CONTENT, fields / icon-tone props |
| `src/projects/jurnl/runtime/screens/f05/dot01/jurnl-f05-dot01.css` | chips, overlay heading, serif fields, strips, tiles, 02–06 type, scan block, history marks |
| `src/projects/jurnl/runtime/screens/f05/dot01/kit.tsx` | SelectInput → JurnlSelect, date TextInput → JurnlDateField, Strip asset slot, Field label ids |
| `src/projects/jurnl/runtime/screens/f05/dot01/AccountPage.tsx` | 02–05 authority stat words over canonical values, strip assets, credit tiles, label position |
| `src/projects/jurnl/runtime/screens/f05/dot01/DirectoryPage.tsx` | 06 two-line actions on a torn strip, amber chip, summary screen-reader only |
| `src/projects/jurnl/runtime/screens/f05/dot01/HistoryPage.tsx` | filters on JURNL controls, category marks, amber chip |
| `src/projects/jurnl/runtime/screens/f05/dot01/DetailPages.tsx` | 11 tiled strip icons |
| `src/projects/jurnl/runtime/screens/f05/dot01/icons.tsx` | framed-plus and up / down line glyphs (authority 06) |
| `src/projects/jurnl/runtime/screens/f05/dot01/sheets/EntrySheets.tsx` | scan block, strips / dense strips, tiles on 16 / 20 |
| `src/projects/jurnl/runtime/screens/f05/dot01/sheets/AccountSheets.tsx` | shared OVERLAY_CONTENT |
| `src/projects/jurnl/runtime/screens/f05/dot01/sheets/CorrectionSheets.tsx` | shared OVERLAY_CONTENT, tiled strips (24) |
| `src/projects/jurnl/runtime/screens/f05/dot01/sheets/ReceiptFlow.tsx` | shared OVERLAY_CONTENT |
