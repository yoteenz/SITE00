/**
 * DESIGN UNIFIED WORKSPACE (STRUCTURE2) — host shell, five modes, expression-state system, uppercase contract.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import {
  DWS_MODES,
  DWS_MODE_LABEL,
  DWS_NAV,
  DWS_EXPRESSION,
  DWS_NODES,
  type DwsArtMode,
} from '../src/site00/components/designUnified/dwsModel';
import { DWS_PROFILES, SURFACES_EXPRESSION, allDwsProfiles, getDwsProfile, type DwsFamily } from '../src/site00/components/designUnified/dwsProfiles';
import { DWS_AUTHORITY_IMAGES } from '../src/site00/components/designUnified/dwsAuthority';
import { SLOT_ID_PATTERN, listDwsSlots } from '../src/site00/components/designUnified/dwsSlots';
import { DwsViewportContext, resolveDwsViewport, visibleLayers } from '../src/site00/components/designUnified/dwsViewport';
import { JourneysDrawer } from '../src/site00/components/designUnified/DwsOverlays';
import * as MODEL from '../src/site00/components/designUnified/dwsModel';
import * as PROFILES from '../src/site00/components/designUnified/dwsProfiles';
import { DWS_INITIAL, dwsReducer, type DwsAction, type DwsState } from '../src/site00/components/designUnified/dwsState';
import { DesignUnifiedWorkspace } from '../src/site00/components/designUnified/DesignUnifiedWorkspace';
import { DwsStage } from '../src/site00/components/designUnified/DwsStage';

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
}
/** The five board-stage modes (VIEWPORT is a chamber mode with its own suite: designViewportMode.test.tsx). */
const ART_MODES = DWS_MODES.filter((m): m is DwsArtMode => m !== 'viewport');
let VP = { w: 1672, h: 941, coarse: false };
const stubWindow = () =>
  vi.stubGlobal('window', {
    localStorage: memoryStorage(),
    innerWidth: VP.w,
    innerHeight: VP.h,
    location: { pathname: '/', search: '' },
    matchMedia: (q: string) => ({ matches: VP.coarse && /coarse/.test(q), addEventListener() {}, removeEventListener() {} }),
    addEventListener() {},
    removeEventListener() {},
  });
beforeEach(() => {
  VP = { w: 1672, h: 941, coarse: false };
  stubWindow();
  vi.stubGlobal('localStorage', memoryStorage());
});
afterEach(() => vi.unstubAllGlobals());

const run = (actions: DwsAction[], from: DwsState = DWS_INITIAL) => actions.reduce(dwsReducer, from);

