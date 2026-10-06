/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2 — sprint artifacts.
 *
 * Contracts come from the single source (src/site00/config/production-workspace-media.ts + -density.ts); measured
 * numbers from the before / after media reports (media-geometry-report.mjs) and the stress test.
 *
 *   npx tsx scripts/production-workspace/media-geometry-artifacts.ts <beforeDir> <afterDir> <stressDir> [hubDiff.json] [typeRegression.json]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { WORKSPACE_MEDIA_FIT_MODES, WORKSPACE_MEDIA_SLOTS } from '../../src/site00/config/production-workspace-density';
import {
  HUB_NODE_ART_ASPECT,
  WORKSPACE_APPROVED_ASPECTS,
  WORKSPACE_INTENTIONAL_CROPS,
  WORKSPACE_MEDIA_ROLES,
  WORKSPACE_MEDIA_SCALES,
  WORKSPACE_MOBILE_ESCAPE_ORDER,
  WORKSPACE_PANEL_CONTENT_PRIORITY,
  WORKSPACE_PANEL_MEDIA_MODES,
  resolveWorkspaceFocal,
} from '../../src/site00/config/production-workspace-media';
import { WORKSPACE_PANEL_DEFAULT_SLOT } from '../../src/site00/components/productionAuthority/WorkspacePanel';

const [beforeDir, afterDir, stressDir, hubDiffPath, typePath] = process.argv.slice(2);
const DIR = 'docs/site00-production-workspace/media-geometry-refinement2';
const SPRINT = 'P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2';
mkdirSync(DIR, { recursive: true });
const write = (name: string, data: unknown) => writeFileSync(`${DIR}/${name}`, `${JSON.stringify(data, null, 2)}\n`);
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));

type El = {
  viewport: string;
  route: string;
  tab: string;
  kind: string;
  el: string;
  panel: string | null;
  panelMode: string | null;
  role: string;
  roleSource: string;
  scale: string;
  fit: string | null;
  cropId: string | null;
  src: string | null;
  box: { w: number; h: number };
  natural: { w: number; h: number } | null;
  codes: string[];
  cropped: boolean;
  minAxis: number;
  entry: string | null;
  clipBy: string | null;
  clipFrac: number;
  paneIssues: { axis: string; unit: number; pane: number; by: string }[];
};
type Hub = Record<string, number> & { deviations: { viewport: string; route: string; ctx: string; role: string; scale: string; box: { w: number; h: number }; minAxis: number; codes: string[] }[] };
type Report = { totals: Record<string, number>; hubAuthority: Hub; allTotals: Record<string, number>; byViewport: Record<string, Record<string, number>>; byRole: Record<string, Record<string, number>>; byTab: Record<string, Record<string, number>>; routes: { roots: number; children: number }; childPagesWithMedia: number; overflowX: Record<string, string[]>; errors: unknown[]; elements: El[]; failures: El[]; registry: { id: string; uses: number }[] };
const before: Report = read(`${beforeDir}/media-report.json`);
const after: Report = read(`${afterDir}/media-report.json`);
const stress = read(`${stressDir}/media-stress.json`);
const hubDiff = hubDiffPath && existsSync(hubDiffPath) ? read(hubDiffPath) : null;
const typeReg = typePath && existsSync(typePath) ? read(typePath) : null;

const FAILS = ['CROP_UNREGISTERED', 'CROP_OUT_OF_BOUNDS', 'CROP_FORBIDDEN', 'FOCAL_FAIL', 'PANE_SLICE', 'PANEL_CLIP', 'LEGIBILITY', 'DISTORTION', 'TEXT_OVERLAY'];
const fails = (e: El) => e.codes.filter((c) => FAILS.includes(c));
const key = (e: El) => `${e.tab}|${e.panel ?? e.el}|${e.role}|${e.scale}`;
const uniq = <T>(xs: T[]) => [...new Set(xs)];

