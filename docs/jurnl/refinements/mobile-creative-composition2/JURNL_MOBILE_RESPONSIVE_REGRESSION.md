# JURNL mobile composition: responsive regression

Sprint: P0.JURNL.MOBILE-COMPOSITION-CREATIVE-LANGUAGE-PAGINATION-REFINEMENT2

**Primary viewport:** 393×852. Tablet (834×1194) and desktop (1440×900) were checked for regression only.

**Source:** the live runtime, measured by `scripts/jurnl/mobile-composition-qa.mjs`. There are 14 family roots, each in two states (EMPTY, a fresh device; POPULATED, the seeded device), across 3 viewports, for 84 rows.

**Before baseline:** `main` at `dd8bdeca` plus only the render-loop crash fix. Without that fix, 10 of 14 roots do not render at all; see the report.

## Result

| Check | Before | After |
|---|---|---|
| Nav centre offset, mobile | 0 | 0 |
| Nav centre offset, tablet (F05–F16) | **−105 px** | 0 |
| Nav centre offset, desktop (F05–F16) | **−435.2 px** | 0 |
| + centre offset, all viewports | same as nav | 0 |
| Elements under the nav, all rows | 20 | 0 |
| Shown panels clipped by the content rect | n/a (no rect) | 0 |
| Primary body (column) scroll | F15 809 px (mobile) · 202 px (tablet) · 653 px (desktop) · F09 13 px (desktop) | 0 everywhere |
| Interactive-text containment (F01–F16, 3 viewports) | — | 1098 / 1098 labels |
| SITE00 viewport preview vs live (mobile) | — | 14 / 14 identical |

TABLET_REGRESSION: **0**. DESKTOP_REGRESSION: **0**.

Two changes on tablet and desktop are intentional, not regressions:

1. **The nav is now centred to the viewport, not to the content column.** The sprint requires this. Before, every F05–F16 hub docked the nav to its column, while F03 and F04 were centred.
2. **Tall stacks now paginate instead of scrolling the body.** Measured screen counts, with all other roots on 1 screen:
   - Tablet: F15 has 2 screens.
   - Desktop (900 px tall): F05, F15 and F16 have 2 screens.

## Tablet 834×1194

Columns:
- **nav Δ:** nav centre offset (px).
- **under:** elements under the nav.
- **col scroll:** primary body scroll (px).
- **clipped:** shown panels clipped by the content rect.
- **screens:** pagination screen count.

Screens are counted on the populated device. F04 (ACTIVITY) is not on the frame, so it has no screen count.

| Root | Before nav Δ | Before under | Before col scroll | After nav Δ | After under | After clipped | After col scroll | After screens |
|---|---|---|---|---|---|---|---|---|
| F03 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F04 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| F05 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F06 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F07 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F08 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F09 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F10 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F11 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F12 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F13 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F14 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F15 | −105 | **4** | **202** | 0 | 0 | 0 | 0 | 2 |
| F16 | −105 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |

The empty device gives the same result: nav Δ is −105 on F05–F16 before and 0 after, with nothing under the nav.

## Desktop 1440×900

Columns are the same as the tablet table. Screens are counted on the populated device.

| Root | Before nav Δ | Before under | Before col scroll | After nav Δ | After under | After clipped | After col scroll | After screens |
|---|---|---|---|---|---|---|---|---|
| F03 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F04 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| F05 | −435.2 | 0 | 0 | 0 | 0 | 0 | 0 | 2 |
| F06 | −435.2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F07 | −435.2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F08 | −435.2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F09 | −435.2 | **3** | **13** | 0 | 0 | 0 | 0 | 1 |
| F10 | −435.2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F11 | −435.2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F12 | −435.2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F13 | −435.2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F14 | −435.2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| F15 | −435.2 | **4** | **653** | 0 | 0 | 0 | 0 | 2 |
| F16 | −435.2 | 0 | 0 | 0 | 0 | 0 | 0 | 2 |

On the empty device, F09 had 3 elements under the nav and 13 px of body scroll before. After, it has none.

## Frame geometry by breakpoint (after)

| Viewport | Content rect (top → bottom) | Composition edge | Nav (top → bottom) | Nav x / width |
|---|---|---|---|---|
| 393×852 | 64 → 748 | 748 → 788 | 796 → 840 | 26.5 / 340 |
| 834×1194 | 78 → 1090 | 1090 → 1130 | 1138 → 1182 | 207 / 420 |
| 1440×900 | 78 → 796 | 796 → 836 | 844 → 888 | 490 / 460 |

The geometry is identical on every frame root within a viewport. Tablet and desktop use the same frame with a wider stage: `--jrn-frame-pad-x` is 56px or 9vw, and `--jrn-frame-max` is 560px or 540px. The content column stays left-anchored, as the JURNL plates were composed for that.

## Continuation on tablet and desktop

`CONTINUATION_TABLET_F15` and `CONTINUATION_DESKTOP_F15` both pass in `JURNL_MOBILE_PAGINATION_QA.json`:
- NEXT goes to screen 2, and BACK returns to screen 1.
- No panel is split.
- The nav stays centred.

Screenshots: `screenshots/pagination/continuation_F15_tablet_screen2.jpg` and `continuation_F15_desktop_screen2.jpg`.

Regression boards: `screenshots/boards/REGRESSION_TABLET_834.jpg` and `screenshots/boards/REGRESSION_DESKTOP_1440.jpg`.

## Routing and product logic

Composer's full-product E2E gate (`e2e/jurnl`) was run against this branch. On the final merged base it is 82/82: 41 tests × mobile and desktop, including the Wave 5 hardening spec. It surfaced three presentation hooks that the recomposition had removed:
- `.jrn-home__num` on the F09 figure.
- `.jrn-tx` on F07 rows.
- The text "SAFE TO SPEND NOW" on F15.

All three were restored without touching the tests. The F15 band now reads TODAY / NEXT 30 DAYS / LATER, with the caption SAFE TO SPEND NOW.

No route, repository, mutation or domain model was changed. Every existing `data-jrn-trigger` on the family roots is kept.
