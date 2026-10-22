# 01 · README: Founder workspace responsive authority (Opus 2)

**Sprint:** `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.RESPONSIVE-AUTHORITY-REFINEMENT.OPUS2`
**Mode:** desktop + tablet visual authority refinement
**Builds on:** OPUS1 founder workspace authority `docs/site00/idnty/founder-workspace-visual-authority-opus1/` (b82ca64e4) and the approved form-control authority (FD-1 to FD-6)
**Status:** **DESKTOP + TABLET AUTHORITY REFINED — FOUNDER VISUAL REVIEW REQUIRED**
**Production implementation:** NOT AUTHORIZED. No production code, route, API, schema or deployment was touched.

## What changed from OPUS1

The founder approved the direction and found the desktop to be "enlarged mobile". OPUS2 keeps the direction:
- palette, marks, plates, the red period, square geometry;
- the approved mobile compositions.

OPUS2 replaces the desktop and tablet proportions with layouts composed for those tiers:
1. **Type** follows a real scale per tier. Labels go from 7.5–9 px to 11 px and table text from 8.5 to 14. Titles go from 68 down to 52 (44 on short screens). Wrapping is solved with columns and policies, not smaller type.
2. **One grid, two decisions:**
   - the viewport picks the shell (bottom nav, labelled rail or sidebar);
   - the stage width picks the page composition (container queries).

   The inspector docks only when the stage keeps ≥ 680 px.
3. **Tablet portrait and landscape are separate grammars:**
   - Portrait uses a rail, push detail and right sheets.
   - Landscape uses a rail, two panes and a short header.
4. **Pages are composed for width:**
   - Overview is an editorial command center.
   - Foundations is a five-column registry.
   - Client record has a horizontal journey and a context column.
   - Reviews is a queue / context / decision workbench.
   - Operations is a production workbench.
   - Correspondence has a 68ch reading column.
   - System is a status-first compact console.
5. **Every frame is live:** each board frame is a specimen page laid out at its true viewport in Chromium. An automated audit checks 45 states × 16 viewports.

## Review order (founder)

| Round | Boards | Decide |
| --- | --- | --- |
| 1 | **C-01, C-02** (before / after) | Is the refinement the right correction? |
| 2 | D-01, TP-01, TL-01, C-03, C-04, D-15 | Shell, breakpoints, type scale, density (R-01 to R-05, R-11) |
| 3 | D-02 to D-07, TP-02 to TP-05, TL-02 to TL-05, C-05 | Overview, registry columns, create, record, quote (R-06) |
| 4 | D-08 to D-13, TP-06 to TP-09, TL-06 to TL-09, C-06, C-07 | Workbenches and console (R-07 to R-10) |
| 5 | D-14, TP-10, TL-10 | Overlays at every tier |

Record decisions in `16_FOUNDER_APPROVAL_REGISTER.md`.

## Documents

| # | Document |
| --- | --- |
| 01 | `README.md` (this file) |
| 02 | `02_DESKTOP_PROPORTION_AUDIT.md`: P-01 to P-10, 22 findings, before → after |
| 03 | `03_TYPOGRAPHY_REFLOW_MATRIX.md`: measured scale, floors, line length, wrap / truncation policy |
| 04 | `04_TABLET_PORTRAIT_AUTHORITY.md` |
| 05 | `05_TABLET_LANDSCAPE_AUTHORITY.md` |
| 06 | `06_DESKTOP_STANDARD_AUTHORITY.md`: four zones, density, interaction |
| 07 | `07_DESKTOP_ULTRAWIDE_AUTHORITY.md` |
| 08 | `08_RESPONSIVE_GRID_SPECIFICATION.md`: tiers, dock rule, container rules, page grids |
| 09 | `09_COMPONENT_VARIANT_MATRIX.md`: 124 components × 5 tiers |
| 10 | `10_INSPECTOR_AND_OVERLAY_RESPONSIVENESS.md`: inspector + 20 families × 3 tiers |
| 11 | `11_PAGE_BY_PAGE_RESPONSIVE_MAPPING.md` |
| 12 | `12_BEFORE_AFTER_VISUAL_REVIEW.md` |
| 13 | `13_ACCESSIBILITY_AND_REFLOW_CONTRACTS.md`: WCAG 2.2 AA |
| 14 | `14_VISUAL_BOARD_MANIFEST.md`: 42 boards, hashes, frames, checks |
| 15 | `15_RESPONSIVE_VERIFICATION_REPORT.md`: layout audit + per-board 15-check verification |
| 16 | `16_FOUNDER_APPROVAL_REGISTER.md` |
| 17 | `17_OPUS2_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md`: phases 0–10 |
| 18 | `18_COVERAGE_AND_OMISSION_REPORT.md` |

## Folder

```
boards/
  src/ws.css · ws-kit.js · ws-pages.js · ws-overlays.js   responsive proposal system (never imported by the app)
  src/specimen.html · specimen.js                          one workspace state at the true viewport (?page= &sel= &insp= &ol= &kb=)
  src/boards.js · board-kit.js · board2.css · board-*.html  the 42 boards (live specimens in iframes)
  src/before/*.jpg                                         OPUS1 frames cropped for comparison
  png/board-*.png                                          rendered boards (DSF 2)
  lib.mjs · render-boards.mjs · audit-layout.mjs · shoot.mjs · make-shells.py · make-contact-sheets.py
  board-manifest.json
registry/  build-responsive-registry.py · component-registry-responsive.json / .csv
tokens/    breakpoints.json · typography-tokens.json · page-mappings.json
verification/  layout-audit.json · layout-audit-summary.md · board-visual-verification.json · contact-sheets/*.jpg
```

## Regenerate (repo root)

```bash
node docs/site00/idnty/founder-workspace-responsive-authority-opus2/boards/render-boards.mjs        # all boards (or: D01 TP03 …)
node docs/site00/idnty/founder-workspace-responsive-authority-opus2/boards/audit-layout.mjs         # 45 states × 16 viewports
python3 docs/site00/idnty/founder-workspace-responsive-authority-opus2/boards/make-contact-sheets.py
python3 docs/site00/idnty/founder-workspace-responsive-authority-opus2/registry/build-responsive-registry.py
python3 docs/site00/idnty/founder-workspace-responsive-authority-opus2/boards/write-docs.py          # 14 + 15 from the manifests
```

Data comes from source through the repo's Vite server: icons, threshold objects and commercial config. Client identities are the fictional OPUS1 DEMO set and are labelled illustrative. There is no "Anthony", no real client, no OpenArt or AI imagery, and no image-generation credits were used.
