# 02 · Screen 06 ALL ACCOUNTS — control composition audit

## What the founder compared

The founder's comparison describes 06's ADD ACCOUNT / REORDER ACCOUNTS as "generic rounded rectangular buttons … simplified paper
backing … generic icon placement … inaccurate surrounding parchment". That is exactly the runtime **before OPUS3**
(`d6992b3fc`, the MONEY family preview; evidence `evidence/06/06_pair_authority_pre_base_after.webp`, second panel):

| Head | ADD ACCOUNT surface | REORDER surface | Icons | Around the pair |
|---|---|---|---|---|
| `d6992b3fc` (pre-OPUS3) | CSS `.d01-dir-actions .d01-btn`: 14 px radius, olive gradient | CSS cream rectangle, 1.5 px ink inset | inline-SVG plus / arrows | a torn strip on a large olive void; no landscape |
| `c4787f382` (OPUS3) = `8e0b8d861` (this sprint's base) | **lifted authority paper** `F05_DOT01_ACTION06_ADD.webp` (391 × 140, its own torn silhouette and olive interior) | **lifted authority paper** `F05_DOT01_ACTION06_REORDER.webp` (402 × 149) | **lifted authority glyphs** `ICON06_ADD` (framed plus, 82 × 78) / `ICON06_REORDER` (engraved ↑↓, 78 × 74) | SK01 scene: the lower parchment sheet, the engraved coastal print, the olive + red fabric foliage, the torn nav paper |

The pre-OPUS3 CSS rule (`.d01-dir-actions .d01-btn`) is still in the stylesheet but no component renders `.d01-dir-actions` any
more (only `HistoryPage` uses `.d01-actions`); it is dead CSS and has no effect on 06.

## The composition as built (authority coordinates, board px of the 941 × 1672 master)

Source: `SCENES/F05_DOT01_SCENE06.json` (`actions`), lifted in OPUS3 from `06_ALL_ACCOUNTS.png` (SHA in that file); every
coordinate is the authority's own.

| Element | ADD ACCOUNT | REORDER ACCOUNTS |
|---|---|---|
| Outer torn-paper silhouette | lifted paper, box x 80–471, y 1163–1303 (391 × 140, aspect 2.79) | lifted paper, box x 485–887, y 1154–1303 (402 × 149, aspect 2.70) |
| Inner material | dark-olive fibre paper (part of the same lifted paper) | warm parchment (part of the lifted paper) |
| Icon / engraving | framed plus, x 140–222, y 1190–1268 (cream rim, colour 211 208 192) | ↑↓ engraved arrows, x 536–614, y 1192–1266 (ink 40 29 18) |
| Live text | `ADD` / `ACCOUNT`, box x 244–426, y 1192–1268, two lines, uppercase serif, cream | `REORDER` / `ACCOUNTS`, box x 638–840, y 1194–1266, two lines, ink |
| Shadow | `drop-shadow(0 7px 9px rgba(16,12,4,.5))` on the paper (contact shadow on the sheet) | same |
| Spacing | 14 px between the two papers (471 → 485) | — |
| Placement | under the card grid, on the lower sheet; moves only with the phone's extra height (`actionsDy`), never with the pocket count | same row |
| Layer order | L1 scene (SK01_FIELD) → paper → glyph → live label (button) | same |
| Hit area | the whole paper box is one `<button>` (`data-jrn-trigger="d01-add-account"`), `aria-label="ADD ACCOUNT"` | `d01-reorder`, disabled with < 2 pockets |

No baked text, no example balance: the labels are live, the lifted papers were masked of their authority lettering.

## Measured on the runtime (this sprint, after)

See report 03 / 04 for the crop-level comparison. The E2E `S1` (`e2e/jurnl/jurnl-f05-dot01-artwork-type.e2e.ts`) asserts on the
running app: surface image = `ACTION06_*`, glyph = `ICON06_*`, label text, ≥ 44 px, a tap at the centre reaches the button (no
decorative interception), no CSS background on the button, ADD left of REORDER on one row, Enter opens ADD ACCOUNT, no page
scroll. The OPUS3 directory suite (`jurnl-f05-dot01-directory.e2e.ts`, D1/D2/D4/D7 + X1) covers the 1 / 2 / 4 / 7-pocket and the
empty variants.

## Verdict

SCREEN06_ADD_ACCOUNT and SCREEN06_REORDER_ACCOUNTS are composed from the authority's own pixels (METHOD B: lifted paper + lifted
glyph + live text + CSS contact shadow). The generic buttons the founder saw belong to the pre-OPUS3 head. Remaining differences
are typographic weight (the live label is set in the runtime serif, the authority's lettering is slightly heavier) and the
founder's visual approval, which stays a separate decision.
