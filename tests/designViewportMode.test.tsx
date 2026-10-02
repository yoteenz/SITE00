/**
 * DESIGN UNIFIED WORKSPACE — VIEWPORT mode (final internal DESIGN mode, after ASSETS).
 * State logic is exercised through the reducer; structure through static render. Live behaviour (iframe, presets,
 * routes, overlays, compare, validation, nav invariants, uppercase audit) is covered by the live browser QA flow.
 */
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { DWS_MODES, DWS_MODE_LABEL, DWS_NAV } from '../src/site00/components/designUnified/dwsModel';
import { DWS_INITIAL, dwsReducer, type DwsAction, type DwsState } from '../src/site00/components/designUnified/dwsState';
import { DesignUnifiedWorkspace } from '../src/site00/components/designUnified/DesignUnifiedWorkspace';
import { listDwsSlots } from '../src/site00/components/designUnified/dwsSlots';
import {
  VP_AUTHORITY,
  VP_CHECKS,
  VP_DECK,
  VP_INITIAL,
  VP_INTERACTIONS,
  VP_PIPELINE,
  VP_PIPELINE_ACTIVE,
  VP_PRESETS,
  VP_ROUTES,
  clampDim,
  vpOrientation,
  vpPreviewUrl,
  vpSafeInsets,
  vpScale,
  vpSize,
  vpValidation,
} from '../src/site00/components/designUnified/dwsViewportMode';

const run = (s: DwsState, ...a: DwsAction[]) => a.reduce(dwsReducer, s);
const inViewport = (): DwsState => run(DWS_INITIAL, { type: 'MODE_SWITCH', mode: 'viewport' });

function memoryStorage(seed: Record<string, string> = {}) {
  const data = new Map<string, string>(Object.entries(seed));
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
}
let W = { w: 1672, h: 941, coarse: false };
const stub = (seed: Record<string, string> = {}) =>
  vi.stubGlobal('window', {
    localStorage: memoryStorage(seed),
    innerWidth: W.w,
    innerHeight: W.h,
    location: { pathname: '/', search: '' },
    matchMedia: (q: string) => ({ matches: W.coarse && /coarse/.test(q), addEventListener() {}, removeEventListener() {} }),
    addEventListener() {},
    removeEventListener() {},
  });
const SEED_VIEWPORT = { 'site00.dws.v1.ndxbook': JSON.stringify({ mode: 'viewport' }) };
const render = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={['/x']}>
      <DesignUnifiedWorkspace projectSlug="ndxbook" />
    </MemoryRouter>,
  );
beforeEach(() => stub());
afterEach(() => vi.unstubAllGlobals());

describe('VIEWPORT mode registration', () => {
  it('is the final DESIGN mode, immediately after ASSETS; the five existing modes are untouched', () => {
    expect([...DWS_MODES]).toEqual(['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport']);
    expect(DWS_MODES.indexOf('viewport')).toBe(DWS_MODES.indexOf('assets') + 1);
    expect(DWS_MODES.map((m) => DWS_MODE_LABEL[m])).toEqual(['BRAND', 'EXPERIENCE', 'SURFACES', 'COMPILER', 'ASSETS', 'VIEWPORT']);
  });
  it('bottom navigation is unchanged', () => {
    expect(DWS_NAV.map((n) => n.label)).toEqual(['HUB', 'WORK', 'LIBRARY', 'ACTIVITY', 'EXIT']);
  });
  it('renders six mode tabs with VIEWPORT last, in every viewport family', () => {
    for (const [w, h, coarse] of [[1672, 941, false], [1448, 1086, true], [1086, 1448, true], [390, 844, true]] as const) {
      W = { w, h, coarse };
      stub();
      const html = render();
      const tabs = [...html.matchAll(/data-mode-tab="([a-z]+)"/g)].map((m) => m[1]);
      expect(tabs).toEqual(['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport']);
      for (const nav of ['HUB', 'WORK', 'LIBRARY', 'ACTIVITY', 'EXIT']) expect(html).toContain(nav);
    }
  });
  it('the pack authorities (3) are recorded', () => {
    expect(VP_AUTHORITY).toHaveLength(3);
  });
});

