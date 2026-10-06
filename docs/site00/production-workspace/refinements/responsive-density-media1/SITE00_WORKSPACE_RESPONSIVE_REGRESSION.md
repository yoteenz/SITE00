# SITE00 workspace — responsive regression

**Sprint:** P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1
**Method:** the same live audit (`density-audit.mjs`) ran against current `main` (before) and this branch (after) on 25 states (7 root tabs + 18 child views) × 3 viewports = 75 states each. Captures were diffed pixel by pixel (a pixel counts as changed at an RGB delta > 30); per-state values are in `screenshots/pixel-diff.json`.

## 1. HUB authority — no regression

| Viewport | HUB pixel diff vs main | Type sizes | Content height |
|---|---|---|---|
| mobile 393×852 | **0.00%** | identical (T0–T6, METRIC) | 1.00 screen |
| tablet 834×1194 | **0.00%** | identical | 1.00 screen |
| desktop 1440×900 | **0.00%** | identical | 1.00 screen |

HUB thumbnails declare `THUMBNAIL_COVER`, the focal HUB already rendered (50% 50%), and HUB hero plates declare `HERO_PLATE / WIDE_SCENE_COVER`. The declarations are metadata only and do not move a pixel on HUB.

## 2. Tablet + desktop — no regression

All tablet (834×1194) and desktop (1440×900) captures, first screen and scrolled screen, are **0.00%** different from main. One state, tablet DESIGN › assets, first measured 0.01%: 90 px inside the TEMPLATES device miniature. A fresh capture of `main` under identical conditions is pixel-identical to this branch (0 px), so the difference was capture drift, not a code change, and the fresh `main` capture is the before image for that state. The density layer's internal-layer mapping, panel density and slot geometry are the mobile contract (≤ 699 px). At larger widths only tokens, contain fits and explicit focal metadata apply, and none of them changes an approved tablet or desktop composition.

## 3. Mobile — intended changes only

Mobile is the refinement target, so every non-HUB mobile capture changes, intentionally:
- type mapped to the HUB tiers
- panel padding, gaps and touch targets mapped to HUB density
- hero bands at HUB hero height, with copy on a wash
- the EXPERIENCE root fits one screen
- the ACTIVITY feed is denser
- INBOX decision detail is content-sized
- scroll-edge fades on internal panes

Frame changes are listed per route in `SITE00_WORKSPACE_MEDIA_COMPONENT_AUDIT.json`, each with its intent. **Unexplained frame changes: 0.**

All 75 captured states are packed into labelled contact sheets, kept to a few files on purpose because the repository inventory walk is file-count sensitive:
- `screenshots/sheets/mobile-<tab>.jpg` — BEFORE | AFTER, one row per captured screen
- `screenshots/sheets/tablet-after.jpg` and `desktop-after.jpg` — pixel-identical to main

Each state's region is listed in `SITE00_WORKSPACE_SCREENSHOT_MANIFEST.json`.

Before / after comparison set (`screenshots/compare/`):

| Comparison | File |
|---|---|
| HUB authority (unchanged) | `compare/hub-authority.jpg` |
| EXPERIENCE root | `compare/experience-root.jpg` |
| EXPERIENCE child — world | `compare/experience-child-world.jpg` |
| DESIGN child — brand | `compare/design-child-brand.jpg` |
| EXPRESSION child — casting / actors | `compare/expression-child-casting.jpg` |
| EXPRESSION child — wardrobe / looks | `compare/expression-child-wardrobe.jpg` |
| LIBRARY media panels | `compare/library-media-panel.jpg` |
| LIBRARY collection open | `compare/library-collection-open.jpg` |
| ACTIVITY dense feed | `compare/activity-dense.jpg` |
| INBOX — needs you | `compare/inbox-dense.jpg` |
| INBOX — decision detail | `compare/inbox-decision-detail.jpg` |

## 4. Routing / product logic — no regression

- No route, nav label, tab taxonomy, IA, data ownership, family / project logic or product behaviour changed. The diff is CSS, `data-*` declarations, two new presentational primitives, optional slot / fit / focal props on `Thumb`, `HubImage` and the family `Img` (undeclared callers render unchanged), scripts, tests and docs.
- The density layer's zero-specificity defaults are scoped to frames that carry `data-density`. Re-capturing 6 representative mobile states after that scoping gave 0 px difference.
- Every audited route rendered with **0 page errors**. The click-driven states (LIBRARY collection open, LIBRARY in review, INBOX decision detail) still open through their existing controls.
- Full vitest suite: the 61 files that fail on this branch fail identically on untouched `main` (environment: Supabase credentials / network). No new failures. Sprint suite `productionWorkspaceResponsiveDensityMedia1.test.tsx`: 38 / 38.
- `tsc --noEmit`: clean.

## 5. Visual world — preserved

The luminous white atrium, red illumination, suspended board language, central red / black core and every tab's visual identity are unchanged. No asset was created, replaced or regenerated (0 paid generations, 0 credits).
