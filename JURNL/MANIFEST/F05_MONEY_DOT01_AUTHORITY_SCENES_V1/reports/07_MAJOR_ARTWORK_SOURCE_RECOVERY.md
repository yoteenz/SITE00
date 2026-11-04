# 07 · Major artwork: source recovery (keychain · amphora · bronze coin on red fabric)

## Search for a native source (done before any extraction)

| Searched | Keychain (03) | Amphora (04) | Coin on red fabric (05) |
|---|---|---|---|
| V9 22 motion PNGs (`DOT01/F05_DOT01_01…22_*.webp`, contact sheet checked) | absent | absent | absent (03_OLIVE_BRANCH_RED_FABRIC is a branch on a fabric scrap, no coin, different crop) |
| V9 SIDEKICKs SK01 / SK02 / SK03 | absent | absent | absent |
| V9 SK02 papers (balance, stats, scenic, strips) | absent | absent | absent |
| Micro-asset Batches 01–04 (40 founder icons) | absent | absent | icon-scale coins only (`ICON.COINS.STACK`, `ICON.CASH.COIN`, B02 brass coin stacks, B03 coin payment): not the bronze emperor coin, ≤ icon size |
| Grok Batches 05 / 06 (20 files, OPUS1 review) | absent | absent | absent |
| Founder uploads in this workstream | absent | absent | absent |
| Parent motion-pilot card thumbnails (`F05_MOTION_CARD_*`) | a thumbnail of the parent card, **not** the 03 object (and thumbnail scale) | idem | idem |

**Result: no native, layered, full-resolution master exists for any of the three objects.** The only full-scale source
of each is its lossless authority render.

## What the runtime uses — EXACT SOURCE, authority-extracted

`scripts/jurnl/f05-motion-pilot/extract_dot01_account_scenes.py` lifts each page's **scene band** (from under the title
paper to the first action row) out of the lossless authority PNG — keychain / amphora / coin **at the authority's own
pixel scale, never upscaled** — and reconstructs only the live-text pixels inside fixed text boxes (OpenCV TELEA
inpainting of light glyphs on the olive ground and ink on parchment). Every object, rule, parchment edge, engraving
and botanical is the authority's own pixel. Output: `src/projects/jurnl/families/F05_MONEY/DOT01/SCENES/`.

| Scene | Authority | Band (authority px) | Reconstructed text px | Share of band | Runtime file | Bytes |
|---|---|---|---|---|---|---|
| 03 | 03_RIDESHARE_CARD `68895b97…` | x 0–941, y 548–1172 | 39 825 | 6.8 % | F05_DOT01_SCENE_03.webp | 183 730 |
| 04 | 04_CASH_ON_HAND `9ecd23ed…` | x 0–941, y 542–1138 | 40 378 | 7.2 % | F05_DOT01_SCENE_04.webp | 183 536 |
| 05 | 05_CREDIT_CARD `ec4d6ab7…` | x 0–941, y 548–1044 | 44 875 | 9.6 % | F05_DOT01_SCENE_05.webp | 133 460 |
| seal 03 | 03_RIDESHARE_CARD (car emblem) | ellipse c(103, 410) r 76 × 78 | 0 | — | F05_DOT01_SEAL_03.webp | 14 780 |

The extraction is deterministic: re-running it reproduces byte-identical WebP files (verified by SHA-256 after each
calibration pass).

## What this does NOT give (honest limits)

* The objects are **flattened into their band**: the keychain cannot swing, the amphora cannot be lifted, the coin
  cannot catch light separately. The band moves as one layer (the parent → child shared element `jrn-place`).
* Segmenting the objects out of the render was considered and **rejected**: a hand-cut matte around the keychain chain,
  the amphora handles or the coin rim would ghost under motion and would be a new, unapproved derivative.

## Recovery request (for the founder / art source)

For each object, a native layer at ≥ 2× authority scale with real alpha, text-free, matching the authority pose:

| ID | Object | Authority box (px, 941 × 1672) | Notes |
|---|---|---|---|
| F05.D01.ART.KEYCHAIN.RIDESHARE | leather car fob + brass key + ring + lemon / blossom sprig | ≈ x 560–930, y 548–900 | fob emblem = 03's car seal |
| F05.D01.ART.AMPHORA.CASH | terracotta amphora with olive engraving + lemon + stone base | ≈ x 30–380, y 585–1060 | |
| F05.D01.ART.COIN.CREDIT | bronze laureate coin + red fabric fold + olive sprig | ≈ x 560–941, y 780–1044 | fabric continues behind the first action row |
| F05.D01.SEAL.CAR.RIDESHARE | wax seal with car emblem | c (103, 410), r ≈ 76 | currently authority-extracted |

Until those arrive the bands are the approved art; when they arrive, `accountScenes.ts` takes them as extra layers
over a text-free, object-free plate without changing the page.
