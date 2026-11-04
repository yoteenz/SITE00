# 02 — Asset readiness report

**Overall: NOT PRODUCTION-READY.** The method is proven, but it was run on the only available source, a single flattened 1024 × 1536 composite.

## Source facts

| | approved_parent.png |
|---|---|
| Pixels | 1024 × 1536, 8-bit RGB, **no alpha** |
| SHA-256 | `7135b2f3e78778eaeeaf81883a018a70d85b9152e28c52f15a98bd8f03b3ef2a` |
| Layers | flattened: text, values, controls and nav are baked into the image |
| Effective resolution on devices | 393 px phone at DPR 3 → board 422 css px × 3 = **1266 device px from 1024 source px (×1.24 upscale)**. 1440 × 900 desktop at DPR 2 → 600 css × 2 = 1200 px (×1.17). Slight softness; no AI upscaling was applied. |

Other package SHA-256:

- `asset_system_study.png`: `5c303077c37a4e88455ca3709d29daa110495d5cf02f602304048df53f007634`
- `concept_board_composed_crop.png`: `c8b3062fa1b377ebcdc9faf0698be7c557a1374d04970836dbe9b770c20f51ac`
- `sidekick_preview_crop.png`: `efc0dae8f04c3f4163816fdff2557240e6490f90f3a9410ccf6123ed91f1474a`

## Method (deterministic, no generative fill)

`scripts/jurnl/f05-motion-pilot/extract_layers.py` (OpenCV 4.10, fixed seed `20261103`; rerunning it reproduces identical files):

