#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2 — verdicts for a media geometry audit.
 *
 * Reads <dir>/media-audit-*.json (media-geometry-audit.mjs) and applies the role contract + intentional crop registry
 * (src/site00/config/production-workspace-media.ts) to every measured element:
 *
 *   UNCLASSIFIED            no declared data-media-role (inferred for the audit)
 *   CROP_UNREGISTERED       the visible source window is cropped and no registry entry covers the element
 *   CROP_OUT_OF_BOUNDS      registered, but cropped beyond the entry's minVisibleAxis
 *   CROP_FORBIDDEN          a NONE-policy role (UI / logo / document / other functional) is cropped at all
 *   FOCAL_FAIL              the protected focal region (or point, for chips) left the visible window
 *   PANE_SLICE              a media unit is larger than the pane that holds it (sliced by a fixed panel)
 *   PANEL_CLIP              a fixed panel / cell clips the media box itself
 *   LEGIBILITY              below the media scale's minimum (CHIP / TILE short side, PREVIEW block size)
 *   DISTORTION              the painted aspect differs from the source (fill / non-uniform size / transform)
 *   TEXT_OVERLAY            text drawn over functional media whose role forbids it
 *
 *   npx tsx scripts/production-workspace/media-geometry-report.mjs <dir> [label]  → <dir>/media-report.json
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  WORKSPACE_INTENTIONAL_CROPS,
  WORKSPACE_MEDIA_ROLES,
  WORKSPACE_MEDIA_SCALES,
  inferWorkspaceCrop,
  inferWorkspaceMediaRole,
  inferWorkspaceMediaScale,
  workspaceCrop,
} from '../../src/site00/config/production-workspace-media.ts';

const [dir, label = 'audit'] = process.argv.slice(2);
const VP_BY_WIDTH = { 393: 'mobile', 360: 'small', 430: 'large', 834: 'tablet', 1440: 'desktop' };
const rows = readdirSync(dir)
  .filter((f) => /^media-audit-.*\.json$/.test(f))
  .flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
  .map((r) => ({ ...r, viewport: typeof r.viewport === 'string' ? r.viewport : (VP_BY_WIDTH[r.width] ?? String(r.width)) }));

const CROP_EPS = 0.985;
const FOCAL_TOL = 0.03;

export function verdicts(m, family) {
  const v = [];
  const def = WORKSPACE_MEDIA_ROLES[m.role];
  const sdef = WORKSPACE_MEDIA_SCALES[m.scale];
  const functional = def.functional;
  if (m.roleSource !== 'declared') v.push('UNCLASSIFIED');
  let vx = 1;
  let vy = 1;
  if (m.win) {
    vx = m.win.x1 - m.win.x0;
    vy = m.win.y1 - m.win.y0;
  } else if (m.kind === 'slot') {
    vx = vy = Math.sqrt(Math.max(0, m.clipFrac));
  }
  const minAxis = Math.min(vx, vy);
  const cropped = minAxis < CROP_EPS;
  const entry = workspaceCrop(m.cropId) ?? (m.matchedCrops ?? []).map((id) => workspaceCrop(id)).find(Boolean) ?? null;
  const panelClip = m.clipBy && m.clipFrac < CROP_EPS && /exf-panel|iax-panel|ibx-pane|pxa-panel|pwk-panel|exf-panel__body|panel|card|tile/.test(m.clipBy);
  if (cropped && m.kind !== 'slot') {
    if (def.crop === 'NONE') v.push('CROP_FORBIDDEN');
    else if (!entry || entry.role !== m.role) v.push('CROP_UNREGISTERED');
    else if (minAxis < entry.minVisibleAxis - 0.005) v.push('CROP_OUT_OF_BOUNDS');
    if (entry && entry.focal !== 'NONE' && m.focalRegion && m.win) {
      const [x0, y0, x1, y1] = m.focalRegion.split(' ').map(Number);
      const w = m.win;
      const inside =
        entry.focal === 'REGION' ?
          x0 >= w.x0 - FOCAL_TOL && x1 <= w.x1 + FOCAL_TOL && y0 >= w.y0 - FOCAL_TOL && y1 <= w.y1 + FOCAL_TOL
        : (x0 + x1) / 2 >= w.x0 && (x0 + x1) / 2 <= w.x1 && (y0 + y1) / 2 >= w.y0 && (y0 + y1) / 2 <= w.y1;
      if (!inside) v.push('FOCAL_FAIL');
    }
  }
  if (functional && (m.paneIssues ?? []).length) v.push('PANE_SLICE');
  if (functional && panelClip) v.push('PANEL_CLIP');
  if (functional && sdef) {
    const min = sdef.minPx[family] ?? 0;
    const short = Math.min(m.box.w, m.box.h);
    const legible = m.scale === 'PREVIEW' ? m.box.h >= min || m.box.w >= (sdef.minInlinePx?.[family] ?? Infinity) : short >= min;
    if (!legible) v.push('LEGIBILITY');
  }
  if (m.distorted) v.push('DISTORTION');
  if (functional && def.textOverlay === 'NEVER' && (m.overlays ?? []).length) v.push('TEXT_OVERLAY');
  return { codes: v, cropped, minAxis: Math.round(minAxis * 1000) / 1000, entry: entry?.id ?? null };
}

