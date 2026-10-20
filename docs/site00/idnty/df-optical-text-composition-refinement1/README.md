# DF crown text — optical composition refinement 1

Sprint `P0.SITE00.IDNTY.FOUNDATION-BUILDER.OPUS-OPTICAL-TEXT-COMPOSITION-REFINEMENT1` · branch
`cursor/idnty-living-portal-one-pass-completion1-be3b` · draft PR #1671 · not merged, not deployed.

All evidence below comes from the **actual React client** (`/foundation/:token` on the Vite dev server with the
cloud-preview memory store, real fixtures) and from the founder review page `/foundation/review`. Nothing here is a
static board. "Before" is remote `18753cbb2` (Composer's crown contract + the founder's latest copy); "after" is the
same tree plus this change.

The four founder screenshots named in the sprint were not attached to the request, so the before captures are taken
from the same React screens instead.

## Root cause of the over-constraint

`--df-crown-text-max` was `100% − min(46%, 230px) − gap`, resolved against `.df-screen__main`:

1. **It subtracted the artwork's whole box, not the artwork.** The crown SVG (viewBox 180×320, `xMaxYMin meet`)
   draws nothing in its left 24/180; its left edge is a faded beam, a glass pane and the stone side. Phone and tablet
   text stopped 50–130px short of anything drawn.
2. **On desktop it subtracted a band the text column never meets.** At ≥1100px the column is 520px and the art box
   begins at 54% of a ≥1100px screen — always right of the column — yet the column was cut to 257px. The lede ran
   four or five narrow lines, and the headline's red period wrapped onto its own line (P04 at 1194–2560px).
3. **The rail had no artwork rule at all.** Its label overflowed its max-width, so RECOMMENDATION ran into the
   stone mass at 320–375px and in the review frames (−41px).

## Change (text only)

`src/site00/styles/site00-df-client.css`

| Role | Stops one gap short of | Contract |
|---|---|---|
| Rail | stone side, x 52 | `--df-crown-rail-max: calc(100% + gutter − art-w × 128/180 − gap)` |
| Headline | beam, x 24 | `--df-crown-text-max: calc(100% + gutter − art-w × 156/180 − gap)` |
| Lede | glass pane, x 36 | `--df-crown-lede-max: calc(100% + gutter − art-w × 144/180 − gap)` |

- `--df-crown-art-w` is the SVG's drawn width inside the **locked** box. Phone: `min(46% of screen, 230px, 340px × 9/16)`. Tablet: `min(44%, 300px, 440px × 9/16)`.
- **Desktop (≥1100px):** the art never reaches the column, so every role takes the column. The lede keeps its 440px measure.
- **Review frames:** these are 390px phones at every viewport, so they keep the phone values. At ≥1100px they inherit the desktop rail margin, which lowers the rail beside the beam, so they use the beam edge.
- **Rail rule:** the 76px rule may shrink, down to 16px, before a long label wraps or reaches the art.
- **P01 lede:** "TYPICALLY 2–3 BUSINESS DAYS." travels together as an inline-block capped at the lede width.
  - This stops "TYPICALLY" sitting on the red column at 402–430px.
  - It stops "2–" / "3" from splitting at desktop widths.
  - At 200% text size it still wraps inside the lede.
  - Copy is unchanged and there is no manual break. The line count is unchanged at every width, so the in-flow hero art does not move.

**Not changed:**
- any artwork CSS, SVG, source, position, size, crop, opacity, z-index, animation or responsive breakpoint;
- font sizes, letter-spacing or line-height;
- `text-wrap: balance` on headings and `pretty` on paragraphs;
- red periods;
- backgrounds, header, navigation, cards, buttons, pricing, copy, states, Stripe, email or Supabase.

## Results — 13 widths × 8 pages + 10 review frames (114 captures)

