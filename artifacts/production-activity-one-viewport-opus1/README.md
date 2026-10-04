# ACTIVITY — one-viewport convergence (OPUS1)

Sprint `P0.STUDIOOS.PRODUCTION.ACTIVITY.ONE-VIEWPORT-CONVERGENCE.OPUS1` · branch `cursor/production-inbox-activity-threeviewport-opus1`

## Root cause
1. `/production/activity` (`Site00Routes.tsx` → `ProductionActivityPage` → `ProductionAuthorityFrame screen="activity"` → `ActivityBody`) mounted the **OPUS1 tree** (7dcf37de, restored by 319ae2ff). It included:
   - the iaKit `IaHero` (crystal plate);
   - an `IaLensBar` with ALL / APPROVALS / UPDATES / COMMENTS / BLOCKERS and search;
   - `IaStats` KPI cards;
   - stacked `IaPanel` FEED / MILESTONES / ATTENTION sections.
2. No height contract: the frame's `.pxa-scroll` pane had no Activity lock, so the route scrolled 435–903px inside the frame on every viewport.
3. The canonical model existed only on unmounted branches (ACTIVITY LOG variants c0cc47d7 / ffc7f7c0), so the stale presentation survived.

## Rebuild
- **Model:** `src/site00/components/productionAuthority/activityLog.ts`. Every event carries timestamp-or-live, BY, project, entry, area, domain, verb, version, prior → result state, AFFECTS, DOWNSTREAM, cause/lineage and source.
- **Presentation:** `ActivityBody.tsx` `.amx` plus `site00-production-activity-memory.css`.
  - DOMAIN: ALL · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · PEOPLE · SYSTEM.
  - TIME: TODAY · THIS WEEK · THIS MONTH · FULL HISTORY.
  - CHANGE: a secondary select.
  - Desktop: rail | timeline | inspector. Tablet: filter band, then timeline 62% | inspector 38%. Mobile: header, domain strip, time strip, timeline, and a drawer inspector.
- **Height contract:**
  - `.pxa[data-screen='activity'] .pxa-scroll{overflow:hidden}`;
  - `.pxa-body{height:100%}`;
  - `@supports (height:100dvh)` sets the frame height to `100dvh`, which handles the iOS Safari dynamic toolbar;
  - the nav strip keeps `env(safe-area-inset-bottom)`;
  - only `.amx-events` and `.amx-insp__scroll` scroll.

## Live QA (`NO_SCROLL_REPORT.json`, Chromium, local Vite on the tunnel branch)
- **Viewports:** 390×844, 393×852, 430×932, 360×640, 390×664 (iOS short), 768×1024, 820×1180, 1024×1366, 1024×768, 1440×900, 1680×1050, 1920×1080, 1440×810, 1280×720.
- **States:** default (TODAY), FULL HISTORY, PEOPLE + FULL HISTORY, legacy `?view=blockers`, and an event selected (drawer on mobile).
- **Results: 70/70 pass.** In every state:
  - `documentElement.scrollHeight − clientHeight = 0`;
  - `window.scrollBy` moves 0;
  - `.pxa-scroll` overflow is 0;
  - nothing is clipped and nothing overflows horizontally;
  - the bottom nav is in view with `nav-activity` active;
  - the timeline scrolls internally whenever the history exceeds the pane.
- **Screens:** `screens/<w>x<h>-default.jpg` and `-event.jpg`.
