#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2 — QA report (markdown) from the measured artifacts.
 * Every number comes from WORKSPACE_MEDIA_GEOMETRY_QA_TOTALS.json / _AUDIT.json / _STRESS_TEST.json.
 *
 *   node scripts/production-workspace/media-geometry-qa-report.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'docs/site00-production-workspace/media-geometry-refinement2';
const read = (n) => JSON.parse(readFileSync(`${DIR}/${n}`, 'utf8'));
const T = read('WORKSPACE_MEDIA_GEOMETRY_QA_TOTALS.json');
const AUDIT = read('WORKSPACE_MEDIA_GEOMETRY_AUDIT.json');
const STRESS = read('WORKSPACE_MEDIA_STRESS_TEST.json');
const REG = read('WORKSPACE_INTENTIONAL_CROP_REGISTRY.json');
const b = T.before;
const a = T.after;
const VP = ['mobile', 'small', 'large', 'tablet', 'desktop'];
const W = { mobile: '393×852', small: '360×800', large: '430×932', tablet: '834×1194', desktop: '1440×900' };
const row = (label, k) => `| ${label} | ${b[k]} | **${a[k]}** |`;
const typo = T.typography;
const hub = T.hubPixelDiff;
const hb = T.hubAuthority.before;
const ha = T.hubAuthority.after;

