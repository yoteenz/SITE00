# 11 — Visual fidelity comparison

**Verdict: VISUAL_FIDELITY = PARTIAL · FUNCTIONAL = PASS.** This is not presented as complete convergence.

## Method

The runtime was rendered with motion settled at **512 × 768 CSS px, DPR 2 = 1024 × 1536 device px**: the approved composite's exact size and proportion. The synthetic world uses the reference's four places (BANK ACCOUNT $1,260, RIDESHARE CARD $840, CASH ON HAND $350, CREDIT CARD owes $780). The capture was then diffed pixel for pixel against `approved_parent.png`. Phones, tablet and desktop were compared by eye (`14_BEFORE_AND_AFTER_SCREENSHOTS/`).

Images in `11_FIDELITY/`:

- `approved_runtime_heatmap_512x768.jpg`: approved | runtime | difference heat map;
- `onion_skin_50pct.jpg`: the two overlaid at 50 %;
- `zoom_*_approved_top_runtime_bottom.jpg`: zoomed crops;
- `fidelity_metrics_512x768.json`: the numbers below.

| Region | Mean abs. difference (0–255) | Pixels differing by > 40 | What differs |
|---|---|---|---|
| Top environment (bust, lemons, arch top) | 6.1 | 2.3 % | the live wordmark and three chips |
| Arch and village | 4.7 | 1.0 % | (WebP compression only) |
| Title and seal | 12.7 | 7.1 % | the live typefaces' glyph shapes |
| Summary band | 14.0 | 8.7 % | **different values** (live COMMITTED $35 / AVAILABLE $2,415 vs illustrative $420 / $1,250), glyph shapes |
| Panel and papers | 20.9 | 17.8 % | redrawn shadow halo, reconstructed panel ground, glyph shapes |
| Lower collage (engraving, sprig) | 4.2 | 0.3 % | none visible |
| Dock | 14.7 | 7.5 % | the existing dock's icons and labels vs the reference's drawn ones |
| **Whole page** | **13.3** | **9.0 %** | |

The environment regions (4–6) show where the extraction is faithful. The higher numbers are concentrated where live UI replaces baked UI, which is expected, and in the reconstructed panel.

## Criteria A–N

| | Criterion | Assessment | Grade |
|---|---|---|---|
| A | Overall composition | At 2:3 every object sits on its approved position; the layers recompose the picture. On tall phones the panel is taller (elastic), and a third row of papers appears. | PASS (2:3) · ADAPTED (phones) |
| B | Mediterranean editorial character | Preserved: same photographic collage, palette and materials (nothing new was generated) | PASS |
| C | Statue placement | Identical (retained in the SIDEKICK) | PASS |
| D | Architectural perspective | Identical; on phones 35 px of stone is cropped at each side | PASS |
| E | Torn-paper boundaries | Title paper and seal edges extracted with fibres kept (doc 05); panel tear intact | PASS |
| F | Botanical overlap | The olive leaves stay in front of the title paper (notches); the lemons are untouched | PASS |
| G | Wax-seal placement | Identical, and pressed in on entrance | PASS |
| H | Text hierarchy | Same order, sizes and case. **Typefaces differ:** JURNL Authority Serif (Playfair Display) is heavier and narrower than the reference serif, and Pinyon Script is a close but not identical script. | PARTIAL |
| I | Account panel arrangement | Approved 2 × 2 rects exactly at 2:3; responsive rows and pages elsewhere | PASS |
| J | Shadow and depth | The paper halos are redrawn by CSS and are slightly lighter and more uniform than the reference's painted shadows. The panel ground between papers is reconstructed and flatter. | PARTIAL |
| K | Contrast | The same papers and inks; measured ratios 4.85–12.6 : 1 (doc 10) | PASS |
| L | Bottom navigation | The torn nav paper is kept, with the existing five-item dock on it and MONEY active as the dark pill. The icons are the app's canonical set, not the reference's drawn ones. | PASS (behaviour) · PARTIAL (icon drawing) |
| M | Financial readability | Live values; floors keep labels ≥ 9.5 px and names ≥ 11 px on a 360 px phone | PASS |
| N | Motion continuity | Layered entrance ≤ 650 ms, paper → title morph, return settle, no residue (doc 06, frames in 13) | PASS |

## Does it look like generic cards over a flat background?

No. The papers are the approved papers (extracted, with their imagery and rims), on the approved panel, under the approved environment.

Where the result is weakest:

1. The reconstructed panel parchment between the papers is flatter than the original, which is most visible on tall phones and with few accounts.
2. The live serif is heavier than the reference's.
3. The source resolution is 1024 px: slightly soft on 3× phones.

## Seams, duplicates, rectangles

- **Seams:** no seam at the elastic junctions (tile cross-faded at both ends; lighting flattened, so repeats do not band); checked in the 0 ms frames.
- **Duplicates:** no duplicated seal, title paper or text (DOM counts asserted; covered fill never exposed).
- **Crop rectangles:** none. The papers have exact rounded alpha; on wide screens the board edges feather into the ambient copy.
