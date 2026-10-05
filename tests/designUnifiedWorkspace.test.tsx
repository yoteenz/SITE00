/**
 * DESIGN UNIFIED WORKSPACE (STRUCTURE2) — host shell, five modes, expression-state system, uppercase contract.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import {
  DWS_MODES,
  DWS_MODE_LABEL,
  DWS_NAV,
  DWS_PIPELINE,
  DWS_STAGE,
  DWS_TABLE,
  DWS_EXPRESSION,
} from '../src/site00/components/designUnified/dwsModel';
import * as MODEL from '../src/site00/components/designUnified/dwsModel';
import { DWS_INITIAL, dwsReducer, type DwsAction, type DwsState } from '../src/site00/components/designUnified/dwsState';
import { DesignUnifiedWorkspace } from '../src/site00/components/designUnified/DesignUnifiedWorkspace';

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
}
beforeEach(() => {
  vi.stubGlobal('window', {
    localStorage: memoryStorage(),
    innerWidth: 1672,
    location: { pathname: '/', search: '' },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    addEventListener() {},
    removeEventListener() {},
  });
  vi.stubGlobal('localStorage', memoryStorage());
});
afterEach(() => vi.unstubAllGlobals());

const run = (actions: DwsAction[], from: DwsState = DWS_INITIAL) => actions.reduce(dwsReducer, from);

describe('canonical structure', () => {
  it('has exactly five modes in the exact order', () => {
    expect([...DWS_MODES]).toEqual(['brand', 'experience', 'surfaces', 'compiler', 'assets']);
    expect(DWS_MODES.map((m) => DWS_MODE_LABEL[m])).toEqual(['BRAND', 'EXPERIENCE', 'SURFACES', 'COMPILER', 'ASSETS']);
  });

  it('host navigation is HUB · WORK · LIBRARY · ACTIVITY · EXIT', () => {
    expect(DWS_NAV.map((n) => n.label)).toEqual(['HUB', 'WORK', 'LIBRARY', 'ACTIVITY', 'EXIT']);
  });

  it('every mode has five boards, a featured board, a pipeline and four table cards', () => {
    for (const m of DWS_MODES) {
      expect(DWS_STAGE[m].boards).toHaveLength(5);
      expect(DWS_PIPELINE[m].length).toBeGreaterThanOrEqual(7);
      expect(DWS_TABLE[m]).toHaveLength(4);
      expect(DWS_EXPRESSION[m].drawer).toBeTruthy();
    }
  });

  it('pipelines follow the authority per mode', () => {
    const names = (m: (typeof DWS_MODES)[number]) => DWS_PIPELINE[m].map((s) => s.label);
    expect(names('brand')).toEqual(['INTELLIGENCE', 'STRATEGY', 'IDENTITY', 'VOICE', 'EXPERIENCE', 'AUTHORITY', 'PRODUCTION']);
    expect(names('assets')).toEqual(['SOURCES', 'REFERENCES', 'AUTHORITIES', 'COMPONENTS', 'LIBRARIES', 'REVIEWS', 'DELIVERY']);
    expect(names('surfaces')).toContain('TABLET');
  });
});

describe('uppercase contract', () => {
  it('every user-visible model string is uppercase', () => {
    // machine identifiers (ids, slots, icon names, route ids) are not rendered as copy
    const MACHINE_KEYS = new Set(['id', 'slot', 'icon', 'opens', 'tone', 'kind', 'nodeId', 'slug', 'group', 'tab', 'family', 'drawer', 'inspector', 'modal', 'active']);
    const MACHINE_EXPORTS = new Set(['DWS_MODES', 'DWS_EDGES', 'DWS_EXPRESSION']);
    const bad: string[] = [];
    const walk = (v: unknown, key: string) => {
      if (typeof v === 'string') {
        if (MACHINE_KEYS.has(key)) return;
        if (/[a-z]/.test(v)) bad.push(`${key}: ${v}`);
      } else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k);
    };
    for (const [name, value] of Object.entries(MODEL)) {
      if (typeof value === 'function' || MACHINE_EXPORTS.has(name)) continue;
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
