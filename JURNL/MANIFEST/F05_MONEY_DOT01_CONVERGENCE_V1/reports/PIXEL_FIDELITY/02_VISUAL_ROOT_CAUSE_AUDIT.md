# 02 · Visual root-cause audit

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

Before any edit, every authority was compared with the runtime (DOT 01 audit captures at the same SHA, re-used as BEFORE). The discrepancies grouped into a few shared causes; each was fixed at its cause, not with per-child offsets.

| # | Discrepancy (screens) | Root cause class | Cause in code | Fix |
|---|---|---|---|---|
| 1 | Generic dark glass back chip on every screen (02–37) | INCORRECT_ASSET / MISSING_ASSET | one `.jrn-d01__chip` style for all | three authority surfaces: torn paper tile + ink arrow (02–05, 11–29), amber tile (06–10), bare search + amber add (01, 30–37); widths laid out from the right edge |
| 2 | Overlay titles thin, wide-spaced, too far left and too low (14–37) | INCORRECT_FONT_METRICS + INCORRECT_ABSOLUTE_POSITION | one heading box and one size rule for pages and overlays (weight 500, 0.06 em, 430 px measure) | overlay heading box (left 196, top 318, 520 × 180), weight 600, 0.02 em, 500 px measure |
| 3 | Field labels and values in the sans; generic boxed rows (14–37) | INCORRECT_FONT_METRICS | `.jrn-d01__content` defaults to JURNL Sans | serif for labels / values / rows; sans kept for notes |
| 4 | Native select / date popups (16–37, 31) | INCORRECT_STATE_RENDERING | `<select>` and `<input type="date">` | JURNL_SELECT / JURNL_DATE_PICKER (addendum) |
| 5 | Form rows on one sheet where the authority draws separate torn strips; primary action below the fold (16–20) | INCORRECT_LAYOUT_ARCHITECTURE + INCORRECT_OVERFLOW | one Paper sheet; overlay content box started at 590 and ended at 1520 | `fields="strips"` (founder action-strip paper per row), shared `OVERLAY_CONTENT` 552–1574 as drawn, ≈ 43 px row pitch |
| 6 | Dark olive tiles behind every icon; authorities alternate ink glyphs and moss / terracotta tiles per screen | INCORRECT_ASSET | one `.d01-row__ico` style | `fieldIcons` / `stripIcons` per screen (`ink` default, `tiles` on 05, 11, 16, 20, 24) |
| 7 | Generic line icons where the founder supplied art | MISSING_ASSET | no registry | micro-asset registry + `MicroIcon` (doc 08) |
| 8 | 02–05 stat words and figure weight differ | INCORRECT_STATE_RENDERING + INCORRECT_FONT_METRICS | SET ASIDE / NOT LEFT YET / ON ITS WAY IN for every kind | the authority words per kind over canonical values; weight 600 |
| 9 | 06 cards short and light; one-line actions; extra summary line | INCORRECT_ASPECT_RATIO + INCORRECT_FONT_METRICS | card 410:195, type 0.92× / 1.45× weight 500 | 410:214, 1.05× / 1.72× weight 600, two-line actions on a torn strip, summary screen-reader only |
| 10 | 03 / 04 / 05 use the bank composition | INCORRECT_LAYOUT_ARCHITECTURE (+ MISSING_ASSET) | one SK02 layout for every kind | **not rebuilt in this sprint**: the keychain, amphora and coin layers are not available (source recovery); words, tiles and assets corrected (doc 20) |
| 11 | 07 / 13 / 23 / 31 structure differs (ledger table, large figures, filter chips) | INCORRECT_LAYOUT_ARCHITECTURE | functional layouts from the DOT 01 build | **not rebuilt**; recorded per screen (doc 17, doc 20) |
| 12 | Per-screen wax seals (bank, coins, amphora, scales …) | MISSING_ASSET | one laurel seal baked in the SIDEKICKs | not supplied; recorded (doc 20) |

BAKED_ARTWORK_DUPLICATION: none introduced. No micro-asset is placed over an identical baked object; the 15 motion PNGs that duplicate SIDEKICK content stay unmounted (DOT 01 audit doc 10).
