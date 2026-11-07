# 05 · RESPONSIVE AND FOCUS QA

## Responsive (real captures)

`scripts/jurnl/overlays-opus5/capture_ten_screens.ts` opened the ten screens, plus the MONEY parent, the second PRIVACY scroll position and ADD A POCKET with SAVINGS selected, at six sizes (Chromium, device scale 3, reduced motion). That is 13 states × 6 viewports = **78 states**. For every state it records:
- every `<img data-asset-id>` and its count;
- every micro-art slot and whether its image decoded;
- the line glyphs left;
- the switches;
- page scroll.

| Check over the 78 states | Result |
|---|---|
| Page scroll (x or y) | **none** |
| A shell or paper drawn twice (non-GROK2 asset count > 1) | **none** |
| One asset per micro-art slot (`data-micro-slot` unique) | **yes, every state** |
| Every GROK2 image sits in a named slot (asset count = slot count) | **yes, every state** |
| Every slot image decoded | **yes** |

Sizes: 360×640, 393×660, 393×852, 430×932, 820×1180 (tablet) and 1440×900 (desktop).

Art is never stretched: every micro-art image is `object-fit: contain` inside the box of the glyph it replaced (E2E `expectClean`). The papers keep their native proportion inside the button.

The E2E spec `e2e/jurnl/jurnl-overlay-micro-assets-opus5.e2e.ts` repeats the column checks (art inside its row) at the same six sizes, on the mobile, tablet and desktop projects.

## Focus, keyboard and touch

| Check | Where it is proved | Result |
|---|---|---|
| A consent switch toggles with a tap and with Space; a reload keeps the stored value; OFF stays OFF | E2E P2 | pass |
| The switch keeps a 44 px touch target (probe 21 px above and below the centre) | E2E P2 | pass |
| The switch has role="switch", aria-checked and aria-label (React owns the value; the track art follows it) | unit C2, E2E P2 | pass |
| Focus returns to the menu row after a child (BUFFER → BACK) | E2E M1 | pass |
| Escape closes MOVE MONEY and focus returns to ADD | E2E A2 | pass |
| Escape closes SEARCH | E2E A3 | pass |
| The search text never starts under the magnifier | E2E A3 | pass |
| RENAME / DELETE still open their confirmations; the keyboard reaches both | E2E A4, menu-recovery C5 | pass |
| All twelve menu destinations open and return; the sections are kept | menu-recovery R1 / R2 (mobile 18 / 18) | pass |
| The founder utility buttons: names, trigger ids, focus ring, Enter / Space, focus return | OPUS1 spec (mobile 18 / 18 in this run) | pass |

## Motion and reduced motion

- The switch thumb slides 170 ms on the bronze easing only under `prefers-reduced-motion: no-preference`. Under reduced motion the transition is `0s` and the value still changes (E2E R1, unit C3: every transition sits inside the no-preference block).
- Menu row icons share the existing press nudge (1 px, `--jm-micro`). Papers inside buttons take the existing press (`translateY(1px)`).
- Nothing animates while idle. No SIDEKICK or shell moves to fake a layer.

## Not verified

iOS Safari was not run: there is no iOS device or simulator in this environment.
