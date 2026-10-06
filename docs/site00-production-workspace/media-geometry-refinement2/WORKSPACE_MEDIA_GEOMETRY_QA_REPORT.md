# Production Workspace — panel ↔ media geometry QA (refinement 2)

**Sprint:** P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2 · **Agent:** OPUS

**Mode:** responsive panel / media geometry only. Type scale (T0–T6, METRIC), HUB, routes, navigation, project data and product logic are unchanged. No new art and no paid generation.

**Before / after method.** `main` runs from a git worktree on its own Vite server; this branch runs on another. One audit script measures both.

## 1. The failure that caused the sprint

On EXPRESSION → CASTING at 393×852:
- **AVAILABLE TALENT.** The panel was 96px tall, shorter than one talent tile, so every tile was sliced through its name.
- **LEAD AUTHORITY.** The cast node art (272×110) was drawn as a 167×40 cover strip, about 55% of its height.
- **CASTING STATUS.** Below them, this panel took the spare height.

**Root cause.** The panel was fixed geometry, and media was forced into whatever was left:
- EXPRESSION phone grids used `minmax(0, N fr)` rows.
- `.exf-fill` previews used `flex: 1 1 auto`.
- INBOX and ACTIVITY art used fixed-pixel frames.
- `Img` defaulted to cover.

## 2. What changed

**Contract.** `src/site00/config/production-workspace-media.ts`, mirrored in the density CSS §8. It defines:
- 10 media ROLES: an asset type decides fit, crop policy, semantic aspect, focal, backdrop and text overlay.
- 4 SCALES: CHIP, TILE and PREVIEW drive panel height; PLATE never does. Legibility minimums are HUB's own.
- A focal contract (center, top, face, subject, custom) with region-anchored positions.
- Semantic aspects. HUB node-art ratios come from the receipt ledger and a test catches drift.
- 6 panel media modes, the mobile escape order and content priority.
- The intentional crop registry.

**Primitives.**
- `workspaceMediaAttrs`, `WorkspaceMediaSlot`, `HubImage`, `Thumb` and the EXPRESSION `Img` and `Mono` declare role, scale, crop, focal region, guard and aspect.
- `Img` now requires a role and has no cover default.
- `useWorkspaceCropGuard` contains a functional cover that would break its bound in the box it actually got.

**Geometry.**
- **EXPRESSION phone grids.** Content-driven when a panel declares media. Media-led panels take the full row.
- **PREVIEW.** Held at its approved aspect.
- **PORTRAIT_GRID.** About 3.3 portrait tiles (4:5) per view.
- **INBOX cards and the ACTIVITY milestone header.** These are MEDIA_LEAD. The whole authority stacks on phones. On tablet and desktop it shows at its approved aspect, in an art column widened to the PREVIEW floor (240px).
- **Raw images with a no-crop role.** Always contained.
- **Tablet and desktop.** Compositions kept.

**Declarations.** Every media call site in the 7 tabs declares its role.

## 3. Results (5 widths: 393×852 · 360×800 · 430×932 · 834×1194 · 1440×900)

**Scope.** The numbers below cover the six workspace tabs that HUB governs (INBOX, DESIGN, EXPERIENCE, EXPRESSION, LIBRARY and ACTIVITY), their child pages, and the measurements both runs judged by the same final contract. HUB itself is the authority the contract is calibrated from and is not changed, so it is reported separately as a control group (below).

| | Before (main) | After |
|---|---|---|
| Media measurements (element × viewport) | 2769 | **2769** |
| Unclassified, i.e. no declared role | 2769 | **0** |
| Functional · decorative | 1208 · 1561 | **1128 · 1641** |
| Crops (visible source < 98.5% on an axis) | 2112 | **1876** |
| Intentional crops (registered, in bounds, focal kept) | 1946 | **1876** |
| Unintentional crops | 166 | **0** |
| FUNCTIONAL_MEDIA_CROP_FAILURES | 194 | **0** |
| FIXED_PANEL_MEDIA_CONFLICTS (pane slice, panel clip, legibility) | 91 | **0** |
| MEDIA_DISTORTION | 0 | **0** |
| PORTRAIT_FOCAL_FAILURES | 0 | **0** |
| UI_SCREENSHOT_CROP_FAILURES | 15 | **0** |
| LOGO_CROP_FAILURES | 7 | **0** |
| AUTHORITY_PREVIEW_CROP_FAILURES | 90 | **0** |
| Document crop failures | 0 | **0** |
| Legibility below the scale minimum | 56 | **0** |
| Text over functional media | 0 | **0** |

**Per viewport (after).**