/* ── 1. role registry ──────────────────────────────────────────────────────────────────────────────── */
const usage = new Map<string, { tab: string; panel: string; element: string; role: string; scale: string; fit: string | null; crop: string | null; panelMode: string | null; routes: Set<string>; viewports: Set<string>; measurements: number }>();
for (const e of after.elements) {
  const k = key(e);
  const u = usage.get(k) ?? { tab: e.tab, panel: e.panel ?? '—', element: e.el, role: e.role, scale: e.scale, fit: e.fit, crop: e.cropId, panelMode: e.panelMode, routes: new Set(), viewports: new Set(), measurements: 0 };
  u.routes.add(e.route);
  u.viewports.add(e.viewport);
  u.measurements++;
  usage.set(k, u);
}
write('WORKSPACE_MEDIA_ROLE_REGISTRY.json', {
  sprint: SPRINT,
  name: 'WorkspaceMediaRoleRegistry',
  source: 'src/site00/config/production-workspace-media.ts (WORKSPACE_MEDIA_ROLES) · declared at every call site through workspaceMediaAttrs / data-media-role',
  rule: 'MEDIA MODE MUST BE EXPLICIT BY ASSET TYPE — every media element declares a role; the role decides fit, crop policy, aspect, focal, backdrop and whether text may overlay it.',
  roles: Object.values(WORKSPACE_MEDIA_ROLES).map((r) => ({ ...r, focal: typeof r.focal === 'string' ? { point: r.focal, ...resolveWorkspaceFocal(r.focal) } : r.focal })),
  declared: { after: after.allTotals.elements - after.allTotals.unclassified, unclassifiedAfter: after.allTotals.unclassified, unclassifiedBefore: before.allTotals.unclassified, measurementsAfter: after.allTotals.elements },
  countsByRoleAfter: Object.fromEntries(Object.entries(after.byRole).map(([r, t]) => [r, t.elements])),
  usage: [...usage.values()]
    .map((u) => ({ ...u, routes: [...u.routes].sort(), viewports: [...u.viewports].sort() }))
    .sort((a, b) => a.tab.localeCompare(b.tab) || a.panel.localeCompare(b.panel)),
});

/* ── 2. fit contract ───────────────────────────────────────────────────────────────────────────────── */
write('WORKSPACE_MEDIA_FIT_CONTRACT.json', {
  sprint: SPRINT,
  name: 'WorkspaceMediaFitContract',
  source: { ts: 'src/site00/config/production-workspace-media.ts', css: 'src/site00/styles/site00-production-workspace-density.css §2 + §8' },
  fitModes: WORKSPACE_MEDIA_FIT_MODES,
  roleFit: Object.fromEntries(Object.values(WORKSPACE_MEDIA_ROLES).map((r) => [r.role, { functional: r.functional, defaultFit: r.defaultFit, allowedFits: r.allowedFits, crop: r.crop, minVisibleAxis: r.minVisibleAxis, aspects: r.aspects, backdrop: r.backdrop, textOverlay: r.textOverlay }])),
  resolution: [
    'role declared → fit = the call site’s fit if the role allows it, else the role default (asset-type-aware)',
    'NONE-policy roles (UI / logo / document / other functional) contain only — a cover is replaced by the role default',
    'REFERENCE_AUTHORITY contains by default; a cover needs an intentional-crop registry entry for that role and fit (authority metadata: CROP_SAFE)',
    'a raw <img> that declares a no-crop role is contained by CSS (§8.6) whatever the composition CSS says',
  ],
  focal: {
    contract: "'center' | 'top' | 'face' | 'subject' | { x, y, w?, h? } — no computer vision",
    named: Object.fromEntries((['center', 'top', 'face', 'subject'] as const).map((f) => [f, resolveWorkspaceFocal(f)])),
    position: 'region-anchored: each axis p = r0 / (1 − h) — keeps the whole region in frame for every visible share ≥ the region size (edge-touching faces included)',
  },
  cropGuard: 'useWorkspaceCropGuard (HubImage, WorkspaceMediaSlot): on load and on resize, a declared functional cover that would show less than its bound or push its focal region / point out of frame is contained (data-crop-guard="contain"). The source never sizes a panel — it can only stop a crop.',
  aspects: { approved: WORKSPACE_APPROVED_ASPECTS, hubNodeArt: HUB_NODE_ART_ASPECT, rule: 'semantic aspect per asset class; panel geometry never reads source pixels (node-art ratios are the receipt ledger’s approved crops, drift-checked by a test)' },
  slotsKept: Object.keys(WORKSPACE_MEDIA_SLOTS),
  states: {
    loading: 'the slot aspect (--pw-media-aspect / slot aspect) is declared before the source loads — no layout shift (stress test LAYOUT_SHIFT = 0)',
    missing: 'named empty slot keeps the geometry (initials tile for a missing headshot carries the same portrait slot)',
    error: 'onError swaps to the named empty state — never the browser broken-image icon',
  },
});

