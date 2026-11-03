# 18 — Reference update: 9:16 composition and native text-free SIDEKICK

During review, the founder supplied two more references (`JURNL/F05_MONEY_MOTION_PILOT/INPUT_V2_9x16/`):

| | Size | Alpha | What it is |
|---|---|---|---|
| `MONEY_PARENT_REFERENCE_9x16.png` | 941 × 1672 RGB | none | the MONEY parent at phone proportion (9:16), same design as the 2:3 approved parent |
| `MONEY_PARENT_SIDEKICK_9x16.png` | 941 × 1672 RGB | none | a **text-free render** of the same composition |

## Forensics

**Text-free: verified.** The SIDEKICK has none of the following:

- JURNL tag paper, MONEY heading, script line;
- HELD / OWED / COMMITTED / AVAILABLE figures;
- account names, amounts, chevrons, OWED tag;
- search and add chips, page dots;
- nav icons, labels and the dark MONEY pill.

The title paper, band, card faces and nav paper are blank. The card imagery (village, olive and lemon, amphora, coin) is present.

**Not pixel-aligned with the reference.** It is a separate render of the same design, not the reference with its text removed:

- ORB features and RANSAC give a best similarity transform of scale 0.987, rotation 0.32°, shift (13, −0.3) px;
- after that alignment, 38 % of pixels still differ by more than 24/255;
- the residual is local: the papers sit about 6–13 px lower, and the jug, coin and engraving are shifted.

**Consequence:** the runtime environment is the SIDEKICK, and every object (papers, title paper, seal) is extracted from it, so the layers register with their own background exactly. Live type is placed to the reference's ink positions. A pixel comparison against the reference therefore measures the misregistration between the two supplied renders as well as the runtime (doc 11).

## What changes against the 2:3 extraction (doc 02)

| Region | 2:3 profile (V1) | 9:16 profile (V2) |
|---|---|---|
| Title paper, band, nav paper, chips, dots, JURNL text | RECONSTRUCTED (text, icons and pill removed; ≈ 135 000 px) | **native, no reconstruction** |
| Card faces (names, amounts, chevrons) | RECONSTRUCTED (≈ 41 000 px) | **native, no reconstruction** |
| JURNL tag paper | in the environment, text RECONSTRUCTED | **absent from the SIDEKICK** → lifted from the reference as a true-alpha layer, ink RECONSTRUCTED (3 486 px), placed over the SIDEKICK's own stone (no covered fill needed) |
| Panel under the papers | RECONSTRUCTED (412 201 px) | RECONSTRUCTED (402 276 px): still required, because the papers are painted onto the panel |
| Under the title paper and seal | COVERED (109 701 px), 0 px exposed | COVERED (98 143 px), **0 px exposed** |
| Resolution | 1024 × 1536 | 941 × 1672 (slightly fewer px across) |
| Phone fit | 2:3 → 532 source px of elastic panel at 393 × 852 | 9:16 → **≈ 238 source px**: the panel grows far less |

**Text-free SIDEKICK:** PASS. It is now native, apart from the panel under the papers, which the composition does not contain.
**SIDEKICK production-ready:** NO. The source is 941 px wide, and the panel under the papers is reconstructed.

## Composition decisions

- **Phones:** 4 papers per page, as in the reference, with the page dots. A third row appears only when the elastic panel has room for it plus 80 source px of breathing space; otherwise the two rows spread.
- **Chips:** the reference has a bare search glyph and a "+" square. As in V1, the pilot uses three rounded squares (search, +, global menu): no circular controls, and the account-drawer menu is kept.
- **Previous 2:3 assets:** these are no longer used at runtime. `extract_layers.py` still reproduces them exactly, and they remain in this package (04, 05) for comparison.

## Later in this sprint (kept here so the pilot record stays complete)

- **Runtime switched to the 9:16 composition** in commit `bf5e4396`. The live type was re-measured against the 9:16 reference: median offset 2 px; MONEY, script and nav within 1–2 px.
- **Superseded by the carousel sprint.** The carousel's evidence is in `JURNL/MANIFEST/F05_MONEY_PARENT_CAROUSEL_V1/`. Where it differs from docs 06, 09 and 16 here, the carousel docs are current. This record is otherwise unchanged.
  - **Pages of places → ALL PLACES.** The parent no longer pages places. The four dots are the four collections.
  - **Fixed 2 × 2 grid.** Every collection is the 2 × 2 grid, so tall phones no longer get a third row (doc 16 question 4).