| | Before | After |
|---|---|---|
| Text over drawn art (crown pages + review frames) | 5 (rail: P04 at 320/360/375, review P04 at 390/1440; down to −41px) | **0** (min clearance 10.8px) |
| Text over drawn art (P01 hero) | 5 (lede at 360/375/402/430 + review frame 390; −60px on the red column at 430) | 1 (P01-430 lede line 2, 3px over the hero's faint sky gradient; strong ink clear) |
| Headline red period alone on a line | 4 (P04 ≥1194px) | **0** |
| Single-word lede orphans | 0 | 0 |
| Horizontal document overflow | 0 | 0 |
| Artwork geometry (box, SVG box, computed style, frame-relative) | — | identical in 114 / 114 |
| Artwork pixels (art-only render, screen pinned to 2400px) | — | identical in 113 / 114; P04-360 differs by ≤4 levels on 107 px inside the red glass gradient. Re-rendered with the text taken out of layout (`display:none`), every crown capture at 360px is byte-identical before and after: the Δ is compositing dither from the hidden text layer's size, not the art. |

Clearance = leftmost art ink (channel Δ ≥ 6 vs the art-hidden render) in a text line's rows, minus that line's right
glyph edge. `—` = no art in the text's rows.

| Page | Width | Headline box | Lede box | Rail box | Headline lines | Lede lines | Min clearance px | Doc overflow-x | Artwork |
|---|---|---|---|---|---|---|---|---|---|
| GET STARTED | 320 | 284 → 284 | 284 → 284 | 284 → 284 | 3 → 3 | 4 → 4 | 32 → 32 | 0 → 0 | identical |
| GET STARTED | 360 | 323 → 323 | 310 → 310 | 323 → 323 | 3 → 3 | 4 → 4 | -11 → 51 | 0 → 0 | identical |
| GET STARTED | 375 | 336 → 336 | 310 → 310 | 336 → 336 | 3 → 3 | 4 → 4 | -24 → 38 | 0 → 0 | identical |
| GET STARTED | 390 | 349 → 349 | 310 → 310 | 349 → 349 | 3 → 3 | 4 → 4 | 14 → 60 | 0 → 0 | identical |
| GET STARTED | 402 | 360 → 360 | 310 → 310 | 360 → 360 | 3 → 3 | 4 → 4 | -35 → 27 | 0 → 0 | identical |
| GET STARTED | 430 | 385 → 385 | 310 → 310 | 385 → 385 | 3 → 3 | 4 → 4 | -60 → -3 | 0 → 0 | identical |
| GET STARTED | 768 | 560 → 560 | 310 → 310 | 560 → 560 | 3 → 3 | 4 → 4 | 54 → 92 | 0 → 0 | identical |
| GET STARTED | 834 | 560 → 560 | 310 → 310 | 560 → 560 | 3 → 3 | 4 → 4 | 54 → 92 | 0 → 0 | identical |
| GET STARTED | 1024 | 560 → 560 | 310 → 310 | 560 → 560 | 3 → 3 | 4 → 4 | 54 → 92 | 0 → 0 | identical |
| GET STARTED | 1194 | 520 → 520 | 440 → 440 | 520 → 520 | 3 → 3 | 3 → 3 | 201 → 201 | 0 → 0 | identical |
| GET STARTED | 1440 | 520 → 520 | 440 → 440 | 520 → 520 | 3 → 3 | 3 → 3 | 207 → 207 | 0 → 0 | identical |
| GET STARTED | 1920 | 520 → 520 | 440 → 440 | 520 → 520 | 3 → 3 | 3 → 3 | 208 → 213 | 0 → 0 | identical |
| GET STARTED | 2560 | 520 → 520 | 440 → 440 | 520 → 520 | 3 → 3 | 3 → 3 | 207 → 207 | 0 → 0 | identical |
| RECOMMENDATION | 320 | 141 → 162 | 141 → 172 | 141 → 185 | 3 → 3 | 6 → 5 | -41 → 12 | 0 → 0 | identical |
| RECOMMENDATION | 360 | 162 → 186 | 162 → 197 | 162 → 212 | 3 → 3 | 6 → 5 | -16 → 11 | 0 → 0 | geometry identical; ≤4-level raster Δ (see note) |
| RECOMMENDATION | 375 | 169 → 194 | 169 → 206 | 169 → 221 | 3 → 3 | 5 → 5 | -6 → 12 | 0 → 0 | identical |
| RECOMMENDATION | 390 | 177 → 202 | 177 → 214 | 177 → 230 | 3 → 3 | 5 → 4 | 4 → 12 | 0 → 0 | identical |
| RECOMMENDATION | 402 | 183 → 209 | 183 → 221 | 183 → 238 | 3 → 3 | 5 → 4 | 11 → 12 | 0 → 0 | identical |
| RECOMMENDATION | 430 | 196 → 230 | 196 → 243 | 196 → 260 | 3 → 3 | 5 → 4 | 32 → 23 | 0 → 0 | identical |
| RECOMMENDATION | 768 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 3 | 129 → 69 | 0 → 0 | identical |
| RECOMMENDATION | 834 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 3 | 129 → 69 | 0 → 0 | identical |
| RECOMMENDATION | 1024 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 3 | 129 → 69 | 0 → 0 | identical |
| RECOMMENDATION | 1194 | 257 → 520 | 257 → 440 | 257 → 520 | 4 → 3 | 4 → 2 | 487 → 401 | 0 → 0 | identical |
| RECOMMENDATION | 1440 | 257 → 520 | 257 → 440 | 257 → 520 | 4 → 3 | 4 → 2 | 552 → 468 | 0 → 0 | identical |
| RECOMMENDATION | 1920 | 257 → 520 | 257 → 440 | 257 → 520 | 4 → 3 | 4 → 2 | 552 → 468 | 0 → 0 | identical |
| RECOMMENDATION | 2560 | 257 → 520 | 257 → 440 | 257 → 520 | 4 → 3 | 4 → 2 | 552 → 468 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 320 | 141 → 162 | 141 → 172 | 141 → 185 | 3 → 3 | 8 → 6 | 3 → 26 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 360 | 162 → 186 | 162 → 197 | 162 → 212 | 3 → 3 | 7 → 6 | 39 → 29 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 375 | 169 → 194 | 169 → 206 | 169 → 221 | 3 → 3 | 7 → 6 | 49 → 16 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 390 | 177 → 202 | 177 → 214 | 177 → 230 | 3 → 3 | 6 → 5 | 55 → 12 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 402 | 183 → 209 | 183 → 221 | 183 → 238 | 3 → 3 | 6 → 5 | 53 → 18 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 430 | 196 → 230 | 196 → 243 | 196 → 260 | 3 → 3 | 6 → 5 | 74 → 19 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 768 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 4 → 3 | 108 → 48 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 834 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 4 → 3 | 108 → 48 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 1024 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 4 → 3 | 108 → 48 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 1194 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 5 → 3 | 561 → 372 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 1440 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 5 → 3 | 628 → 439 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 1920 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 5 → 3 | 628 → 439 | 0 → 0 | identical |
| REVIEW + CHECKOUT | 2560 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 5 → 3 | 628 → 439 | 0 → 0 | identical |
| ACTIVATION | 320 | 141 → 162 | 141 → 172 | 141 → 185 | 3 → 3 | 5 → 4 | 2 → 12 | 0 → 0 | identical |
| ACTIVATION | 360 | 162 → 186 | 162 → 197 | 162 → 212 | 3 → 3 | 4 → 4 | 28 → 14 | 0 → 0 | identical |
| ACTIVATION | 375 | 169 → 194 | 169 → 206 | 169 → 221 | 3 → 3 | 4 → 4 | 38 → 23 | 0 → 0 | identical |
| ACTIVATION | 390 | 177 → 202 | 177 → 214 | 177 → 230 | 3 → 3 | 4 → 3 | 47 → 17 | 0 → 0 | identical |
| ACTIVATION | 402 | 183 → 209 | 183 → 221 | 183 → 238 | 3 → 3 | 4 → 3 | 54 → 23 | 0 → 0 | identical |
| ACTIVATION | 430 | 196 → 230 | 196 → 243 | 196 → 260 | 3 → 3 | 4 → 3 | 59 → 27 | 0 → 0 | identical |
| ACTIVATION | 768 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 2 | 134 → 45 | 0 → 0 | identical |
| ACTIVATION | 834 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 2 | 134 → 45 | 0 → 0 | identical |
| ACTIVATION | 1024 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 2 | 134 → 45 | 0 → 0 | identical |
| ACTIVATION | 1194 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 538 → 384 | 0 → 0 | identical |
| ACTIVATION | 1440 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 603 → 451 | 0 → 0 | identical |
| ACTIVATION | 1920 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 603 → 451 | 0 → 0 | identical |
| ACTIVATION | 2560 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 603 → 451 | 0 → 0 | identical |
| PROJECT OVERVIEW | 320 | 141 → 162 | 141 → 172 | 141 → 185 | 3 → 3 | 6 → 5 | 2 → 27 | 0 → 0 | identical |
| PROJECT OVERVIEW | 360 | 162 → 186 | 162 → 197 | 162 → 212 | 3 → 3 | 5 → 4 | 39 → 23 | 0 → 0 | identical |
| PROJECT OVERVIEW | 375 | 169 → 194 | 169 → 206 | 169 → 221 | 3 → 3 | 5 → 4 | 49 → 32 | 0 → 0 | identical |
| PROJECT OVERVIEW | 390 | 177 → 202 | 177 → 214 | 177 → 230 | 3 → 3 | 5 → 4 | 58 → 14 | 0 → 0 | identical |
| PROJECT OVERVIEW | 402 | 183 → 209 | 183 → 221 | 183 → 238 | 3 → 3 | 5 → 4 | 66 → 20 | 0 → 0 | identical |
| PROJECT OVERVIEW | 430 | 196 → 230 | 196 → 243 | 196 → 260 | 3 → 3 | 4 → 3 | 68 → 14 | 0 → 0 | identical |
| PROJECT OVERVIEW | 768 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 2 | 121 → 42 | 0 → 0 | identical |
| PROJECT OVERVIEW | 834 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 2 | 121 → 42 | 0 → 0 | identical |
| PROJECT OVERVIEW | 1024 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 2 | 121 → 42 | 0 → 0 | identical |
| PROJECT OVERVIEW | 1194 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 554 → 428 | 0 → 0 | identical |
| PROJECT OVERVIEW | 1440 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 621 → 495 | 0 → 0 | identical |
| PROJECT OVERVIEW | 1920 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 621 → 495 | 0 → 0 | identical |
| PROJECT OVERVIEW | 2560 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 621 → 495 | 0 → 0 | identical |
| PROJECT ROADMAP | 320 | 141 → 162 | 141 → 172 | 141 → 185 | 3 → 3 | 5 → 5 | 6 → 46 | 0 → 0 | identical |
| PROJECT ROADMAP | 360 | 162 → 186 | 162 → 197 | 162 → 212 | 3 → 3 | 5 → 4 | 42 → 23 | 0 → 0 | identical |
| PROJECT ROADMAP | 375 | 169 → 194 | 169 → 206 | 169 → 221 | 3 → 3 | 5 → 4 | 52 → 32 | 0 → 0 | identical |
| PROJECT ROADMAP | 390 | 177 → 202 | 177 → 214 | 177 → 230 | 3 → 3 | 4 → 4 | 52 → 42 | 0 → 0 | identical |
| PROJECT ROADMAP | 402 | 183 → 209 | 183 → 221 | 183 → 238 | 3 → 3 | 4 → 3 | 58 → 14 | 0 → 0 | identical |
| PROJECT ROADMAP | 430 | 196 → 230 | 196 → 243 | 196 → 260 | 3 → 3 | 4 → 3 | 69 → 22 | 0 → 0 | identical |
| PROJECT ROADMAP | 768 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 2 | 129 → 44 | 0 → 0 | identical |
| PROJECT ROADMAP | 834 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 2 | 129 → 44 | 0 → 0 | identical |
| PROJECT ROADMAP | 1024 | 296 → 368 | 296 → 384 | 296 → 406 | 3 → 3 | 3 → 2 | 129 → 44 | 0 → 0 | identical |
| PROJECT ROADMAP | 1194 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 562 → 393 | 0 → 0 | identical |
| PROJECT ROADMAP | 1440 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 629 → 460 | 0 → 0 | identical |
| PROJECT ROADMAP | 1920 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 629 → 460 | 0 → 0 | identical |
| PROJECT ROADMAP | 2560 | 257 → 520 | 257 → 440 | 257 → 520 | 3 → 3 | 3 → 2 | 629 → 460 | 0 → 0 | identical |
| NEEDS YOU | 320 | 141 → 162 | 141 → 172 | 141 → 185 | 2 → 2 | 7 → 5 | 30 → 12 | 0 → 0 | identical |
| NEEDS YOU | 360 | 162 → 186 | 162 → 197 | 162 → 212 | 2 → 2 | 6 → 4 | 48 → 12 | 0 → 0 | identical |
| NEEDS YOU | 375 | 169 → 194 | 169 → 206 | 169 → 221 | 2 → 2 | 5 → 4 | 49 → 21 | 0 → 0 | identical |
| NEEDS YOU | 390 | 177 → 202 | 177 → 214 | 177 → 230 | 2 → 2 | 5 → 4 | 50 → 29 | 0 → 0 | identical |
| NEEDS YOU | 402 | 183 → 209 | 183 → 221 | 183 → 238 | 2 → 2 | 5 → 4 | 54 → 36 | 0 → 0 | identical |
| NEEDS YOU | 430 | 196 → 230 | 196 → 243 | 196 → 260 | 2 → 2 | 5 → 4 | 61 → 24 | 0 → 0 | identical |
| NEEDS YOU | 768 | 296 → 368 | 296 → 384 | 296 → 406 | 2 → 2 | 3 → 3 | 146 → 43 | 0 → 0 | identical |
| NEEDS YOU | 834 | 296 → 368 | 296 → 384 | 296 → 406 | 2 → 2 | 3 → 3 | 146 → 43 | 0 → 0 | identical |
| NEEDS YOU | 1024 | 296 → 368 | 296 → 384 | 296 → 406 | 2 → 2 | 3 → 3 | 146 → 43 | 0 → 0 | identical |
| NEEDS YOU | 1194 | 257 → 520 | 257 → 440 | 257 → 520 | 2 → 2 | 4 → 2 | 564 → 398 | 0 → 0 | identical |
| NEEDS YOU | 1440 | 257 → 520 | 257 → 440 | 257 → 520 | 2 → 2 | 4 → 2 | 631 → 465 | 0 → 0 | identical |
| NEEDS YOU | 1920 | 257 → 520 | 257 → 440 | 257 → 520 | 2 → 2 | 4 → 2 | 631 → 465 | 0 → 0 | identical |
| NEEDS YOU | 2560 | 257 → 520 | 257 → 440 | 257 → 520 | 2 → 2 | 4 → 2 | 631 → 465 | 0 → 0 | identical |
| MY RECORDS | 320 | 141 → 162 | 141 → 172 | 141 → 185 | 2 → 2 | 6 → 5 | 12 → 15 | 0 → 0 | identical |
| MY RECORDS | 360 | 162 → 186 | 162 → 197 | 162 → 212 | 2 → 2 | 6 → 5 | 48 → 24 | 0 → 0 | identical |
| MY RECORDS | 375 | 169 → 194 | 169 → 206 | 169 → 221 | 2 → 2 | 5 → 4 | 49 → 18 | 0 → 0 | identical |
| MY RECORDS | 390 | 177 → 202 | 177 → 214 | 177 → 230 | 2 → 2 | 5 → 4 | 53 → 26 | 0 → 0 | identical |
| MY RECORDS | 402 | 183 → 209 | 183 → 221 | 183 → 238 | 2 → 2 | 5 → 4 | 59 → 32 | 0 → 0 | identical |
| MY RECORDS | 430 | 196 → 230 | 196 → 243 | 196 → 260 | 2 → 2 | 5 → 4 | 81 → 13 | 0 → 0 | identical |
| MY RECORDS | 768 | 296 → 368 | 296 → 384 | 296 → 406 | 2 → 2 | 3 → 2 | 118 → 21 | 0 → 0 | identical |
| MY RECORDS | 834 | 296 → 368 | 296 → 384 | 296 → 406 | 2 → 2 | 3 → 2 | 118 → 21 | 0 → 0 | identical |
| MY RECORDS | 1024 | 296 → 368 | 296 → 384 | 296 → 406 | 2 → 2 | 3 → 2 | 118 → 21 | 0 → 0 | identical |
| MY RECORDS | 1194 | 257 → 520 | 257 → 440 | 257 → 520 | 2 → 2 | 4 → 2 | 552 → 386 | 0 → 0 | identical |
| MY RECORDS | 1440 | 257 → 520 | 257 → 440 | 257 → 520 | 2 → 2 | 4 → 2 | 619 → 453 | 0 → 0 | identical |
| MY RECORDS | 1920 | 257 → 520 | 257 → 440 | 257 → 520 | 2 → 2 | 4 → 2 | 619 → 453 | 0 → 0 | identical |
| MY RECORDS | 2560 | 257 → 520 | 257 → 440 | 257 → 520 | 2 → 2 | 4 → 2 | 619 → 453 | 0 → 0 | identical |
| review frame · GET STARTED | 390 | 325 → 325 | 310 → 310 | 325 → 325 | 3 → 3 | 4 → 4 | -38 → 24 | 0 → 0 | identical |
| review frame · GET STARTED | 1440 | 338 → 338 | 310 → 310 | 338 → 338 | 3 → 3 | 3 → 3 | 45 → 45 | 0 → 0 | identical |
| review frame · RECOMMENDATION | 390 | 164 → 188 | 164 → 199 | 164 → 214 | 3 → 3 | 6 → 5 | -12 → 12 | 0 → 0 | identical |
| review frame · RECOMMENDATION | 1440 | 159 → 197 | 159 → 208 | 159 → 197 | 3 → 3 | 5 → 4 | -26 → 16 | 0 → 0 | identical |
| review frame · REVIEW + CHECKOUT | 390 | 164 → 188 | 164 → 199 | 164 → 214 | 3 → 3 | 7 → 6 | 43 → 31 | 0 → 0 | identical |
| review frame · REVIEW + CHECKOUT | 1440 | 159 → 197 | 159 → 208 | 159 → 197 | 3 → 3 | 6 → 4 | 29 → 32 | 0 → 0 | identical |
| review frame · ACTIVATION | 390 | 164 → 188 | 164 → 199 | 164 → 214 | 3 → 3 | 4 → 4 | 31 → 16 | 0 → 0 | identical |
| review frame · ACTIVATION | 1440 | 159 → 197 | 159 → 208 | 159 → 197 | 3 → 3 | 4 → 3 | 17 → 17 | 0 → 0 | identical |
| review frame · PROJECT OVERVIEW | 390 | 164 → 188 | 164 → 199 | 164 → 214 | 3 → 3 | 5 → 4 | 42 → 25 | 0 → 0 | identical |
| review frame · PROJECT OVERVIEW | 1440 | 159 → 197 | 159 → 208 | 159 → 197 | 3 → 3 | 4 → 3 | 28 → 42 | 0 → 0 | identical |

## 200% zoom (390 and 1440)

`zoom-200-comparison.txt` — per page: roles over strong art ink / roles overflowing their box / period alone /
minimum strong-ink clearance / document overflow.

| Mode | Before | After |
|---|---|---|
| Browser zoom 200% (CSS viewport 195 and 720) | 13 / 18 / 1 | 11 / 13 / 0 |
| Text-only 200% (headline, lede, rail fonts doubled) | 17 / 39 / 20 | 7 / 19 / 10 |

No page is worse on any metric; no document overflow in either mode. The remaining zoom cases are words that cannot
fit at that size beside the art at all (for example RECOMMENDED at 88px on a 390px phone, or a rail label on a 195px
CSS viewport). Fixing them would need smaller type or different copy, both out of scope here.

## After the final merge (review page restructured upstream)

Upstream commits after `18753cbb2` restructured `/foundation/review`. Fixture frames now carry a
"SIMULATED FIXTURE · …" label above the rail. On crown frames that label ran over the art, and it lowered the rail
beside the beam. Two follow-ups:

- **Rail:** review frames' rails yield to the beam at every width (`.df-review .df-screen--crown { --df-crown-rail-max: var(--df-crown-text-max) }`).
- **Label:** the label keeps to the headline width on crown frames.

A smoke pass on the final tree at 390 and 1440 (`measure.cjs`, 26 captures, label measured as a role) found:

- no text over drawn art, with minimum clearance 11.6px;
- no document overflow;
- text and artwork identical to the validated after state. The one exception is the review OVERVIEW frame, which now sits 0.5px higher on the restructured page; its art position relative to the frame is unchanged.

## Evidence files

- `side-by-side/` — BEFORE | AFTER captures of the React client with role boxes outlined (blue headline, green lede,
  orange rail) and the measured widths, line counts and clearance printed above each panel.
  - **The four founder examples:** `P01-*`, `P04-*`, `P05-*`, `P06-*` at 390 and 1440.
  - **Also:** `review-*-390` (the `/foundation/review` frames), `OVERVIEW`, `ROADMAP`, `NEEDS_YOU`, `RECORDS`, and 320/768 for P04–P06.
  - **Zoom:** `browser-zoom-*` and `text-zoom-*`.
- `geometry-comparison.json` — every capture: role boxes, computed max-width, font size, line widths and text,
  clearance (visible and strong ink), overflow, and artwork geometry, computed style and pixel hash before/after.
- `before-after-comparison.txt` — one line per capture.
- Harness: `scripts/site00/df-crown-text-qa/` (`measure.cjs`, `zoom.cjs`, `compare.py`).

## Recorded, not changed (out of scope)

- P01-430: lede line 2 ends 3px into the faint sky at the top of the in-flow hero image. Moving it would move the
  hero art.
- `tests/digitalFoundationClientBoard0102.test.ts`: 10 cases fail with `CONTACT_PHONE_REQUIRED` (server intake
  validation). They fail identically with this change reverted.
- The review frames at ≥768px set the crown lede to 7.5px while real phones use 9.5px; left as is (no font changes).