/* ── 3. panel ↔ media geometry contract ───────────────────────────────────────────────────────────── */
write('WORKSPACE_PANEL_MEDIA_GEOMETRY_CONTRACT.json', {
  sprint: SPRINT,
  name: 'WorkspacePanelMediaGeometryContract',
  rule: 'FUNCTIONAL MEDIA INFLUENCES PANEL GEOMETRY — media ratio / minimum visual height + copy + controls → panel height (never fixed panel → image forced into slot → crop)',
  panelModes: WORKSPACE_PANEL_MEDIA_MODES,
  workspacePanelLayouts: {
    existing: Object.keys(WORKSPACE_PANEL_DEFAULT_SLOT),
    verdict: 'Kept. The six WorkspacePanel layouts describe arrangement; they did not describe how media drives height. Every tab panel (EXPRESSION exf-panel, INBOX cards, ACTIVITY milestone header, WorkspacePanel) now declares a semantic media geometry mode (data-panel-media) — six modes, no one-off pixel modes.',
  },
  scales: WORKSPACE_MEDIA_SCALES,
  legibility: {
    CHIP: 'short side ≥ HUB row chip (≈18px at 360)',
    TILE: 'short side ≥ HUB smallest card media (≈49px phones, ≈53px tablet / desktop)',
    PREVIEW: 'block ≥ 120px, at the approved aspect; full row on phones',
  },
  mobileEscapeOrder: WORKSPACE_MOBILE_ESCAPE_ORDER,
  contentPriority: WORKSPACE_PANEL_CONTENT_PRIORITY,
  implementations: [
    { where: 'EXPRESSION family grid (all 40 routes)', mobile: 'Grid marks data-media-geometry="CONTENT" when a panel composed on phones declares functional media: rows become content-sized, the frame scrolls, media-led panels take the full row (REDUCE_COLUMNS)', tabletDesktop: 'fractional composition kept; PREVIEW media sit at their approved aspect and only shrink — contained, never cropped — in a short cell' },
    { where: 'EXPRESSION → CASTING · AVAILABLE TALENT', mode: 'PORTRAIT_GRID', mobile: '≈3.3 portrait tiles (4:5 headshot slot) per view in the horizontal carousel; panel shows one whole tile row', tabletDesktop: 'unchanged tiles (never sliced)' },
    { where: 'EXPRESSION → CASTING · LEAD AUTHORITY', mode: 'AUTHORITY_PREVIEW', mobile: 'full row, whole cast node art at 272:110', tabletDesktop: 'whole node art at its ratio inside the authored cell' },
    { where: 'EXPRESSION look / review / storyboard / performance previews', mode: 'MEDIA_LEAD / AUTHORITY_PREVIEW / REFERENCE_FRAME', rule: 'node art contained at its approved ratio; storyboard frames VIDEO_FRAME contained on dark' },
    { where: 'INBOX focus / decision / notice cards', mode: 'MEDIA_LEAD', mobile: 'whole decision authority stacked above the facts', tabletDesktop: 'art column kept, frame takes the approved aspect' },
    { where: 'INBOX incoming cards', mode: 'TILE (NODE_ART_CARD)', mobile: '3:2 frame so node art keeps ≥ half of each axis' },
    { where: 'ACTIVITY milestone header', mode: 'MEDIA_LEAD', mobile: 'whole node art stacked above the title', tabletDesktop: 'art column kept, approved aspect' },
    { where: 'DESIGN overview mark', role: 'LOGO_MARK', rule: 'block size capped so the mark never leaves its art box (clearspace)' },
    { where: 'JURNL DESIGN table cards', role: 'UI_SCREENSHOT', rule: 'approved F01 screens contained on dark (whole interface)' },
  ],
  flexGridMinSize: {
    reviewed: ['min-width: 0', 'min-height: 0', 'grid-auto-rows', 'align-stretch', 'flex-shrink'],
    findings: [
      'EXPRESSION grids used minmax(0, Nfr) rows on phones: a media panel could be compressed to any height → replaced by content-driven rows when functional media is present',
      'EXPRESSION .exf-fill previews were flex: 1 1 auto; min-height: 40px — the image took whatever was left (shallow strip) → PREVIEW media are flex: none at their aspect on phones, flex: 0 1 auto (contained) in authored cells',
      'the talent rail was flex: 1 1 auto; min-height: 0 inside a scrolling body shorter than one tile → rail flex: none, the panel grows to one tile row',
      'INBOX / ACTIVITY art used fixed heights (104×122, 150×168, 210×200, 100–150px) → the authority’s approved aspect sets the block size',
    ],
  },
});

