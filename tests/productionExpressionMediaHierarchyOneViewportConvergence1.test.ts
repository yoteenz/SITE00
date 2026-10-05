/**
 * P0.STUDIOOS.PRODUCTION.EXPRESSION.MEDIA-HIERARCHY.ONE-VIEWPORT-CONVERGENCE1
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ExpressionFamilyScreen } from '../src/site00/components/production/ExpressionSubScreens';
import { ProductionAuthorityDataContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import { EXPRESSION_ROUTES, expressionHref, resolveExpressionRoute, type ExpressionRouteDef } from '../src/site00/components/productionAuthority/expression/expressionRoutes';
import type { HubData } from '../src/site00/components/productionHub/useProductionHubData';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

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

function hub(): HubData {
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
      blockers: [],
      founderGate: { open: true, nodeId: 'storyboard', headline: 'STORYBOARD', detail: 'gate', actionLabel: 'REVIEW', decidableInHub: false },
      operation: { label: 'STORYBOARD' },
    },
    attention: [],
    activity: [],
    scenes: [],
    frames: [1, 2, 3].map((n) => ({ frameId: `frame-0${n}`, number: n, canonicalUrl: 'https://example.com/frame.png' })),
    assetUrl: () => 'https://example.com/slot.png',
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

function renderRoute(family: string, id: string) {
  const r = EXPRESSION_ROUTES.find((x) => x.family === family && x.id === id)!;
  const href = expressionHref('ndxbook', r.family, r.id, sample(r), '002');
  const resolved = resolveExpressionRoute(href.split('/expression/')[1]!.split('?')[0])!;
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [href] },
      createElement(ProductionAuthorityDataContext.Provider, { value: hub() }, createElement(ExpressionFamilyScreen, { slug: 'ndxbook', entry: '002', resolved })),
    ),
  );
}

describe('Expression media hierarchy — primary media + inspector', () => {
  it('look root and looks detail expose inspectable authority media (not strip-only fill)', () => {
    const lookRoot = renderRoute('look', 'root');
    expect(lookRoot).toContain('data-testid="look-root-active-media"');
    expect(lookRoot).toContain('data-inspectable="true"');
    expect(lookRoot).toContain('data-media-focus="true"');
    const looks = renderRoute('look', 'looks');
    expect(looks).toContain('data-testid="look-authority-media"');
    expect(looks).toContain('exf-panel--media');
  });

  it('storyboard root prioritizes active frame stage + horizontal filmstrip rail', () => {
    const html = renderRoute('storyboard', 'root');
    expect(html).toContain('data-testid="storyboard-active-frame"');
    expect(html).toContain('data-testid="storyboard-filmstrip"');
    expect(html).toContain('exf-frames--rail');
    expect(html).toContain('exf-storyboard-stage');
  });

  it('casting root uses talent rail portraits and inspectable lead authority', () => {
    const html = renderRoute('casting', 'root');
    expect(html).toContain('exf-rail--talent');
    expect(html).toContain('data-testid="casting-lead-authority-media"');
    // FULL-AUTHORITY-FORENSIC-AUDIT.OPUS2: portraits ride the media kit's face rail (internal horizontal scroll)
    expect(html).toMatch(/class="exm-faces" data-scroll="internal-x"/);
    expect(html).toContain('class="exm-face"');
  });

  it('actor profile uses media-primary panel for portrait hero', () => {
    const html = renderRoute('casting', 'actor-profile');
    expect(html).toContain('data-testid="casting-actor-profile"');
    // FULL-AUTHORITY-FORENSIC-AUDIT.OPUS2: record hero (portrait beside identity) + inspectable gallery
    expect(html).toContain('exm-hero__media');
    expect(html).toContain('data-testid="casting-actor-hero-media"');
  });

  it('media inspector module is present in shell exports path', () => {
    expect(read('src/site00/components/productionAuthority/expression/ExpressionMediaInspector.tsx')).toContain('expression-media-inspector');
  });
});

describe('Expression media hierarchy — one-viewport CSS guardrails', () => {
  const css = strip(read('src/site00/styles/site00-production-expression-family.css'));
  it('locks frame overflow and defines media-primary + inspector overlays', () => {
    expect(css).toMatch(/\.pxa \.exf \{[^}]*overflow: hidden;/);
    expect(css).toContain('.exf-media-primary');
    expect(css).toContain('.exf-inspect');
    expect(css).toContain('.exf-frames--rail');
    expect(css).toContain('.pxa-status--compact');
  });
});
