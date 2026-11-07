# 05 · 22 motion assets (transparent PNGs)

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.


- **Originals:** the hashes are in `INPUT_V9/README.md`.
- **Runtime derivatives:** `src/projects/jurnl/families/F05_MONEY/DOT01/F05_DOT01_<NN_NAME>.webp`. Each is trimmed to its alpha bounding box and converted to lossless-alpha WebP by `scripts/jurnl/f05-motion-pilot/extract_dot01.py`, with no resampling of the art.
- **Alpha check:** 22 / 22 have real transparency (fully transparent corners, partial alpha on the torn edges and shadows). Their interior alpha is about 252–253 and their baked shadows are low-alpha, so they composite cleanly over parchment and field.

| Asset | Size | α = 0 | partial α | opaque | alpha bbox | Runtime use |
|---|---|---|---|---|---|---|
| 01_HEADING_PARCHMENT | 1536×1024 | 45.13 % | 54.87 % | 0.0 % | [33, 203, 1493, 825] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 02_LAUREL_WAX_SEAL | 1254×1254 | 49.67 % | 50.31 % | 0.02 % | [112, 107, 1141, 1125] | mounted: confirmation stamp (saved purchase, correction saved) |
| 03_OLIVE_BRANCH_RED_FABRIC | 1086×1448 | 70.97 % | 29.01 % | 0.01 % | [65, 35, 867, 1411] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 04_LEMON_BRANCH_BLOSSOMS | 1122×1402 | 49.65 % | 50.32 % | 0.03 % | [107, 35, 1080, 1387] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 05_PARCHMENT_SCENIC_COMPOSITION_A | 1448×1086 | 35.92 % | 64.08 % | 0.0 % | [63, 139, 1370, 966] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 06_PARCHMENT_SCENIC_COMPOSITION_B | 1448×1086 | 52.53 % | 47.47 % | 0.0 % | [48, 188, 1408, 859] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 07_PARCHMENT_SCENIC_COMPOSITION_C | 1448×1086 | 39.3 % | 60.7 % | 0.0 % | [36, 125, 1406, 923] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 08_PARCHMENT_COASTAL_PANEL | 1448×1086 | 57.28 % | 42.72 % | 0.0 % | [29, 267, 1412, 813] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 09_BLANK_TORN_PARCHMENT | 1448×1086 | 18.58 % | 81.42 % | 0.01 % | [32, 32, 1415, 1053] | mounted: 9-slice "blank" paper of the content kit |
| 10_SMALL_OLIVE_FOLIAGE | 1086×1448 | 70.04 % | 29.93 % | 0.03 % | [77, 185, 1014, 1212] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 11_ENGRAVED_COASTAL_FOREGROUND | 2172×724 | 55.21 % | 44.79 % | 0.0 % | [19, 89, 2157, 661] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 12_WIDE_TORN_BANNER | 2172×724 | 37.27 % | 62.73 % | 0.0 % | [57, 80, 2127, 640] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 13_TORN_PARCHMENT_PANEL | 1448×1086 | 37.95 % | 62.05 % | 0.0 % | [47, 148, 1398, 926] | mounted: 9-slice "panel" paper |
| 14_LARGE_PARCHMENT_SHEET | 1448×1086 | 42.96 % | 57.04 % | 0.01 % | [61, 196, 1386, 916] | mounted: 9-slice "sheet" paper |
| 15_TEMPLE_COASTAL_COMPOSITION | 2172×724 | 22.44 % | 77.56 % | 0.0 % | [68, 17, 2104, 708] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 16_MEDITERRANEAN_RECEIPT_FRAME | 1448×1086 | 35.56 % | 64.42 % | 0.01 % | [51, 175, 1397, 946] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 17_TORN_RECEIPT_STRIP | 2172×724 | 41.18 % | 58.82 % | 0.0 % | [71, 142, 2094, 607] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 18_TERRACOTTA_PLATE_RIM | 1254×1254 | 81.06 % | 18.94 % | 0.01 % | [759, 60, 1121, 1205] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 19_PARCHMENT_ACTION_STRIP | 2172×724 | 59.26 % | 40.73 % | 0.0 % | [29, 210, 2145, 523] | mounted: 9-slice action strip in content |
| 20_NARROW_PARCHMENT_ACTION_STRIP | 2172×724 | 56.6 % | 43.4 % | 0.0 % | [37, 179, 2137, 520] | validated, not mounted (the SIDEKICK carries it baked; a moving copy over the identical baked object is not allowed) |
| 21_RECEIPT_CAPTURE_FRAME | 889×872 | 50.58 % | 49.42 % | 0.01 % | [10, 13, 869, 868] | mounted: photo frame on SCANNING (27) and FAILURE (34) |
| 22_RECEIPT_PAPER_STACK | 868×864 | 31.18 % | 68.82 % | 0.0 % | [93, 10, 858, 849] | mounted: receipt paper on TRANSACTION DETAIL (11) and CORRECT (24) |

**Mounted: 7 / 22.** The other 15 duplicate something the SIDEKICK already carries baked: heading parchment, foliage, red fabric, coastal foreground, scenic compositions, banner and plate rim. The founder's rule is that a moving object is never placed over its identical baked self, and no foliage, seal or parchment edge is doubled. So they stay validated but unmounted until a screen needs one where the SIDEKICK has none.

## Asset discrepancy register

| # | Discrepancy | Effect | Handling |
|---|---|---|---|
| A1 | The 34 authorities other than 01 / 02 / 26 are separate renders, not the SIDEKICKs | environment pixels differ by 15–57 % in the statue region | SIDEKICK used; each difference measured in doc 13 |
| A2 | Seal icons vary per authority (scales, coin, sync, lock …); the SIDEKICKs carry one laurel seal | the seal differs on 33 screens | laurel seal kept; per-screen seal art would need to be supplied |
| A3 | Engraved strip and row icons (book, coins, column, cart …) are not supplied as layers | live line icons are used instead | an icon sheet would make them exact |
| A4 | The amphora (04), coin (05) and keychain (03) art of the account pages are not among the 22 PNGs | SK01's card art identifies those kinds | layers of that art would make 03–05 exact |
| A5 | The sample receipts printed in authorities 26–29, 33 and 34 | JURNL shows the user's own photo, never a sample | intentional; the main source of the remaining difference on 26 |
| A6 | The authorities' figures (e.g. $6,420, JAN 28, 2025) are sample values | runtime figures are the user's own | intentional |