| Viewport | Measurements | Functional crop failures | Panel conflicts | Unintentional crops |
|---|---|---|---|---|
| mobile 393×852 | 539 | 0 | 0 | 0 |
| small 360×800 | 539 | 0 | 0 | 0 |
| large 430×932 | 539 | 0 | 0 | 0 |
| tablet 834×1194 | 576 | 0 | 0 | 0 |
| desktop 1440×900 | 576 | 0 | 0 | 0 |

**HUB authority (control, unchanged).** This covers the HUB root and the machine view.
- **Measurements:** 270 before · 270 after.
- **Unclassified:** 270 → 0. The machine view now declares every media role (data attributes only).
- **Crop failures:** 0 → 0. HUB's own crop classes are registered: `HUB_MACHINE_FRAME`, `HUB_ATMOSPHERE`, `NODE_ART_CHIP` and `NODE_ART_CARD`.
- **Below the workspace legibility floor:** 8 (9 before). These are HUB's own sizes and are not changed by rule:
  - hub-machine · hub-node-narrative (REFERENCE_AUTHORITY CHIP) at small: 13.8px short side, LEGIBILITY. HUB's machine schematic scales down at 360px; the same glyphs measure 16.9px or more at 393px and above (CHIP floor 16px).
  - hub-machine · hub-node-cast (REFERENCE_AUTHORITY CHIP) at small: 13.3px short side, LEGIBILITY. HUB's machine schematic scales down at 360px; the same glyphs measure 16.9px or more at 393px and above (CHIP floor 16px).
  - hub-machine · hub-node-look (REFERENCE_AUTHORITY CHIP) at small: 14.4px short side, LEGIBILITY. HUB's machine schematic scales down at 360px; the same glyphs measure 16.9px or more at 393px and above (CHIP floor 16px).
  - hub-machine · hub-node-performance (REFERENCE_AUTHORITY CHIP) at small: 13.8px short side, LEGIBILITY. HUB's machine schematic scales down at 360px; the same glyphs measure 16.9px or more at 393px and above (CHIP floor 16px).
  - hub-machine-activity · hub-node-narrative (REFERENCE_AUTHORITY CHIP) at small: 13.8px short side, LEGIBILITY. HUB's machine schematic scales down at 360px; the same glyphs measure 16.9px or more at 393px and above (CHIP floor 16px).
  - hub-machine-activity · hub-node-cast (REFERENCE_AUTHORITY CHIP) at small: 13.3px short side, LEGIBILITY. HUB's machine schematic scales down at 360px; the same glyphs measure 16.9px or more at 393px and above (CHIP floor 16px).
  - hub-machine-activity · hub-node-look (REFERENCE_AUTHORITY CHIP) at small: 14.4px short side, LEGIBILITY. HUB's machine schematic scales down at 360px; the same glyphs measure 16.9px or more at 393px and above (CHIP floor 16px).
  - hub-machine-activity · hub-node-performance (REFERENCE_AUTHORITY CHIP) at small: 13.8px short side, LEGIBILITY. HUB's machine schematic scales down at 360px; the same glyphs measure 16.9px or more at 393px and above (CHIP floor 16px).
- **Pixel diff vs main:** see §6.

**Coverage.**
- **Root tabs:** 7 / 7.
- **Child pages and material view states audited:** 78. Of these, 75 carry media. They comprise:
  - DESIGN: 6 modes plus the JURNL chamber.
  - EXPERIENCE: 7 sub-workspaces.
  - EXPRESSION: all 40 family routes, including 5 detail routes.
  - LIBRARY: 8 collections and 3 tabs.
  - ACTIVITY: 4 lenses and 4 milestones.
  - INBOX: 3 views.
  - HUB: the machine view.
- **Horizontal overflow (after):** 0.

## 4. Stress test (role contract in the real frame)

195 / 195 cases pass. That is 13 sources × 3 scales (CHIP, TILE, PREVIEW) × 5 widths.

The sources: very_tall_portrait, very_wide_landscape, square, transparent_logo, tiny_source, source_4k, ui_screenshot, document, authority_board, face_near_top, face_near_bottom, missing, broken.

Each case asserts:
- no-crop roles keep the whole source;
- focal-safe roles keep their region, including faces at the top and bottom edges;
- no distortion;
- the panel contains its media;
- no layout shift between loading and loaded;
- a broken source never collapses its slot;
- no horizontal scroll.

## 5. Intentional crop registry (15 classes; anything else is a failure)