/** Registry `where` selectors matched offline (class / slot tokens) when the audit recorded no in-page match. */
function whereMatches(m) {
  const cls = `${m.cls ?? ''} ${m.parentCls ?? ''} ${m.hints?.cls ?? ''}`;
  // union with the in-page matches so an audit taken against an older registry is judged by the same contract
  const offline = WORKSPACE_INTENTIONAL_CROPS.filter((c) =>
    c.where.some((sel) => {
      const slot = /data-media-slot='([A-Z_]+)'/.exec(sel)?.[1];
      if (slot) return m.hints?.slot === slot;
      const tokens = [...sel.matchAll(/\.([a-z0-9_-]+)/gi)].map((x) => x[1]);
      const neg = /:not\(\.([a-z0-9_-]+)\)/i.exec(sel)?.[1];
      return tokens.length && tokens.filter((t) => t !== neg).every((t) => cls.includes(t)) && !(neg && cls.includes(neg));
    }),
  ).map((c) => c.id);
  return [...new Set([...(m.matchedCrops ?? []), ...offline])];
}

/** Undeclared media are judged by what the contract would accept (role / scale / crop class inferred from the asset). */
function normalize(m) {
  const hints = { ...m.hints, src: m.src };
  if (m.roleSource !== 'declared') m.role = inferWorkspaceMediaRole(hints);
  if (m.scaleSource !== 'declared') m.scale = inferWorkspaceMediaScale({ ...hints, role: m.role, box: m.box });
  if (m.cropSource !== 'declared') m.cropId = inferWorkspaceCrop(m.role, m.scale, whereMatches(m));
  return m;
}

const FAIL = new Set(['CROP_UNREGISTERED', 'CROP_OUT_OF_BOUNDS', 'CROP_FORBIDDEN', 'FOCAL_FAIL', 'PANE_SLICE', 'PANEL_CLIP', 'LEGIBILITY', 'DISTORTION', 'TEXT_OVERLAY']);
const elements = [];
for (const r of rows) {
  for (const m of (r.media ?? []).map(normalize)) {
    const res = verdicts(m, r.family);
    elements.push({ viewport: r.viewport, width: r.width, route: r.id, tab: r.tab, kind: r.kind, el: `${m.kind}:${m.cls || m.parentCls}`, ctx: m.ctx, panel: m.panel?.testid ?? m.panel?.title ?? m.panel?.cls ?? null, panelMode: m.panel?.mode ?? null, role: m.role, roleSource: m.roleSource, scale: m.scale, fit: m.hints?.fit ?? null, cropId: m.cropId ?? null, src: m.src, box: m.box, natural: m.natural, win: m.win, paneIssues: m.paneIssues, clipBy: m.clipBy, clipFrac: m.clipFrac, ...res });
  }
}

const by = (pred) => elements.filter(pred).length;
const has = (code) => (e) => e.codes.includes(code);
const fn = (e) => WORKSPACE_MEDIA_ROLES[e.role].functional;
const totals = (els) => ({
  elements: els.length,
  functional: els.filter(fn).length,
  decorative: els.filter((e) => !fn(e)).length,
  unclassified: els.filter(has('UNCLASSIFIED')).length,
  cropped: els.filter((e) => e.cropped && !e.el.startsWith('slot')).length,
  intentionalCrops: els.filter((e) => e.cropped && !e.el.startsWith('slot') && e.entry && !e.codes.some((c) => c.startsWith('CROP_') || c === 'FOCAL_FAIL')).length,
  unintentionalCrops: els.filter((e) => e.codes.some((c) => c === 'CROP_UNREGISTERED' || c === 'CROP_OUT_OF_BOUNDS' || c === 'CROP_FORBIDDEN')).length,
  functionalMediaCropFailures: els.filter((e) => fn(e) && e.codes.some((c) => ['CROP_UNREGISTERED', 'CROP_OUT_OF_BOUNDS', 'CROP_FORBIDDEN', 'FOCAL_FAIL', 'PANE_SLICE', 'PANEL_CLIP'].includes(c))).length,
  fixedPanelMediaConflicts: els.filter((e) => fn(e) && e.codes.some((c) => c === 'PANE_SLICE' || c === 'PANEL_CLIP' || c === 'LEGIBILITY')).length,
  distortion: els.filter(has('DISTORTION')).length,
  portraitFocalFailures: els.filter((e) => e.role === 'PORTRAIT' && (e.codes.includes('FOCAL_FAIL') || e.codes.includes('CROP_OUT_OF_BOUNDS'))).length,
  uiScreenshotCropFailures: els.filter((e) => e.role === 'UI_SCREENSHOT' && e.codes.some((c) => c.startsWith('CROP_') || c === 'PANEL_CLIP' || c === 'PANE_SLICE')).length,
  logoCropFailures: els.filter((e) => e.role === 'LOGO_MARK' && e.codes.some((c) => c.startsWith('CROP_') || c === 'PANEL_CLIP')).length,
  authorityPreviewCropFailures: els.filter((e) => e.role === 'REFERENCE_AUTHORITY' && e.codes.some((c) => c.startsWith('CROP_') || c === 'PANEL_CLIP' || c === 'PANE_SLICE')).length,
  documentCropFailures: els.filter((e) => e.role === 'DOCUMENT_PREVIEW' && e.codes.some((c) => c.startsWith('CROP_') || c === 'PANEL_CLIP')).length,
  legibility: els.filter(has('LEGIBILITY')).length,
  textOverlay: els.filter(has('TEXT_OVERLAY')).length,
  failing: els.filter((e) => e.codes.some((c) => FAIL.has(c))).length,
});

