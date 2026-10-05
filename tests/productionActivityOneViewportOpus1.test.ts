/**
 * P0.STUDIOOS.PRODUCTION.ACTIVITY.ONE-VIEWPORT-CONVERGENCE.OPUS1 — ACTIVITY as living project memory.
 * Canonical DOMAIN × TIME filters (the OPUS1 lens taxonomy is gone as a primary control), timeline → inspector with
 * lineage / AFFECTS / DOWNSTREAM / source, project context, and a one-viewport height contract proven live in Chromium.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ActivityBody, activityHref, readActivityQuery } from '../src/site00/components/productionAuthority/ActivityBody';
import { ACTIVITY_DOMAINS, ACTIVITY_RANGES, buildActivityMemory } from '../src/site00/components/productionAuthority/activityLog';
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
const hub = (activity: unknown[] = []): HubData =>
  ({
    project: { projectId: 'ndxbook', name: 'NDXBOOK' },
    production: { productionId: 'entry-002', label: 'ENTRY 002', subtitle: '' },
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
      blockers: ['NARRATIVE: awaiting founder approval', 'CAST: upstream narrative not complete'],
      founderGate: { open: true, nodeId: 'narrative', headline: 'NARRATIVE APPROVAL', detail: '', decidableInHub: false },
      operation: { label: 'NARRATIVE' },
    },
    attention: [],
    activity,
    cast: { characters: [], looks: [] },
    scenes: [],
    frames: [],
    assetUrl: () => null,
  }) as unknown as HubData;
const DAY = 86_400_000;
const RECORDED = [
  { id: 'r1', category: 'APPROVAL', title: 'STORYBOARD REVISION REQUESTED', detail: 'NDXBOOK · ENTRY 002', at: new Date(Date.now() - 2 * 3600_000).toISOString(), actor: 'FOUNDER', assetSlotId: null },
  { id: 'r2', category: 'CASTING', title: 'CAST LOCKED · NDX', detail: 'ENTRY 002', at: new Date(Date.now() - 20 * DAY).toISOString(), actor: 'FOUNDER', assetSlotId: null },
];
const render = (url: string, data: HubData = hub(RECORDED)) =>
  renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [url] }, createElement(ProductionAuthorityDataContext.Provider, { value: data }, createElement(ActivityBody))));
const has = (html: string, id: string) => html.includes(`data-testid="${id}"`);
const texts = (html: string, nav: string) => {
  const s = html.slice(html.indexOf(`data-testid="${nav}"`), html.indexOf('</nav>', html.indexOf(`data-testid="${nav}"`)));
  return [...s.matchAll(/<a [^>]*><span>([^<]+)<\/span>/g)].map((m) => m[1]);
};

describe('canonical Activity model', () => {
  const html = render('/production/activity');
  it('DOMAIN filters are ALL · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · PEOPLE · SYSTEM', () => {
    expect(ACTIVITY_DOMAINS).toEqual(['ALL', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'PEOPLE', 'SYSTEM']);
    expect(texts(html, 'activity-domains')).toEqual([...ACTIVITY_DOMAINS]);
  });
  it('TIME filters are TODAY · THIS WEEK · THIS MONTH · FULL HISTORY (TODAY default)', () => {
    expect(ACTIVITY_RANGES.map((r) => r.label)).toEqual(['TODAY', 'THIS WEEK', 'THIS MONTH', 'FULL HISTORY']);
    expect(texts(html, 'activity-ranges')).toEqual(['TODAY', 'THIS WEEK', 'THIS MONTH', 'FULL HISTORY']);
    expect(html).toContain('data-domain="ALL" data-range="today"');
  });
  it('the stale OPUS1 taxonomy and presentation are not primary (no lens bar, hero, KPI stats, stacked FEED / MILESTONES / ATTENTION)', () => {
    for (const id of ['activity-lenses', 'activity-hero', 'activity-stats', 'activity-feed', 'activity-milestones', 'activity-attention', 'activity-search'])
      expect(has(html, id), id).toBe(false);
    for (const nav of ['activity-domains', 'activity-ranges']) for (const t of texts(html, nav)) expect(['APPROVALS', 'UPDATES', 'COMMENTS', 'BLOCKERS']).not.toContain(t);
    const src = read('src/site00/components/productionAuthority/ActivityBody.tsx');
    expect(src).not.toMatch(/ACTIVITY_LENSES|IaHero|IaLensBar|IaStats|IaPanel|from '\.\/iaKit'/);
  });
  it('old taxonomy survives only as a secondary CHANGE filter + legacy links', () => {
    expect(has(html, 'activity-change-select')).toBe(true);
    expect(readActivityQuery(new URLSearchParams('view=blockers')).verb).toBe('BLOCKED');
    expect(readActivityQuery(new URLSearchParams('view=approvals')).verb).toBe('APPROVED');
    expect(readActivityQuery(new URLSearchParams('view=blockers')).range).toBe('all');
    expect(activityHref({ domain: 'PEOPLE', range: 'week' })).toBe('/production/activity?domain=people&range=week');
    expect(activityHref({})).toBe('/production/activity');
  });
  it('domain + time filter the timeline', () => {
    const people = render(activityHref({ domain: 'PEOPLE', range: 'all' }));
    const domains = [...people.matchAll(/data-testid="activity-event" data-verb="[A-Z]+" data-domain="([A-Z]+)"/g)].map((m) => m[1]);
    expect(domains.length).toBeGreaterThan(0);
    expect(new Set(domains)).toEqual(new Set(['PEOPLE']));
    const today = (render('/production/activity').match(/data-testid="activity-event"/g) ?? []).length;
    const all = (render(activityHref({ range: 'all' })).match(/data-testid="activity-event"/g) ?? []).length;
    expect(all).toBeGreaterThan(today);
  });
});

describe('event metadata, inspector and lineage', () => {
  const events = buildActivityMemory(hub(RECORDED));
  it('every event carries timestamp-or-live, BY, project, entry, area/domain, source', () => {
    for (const e of events) {
      expect(e.at || e.live || e.source === 'CANONICAL', e.id).toBeTruthy();
      expect(e.by, e.id).toBeTruthy();
      expect(e.project, e.id).toBe('NDXBOOK');
      expect(ACTIVITY_DOMAINS).toContain(e.domain);
      expect(['RECORDED', 'REQUEST', 'GRAPH', 'CANONICAL']).toContain(e.source);
    }
  });
  it('blocked graph state carries prior → result, AFFECTS and DOWNSTREAM', () => {
    const blocked = events.find((e) => e.verb === 'BLOCKED' && e.nodeId === 'narrative')!;
    expect(blocked.live).toBe(true);
    expect(blocked.result).toBe('BLOCKED');
    expect(blocked.affects).toContain('CAST');
    expect(blocked.downstream.length).toBeGreaterThan(0);
  });
  it('inspector shows the full fact sheet, lineage and the source link; selected event opens it', () => {
    const blocked = events.find((e) => e.verb === 'BLOCKED' && e.nodeId === 'cast')!;
    const html = render(activityHref({ range: 'all', event: blocked.id }));
    expect(html).toContain('data-open="event"');
    expect(html).toMatch(/data-testid="activity-inspector" data-state="selected"/);
    const insp = html.slice(html.indexOf('data-testid="activity-inspector"'));
    for (const k of ['WHEN', 'BY', 'PROJECT', 'ENTRY', 'AREA', 'STATE', 'AFFECTS', 'DOWNSTREAM']) expect(insp).toContain(`<dt>${k}</dt>`);
    expect(has(insp, 'activity-lineage')).toBe(true);
    expect(insp).toContain('BEFORE · CAUSED BY');
    expect(insp).toContain('AFTER · LED TO');
    expect(insp).toMatch(/data-testid="activity-open-source"[^>]*>|href="\/production\/ndxbook\/expression[^"]*"[^>]*data-testid="activity-open-source"/);
    expect(has(insp, 'activity-inspector-close')).toBe(true);
    expect(has(html, 'activity-inspector-scrim')).toBe(true);
  });
  it('without a selection tablet / desktop still show a default inspector (first event); drawer stays closed', () => {
    const html = render('/production/activity');
    expect(html).toMatch(/data-testid="activity-inspector" data-state="default"/);
    expect(html).not.toContain('data-open=');
    expect(has(html, 'activity-inspector-scrim')).toBe(false);
  });
  it('project context: project + entry in the header', () => {
    const html = render('/production/activity');
    expect(html).toMatch(/LIVING PROJECT MEMORY · NDXBOOK[\s\S]{0,20}ENTRY 002/);
  });
  it('honest empty state offers wider time ranges', () => {
    const html = render(activityHref({ domain: 'LIBRARY' }));
    expect(has(html, 'activity-empty')).toBe(true);
  });
});

describe('one-viewport height contract (CSS)', () => {
  const css = strip(read('src/site00/styles/site00-production-activity-memory.css'));
  it('frame scroll pane is locked and the body fills it (activity-scoped)', () => {
    expect(css).toMatch(/\.pxa\[data-screen='activity'\] \.pxa-scroll \{\s*overflow: hidden;/);
    expect(css).toMatch(/\.pxa\[data-screen='activity'\] \.pxa-body \{\s*height: 100%;\s*min-height: 0;\s*padding: 0;/);
    expect(css).toMatch(/@supports \(height: 100dvh\)[\s\S]*?height: 100dvh/);
  });
  it('workspace is a contained grid; only the timeline list and inspector body scroll', () => {
    expect(css).toMatch(/\.pxa \.amx \{[^}]*height: 100%;[^}]*overflow: hidden;/);
    const scrollers = [...css.matchAll(/([^{}]+)\{[^}]*overflow-y: auto/g)].map((m) => m[1]!.trim());
    expect(scrollers).toEqual(['.pxa .amx-events', '.pxa .amx-insp__scroll']);
  });
  it('three independent compositions, body-only, no zoom / scale', () => {
    expect(css).toMatch(/grid-template-areas: 'rail timeline inspector'/);
    expect(css).toMatch(/@media \(min-width: 700px\) and \(max-width: 1119px\)[\s\S]*?minmax\(0, 62fr\) minmax\(0, 38fr\)/);
    expect(css).toMatch(/@media \(max-width: 699px\)[\s\S]*?\.pxa \.amx:not\(\[data-open\]\) \.amx-inspector \{\s*display: none;/);
    expect(css).not.toMatch(/\.pxh-|\.ph-top|\.ph-nav|prod-chrome|\.pxa-nav|\.pxa-top|\bzoom\s*:|scale\s*\(/);
  });
  it('OPUS1 kit + stylesheet are retired (Inbox keeps the icons only)', () => {
    expect(() => read('src/site00/styles/site00-production-inbox-activity.css')).toThrow();
    expect(read('src/site00/components/productionAuthority/iaKit.tsx')).not.toMatch(/export function Ia(Hero|LensBar|Stats|Panel|Chip|Empty)/);
  });
});

describe('live proof (Chromium, tunnel branch) — 14 viewports × 5 states', () => {
  type Row = { key: string; fam: string; w: number; h: number; overflow: number; docOverflow: number; docMoved: number; tlScroll: { can: number; moved: number } | null; inspState: string; inspVisible: boolean; navActive: string; navInView: boolean; domains: string[]; ranges: string[]; clipped: string[]; hOver: string[]; errs: string[] };
  const rows = JSON.parse(read('artifacts/production-activity-one-viewport-opus1/NO_SCROLL_REPORT.json')) as Row[];
  it('covers the brief viewports', () => {
    const sizes = new Set(rows.map((r) => `${r.w}x${r.h}`));
    for (const s of ['390x844', '393x852', '430x932', '768x1024', '820x1180', '1024x1366', '1440x900', '1680x1050', '1920x1080', '360x640', '1024x768', '1440x810', '1280x720', '390x664'])
      expect(sizes.has(s), s).toBe(true);
    expect(rows.length).toBeGreaterThanOrEqual(70);
  });
  it('no document scroll, no frame scroll, nothing clipped or off-screen; nav visible with ACTIVITY active', () => {
    for (const r of rows) {
      const k = `${r.w}x${r.h} ${r.key}`;
      expect(r.docOverflow, k).toBeLessThanOrEqual(1);
      expect(r.docMoved, k).toBe(0);
      expect(r.overflow, k).toBeLessThanOrEqual(1);
      expect(r.clipped, k).toEqual([]);
      expect(r.hOver, k).toEqual([]);
      expect(r.errs, k).toEqual([]);
      expect(r.navActive, k).toBe('nav-activity');
      expect(r.navInView, k).toBe(true);
      expect(r.domains, k).toEqual([...ACTIVITY_DOMAINS]);
      expect(r.ranges, k).toEqual(['TODAY', 'THIS WEEK', 'THIS MONTH', 'FULL HISTORY']);
    }
  });
  it('the timeline scrolls internally when history exceeds the pane', () => {
    const long = rows.filter((r) => r.key === 'full-history' && r.tlScroll && r.tlScroll.can > 0);
    expect(long.length).toBeGreaterThanOrEqual(8);
    for (const r of long) expect(r.tlScroll!.moved, `${r.w}x${r.h}`).toBeGreaterThan(0);
  });
  it('inspector: visible on tablet / desktop by default; mobile drawer only when an event is open', () => {
    for (const r of rows) {
      const k = `${r.w}x${r.h} ${r.key}`;
      if (r.w >= 700) expect(r.inspVisible, k).toBe(true);
      else expect(r.inspVisible, k).toBe(r.key === 'event');
    }
  });
});
