# P0.STUDIOOS.PRODUCTION.FULL-AUTHORITY-PIXEL-PERFECT-REFINEMENT.OPUS3

Reference = design authority. The function stays as it is; only the look is refined. Base: tunnel `cursor/studio-world-resident-geometry-complete-production-injection1` @ `a298b59a`.

## Loop

REFERENCE → LIVE → DIFFERENCE → FIX → RECAPTURE → COMPARE.
- **BEFORE:** `a298b59a`, served from its own clean worktree and dev server.
- **AFTER:** the working branch.
- **Detector and coverage:** both use the same detector (`../production-full-authority-forensics/scripts/qa/cap.mjs` + `visual_diff.py`) across 185 routes × 14 viewports (2590 rows each).
- **Interaction checks:** 51 checks from `qa/interact.mjs`, covering inspectors, drawers and sheets (open, fit, step, close).

## Refined

| Surface | Authority | Before | After |
|---|---|---|---|
| Expression family hero, 40 shell routes | EXPR2 mobile and desktop/tablet boards | Heading `EXPRESSION` with the family as a sub-line. Suspended screens blank. Status strip sat above the tabs. Phone media-focus hero was 86 px. | The family or record title is the heading. The crumb reads `EXPRESSION / FAMILY`. The project lead subject sits on the central suspended screen in monochrome (ndxbook only). Tagline and side list (project + 5) are back. The status band follows the tabs. Phone hero is 108 px; short phones stay at 64 px, with crumb, title and a right-edge screen. Long titles wrap, as the authority does (`LOOK + / WARDROBE`). Hero type holds the 8.5 px floor. |
| Design pipeline stage objects, 5 of 6 modes (viewport mode hides them) | T12 desktop at a 1440 basis shows the objects at about 70–80 px | 56 desktop, 50 tablet, 36 phone, 26 short phone | 76 desktop (native crop) |

Stage sizes after the change, by viewport:

| Viewport | Size (px) |
|---|---|
| Desktop (native crop) | 76 |
| Desktop up to 860 tall | 62 |
| Desktop up to 760 tall | 46 (kept at the base size so panel 04 is not squeezed) |
| Tablet | 64 |
| Short tablet | 52 |
| Phone | 46 |
| Short phone | 32 |

The chamber absorbs the extra height, and stages are never upscaled past the 76 px source.

## Reviewed and left

- **Library Character Detail:** resident media already leads. The authority's landscape world hero would crush a portrait resident.
- **Character Fabrication mobile:** a 432×768 authority canvas zoomed to device width leaves about 100 px of slack on 19.5:9 phones. It is not recomposed; see `UNRESOLVED_AUTHORITY_GAPS.json`.
- **Expression production floor travel row:** U-16 proportion (`NEAR_MATCH`), carried forward.
- **HUB, Inbox, Experience, Library roots, Activity:** the detector found no drift beyond the base. Inbox keeps no giant cards and no KPI blocks; Activity keeps its text-only inspector.

## Results

| Measure | Before | After |
|---|---|---|
| Detector crop / type / spacing / strip | 96 / 89 / 97 / 4 | 96 / 89 / 97 / 4 |
| Page-scroll rows | 10 | 10 |
| Horizontal overflow | 0 | 0 |

- **Page-scroll rows:** all 10 are Character Fabrication's own frame overflow, which is pre-existing and unchanged.
- **No-scroll check:** the 6 Design modes measured at all 14 viewports show 0 page scroll.
- **Interaction checks:** 51 of 51 pass.

## Files

- `AUTHORITY_MATRIX.json`: per route, the authority status (FOUND / PARTIAL / CONFLICTING / MISSING), the authority sources, live status before and after, the refinement note and the per-viewport detector classes. Built by `scripts/build_reports.py`.
- `VISUAL_DIFF_REPORT.json`: the shared detector's report, before vs after.
- `NO_SCROLL_REPORT.json`: frame overflow, document overflow and horizontal overflow per route × viewport.
- `UNRESOLVED_AUTHORITY_GAPS.json`: these items stay unresolved, and no approval was synthesized:
  - U-07, U-08, U-05, U-15, U-11 and U-01
  - the portal gate
  - 30 generic icons
  - Character Fabrication mobile slack
  - Experience destination rows
  - the Activity inspector
  - hero subject for projects other than ndxbook
- `CONTACT_SHEETS/<FAMILY>_CONTACT_SHEET.jpg`: one sheet per family covering mobile, tablet and desktop. Each row shows AUTHORITY / BEFORE / AFTER.
- `CONTACT_SHEETS/comparison/`: the per-class sheets.
- `BEFORE/`, `AFTER/`: the representative captures used on the sheets (m390, t1024l and d1440).
- `scripts/measure.mjs`: page scroll, overflow and element size at the 14 viewports.
