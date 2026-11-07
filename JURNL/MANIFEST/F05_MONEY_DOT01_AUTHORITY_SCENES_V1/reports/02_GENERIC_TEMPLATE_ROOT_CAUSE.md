# 02 · Why 03 / 04 / 05 rendered as one generic template (root cause, written before the rebuild)

**Finding.** 03 RIDESHARE CARD, 04 CASH ON HAND and 05 CREDIT CARD were the 02 BANK ACCOUNT composition with other words
in it. All four kinds were drawn by one component on one geometry, and the art that makes 03–05 different never reached
the runtime. Four causes worked together (**A + B + C + D**):

| | Cause | Evidence (pre-sprint code: #1713 `f7e2739c`, and the OPUS1 state `3604d2e7` = #1707 `0e930112`) |
|---|---|---|
| **A** architecture | One `AccountPage` drew every kind on **SK02's** paper boxes: `BAL`, `STATS`, `SCENIC`, `STRIPS` all came from `F05_DOT01_GEOMETRY.json › SK02`. Per kind it changed only the words, the tone of the figure (`onDark`) and, for four rows, a fixed `y = 1062 + i × 118` pitch. There was no notion of a per-screen composition. | `AccountPage.tsx` (before): `const G = DOT01_GEOMETRY.SK02` … `stripRects = four ? … 1062 + i * 118 : STRIPS` |
| **B** interpretation | V9 supplied **one** account SIDEKICK (SK02, built from screen 02, described as "expanded account and history layout"). It was read as the template for every account page, not as screen 02's own environment. | V9 `SIDEKICK_SK02_ACCOUNT_DETAILS.png` is screen 02 with its papers; no SK for 03 / 04 / 05 exists |
| **C** missing source | V9 has no separate layer for the **keychain** (03), the **amphora** (04) or the **bronze coin on red fabric** (05) — not in its 22 motion PNGs, not in its layers, not in micro-asset Batches 01–06, not in any upload. Each object exists only inside its flattened authority render. | report 07; `families/F05_MONEY/DOT01/F05_DOT01_01…22_*.webp`; `MICRO_ASSETS/BATCH_0*` |
| **D** art mapping | With no source, the slot was filled with the **parent's card thumbnails** (`MOTION_PILOT/F05_MOTION_CARD_*.webp`, `CARD_ART`) as a small "identity" tile in 02's scenic slot — the wrong art at the wrong scale in the wrong place. | `AccountPage.tsx` (before): `CARD_ART[v.kind]` → layer `identity` in `SCENIC` |

**Measured consequence** (text-masked, authority px, `15_PIXEL_COMPARISON_METHOD.md`): in the scene region under the
title paper the base runtime (#1713) reproduced only **31–38 %** of the authority's edges (03: 0.382, 04: 0.349,
05: 0.314) with a mean colour error of **79–87 / 255**. OPUS1's CSS convergence (balance set on the dark field, the
stats paper as the shared element) left it there: **0.30–0.38** (03: 0.376, 04: 0.301, 05: 0.303). The prior
"PARTIAL / GEOM FAIL" was the symptom; the cause was structural, not a CSS offset, which is why CSS patching could not
converge.

**What was not the cause.** The olive field, the heading, the chips, the motion system and the data were sound; 02 itself
measured 0.95 / 0.95 edge recall / precision and stays as it was.

**Correction (this sprint).** Composition is now per screen (`accountScenes.ts`); 03–05 set their own authority scene
band at the authority's own coordinates (reports 04–06, 08); the card thumbnails are gone from the account pages.
