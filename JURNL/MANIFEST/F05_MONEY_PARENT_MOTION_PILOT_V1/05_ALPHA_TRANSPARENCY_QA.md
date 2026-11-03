# 05 — Alpha transparency QA

QA images are in `05_ALPHA_QA/`:

- `alpha_*.jpg`: each layer over a checkerboard, magenta, black and white;
- `halo_*.jpg`: a 4× edge zoom over magenta;
- `extraction_report.json`: raw counts.

## Real alpha, per layer

| Layer | Transparent px | Partial px (edge AA) | Opaque px | Halo / contamination | Torn-edge geometry | Verdict |
|---|---|---|---|---|---|---|
| Title paper | 49 688 | 10 458 | 108 772 | None visible over magenta, black or white. The white paper fibres along the tear are kept; no dark background line. | Kept (GrabCut follows the tear) | PASS |
| Wax seal | 5 129 | 2 343 | 10 468 | None; the bronze rim is clean | Irregular wax rim kept | PASS |
| Card: bank | 2 751 | 632 | 75 808 | None (exact geometry inside the rim) | Rounded rectangle; the torn imagery edge is inside the card | PASS |
| Card: payout | 2 767 | 636 | 77 008 | None | same | PASS |
| Card: cash | 2 855 | 658 | 86 367 | None | same | PASS |
| Card: credit | 2 851 | 657 | 85 744 | None | same | PASS |
| Torn edge strip | 19 405 | 9 110 | 58 077 | None along the tear. Leaf and stone hues are keyed out; the two extreme ends keep a few px of the panel's shaded edge. Used only over parchment-coloured sheets. | Tear kept | PASS (for its use) |

The alpha is anti-aliased by a half-pixel erosion and a 0.8 px blur of the binary mask, so no outer ring of background is pulled in.

## Envelope verification: can motion reveal what is under a layer?

`envelope_check` warps each layer's alpha through its whole CSS animation (16 steps). It counts originally opaque pixels that become uncovered, and the subset that would show the covered fill.

| Layer | Animation | Any layer pixel uncovered (worst frame) | **Covered fill exposed** |
|---|---|---|---|
| Title paper | scale 1.014 → 1 about (18 %, 70 %) | 26 px (at leaf notches; they show the title's own paper ring) | **0** |
| Wax seal | scale 1.06 → 1, −3° → 0 | 0 | **0** |

The CSS keyframes are pinned to these exact values by a unit test (`jurnlF05MotionPilot.test.ts`).

## Zero-motion composite

`zero_motion_composite_text_free.jpg` is the SIDEKICK plus every layer composited at rest, with no live type. Against the source, 9.17 % of pixels differ by more than 24/255. That is exactly the removed text, values, icons, chips, dots, nav pill and the card shadows that CSS redraws (`zero_motion_diff_vs_source.jpg`). The live runtime comparison is in doc 11.

## Honest limits

- Every alpha above was made from a flattened image, at the source's 1024 px.
- The reconstructed text areas on the cards and the title are clean parchment, slightly smoother than the original grain.
- None of these is a native layered master. Doc 16 sets out what replaces them.