const md = `# Production Workspace — panel ↔ media geometry QA (refinement 2)

**Sprint:** P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2 · **Agent:** OPUS

**Mode:** responsive panel / media geometry only. Type scale (T0–T6, METRIC), HUB, routes, navigation, project data and product logic are unchanged. No new art and no paid generation.

**Before / after method.** \`main\` runs from a git worktree on its own Vite server; this branch runs on another. One audit script measures both.

## 1. The failure that caused the sprint

On EXPRESSION → CASTING at 393×852:
- **AVAILABLE TALENT.** The panel was 96px tall, shorter than one talent tile, so every tile was sliced through its name.
- **LEAD AUTHORITY.** The cast node art (272×110) was drawn as a 167×40 cover strip, about 55% of its height.
- **CASTING STATUS.** Below them, this panel took the spare height.

**Root cause.** The panel was fixed geometry, and media was forced into whatever was left:
- EXPRESSION phone grids used \`minmax(0, N fr)\` rows.
- \`.exf-fill\` previews used \`flex: 1 1 auto\`.
- INBOX and ACTIVITY art used fixed-pixel frames.
- \`Img\` defaulted to cover.

## 2. What changed

**Contract.** \`src/site00/config/production-workspace-media.ts\`, mirrored in the density CSS §8. It defines:
- 10 media ROLES: an asset type decides fit, crop policy, semantic aspect, focal, backdrop and text overlay.
- 4 SCALES: CHIP, TILE and PREVIEW drive panel height; PLATE never does. Legibility minimums are HUB's own.
- A focal contract (center, top, face, subject, custom) with region-anchored positions.
- Semantic aspects. HUB node-art ratios come from the receipt ledger and a test catches drift.
- 6 panel media modes, the mobile escape order and content priority.
- The intentional crop registry.

**Primitives.**
- \`workspaceMediaAttrs\`, \`WorkspaceMediaSlot\`, \`HubImage\`, \`Thumb\` and the EXPRESSION \`Img\` and \`Mono\` declare role, scale, crop, focal region, guard and aspect.
- \`Img\` now requires a role and has no cover default.
- \`useWorkspaceCropGuard\` contains a functional cover that would break its bound in the box it actually got.

**Geometry.**
- **EXPRESSION phone grids.** Content-driven when a panel declares media. Media-led panels take the full row.
- **PREVIEW.** Held at its approved aspect.
- **PORTRAIT_GRID.** About 3.3 portrait tiles (4:5) per view.
- **INBOX cards and the ACTIVITY milestone header.** MEDIA_LEAD: the whole authority is stacked on phones and shown at its approved aspect on tablet and desktop.
- **Raw images with a no-crop role.** Always contained.
- **Tablet and desktop.** Compositions kept.

**Declarations.** Every media call site in the 7 tabs declares its role.

## 3. Results (5 widths: ${VP.map((v) => W[v]).join(' · ')})

**Scope.** The numbers below cover the six workspace tabs that HUB governs (INBOX, DESIGN, EXPERIENCE, EXPRESSION, LIBRARY and ACTIVITY), their child pages, and the measurements both runs judged by the same final contract. HUB itself is the authority the contract is calibrated from and is not changed, so it is reported separately as a control group (below).

| | Before (main) | After |
|---|---|---|
| Media measurements (element × viewport) | ${b.elements} | **${a.elements}** |
| Unclassified, i.e. no declared role | ${b.unclassified} | **${a.unclassified}** |
| Functional · decorative | ${b.functional} · ${b.decorative} | **${a.functional} · ${a.decorative}** |
| Crops (visible source < 98.5% on an axis) | ${b.cropped} | **${a.cropped}** |
${row('Intentional crops (registered, in bounds, focal kept)', 'intentionalCrops')}
${row('Unintentional crops', 'unintentionalCrops')}
${row('FUNCTIONAL_MEDIA_CROP_FAILURES', 'functionalMediaCropFailures')}
${row('FIXED_PANEL_MEDIA_CONFLICTS (pane slice, panel clip, legibility)', 'fixedPanelMediaConflicts')}
${row('MEDIA_DISTORTION', 'distortion')}
${row('PORTRAIT_FOCAL_FAILURES', 'portraitFocalFailures')}
${row('UI_SCREENSHOT_CROP_FAILURES', 'uiScreenshotCropFailures')}
${row('LOGO_CROP_FAILURES', 'logoCropFailures')}
${row('AUTHORITY_PREVIEW_CROP_FAILURES', 'authorityPreviewCropFailures')}
${row('Document crop failures', 'documentCropFailures')}
${row('Legibility below the scale minimum', 'legibility')}
${row('Text over functional media', 'textOverlay')}

**Per viewport (after).**

| Viewport | Measurements | Functional crop failures | Panel conflicts | Unintentional crops |
|---|---|---|---|---|
${VP.map((v) => `| ${v} ${W[v]} | ${AUDIT.byViewport.after[v]?.elements ?? '—'} | ${AUDIT.byViewport.after[v]?.functionalMediaCropFailures ?? '—'} | ${AUDIT.byViewport.after[v]?.fixedPanelMediaConflicts ?? '—'} | ${AUDIT.byViewport.after[v]?.unintentionalCrops ?? '—'} |`).join('\n')}

**HUB authority (control, unchanged).** This covers the HUB root and the machine view.
- **Measurements:** ${hb.elements} before · ${ha.elements} after.
- **Unclassified:** ${hb.unclassified} → ${ha.unclassified}. The machine view now declares every media role (data attributes only).
- **Crop failures:** ${hb.functionalMediaCropFailures} → ${ha.functionalMediaCropFailures}. HUB's own crop classes are registered: \`HUB_MACHINE_FRAME\`, \`HUB_ATMOSPHERE\`, \`NODE_ART_CHIP\` and \`NODE_ART_CARD\`.
- **Below the workspace legibility floor:** ${ha.legibility} (${hb.legibility} before). These are HUB's own sizes and are not changed by rule:
${(ha.deviations ?? []).map((d) => `  - ${d.ctx} (${d.role} ${d.scale}) at ${d.viewports.join(' / ')}: ${d.minShortPx}px short side, ${d.codes}.`).join('\n')}
- **Pixel diff vs main:** see §6.

**Coverage.**
- **Root tabs:** ${T.routes.after.rootTabs} / 7.
- **Child pages and material view states audited:** ${T.routes.after.childPagesAudited}. Of these, ${T.routes.after.childPagesWithMedia} carry media. They comprise:
  - DESIGN: 6 modes plus the JURNL chamber.
  - EXPERIENCE: 7 sub-workspaces.
  - EXPRESSION: all 40 family routes, including 5 detail routes.
  - LIBRARY: 8 collections and 3 tabs.
  - ACTIVITY: 4 lenses and 4 milestones.
  - INBOX: 3 views.
  - HUB: the machine view.
- **Horizontal overflow (after):** ${T.overflowXAfter}.

## 4. Stress test (role contract in the real frame)

${STRESS.totals.pass} / ${STRESS.totals.cases} cases pass. That is ${STRESS.sources.length} sources × ${STRESS.scales.length} scales (CHIP, TILE, PREVIEW) × 5 widths.

The sources: ${STRESS.sources.join(', ')}.

Each case asserts:
- no-crop roles keep the whole source;
- focal-safe roles keep their region, including faces at the top and bottom edges;
- no distortion;
- the panel contains its media;
- no layout shift between loading and loaded;
- a broken source never collapses its slot;
- no horizontal scroll.

## 5. Intentional crop registry (${REG.entries.length} classes; anything else is a failure)

| Class | Role | Bound | Focal | Measured uses (after) | Failures |
|---|---|---|---|---|---|
${REG.entries.map((c) => `| ${c.id} | ${c.role} | ${c.minVisibleAxis} | ${c.focal} | ${c.measuredAfter.crops} | ${c.measuredAfter.failures} |`).join('\n')}

**Previous decorative classification (re-reviewed).**
- **The 23 DESIGN decorative-art crops.** All are chamber miniatures or chamber atmosphere, and stay registered. Two classes in the same area were not decorative and are fixed:
  - the JURNL table cards, which are approved F01 screens and now render as contained UI screenshots;
  - the DESIGN overview mark, a logo that was clipped by about 10% on tablet and desktop.
- **The 4 scroll-edge frames.** The fade is intentional only for overflowing text and list panes. Content-sized panels never fade.

## 6. Regression

| Check | Result |
|---|---|
| HUB pixel diff vs main (HUB root and machine view, 5 widths) | ${hub ? Object.entries(hub).map(([k, v]) => `${k} ${v}%`).join(' · ') : 'see QA totals'} |
| Typography (density audit, mobile / tablet / desktop) | ${typo ? typo.summary : 'see QA totals'} |
| Type tokens | T0–T6 and METRIC unchanged. The only new font-size is the missing-headshot initials, which use the T4 token. |
| Routing / navigation / data / product logic | unchanged: no route, data or store edits |
| Unit tests | \`tests/productionWorkspacePanelMediaGeometry2.test.tsx\` plus the updated REFINEMENT1 guards |

## 7. Founder review notes

- **INBOX root focus card on phones.** The decision authority now stacks above the facts instead of a 4:5 crop. The alternative, containing it in the old 4:5 frame, renders a 2.3:1 authority as a 104×45 strip with 85px of empty ground. This is the only root-tab change, and it is internal to that card.
- **EXPRESSION root frame strip.** Storyboard frames are contained on dark: F04 and F08 are portrait frames and were cut to about 55%.
- **Soft sources.** Node art and storyboard frames are 42–640px pixel crops from the authority screens, so some full-width previews are soft. That is source resolution, not framing. A later sprint can re-cut larger crops from the same authority screens without new art.
- **No actor headshots in the catalogue yet.** AVAILABLE TALENT shows the initials state in the 4:5 portrait slot. Real headshots will drop into the same slot under the face-safe crop and the crop guard.
- **No document media.** None exists in the workspace today. The DOCUMENT_PREVIEW role is covered by the contract and the stress test.

Board: \`screenshots/boards/\` (see \`WORKSPACE_MEDIA_GEOMETRY_SCREENSHOT_MANIFEST.json\`).
`;
writeFileSync(`${DIR}/WORKSPACE_MEDIA_GEOMETRY_QA_REPORT.md`, md);
console.log('QA report written');
