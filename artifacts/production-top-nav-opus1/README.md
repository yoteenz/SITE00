# P0.STUDIOOS.PRODUCTION.TOP-NAV.GLOBAL-CONVERGENCE.OPUS1

One shared Production host header (`ProductionWorkspaceHeader` in `src/site00/components/productionHub/chrome.tsx`) with one geometry, on every Production root and descendant, in every viewport family.
- **Authority:** `IMG_6357.jpeg`, a phone header at 1206px (402pt @3x). It shows four groups: TAB / SITE 00, PROJECT, ITEMS NEED YOU, MENU.
- **Scope:** header geometry and typography only. Routing, project selection, the attention count source, menu behaviour, auth, the bottom nav and page bodies are unchanged.

## Changes
- `chrome.tsx`
  - The phone header now carries the same four groups as tablet/desktop. The duplicate CURRENT WORKSPACE / CURRENT QUEUE selector (a second link to `/production`) is removed, and its text survives as the title tooltip.
  - The `brand--long` ellipsis branch is removed.
  - Shared test ids (`production-host-location`, `production-host-attention`, `production-host-menu`) now exist in every family.
- `site00-production-host-chrome.css`
  - **Tablet/desktop:** `--pxh-*` tokens (tablet defaults, re-tokened at ≥1120px). Groups are content-sized and never shrink. Nothing in the header masks text. Line-heights are 1.15–1.2.
  - **Phone:** a new unscoped `.ph-top--host` block with `--phh-*` tokens, sized from the authority, replaces the `.pxa`-only phone TOP layer. The phone NAV layer is untouched.
- `tests/productionTopNavGlobalConvergenceOpus1.test.ts`: 46 tests.
- `tests/productionHubReconstructionOpus1.test.ts`: one assertion moved from the `.pxa`-scoped 120px rule to the shared `--phh-top-h: 120px` token. Its intent is kept.

## Proof
- `mobile/`, `tablet/`, `desktop/`: after header crops for all 7 roots.
  - `mobile/` holds 360 (mobile) and 430 (mobile XL).
  - `tablet/` holds 700 (tablet-min) and 1024.
  - `desktop/` holds 1120 (desktop-min), 1440 and 1920.
- `routes/<route>/<width>-before-after.jpg`: before (base `7dcf37de`) above after, for the 7 roots and 5 descendants at all 7 widths (84 pairs).
- `CLIP_REPORT_BEFORE.json` / `CLIP_REPORT_AFTER.json`: the ink-level clipping detector run (see `RESPONSIVE_MATRIX.md`). It went from 64/84 to 84/84 clean.
- `MATRIX_36.json`: the 36-root structural matrix.
