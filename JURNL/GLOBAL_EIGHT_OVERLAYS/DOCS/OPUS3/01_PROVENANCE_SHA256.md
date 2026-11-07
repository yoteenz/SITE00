# 01 · Provenance and SHA-256 map (OPUS3)

Sources of record, byte-for-byte as supplied:
- `JURNL/GLOBAL_EIGHT_OVERLAYS/CLEAN_ARTWORK_OPUS3/` — the 15 curated PNGs (P1.zip / P2.zip); every SHA-256 equals `05_MOUNT_CONTRACT/CURATED_ASSET_MANIFEST.csv`.
- `JURNL/GLOBAL_EIGHT_OVERLAYS/REGENERATED_SCREEN_CANDIDATES/` — the six regenerated shells the founder named correct on 2026-11-06 (JURNL_REGENERATED_SCREEN_CANDIDATES.zip, sha256 `c9d2db2e7460514fde3d502bd0012e4cfb1e73303896d69c2aa7aa815204a992`), with their `REVIEW_STATUS.json` and `SHA256SUMS.txt`.

Runtime copies: `src/projects/jurnl/runtime/global/overlays/clean/`, written with their registry by `scripts/jurnl/global-menu/derive_clean_artwork.py` (python3 -I). Native resolution always; no resize, crop or stretch. Lossless WebP keeps every visible pixel (compared premultiplied); q92 is used only for the OV08 composition; the regenerated shells take q95 only when it holds >= 42 dB, otherwise lossless (they are already low resolution, so all six are lossless). A file that is not mounted has no runtime copy.

