# JURNL F09 SAFE TO SPEND — Three-Concept Art-Direction Regen Correction 1

**Sprint:** `P0.JURNL.F09-SAFE-TO-SPEND.THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1` · 2026-10-06
**Status:** **BLOCKED ON SCENE RETRIEVAL.** 0 of 3 finished candidates delivered. No founder board yet.

> **Superseded for planning by `P0.JURNL.F09.PROMPT-FORENSICS-AND-CREATIVE-LOGIC-AUDIT1`.** F09 generation is paused. Do not resume this round as-is: the audit found that its scene prompts are text-to-image with no world reference (`../PROMPT_FORENSICS_AND_CREATIVE_LOGIC_AUDIT1/README.md`).
> **`LAYOUT_PROOF/` is a degraded artifact.** It was built from 144×256 previews (≈ 10× upscale), which the asset quality gate classes as WIREFRAME_ONLY. It is not for evaluation and should never have been founder-facing (audit addendum, RC14).

## What happened

1. The three scenes were re-authored and generated: `gpt-image-2.5-sunburst` via Figma, text-free, art-directed to the F03 benchmark (`SCENE_PROMPTS/`).
2. The full-resolution files are hosted on `www.figma.com`, which this environment's network policy blocks. Only the 144×256 previews returned with the calls are on disk (`SCENES_PROOF/`).
3. The Figma route also returns 864×1536 at most, not 4K (`REGEN_RENDER_LEDGER.json`). OpenArt is not connected here, and Weave is not linked.
4. The product layer and finishing are built and tested (`scripts/jurnl/f09-art-direction-regen-assemble.mjs`). It is locked against the real scene compositions as a **layout proof**: `LAYOUT_PROOF/` is watermarked and never a candidate.

## The three concepts (`REGEN_CONCEPTS.json`)

| | 01 THE SURVEYED COURTYARD | 02 THE ANSWER IN RAKING LIGHT | 03 THE SORTING RACK |
|---|---|---|---|
| World | Courtyard of a limewashed cliff villa from the upper loggia: arched sea view, olive, linen-cushioned bench, basin, lemon and lavender planters, sheer curtain | One limestone wall in raking morning light; deep arched window to sea and cypress; olive branch in a hand-thrown vase on a travertine ledge | Five oak-lined arched niches carved into a limewashed hall; sealed linen envelopes with burgundy wax; centre niche empty with the broken seal; console with bowl and olive |
| Signal | $1,284 set in the sunlit square: the open area is the money | Editorial answer in the light: SAFE TO SPEND · YOU CAN SPEND · $1,284 · AVAILABLE THROUGH OCT 18 | $1,284 centred above the cabinet; a fine thread drops to the open niche |
| Held | Survey annotations on the shaded perimeter: BILLS · PLANS · GOALS · BUFFER | AFTER BILLS, PLANS, GOALS & BUFFER. The held words are in brass ink | Engraved on the sill under each sealed niche; official mark pressed into each seal |
| Purchase check | Frosted limestone panel | Limestone band, serif question | Cream stationery card |
| Logo | Official lockup top-left, multiplied into the plaster | Official lockup as the column masthead | Official lockup top-left + official mark on the seals |

All three share the canonical nav (HOME · MONEY · + · PLAN · CREDIT, with HOME active), SEE WHY THIS AMOUNT, and **no device chrome**.

## To finish (one of two)

- **Fast:** allow `www.figma.com` in this environment's network access. Then download the three scenes (assets are valid until 2026-10-13), QA them at full size, run the assembly, audit, and build the board. The photographic layer is upscaled ×1.66 to the 393×852 @3x canvas, so this route stays below 4K (recorded exception).
- **4K (canonical):** connect OpenArt to this environment, regenerate the three scenes from `SCENE_PROMPTS/`, then run the same assembly.

```
node scripts/jurnl/f09-art-direction-regen-assemble.mjs    # SCENES/T0n_SCENE.png → COMPOSITES/ + F09_FOUNDER_REVIEW_BOARD.png
```

The forensic notes and the pass/fail table are written only after the finished candidates exist and pass the finish audit. None are claimed here.
