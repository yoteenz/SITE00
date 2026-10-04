/**
 * P0.PRODUCTION.INBOX-ACTIVITY.AUTHORITY-CONVERGENCE2
 * INBOX keeps the OPUS2 model / routing / gate and recomposes the NEEDS YOU root to the newest authority
 * (selected decision surface · INCOMING DECISION OBJECTS · BLOCKERS & APPROVALS · RECENTLY RESOLVED).
 * ACTIVITY becomes the ACTIVITY LOG family: HUB project band → domain + range tabs → lineage timeline of
 * CREATED … DEPLOYED events with version / actor / downstream / cause. Both stay in the shared frame, no page scroll.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { compileEntry002RetroactiveNarrativeMomentum } from '../shared/site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';
import { buildEntry002ProductionCastState } from '../shared/site00-studio-world/acting-catalogue/index.js';
import { ActivityBody, activityHref, readLogQuery } from '../src/site00/components/productionAuthority/ActivityBody';
import { ACTIVITY_DOMAINS, ACTIVITY_RANGES, ACTIVITY_VERBS, buildActivityLog, causeChain, effectsOf, inRange } from '../src/site00/components/productionAuthority/activityLog';
import { InboxBody, inboxHref } from '../src/site00/components/productionAuthority/InboxBody';
import { ProductionAuthorityDataContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import type { HubData } from '../src/site00/components/productionHub/useProductionHubData';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const ART = 'artifacts/production-inbox-activity-convergence2';

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
const plan = compileEntry002RetroactiveNarrativeMomentum();
const cast = buildEntry002ProductionCastState();

function hub(over: { decidable?: boolean } = {}): HubData {
  return {
    project: { projectId: 'ndxbook', name: 'NDXBOOK' },
    production: { productionId: 'entry-002', label: 'ENTRY 002', subtitle: 'OH, NOW IT WAS FUN?' },
    hasProduction: true,
    loading: false,
    deciding: false,
    decideStoryboard: async () => ({ ok: true }),
    plan,
    cast,
    graph: {
      nodes: NODES,
      byId: Object.fromEntries(NODES.map((n) => [n.id, n])),
      activeNodeId: 'narrative',
      progressPercent: 0,
      completeCount: 0,
      blockers: ['NARRATIVE: awaiting founder approval', 'CAST: upstream narrative not complete', 'LOOK: upstream cast not complete'],
      founderGate: { open: true, nodeId: 'narrative', headline: 'NARRATIVE APPROVAL', detail: 'gate detail', actionLabel: 'REVIEW', decidableInHub: !!over.decidable },
      operation: { label: 'NARRATIVE' },
      nextStage: 'cast',
    },
    attention: [
      { id: 'attn.narrative', kind: 'NARRATIVE', title: 'NARRATIVE APPROVAL', subtitle: 'ENTRY 002', stateLabel: 'AWAITING DECISION', actionLabel: 'REVIEW', priority: 'HIGH', nodeId: 'narrative', sceneId: null, assetSlotId: null, why: 'Narrative awaiting founder approval.' },
      { id: 'attn.cast', kind: 'CASTING', title: 'CASTING DECISION', subtitle: 'ENTRY 002', stateLabel: 'AWAITING DECISION', actionLabel: 'REVIEW', priority: 'NORMAL', nodeId: 'cast', sceneId: null, assetSlotId: null, why: 'Upstream narrative not complete.' },
    ],
    activity: [{ id: 'r1', category: 'APPROVAL', title: 'STORYBOARD REVISION REQUESTED', detail: 'NDXBOOK · ENTRY 002', at: new Date(Date.now() - 2 * 86400_000).toISOString(), actor: 'FOUNDER', assetSlotId: null }],
    scenes: [],
    frames: [],
    storyboardVersion: null,
    assetUrl: () => null,
  } as unknown as HubData;
}
const render = (Body: () => unknown, url: string, data: HubData = hub()) =>
  renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [url] }, createElement(ProductionAuthorityDataContext.Provider, { value: data }, createElement(Body as never))));
const has = (html: string, id: string) => html.includes(`data-testid="${id}"`);
const count = (html: string, id: string) => (html.match(new RegExp(`data-testid="${id}"`, 'g')) ?? []).length;

describe('INBOX · NEEDS YOU recomposed to the newest authority (model, routing, gate unchanged)', () => {
  const html = render(InboxBody, '/production/queue');
  it('selected decision surface: art · SOURCE / AREA / REQUEST / BLOCKS / BY · urgency · REVIEW → APPROVE → REQUEST REVISION', () => {
    const card = html.slice(html.indexOf('data-testid="inbox-focus"'), html.indexOf('</article>', html.indexOf('data-testid="inbox-focus"')));
    const keys = [...card.matchAll(/<dt>([A-Z]+)<\/dt>/g)].map((m) => m[1]);
    expect(keys).toEqual(['SOURCE', 'AREA', 'REQUEST', 'BLOCKS', 'BY']);
    expect(card).toContain('data-testid="inbox-focus-urgency"');
    expect(card).toContain('URGENCY: HIGH');
    const order = ['inbox-review', 'inbox-approve', 'inbox-revise'].map((id) => card.indexOf(`data-testid="${id}"`));
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(card).not.toMatch(/>TYPE</);
  });
  it('INCOMING DECISION OBJECTS sits beside BLOCKERS & APPROVALS (two live counts), then RECENTLY RESOLVED', () => {
    expect(html).toContain('INCOMING DECISION OBJECTS');
    expect(html).toContain('BLOCKERS &amp; APPROVALS');
    expect(count(html, 'inbox-attention-blockers')).toBe(1);
    expect(count(html, 'inbox-attention-approvals')).toBe(1);
    expect(html).toMatch(/data-testid="inbox-attention-blockers"[^>]*><b>03<\/b>/);
    expect(has(html, 'inbox-attention-messages')).toBe(false);
    expect(html.indexOf('data-testid="inbox-incoming"')).toBeLessThan(html.indexOf('data-testid="inbox-attention"'));
    expect(html.indexOf('data-testid="inbox-attention"')).toBeLessThan(html.indexOf('data-testid="inbox-resolved-rail"'));
  });
  it('nothing resolved → honest empty strip, never filler art', () => {
    const empty = render(InboxBody, '/production/queue', { ...hub(), activity: [] } as unknown as HubData);
    expect(has(empty, 'inbox-resolved-empty')).toBe(true);
    expect(empty).toContain('NOTHING RESOLVED YET');
    expect(has(html, 'inbox-resolved-empty')).toBe(false);
  });
  it('approve stays gated by the founder gate (same action, same gate as OPUS2)', () => {
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*data-testid="inbox-approve"/);
    expect(has(html, 'inbox-focus-gate')).toBe(true);
    expect(render(InboxBody, '/production/queue', hub({ decidable: true }))).not.toMatch(/<button[^>]*disabled=""[^>]*data-testid="inbox-approve"/);
  });
  it('NEEDS YOU / WATCHING / RESOLVED semantics and routes unchanged', () => {
    for (const [lens, tab] of [['needs', 'needs'], ['watching', 'watching'], ['resolved', 'resolved']] as const) {
      const h = render(InboxBody, inboxHref(lens));
      expect(h).toMatch(new RegExp(`class="is-active"[^>]*data-testid="inbox-tab-${tab}"`));
    }
    expect(inboxHref('needs')).toBe('/production/queue');
    expect(render(InboxBody, '/production/queue?view=approvals')).toContain('data-lens="needs"');
  });
  it('blockers count deep-links into the ACTIVITY LOG blocked view', () => {
    expect(html).toContain('href="/production/activity?verb=blocked"');
  });
});

describe('ACTIVITY LOG vocabulary', () => {
  it('domains, ranges and the twelve event verbs match the authority brief', () => {
    expect([...ACTIVITY_DOMAINS]).toEqual(['ALL', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'PEOPLE', 'SYSTEM']);
    expect(ACTIVITY_RANGES.map((r) => r.label)).toEqual(['TODAY', 'THIS WEEK', 'THIS MONTH', 'FULL HISTORY']);
    expect([...ACTIVITY_VERBS]).toEqual(['CREATED', 'UPDATED', 'APPROVED', 'REVISED', 'SUPERSEDED', 'GENERATED', 'CAST', 'PUBLISHED', 'UNLOCKED', 'BLOCKED', 'RESOLVED', 'DEPLOYED']);
  });
});

describe('ACTIVITY LOG model — live + canonical events with lineage', () => {
  const data = hub();
  const log = buildActivityLog(data);
  it('every graph blocker is a live BLOCKED event (same count the status strip shows)', () => {
    const blocked = log.filter((e) => e.verb === 'BLOCKED');
    expect(blocked).toHaveLength(data.graph.blockers.length);
    expect(blocked.every((e) => e.live && e.source === 'GRAPH')).toBe(true);
  });
  it('canonical records: entry CREATED, narrative GENERATED with its version, one CAST per cast character', () => {
    expect(log.find((e) => e.id === 'evt.entry.created')?.verb).toBe('CREATED');
    expect(log.find((e) => e.id === 'evt.narrative.generated')?.version).toBe(`Version ${plan.version}`);
    expect(log.filter((e) => e.verb === 'CAST')).toHaveLength(cast.characters.filter((c) => c.actorId).length);
    expect(log.filter((e) => e.verb === 'CAST').every((e) => e.domain === 'PEOPLE')).toBe(true);
  });
  it('recorded activity maps to verbs by meaning (a revision request is REVISED)', () => {
    expect(log.find((e) => e.id === 'evt.rec.r1')?.verb).toBe('REVISED');
  });
  it('lineage: CAST was caused by the narrative; the narrative led to the casts; blocked chains follow the graph', () => {
    const c = log.find((e) => e.verb === 'CAST')!;
    expect(c.causeId).toBe('evt.narrative.generated');
    expect(effectsOf(log, 'evt.narrative.generated').some((e) => e.verb === 'CAST')).toBe(true);
    expect(causeChain(log, c).map((e) => e.id)).toEqual(['evt.narrative.generated', 'evt.entry.created']);
    expect(log.find((e) => e.id === 'evt.graph.blocked.look')?.causeId).toBe('evt.graph.blocked.cast');
  });
  it('ranges: live state is TODAY, canonical records from days ago are THIS WEEK, undated only in FULL HISTORY', () => {
    const live = log.find((e) => e.live)!;
    expect(inRange(live, 'today')).toBe(true);
    const old = { ...live, live: false, at: new Date(Date.now() - 5 * 86400_000).toISOString() };
    expect(inRange(old, 'today')).toBe(false);
    expect(inRange(old, 'week')).toBe(true);
    expect(inRange({ ...live, live: false, at: null }, 'month')).toBe(false);
    expect(inRange({ ...live, live: false, at: null }, 'all')).toBe(true);
  });
});

describe('ACTIVITY LOG page', () => {
  const html = render(ActivityBody, '/production/activity');
  it('HUB project band (hero + live status) → ACTIVITY LOG with domain + range tabs', () => {
    for (const id of ['authority-activity', 'authority-hero', 'authority-status-bar', 'activity-log', 'activity-domains', 'activity-ranges']) expect(has(html, id), id).toBe(true);
    expect(html).toContain('>ACTIVITY LOG<');
    for (const d of ACTIVITY_DOMAINS) expect(html).toContain(`data-testid="activity-domain-${d.toLowerCase()}"`);
    for (const r of ACTIVITY_RANGES) expect(html).toContain(`data-testid="activity-range-${r.id}"`);
    expect(html).toMatch(/class="is-active"[^>]*data-testid="activity-domain-all"/);
    expect(html).toMatch(/class="is-active"[^>]*data-testid="activity-range-today"/);
  });
  it('each event shows VERB · subject · actor · downstream/cause on a timeline', () => {
    expect(count(html, 'activity-event')).toBeGreaterThan(0);
    const first = html.slice(html.indexOf('data-testid="activity-event"'), html.indexOf('</li>', html.indexOf('data-testid="activity-event"')));
    expect(first).toMatch(/data-testid="activity-verb">(CREATED|UPDATED|APPROVED|REVISED|SUPERSEDED|GENERATED|CAST|PUBLISHED|UNLOCKED|BLOCKED|RESOLVED|DEPLOYED)</);
    expect(first).toContain('By: ');
  });
  it('domain + range filters are real (PEOPLE this week shows only CAST events; FULL HISTORY includes undated)', () => {
    const people = render(ActivityBody, activityHref({ domain: 'PEOPLE', range: 'all' }));
    const domains = [...people.matchAll(/data-testid="activity-event"|data-domain="([A-Z]+)" data-source/g)].map((m) => m[1]).filter(Boolean);
    expect(domains.length).toBeGreaterThan(0);
    expect(new Set(domains)).toEqual(new Set(['PEOPLE']));
    expect(count(render(ActivityBody, activityHref({ range: 'all' })), 'activity-event')).toBeGreaterThan(count(html, 'activity-event'));
  });
  it('opening an event reveals its lineage (caused by / led to)', () => {
    const open = render(ActivityBody, activityHref({ range: 'all', event: 'evt.narrative.generated' }));
    expect(has(open, 'activity-lineage')).toBe(true);
    expect(open).toContain('CAUSED BY');
    expect(open).toContain('LED TO');
    expect(open).toMatch(/CAST · /);
  });
  it('verb / milestone deep links narrow the log and show a removable filter', () => {
    const q = readLogQuery(new URLSearchParams('verb=blocked&milestone=cast'), IDS as unknown as string[]);
    expect(q).toMatchObject({ verb: 'BLOCKED', milestone: 'cast', range: 'today', domain: 'ALL' });
    const blocked = render(ActivityBody, '/production/activity?verb=blocked');
    expect(has(blocked, 'activity-filter-verb')).toBe(true);
    expect(blocked).not.toMatch(/data-verb="(?!BLOCKED)[A-Z]+" data-domain/);
  });
  it('not a generic analytics dashboard: no stat cards, no search, no milestone/feed columns', () => {
    expect(html).not.toMatch(/activity-stats|activity-feed|activity-milestones|type="search"/);
  });
});

describe('shell preserved', () => {
  it('both pages mount in ProductionAuthorityFrame (top panel + seven-item bottom nav untouched)', () => {
    expect(read('src/site00/pages/production/ProductionActivityPage.tsx')).toContain('<ProductionAuthorityFrame screen="activity">');
    expect(read('src/site00/pages/production/ProductionQueuePage.tsx')).toContain('<ProductionAuthorityFrame screen="inbox">');
    const nav = read('src/site00/components/productionHub/nav.tsx');
    expect(['01_HUB', '02_INBOX', '03_DESIGN', '04_EXPERIENCE', '05_EXPRESSION', '06_LIBRARY', '07_ACTIVITY'].every((f) => nav.includes(`bottom-nav/${f}.png`))).toBe(true);
  });
  it('styles are body-only: no host chrome selectors, no zoom / scale', () => {
    for (const f of ['site00-production-activity-log.css', 'site00-production-inbox-family.css']) {
      const css = strip(read(`src/site00/styles/${f}`));
      expect(css, f).not.toMatch(/\.pxh-|\.ph-top|\.ph-nav|prod-chrome|\bzoom\s*:|scale\s*\(/);
    }
  });
  it('the OPUS1 activity kit and its stylesheet are retired (no legacy body restore)', () => {
    expect(read('src/site00/components/productionAuthority/iaKit.tsx')).not.toMatch(/export function Ia(Hero|LensBar|Stats|Panel|Chip|Empty)/);
    expect(() => read('src/site00/styles/site00-production-inbox-activity.css')).toThrow();
  });
});

describe('live proof (Chromium, 3 viewports + short variants)', () => {
  it('Inbox root/children and Activity fit with no page or frame scroll, nothing clipped, correct nav active', () => {
    const rows = JSON.parse(read(`${ART}/NO_SCROLL_REPORT.json`)) as { key: string; fam: string; overflow: number; docOverflow: number; navActive: string; errs: string[]; clipped: string[] }[];
    expect(rows.length).toBeGreaterThanOrEqual(30);
    for (const r of rows) {
      expect(r.overflow, `${r.fam} ${r.key}`).toBeLessThanOrEqual(1);
      expect(r.docOverflow, `${r.fam} ${r.key}`).toBeLessThanOrEqual(1);
      expect(r.errs, `${r.fam} ${r.key}`).toEqual([]);
      expect(r.clipped, `${r.fam} ${r.key}`).toEqual([]);
      expect(r.navActive, `${r.fam} ${r.key}`).toBe(r.key.startsWith('inbox') ? 'nav-inbox' : 'nav-activity');
    }
  });
});
