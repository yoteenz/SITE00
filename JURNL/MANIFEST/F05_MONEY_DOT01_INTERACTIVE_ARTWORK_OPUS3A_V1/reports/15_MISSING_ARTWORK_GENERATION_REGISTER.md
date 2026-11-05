# 15 · Missing artwork — generation register

Only artwork that is **proven missing** after source recovery is listed for generation. Recovery searched: the V9 authority
masters (37), the three SIDEKICKs (SK01 / SK02 / SK03 and their FIELD / SHEET / STRIP / FRAME layers), the 22 V9 motion assets
(`families/F05_MONEY/DOT01/F05_DOT01_01…22`), the micro-asset registry (Batches 01–06, `MICRO_ASSETS_MANIFEST.json`,
`BATCH_05_06_REVIEW.json`), the OPUS3 lifts (`SCENES/`) and the runtime directories. Nothing was generated; no OpenArt credit was
used; no broad batch is requested.

## A · Proven missing (generation candidates — founder approval gate)

| ASSET_ID | DESCRIPTION | AUTHORITY_SCREEN · CROP (board px) | INTENDED_DIMENSIONS | TRANSPARENCY | MATERIAL | ICONOGRAPHY | ORNAMENTATION | VARIANTS | TARGET_COMPONENT | ALTERNATIVES CHECKED | WHY NOT REUSABLE | PRIORITY | GATE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| — | none | — | — | — | — | — | — | — | — | — | — | — | — |

**MISSING_ARTWORK_ASSETS = 0.** The one gap first recorded this sprint (GAP-TERRACOTTA-PILL, a red destructive pill) was
withdrawn: authority 25 draws ARCHIVE ACCOUNT with the same dark-olive pill as every other primary action, so the destructive
action now draws that pill and no red surface is needed.

## B · Recoverable from approved sources, not yet lifted (no generation needed — next lifts)

| ID | What | Source to lift from | Why not done in this sprint |
|---|---|---|---|
| LIFT-SEALS-21-29 | the per-screen wax seals of 21 (cards), 23 (scales), 24 (circular arrows), 25 (archive box), 27 (coin portrait), 28 / 29 (receipt) | each authority's own seal (the lettering never reaches it), disc alpha as `lift_dot01_sk03_parts.py` does for 16–20 | each disc needs a hand-checked outline; the automatic outline fit leaked into the parchment and foliage (evidence in `metrics/seal_fit_attempts.json`), so only the five hand-verified seals (16–20) were mounted |
| LIFT-SCAN-18 / LIFT-SCAN-19 | 18's scan composition (receipt stack + amphora + olive scan tile with brackets) and 19's (olive strip with the bracketed camera) | authorities 18 / 19 | structurally different from 16's scan block (not a re-skin); 18 / 19 keep the founder's Batch 04 camera art |
| LIFT-FIELD-DECKLED | the deckled cream value field (14 / 16 empty fields) | an empty field on authority 14 (ACCOUNT NAME) | the CSS field (cream, ink rim, inner shadow) is close; Batch 05 `B05_08` was rejected (olive rim) |
| LIFT-17-JUG | 17 ADD CASH's amphora + coins over the title paper's right end | authority 17 | 17 is a structural rebuild (OPUS3 gate 2) |

## C · Kept as authority-faithful CSS (geometric, METHOD C)

Filter chips (21 / 31: smooth cream / olive pills with a thin ink border), the amber translucent back tile (06–10), the
reorder step buttons (32), the V3 editorial pill inside 36. These are geometric in the authorities; a raster would add nothing.