| # | Source file | Source SHA-256 | Size | Mount | Runtime file | Runtime SHA-256 | Bytes | Encoding | Visible pixels |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `01_CLEAN_ENVIRONMENTS/CH01-BUFFER-CLEAN-ENVIRONMENT.png` | `0a0cd02f27ae067138d4db409094ee8cb62ae97a7555b0ffb743cfbfc410b66e` | 941×1672 | NOT_MOUNTED | — | — | — | — | — |
| 2 | `01_CLEAN_ENVIRONMENTS/CH02-PRIVACY-CLEAN-ENVIRONMENT.png` | `f6966a65f0f14485ea684072b3d796f6363042592be3d46ed9a75bf1c3e7c836` | 941×1672 | NOT_MOUNTED | — | — | — | — | — |
| 3 | `02_GROK_PASS_COMPOSITIONS/OV05-SEARCH-OPEN-COMPOSITION.png` | `1ea6ad3e4004f9436a2cf98c6797f37e235f262f81511c22493b9e432bad8797` | 2016×3584 | NOT_MOUNTED | — | — | — | — | — |
| 4 | `02_GROK_PASS_COMPOSITIONS/OV08-SECTIONED-MENU-ENVIRONMENT.png` | `c55ce2a94b7eae0cd197f166014b0af84d4c293b457dde84c3700f8822d56dd8` | 2016×3584 | MOUNTED | `OV08_MENU_ENVIRONMENT.webp` | `d1489b5b99ed05e48cfe8b3fb2daa327de32850ef593238ee2a025de70ea20ab` | 1,491,586 | q92 | PSNR 40.58 dB |
| 5 | `03_INDEPENDENT_ACTION_ART/OV04-RENAME-CREAM-TEXTFREE.png` | `66899a6d44cbe495444386e09f564123afd746d53657c25bb6dfae1318c80b65` | 1645×319 | MOUNTED | `OV04_RENAME_PAPER.webp` | `741dae7360cf5c7892b41a306beaa11cf598ef3ef709149cb9bbb6e04b55f969` | 493,006 | lossless | identical |
| 6 | `03_INDEPENDENT_ACTION_ART/OV04-DELETE-BLUSH-TEXTFREE.png` | `967ce73dae92dd20c460ed9659b9b0c504efa71e8204d8723ac618209170451e` | 1645×346 | MOUNTED | `OV04_DELETE_PAPER.webp` | `8f5b5d7250f4466d7e6e3dfcf7b64e23172f32764abbc0a31d5fe29a4d77c089` | 548,138 | lossless | identical |
| 7 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-HEADER-TEXTFREE.png` | `8e484dd703e4d0e891ba06b81089c8d941a942626d86c85019d75e750fe6fabb` | 1462×738 | WITHHELD | — | — | — | — | — |
| 8 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-AMOUNT-PAPER-TEXTFREE.png` | `bb16bda09e295ea30e55f9e6583971b0ca89243df13f9af4e82227c971c5978b` | 1297×341 | MOUNTED_CONDITIONAL | `CH01_AMOUNT_PAPER.webp` | `cc8426032976018b23f0c794f42b04172a78be1e35924ef2c8c2fad0713f9bb1` | 346,894 | lossless | identical |
| 9 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-EFFECT-PAPER-TEXTFREE.png` | `d57f8db2e4cadde69628393ff5743047a624b6747dad3027d73038ce93cdcb91` | 1367×411 | MOUNTED_CONDITIONAL | `CH01_EFFECT_PAPER.webp` | `fe955d37fe568c9fae0c0442992ee74b20f2828ff6c6f74fd6f5c67f59d53997` | 446,796 | lossless | identical |
| 10 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-BACK-PAPER-TEXTFREE.png` | `502c8dc3be49b435afbc710f65db98871dfdc8f16f540e79066148676af37604` | 579×219 | MOUNTED_CONDITIONAL | `CH01_BACK_PAPER.webp` | `32b755536b25797f680bf2619e3335e0606fb26169f24fe7af485259b6866ac1` | 98,038 | lossless | identical |
| 11 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-SAVE-OLIVE-TEXTFREE.png` | `db0db619df989f4d6fd20d51dc0a27de146cc9e81b82ea6f903a8f0002306e8e` | 798×373 | WITHHELD | — | — | — | — | — |
| 12 | `04_CONDITIONAL_BUFFER_PRIVACY/CH01-COIN-RESERVE-TEXTFREE.png` | `104d7d416c7dd989840b94f601e8989d833bc83ea443c77dda13164772212b85` | 1048×581 | NOT_MOUNTED | — | — | — | — | — |
| 13 | `04_CONDITIONAL_BUFFER_PRIVACY/CH02-HEADER-TEXTFREE.png` | `8e484dd703e4d0e891ba06b81089c8d941a942626d86c85019d75e750fe6fabb` | 1462×738 | WITHHELD | — | — | — | — | — |
| 14 | `04_CONDITIONAL_BUFFER_PRIVACY/CH02-REMOVE-ACCESS-TEXTFREE.png` | `c57338ab0350cccea613171ba31a87046827c1fcce6df61fdff2163cf4d9f623` | 1559×261 | MOUNTED_CONDITIONAL | `CH02_REMOVE_ACCESS_PAPER.webp` | `e007250294436b2831271300c04d20430642ba5d230801c43f5ad359788b9533` | 286,098 | lossless | identical |
| 15 | `04_CONDITIONAL_BUFFER_PRIVACY/CH02-BACK-PAPER-TEXTFREE.png` | `b983cefd616b856137f06244428d7f6a0a8243388800835e8f4eaacf5050f55c` | 1206×247 | MOUNTED_CONDITIONAL | `CH02_BACK_PAPER.webp` | `a1ca03e896a7e59fc3d72f5723207e4e1cac11e878ec3cd3d703b45549bc3443` | 239,636 | lossless | identical |
| 16 | `REGENERATED_SCREEN_CANDIDATES/CH02_PRIVACY_CONSENTS.png` | `0d81db6db7d589320d74058662db09c0b444a8783721e1284f0c206caae860cb` | 1024×1536 | MOUNTED | `CH02_PRIVACY_SHELL.webp` | `394f83481636ce38d02989664b872cb515ac05cbb3e7c41fc158bd783313a3e4` | 2,180,644 | lossless | identical |
| 17 | `REGENERATED_SCREEN_CANDIDATES/OV02_ADD_A_POCKET.png` | `b94939f2a853a2f7b5c684c740262603a6cb468ab698480e0562f4ca960fb0e9` | 1024×1536 | MOUNTED | `OV02_ADD_POCKET_SHELL.webp` | `3cc68d8fa50987ed511a728036f1d80c4e5bf3f9f857f63a0260bc36c3f434c2` | 2,202,704 | lossless | identical |
| 18 | `REGENERATED_SCREEN_CANDIDATES/OV03_MOVE_MONEY.png` | `976a49673295c021a5e25c95ca651f89a5a8616e68023f22a4980a6783f50902` | 941×1672 | MOUNTED | `OV03_MOVE_MONEY_SHELL.webp` | `7b63a857b85b41611e39e9314be3c91aacc710b1cc92ca7e8aa2d422f4b3936c` | 2,181,606 | lossless | identical |
| 19 | `REGENERATED_SCREEN_CANDIDATES/OV04_MANAGE_POCKET.png` | `c5eab73b0e291f0224627d54de23ff74696d771917ef61576f582f2060781f81` | 642×741 | MOUNTED | `OV04_MANAGE_NOTE.webp` | `9ae2346c6e6adfb8d89f905257080e48676dcad466b23c347322f98af1b0c35f` | 614,128 | lossless | identical |
| 20 | `REGENERATED_SCREEN_CANDIDATES/OV05_SEARCH.png` | `f91d9a24aa4a1558b931217fd0b84cbce528b7bc395ae728705d1a5fa1a8646d` | 581×887 | MOUNTED | `OV05_SEARCH_SHELL.webp` | `0bd069adec39e33e5819ebd88cd8b8b38b358e0887dd73bf52cee39be7d8f27e` | 775,750 | lossless | identical |
| 21 | `REGENERATED_SCREEN_CANDIDATES/CH01_SAFE_TO_SPEND.png` | `53bff1ee9542979dc5e73229a559a3a941d7ad449daa8a089f86832d33b6b496` | 560×887 | MOUNTED | `CH01_BUFFER_SHELL.webp` | `2af951778b01e080c3c331fca755911e2c3166c5f4ec937f37b6addf3e681bc9` | 695,176 | lossless | identical |

Dispositions (the registry `disposition` field, verbatim):

- `CH01-BUFFER-CLEAN-ENVIRONMENT.png` — Not mounted (founder correction 2026-11-06): a different sidekick from the BUFFER authority; superseded by the regenerated CH01 shell. Kept installed for the record.
- `CH02-PRIVACY-CLEAN-ENVIRONMENT.png` — Not mounted (founder correction 2026-11-06): a different sidekick from the PRIVACY authority; superseded by the regenerated CH02 shell. Kept installed for the record.
- `OV05-SEARCH-OPEN-COMPOSITION.png` — Not mounted: superseded by the regenerated shell the founder named correct (2026-11-06) (OV05_SEARCH).
- `OV08-SECTIONED-MENU-ENVIRONMENT.png` — GlobalMenu: its blank tag and title papers carry the live wordmark and headline; sections, rows, icons and dividers live in the olive field (the only scroll)
- `OV04-RENAME-CREAM-TEXTFREE.png` — MANAGE POCKET (on the regenerated OV04 note): backing of the live RENAME POCKET item
- `OV04-DELETE-BLUSH-TEXTFREE.png` — MANAGE POCKET (on the regenerated OV04 note): backing of the live DELETE POCKET item
- `CH01-HEADER-TEXTFREE.png` — Withheld: it is the OV08 title parchment (Grok4 unresolved gap 5) and carries a stray torn fragment along its left (x 0-0.2); the regenerated CH01 shell has no title paper, so the BUFFER headline is live type on its olive field
- `CH01-AMOUNT-PAPER-TEXTFREE.png` — SAFE TO SPEND BUFFER (on the regenerated CH01 shell): backing of the live amount field and currency (alpha valid, 1297 px for a ~250-430 px paper)
- `CH01-EFFECT-PAPER-TEXTFREE.png` — SAFE TO SPEND BUFFER (on the regenerated CH01 shell): backing of the live EFFECT ON SAFE TO SPEND figure
- `CH01-BACK-PAPER-TEXTFREE.png` — SAFE TO SPEND BUFFER (on the regenerated CH01 shell): backing of the live BACK control
- `CH01-SAVE-OLIVE-TEXTFREE.png` — Withheld: the authority gold rim is missing (Grok4 unresolved gap 4); SAVE BUFFER stays the live V3 olive control with its gold hairline
- `CH01-COIN-RESERVE-TEXTFREE.png` — Not mounted: the regenerated CH01 shell carries its own coins and olive sprig (lower left); a second still life would duplicate them. (Previously mounted on OV08 at the authority origin, sliver clipped.)
- `CH02-HEADER-TEXTFREE.png` — Withheld: byte-identical to CH01-HEADER, the OV08 title parchment already in the environment
- `CH02-REMOVE-ACCESS-TEXTFREE.png` — PRIVACY & CONSENTS (on the regenerated CH02 shell): backing of the live REMOVE ACCESS row
- `CH02-BACK-PAPER-TEXTFREE.png` — PRIVACY & CONSENTS (on the regenerated CH02 shell): backing of the live BACK control
- `CH02_PRIVACY_CONSENTS.png` — PRIVACY & CONSENTS (menu, ACCOUNT page, drawer): the shell; wordmark and headline on its tag and title papers, the consent list live in the olive field (the only scroll), REMOVE ACCESS and BACK papers under it
- `OV02_ADD_A_POCKET.png` — ADD A POCKET: the shell (statue, medallion, paper, coins); name, type, balance, notes and actions live on the paper (body scrolls)
- `OV03_MOVE_MONEY.png` — MOVE MONEY / PAY A CARD: the shell (paper with the twine and direction seal); headline and honesty note above the seal, FROM / TO / ledger / status live below it (body scrolls)
- `OV04_MANAGE_POCKET.png` — MANAGE POCKET: the popover surface (note, paperclip, coastline tear, oxblood) inside a measured outline clip (the file has no alpha); heading and the two paper-backed actions live
- `OV05_SEARCH.png` — GlobalSearchDrawer: the shell (bust, lemon, arch, paper, ledgers); field, filters, rows, separators and actions live on the paper (only the results scroll)
- `CH01_SAFE_TO_SPEND.png` — SAFE TO SPEND BUFFER: the shell (L0+L1: bust, lemons, coast, olive field, drape, coins); headline, help, papers, warnings and actions live on the olive field

Notes

- CH01-HEADER and CH02-HEADER are byte-identical (same SHA-256).
- The CH01 / CH02 clean environments, the OV05 open composition and the coin still life were runtime-mounted in earlier drafts of this sprint; they have no runtime copy now (`tests/jurnlCleanArtworkOpus3.test.tsx` K3).
- The regenerated MANAGE POCKET note has no alpha: `scripts/jurnl/global-menu/measure_ov04_note_outline.py` measures its outline into `ov04NoteOutline.ts` (a clip-path); the SEARCH shell's crop line is measured by `measure_shell_borders.py` and clipped. Neither repaints a pixel.