describe('canonical structure', () => {
  it('has exactly five modes in the exact order', () => {
    expect([...DWS_MODES]).toEqual(['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport']);
    expect(DWS_MODES.map((m) => DWS_MODE_LABEL[m])).toEqual(['BRAND', 'EXPERIENCE', 'SURFACES', 'COMPILER', 'ASSETS', 'VIEWPORT']);
  });

  it('host navigation is HUB · WORK · LIBRARY · ACTIVITY · EXIT', () => {
    expect(DWS_NAV.map((n) => n.label)).toEqual(['HUB', 'WORK', 'LIBRARY', 'ACTIVITY', 'EXIT']);
  });

  it('every mode has five boards, a featured board, a pipeline and 3–4 table cards in every family', () => {
    for (const { profile } of allDwsProfiles()) {
      expect(profile.boards).toHaveLength(5);
      expect(profile.featured.statement.length + profile.featured.entries.length).toBeGreaterThan(0);
      expect(profile.pipeline.length).toBeGreaterThanOrEqual(5);
      expect(profile.table.length).toBeGreaterThanOrEqual(3);
    }
    for (const m of ART_MODES) expect(DWS_EXPRESSION[m].drawer).toBeTruthy();
  });

  it('pipelines follow the authority per mode and family', () => {
    const names = (f: DwsFamily, m: DwsArtMode) => getDwsProfile(m, f).pipeline.map((s) => s.label);
    expect(names('desktop', 'brand')).toEqual(['INTELLIGENCE', 'STRATEGY', 'IDENTITY', 'VOICE', 'EXPERIENCE', 'AUTHORITY', 'PRODUCTION']);
    expect(names('desktop', 'assets')).toEqual(['SOURCES', 'REFERENCES', 'AUTHORITIES', 'COMPONENTS', 'LIBRARIES', 'REVIEWS', 'DELIVERY']);
    expect(names('desktop', 'surfaces')).toEqual(['INTELLIGENCE', 'CONCEPT', 'EXPERIENCE', 'SURFACES', 'ASSETS', 'AUTHORITY', 'PRODUCTION']);
    expect(SURFACES_EXPRESSION.pipeline.map((s) => s.label)).toContain('TABLET');
    expect(names('tabletL', 'compiler')).toEqual(['INGEST', 'ANALYZE', 'SYNTHESIZE', 'STRUCTURE', 'VALIDATE', 'AUTHORITY', 'DEPLOY']);
    expect(names('tabletL', 'assets')).toHaveLength(8);
    expect(names('mobile', 'compiler')).toEqual(['INGEST & ANALYZE', 'SYNTHESIZE', 'COMPILE', 'SYSTEMATIZE', 'DEPLOY']);
    expect(getDwsProfile('surfaces', 'mobile').pipeline.map((s) => s.sub)).toEqual(['DESIGN TOKENS', 'UI SYSTEMS', 'DEVICE VARIANTS', 'APP & WEB OUTPUT', 'ENVIRONMENTS']);
  });

  it('desktop board order matches the authority', () => {
    expect(DWS_PROFILES.desktop.experience.boards.map((b) => b.title)).toEqual(['USER JOURNEYS', 'ROUTE MAPS', 'STATE FLOWS', 'EXPERIENCE MOMENTS', 'INTERACTION RULES']);
    expect(DWS_PROFILES.desktop.assets.boards[4]!.title).toBe('DELIVERY PACKS');
    expect(DWS_PROFILES.desktop.surfaces.boards.map((b) => b.title)).toEqual(['BRAND', 'EXPERIENCE', 'SURFACES', 'COMPILER', 'ASSETS']);
    expect(DWS_PROFILES.mobile.surfaces.boards.map((b) => b.title)).toEqual(['MOBILE SURFACES', 'TABLET SURFACES', 'DESKTOP SURFACES', 'APP SURFACES', 'ENVIRONMENT SURFACES']);
  });
});

describe('authority coverage', () => {
  it('records all 23 pack images as inspected, uniquely, with an implementing profile', () => {
    expect(DWS_AUTHORITY_IMAGES).toHaveLength(23);
    expect(new Set(DWS_AUTHORITY_IMAGES.map((a) => a.path)).size).toBe(23);
    expect(DWS_AUTHORITY_IMAGES.every((a) => a.inspected && a.appliedTo.length > 0)).toBe(true);
    const count = (v: string) => DWS_AUTHORITY_IMAGES.filter((a) => a.viewport === v).length;
    expect([count('desktop'), count('tablet-portrait') + count('tablet-landscape'), count('mobile'), count('interaction'), count('system')]).toEqual([5, 6, 5, 5, 2]);
  });

  it('every mode has a profile for every viewport family', () => {
    for (const f of ['desktop', 'tabletL', 'tabletP', 'mobile'] as const) for (const m of ART_MODES) expect(getDwsProfile(m, f).authority).toBeTruthy();
  });
});

