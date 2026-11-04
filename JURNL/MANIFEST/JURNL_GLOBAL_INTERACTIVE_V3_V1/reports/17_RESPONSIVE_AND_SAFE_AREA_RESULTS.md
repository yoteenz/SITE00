# 17 · Responsive and safe-area results

Probe (`scratchpad surf.ts`, kept in the full package): 10 V3 surfaces × 9 viewports — 360×780, 375×667, 393×660,
393×852, 430×932, 768×1024, 834×1194, 1024×768, 1440×900 — **90 cells**.

| Measure | Result |
|---|---|
| page-level vertical / horizontal scroll | **0 / 90** |
| visible control outside the viewport and not in a scroller | **0 / 90** |
| lowercase non-script text | **0 / 90** |
| control smaller than 24 px | 6 cells, all pre-existing and outside V3: the DOT 01 search chip at 360 / 375 (caution, archive-blocked screens) and the F09 folio's ask / buffer controls at 375×667 / 393×660 |

Safe areas: drawer head / body and folio host pad with `env(safe-area-inset-*)`; long content scrolls inside the
surface (`overscroll-behavior: contain`), never the page. Phones: the menu is ≤ 86 vw; tablets / desktop: every V3
surface sits inside the runtime's overlay host (the app column), like every other overlay. Data: `metrics/v3_surfaces_9_viewports.json`.