| Class | Role | Bound | Focal | Measured uses (after) | Crop / focal failures |
|---|---|---|---|---|---|
| HERO_PLATE_BAND | DECORATIVE_ART | 0 | NONE | 315 | 0 |
| LIBRARY_PLATE | DECORATIVE_ART | 0 | NONE | 432 | 0 |
| STAGE_FLOOR_CROP | DECORATIVE_ART | 0 | NONE | 0 | 0 |
| DESIGN_CHAMBER_ART | DECORATIVE_ART | 0 | NONE | 40 | 0 |
| DESIGN_CHAMBER_MINIATURE | DECORATIVE_ART | 0 | NONE | 293 | 0 |
| DESIGN_TABLE_PLATE | DECORATIVE_ART | 0 | NONE | 107 | 0 |
| OVERVIEW_BACKDROP | DECORATIVE_ART | 0 | NONE | 5 | 0 |
| EXPERIENCE_WORLD_CROP | DECORATIVE_ART | 0 | NONE | 35 | 0 |
| NODE_ART_CHIP | REFERENCE_AUTHORITY | 0.28 | POINT | 444 | 0 |
| NODE_ART_CARD | REFERENCE_AUTHORITY | 0.5 | REGION | 320 | 0 |
| HUB_MACHINE_FRAME | VIDEO_FRAME | 0.5 | REGION | 140 | 0 |
| HUB_ATMOSPHERE | DECORATIVE_ART | 0 | NONE | 10 | 0 |
| PORTRAIT_FACE_SAFE | PORTRAIT | 0.5 | REGION | 0 | 0 |
| SCENE_SUBJECT_SAFE | LANDSCAPE_EDITORIAL | 0.5 | REGION | 0 | 0 |
| FRAME_TRIM | VIDEO_FRAME | 0.88 | REGION | 0 | 0 |

**Previous decorative classification (re-reviewed).**
- **The 23 DESIGN decorative-art crops.** All are chamber miniatures or chamber atmosphere, and stay registered. Two classes in the same area were not decorative and are fixed:
  - the JURNL table cards, which are approved F01 screens and now render as contained UI screenshots;
  - the DESIGN overview mark, a logo that was clipped by about 10% on tablet and desktop.
- **The 4 scroll-edge frames.** The fade is intentional only for overflowing text and list panes. Content-sized panels never fade.

## 6. Regression

| Check | Result |
|---|---|
| HUB pixel diff vs main (HUB root and machine view, 5 widths) | hub mobile 0% · machine mobile 0% · machine-activity mobile 0% · hub small 0% · machine small 0% · machine-activity small 0% · hub large 0% · machine large 0% · machine-activity large 0% · hub tablet 0% · machine tablet 0% · machine-activity tablet 0% · hub desktop 0% · machine desktop 0% · machine-activity desktop 0% |
| Typography (density audit, mobile / tablet / desktop) | 5063 text nodes matched across 75 route×viewport pages — 0 with a changed font-size / weight / line-height / letter-spacing; max font-size 62px → 62px; mobile: root titles 0→0, child layers 0→0, text clips 10→10; tablet: root titles 1→1, child layers 34→34, text clips 23→23; desktop: root titles 1→1, child layers 7→7, text clips 30→30 |
| Type tokens | T0–T6 and METRIC unchanged. The only new font-size is the missing-headshot initials, which use the T4 token. |
| Routing / navigation / data / product logic | unchanged: no route, data or store edits |
| Unit tests | `tests/productionWorkspacePanelMediaGeometry2.test.tsx` plus the updated REFINEMENT1 guards. Full suite: 2202 files, 10501 tests. 106 fail, and they are the identical set on main (merge base); 0 new failures. |

## 7. Founder review notes

- **INBOX root focus card on phones.** The decision authority now stacks above the facts instead of a 4:5 crop. The alternative, containing it in the old 4:5 frame, renders a 2.3:1 authority as a 104×45 strip with 85px of empty ground. This is the only root-tab change, and it is internal to that card.
- **INBOX decision / notice cards and the ACTIVITY milestone header on tablet and desktop.** The lead art column grows from 150–210px to 240px, the PREVIEW floor, so the whole authority reads at 240×97–104 instead of a cropped thumbnail. On tablet, the decision card's side summary (affects / dependencies / reviewers) moves to its own row, the phone card's three-cell strip. That removes the facts column's mid-word breaks seen on main (`STORYBOA / RD`).
- **EXPRESSION root frame strip.** Storyboard frames are contained on dark: F04 and F08 are portrait frames and were cut to about 55%.
- **Soft sources.** Node art and storyboard frames are 42–640px pixel crops from the authority screens, so some full-width previews are soft. That is source resolution, not framing. A later sprint can re-cut larger crops from the same authority screens without new art.
- **No actor headshots in the catalogue yet.** AVAILABLE TALENT shows the initials state in the 4:5 portrait slot. Real headshots will drop into the same slot under the face-safe crop and the crop guard.
- **No document media.** None exists in the workspace today. The DOCUMENT_PREVIEW role is covered by the contract and the stress test.

Board: `screenshots/boards/` (see `WORKSPACE_MEDIA_GEOMETRY_SCREENSHOT_MANIFEST.json`).
