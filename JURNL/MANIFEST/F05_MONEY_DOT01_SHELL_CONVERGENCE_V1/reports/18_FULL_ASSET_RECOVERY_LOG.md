# 18 · Full asset recovery log

| Step | Result |
|---|---|
| Founder kit (`JURNL_DOT01_37_AUTHORITY_SIDEKICK_AUDIT_OPUS_KIT.zip`) | extracted, 42 files: 37 JPEG previews (500 px, not production), 3 SIDEKICK previews, audit, README |
| V9 masters | recovered from the uploaded 7-part package (already extracted in a prior session): 37 × 941 × 1672 PNG, SHA-256 equal to INPUT_V9/README.md (e.g. 06 `4161e407…`, 22 `4f70fa1e…`) |
| SIDEKICKs | INPUT_V9/SIDEKICKS (lossless PNG), hashes in report 03 |
| 22 motion PNGs | trimmed WebP derivatives in families/F05_MONEY/DOT01 (unchanged) |
| Large illustrations | keychain / amphora / coin: OPUS2 bands (verified); 06 papers + actions + glyphs, 22 band + seal: lifted this sprint |
| Generation | none. OpenArt / Grok / any paid provider: not used |

Source gaps (no layer in V9, not lifted yet): per-screen seals of 16 (temple), 17 / 19 (coin), 18 (amphora), 20 (card), 36 (padlock);
16's receipt-with-corners art; 07–10 / 25 / 35 account thumbnails; 27 scanner corners / beam. Each exists inside its own authority
render and can be lifted by the same method (report 30, next action).

## Lifted this sprint (SCENES/F05_DOT01_SCENE06.json)

| Layer | Box (authority px) | Bytes | Source |
|---|---|---|---|
| CARD06_BANK | [30, 625, 469, 872] | 40612 | 06_ALL_ACCOUNTS.png |
| CARD06_PAYOUT | [474, 625, 914, 874] | 37638 | 06_ALL_ACCOUNTS.png |
| CARD06_CASH | [28, 877, 465, 1119] | 36298 | 06_ALL_ACCOUNTS.png |
| CARD06_CREDIT | [474, 879, 915, 1116] | 42572 | 06_ALL_ACCOUNTS.png |
| ACTION06_ADD | [80, 1163, 471, 1303] | 13016 | 06_ALL_ACCOUNTS.png |
| ACTION06_REORDER | [485, 1154, 887, 1303] | 18838 | 06_ALL_ACCOUNTS.png |
| ICON06_ADD | [140, 1190, 222, 1268] | — | 06_ALL_ACCOUNTS.png |
| ICON06_REORDER | [536, 1192, 614, 1266] | — | 06_ALL_ACCOUNTS.png |
| SCENE_22 (band) | [0, 552, 941, 1540] | 243806 | 22_EMPTY_ACCOUNTS.png |
| SCENE_22_TILE | [978, 994] | — | 22_EMPTY_ACCOUNTS.png |
| SEAL_22 | [24, 327, 164, 458] | — | 22_EMPTY_ACCOUNTS.png |
