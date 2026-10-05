/**
 * P0.STUDIOOS.PRODUCTION.EXPERIENCE-LIBRARY.RESPONSIVE-AUTHORITY-CONVERGENCE.OPUS1
 * EXPERIENCE (7 families · 46 routes) + LIBRARY (10 families · 75 routes): one route model, every route paired with
 * its mobile + desktop/tablet authority, every record bound to a canonical repo source (no authority-image copy),
 * shared Production frame, one-viewport CSS contract, and the live Chromium QA matrix.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_ASSETS, STUDIO_WORLD_RESIDENTS, productionAssetPublicPath } from '../src/site00/productionAssets';
import { ProductionAuthorityDataContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import { ExperienceScreen } from '../src/site00/components/productionAuthority/realm/ExperienceScreen';
import { LibraryScreen } from '../src/site00/components/productionAuthority/realm/LibraryScreen';
import {
  EXPERIENCE_FAMILIES,
  EXPERIENCE_ROUTES,
  LIBRARY_FAMILIES,
  LIBRARY_ROUTES,
  realmHref,
  resolveRealmRoute,
  type RealmTab,
} from '../src/site00/components/productionAuthority/realm/realmRoutes';
import type { HubData } from '../src/site00/components/productionHub/useProductionHubData';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const ART = 'artifacts/production-experience-library-convergence-opus1';

const IDS = ['narrative', 'cast', 'look', 'performance', 'set', 'storyboard', 'keyframes'] as const;
const NODES = IDS.map((id, i) => ({ id, order: i, label: id.toUpperCase(), status: i === 0 ? 'REVIEW_REQUIRED' : 'LOCKED', statusDetail: `${id} detail`, dependsOn: i ? [IDS[i - 1]] : [], unlocks: i < 6 ? [IDS[i + 1]] : [], quickActions: [], assetSlotId: `production.ndxbook.p.node.${id}.primary` }));
const hub = {
  project: { projectId: 'ndxbook', name: 'NDXBOOK' },
  production: { productionId: 'entry-002', label: 'ENTRY 002', subtitle: 'OH, NOW IT WAS FUN?' },
  hasProduction: true,
  loading: false,
  deciding: false,
  decideStoryboard: async () => ({ ok: true }),
  graph: { nodes: NODES, byId: Object.fromEntries(NODES.map((n) => [n.id, n])), activeNodeId: 'narrative', progressPercent: 0, completeCount: 0, blockers: ['NARRATIVE: awaiting founder approval', 'CAST: upstream narrative not complete'], founderGate: { open: true, nodeId: 'narrative', headline: 'NARRATIVE APPROVAL', detail: 'gate', decidableInHub: false }, operation: { label: 'NARRATIVE' } },
  attention: [],
  activity: [],
  cast: { characters: [], looks: [] },
  scenes: [],
  frames: [],
  assetUrl: () => null,
} as unknown as HubData;

const render = (tab: RealmTab, p: string) => {
  const rest = tab === 'experience' ? p.replace('/production/ndxbook/experience', '') : p.replace('/production/libraries', '');
  const resolved = resolveRealmRoute(tab, rest)!;
  const Screen = tab === 'experience' ? ExperienceScreen : LibraryScreen;
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [p] }, createElement(ProductionAuthorityDataContext.Provider, { value: hub }, createElement(Screen as never, { slug: 'ndxbook', resolved } as never))));
};
const ALL = [...EXPERIENCE_ROUTES, ...LIBRARY_ROUTES];

describe('121 canonical routes (route model)', () => {
  it('46 Experience routes in 7 families; 75 Library routes in 10 families', () => {
    expect(EXPERIENCE_ROUTES).toHaveLength(46);
    expect(LIBRARY_ROUTES).toHaveLength(75);
    expect(EXPERIENCE_FAMILIES.map((f) => f.title)).toEqual(['WORLD', 'ZONES', 'PATHS', 'INTERACTIONS', 'INHABITANTS', 'STATES', 'ACCESS']);
    expect(LIBRARY_FAMILIES.map((f) => f.title)).toEqual(['AUTHORITIES', 'ASSETS', 'CHARACTERS', 'ENVIRONMENTS', 'EXPRESSIONS', 'REFERENCES', 'ICONS', 'MATERIALS', 'DOCUMENTS', 'ARCHIVE']);
    const counts = (rs: typeof ALL) => Object.fromEntries([...new Set(rs.map((r) => r.family))].map((f) => [f, rs.filter((r) => r.family === f).length]));
    expect(counts(EXPERIENCE_ROUTES)).toEqual({ world: 6, zones: 7, paths: 6, interactions: 6, inhabitants: 7, states: 7, access: 7 });
    expect(counts(LIBRARY_ROUTES)).toEqual({ authorities: 7, assets: 8, characters: 7, environments: 8, expressions: 8, references: 7, icons: 7, materials: 7, documents: 8, archive: 8 });
  });
  it('no duplicate route ids or paths; every family has exactly one root and one detail', () => {
    for (const rs of [EXPERIENCE_ROUTES, LIBRARY_ROUTES]) {
      expect(new Set(rs.map((r) => `${r.family}/${r.id}`)).size).toBe(rs.length);
      expect(new Set(rs.map((r) => r.path)).size).toBe(rs.length);
      for (const f of new Set(rs.map((r) => r.family))) {
        expect(rs.filter((r) => r.family === f && r.kind === 'root'), f).toHaveLength(1);
        expect(rs.filter((r) => r.family === f && r.kind === 'detail'), f).toHaveLength(1);
      }
    }
  });
  it('every route resolves to itself; detail ids pass through; legacy Experience ids land on families; unknown paths do not resolve', () => {
    for (const r of ALL) {
      const res = resolveRealmRoute(r.tab, r.path)!;
      expect(res.route, r.path).toBe(r);
      expect(res.family.id).toBe(r.family);
    }
    expect(resolveRealmRoute('experience', 'zones/detail/z1')!.param).toBe('z1');
    expect(resolveRealmRoute('experience', '')!.route.path).toBe('world');
    expect(resolveRealmRoute('library', '')!.route.path).toBe('authorities');
    expect(resolveRealmRoute('experience', 'modules')!.route.family).toBe('interactions');
    expect(resolveRealmRoute('experience', 'environments')!.route.path).toBe('world/environments');
    expect(resolveRealmRoute('library', 'authorities/nope')).toBeNull();
    expect(realmHref('library', 'ndxbook', 'characters', 'detail', 'SW-001')).toBe('/production/libraries/characters/detail/SW-001');
  });
  it('every route is paired with its mobile and desktop/tablet authority (and every authority is used once)', () => {
    const idx = JSON.parse(read(`${ART}/AUTHORITY_INDEX.json`)).groups as Record<string, string[]>;
    const exp = EXPERIENCE_ROUTES.map((r) => r.authority).sort();
    const lib = LIBRARY_ROUTES.map((r) => r.authority).sort();
    expect(exp).toEqual([...idx['02_EXPERIENCE_MOBILE']!].sort());
    expect(exp).toEqual([...idx['01_EXPERIENCE_DESKTOP_TABLET']!].sort());
    expect(lib).toEqual([...idx['04_LIBRARY_MOBILE']!].sort());
    expect(lib).toEqual([...idx['03_LIBRARY_DESKTOP_TABLET']!].sort());
  });
});

describe('every route renders its family shell with repo data (no authority-image copy)', () => {
  const HALLUCINATED = /SKY CITIES|FOREST BASIN|NEXUS PLAZA|CENTRAL PLAZA|AYA KIM|MARCO SILVA|287,?436|ARIE-7|CRYSTAL CLUSTER|SKY CITADEL|ORBITAL GATE/;
  it.each(ALL.map((r) => [r.tab, r.path, r] as const))('%s %s', (tab, p, r) => {
    const url = tab === 'experience' ? `/production/ndxbook/experience/${p}` : `/production/libraries/${p}`;
    const html = render(tab, url);
    const id = tab === 'experience' ? 'experience-family' : 'library-family';
    expect(html).toMatch(new RegExp(`data-testid="${id}" data-family="${r.family}" data-route="${r.id}" data-kind="${r.kind}" data-authority="${r.authority}"`));
    expect(html).not.toMatch(HALLUCINATED);
    expect(html).not.toMatch(/ProductionWorkspaceNav|production-workspace-header/);
  });
  it('Experience keeps the family pills + child tabs; Library keeps lifecycle + 10 categories', () => {
    const x = render('experience', '/production/ndxbook/experience/zones/index');
    for (const f of EXPERIENCE_FAMILIES) expect(x).toContain(`data-testid="experience-family-${f.id}"`);
    expect(x).toContain('data-testid="experience-child-tabs"');
    const l = render('library', '/production/libraries/assets/index');
    for (const life of ['canonical', 'in-review', 'superseded', 'archive']) expect(l).toContain(`data-testid="library-life-${life}"`);
    for (const f of LIBRARY_FAMILIES) expect(l).toContain(`data-testid="library-cat-${f.id}"`);
  });
  it('LIBRARY / EXPRESSIONS is the canonical archive, never the Production / Expression floor', () => {
    const html = render('library', '/production/libraries/expressions');
    expect(html).toContain('data-family="expressions"');
    expect(html).not.toMatch(/data-testid="expression-family"|production-expression-shell/);
  });
});

describe('asset registry + manifests are consumed (nothing recreated)', () => {
  it('Library ASSETS lists every registry record; plates and portraits come from registry paths', () => {
    const html = render('library', '/production/libraries/assets/index');
    expect((html.match(/data-testid="library-tile"/g) ?? []).length).toBe(PRODUCTION_ASSETS.length);
    const x = render('experience', '/production/ndxbook/experience');
    expect(x).toContain(`src="${productionAssetPublicPath('experience.worldHero')}"`);
    const res = render('library', '/production/libraries/characters/residents');
    expect((res.match(/data-testid="library-tile"/g) ?? []).length).toBe(STUDIO_WORLD_RESIDENTS.length);
    expect(res).toContain(productionAssetPublicPath('resident.sw001.etta.portrait')!);
  });
  it('slots the manifest marks missing stay honestly empty (zones, portals)', () => {
    expect(render('experience', '/production/ndxbook/experience/zones/portals')).toMatch(/NO PORTAL SOURCE — MISSING SOURCE ASSET/);
    expect(render('library', '/production/libraries/environments/zones')).toMatch(/NO ZONE PLATES — SOURCE MATCH UNCERTAIN/);
  });
  it('lineage comes from registry variantOf (resident portrait variants)', () => {
    const html = render('library', '/production/libraries/characters/lineage/SW-001');
    expect(html).toContain('data-testid="library-lineage-chain"');
    expect(html).toContain('DERIVED FROM');
    expect(html).toMatch(/ETTA VALE/);
  });
});

describe('one-viewport CSS contract', () => {
  const css = strip(read('src/site00/styles/site00-production-realm.css'));
  const frame = strip(read('src/site00/styles/site00-production-authority.css'));
  it('frame = dynamic viewport; Experience / Library lock the frame pane and fill it', () => {
    expect(frame).toMatch(/@supports \(height: 100dvh\)\s*\{\s*\.pxa \{\s*bottom: auto;\s*height: 100dvh;/);
    expect(css).toMatch(/\.pxa\[data-screen='experience'\] \.pxa-scroll,\s*\.pxa\[data-screen='library'\] \.pxa-scroll \{\s*overflow: hidden;/);
    expect(css).toMatch(/\.pxa\[data-screen='experience'\] \.pxa-body,\s*\.pxa\[data-screen='library'\] \.pxa-body \{\s*height: 100%;/);
  });
  it('only declared panes scroll; rails scroll sideways inside themselves', () => {
    const scrollers = [...css.matchAll(/([^{}]+)\{[^}]*overflow-y: auto/g)].map((m) => m[1]!.trim());
    expect(scrollers).toEqual(['.pxa .rk-scroll']);
    expect(css).toMatch(/\.pxa \[data-scroll='internal-x'\] \{\s*overflow-x: auto;/);
  });
  it('three independent compositions, no zoom / scale, no host chrome selectors', () => {
    expect(css).toMatch(/@media \(min-width: 700px\) and \(max-width: 1119px\)/);
    expect(css).toMatch(/@media \(max-width: 699px\)/);
    expect(css).not.toMatch(/\bzoom\s*:|scale\s*\(|\.pxh-|\.ph-top|\.ph-nav|prod-chrome|\.pxa-nav/);
  });
  it('stale Experience / Library presentation trees are gone', () => {
    expect(() => read('src/site00/components/productionAuthority/ExperienceBody.tsx')).toThrow();
    expect(() => read('src/site00/components/productionAuthority/LibraryBody.tsx')).toThrow();
    expect(strip(read('src/site00/styles/site00-production-authority.css'))).not.toMatch(/\.pxa-(vault|catgrid|xpanel|library)\b/);
  });
});

describe('live proof (Chromium) — 121 routes × 14 viewports', () => {
  type Row = { path: string; tab: string; kind: string; fam: string; w: number; h: number; pass: boolean; docV: number; bodyV: number; docH: number; moved: number; frame: number; nav: string; navInView: boolean; minFont: number | null; authority: { mobile: boolean; board: boolean } };
  const rows = JSON.parse(read(`${ART}/QA_MATRIX.json`)) as Row[];
  it('every route × the three primary breakpoints (363 states) is recorded and passes', () => {
    const core = rows.filter((r) => ['m390', 't820', 'd1440'].includes(r.fam));
    expect(core).toHaveLength(363);
    expect(new Set(core.map((r) => r.path)).size).toBe(121);
    for (const r of core) expect(r.pass, `${r.fam} ${r.path}`).toBe(true);
  });
  it('all 14 viewports: no page vertical / horizontal overflow, frame never scrolls, nav visible and active, readable type', () => {
    expect(new Set(rows.map((r) => `${r.w}x${r.h}`)).size).toBe(14);
    for (const r of rows) {
      const k = `${r.w}x${r.h} ${r.path}`;
      expect(r.docV, k).toBeLessThanOrEqual(1);
      expect(r.bodyV, k).toBeLessThanOrEqual(1);
      expect(r.docH, k).toBeLessThanOrEqual(1);
      expect(r.moved, k).toBe(0);
      expect(r.frame, k).toBeLessThanOrEqual(1);
      expect(r.nav, k).toBe(r.tab === 'experience' ? 'nav-experience' : 'nav-library');
      expect(r.navInView, k).toBe(true);
      expect(r.authority.mobile && r.authority.board, k).toBe(true);
      expect(r.minFont ?? 99, k).toBeGreaterThanOrEqual(8.5);
      expect(r.pass, k).toBe(true);
    }
  });
});
