# 03 · SIDEKICK source and hash audit

Source: the V9 full package (`JURNL_F05_DOT01_FULL_PART_01…07_OF_07.zip`, every SHA-256 matching `SPECS/FULL_PACKAGE_MANIFEST.json`),
SIDEKICK PNGs committed at `JURNL/F05_MONEY_DOT01/INPUT_V9/SIDEKICKS/`. The V9 manifest calls all three
`generated_text_free_candidate_not_pixel_extracted` — they are not cut from the authorities and are not claimed to be.

| SIDEKICK | Exact source path (repo) | SHA-256 | Size | Mode | Opaque px | Transparent px |
|---|---|---|---|---|---|---|
| SK01_PARENT_MONEY | F05_MONEY_DOT01/INPUT_V9/SIDEKICKS/SK01_PARENT_MONEY.png | `b68e5012f29fd47a…` | 941 × 1672 | RGB | 1,573,352 | 0 |
| SK02_ACCOUNT_DETAILS | F05_MONEY_DOT01/INPUT_V9/SIDEKICKS/SK02_ACCOUNT_DETAILS.png | `547d2c70ea811f0f…` | 941 × 1672 | RGB | 1,573,352 | 0 |
| SK03_RECEIPT_OVERLAYS | F05_MONEY_DOT01/INPUT_V9/SIDEKICKS/SK03_RECEIPT_OVERLAYS.png | `c11b040fe2af4ddc…` | 941 × 1672 | RGB | 1,573,352 | 0 |

All three are fully opaque RGB (no alpha): every "layer" separation is done by extraction or by authority lifts.

| | SK01_PARENT_MONEY | SK02_ACCOUNT_DETAILS | SK03_RECEIPT_OVERLAYS |
|---|---|---|---|
| Baked title parchment | yes (blank) + laurel seal | yes (blank) + laurel seal | yes (blank) + laurel seal |
| Baked decorative | statue, lemons, arch, red fabric, laurel | same hero, olive leaves, red fabric | same hero family |
| Baked foreground | large sheet (y 740–1320) with four illustrated card slots, coastal engraving (1300–1450), torn nav paper (1459–1662) | two stat papers, temple-coastal panel, three action strips, bottom landscape (1548+) | wood-grain receipt frame, two buttons, strip papers, landscape |
| Intended screens (manifest) | 01, 06 family | 02–13 | 14–37 overlays |
| Mounted (runtime) | 01 (F05_MOTION_SIDEKICK), **06 from this sprint** (SK01_FIELD) | 02–13, 22, 31, 32, 35 as SK02_FIELD (papers removed); full SK02 nowhere | 26 full; 14–37 as SK03_FIELD |
| CSS crop / scale / position | width-first on phones: u = w / (941 − 2·crop), crop ≤ 30 (06: ≤ 24); tablets / desktop: u = h / 1672, centred (ox) | same | same |
| Pixel-paired authorities (hero MAD < 7; the foot carries page content, e.g. 01's baked dock glyphs) | 01 | 02 | 26 |
| Known duplications | nav paper (SK01_FIELD baked + frame layer) — **removed this sprint** | laurel seal under SEAL_22 / SEAL_03 (fully covered) | none found |
| Missing scene regions | none: 06's lower band is SK01's own sheet + landscape | its papers are removed in SK02_FIELD (plain field 588–1548): any page whose content does not fill it shows olive — the 06 void | none |

Band distances per authority are in report 04 (mean |Δ| over the hero band x 0–820 × y 120–330 and the foot band y 1500–1672).
