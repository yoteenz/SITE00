/**
 * P0.STUDIOOS.PRODUCTION.EXPRESSION.RESPONSIVE-AUTHORITY-CONVERGENCE.OPUS1
 * The 10 Expression families / 40 routes resolve through one route model, mount in one shell inside the shared
 * Production authority frame (host header + bottom nav with EXPRESSION active), keep ROLE / ACTOR / CHARACTER
 * distinct, keep FORMAT STUDIO → CONTENT PACKAGE → CAMPAIGN BOARD in order (completed packages only), keep the
 * existing actions gated, carry the project + entry context, and fit one viewport without page scroll.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { subWorkspacesFor } from '../shared/site00-production-workspace/registry.js';
import { ExpressionFamilyScreen } from '../src/site00/components/production/ExpressionSubScreens';
import { ProductionAuthorityDataContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import {
  EXPRESSION_FAMILIES,
  EXPRESSION_ROUTES,
  expressionFrameScreen,
  expressionHref,
  resolveExpressionRoute,
  type ExpressionRouteDef,
} from '../src/site00/components/productionAuthority/expression/expressionRoutes';
import type { HubData } from '../src/site00/components/productionHub/useProductionHubData';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const ART = 'artifacts/production-expression-authority-opus1';

/* ── live-data stand-in for the hub context (graph + gate only; Entry 002 content is canonical) ── */
const IDS = ['narrative', 'cast', 'look', 'performance', 'set', 'storyboard', 'keyframes'] as const;
const NODES = IDS.map((id, i) => ({
  id,
  order: i,
  label: id.toUpperCase(),
  status: i < 2 ? 'COMPLETE' : i === 5 ? 'REVIEW_REQUIRED' : 'LOCKED',
  statusDetail: `${id} detail`,
  dependsOn: i ? [IDS[i - 1]] : [],
  unlocks: i < IDS.length - 1 ? [IDS[i + 1]] : [],
  quickActions: [],
  assetSlotId: `production.ndxbook.entry-002.node.${id}.primary`,
}));
function hub(over: { gateNode?: string; decidable?: boolean } = {}): HubData {
  const { gateNode = 'storyboard', decidable = false } = over;
  return {
    project: { projectId: 'ndxbook', name: 'NDXBOOK' },
    production: { productionId: 'entry-002', label: 'ENTRY 002', subtitle: 'OH, NOW IT WAS FUN?' },
    hasProduction: true,
    loading: false,
    deciding: false,
    decideStoryboard: async () => ({ ok: true }),
    graph: {
      nodes: NODES,
      byId: Object.fromEntries(NODES.map((n) => [n.id, n])),
      activeNodeId: 'storyboard',
      progressPercent: 30,
      completeCount: 2,
      blockers: ['STORYBOARD: awaiting founder approval'],
      founderGate: { open: true, nodeId: gateNode, headline: 'STORYBOARD APPROVAL', detail: 'gate detail', actionLabel: 'REVIEW', decidableInHub: decidable },
      operation: { label: 'STORYBOARD' },
    },
    attention: [],
    activity: [],
    scenes: [],
    frames: [1, 2, 3].map((n) => ({ frameId: `frame-0${n}`, number: n, canonicalUrl: null })),
    assetUrl: () => null,
    storyboardVersion: '001',
  } as unknown as HubData;
}

const sample = (r: ExpressionRouteDef) =>
  r.id === 'role-detail' ? 'cast-req-entry002-subject-woman'
  : r.id === 'actor-profile' ? 'sw-actor-017'
  : r.id === 'character-profile' ? 'char-entry002-subject-woman'
  : r.id === 'sequence-detail' ? 'cultural_glitch-familiar'
  : r.id === 'approval-detail' ? 'storyboard'
  : undefined;
const hrefOf = (r: ExpressionRouteDef) => expressionHref('ndxbook', r.family, r.id, sample(r), '002');
function render(r: ExpressionRouteDef, data: HubData = hub()) {
  const url = hrefOf(r);
  const resolved = resolveExpressionRoute(url.split('/expression/')[1]!.split('?')[0])!;
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [url] },
      createElement(ProductionAuthorityDataContext.Provider, { value: data }, createElement(ExpressionFamilyScreen, { slug: 'ndxbook', entry: '002', resolved })),
    ),
  );
}
const has = (html: string, id: string) => html.includes(`data-testid="${id}"`);
const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!.replace(/&amp;/g, '&'));
const routeOf = (family: string, id: string) => EXPRESSION_ROUTES.find((r) => r.family === family && r.id === id)!;

