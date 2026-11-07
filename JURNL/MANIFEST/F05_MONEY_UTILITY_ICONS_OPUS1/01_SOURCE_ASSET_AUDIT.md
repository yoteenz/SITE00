# 01 · SOURCE ASSET AUDIT

SPRINT: P0.JURNL.F05-MONEY.CANONICAL-UTILITY-ICON-FAMILY-INTEGRATION.OPUS1
INPUT ASSETS FOUND: 4 / 4 · PROVENANCE: FOUNDER-SUPPLIED ARTWORK · NEW ARTWORK GENERATED: 0

## The four supplied files

| # | Name | Upload | Master (kept byte-for-byte) | Size | Mode | SHA-256 |
|---|---|---|---|---|---|---|
| 01 | CLOSE / X | `9d97de54-image.png` | `JURNL/F05_MONEY/UTILITY_ICONS/ORIGINAL_PNG_MASTERS/01_F05_UTILITY_CLOSE_GOLD.png` | 1254 × 1254, 1,579,570 B | RGBA | `78672c080d139df16b6c27bdb4f2b7949f65215201f8d855abd30b3457498f95` |
| 02 | HAMBURGER / MENU | `e8e81e14-image.png` | `…/02_F05_UTILITY_MENU_GOLD.png` | 1254 × 1254, 1,922,226 B | RGBA | `eb793847b75bf01835b420875411ce1f6699a50a8d02b8181e9ed3b2a5f87c82` |
| 03 | SEARCH / MAGNIFIER | `85eec5a0-image.png` | `…/03_F05_UTILITY_SEARCH_GOLD.png` | 1254 × 1254, 1,291,748 B | RGBA | `f87f643c0b371e413b523169584d70ae668707d57349708bd8047faea4f99441` |
| 04 | PLUS / ADD | `8c6e740e-image.png` | `…/04_F05_UTILITY_ADD_GOLD.png` | 1254 × 1254, 1,209,198 B | RGBA | `ea3595d40ca6be24232a56284c9014d1b9d9a1c1644b7631a54c568cba94a3a8` |

`ORIGINAL_PNG_MASTERS/SHA256SUMS.txt` holds the same sums. The unit test `U1` re-hashes the masters and the runtime files on every run.

## Transparency validation

| | CLOSE | MENU | SEARCH | ADD |
|---|---|---|---|---|
| Alpha range | 0–255 | 0–255 | 0–255 | 0–255 |
| Fully transparent pixels | 43.7 % | 46.6 % | 52.0 % | 69.7 % |
| Partial alpha (shadow, edge) | 56.3 % | 53.3 % | 48.0 % | 30.3 % |
| Median disc alpha | 252 | 253 | 252 | 253 |
| Edge "dust" (alpha ≤ 2) cleared | 288,392 px | 116,238 px | 162,665 px | 16,123 px |
| … of which saturated red / yellow | 13,320 | 10,651 | 4,961 | 3,744 |

Verdict: **TRUE ALPHA**. There is no checkerboard baked into the pixels and no opaque background. The disc itself is about 1 % translucent (alpha 251–254); that is kept as supplied.

The background removal left near-invisible pixels (alpha ≤ 2, at most 0.8 % opacity) that carry saturated red or yellow colour. They show only in viewers that ignore alpha, but a resample could bleed them into neighbouring pixels. They are the only pixels changed: they are set to alpha 0. The largest visible change is 2 / 255.

## Geometry (measured, not assumed)

The disc is measured as the pixels with alpha ≥ 240 and luminance > 120; its bounding box gives the diameter and centre. The canvas centre is **not** the disc centre, because the soft shadows are offset.

| | CLOSE | MENU | SEARCH | ADD |
|---|---|---|---|---|
| Disc diameter (source px) | 756 | 885 | 821 | 715 |
| Disc / canvas | 0.603 | 0.706 | 0.655 | 0.570 |
| Disc centre | (615.5, 611.5) | (612.0, 606.5) | (611.0, 601.0) | (618.0, 626.0) |
| Glyph w × h (source px) | 288 × 290 | 393 × 292 | 361 × 371 | 284 × 280 |
| Glyph / disc (w, h) | 0.381, 0.384 | 0.444, 0.330 | 0.440, 0.452 | 0.397, 0.392 |
| Glyph offset from disc centre | (+9, +9) | (+11, +5) | (−5, 0) | (+3.5, −5.5) |

The disc sizes differ by up to 1.24 × between files (715 to 885 px). Shown at their raw canvas size, the four buttons would not match. This is why every runtime file is normalised **by its visible disc** rather than by its canvas.

## Derivation (mechanical; nothing redrawn)

Script: `scripts/jurnl/utility-icons/derive_utility_icons.py`. Report: `derive_report.json`.

1. Clear the alpha ≤ 2 dust (above).
2. Measure the disc.
3. Crop a square of 1.24 × the disc diameter, centred on the disc. Every soft shadow fits inside; the most source alpha left outside any crop is 3 / 255 (CLOSE).
4. Resample to 256 × 256 with premultiplied alpha (no dark or coloured halo).
5. Encode WebP. Lossy q95 measured 40.5–41.5 dB against the lossless resample on parchment, olive and oxblood, which is under the 42 dB floor, so all four are **lossless**.

| Runtime file | SHA-256 | Bytes | Disc in file |
|---|---|---|---|
| `UTILITY_CLOSE_GOLD.webp` | `872efa5e1f4d3bc4cd401a52feaa082b00e6994aa34a647f62f0e606118a19a0` | 63,956 | 206 / 256, centre (127.5, 127.5) |
| `UTILITY_MENU_GOLD.webp` | `ada2e3763fd816f5030c5ff0cdfb1cb867546ef7c3be4fbe7b14f5b729b30e15` | 57,998 | 206 / 256, centre (127.5, 127.5) |
| `UTILITY_SEARCH_GOLD.webp` | `3792edaa4dd80a3480379120b3f47cf69930e06d3f267fd125a301c02437c921` | 57,180 | 206 / 256, centre (127.5, 128.0) |
| `UTILITY_ADD_GOLD.webp` | `c74b6eedb1971951292d3dfba01d9754433521169d5bcbde3bbd200b60b1b7e7` | 57,454 | 205 / 256, centre (128.0, 128.0) |

All four share one disc fraction (0.8065 = 1 / 1.24) and one optical centre. Total runtime weight is 236,588 B. The masters total 6.0 MB and are kept out of the bundle.

## What was not done

- No icon was redrawn, regenerated, simplified, recoloured or vectorised.
- No Lucide or other generic icon was substituted.
- No CSS circle, border, background or second shadow is drawn behind the artwork.

Close-ups of each supplied PNG beside its rendered result: `CLOSE_UPS/00_ALL_SUPPLIED_VS_RENDERED.png`.