- **EXTRACTED (alpha):** OpenCV GrabCut seeded with a rectangle (seal, title paper, tag), or exact geometry (card papers: supersampled rounded rectangles fitted to each card's rim).
- **RECONSTRUCTED (pixels under removed text or UI):** a two-band fill.
  - Low frequency: Telea inpaint of a ¼-resolution copy for small areas, or a cubic polynomial fitted to clean surrounding material plus a diffused boundary residual for large areas.
  - High frequency: grain copied from clean patches of the **same material in the same image**, overlap-blended, with outliers clipped.
  - No pixels come from any other image or model.
- **COVERED:** edge continuation under a layer whose motion envelope always covers it. Those pixels are never shown; doc 05 has the proof.

## Layer inventory

| # | Layer | Source region (px) | Decision | Method | Alpha | Animated | Limitations | Ready |
|---|---|---|---|---|---|---|---|---|
| 1 | Mediterranean stone, arch, village | top / right | **Retained in SIDEKICK** | original pixels | — | environment exposure settle only | 1024 px source | NO (res) |
| 2 | Classical bust | 180–530 × 0–330 | **Retained in SIDEKICK** | original pixels | — | no independent motion | Separating it would require inventing the wall behind it. Parallax is done between layers instead. | NO (res) |
| 3 | Lemon branches | 520–800 × 0–290 | **Retained in SIDEKICK** | original | — | static, by design (no looping sway) | same | NO (res) |
| 4 | Olive foliage (left, lower left) | 0–200 × 420–700, 175–355 × 1185–1345 | **Retained in SIDEKICK** | original | — | static | The leaves in front of the title paper stay in the SIDEKICK. The title layer has matching notches, and its settle is anchored beside them (≤ 26 paper-ring px shift). | NO (res) |
| 5 | Wax seal | 32–170 × 280–410 | **EXTRACTED** | GrabCut | **true alpha** (10 468 opaque · 2 343 partial px) | press: scale 1.06 → 1, −3° → 0 | Under it in the SIDEKICK: COVERED fill, 0 px ever exposed | YES at this resolution |
| 6 | Main title paper | 71–670 × 281–563 | **EXTRACTED**, text RECONSTRUCTED | GrabCut + hole fill − seal − leaves; MONEY and script removed by two-band fill | **true alpha** (108 772 opaque · 10 458 partial) | settle: scale 1.014 → 1 about (18 %, 70 %) | The text area is reconstructed parchment (38 780 px), slightly smoother than the original grain; live type covers most of it. | PARTIAL |
| 7 | Dark financial-summary band | y 490–720 | **Retained in SIDEKICK**, text RECONSTRUCTED | two-band fill (27 307 px), dividers redrawn live | — | values rise (DOM) | Very clean: mottled dark paper hides fills well | YES at this resolution |
| 8–11 | Four account papers (bank, payout, cash, credit), including their imagery (village, olive/lemon, amphora, coin) | `card_*` rects in `F05_MOTION_GEOMETRY.json` | **EXTRACTED**, text and chevron RECONSTRUCTED | exact rounded-rect alpha (r = 19); ~10 k text px and ~300 chevron px per card filled | **true alpha** (≈ 76–86 k opaque, ≈ 640 partial each) | entrance settle, hover, press, lift, route morph | The original drop shadows lay on the panel and are redrawn by CSS. The imagery is part of each card, not a separate layer. | PARTIAL |
| 12 | Account panel parchment (behind the cards) | 52–962 × 731–1180 | **Retained in SIDEKICK**, interior RECONSTRUCTED | polynomial lighting + same-material grain (412 201 px) | — | static | **Smoother and flatter than the original parchment** (fibre mottling is lost). Shows in the gaps and in empty or short pages. | NO |
| 13 | Elastic panel tile | rows 800–1090 of #12 | **RECONSTRUCTED** (seamless, lighting flattened) | crossfade into rows below 1090 | — | repeat-y on tall phones | Same flatness as #12. Faint right-edge repetition (6 css px) on tall phones. | NO |
| 14 | JURNL tag | 18–254 × 38–204 | **Retained in SIDEKICK**, text RECONSTRUCTED (6 242 px) | polynomial + grain limited to the tag paper | — | static | live `JURNL` text in Authority Serif, rotated −3.2° | PARTIAL |
| 15 | Search and add chips | 798–979 × 30–107 | **Removed** (stone RECONSTRUCTED, 12 160 px) | two-band fill | — | — | Redrawn live as rounded squares beside the global menu chip | YES |
| 16 | Page dots | 466–558 × 1200–1226 | **Removed** | panel fill | — | — | Drawn live only when there is more than one page | YES |
| 17 | Bottom nav paper | y 1330–1536 | **Retained in SIDEKICK**, icons, labels and pill RECONSTRUCTED (50 082 px) | polynomial + grain | — | static (the dock is always available) | Slightly smoother where the dark MONEY pill was | PARTIAL |
| 18 | Landscape engraving, print fragments, red papers | lower right, left edge | **Retained in SIDEKICK** | original | — | static | — | NO (res) |
| 19 | Foreground shadows | (in source, under the cards and title) | **Reconstructed using CSS** | `drop-shadow` halos on papers; settle shadow on the title | — | with motion | — | YES |
| 20 | Paper texture tile | bank card's clean parchment, 208 × 128 | crop of the reconstructed card | — | — | — | Background of the ADD / MOVE / empty papers and sheets | YES |
| 21 | Torn top edge strip | panel edge, y 676–772 | **EXTRACTED** | luminance key (parchment against the dark band) | **true alpha** | — | Dresses the top of the sheets | YES |

**TRUE_ALPHA_LAYERS: 7:** title paper, wax seal, four account papers, torn edge strip. None of them is a crop with a baked-in background labelled "transparent".

## SIDEKICK

- **SIDEKICK_PREVIEW:** `F05_MOTION_SIDEKICK.webp` (1024 × 1536). **Text-free: PASS.** No wordmark, heading, script, balances, account names, amounts, action labels, nav labels or icons, buttons or page indicators remain. See `03_SIDEKICK_BACKGROUND_CANDIDATE/`.
- **SIDEKICK_PRODUCTION_CANDIDATE: not issued.** It does not qualify, for three reasons:
  - **Resolution:** 1024 px, below a 3× phone's 1266 device px.
  - **Reconstruction:** the panel and nav interiors are smoother than the source.
  - **Covered pixels:** two COVERED regions under the title paper and the seal (109 701 px) are edge continuations, not real background. They are never exposed by the verified envelopes, but they are not a background either.
- **Duplicates:** none. The moving seal and title paper are not left in the SIDEKICK: their footprints are covered fill plus a 9 px ring of the title's own text-free paper. Nothing ghosts behind them.

## What a production version needs (founder decision, doc 16)

1. A layered native master: each paper, the seal, the bust and the panel delivered separately at ≥ 2048 × 3072, with the panel's own parchment uncovered. That removes every RECONSTRUCTED and COVERED region above.
2. The same text-free master for the band and the nav paper.
3. Approval of the live typefaces (doc 11).