describe('uppercase contract', () => {
  it('every user-visible model string is uppercase', () => {
    // machine identifiers (ids, slots, icon names, route ids) are not rendered as copy
    const MACHINE_KEYS = new Set(['authority', 'form', 'portal', 'id', 'slot', 'icon', 'opens', 'tone', 'kind', 'nodeId', 'slug', 'group', 'tab', 'family', 'drawer', 'inspector', 'modal', 'active']);
    const MACHINE_EXPORTS = new Set(['DWS_MODES', 'DWS_EDGES', 'DWS_EXPRESSION']);
    const bad: string[] = [];
    const walk = (v: unknown, key: string) => {
      if (typeof v === 'string') {
        if (MACHINE_KEYS.has(key)) return;
        if (/[a-z]/.test(v)) bad.push(`${key}: ${v}`);
      } else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k);
    };
    for (const [name, value] of Object.entries({ ...MODEL, ...PROFILES })) {
      if (typeof value === 'function' || MACHINE_EXPORTS.has(name) || name === 'DWS_DEFAULT_DRAWER') continue;
      walk(value, name);
    }
    expect(bad).toEqual([]);
  });

  it('server-rendered workspace contains no lowercase text nodes', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/production/ndxbook/design-workspace']}>
        <DesignUnifiedWorkspace projectSlug="ndxbook" />
      </MemoryRouter>,
    );
    const text = html
      .replace(/<(style|script)[\s\S]*?<\/\1>/g, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/&amp;/g, '&')
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    expect(text.length).toBeGreaterThan(40);
    expect(text.filter((t) => /[a-z]/.test(t))).toEqual([]);
  });
});

describe('host shell is stable across modes', () => {
  it('renders the same host elements in every mode', () => {
    for (const m of DWS_MODES) {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <DesignUnifiedWorkspace projectSlug="ndxbook" />
        </MemoryRouter>,
      );
      for (const must of ['DESIGN PIPELINE', 'ON YOUR TABLE', 'ITEMS NEED YOU', 'HUB', 'WORK', 'LIBRARY', 'ACTIVITY', 'EXIT', 'NDXBOOK']) expect(html).toContain(must);
      expect(m).toBeTruthy();
    }
  });
});

