/**
 * P0.PRODUCTION.INBOX-ACTIVITY.AUTHORITY-CONVERGENCE2 — INBOX part only (tunnel branch).
 * The NEEDS YOU root is recomposed to the newest parent authority (01_INBOX): selected decision surface ·
 * INCOMING DECISION OBJECTS · BLOCKERS & APPROVALS · RECENTLY RESOLVED. OPUS2 model / routing / gate unchanged.
 * The blockers count deep-links to Activity (now the canonical DOMAIN × TIME project memory — ACTIVITY.ONE-VIEWPORT-CONVERGENCE.OPUS1).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { InboxBody, inboxHref } from '../src/site00/components/productionAuthority/InboxBody';
import { ProductionAuthorityDataContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import type { HubData } from '../src/site00/components/productionHub/useProductionHubData';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const IDS = ['narrative', 'cast', 'look', 'performance', 'set', 'storyboard', 'keyframes'] as const;
const NODES = IDS.map((id, i) => ({
  id,
  order: i,
  label: id.toUpperCase(),
  status: i === 0 ? 'REVIEW_REQUIRED' : 'LOCKED',
  statusDetail: `${id} detail`,
  dependsOn: i ? [IDS[i - 1]] : [],
  unlocks: i < IDS.length - 1 ? [IDS[i + 1]] : [],
  quickActions: [],
  assetSlotId: `production.ndxbook.entry-002.node.${id}.primary`,
}));
function hub(over: { decidable?: boolean; activity?: unknown[] } = {}): HubData {
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
      activeNodeId: 'narrative',
      progressPercent: 0,
      completeCount: 0,
      blockers: ['NARRATIVE: awaiting founder approval', 'CAST: upstream narrative not complete', 'LOOK: upstream cast not complete'],
      founderGate: { open: true, nodeId: 'narrative', headline: 'NARRATIVE APPROVAL', detail: 'gate detail', actionLabel: 'REVIEW', decidableInHub: !!over.decidable },
      operation: { label: 'NARRATIVE' },
    },
    attention: [
      { id: 'attn.narrative', kind: 'NARRATIVE', title: 'NARRATIVE APPROVAL', subtitle: 'ENTRY 002', stateLabel: 'AWAITING DECISION', actionLabel: 'REVIEW', priority: 'HIGH', nodeId: 'narrative', sceneId: null, assetSlotId: null, why: 'Narrative awaiting founder approval.' },
      { id: 'attn.cast', kind: 'CASTING', title: 'CASTING DECISION', subtitle: 'ENTRY 002', stateLabel: 'AWAITING DECISION', actionLabel: 'REVIEW', priority: 'NORMAL', nodeId: 'cast', sceneId: null, assetSlotId: null, why: 'Upstream narrative not complete.' },
    ],
    activity: over.activity ?? [{ id: 'r1', category: 'APPROVAL', title: 'STORYBOARD REVISION REQUESTED', detail: 'NDXBOOK · ENTRY 002', at: new Date().toISOString(), actor: 'FOUNDER', assetSlotId: null }],
    cast: { characters: [], looks: [] },
    scenes: [],
    frames: [],
    assetUrl: () => null,
  } as unknown as HubData;
}
const render = (url: string, data: HubData = hub()) =>
  renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [url] }, createElement(ProductionAuthorityDataContext.Provider, { value: data }, createElement(InboxBody))));
const has = (html: string, id: string) => html.includes(`data-testid="${id}"`);
const count = (html: string, id: string) => (html.match(new RegExp(`data-testid="${id}"`, 'g')) ?? []).length;

describe('INBOX · NEEDS YOU recomposed to the newest parent authority (model, routing, gate unchanged)', () => {
  const html = render('/production/queue');
  it('selected decision surface: art · SOURCE / AREA / REQUEST / BLOCKS / BY · urgency · REVIEW → APPROVE → REQUEST REVISION', () => {
    const card = html.slice(html.indexOf('data-testid="inbox-focus"'), html.indexOf('</article>', html.indexOf('data-testid="inbox-focus"')));
    expect([...card.matchAll(/<dt>([A-Z]+)<\/dt>/g)].map((m) => m[1])).toEqual(['SOURCE', 'AREA', 'REQUEST', 'BLOCKS', 'BY']);
    expect(card).toContain('URGENCY: HIGH');
    const order = ['inbox-review', 'inbox-approve', 'inbox-revise'].map((id) => card.indexOf(`data-testid="${id}"`));
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
  it('INCOMING DECISION OBJECTS beside BLOCKERS & APPROVALS (two live counts), then RECENTLY RESOLVED', () => {
    expect(html).toContain('INCOMING DECISION OBJECTS');
    expect(html).toContain('BLOCKERS &amp; APPROVALS');
    expect(count(html, 'inbox-attention-blockers')).toBe(1);
    expect(count(html, 'inbox-attention-approvals')).toBe(1);
    expect(html).toMatch(/data-testid="inbox-attention-blockers"[^>]*><b>03<\/b>/);
    expect(html.indexOf('data-testid="inbox-incoming"')).toBeLessThan(html.indexOf('data-testid="inbox-attention"'));
    expect(html.indexOf('data-testid="inbox-attention"')).toBeLessThan(html.indexOf('data-testid="inbox-resolved-rail"'));
  });
  it('blockers deep-link into Activity; the legacy ?view=blockers link resolves to the BLOCKED change filter', () => {
    expect(html).toContain('href="/production/activity?view=blockers"');
    // ACTIVITY.ONE-VIEWPORT-CONVERGENCE.OPUS1 retired the OPUS1 lens bar; the link stays valid via readActivityQuery
    expect(read('src/site00/components/productionAuthority/ActivityBody.tsx')).toMatch(/legacy === 'blockers' \? 'blocked'/);
  });
  it('nothing resolved → honest empty strip, never filler art', () => {
    const empty = render('/production/queue', hub({ activity: [] }));
    expect(has(empty, 'inbox-resolved-empty')).toBe(true);
    expect(empty).toContain('NOTHING RESOLVED YET');
  });
  it('approve stays gated by the founder gate', () => {
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*data-testid="inbox-approve"/);
    expect(has(html, 'inbox-focus-gate')).toBe(true);
    expect(render('/production/queue', hub({ decidable: true }))).not.toMatch(/<button[^>]*disabled=""[^>]*data-testid="inbox-approve"/);
  });
  it('NEEDS YOU / WATCHING / RESOLVED semantics and routes unchanged', () => {
    for (const lens of ['needs', 'watching', 'resolved'] as const) expect(render(inboxHref(lens))).toMatch(new RegExp(`class="is-active"[^>]*data-testid="inbox-tab-${lens}"`));
    expect(inboxHref('needs')).toBe('/production/queue');
    expect(render('/production/queue?view=approvals')).toContain('data-lens="needs"');
  });
  it('root styles are body-only (no host chrome selectors, no zoom / scale)', () => {
    const css = strip(read('src/site00/styles/site00-production-inbox-family.css'));
    expect(css).not.toMatch(/\.pxh-|\.ph-top|\.ph-nav|prod-chrome|\bzoom\s*:|scale\s*\(/);
  });
});

describe('live proof on this branch (Chromium)', () => {
  it('Inbox root + children fit with no page / frame scroll and nothing clipped', () => {
    const rows = JSON.parse(read('artifacts/production-inbox-root-convergence2/NO_SCROLL_REPORT.json')) as { key: string; fam: string; overflow: number; docOverflow: number; navActive: string; errs: string[]; clipped: string[] }[];
    expect(rows.length).toBeGreaterThanOrEqual(15);
    for (const r of rows) {
      expect(r.overflow, `${r.fam} ${r.key}`).toBeLessThanOrEqual(1);
      expect(r.docOverflow, `${r.fam} ${r.key}`).toBeLessThanOrEqual(1);
      expect(r.errs, `${r.fam} ${r.key}`).toEqual([]);
      expect(r.clipped, `${r.fam} ${r.key}`).toEqual([]);
      expect(r.navActive, `${r.fam} ${r.key}`).toBe('nav-inbox');
    }
  });
});
