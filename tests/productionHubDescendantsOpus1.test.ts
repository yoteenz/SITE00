/**
 * P0.STUDIOOS.PRODUCTION.HUB.DESCENDANTS-INTERACTIONS.OPUS1
 * HUB-owned interactions resolve to real routes, every HUB state renders in HUB grammar from the shared data
 * context, the host MENU is the authored panel in both headers, and no stale / generic component returns.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { subWorkspacesFor } from '../shared/site00-production-workspace/registry';
import { HubBody, NODE_SUB } from '../src/site00/components/productionAuthority/HubBody';
import { ProductionAuthorityDataContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import type { HubData } from '../src/site00/components/productionHub/useProductionHubData';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const NODES = (['narrative', 'cast', 'look', 'performance', 'set', 'storyboard', 'keyframes'] as const).map((id, i) => ({
  id,
  order: i,
  label: id.toUpperCase(),
  status: i < 3 ? 'REVIEW_REQUIRED' : 'LOCKED',
  statusDetail: `${id} detail`,
  dependsOn: [],
  unlocks: [],
  quickActions: [],
  assetSlotId: `production.ndxbook.p.node.${id}.primary`,
}));

function mock(over: Partial<Record<string, unknown>> = {}): HubData {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return {
    project: { projectId: 'ndxbook', name: 'NDXBOOK' },
    production: { productionId: 'p', label: 'ENTRY 002', subtitle: '' },
    hasProduction: true,
    loading: false,
    graph: { nodes: NODES, byId, activeNodeId: 'narrative', progressPercent: 0, blockers: [{}, {}], operation: { label: 'NARRATIVE' } },
    attention: [
      { id: 'a1', kind: 'X', title: 'NARRATIVE APPROVAL', subtitle: 'ENTRY 002', stateLabel: '', actionLabel: '', priority: 'HIGH', nodeId: 'narrative', sceneId: null, assetSlotId: null, why: '' },
    ],
    activity: [],
    cast: { characters: [1, 2, 3], looks: [1, 2] },
    frames: [],
    scenes: [1, 2, 3, 4, 5, 6, 7],
    assetUrl: () => null,
    ...over,
  } as unknown as HubData;
}

const render = (data: HubData) =>
  renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(ProductionAuthorityDataContext.Provider, { value: data }, createElement(HubBody))),
  );

describe('HUB-owned interactions resolve', () => {
  const html = render(mock());
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!);

  it('every HUB action targets an existing production route (no invented routes)', () => {
    const allowed = new Set(['/production/queue', '/production/activity', '/production?view=machine', '/production/ndxbook/expression']);
    for (const sub of Object.values(NODE_SUB)) allowed.add(`/production/ndxbook/expression/${sub}`);
    for (const h of hrefs) expect(allowed.has(h), h).toBe(true);
    for (const t of ['/production/queue', '/production/activity', '/production?view=machine', '/production/ndxbook/expression']) expect(hrefs).toContain(t);
  });

  it('component tiles map onto registered Expression sub-workspaces', () => {
    const subs = new Set(subWorkspacesFor('EXPRESSION').map((s) => s.id));
    for (const [node, sub] of Object.entries(NODE_SUB)) expect(subs.has(sub), `${node} → ${sub}`).toBe(true);
  });
});

describe('HUB states render in HUB grammar', () => {
  it('populated', () => {
    const html = render(mock());
    for (const id of ['authority-hub', 'authority-hero', 'authority-status-bar', 'hub-entry-card', 'hub-entry-active', 'hub-entry-new', 'hub-operations', 'hub-activity'])
      expect(html, id).toContain(`data-testid="${id}"`);
    expect(html).not.toContain('data-loading');
  });
  it('loading reads SYNCING on the live strip', () => {
    const html = render(mock({ loading: true }));
    expect(html).toContain('data-loading="true"');
    expect(html).toContain('SYNCING LIVE STATE');
  });
  it('operations empty', () => {
    expect(render(mock({ attention: [] }))).toContain('data-testid="hub-operations-empty"');
  });
  it('no production shows the honest empty entry slot, not stale entry art', () => {
    const html = render(mock({ production: null, hasProduction: false, cast: null, scenes: [], attention: [] }));
    expect(html).toContain('data-testid="hub-entry-card-empty"');
    expect(html).not.toContain('data-testid="hub-entry-card"');
    expect(html).not.toContain('data-testid="hub-entry-active"');
    expect(html).toContain('NO PRODUCTION IN THIS PROJECT YET');
  });
  it('no components / no activity', () => {
    const html = render(mock({ graph: { nodes: [], byId: {}, activeNodeId: null, progressPercent: 0, blockers: [], operation: { label: '—' } } }));
    expect(html).toContain('data-testid="hub-components-empty"');
    expect(html).toContain('data-testid="hub-activity-empty"');
  });
});

describe('temporary surfaces accounted for', () => {
  const chrome = read('src/site00/components/productionHub/chrome.tsx');
  it('both headers open the one authored MENU panel (no inline generic menus left)', () => {
    expect(chrome).toContain('function ProductionMenuPanel');
    expect(chrome).toContain('<ProductionMenuPanel items={MENU_PHONE} className="prod-chrome-pop"');
    expect(chrome).toContain('<ProductionMenuPanel items={MENU_HOST} className="pxh-pop"');
    expect(chrome).not.toMatch(/<b>PRODUCTION HUB<\/b><span>/);
    expect(chrome).toMatch(/e\.key === 'Escape'/);
  });
  it('menu destinations are unchanged', () => {
    for (const to of ["to: '/production'", "to: '/production/queue'", "to: '/control'"]) expect(chrome).toContain(to);
  });
  it('documented temporary surfaces exist in the proof', () => {
    const doc = read('artifacts/production-hub-descendants-opus1/HUB_TEMPORARY_SURFACES.md');
    for (const t of ['MENU', 'LOADING', 'EMPTY', 'FULLSCREEN_TEMPORARY_VIEW', 'ERROR']) expect(doc).toContain(t);
  });
});

describe('no stale / generic components in HUB paths', () => {
  const hub = read('src/site00/components/productionAuthority/HubBody.tsx');
  const body = hub.slice(hub.indexOf('export function HubBody()'));
  it('HUB body uses no legacy primitives or retired plates', () => {
    expect(body).not.toMatch(/<Sec\b|<Donut\b|PW_IMG|pxa-legend|pxa-components|pxa-entrycard/);
    expect(hub).not.toMatch(/HUB_ATMOSPHERE_SLOT_ID[^,]*\n[\s\S]*export function HubBody/);
  });
  it('interaction states exist for HUB actions (hover / focus / pressed) without scaling', () => {
    const css = read('src/site00/styles/site00-production-hub-reconstruction.css');
    expect(css).toMatch(/\.pxa \.hubx a:focus-visible/);
    expect(css).toMatch(/\.pxa \.hubx-entry:hover/);
    expect(css).toMatch(/\.pxa \.hubx-entry:active/);
    expect(css).not.toMatch(/scale\s*\(/);
  });
  it('host menu styles add no scaling to host chrome', () => {
    const css = read('src/site00/styles/site00-production-host-chrome.css').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.pxh-pop\.pxm/);
    expect(css).not.toMatch(/\bzoom\s*:|scale\s*\(/);
  });
});
