# 01 · Provenance and SHA-256 map (OPUS3 curated clean artwork)

Source of record: `JURNL/GLOBAL_EIGHT_OVERLAYS/CLEAN_ARTWORK_OPUS3/` (the 15 PNGs, byte-for-byte as supplied in P1.zip / P2.zip; every SHA-256 equals `05_MOUNT_CONTRACT/CURATED_ASSET_MANIFEST.csv`).
Runtime copies: `src/projects/jurnl/runtime/global/overlays/clean/`, written with their registry by `scripts/jurnl/global-menu/derive_clean_artwork.py` (python3 -I). Native resolution always; no resize, crop or stretch.
Encoding: lossless WebP (every visible pixel identical, compared premultiplied) for papers and the coin; WebP q92 for the two 2016 × 3584 compositions (PSNR on visible pixels shown). A file that is not mounted has no runtime copy.

| # | Curated file | Source SHA-256 | Size | Mount | Runtime file | Runtime SHA-256 | Bytes | Encoding | Visible pixels |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `01_CLEAN_ENVIRONMENTS/CH01-BUFFER-CLEAN-ENVIRONMENT.png` | `0a0cd02f27ae067138d4db409094ee8cb62ae97a7555b0ffb743cfbfc410b66e` | 941×1672 | NOT_MOUNTED | — | — | — | — | — |
| 2 | `01_CLEAN_ENVIRONMENTS/CH02-PRIVACY-CLEAN-ENVIRONMENT.png` | `f6966a65f0f14485ea684072b3d796f6363042592be3d46ed9a75bf1c3e7c836` | 941×1672 | NOT_MOUNTED | — | — | — | — | — |
| 3 | `02_GROK_PASS_COMPOSITIONS/OV05-SEARCH-OPEN-COMPOSITION.png` | `1ea6ad3e4004f9436a2cf98c6797f37e235f262f81511c22493b9e432bad8797` | 2016×3584 | MOUNTED | `OV05_OPEN_COMPOSITION.webp` | `a57781cdb9f4ec42f2fb99ce832b36e61738380738b79abc5b0bb01cc37ded61` | 1,314,656 | q92 | PSNR 41.22 dB |
| 4 | `02_GROK_PASS_COMPOSITIONS/OV08-SECTIONED-MENU-ENVIRONMENT.png` | `c55ce2a94b7eae0cd197f166014b0af84d4c293b457dde84c3700f8822d56dd8` | 2016×3584 | MOUNTED | `OV08_MENU_ENVIRONMENT.webp` | `d1489b5b99ed05e48cfe8b3fb2daa327de32850ef593238ee2a025de70ea20ab` | 1,491,586 | q92 | PSNR 40.58 dB |
| 5 | `03_INDEPENDENT_ACTION_ART/OV04-RENAME-CREAM-TEXTFREE.png` | `66899a6d44cbe495444386e09f564123afd746d53657c25bb6dfae1318c80b65` | 1645×319 | MOUNTED | `OV04_RENAME_PAPER.webp` | `741dae7360cf5c7892b41a306beaa11cf598ef3ef709149cb9bbb6e04b55f969` | 493,006 | lossless | identical |
| 6 | `03_INDEPENDENT_ACTION_ART/OV04-DELETE-BLUSH-TEXTFREE.png` | `967ce73dae92dd20c460ed9659b9b0c504efa71e8204d8723ac618209170451e` | 1645×346 | MOUNTED | `OV04_DELETE_PAPER.webp` | `8f5b5d7250f4466d7e6e3dfcf7b64e23172f32764abbc0a31d5fe29a4d77c089` | 548,138 | lossless | identical |
| 7 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-HEADER-TEXTFREE.png` | `8e484dd703e4d0e891ba06b81089c8d941a942626d86c85019d75e750fe6fabb` | 1462×738 | WITHHELD | — | — | — | — | — |
| 8 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-AMOUNT-PAPER-TEXTFREE.png` | `bb16bda09e295ea30e55f9e6583971b0ca89243df13f9af4e82227c971c5978b` | 1297×341 | MOUNTED_CONDITIONAL | `CH01_AMOUNT_PAPER.webp` | `cc8426032976018b23f0c794f42b04172a78be1e35924ef2c8c2fad0713f9bb1` | 346,894 | lossless | identical |
| 9 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-EFFECT-PAPER-TEXTFREE.png` | `d57f8db2e4cadde69628393ff5743047a624b6747dad3027d73038ce93cdcb91` | 1367×411 | MOUNTED_CONDITIONAL | `CH01_EFFECT_PAPER.webp` | `fe955d37fe568c9fae0c0442992ee74b20f2828ff6c6f74fd6f5c67f59d53997` | 446,796 | lossless | identical |
| 10 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-BACK-PAPER-TEXTFREE.png` | `502c8dc3be49b435afbc710f65db98871dfdc8f16f540e79066148676af37604` | 579×219 | MOUNTED_CONDITIONAL | `CH01_BACK_PAPER.webp` | `32b755536b25797f680bf2619e3335e0606fb26169f24fe7af485259b6866ac1` | 98,038 | lossless | identical |
| 11 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-SAVE-OLIVE-TEXTFREE.png` | `db0db619df989f4d6fd20d51dc0a27de146cc9e81b82ea6f903a8f0002306e8e` | 798×373 | WITHHELD | — | — | — | — | — |
| 12 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-COIN-RESERVE-TEXTFREE.png` | `104d7d416c7dd989840b94f601e8989d833bc83ea443c77dda13164772212b85` | 1048×581 | MOUNTED_CONDITIONAL | `CH01_COIN_RESERVE.webp` | `e205187f2ad562062dc93d84508357cde603248b2386270c76914bb22a7457c4` | 392,760 | lossless | identical |
| 13 | `04_CONDITIONAL_BUFFER_PRIVACY/CH02-HEADER-TEXTFREE.png` | `8e484dd703e4d0e891ba06b81089c8d941a942626d86c85019d75e750fe6fabb` | 1462×738 | WITHHELD | — | — | — | — | — |
| 14 | `04_CONDITIONAL_BUFFER_PRIVACY/CH02-REMOVE-ACCESS-TEXTFREE.png` | `c57338ab0350cccea613171ba31a87046827c1fcce6df61fdff2163cf4d9f623` | 1559×261 | MOUNTED_CONDITIONAL | `CH02_REMOVE_ACCESS_PAPER.webp` | `e007250294436b2831271300c04d20430642ba5d230801c43f5ad359788b9533` | 286,098 | lossless | identical |
| 15 | `04_CONDITIONAL_BUFFER_PRIVACY/CH02-BACK-PAPER-TEXTFREE.png` | `b983cefd616b856137f06244428d7f6a0a8243388800835e8f4eaacf5050f55c` | 1206×247 | MOUNTED_CONDITIONAL | `CH02_BACK_PAPER.webp` | `a1ca03e896a7e59fc3d72f5723207e4e1cac11e878ec3cd3d703b45549bc3443` | 239,636 | lossless | identical |

Notes

- CH01-HEADER and CH02-HEADER are byte-identical (same SHA-256): one OV08 title parchment.
- The CH01 / CH02 clean environments were runtime-mounted in an earlier draft of this sprint; the founder correction (2026-11-06) removed them: no runtime copy remains (`tests/jurnlCleanArtworkOpus3.test.tsx` K3).
- The coin still life gained a lossless runtime copy in this correction; it is mounted at its authority origin (see 02).