describe('expression state system', () => {
  it('MODE_SWITCH keeps selection and closes overlays', () => {
    const s = run([
      { type: 'SELECT_ARTIFACT', id: 'wordmark' },
      { type: 'OPEN_EXPRESSION' },
      { type: 'MODE_SWITCH', mode: 'assets' },
    ]);
    expect(s.mode).toBe('assets');
    expect(s.drawer).toBeNull();
    expect(s.inspector).toBeNull();
    expect(s.modal).toBeNull();
    expect(s.selected.brand).toBe('wordmark');
    expect(dwsReducer(s, { type: 'MODE_SWITCH', mode: 'brand' }).selected.brand).toBe('wordmark');
  });

  it('overlays preserve the underlying workspace context and RETURN_TO_OVERVIEW restores it', () => {
    const base = run([{ type: 'MODE_SWITCH', mode: 'surfaces' }, { type: 'SELECT_ARTIFACT', id: 'tablet' }]);
    const open = dwsReducer(base, { type: 'OPEN_EXPRESSION' });
    expect(open.drawer).toBe('surface-families');
    expect(open.inspector).toBe('surface-details');
    expect(open.modal).toBe('compare-surfaces');
    const back = dwsReducer(open, { type: 'RETURN_TO_OVERVIEW' });
    expect(back.mode).toBe('surfaces');
    expect(back.selected.surfaces).toBe('tablet');
    expect([back.drawer, back.inspector, back.modal]).toEqual([null, null, null]);
  });

  it('opens and closes each overlay kind independently', () => {
    let s = run([{ type: 'OPEN_DRAWER', drawer: 'asset-library' }, { type: 'OPEN_INSPECTOR', inspector: 'metadata-versions' }, { type: 'OPEN_MODAL', modal: 'export' }]);
    expect([s.drawer, s.inspector, s.modal]).toEqual(['asset-library', 'metadata-versions', 'export']);
    s = run([{ type: 'CLOSE_MODAL' }], s);
    expect(s.modal).toBeNull();
    expect(s.drawer).toBe('asset-library');
    s = run([{ type: 'CLOSE_INSPECTOR' }, { type: 'CLOSE_DRAWER' }], s);
    expect([s.drawer, s.inspector]).toEqual([null, null]);
  });

  it('review: comment, annotate, request changes, approve', () => {
    let s = run([{ type: 'COMMENT', id: 'a', text: 'tighten the lockup' }, { type: 'ANNOTATE', id: 'a' }]);
    expect(s.decisions.a!.comments).toEqual(['TIGHTEN THE LOCKUP']);
    expect(s.decisions.a!.annotations).toBe(1);
    s = run([{ type: 'REQUEST_CHANGES', id: 'a' }], s);
    expect(s.decisions.a!.status).toBe('CHANGES REQUESTED');
    s = run([{ type: 'APPROVE', id: 'a' }], s);
    expect(s.decisions.a!.status).toBe('APPROVED');
    expect(s.modal).toBeNull();
    expect(s.activity[0]!.text).toBe('APPROVED');
  });

  it('empty comments are ignored', () => {
    expect(dwsReducer(DWS_INITIAL, { type: 'COMMENT', id: 'a', text: '   ' })).toBe(DWS_INITIAL);
  });

  it('compare never drops below one selected surface', () => {
    let s = run([{ type: 'COMPARE', id: 'tablet' }, { type: 'COMPARE', id: 'mobile' }]);
    expect(s.compare).toEqual(['desktop', 'tablet', 'mobile']);
    s = run([{ type: 'COMPARE', id: 'desktop' }, { type: 'COMPARE', id: 'tablet' }, { type: 'COMPARE', id: 'mobile' }], s);
    expect(s.compare.length).toBe(1);
  });

  it('export: format + options + queue', () => {
    let s = run([{ type: 'SET_EXPORT_FORMAT', format: 'svg' }, { type: 'SET_EXPORT_OPT', key: 'optimize', value: true }, { type: 'OPEN_MODAL', modal: 'export' }]);
    s = run([{ type: 'EXPORT', id: 'icon-core-001' }], s);
    expect(s.modal).toBeNull();
    expect(s.exportOpts.optimize).toBe(true);
    expect(s.toast).toBe('EXPORT QUEUED · SVG');
  });

  it('duplicate / delete / add to library', () => {
    let s = run([{ type: 'MODE_SWITCH', mode: 'assets' }, { type: 'SELECT_ARTIFACT', id: 'icon-core-002' }, { type: 'DUPLICATE', id: 'icon-core-002' }, { type: 'ADD_TO_LIBRARY', id: 'icon-core-002' }]);
    expect(s.duplicates).toEqual(['icon-core-002']);
    expect(s.library).toEqual(['icon-core-002']);
    s = run([{ type: 'DELETE', id: 'icon-core-002' }], s);
    expect(s.deleted).toEqual(['icon-core-002']);
    expect(s.selected.assets).toBeUndefined();
    expect(s.inspector).toBeNull();
  });

  it('synthesis: family, inputs and generate', () => {
    let s = run([{ type: 'SYNTH_FAMILY', family: 'visual' }, { type: 'SYNTH_INPUT', input: 'in-2' }, { type: 'GENERATE' }]);
    expect(s.synth).toEqual({ family: 'visual', inputs: ['in-1', 'in-2'], generated: true });
    expect(s.inspector).toBe('project-intelligence');
    s = run([{ type: 'SEND_FOR_REVIEW', id: 'G-EX-027', note: 'please check hover' }], s);
    expect(s.decisions['G-EX-027']!.status).toBe('IN REVIEW');
    expect(s.decisions['G-EX-027']!.note).toBe('PLEASE CHECK HOVER');
  });

  it('pipeline stage + on-your-table selection are stateful', () => {
    const s = run([{ type: 'PIPELINE_STAGE_SELECT', index: 3 }, { type: 'ON_YOUR_TABLE_SELECT', id: 'brand.table.2', modal: 'brand-review' }]);
    expect(s.pipelineStage.brand).toBe(3);
    expect(s.tableSelected).toBe('brand.table.2');
    expect(s.modal).toBe('brand-review');
  });

  it('filter, search and bring-forward are scoped', () => {
    const s = run([{ type: 'FILTER', scope: 'brand', value: 'MEDIA' }, { type: 'SEARCH', scope: 'brand', value: 'film' }, { type: 'BRING_FORWARD', id: 'brand.values' }]);
    expect(s.filter.brand).toBe('MEDIA');
    expect(s.search.brand).toBe('film');
    expect(s.forward).toBe('brand.values');
  });
});