describe('VIEWPORT stage structure', () => {
  it('renders the chamber with a client iframe, presets, routes, interactions and overlays — never the board stage', () => {
    stub(SEED_VIEWPORT);
    const html = render();
    expect(html).toContain('data-testid="dws-viewport-stage"');
    expect(html).toContain('data-testid="dws-vp-frame"');
    expect(html).toContain('<iframe');
    for (const id of ['presets', 'routes', 'interactions', 'overlays']) expect(html).toContain(`data-testid="dws-vp-panel-${id}"`);
    expect(html).not.toContain('dws-board--featured');
  });
  it('VIEWPORT precedes PRODUCTION in the DESIGN PIPELINE (existing component, extended data)', () => {
    stub(SEED_VIEWPORT);
    const html = render();
    expect(html).toContain('data-testid="dws-pipeline"');
    const labels = [...html.matchAll(/data-stage="([^"]+)"/g)].map((m) => m[1]);
    expect(labels).toEqual(VP_PIPELINE.map((s) => s.label));
    expect(labels.indexOf('VIEWPORT')).toBe(labels.indexOf('PRODUCTION') - 1);
    expect(VP_PIPELINE_ACTIVE).toBe(labels.indexOf('VIEWPORT'));
    expect(html).toMatch(/is-active[^>]*><button[^>]*data-stage="VIEWPORT"/);
  });
  it('keeps ON YOUR TABLE as the one attention queue, with viewport-relevant items', () => {
    stub(SEED_VIEWPORT);
    const html = render();
    expect(html).toContain('data-testid="dws-table"');
    for (const t of ['RESPONSIVE REVIEW', 'VIEWPORT REVIEW', 'INTERACTION REVIEW']) expect(html).toContain(t);
    for (const f of ['desktop', 'tabletL', 'tabletP', 'mobile'] as const) {
      expect(VP_DECK[f].pipeline.at(-1)!.label).toBe('PRODUCTION');
      expect(VP_DECK[f].table.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('phones get the review-first strip + validation card; wide families do not', () => {
    W = { w: 390, h: 844, coarse: true };
    stub(SEED_VIEWPORT);
    const phone = render();
    expect(phone).toContain('data-testid="dws-vp-strip"');
    expect(phone).toContain('data-testid="dws-vp-validcard"');
    expect(phone).toContain('IPHONE 15');
    W = { w: 1672, h: 941, coarse: false };
    stub(SEED_VIEWPORT);
    const wide = render();
    expect(wide).not.toContain('data-testid="dws-vp-strip"');
    expect(wide).toContain('data-testid="dws-vp-validate-btn"');
  });
  it('preview targets the CLIENT APP (isolated iframe), never a host route', () => {
    expect(vpPreviewUrl('ndxbook', 'home', false)).toBe('/app/projects/ndxbook');
    expect(vpPreviewUrl('ndxbook', 'reviews', false)).toBe('/app/projects/ndxbook/reviews');
    expect(vpPreviewUrl('ndxbook', 'library', true)).toBe('/app/preview/fixture-app-ndxbook/library');
    expect(VP_ROUTES.map((r) => r.id)).toEqual(['home', 'reviews', 'inbox', 'library', 'profile']);
  });
});

describe('VIEWPORT state (one source of truth)', () => {
  it('device presets drive the logical frame size', () => {
    expect(VP_PRESETS.map((p) => [p.id, p.width, p.height])).toEqual([['desktop', 1440, 900], ['tablet', 834, 1194], ['mobile', 393, 852]]);
    let s = inViewport();
    s = run(s, { type: 'VP_DEVICE', device: 'mobile' });
    expect(s.vp.device).toBe('mobile');
    expect(vpSize(s.vp)).toEqual({ width: 393, height: 852 });
    expect(s.vp.expression).toBe('presets');
    s = run(s, { type: 'VP_DEVICE', device: 'tablet' });
    expect(vpSize(s.vp)).toEqual({ width: 834, height: 1194 });
  });
  it('orientation swaps the frame; custom swaps width/height', () => {
    let s = run(inViewport(), { type: 'VP_DEVICE', device: 'mobile' }, { type: 'VP_ORIENTATION' });
    expect(vpOrientation(s.vp)).toBe('landscape');
    expect(vpSize(s.vp)).toEqual({ width: 852, height: 393 });
    s = run(s, { type: 'VP_ORIENTATION' });
    expect(vpSize(s.vp)).toEqual({ width: 393, height: 852 });
    s = run(s, { type: 'VP_CUSTOM', width: 1000, height: 700 });
    expect(s.vp.device).toBe('custom');
    expect(vpSize(s.vp)).toEqual({ width: 1000, height: 700 });
    s = run(s, { type: 'VP_ORIENTATION' });
    expect(vpSize(s.vp)).toEqual({ width: 700, height: 1000 });
    expect(vpOrientation(s.vp)).toBe('portrait');
  });
  it('custom dimensions are clamped', () => {
    expect(clampDim(10)).toBe(240);
    expect(clampDim(99999)).toBe(3840);
    expect(clampDim(Number.NaN)).toBe(240);
    const s = run(inViewport(), { type: 'VP_CUSTOM', width: 5, height: 99999 });
    expect(s.vp.custom).toEqual({ width: 240, height: 3840 });
  });
  it('zoom: FIT never upscales; fixed zoom is exact', () => {
    expect(vpScale('FIT', { width: 1440, height: 900 }, { width: 720, height: 450 })).toBe(0.5);
    expect(vpScale('FIT', { width: 393, height: 852 }, { width: 2000, height: 2000 })).toBe(1);
    expect(vpScale('FIT', { width: 393, height: 852 }, { width: 0, height: 0 })).toBe(1);
    expect(vpScale('75', { width: 1440, height: 900 }, { width: 10, height: 10 })).toBe(0.75);
    expect(run(inViewport(), { type: 'VP_ZOOM', zoom: '50' }).vp.zoom).toBe('50');
  });
  it('route change keeps device, mode and project context', () => {
    const s = run(inViewport(), { type: 'VP_DEVICE', device: 'tablet' }, { type: 'VP_ROUTE', route: 'library' });
    expect(s.vp.route).toBe('library');
    expect(s.vp.device).toBe('tablet');
    expect(s.mode).toBe('viewport');
    expect(s.vp.expression).toBe('preview');
  });
  it('interaction inspection is a chamber state; toggling the active category returns to preview', () => {
    let s = run(inViewport(), { type: 'VP_INTERACTION', interaction: 'drawers' });
    expect(s.vp.expression).toBe('interaction');
    expect(s.vp.interaction).toBe('drawers');
    expect(s.drawer).toBeNull();
    expect(s.modal).toBeNull();
    s = run(s, { type: 'VP_INTERACTION', interaction: null });
    expect(s.vp.expression).toBe('preview');
    expect(VP_INTERACTIONS.map((i) => i.id)).toEqual(['navigation', 'drawers', 'modals', 'forms', 'states']);
  });
  it('overlays toggle independently (safe area / grid / bounds)', () => {
    let s = run(inViewport(), { type: 'VP_OVERLAY', key: 'safe' }, { type: 'VP_OVERLAY', key: 'bounds' });
    expect(s.vp.overlays).toEqual({ safe: true, grid: false, bounds: true });
    expect(s.vp.expression).toBe('overlays');
    s = run(s, { type: 'VP_OVERLAY', key: 'safe' });
    expect(s.vp.overlays.safe).toBe(false);
    expect(vpSafeInsets(393, 852)).toEqual({ top: 47, right: 0, bottom: 34, left: 0 });
    expect(vpSafeInsets(852, 393)).toEqual({ top: 0, right: 47, bottom: 21, left: 47 });
    expect(vpSafeInsets(834, 1194).top).toBe(24);
    expect(vpSafeInsets(1440, 900).left).toBe(16);
  });
  it('compare is a two-up chamber state with a selectable pair', () => {
    expect(VP_INITIAL.pair).toEqual(['desktop', 'mobile']);
    let s = run(inViewport(), { type: 'VP_EXPRESSION', expression: 'compare' });
    expect(s.vp.expression).toBe('compare');
    s = run(s, { type: 'VP_PAIR', slot: 1, device: 'tablet' });
    expect(s.vp.pair).toEqual(['desktop', 'tablet']);
    s = run(s, { type: 'VP_EXPRESSION', expression: 'compare' });
    expect(s.vp.expression).toBe('preview');
  });
  it('validation is honest: NOT RUN until a reviewer marks it; nothing is auto-passed', () => {
    expect(VP_CHECKS.map((c) => c.id)).toEqual(['layouts', 'interactions', 'responsive', 'performance', 'accessibility']);
    expect(vpValidation({})).toMatchObject({ passed: 0, failed: 0, total: 5, status: 'NOT RUN', issues: 0 });
    let s = run(inViewport(), { type: 'VP_CHECK', id: 'layouts', mark: 'PASS' }, { type: 'VP_CHECK', id: 'responsive', mark: 'PASS' });
    expect(vpValidation(s.vp.checks)).toMatchObject({ passed: 2, status: 'IN PROGRESS' });
    s = run(s, { type: 'VP_CHECK', id: 'interactions', mark: 'FAIL' });
    expect(vpValidation(s.vp.checks)).toMatchObject({ failed: 1, issues: 1, status: 'REVIEW REQUIRED' });
    s = run(s, { type: 'VP_CHECK', id: 'interactions', mark: null });
    for (const c of ['interactions', 'performance', 'accessibility']) s = run(s, { type: 'VP_CHECK', id: c, mark: 'PASS' });
    expect(vpValidation(s.vp.checks).status).toBe('READY FOR PRODUCTION');
  });
  it('interaction inspection marks are reviewer input and independent of validation marks', () => {
    const s = run(inViewport(), { type: 'VP_INSPECT', key: 'forms.0', mark: 'PASS' });
    expect(s.vp.inspect['forms.0']).toBe('PASS');
    expect(s.vp.checks).toEqual({});
  });
  it('ON YOUR TABLE in VIEWPORT opens the validation state — no modal, no page, no second queue', () => {
    const s = run(inViewport(), { type: 'ON_YOUR_TABLE_SELECT', id: 'viewport.table.responsive-review', modal: null });
    expect(s.vp.expression).toBe('validation');
    expect(s.modal).toBeNull();
    expect(s.tableSelected).toBe('viewport.table.responsive-review');
  });
  it('refresh remounts the client frame (reloadKey) without touching anything else', () => {
    const a = inViewport();
    const b = run(a, { type: 'VP_REFRESH' });
    expect(b.vp.reloadKey).toBe(a.vp.reloadKey + 1);
    expect({ ...b.vp, reloadKey: 0 }).toEqual({ ...a.vp, reloadKey: 0 });
  });
  it('returning to overview resets only the chamber expression; mode, device and route stay', () => {
    const s = run(inViewport(), { type: 'VP_DEVICE', device: 'tablet' }, { type: 'VP_ROUTE', route: 'inbox' }, { type: 'VP_EXPRESSION', expression: 'validation' }, { type: 'RETURN_TO_OVERVIEW' });
    expect(s.vp).toMatchObject({ expression: 'preview', device: 'tablet', route: 'inbox' });
    expect(s.mode).toBe('viewport');
  });
  it('board-stage actions are inert in VIEWPORT (no overlays can be opened by them)', () => {
    const s = run(inViewport(), { type: 'OPEN_LIBRARY' }, { type: 'SELECT_ARTIFACT', id: 'x' });
    expect(s.drawer).toBeNull();
    expect(s.inspector).toBeNull();
    expect(run(inViewport(), { type: 'OPEN_EXPRESSION' }).modal).toBeNull();
  });
  it('switching modes resets the expression but keeps the viewport settings', () => {
    const s = run(inViewport(), { type: 'VP_DEVICE', device: 'custom' }, { type: 'VP_CUSTOM', width: 900, height: 600 }, { type: 'MODE_SWITCH', mode: 'assets' }, { type: 'MODE_SWITCH', mode: 'viewport' });
    expect(s.vp.device).toBe('custom');
    expect(s.vp.custom).toEqual({ width: 900, height: 600 });
    expect(s.vp.expression).toBe('preview');
  });
  it('existing modes keep their reducer behaviour (OPEN_EXPRESSION opens their overlay trio)', () => {
    const s = run(DWS_INITIAL, { type: 'OPEN_EXPRESSION' });
    expect(s.modal).toBe('brand-review');
    expect(s.drawer).toBe('brand-library');
  });
});

describe('VIEWPORT uppercase + slots', () => {
  it('every user-visible VIEWPORT model string is uppercase', () => {
    const strings: string[] = [
      ...VP_PIPELINE.flatMap((s) => [s.label, s.code]),
      ...Object.values(VP_DECK).flatMap((d) => d.table.flatMap((c) => [c.title, c.sub, c.action, c.badge ?? ''])),
      ...VP_ROUTES.map((r) => r.label),
      ...VP_INTERACTIONS.flatMap((i) => [i.label, ...i.items]),
      ...VP_CHECKS.map((c) => c.label),
      ...VP_PRESETS.flatMap((p) => [p.label, p.device]),
    ];
    for (const t of strings) expect(t, t).toBe(t.toUpperCase());
  });
  it('rendered VIEWPORT markup text is uppercase at every family', () => {
    for (const [w, h, coarse] of [[1672, 941, false], [1448, 1086, true], [1086, 1448, true], [390, 844, true]] as const) {
      W = { w, h, coarse };
      stub(SEED_VIEWPORT);
      const text = render().replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&');
      const lower = text.split(/\s+/).filter((t) => /[a-z]/.test(t));
      expect(lower, `${w}`).toEqual([]);
    }
  });
  it('the css enforces uppercase on the viewport controls (inputs, selects, buttons)', () => {
    const css = readFileSync('src/site00/styles/site00-design-unified.css', 'utf8');
    expect(css).toMatch(/\.dws \*,[\s\S]*?text-transform: uppercase/);
    expect(css).toMatch(/\.dws input,\s*\.dws textarea,\s*\.dws select,\s*\.dws button \{[^}]*text-transform: uppercase/);
  });
  it('slot registry covers the VIEWPORT table cards and ASSET_SLOTS.json matches it', () => {
    const slots = listDwsSlots();
    const ids = new Set(slots.map((s) => s.id));
    for (const f of ['desktop', 'tabletL', 'tabletP', 'mobile'] as const) for (const c of VP_DECK[f].table) expect(ids.has(`PROJECT.ART.TABLE.${c.title.replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')}`)).toBe(true);
    const doc = JSON.parse(readFileSync('docs/site00/studio-os/design-unified-workspace/ASSET_SLOTS.json', 'utf8')) as { total: number; slots: { id: string }[] };
    expect(doc.slots.map((x) => x.id)).toEqual(slots.map((x) => x.id));
    expect(doc.total).toBe(slots.length);
  });
  it('VIEWPORT never mounts client UI into host state: the preview is an iframe and guides live in the host', () => {
    const src = readFileSync('src/site00/components/designUnified/DwsViewportStage.tsx', 'utf8');
    expect(src).toContain('<iframe');
    expect(src).not.toMatch(/from '\.\.\/clientApp|from '\.\.\/\.\.\/pages\/clientApp/);
  });
});

/* ---------------------------------------------------------------- OPUS baseline preservation (7e4cf365) */
describe('OPUS baseline preservation', () => {
  const OPUS_CSS_BYTES = 100990;
  const OPUS_CSS_SHA256 = '7efd371ec939d89a2adc672eea1eea78191207fccdb47aad4f5444a66dc712a5';
  it('the Opus-converged shared stylesheet is byte-identical; VIEWPORT CSS is append-only', () => {
    const buf = readFileSync('src/site00/styles/site00-design-unified.css');
    expect(buf.length).toBeGreaterThan(OPUS_CSS_BYTES);
    expect(createHash('sha256').update(buf.subarray(0, OPUS_CSS_BYTES)).digest('hex')).toBe(OPUS_CSS_SHA256);
    const appended = buf.subarray(OPUS_CSS_BYTES).toString('utf8');
    expect(appended).toContain('VIEWPORT MODE (final DESIGN mode, after ASSETS)');
  });
  it('appended VIEWPORT selectors are scoped to viewport state (no shared-shell rule is redefined)', () => {
    const buf = readFileSync('src/site00/styles/site00-design-unified.css').subarray(OPUS_CSS_BYTES).toString('utf8');
    const SHARED = ['.dws-top', '.dws-modes', '.dws-footnav', '.dws-lower', '.dws-pipeline', '.dws-table', '.dws-board', '.dws-atrium', '.dws-ov', '.dws-brandmark', '.dws-needs'];
    const selectors = [...buf.matchAll(/(^|\})\s*([^{}@/][^{}]*)\{/g)].map((m) => m[2]!.trim()).flatMap((s) => s.split(','));
    const offenders = selectors.map((s) => s.trim()).filter((s) => SHARED.some((sh) => new RegExp(`(^|[\\s>])${sh.replace('.', '\\.')}(?![\\w-])`).test(s)) && !/dws-vp|data-mode='viewport'|data-vp-/.test(s));
    expect(offenders).toEqual([]);
  });
  it('slot registry: the 152 Opus slot ids are intact; VIEWPORT adds exactly 4 explicit table-card slots', () => {
    const slots = listDwsSlots().map((x) => x.id);
    const added = ['PROJECT.ART.TABLE.INTERACTION_REVIEW', 'PROJECT.ART.TABLE.RESPONSIVE_REVIEW', 'PROJECT.ART.TABLE.SAFE_AREA_CHECK', 'PROJECT.ART.TABLE.VIEWPORT_REVIEW'];
    expect(slots).toHaveLength(156);
    for (const id of added) expect(slots).toContain(id);
    expect(slots.filter((id) => !added.includes(id))).toHaveLength(152);
  });
  it('shared shell contract: five original modes first and in order, VIEWPORT sixth/after ASSETS, bottom nav unchanged', () => {
    expect([...DWS_MODES].slice(0, 5)).toEqual(['brand', 'experience', 'surfaces', 'compiler', 'assets']);
    expect(DWS_MODES[5]).toBe('viewport');
    expect(DWS_MODES.indexOf('viewport')).toBe(DWS_MODES.indexOf('assets') + 1);
    expect(DWS_NAV.map((n) => [n.id, n.label])).toEqual([['hub', 'HUB'], ['work', 'WORK'], ['library', 'LIBRARY'], ['activity', 'ACTIVITY'], ['exit', 'EXIT']]);
  });
  it('the five existing modes still render their Opus board stage (6 boards, no viewport stage)', () => {
    for (const mode of ['brand', 'experience', 'surfaces', 'compiler', 'assets']) {
      W = { w: 1672, h: 941, coarse: false };
      stub({ 'site00.dws.v1.ndxbook': JSON.stringify({ mode }) });
      const html = render();
      expect((html.match(/class="dws-board /g) ?? []).length).toBe(6);
      expect(html).not.toContain('dws-viewport-stage');
    }
  });
});