/**
 * HUB is the media authority the contract is calibrated from and the sprint does not change it (pixel-diffed instead).
 * Its media are measured and declared like every other tab but reported as the AUTHORITY CONTROL group; the workspace
 * totals (`totals`, `byViewport`) are the six tabs HUB governs.
 */
const isHub = (e) => e.tab === 'HUB';
const workspace = elements.filter((e) => !isHub(e));
const viewports = [...new Set(rows.map((r) => r.viewport))];
const report = {
  label,
  generatedFrom: dir,
  routes: { roots: [...new Set(rows.filter((r) => r.kind === 'root').map((r) => r.id))].length, children: [...new Set(rows.filter((r) => r.kind === 'child').map((r) => r.id))].length, tabs: [...new Set(rows.map((r) => r.tab))] },
  childPagesWithMedia: [...new Set(rows.filter((r) => r.kind === 'child' && (r.media ?? []).length).map((r) => r.id))].length,
  overflowX: Object.fromEntries(viewports.map((vp) => [vp, rows.filter((r) => r.viewport === vp && (r.overflowCount > 0 || r.docOverflowX)).map((r) => r.id)])),
  errors: rows.filter((r) => (r.errors ?? []).length).map((r) => ({ viewport: r.viewport, id: r.id, errors: r.errors })),
  totals: totals(workspace),
  hubAuthority: { ...totals(elements.filter(isHub)), deviations: elements.filter((e) => isHub(e) && e.codes.some((c) => FAIL.has(c))).map((e) => ({ viewport: e.viewport, route: e.route, ctx: e.ctx, role: e.role, scale: e.scale, box: e.box, minAxis: e.minAxis, codes: e.codes.filter((c) => FAIL.has(c)) })) },
  allTotals: totals(elements),
  byViewport: Object.fromEntries(viewports.map((vp) => [vp, totals(workspace.filter((e) => e.viewport === vp))])),
  byRole: Object.fromEntries(Object.keys(WORKSPACE_MEDIA_ROLES).map((r) => [r, totals(elements.filter((e) => e.role === r))]).filter(([, t]) => t.elements)),
  byTab: Object.fromEntries([...new Set(elements.map((e) => e.tab))].map((t) => [t, totals(elements.filter((e) => e.tab === t))])),
  registry: WORKSPACE_INTENTIONAL_CROPS.map((c) => ({ id: c.id, role: c.role, uses: elements.filter((e) => e.entry === c.id && e.cropped).length })),
  failures: elements.filter((e) => e.codes.some((c) => FAIL.has(c))),
  elements,
};
writeFileSync(join(dir, 'media-report.json'), JSON.stringify(report, null, 1));
const t = report.totals;
console.log(`${label}: ${t.elements} measurements · functional ${t.functional} · decorative ${t.decorative} · unclassified ${t.unclassified}`);
console.log(`  crops ${t.cropped} (intentional ${t.intentionalCrops}, unintentional ${t.unintentionalCrops}) · functional crop failures ${t.functionalMediaCropFailures} · panel conflicts ${t.fixedPanelMediaConflicts} · distortion ${t.distortion}`);
console.log(`  portrait focal ${t.portraitFocalFailures} · UI ${t.uiScreenshotCropFailures} · logo ${t.logoCropFailures} · authority ${t.authorityPreviewCropFailures} · document ${t.documentCropFailures} · legibility ${t.legibility} · overlay ${t.textOverlay}`);
const h = report.hubAuthority;
console.log(`  HUB authority (control, unchanged): ${h.elements} measurements · unclassified ${h.unclassified} · fn-crop ${h.functionalMediaCropFailures} · legibility ${h.legibility} · failing ${h.failing}`);
for (const [vp, x] of Object.entries(report.byViewport)) console.log(`  ${vp.padEnd(8)} elements ${x.elements} · fn-crop ${x.functionalMediaCropFailures} · conflicts ${x.fixedPanelMediaConflicts} · unintentional ${x.unintentionalCrops} · overflowX ${report.overflowX[vp].length}`);