/* ── 4. intentional crop registry ─────────────────────────────────────────────────────────────────── */
const usesAfter = (id: string) => after.elements.filter((e) => e.entry === id && e.cropped && !e.el.startsWith('slot'));
write('WORKSPACE_INTENTIONAL_CROP_REGISTRY.json', {
  sprint: SPRINT,
  name: 'WorkspaceIntentionalCropRegistry',
  rule: 'IF A CROP IS NOT IN THIS REGISTRY: IT IS A FAILURE. No-crop roles (UI / logo / document / other functional) can never be registered.',
  source: 'src/site00/config/production-workspace-media.ts (WORKSPACE_INTENTIONAL_CROPS); call sites carry data-media-crop',
  entries: WORKSPACE_INTENTIONAL_CROPS.map((c) => {
    const u = usesAfter(c.id);
    return { ...c, measuredAfter: { crops: u.length, routes: uniq(u.map((e) => e.route)).length, minVisibleAxisMeasured: u.length ? Math.min(...u.map((e) => e.minAxis)) : null, failures: u.filter((e) => fails(e).length).length } };
  }),
  previousClassificationReview: {
    designDecorativeArtCrops23: 'Re-reviewed live: all are DESIGN chamber miniatures (board strips, swatches, device outlines inside the floating panels) or chamber atmosphere — composition, 12–80px, never the inspectable object. Kept as DESIGN_CHAMBER_MINIATURE / DESIGN_CHAMBER_ART. Two classes were NOT decorative and are now fixed: the JURNL table cards (approved F01 screens → UI_SCREENSHOT, contained) and the DESIGN overview mark (LOGO_MARK, was clipped ≈10% on tablet / desktop).',
    fadedScrollEdgeFrames4: 'Re-reviewed: the scroll-edge fade only masks a pane while it overflows. On phones, EXPRESSION grids holding media are now content-driven, so those panes no longer overflow and the fade is inactive there; it remains intentional for long text / list panes (it never hides a whole media item — PANE_SLICE = 0).',
    undeclaredCropsBefore: before.totals.unintentionalCrops,
  },
});

