# 17 · KNOWN GAPS AND ARTWORK DEPENDENCIES

No artwork was generated or extracted in this sprint. Each item below needs an independently mounted asset before its motion can be added honestly.

## Extraction needs

| # | Motion asked for | Blocked by | Exact extraction need |
|---|---|---|---|
| X1 | Ambient A: botanical sway on the MONEY parent | lemons and leaves are baked into `F05_MOTION_SIDEKICK.webp` (L0) | the lemon branch (top centre-right) and the left olive sprigs as separate RGBA layers at SIDEKICK resolution (941 × 1672 source), plus a SIDEKICK plate with those regions in-painted |
| X2 | Ambient B: scenic depth (sea shimmer / cloud drift) | the arch and coast are baked into the SIDEKICK | the coast-through-arch region (x 0.68–1.0, y 0.04–0.34 of the plate) as its own layer, plus the arch frame as a separate foreground layer with alpha |
| X3 | Wax stamp after a transfer is persisted | the direction seal is part of the OV03 MOVE MONEY shell | the OV03 seal as an RGBA layer at the shell's 941 × 1672 scale, plus the shell with that seal removed |
| X4 | MANAGE POCKET paperclip tactile response | the paperclip is part of the single OV04 note image | the paperclip as an RGBA layer at the note's 642 × 741 scale, plus the note without it |
| X5 | Bronze / coin settle on the Buffer | the CH01 coin is NOT_MOUNTED by the OPUS3 founder disposition | a founder decision to mount a coin; then `bronzeSettle` is ready to use |
| X6 | Botanical / scenery life on DOT 01 SK02 pages | SK02 has no independent seal or foreground layers | SK02 foreground layers (seal, botanicals) as separate RGBA files |

## Gaps

| # | Gap | Status |
|---|---|---|
| G1 | DOT 03 and DOT 04 have no state-specific choreography: they have no committed state of their own to answer. They share the carousel and overlay vocabulary. | reported PARTIAL |
| G2 | iOS Safari is not verified on a device. Recordings and tests ran on Chromium (Playwright). The CSS used (mask, keyframes, WAAPI) is supported by current Safari, but this was not observed. | UNVERIFIED |
| G3 | The account page's own figures get no emphasis on change: they stay still. The parent pocket paper gets the wash. | by design |
| G4 | `bronzeSettle` and `waxStamp` are defined and tested but mounted nowhere, because no independent coin or wax art exists in those surfaces (X3, X5). | waiting on art |
| G5 | The route View Transition (pocket → account) keeps its 260 ms timing, below the 550–900 ms navigation range. It is the shared-element lift and feels immediate. Not changed, to avoid slowing navigation. | kept as is |
