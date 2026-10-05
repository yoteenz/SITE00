/**
 * P0.STUDIOOS.PRODUCTION.INBOX.ONE-VIEWPORT-FAMILY-CONVERGENCE.OPUS1
 * The Inbox children (WATCHING · RESOLVED · ALL INBOX · MESSAGES · SYSTEM) are one contained workspace —
 * rail → compact object rows → inspector — instead of stacked summary / search / filter / big-card pages with a
 * permanent OPEN + STOP WATCHING column. The model, routes, gate and data are unchanged; the whole family fits
 * between the global host and the bottom nav (proven live in Chromium below).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { InboxBody, inboxHref, INBOX_LENSES } from '../src/site00/components/productionAuthority/InboxBody';
import { ProductionAuthorityDataContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import type { HubData } from '../src/site00/components/productionHub/useProductionHubData';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const IDS = ['narrative', 'cast', 'look', 'performance', 'set', 'storyboard', 'keyframes'] as const;
const STATUS = ['REVIEW_REQUIRED', 'REVIEW_REQUIRED', 'BLOCKED', 'ACTIVE', 'LOCKED', 'LOCKED', 'COMPLETE'] as const;
const NODES = IDS.map((id, i) => ({
  id,
  order: i,
  label: id.toUpperCase(),
  status: STATUS[i],
  statusDetail: `${id} detail`,
  dependsOn: i ? [IDS[i - 1]] : [],
  unlocks: i < IDS.length - 1 ? [IDS[i + 1]] : [],
  quickActions: [],
  assetSlotId: `production.ndxbook.p.node.${id}.primary`,
}));
const mock = (decidable = false): HubData =>
  ({
    project: { projectId: 'ndxbook', name: 'NDXBOOK' },
    production: { productionId: 'p', label: 'ENTRY 002', subtitle: '' },
    hasProduction: true,
    loading: false,
    deciding: false,
    decideStoryboard: async () => ({ ok: true }),
    graph: {
      nodes: NODES,
      byId: Object.fromEntries(NODES.map((n) => [n.id, n])),
      activeNodeId: 'narrative',
      progressPercent: 0,
      completeCount: 1,
      blockers: ['LOOK: upstream cast not complete', 'SET: waiting'],
      founderGate: { open: true, nodeId: 'narrative', headline: 'NARRATIVE APPROVAL', detail: 'gate', decidableInHub: decidable },
      operation: { label: 'NARRATIVE' },
    },
    attention: [
      { id: 'attn.narrative', kind: 'NARRATIVE_APPROVAL', title: 'NARRATIVE APPROVAL', subtitle: 'ENTRY 002', stateLabel: 'AWAITING DECISION', actionLabel: 'REVIEW', priority: 'HIGH', nodeId: 'narrative', sceneId: null, assetSlotId: null, why: 'Narrative awaiting founder approval.' },
      { id: 'attn.cast', kind: 'CASTING_DECISION', title: 'CASTING DECISION', subtitle: 'ENTRY 002', stateLabel: 'AWAITING DECISION', actionLabel: 'REVIEW', priority: 'NORMAL', nodeId: 'cast', sceneId: null, assetSlotId: null, why: 'Upstream narrative not complete.' },
    ],
    activity: [{ id: 'act.1', category: 'APPROVAL', title: 'STORYBOARD REVISION REQUESTED', detail: 'NDXBOOK · ENTRY 002', at: '2026-10-01T10:00:00Z', actor: 'FOUNDER', assetSlotId: null }],
    cast: { characters: [], looks: [] },
    frames: [1, 2, 3],
    scenes: [],
    assetUrl: () => null,
  }) as unknown as HubData;
const render = (url: string, data: HubData = mock()) =>
  renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [url] }, createElement(ProductionAuthorityDataContext.Provider, { value: data }, createElement(InboxBody))));
const has = (html: string, id: string) => html.includes(`data-testid="${id}"`);
const count = (html: string, id: string) => (html.match(new RegExp(`data-testid="${id}"`, 'g')) ?? []).length;
const slice = (html: string, id: string) => {
  const i = html.indexOf(`data-testid="${id}"`);
  return i < 0 ? '' : html.slice(i);
};

const CHILDREN = [
  ['watching', 'inbox-watching', 'inbox-watching-list', 'inbox-watch-row'],
  ['resolved', 'inbox-resolved', 'inbox-resolved-list', 'inbox-resolved-row'],
  ['all', 'inbox-all', 'inbox-all-list', 'inbox-all-row'],
  ['system', 'inbox-system', 'inbox-system-notices', 'inbox-system-row'],
] as const;

describe('canonical Inbox model (1–4)', () => {
  it('1 state strip is NEEDS YOU · WATCHING · RESOLVED on every list route', () => {
    for (const lens of INBOX_LENSES) {
      const html = render(inboxHref(lens));
      const tabs = html.slice(html.indexOf('data-testid="inbox-tabs"'), html.indexOf('</nav>', html.indexOf('data-testid="inbox-tabs"')));
      expect(tabs.match(/>(NEEDS YOU|WATCHING|RESOLVED)</g), lens).toEqual(['>NEEDS YOU<', '>WATCHING<', '>RESOLVED<']);
    }
  });
  it('2 WATCHING exists on its route, carries only watching objects and keeps the WATCHING tab active', () => {
    const html = render(inboxHref('watching'));
    expect(html).toMatch(/class="is-active"[^>]*data-testid="inbox-tab-watching"/);
    expect(count(html, 'inbox-watch-row')).toBeGreaterThan(0);
    expect([...html.matchAll(/data-testid="inbox-watch-row" data-type="[A-Z]+" data-state="([A-Z_]+)"/g)].every((m) => m[1] === 'WATCHING')).toBe(true);
  });
  it('3 ALL INBOX / MESSAGES / SYSTEM stay reachable from the type views', () => {
    for (const lens of ['all', 'messages', 'system'] as const) {
      const html = render(inboxHref(lens));
      for (const t of ['all', 'messages', 'system']) expect(html, `${lens}:${t}`).toContain(`data-testid="inbox-type-${t}"`);
    }
  });
  it('4 DECISION / MESSAGE / SYSTEM stay distinct (type on every row; separate state chip)', () => {
    const html = render(inboxHref('all'));
    const types = new Set([...html.matchAll(/data-testid="inbox-all-row" data-type="([A-Z]+)"/g)].map((m) => m[1]));
    expect(types.has('DECISION')).toBe(true);
    expect(types.has('SYSTEM')).toBe(true);
    expect(html).toMatch(/class="ibx-row__type"/);
    expect(html).toMatch(/class="ibx-row__state"/);
  });
});

describe('compact rows + inspector (5, 13)', () => {
  it('5 list rows carry no permanent action column — actions live in the inspector', () => {
    for (const [lens, , list] of CHILDREN) {
      const html = render(inboxHref(lens));
      const rows = html.slice(html.indexOf(`data-testid="${list}"`), html.indexOf('data-testid="inbox-inspector"'));
      expect(rows, lens).not.toMatch(/<button/);
      expect(rows, lens).not.toMatch(/class="ibx-btn/);
      expect(rows, lens).not.toMatch(/STOP WATCHING|>OPEN<|>INSPECT<|>REVIEW</);
    }
  });
  it('WATCHING: OPEN + STOP WATCHING (honestly disabled) are in the inspector', () => {
    const insp = slice(render(inboxHref('watching')), 'inbox-inspector');
    expect(insp).toContain('data-testid="inbox-watch-open"');
    expect(insp).toMatch(/<button[^>]*disabled=""[^>]*data-testid="inbox-stop-watching"/);
  });
  it('selecting a row (?sel=) opens the inspector — on mobile it is a drawer with a scrim', () => {
    const html = render(inboxHref('watching'));
    const tag = html.match(/<a [^>]*data-testid="inbox-watch-row"[^>]*>/)![0];
    const first = tag.match(/href="([^"]+)"/)![1]!.replace(/&amp;/g, '&');
    expect(first).toMatch(/[?&]sel=/);
    const open = render(first);
    expect(open).toMatch(/data-testid="inbox-watching" data-open="item"/);
    expect(open).toMatch(/data-testid="inbox-inspector" data-state="selected"/);
    expect(has(open, 'inbox-inspector-scrim')).toBe(true);
    expect(has(open, 'inbox-inspector-close')).toBe(true);
    expect(html).not.toMatch(/data-open=/);
  });
  it('decisions keep the founder gate in the inspector (APPROVE disabled unless decidable)', () => {
    const sel = inboxHref('all', { sel: 'attn.narrative' });
    expect(render(sel)).toMatch(/<button[^>]*disabled=""[^>]*data-testid="inbox-inspector-approve"/);
    expect(render(sel, mock(true))).not.toMatch(/<button[^>]*disabled=""[^>]*data-testid="inbox-inspector-approve"/);
  });
  it('13 temporary surfaces are contained overlays (Sheet scrim inside the workspace), never new pages', () => {
    const body = read('src/site00/components/productionAuthority/InboxBody.tsx');
    for (const t of ['inbox-revision-sheet', 'inbox-approve-confirm', 'inbox-filter-sheet', 'inbox-attachment-preview']) expect(body).toContain(`testId="${t}"`);
    const css = strip(read('src/site00/styles/site00-production-inbox-family.css'));
    expect(css).toMatch(/\.pxa \.ibx-scrim \{\s*position: absolute;\s*inset: 0;/);
  });
  it('14 project / entry context stays on every child', () => {
    for (const [lens] of [...CHILDREN, ['messages']] as const) expect(render(inboxHref(lens)), lens).toMatch(/data-testid="inbox-context-line">NDXBOOK · ENTRY 002/);
  });
});

describe('height + width contract (6–10)', () => {
  const ws = strip(read('src/site00/styles/site00-production-inbox-workspace.css'));
  const fam = strip(read('src/site00/styles/site00-production-inbox-family.css'));
  it('6 the route frame is the Production viewport only (frame lock + dvh)', () => {
    expect(fam).toMatch(/\.pxa\[data-screen='inbox'\] \.pxa-scroll\s*\{\s*overflow: hidden;/);
    expect(fam).toMatch(/\.pxa\[data-screen='inbox'\] \.pxa-body\s*\{[^}]*height: 100%/);
    expect(ws).toMatch(/@supports \(height: 100dvh\)[\s\S]*?\.pxa\[data-screen='inbox'\][\s\S]*?height: 100dvh/);
  });
  it('9–10 only the object list, inspector body and thread pane scroll (shared .ibx-pane)', () => {
    expect(fam).toMatch(/\.pxa \.ibx-pane \{[^}]*overflow-y: auto;/);
    for (const [lens, , list] of CHILDREN) expect(render(inboxHref(lens))).toMatch(new RegExp(`class="ibx-pane ibx-lw__rows" data-scroll="internal" data-testid="${list}"`));
    expect(render(inboxHref('messages', { thread: 't1' }))).toMatch(/class="ibx-pane ibx-thread__pane" data-scroll="internal"/);
  });
  it('8 width: row tracks are minmax(0, …), list never scrolls sideways, chips shrink', () => {
    expect(ws).toMatch(/\.pxa \.ibx-orow \{[^}]*grid-template-columns: 44px minmax\(0, 1fr\) minmax\(0, max-content\) 12px;/);
    expect(ws).toMatch(/\.pxa \.ibx-lw__rows \{[^}]*overflow-x: hidden;/);
    expect(ws).toMatch(/\.pxa \.ibx-orow__status \.ibx-chip \{[^}]*text-overflow: ellipsis;/);
  });
  it('three compositions; mobile drawer closed unless an object is selected; body-only, no scaling', () => {
    expect(ws).toMatch(/grid-template-areas: 'rail list insp'/);
    expect(ws).toMatch(/@media \(min-width: 700px\) and \(max-width: 1119px\)[\s\S]*?minmax\(0, 60fr\) minmax\(0, 40fr\)/);
    expect(ws).toMatch(/@media \(max-width: 699px\)[\s\S]*?\.pxa \.ibx-lw:not\(\[data-open\]\) \.ibx-lw__insp \{\s*display: none;/);
    expect(ws + fam).not.toMatch(/\.pxh-|\.ph-top|\.ph-nav|prod-chrome|\.pxa-nav|\.pxa-top|\bzoom\s*:|scale\s*\(/);
  });
  it('stale card presentation is gone (no stats block, big rows, permanent side column)', () => {
    const body = read('src/site00/components/productionAuthority/InboxBody.tsx');
    expect(body).not.toMatch(/ibx-row--watch|ibx-row__side|className="ibx-stats"|ibx-sys__grid|ibx-msgs__grid/);
    expect(fam).not.toMatch(/\.ibx-row--watch|\.ibx-row__side|\.ibx-stats|\.ibx-sys__grid|\.ibx-msgs__grid/);
  });
});

describe('live proof (Chromium, tunnel branch) — 14 viewports × every Inbox route + temporary surface (7–15)', () => {
  type Row = { key: string; fam: string; w: number; h: number; route: string; clicked: string | null; overlay: boolean; overflow: number; docV: number; bodyV: number; docH: number; docMoved: number; panes: { id: string; can: number }[]; navActive: string; navInView: boolean; clipped: string[]; hClip: string[]; hOver: string[]; behindNav: string[]; errs: string[] };
  const rows = JSON.parse(read('artifacts/production-inbox-one-viewport-family-opus1/NO_SCROLL_REPORT.json')) as Row[];
  it('covers every canonical route and the brief viewports', () => {
    const sizes = new Set(rows.map((r) => `${r.w}x${r.h}`));
    for (const s of ['390x844', '393x852', '430x932', '768x1024', '820x1180', '1024x1366', '1440x900', '1680x1050', '1920x1080', '390x664']) expect(sizes.has(s), s).toBe(true);
    const routes = new Set(rows.map((r) => r.route));
    for (const r of ['needs', 'watching', 'resolved', 'all', 'messages', 'system', 'decision-detail', 'message-thread', 'system-notice-detail']) expect(routes.has(r), r).toBe(true);
  });
  it('7–8, 11–12, 15 no page scroll (vertical or horizontal), nothing clipped or behind the nav, INBOX active', () => {
    for (const r of rows) {
      const k = `${r.w}x${r.h} ${r.key}`;
      expect(r.docV, k).toBeLessThanOrEqual(1);
      expect(r.bodyV, k).toBeLessThanOrEqual(1);
      expect(r.docH, k).toBeLessThanOrEqual(1);
      expect(r.docMoved, k).toBe(0);
      expect(r.overflow, k).toBeLessThanOrEqual(1);
      expect(r.clipped, k).toEqual([]);
      expect(r.hClip, k).toEqual([]);
      expect(r.hOver, k).toEqual([]);
      expect(r.behindNav, k).toEqual([]);
      expect(r.errs, k).toEqual([]);
      expect(r.navActive, k).toBe('nav-inbox');
      expect(r.navInView, k).toBe(true);
    }
  });
  it('9 the object list scrolls internally when it outgrows the pane', () => {
    const long = rows.filter((r) => r.panes.some((p) => p.id === 'inbox-all-list' && p.can > 0));
    expect(long.length).toBeGreaterThan(0);
  });
  it('13 every temporary surface opened as an overlay (FILTER / SORT: sheet on mobile + tablet, menu popover on desktop)', () => {
    for (const r of rows.filter((x) => x.key.startsWith('t-') && x.clicked !== 'hidden')) expect(r.overlay, `${r.w}x${r.h} ${r.key}`).toBe(true);
    for (const size of new Set(rows.map((r) => `${r.w}x${r.h}`))) {
      const at = rows.filter((r) => `${r.w}x${r.h}` === size);
      for (const k of ['t-revision', 't-attachment', 't-approve']) expect(at.find((r) => r.key === k)?.overlay, `${size} ${k}`).toBe(true);
      expect(at.some((r) => (r.key === 't-filter' || r.key === 't-menu') && r.overlay), `${size} filter/sort`).toBe(true);
    }
  });
});