describe('route model: 10 families, 40 routes, every route paired with its authority', () => {
  const manifest = JSON.parse(read(`${ART}/AUTHORITY_MANIFEST.json`)) as { paired_count: number; routes: { route: string; pairing_status: string }[] };
  it('40 routes across 10 families, in authority order', () => {
    expect(EXPRESSION_FAMILIES.map((f) => f.n)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']);
    expect(EXPRESSION_ROUTES).toHaveLength(40);
    expect(EXPRESSION_ROUTES.map((r) => r.authority)).toEqual(manifest.routes.map((m) => m.route));
  });
  it('all 40 authority routes are PAIRED (mobile + desktop/tablet)', () => {
    expect(manifest.paired_count).toBe(40);
    for (const m of manifest.routes) expect(m.pairing_status, m.route).toBe('PAIRED');
  });
  it('every route resolves from its own href (no unresolved / duplicate paths)', () => {
    const seen = new Set<string>();
    for (const r of EXPRESSION_ROUTES) {
      const href = hrefOf(r);
      expect(seen.has(href), href).toBe(false);
      seen.add(href);
      const res = resolveExpressionRoute(href.split('/expression/')[1]!.split('?')[0]);
      expect(res?.route, href).toBe(r);
      expect(expressionFrameScreen(href.split('?')[0]!)).toBe(`expression-${r.family}`);
    }
    expect(resolveExpressionRoute('narrative/nope')).toBeNull();
    expect(resolveExpressionRoute('character-fabrication')).toBeNull();
    expect(expressionFrameScreen('/production/ndxbook/expression')).toBeNull();
  });
  it('existing sub-workspace ids stay the family segments (no renamed working routes)', () => {
    const segs = EXPRESSION_FAMILIES.map((f) => f.segment);
    for (const s of subWorkspacesFor('EXPRESSION')) if (s.id !== 'character-fabrication') expect(segs).toContain(s.id);
  });
});

describe('all 40 routes mount in the one Expression shell', () => {
  for (const r of EXPRESSION_ROUTES) {
    it(`${r.family}/${r.id}`, () => {
      const html = render(r);
      expect(html).toContain(`data-testid="expression-family" data-family="${r.family}" data-route="${r.id}"`);
      for (const id of ['expression-family-hero', 'expression-breadcrumb', 'authority-status-bar', 'expression-grid']) expect(has(html, id), id).toBe(true);
      expect(html).toContain(`data-authority="${r.authority}"`);
      expect(html).not.toContain('data-testid="expression-no-entry"');
      const tabbed = EXPRESSION_ROUTES.some((x) => x.family === r.family && x.kind === 'child') || EXPRESSION_FAMILIES.find((f) => f.id === r.family)!.downstream;
      expect(has(html, 'expression-family-tabs')).toBe(!!tabbed);
      if (r.kind === 'child') expect(html).toMatch(new RegExp(`class="is-active" aria-current="page" data-testid="expression-tab-${r.id}"`));
      if (r.kind === 'detail' && r.parent !== 'root') expect(html).toMatch(new RegExp(`class="is-active" aria-current="page" data-testid="expression-tab-${r.parent}"`));
    });
  }
  it('previous sub-screen test ids are kept on the family bodies', () => {
    for (const f of EXPRESSION_FAMILIES.filter((x) => x.legacy)) expect(render(routeOf(f.id, 'root'))).toContain(`data-testid="expression-sub-screen-${f.legacy}"`);
  });
  it('no fabricated people / dates from the reference mocks', () => {
    const all = EXPRESSION_ROUTES.map((r) => render(r)).join('');
    expect(all).not.toMatch(/ELLA MARSH|NADIA REYES|MEI TAN|M\. CHEN|R\. DIAZ|S\. PARK|#nowitwasfun|24\.8 MB|Instagram Reels|>HUB</);
  });
});

describe('shell, top host, bottom nav and EXPRESSION active state', () => {
  const page = read('src/site00/pages/production/ProductionWorkspaceProjectHubPage.tsx');
  it('family routes mount inside the shared ProductionAuthorityFrame (host header + bottom nav)', () => {
    expect(page).toMatch(/const expressionScreen = expressionFrameScreen\(pathname\);/);
    expect(page).toMatch(/<ProductionAuthorityFrame screen=\{expressionScreen\}>\s*<Outlet \/>/);
    const frame = read('src/site00/components/productionAuthority/ProductionAuthorityFrame.tsx');
    expect(frame).toContain('<ProductionWorkspaceHeader />');
    expect(frame).toContain('<ProductionWorkspaceNav />');
  });
  it('the Expression root and Character Fabrication keep their own surfaces', () => {
    expect(page).toContain('else if (isExpressionRoot) body = <ExpressionRoot slug={slug} />;');
    expect(read('src/site00/pages/production/ExpressionProductionShellPage.tsx')).toMatch(/case 'character-fabrication':\s*return <CharacterFabrication/);
  });
});

describe('ROLE / ACTOR / CHARACTER stay distinct', () => {
  it('each entity has its own list, its own detail route and its own record id space', () => {
    const roles = render(routeOf('casting', 'roles'));
    const actors = render(routeOf('casting', 'actors'));
    const chars = render(routeOf('casting', 'characters'));
    expect(hrefs(roles).some((h) => /\/casting\/roles\/cast-req-/.test(h))).toBe(true);
    expect(hrefs(actors).some((h) => /\/casting\/actors\/sw-actor-/.test(h))).toBe(true);
    expect(hrefs(chars).some((h) => /\/casting\/characters\/char-/.test(h))).toBe(true);
    expect(hrefs(roles).some((h) => /\/casting\/(actors|characters)\//.test(h) && !/role/.test(h))).toBe(false);
    expect((roles.match(/data-testid="casting-role-row"/g) ?? []).length).toBeGreaterThan(0);
    expect(has(actors, 'acting-catalogue-search')).toBe(true);
  });
  it('character profile links its ROLE and its ACTOR as separate records', () => {
    const html = render(routeOf('casting', 'character-profile'));
    for (const id of ['casting-character-profile', 'casting-character-role', 'casting-character-actor']) expect(has(html, id), id).toBe(true);
    const links = hrefs(html);
    expect(links).toContain('/production/ndxbook/expression/casting/roles/cast-req-entry002-subject-woman?entry=002');
    expect(links).toContain('/production/ndxbook/expression/casting/actors/sw-actor-017?entry=002');
  });
  it('the chain view labels each column with its entity', () => {
    const html = render(routeOf('casting', 'characters'));
    for (const e of ['role', 'actor', 'character']) expect(html).toContain(`data-entity="${e}"`);
  });
  it('environment ≠ set ≠ zone', () => {
    const html = render(routeOf('sets', 'root'));
    for (const e of ['environment', 'set', 'zone']) expect(html).toContain(`data-entity="${e}"`);
  });
});

describe('FORMAT STUDIO → CONTENT PACKAGE → CAMPAIGN BOARD', () => {
  it('the three downstream stages share one ordered flow nav', () => {
    for (const id of ['format', 'package', 'campaign'] as const) {
      const html = render(routeOf(id, 'root'));
      expect(html).toContain('data-flow="format-package-campaign"');
      const order = ['format', 'package', 'campaign'].map((f) => html.indexOf(`data-testid="expression-tab-${f}"`));
      expect([...order].sort((a, b) => a - b)).toEqual(order);
    }
    const flow = render(routeOf('format', 'root'));
    const stages = [...flow.matchAll(/data-stage="([^"]+)"/g)].map((m) => m[1]);
    expect(stages).toEqual(['CORE PRODUCTION', 'FINAL REEL / MASTER', 'DERIVATIVE SOCIAL', 'FORMAT STUDIO', 'CONTENT PACKAGE', 'CAMPAIGN BOARD']);
  });
  it('formats come from the master narrative; the package is planned, not assembled; finalize is gated', () => {
    const fmt = render(routeOf('format', 'root'));
    expect(fmt).toContain('data-testid="format-reel"');
    expect(has(fmt, 'format-master-unmounted')).toBe(true);
    const pkg = render(routeOf('package', 'root'));
    expect((pkg.match(/data-testid="package-deliverable"/g) ?? []).length).toBeGreaterThan(0);
    expect(pkg).not.toContain('data-state="ASSEMBLED"');
    expect(pkg).toMatch(/<button[^>]*disabled=""[^>]*data-testid="package-finalize"/);
    expect(pkg).toMatch(/<button[^>]*disabled=""[^>]*data-testid="package-to-campaign"/);
  });
  it('Campaign Board receives completed packages only (none yet → honest empty)', () => {
    const html = render(routeOf('campaign', 'root'));
    expect(has(html, 'campaign-empty')).toBe(true);
    expect(has(html, 'campaign-pending-package')).toBe(true);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*data-testid="campaign-prepare"/);
  });
});

describe('actions + approval controls', () => {
  it('narrative approval uses the existing founder judgment actions', () => {
    const html = render(routeOf('narrative', 'story'));
    for (const id of ['narrative-approve', 'narrative-refine', 'narrative-recompile']) expect(has(html, id), id).toBe(true);
    expect(read('src/site00/components/productionAuthority/expression/families/NarrativeFamily.tsx')).toMatch(/postNarrativeMomentumJudgment\(a\)/);
  });
  it('storyboard approve / revise is enabled only when the gate is open on storyboard and decidable', () => {
    const r = routeOf('storyboard', 'root');
    expect(render(r, hub({ decidable: false }))).toMatch(/<button[^>]*disabled=""[^>]*data-testid="storyboard-approve"/);
    expect(render(r, hub({ decidable: true }))).not.toMatch(/<button[^>]*disabled=""[^>]*data-testid="storyboard-approve"/);
    expect(render(r, hub({ decidable: true, gateNode: 'narrative' }))).toMatch(/<button[^>]*disabled=""[^>]*data-testid="storyboard-approve"/);
  });
  it('lock + handoff stay disabled until every package item is ready', () => {
    const html = render(routeOf('review', 'root'));
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*data-testid="lock-production-package"/);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*data-testid="handoff-send"/);
    expect((html.match(/data-testid="review-package-row"/g) ?? []).length).toBe(6);
  });
  it('approval detail routes each item to its owning action; comments are UNMOUNTED', () => {
    const sb = render(routeOf('review', 'approval-detail'));
    expect(has(sb, 'review-storyboard-decision')).toBe(true);
    expect(has(sb, 'review-comments-unmounted')).toBe(true);
  });
  it('existing pickers and engine links are kept', () => {
    expect(has(render(routeOf('look', 'hair')), 'wardrobe-character-select')).toBe(true);
    expect(has(render(routeOf('look', 'looks')), 'wardrobe-open-engine')).toBe(true);
    expect(has(render(routeOf('performance', 'root')), 'performance-character-select')).toBe(true);
    expect(has(render(routeOf('sets', 'sets')), 'sets-open-libraries')).toBe(true);
    expect(has(render(routeOf('storyboard', 'keyframes')), 'storyboard-open-engine')).toBe(true);
  });
});

describe('project + entry context persists', () => {
  it('every in-family link keeps the project slug and ?entry=', () => {
    for (const r of EXPRESSION_ROUTES) {
      for (const h of hrefs(render(r)).filter((x) => x.includes('/expression/'))) {
        expect(h, `${r.family}/${r.id}`).toMatch(/^\/production\/ndxbook\/expression\//);
        expect(h, `${r.family}/${r.id}`).toContain('entry=002');
      }
    }
  });
});

describe('data contracts + auth unchanged', () => {
  it('the router still mounts the one expression/* wildcard under the existing guarded production layout', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('<Route path="expression/*" element={<Site00Suspense><ExpressionProductionShellPage /></Site00Suspense>} />');
    expect(subWorkspacesFor('EXPRESSION').map((s) => s.id)).toEqual(['narrative', 'casting', 'character-fabrication', 'wardrobe', 'performance', 'sets', 'storyboard', 'review']);
  });
  it('new Expression modules add no fetch / API surface of their own', () => {
    const dir = 'src/site00/components/productionAuthority/expression';
    const files = ['expressionRoutes.ts', 'expressionData.ts', 'ExpressionFamilyShell.tsx', ...['Narrative', 'Casting', 'Look', 'Performance', 'Sets', 'Storyboard', 'Review', 'Downstream'].map((f) => `families/${f}Family.tsx`)];
    for (const f of files) expect(read(`${dir}/${f}`), f).not.toMatch(/\bfetch\(|apiFetch|supabase|localStorage/);
  });
});

describe('no page overflow (styles + live proof)', () => {
  const css = strip(read('src/site00/styles/site00-production-expression-family.css'));
  it('family screens lock the frame and give the grid the remaining height', () => {
    expect(css).toMatch(/\.pxa\[data-screen\^='expression-'\] \.pxa-scroll \{\s*overflow: hidden;/);
    expect(css).toMatch(/\.pxa \.exf \{[^}]*height: 100%;[^}]*overflow: hidden;/);
    // a panel body never clips silently: it is a bounded internal pane
    expect(css).toMatch(/\.pxa \.exf-panel__body \{[^}]*min-height: 0;[^}]*overflow-y: auto;/);
    expect(css).toMatch(/@media \(max-width: 699px\)/);
    expect(css).toMatch(/@media \(min-width: 700px\) and \(max-width: 1119px\)/);
  });
  it('body only: no host chrome selectors, no zoom / scale', () => {
    expect(css).not.toMatch(/\.pxh-|\.ph-top|\.ph-nav|prod-chrome|\.pxa-nav|\bzoom\s*:|scale\s*\(/);
  });
  it('live proof: 40 routes × 5 viewports fit with no page / frame scroll, EXPRESSION active, no errors', () => {
    const rows = JSON.parse(read(`${ART}/NO_SCROLL_REPORT.json`)) as { key: string; fam: string; overflow: number; docOverflow: number; navActive: string; errs: string[]; clipped: string[] }[];
    expect(rows).toHaveLength(200);
    for (const r of rows) {
      expect(r.overflow, `${r.fam} ${r.key}`).toBeLessThanOrEqual(1);
      expect(r.docOverflow, `${r.fam} ${r.key}`).toBeLessThanOrEqual(1);
      expect(r.navActive, `${r.fam} ${r.key}`).toBe('nav-expression');
      expect(r.errs, `${r.fam} ${r.key}`).toEqual([]);
      expect(r.clipped, `${r.fam} ${r.key}`).toEqual([]);
    }
  });
});
