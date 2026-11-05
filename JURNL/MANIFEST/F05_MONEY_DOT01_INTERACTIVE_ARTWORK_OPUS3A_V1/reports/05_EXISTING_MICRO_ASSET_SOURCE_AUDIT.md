# 05 · Existing micro-asset source audit (the candidates named in the sprint)

Inspected from the repository runtime derivatives (`src/projects/jurnl/families/F05_MONEY/MICRO_ASSETS/…`) and their registry
records (`MICRO_ASSETS_MANIFEST.json`, `BATCH_05_06_REVIEW.json`); evidence image `evidence/05_candidates.webp` (each candidate
next to the authority lift it would replace).

| Candidate | Provenance (registry) | Source px / runtime px | Alpha | What it is | Authority it was proposed for | Verdict |
|---|---|---|---|---|---|---|
| BATCH 01 `04_add_symbol.png` → `F05.D01.ICON.PLUS.FRAMED` | founder Batch 01, sha `127160dd…` | 768² → 192 × 181 | clean | a filled **bronze** rounded tile with a raised cream plus | 06 ADD ACCOUNT | **MISMATCH for 06**: 06 draws a thin cream **outline** square with a thin plus on dark olive (`ICON06_ADD`, lifted). Not mounted on 06. It is the right art for the amber `+` corner chip of the overlays (26 / 30 …), where it stays mounted. |
| BATCH 04 `08_reorder_grip.png` → `F05.D01.ICON.REORDER.GRIP` | founder Batch 04, sha `508a31d6…` | 768² → 192 × 175 | clean | three gold **drag bars** (a grip) | 06 REORDER ACCOUNTS | **MISMATCH for 06**: 06 draws engraved **↑↓ direction arrows** (`ICON06_REORDER`, lifted). A grip is a drag handle, not the reorder action; it is not substituted. It keeps its own role: the drag handle on each row of 32 REORDER ACCOUNTS. |
| BATCH 05 `B05_04_TORN_PARCHMENT_ACTION_STRIP.png` | generated (Grok), sha in review | 1360² | clean | torn parchment strip | 02–05, 11–13 strips | **EXACT_APPROVED_SOURCE_REUSE**: pixel-identical to V9 motion asset `F05_DOT01_19_PARCHMENT_ACTION_STRIP` (MAD 0.0); the runtime already mounts 19 on every strip (14 strip controls in the census). |
| BATCH 05 `B05_05_MOSS_PRIMARY_BUTTON_SURFACE.png` | generated | 1360² | checker residue | moss pill with a **brass rim** and specular highlight, 4.1 : 1 | primary actions | **CORRECTION_REQUIRED, not mounted**: the authorities (14 / 16 / 26 / 36) draw a dark-olive pill with a thin **cream** rim; 4.1 : 1 cannot make a 6–9 : 1 control without stretching its caps. Replaced this sprint by the SIDEKICK's own pill (report 09). |
| BATCH 05 `B05_06_CREAM_SECONDARY_BUTTON_SURFACE.png` | generated | 1360² | checker residue | cream pill with a smooth double olive line, 4.5 : 1 | secondary actions | **CORRECTION_REQUIRED, not mounted**: the authorities draw a deckled cream pill with a cream rim; replaced this sprint by the SIDEKICK's own cream pill. |

## The sources that DO match (found by exhausting the packages, report 09)

* `F05_DOT01_SK03_SHEET.webp` (887 × 348, the SK03 SIDEKICK's action sheet, sha `fa0163a9…`) carries the exact dark-olive pill
  (outline x 59–829, y 36–145, 7.1 : 1) and cream pill (x 59–828, y 160–248, 8.7 : 1) that authorities 14–37 draw for every
  action. Lifted this sprint with a stadium alpha (no painted pixel): `SCENES/F05_DOT01_PILL_SK03_DARK.webp` /
  `…_CREAM.webp`, provenance `SCENES/F05_DOT01_PILL_SK03.json`, tool `scripts/jurnl/f05-motion-pilot/lift_dot01_sk03_parts.py`.
* `F05_DOT01_ACTION06_*` / `ICON06_*` (OPUS3 lifts from authority 06) for the 06 pair.

Nothing was force-mounted to raise an asset-utilisation count; no candidate was stretched into a target shape.
