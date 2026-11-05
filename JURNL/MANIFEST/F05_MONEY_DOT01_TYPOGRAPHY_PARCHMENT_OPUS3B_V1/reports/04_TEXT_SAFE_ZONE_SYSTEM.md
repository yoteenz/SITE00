# 04 · Text-safe zone system

Invisible geometry — no visible border is added anywhere. Defined in `Dot01Frame.tsx` (`OVERLAY_HEADINGS`) and the CSS
heading boxes; enforced by `titleSize()` (per-line fit) and verified by the probe (`TEXT=1`) and the E2E suite
`jurnl-f05-dot01-artwork-type.e2e.ts`.

## Title papers (board px of the 941 × 1672 board)

| Field | `env` — the SK03 SIDEKICK's heading paper | `wide` — the wide torn banner (16, 20, 29, 30) |
|---|---|---|
| VISIBLE_PAPER_BOUNDS | x 50–640, y 318–555 (baked in SK03_FIELD) | x 0–724, y 298–497 (`F05_DOT01_12_WIDE_TORN_BANNER`, 1200 × 330 at uniform scale 0.603, mirrored) |
| TEXT_SAFE_BOUNDS | x 196–606, y 340–540 (410 × 200) | x 192–684, y 308–492 (492 × 184) |
| LEFT_INSET | 146 from the paper's left end (the seal) | 192 (the seal + 14) |
| RIGHT_INSET | 34 from the top-right torn edge | 40 from the torn end |
| TOP_INSET | 22 | 10 |
| BOTTOM_INSET | 15 | 5 |
| DECORATIVE_EXCLUSION_ZONES | wax seal (disc x 27–177, y 326–476); torn lower-right corner + foliage (from y 470: right edge 607 @ 480, 590 @ 500, 550 @ 520) | wax seal (each screen's own, ≤ x 191); torn right end (x > 690) |
| ORNAMENT_OVERLAP_ZONES | foliage x > 600, y > 440 | none inside the safe box |
| MAX_TEXT_LINES | 2 title lines + 1 cursive line (3 title lines fit at 50) | 2 title lines + 1 cursive line |
| per-line measure (`lines`) | 410 · 380 · 350 | 492 · 480 · 460 |
| FONT_ROLE | `JURNL Authority Serif` 600, tracking 0.02 em, leading 0.94; cursive `JURNL Script` 38 px | same |
| size rule | `min(cap, measure_i ÷ (letters_i × 0.66))`, cap 80 / 68 / 50 for 1 / 2 / 3 lines | same |
| OVERFLOW_BEHAVIOR | never clipped: the type is fitted to the box; a 3rd line steps the cap down; then each rendered line is measured (after the faces load) and, if one would still pass the box, the title steps down by the measured ratio (`titleFit`, `data-fit` on the `<h1>`) — never up | same |

## Content papers (screen px inside the content region)

| Surface | Safe region | Rule |
|---|---|---|
| action pill (`.d01-btn`) | between the two round caps: `border-width: 0 var(--d01-btn-cap)` (cap = 0.513 × height dark, 0.522 cream) | single line (`white-space: nowrap`), icon + gap + label centred; the probe flags any label that leaves the caps |
| field strip (16–20) | inside the strip's 9-slice border (8 × 12, dense 4 × 12) | icon tile · rule · label · value (`2.2 fs · 0.78 fr · 1.42 fr`); a select's value ellipsises inside its own box (the full value stays in the accessible name and the listbox) |
| page / sheet papers | inside the 9-slice border | unchanged this sprint |

## How it is verified

* probe `TEXT=1`: per title line, horizontally exact, vertically with the em box's empty ascent tolerated (0.16 em above, 0.06 em
  below — an all-caps line's em box carries that much empty space above the caps); every other text run against its paper or
  its own clipping box; icon/text collisions per line box.
* E2E R1 / H (six overlays): title lines inside the safe zone, the safe zone inside the drawn paper (16), action labels between
  the caps, no icon/text collision, no page scroll.

## Measured clamp (all titles, pages and overlays)

`titleSize()` sets the size from a mean letter advance (0.66 em overlays, 0.69 em pages); words with wide letters (ACCOUNTS,
TRANSACTION) can run a little longer than the mean. `Dot01Board` therefore measures each title line's text range against its
heading box after layout and after `document.fonts.ready`, and scales the title by `box ÷ natural width × 0.995` only when a line
would overhang. The census confirms the effect: 32's page title (ACCOUNTS, 75.9 px, 1–2 px over its box on the base) is set at
75.0 px and sits inside; no other title needed it.