/* ── 5. geometry audit ─────────────────────────────────────────────────────────────────────────────── */
const clipClasses = (rep: Report) => {
  const m = new Map<string, { clipBy: string; kind: string; elements: number; functional: number; failing: number; roles: Set<string> }>();
  for (const e of rep.elements) {
    if (!e.clipBy || e.clipFrac >= 0.985) continue;
    const kind = /exf-panel(?!__body)|iax-panel|ibx-pane|pxa-panel|pwk-panel|card|tile/.test(e.clipBy) ? 'FIXED_PANEL' : /scroll|__body|pane/.test(e.clipBy) ? 'PANE' : 'SLOT_OR_FRAME';
    const k = `${e.clipBy}|${kind}`;
    const v = m.get(k) ?? { clipBy: e.clipBy, kind, elements: 0, functional: 0, failing: 0, roles: new Set<string>() };
    v.elements++;
    if (WORKSPACE_MEDIA_ROLES[e.role as keyof typeof WORKSPACE_MEDIA_ROLES]?.functional) v.functional++;
    if (fails(e).length) v.failing++;
    v.roles.add(e.role);
    m.set(k, v);
  }
  return [...m.values()].map((v) => ({ ...v, roles: [...v.roles] })).sort((a, b) => b.elements - a.elements);
};
const routesOf = (rep: Report) => ({
  rootTabs: uniq(rep.elements.filter((e) => e.kind === 'root').map((e) => e.tab)).length,
  childPagesAudited: rep.routes.children,
  childPagesWithMedia: rep.childPagesWithMedia,
});
const failureGroups = (rep: Report) => {
  const m = new Map<string, { tab: string; panel: string; role: string; scale: string; codes: Record<string, number>; viewports: Set<string>; example: string }>();
  for (const e of rep.failures) {
    const k = key(e);
    const v = m.get(k) ?? { tab: e.tab, panel: e.panel ?? e.el, role: e.role, scale: e.scale, codes: {}, viewports: new Set(), example: `${e.route} ${e.box.w}×${e.box.h} min-axis ${e.minAxis}` };
    for (const c of fails(e)) v.codes[c] = (v.codes[c] ?? 0) + 1;
    v.viewports.add(e.viewport);
    m.set(k, v);
  }
  return [...m.values()].map((v) => ({ ...v, viewports: [...v.viewports].sort() }));
};
write('WORKSPACE_MEDIA_GEOMETRY_AUDIT.json', {
  sprint: SPRINT,
  method: 'live browser (Playwright, Chromium): every img / video / CSS background image (+ missing-asset slots) in the workspace body of every route and viewport — visible source window after object-fit / background-size / position / transforms / clipping ancestors, pane fit of the media unit, legibility, focal region, distortion, text overlay. Undeclared media are judged by what the contract would accept (role / scale / crop class inferred from the asset).',
  viewports: { mobile: '393×852', small: '360×800', large: '430×932', tablet: '834×1194', desktop: '1440×900' },
  routes: { before: routesOf(before), after: routesOf(after) },
  scope: 'totals / byViewport = the six workspace tabs HUB governs. HUB itself (root + machine view) is the media authority the contract is calibrated from and is not changed by this sprint: it is measured and declared like every tab and reported as hubAuthority (control), with its pixel diff in the QA totals.',
  totals: { before: before.totals, after: after.totals },
  hubAuthority: { before: before.hubAuthority, after: after.hubAuthority },
  allTotals: { before: before.allTotals, after: after.allTotals },
  byViewport: { before: before.byViewport, after: after.byViewport },
  byTab: { before: before.byTab, after: after.byTab },
  byRole: { before: before.byRole, after: after.byRole },
  horizontalOverflow: { before: before.overflowX, after: after.overflowX },
  overflowAudit: { note: 'every clipping ancestor of a media element, classified (FIXED_PANEL = a panel / card cutting functional media — must be 0 failing after)', before: clipClasses(before), after: clipClasses(after) },
  failureGroups: { before: failureGroups(before), after: failureGroups(after) },
  errors: { before: before.errors, after: after.errors },
});

