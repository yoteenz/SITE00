# 08 · Generic button override — root cause (verified in code and in the running app)

## The rule

Every DOT 01 action outside 06 is the kit `Button` (`src/projects/jurnl/runtime/screens/f05/dot01/kit.tsx:220`):

```tsx
<button className={`d01-btn ${quiet ? 'd01-btn--quiet' : ''} ${danger ? 'd01-btn--danger' : ''}`} …>
```

styled by one shared rule (`jurnl-f05-dot01.css`, `.jrn .d01-btn`, line ≈ 468 on the base):

```css
border-radius: 14px;
background: linear-gradient(180deg, #3b4128 0%, var(--d01-olive-deep) 100%);   /* primary */
box-shadow: 0 5px 10px …, inset 0 1px 0 …;
.d01-btn--quiet { background: rgba(239, 227, 203, 0.95); box-shadow: … inset 0 0 0 1.5px rgba(31,24,16,.4); }
```

— a rounded rectangle with a CSS gradient. No asset was referenced. That is the GENERIC_BUTTON_SURFACES_OVERRIDE_AUTHORITY
finding: the authorities draw a dark-olive **pill** with a thin cream rim (primary) and a cream **pill** with a deckled rim
(secondary), on every overlay from 14 to 37 and on the 07–13 pages.

## Census evidence (probe `CONTROLS=1`, 471 × 836, every visible control's computed surface)

| Head | `.d01-btn` controls in the 37 states | with an artwork surface | with a CSS surface |
|---|---|---|---|
| before (`8e0b8d861`) | 49 | 0 | 49 |
| after (this branch) | 49 | 49 (SK03 dark / cream pill; 37's quiet pair on the V9 narrow parchment strip) | 0 |

## Secondary causes checked

| Suspected cause (sprint §02) | Found? | Evidence |
|---|---|---|
| Incomplete asset extraction | yes — the SK03 SIDEKICK's own action sheet (`F05_DOT01_SK03_SHEET.webp`) was never cut into control surfaces | report 09 |
| Generic component reuse | yes — one `.d01-btn` for every action | above |
| Incorrect asset variant | the Batch 05 moss / cream surfaces were correctly *not* mounted (brass rim, 4 : 1) | report 05 |
| Missing surface layers | yes — no pill layer at all | above |
| Incorrect CSS clipping / image scaling / aspect ratio | not applicable before (no image); after, the pill is 9-sliced on its round caps only, cap width = height × slice ÷ source height, so it is never stretched (`--d01-btn-cap`) | CSS block "OPUS3A" |
| Reconstructed surfaces replacing approved art on 06 | resolved in OPUS3 (`c4787f382`): 06 mounts its own lifted papers and glyphs | report 02 |
| Shared style overrides | the pre-OPUS3 `.d01-dir-actions .d01-btn` rule survives as dead CSS (no element matches) | report 02 |
| Scene-coordinate positioning | 06's pair is seated at the authority's coordinates (SCENE06.json) | report 02 |

## Correction (this sprint)

`.jrn .d01-btn` now draws `SCENES/F05_DOT01_PILL_SK03_DARK.webp` (primary) / `…_CREAM.webp` (quiet) as a `border-image` with
`slice 0 58 fill` / `0 48 fill` and `border-image-width: 0 var(--d01-btn-cap)`; the label is live text between the caps; a
`drop-shadow` grounds the pill on its paper; `:active` presses it 1 px with a shorter shadow; `:focus-visible` draws the gold
ring around the pill (radius 999 px); `:disabled` keeps 0.5 opacity. The destructive variant draws the same dark pill (authority 25). Single primary actions in an overlay are seated centred at
78 % of the content width, as 14 / 16 / 36 draw them. The kit API is unchanged: every caller (and every test selecting by
`data-jrn-trigger`) is untouched.