/* ======================================================================= STRUCTURE2R1 additions */

const renderAt = (w: number, h: number, coarse = false, query = '') => {
  VP = { w, h, coarse };
  stubWindow();
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/production/ndxbook/design-workspace${query}`]}>
      <DesignUnifiedWorkspace projectSlug="ndxbook" />
    </MemoryRouter>,
  );
};
const textOf = (html: string) =>
  html
    .replace(/<(style|script)[\s\S]*?<\/\1>/g, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean);

describe('viewport families', () => {
  it('resolves viewport + orientation + family', () => {
    expect(resolveDwsViewport(1672, 941, false).family).toBe('desktop');
    expect(resolveDwsViewport(1448, 1086, true).family).toBe('tabletL');
    expect(resolveDwsViewport(1086, 1448, true).family).toBe('tabletP');
    expect(resolveDwsViewport(1024, 768, false).family).toBe('tabletL');
    expect(resolveDwsViewport(390, 844, true).family).toBe('mobile');
    expect(resolveDwsViewport(1672, 941, false, 'mobile').viewport).toBe('mobile');
  });

  it.each([
    ['desktop', 1672, 941, false, 'desktop'],
    ['tablet landscape', 1448, 1086, true, 'tabletL'],
    ['tablet portrait', 1086, 1448, true, 'tabletP'],
    ['mobile', 390, 844, true, 'mobile'],
  ] as const)('renders the six modes + immutable host on %s', (_n, w, h, coarse, family) => {
    const html = renderAt(w, h, coarse);
    expect(html).toContain(`data-family="${family}"`);
    const t = textOf(html);
    for (const must of ['DESIGN', 'DESIGN PIPELINE', 'ON YOUR TABLE', 'HUB', 'WORK', 'LIBRARY', 'ACTIVITY', 'EXIT', 'BRAND', 'EXPERIENCE', 'SURFACES', 'COMPILER', 'ASSETS']) expect(t).toContain(must);
    expect(t.filter((x) => /[a-z]/.test(x))).toEqual([]);
    // mode tab order is fixed: the five existing modes keep their order; VIEWPORT is last
    const tabs = [...html.matchAll(/data-mode-tab="(\w+)"/g)].map((m) => m[1]);
    expect(tabs).toEqual(['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport']);
  });

  it('mobile brand shows the workspace-overview boards (authority), tablet landscape shows the brand command board', () => {
    const m = textOf(renderAt(390, 844, true));
    expect(m).toContain('WORKSPACE OVERVIEW');
    expect(m).toContain('FROM IDEAS TO INTERFACES');
    const t = textOf(renderAt(1448, 1086, true));
    expect(t).toContain('COMMAND BOARD');
    expect(t).toContain('BRAND INSIGHT');
  });

  it('portrait tablet brand carries the fan chips; landscape does not render them as visible UI', () => {
    expect(textOf(renderAt(1086, 1448, true))).toContain('LIVE BRAND SYSTEM');
  });
});

describe('overlay parity (visibleLayers)', () => {
  const all = { drawer: true, inspector: true, modal: true };
  it('desktop and tablet render every open layer', () => {
    expect(visibleLayers('desktop', all, null).show).toEqual(all);
    expect(visibleLayers('tablet', all, null).show).toEqual(all);
  });
  it('mobile renders one sheet: explicit layer, else top-most', () => {
    expect(visibleLayers('mobile', all, null)).toEqual({ top: 'modal', show: { drawer: false, inspector: false, modal: true } });
    expect(visibleLayers('mobile', all, 'drawer').top).toBe('drawer');
    expect(visibleLayers('mobile', { drawer: true, inspector: true, modal: false }, null).top).toBe('inspector');
    expect(visibleLayers('mobile', { drawer: false, inspector: false, modal: false }, 'modal').top).toBeNull();
  });
  it('every layer stays reachable on mobile through SET_LAYER', () => {
    let s = run([{ type: 'OPEN_EXPRESSION' }]);
    expect(s.layer).toBe('modal');
    for (const k of ['drawer', 'inspector', 'modal'] as const) {
      s = run([{ type: 'SET_LAYER', layer: k }], s);
      expect(visibleLayers('mobile', { drawer: !!s.drawer, inspector: !!s.inspector, modal: !!s.modal }, s.layer).top).toBe(k);
    }
    expect(run([{ type: 'CLOSE_MODAL' }], s).modal).toBeNull();
  });
});

describe('experience route-map selection parity', () => {
  const drawer = (family: 'desktop' | 'tabletP' | 'mobile') => {
    const info = family === 'desktop' ? { viewport: 'desktop' as const, orientation: 'landscape' as const, family } : family === 'tabletP' ? { viewport: 'tablet' as const, orientation: 'portrait' as const, family } : { viewport: 'mobile' as const, orientation: 'portrait' as const, family };
    return renderToStaticMarkup(
      <MemoryRouter>
        <DwsViewportContext.Provider value={info}>
          <JourneysDrawer state={{ ...DWS_INITIAL, mode: 'experience' }} dispatch={() => {}} />
        </DwsViewportContext.Provider>
      </MemoryRouter>,
    );
  };
  it('tablet portrait + mobile carry the node map and a touch node list inside the drawer', () => {
    for (const f of ['tabletP', 'mobile'] as const) {
      const html = drawer(f);
      expect(html).toContain('data-testid="dws-inlinemap"');
      for (const n of DWS_NODES) {
        expect(html).toContain(`data-node="${n.id}"`);
        expect(html).toContain(`data-node-item="${n.id}"`);
      }
    }
  });
  it('desktop keeps the map in the centre panel (not duplicated in the drawer)', () => {
    expect(drawer('desktop')).not.toContain('dws-inlinemap');
  });
  it('node selection is shared state that survives mode switches and opens the detail', () => {
    const s = run([{ type: 'MODE_SWITCH', mode: 'experience' }, { type: 'SELECT_ARTIFACT', id: 'customize' }]);
    expect(s.selected.experience).toBe('customize');
    expect(s.inspector).toBe('interaction-select');
    const back = run([{ type: 'MODE_SWITCH', mode: 'brand' }, { type: 'MODE_SWITCH', mode: 'experience' }], s);
    expect(back.selected.experience).toBe('customize');
    expect(run([{ type: 'RETURN_TO_OVERVIEW' }], s).selected.experience).toBe('customize');
  });
});

describe('asset slot integrity', () => {
  const slots = listDwsSlots();
  it('ids are unique, well-formed and classified', () => {
    expect(new Set(slots.map((x) => x.id)).size).toBe(slots.length);
    for (const x of slots) {
      expect(x.id).toMatch(SLOT_ID_PATTERN);
      expect(['ENVIRONMENT_IMAGE', 'CARD_IMAGE', 'FOREGROUND_IMAGE', 'TRANSPARENT_OBJECT', 'ICON3D', 'PROJECT_MARK']).toContain(x.kind);
      expect(x.families.length).toBeGreaterThan(0);
    }
    expect(slots.find((x) => x.id === 'ENV.DESIGN.ATRIUM')?.kind).toBe('ENVIRONMENT_IMAGE');
    expect(slots.filter((x) => x.kind === 'ICON3D').map((x) => x.id)).toHaveLength(9);
  });
  it('every slot the UI renders is in the registry (all modes × families)', () => {
    const known = new Set(slots.map((x) => x.id));
    const seen = new Set<string>();
    for (const [w, h, coarse] of [[1672, 941, false], [1448, 1086, true], [1086, 1448, true], [390, 844, true]] as const) {
      for (const m of DWS_MODES) {
        VP = { w, h, coarse };
        stubWindow();
        const html = renderToStaticMarkup(
          <MemoryRouter initialEntries={['/x']}>
            <DesignUnifiedWorkspace projectSlug="ndxbook" />
          </MemoryRouter>,
        );
        void m;
        for (const mm of html.matchAll(/data-asset-slot="([^"]+)"/g)) seen.add(mm[1]!);
      }
    }
    expect([...seen].filter((id) => !known.has(id))).toEqual([]);
    expect(seen.size).toBeGreaterThan(30);
  });
  it('ASSET_SLOTS.json matches the registry', () => {
    const doc = JSON.parse(readFileSync('docs/site00/studio-os/design-unified-workspace/ASSET_SLOTS.json', 'utf8')) as { total: number; slots: { id: string }[] };
    expect(doc.slots.map((x) => x.id)).toEqual(slots.map((x) => x.id));
    expect(doc.total).toBe(slots.length);
  });
});

describe('OPUS-CONVERGENCE1 visual structure', () => {
  const render = () =>
    renderToStaticMarkup(
      <MemoryRouter initialEntries={['/x']}>
        <DesignUnifiedWorkspace projectSlug="ndxbook" />
      </MemoryRouter>,
    );
  it('featured board keeps the expression trigger as a compact labelled chevron (no pill)', () => {
    VP = { w: 1672, h: 941, coarse: false };
    stubWindow();
    const html = render();
    expect(html).toMatch(/class="dws-board__expr"[^>]*aria-label="OPEN INTERACTION EXPRESSION"/);
    expect(html).toContain('dws-board__expr-label');
  });
  it('featured intro copy from the profile is rendered on the board', () => {
    const profile = getDwsProfile('experience', 'desktop');
    expect(profile.featured.intro?.length).toBeGreaterThan(0);
    const html = renderToStaticMarkup(<DwsStage state={{ ...DWS_INITIAL, mode: 'experience' }} dispatch={() => {}} profile={profile} family="desktop" projectName="NDXBOOK" />);
    expect(html).toContain('dws-board__intro');
    for (const line of profile.featured.intro!) expect(html).toContain(line.replace(/&/g, '&amp;'));
  });
  it('contact strips are crops of existing board slots (data-asset-crop), never new slot ids', () => {
    VP = { w: 1672, h: 941, coarse: false };
    stubWindow();
    const html = render();
    const crops = [...html.matchAll(/data-asset-crop="([^"]+)"/g)].map((m) => m[1]!);
    expect(crops.length).toBeGreaterThan(0);
    const known = new Set(listDwsSlots().map((s) => s.id));
    expect(crops.every((c) => known.has(c))).toBe(true);
  });
  it('typography uses the existing condensed authority family (no new font files)', () => {
    const css = readFileSync('src/site00/styles/site00-design-unified.css', 'utf8');
    expect(css).toContain("url('/site00/fonts/barlow-condensed/barlow-condensed-500.woff2')");
    expect(css).toMatch(/--dws-font-c:\s*'SITE00 DWS Condensed'/);
    expect(css).not.toMatch(/fonts\.googleapis/);
  });
  it('board copy is container-scaled with legibility floors (mobile clipping fix)', () => {
    const css = readFileSync('src/site00/styles/site00-design-unified.css', 'utf8');
    expect(css).toMatch(/\.dws-board \{[^}]*container-type: inline-size/);
    expect(css).toMatch(/\.dws\[data-viewport='mobile'\] \.dws-board--featured \{[^}]*height: auto/);
  });
});
