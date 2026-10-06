/**
 * P0.STUDIOOS.PRODUCTION.INBOX.AUTHORITY-FAMILY-CONVERGENCE.OPUS2
 * The Inbox is one family: root NEEDS YOU, five children, three grandchildren and four temporary surfaces, all
 * on /production/queue inside the shared Production host frame. Lifecycle STATE and object TYPE stay separate,
 * decisions keep their gate and data contract, and no primary workspace scrolls the page.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { InboxBody, inboxHref, INBOX_LENSES } from '../src/site00/components/productionAuthority/InboxBody';
import { buildInboxObjects, INBOX_STATES, INBOX_TYPES } from '../src/site00/components/productionAuthority/inboxModel';
import { ProductionAuthorityDataContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import { workspaceTabOf } from '../shared/site00-production-graph/projectScope';
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

function mock(over: { decidable?: boolean } & Partial<Record<string, unknown>> = {}): HubData {
  const { decidable = false, ...rest } = over;
  return {
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
    ...rest,
  } as unknown as HubData;
}
const render = (url: string, data: HubData = mock()) =>
  renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [url] }, createElement(ProductionAuthorityDataContext.Provider, { value: data }, createElement(InboxBody))));
const has = (html: string, id: string) => html.includes(`data-testid="${id}"`);
const DISABLED = (id: string) => new RegExp(`<button[^>]*disabled=""[^>]*data-testid="${id}"`);

const SURFACES: [string, string, string][] = [
  ['1 root NEEDS YOU', '/production/queue', 'inbox-needs-you'],
  ['2 WATCHING', inboxHref('watching'), 'inbox-watching'],
  ['3 RESOLVED', inboxHref('resolved'), 'inbox-resolved'],
  ['4 ALL INBOX', inboxHref('all'), 'inbox-all'],
  ['5 MESSAGES', inboxHref('messages'), 'inbox-messages'],
  ['6 SYSTEM', inboxHref('system'), 'inbox-system'],
  ['7 DECISION DETAIL', inboxHref('needs', { item: 'attn.narrative' }), 'inbox-decision-detail'],
  ['8 MESSAGE THREAD', inboxHref('messages', { thread: 't1' }), 'inbox-message-thread'],
  ['9 SYSTEM NOTICE DETAIL', inboxHref('system', { notice: 'sys.look' }), 'inbox-system-notice'],
];

describe('every Inbox surface mounts on /production/queue (1–9)', () => {
  for (const [name, url, id] of SURFACES) {
    it(name, () => {
      const html = render(url);
      expect(has(html, 'production-queue'), name).toBe(true);
      expect(has(html, id), name).toBe(true);
      expect(url).toMatch(/^\/production\/queue(\?|$)/);
    });
  }
  it('lenses cover root + five children; legacy OPUS1 lenses resolve onto them', () => {
    expect(INBOX_LENSES).toEqual(['needs', 'watching', 'resolved', 'all', 'messages', 'system']);
    expect(render('/production/queue?view=priority')).toContain('data-lens="needs"');
    expect(render('/production/queue?view=approvals')).toContain('data-lens="needs"');
    expect(render('/production/queue?view=direct')).toContain('data-lens="messages"');
  });
});

describe('one parent family (10–14)', () => {
  const page = read('src/site00/pages/production/ProductionQueuePage.tsx');
  it('10 parent shell: every surface renders inside the one Inbox shell (.ibx + shared workspace)', () => {
    for (const [, url] of SURFACES) {
      const html = render(url);
      expect(html).toMatch(/class="ibx"[^>]*data-family-root="inbox"/);
      expect(has(html, 'inbox-workspace')).toBe(true);
    }
  });
  it('11–12 top host + bottom nav come from the shared Production frame (not re-implemented by the Inbox)', () => {
    expect(page).toContain('<ProductionAuthorityFrame screen="inbox">');
    const body = read('src/site00/components/productionAuthority/InboxBody.tsx');
    expect(body).not.toMatch(/ProductionWorkspaceHeader|ProductionWorkspaceNav|ProductionBottomNav|ProductionHostNav|ITEMS NEED YOU/);
    expect(strip(read('src/site00/styles/site00-production-inbox-family.css'))).not.toMatch(/\.pxh-|\.ph-top|\.ph-nav|prod-chrome|production-workspace-header/);
  });
  it('13 INBOX is the active Production tab on the Inbox route', () => {
    // P0 project isolation: the active tab is resolved from the route by workspaceTabOf (/production/queue → INBOX).
    expect(workspaceTabOf('/production/queue')).toBe('INBOX');
    expect(read('src/site00/components/productionHub/chrome.tsx')).toMatch(/tab === 'INBOX'\)\s*\{\s*brand = 'INBOX';\s*active = 'inbox'/);
  });
  it('14 lifecycle tabs: NEEDS YOU · WATCHING · RESOLVED; children under NEEDS YOU keep it active', () => {
    for (const [lens, active] of [
      ['needs', 'needs'],
      ['watching', 'watching'],
      ['resolved', 'resolved'],
      ['all', 'needs'],
      ['messages', 'needs'],
      ['system', 'needs'],
    ] as const) {
      const html = render(inboxHref(lens));
      const tabs = html.slice(html.indexOf('data-testid="inbox-tabs"'), html.indexOf('</nav>', html.indexOf('data-testid="inbox-tabs"')));
      expect(tabs.match(/>(NEEDS YOU|WATCHING|RESOLVED)</g)).toEqual(['>NEEDS YOU<', '>WATCHING<', '>RESOLVED<']);
      expect(tabs).toMatch(new RegExp(`class="is-active"[^>]*data-testid="inbox-tab-${active}"`));
    }
  });
});

describe('15 object TYPE and lifecycle STATE stay separate', () => {
  const objs = buildInboxObjects(mock(), [
    { id: 'r1', projectSlug: 'ndxbook', kind: 'DESIGN_REVISION', targetWorkspace: 'DESIGN', targetSubWorkspace: null, createdAt: '2026-10-02T00:00:00Z', note: null, status: 'QUEUED' },
    { id: 'r2', projectSlug: 'ndxbook', kind: 'DESIGN_REVISION', targetWorkspace: 'DESIGN', targetSubWorkspace: null, createdAt: '2026-10-02T00:00:00Z', note: null, status: 'AWAITING_APPROVAL' },
  ]);
  it('every object has exactly one type and one state from the canonical sets', () => {
    for (const o of objs) {
      expect(INBOX_TYPES).toContain(o.type);
      expect(INBOX_STATES).toContain(o.state);
    }
  });
  it('the same TYPE appears in different STATES (a decision can be needs-you, watching or resolved)', () => {
    const decisionStates = new Set(objs.filter((o) => o.type === 'DECISION').map((o) => o.state));
    expect([...decisionStates].sort()).toEqual(['NEEDS_YOU', 'RESOLVED', 'WATCHING']);
    const systemStates = new Set(objs.filter((o) => o.type === 'SYSTEM').map((o) => o.state));
    expect(systemStates.size).toBeGreaterThan(1);
  });
  it('ALL INBOX shows type and state as separate columns', () => {
    const html = render(inboxHref('all'));
    expect(html).toMatch(/class="ibx-row__type"/);
    expect(html).toMatch(/class="ibx-row__state"/);
  });
  it('no message objects are fabricated (no messaging source exists)', () => {
    expect(objs.some((o) => o.type === 'MESSAGE')).toBe(false);
    const msgs = render(inboxHref('messages'));
    expect(msgs).toContain('data-state="UNMOUNTED"');
    expect(msgs).not.toMatch(/ETTA VALE|MARCO SILVA|IONA WELLS|JANE DOE/i);
  });
});

describe('viewport contract (16–17)', () => {
  const css = strip(read('src/site00/styles/site00-production-inbox-family.css'));
  it('16 the Inbox locks its workspace to the frame: no page-body scroll by construction', () => {
    expect(css).toMatch(/\.pxa\[data-screen='inbox'\] \.pxa-scroll\s*\{\s*overflow: hidden;/);
    expect(css).toMatch(/\.pxa\[data-screen='inbox'\] \.pxa-body\s*\{[^}]*height: 100%/);
    expect(css).toMatch(/\.pxa \.ibx \{[^}]*grid-template-rows: auto minmax\(0, 1fr\);[^}]*height: 100%;[^}]*overflow: hidden;/);
    expect(css).toMatch(/\.pxa \.ibx-view \{[^}]*height: 100%;[^}]*overflow: hidden;/);
  });
  it('16 live browser proof: every route fits at every target viewport (no page scroll, nothing clipped)', () => {
    const f = path.join(root, 'artifacts/production-inbox-authority-opus2/NO_SCROLL_REPORT.json');
    expect(existsSync(f)).toBe(true);
    const rows = JSON.parse(readFileSync(f, 'utf8')) as { fam: string; id: string; pageScroll: boolean; docScroll: boolean; clipped: string[]; below: string[]; errs: string[] }[];
    expect(rows.length).toBe(45);
    for (const r of rows) {
      expect(r.pageScroll, `${r.fam} ${r.id}`).toBe(false);
      expect(r.docScroll, `${r.fam} ${r.id}`).toBe(false);
      expect(r.clipped, `${r.fam} ${r.id}`).toEqual([]);
      expect(r.below, `${r.fam} ${r.id}`).toEqual([]);
      expect(r.errs, `${r.fam} ${r.id}`).toEqual([]);
    }
  });
  it('17 message panes (and list / tab panes) may scroll internally', () => {
    expect(css).toMatch(/\.pxa \.ibx-pane \{[^}]*overflow-y: auto;/);
    expect(has(render(inboxHref('messages')), 'inbox-thread-pane')).toBe(true);
    expect(render(inboxHref('messages', { thread: 't1' }))).toMatch(/class="ibx-pane ibx-thread__pane" data-scroll="internal"/);
  });
  it('no zoom / transform scale in the Inbox sheet', () => {
    expect(css).not.toMatch(/\bzoom\s*:|scale\s*\(/);
  });
});

describe('function preserved (18–20)', () => {
  it('18 approval stays gated: disabled unless the founder gate is decidable for this object', () => {
    const detail = inboxHref('needs', { item: 'attn.narrative' });
    expect(render('/production/queue', mock({ decidable: false }))).toMatch(DISABLED('inbox-approve'));
    expect(render(detail, mock({ decidable: false }))).toMatch(DISABLED('inbox-approve'));
    expect(render(detail, mock({ decidable: true }))).not.toMatch(DISABLED('inbox-approve'));
    expect(render(inboxHref('needs', { item: 'attn.cast' }), mock({ decidable: true }))).toMatch(DISABLED('inbox-approve'));
  });
  it('18 approval goes through a compact confirmation, then the unchanged decideStoryboard call', () => {
    const body = read('src/site00/components/productionAuthority/InboxBody.tsx');
    expect(body).toContain('approve: (o: InboxObject) => setConfirm(o)');
    expect(body).toContain("await decide('APPROVE', '')");
    expect(body).toContain('data.decideStoryboard(decision, text)');
  });
  it('19 REQUEST REVISION is a contained temporary surface that sends the note through the same action', () => {
    const body = read('src/site00/components/productionAuthority/InboxBody.tsx');
    expect(body).toContain('testId="inbox-revision-sheet"');
    expect(body).toContain("await decide('REVISE', t)");
    for (const url of ['/production/queue', inboxHref('needs', { item: 'attn.narrative' })]) expect(has(render(url), 'inbox-revise')).toBe(true);
    const css = strip(read('src/site00/styles/site00-production-inbox-family.css'));
    expect(css).toMatch(/\.pxa \.ibx-scrim \{\s*position: absolute;\s*inset: 0;/);
  });
  it('20 data contracts unchanged: same hooks, same sources, no new API calls', () => {
    const body = read('src/site00/components/productionAuthority/InboxBody.tsx');
    const model = read('src/site00/components/productionAuthority/inboxModel.ts');
    expect(body).toContain('useProductionAuthorityData()');
    expect(body).toContain('useProductionRequests()');
    expect(body + model).not.toMatch(/apiFetch|fetch\(|supabase|localStorage/);
    expect(read('src/site00/state/productionRequestStore.ts')).toContain("status: 'QUEUED' | 'IN_PROGRESS' | 'AWAITING_APPROVAL' | 'COMPLETE'");
  });
  it('unconnected actions are disabled honestly, not faked', () => {
    expect(render(inboxHref('watching'))).toMatch(DISABLED('inbox-stop-watching'));
    const notice = render(inboxHref('system', { notice: 'sys.look' }));
    for (const a of ['retry', 'assign', 'escalate', 'acknowledge']) expect(notice).toMatch(DISABLED(`inbox-notice-${a}`));
    expect(render(inboxHref('messages', { thread: 't1' }))).toMatch(DISABLED('inbox-create-decision'));
  });
});