/* ── 6. stress test ────────────────────────────────────────────────────────────────────────────────── */
write('WORKSPACE_MEDIA_STRESS_TEST.json', {
  sprint: SPRINT,
  method: 'role-declared media (real workspaceMediaAttrs) mounted in a real EXPRESSION family grid with real CSS and the runtime crop guard; sources generated in-page (no network, no paid generation)',
  sources: stress.sources,
  scales: stress.scales,
  totals: stress.totals,
  viewports: Object.fromEntries(Object.entries(stress.viewports as Record<string, { width: number; cases: number; pass: number; failures: unknown[]; results: unknown[] }>).map(([k, v]) => [k, { width: v.width, cases: v.cases, pass: v.pass, failures: v.failures, results: v.results }])),
});

/* ── screenshot manifest ───────────────────────────────────────────────────────────────────────────── */
const boards = existsSync(`${DIR}/screenshots/boards/index.json`) ? read(`${DIR}/screenshots/boards/index.json`) : [];
write('WORKSPACE_MEDIA_GEOMETRY_SCREENSHOT_MANIFEST.json', {
  sprint: SPRINT,
  capture: 'live Chromium (Playwright) — before = main worktree, after = this branch; mobile 393×852 @2x, tablet 834×1194 @1x, desktop 1440×900 @1x; full audit captures (98 routes × 5 widths) were taken for both runs and are summarised in WORKSPACE_MEDIA_GEOMETRY_AUDIT.json',
  board: 'screenshots/boards/<id>.jpg — BEFORE | AFTER | role · scale · fit · panel mode · why a crop is / is not allowed',
  requiredCoverage: {
    expressionCasting: ['casting-mobile', 'casting-desktop'],
    availableTalent: ['casting-mobile'],
    leadAuthority: ['casting-mobile', 'casting-desktop'],
    portraitHeavy: ['portrait-actor-profile', 'portrait-role-detail'],
    uiScreenshot: ['ui-screenshot-jurnl'],
    logoIdentity: ['logo-identity-desktop'],
    referenceAuthority: ['authority-look', 'authority-inbox-detail', 'authority-milestone', 'authority-inbox-detail-tablet', 'authority-milestone-tablet'],
    documentPreview: 'no document media exists in the workspace today — DOCUMENT_PREVIEW is covered by the contract and the stress test (document source, all scales, 5 widths)',
    landscapeEditorial: ['landscape-library'],
    videoFrames: ['frames-storyboard'],
    hubControl: ['hub-control'],
  },
  boards,
});

const hubSummary = (h: Hub) => {
  const { deviations, ...counts } = h;
  const groups = new Map<string, { route: string; ctx: string; role: string; scale: string; codes: string; viewports: Set<string>; minShortPx: number }>();
  for (const d of deviations) {
    const k = `${d.route}|${d.ctx}|${d.codes.join(',')}`;
    const g = groups.get(k) ?? { route: d.route, ctx: d.ctx, role: d.role, scale: d.scale, codes: d.codes.join(','), viewports: new Set<string>(), minShortPx: Infinity };
    g.viewports.add(d.viewport);
    g.minShortPx = Math.min(g.minShortPx, Math.round(Math.min(d.box.w, d.box.h) * 10) / 10);
    groups.set(k, g);
  }
  return { ...counts, deviations: [...groups.values()].map((g) => ({ ...g, viewports: [...g.viewports].sort() })) };
};

/* ── summary for the QA report / board ─────────────────────────────────────────────────────────────── */
write('WORKSPACE_MEDIA_GEOMETRY_QA_TOTALS.json', {
  sprint: SPRINT,
  before: before.totals,
  after: after.totals,
  hubAuthority: { before: hubSummary(before.hubAuthority), after: hubSummary(after.hubAuthority) },
  allTotals: { before: before.allTotals, after: after.allTotals },
  routes: { before: routesOf(before), after: routesOf(after) },
  overflowXAfter: Object.values(after.overflowX).flat().length,
  stress: stress.totals,
  hubPixelDiff: hubDiff,
  typography: typeReg,
  registryUses: WORKSPACE_INTENTIONAL_CROPS.map((c) => ({ id: c.id, uses: usesAfter(c.id).length })),
});
console.log('artifacts written to', DIR);
