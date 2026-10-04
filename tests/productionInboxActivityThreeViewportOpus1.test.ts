/**
 * P0.STUDIOOS.PRODUCTION.INBOX-ACTIVITY.THREE-VIEWPORT-RECONSTRUCTION.OPUS1
 * INBOX + ACTIVITY mount every reference lens and grandchild from live Production data on their existing
 * routes, decisions stay behind the founder gate, unmounted surfaces are honest, Publish is not invented,
 * and the body styles never reach host chrome or scale a desktop layout down.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ACTIVITY_LENSES, ActivityBody, activityHref, blockerSeverity } from '../src/site00/components/productionAuthority/ActivityBody';
import { INBOX_LENSES, InboxBody, inboxHref } from '../src/site00/components/productionAuthority/InboxBody';
import { ProductionAuthorityDataContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import type { HubData } from '../src/site00/components/productionHub/useProductionHubData';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const IDS = ['narrative', 'cast', 'look', 'performance', 'set', 'storyboard', 'keyframes'] as const;
const NODES = IDS.map((id, i) => ({
  id,
  order: i,
  label: id.toUpperCase(),
  status: i === 0 ? 'REVIEW_REQUIRED' : i < 3 ? 'BLOCKED' : 'LOCKED',
  statusDetail: `${id} detail`,
  dependsOn: i ? [IDS[i - 1]] : [],
  unlocks: i < IDS.length - 1 ? [IDS[i + 1]] : [],
  quickActions: [],
  assetSlotId: `production.ndxbook.p.node.${id}.primary`,
}));

function mock(over: { decidable?: boolean; gateOpen?: boolean } & Partial<Record<string, unknown>> = {}): HubData {
  const { decidable = false, gateOpen = true, ...rest } = over;
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
      completeCount: 0,
      blockers: ['NARRATIVE: awaiting founder approval', 'CAST: upstream narrative not complete'],
      founderGate: { open: gateOpen, nodeId: 'narrative', headline: 'NARRATIVE APPROVAL', detail: 'gate detail', decidableInHub: decidable },
      operation: { label: 'NARRATIVE' },
    },
    attention: [
      { id: 'attn.narrative', kind: 'NARRATIVE_APPROVAL', title: 'NARRATIVE APPROVAL', subtitle: 'ENTRY 002', stateLabel: 'AWAITING DECISION', actionLabel: 'REVIEW', priority: 'HIGH', nodeId: 'narrative', sceneId: null, assetSlotId: null, why: 'Narrative awaiting founder approval.' },
      { id: 'attn.cast', kind: 'CASTING_DECISION', title: 'CASTING DECISION', subtitle: 'ENTRY 002', stateLabel: 'AWAITING DECISION', actionLabel: 'REVIEW', priority: 'NORMAL', nodeId: 'cast', sceneId: null, assetSlotId: null, why: 'Upstream narrative not complete.' },
    ],
    activity: [],
    cast: { characters: [], looks: [] },
    frames: [],
    scenes: [],
    assetUrl: () => null,
    ...rest,
  } as unknown as HubData;
}

const render = (Body: () => unknown, url: string, data: HubData = mock()) =>
  renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [url] }, createElement(ProductionAuthorityDataContext.Provider, { value: data }, createElement(Body as never))),
  );
const has = (html: string, id: string) => html.includes(`data-testid="${id}"`);
const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!.replace(/&amp;/g, '&'));

/* INBOX blocks superseded by P0.STUDIOOS.PRODUCTION.INBOX.AUTHORITY-FAMILY-CONVERGENCE.OPUS2
 * (lifecycle NEEDS YOU / WATCHING / RESOLVED + ALL / MESSAGES / SYSTEM; full coverage lives in
 * tests/productionInboxAuthorityFamilyOpus2.test.ts). The OPUS1 intent is kept here: every Inbox view
 * mounts on the existing route, approval stays gated, and the legacy approvals link still opens the detail. */
describe('INBOX views mount on the existing /production/queue route', () => {
  for (const lens of INBOX_LENSES) {
    it(lens, () => {
      const html = render(InboxBody, inboxHref(lens));
      expect(html).toContain(`data-lens="${lens}"`);
      expect(has(html, 'production-queue')).toBe(true);
      expect(has(html, 'inbox-tabs')).toBe(true);
    });
  }
  it('view hrefs stay on /production/queue (no invented routes)', () => {
    for (const lens of INBOX_LENSES) expect(inboxHref(lens)).toMatch(/^\/production\/queue(\?|$)/);
  });
});

describe('INBOX decision detail (grandchild)', () => {
  it('the OPUS1 approvals link still opens the live decision', () => {
    const html = render(InboxBody, '/production/queue?view=approvals&item=attn.narrative');
    expect(has(html, 'inbox-decision-detail')).toBe(true);
    expect(html).toContain('NARRATIVE APPROVAL');
  });
  it('approve is disabled unless the founder gate is decidable for this node', () => {
    const url = inboxHref('needs', { item: 'attn.narrative' });
    expect(render(InboxBody, url, mock({ decidable: false }))).toMatch(/<button[^>]*disabled=""[^>]*data-testid="inbox-approve"/);
    expect(render(InboxBody, url, mock({ decidable: true }))).not.toMatch(/<button[^>]*disabled=""[^>]*data-testid="inbox-approve"/);
  });
});

describe('ACTIVITY lenses mount on the existing /production/activity route', () => {
  const expect_: Record<string, string[]> = {
    all: ['activity-stats', 'activity-feed', 'activity-milestones', 'activity-attention'],
    approvals: ['activity-approval-feed', 'activity-pending-review'],
    updates: ['activity-updates', 'activity-related'],
    comments: ['activity-comment-filters', 'activity-comments-unmounted'],
    blockers: ['activity-blockers', 'activity-escalations'],
  };
  for (const lens of ACTIVITY_LENSES) {
    it(lens, () => {
      const html = render(ActivityBody, activityHref(lens));
      expect(html).toContain(`data-lens="${lens}"`);
      for (const id of ['authority-activity', 'activity-hero', 'activity-lenses', ...expect_[lens]!]) expect(has(html, id), `${lens}:${id}`).toBe(true);
    });
  }
  it('Publish is not present (no route or data exists — not invented)', () => {
    expect(ACTIVITY_LENSES).not.toContain('publish' as never);
    const html = render(ActivityBody, '/production/activity');
    expect(html).not.toMatch(/>PUBLISH</);
    expect(html).not.toContain('view=publish');
  });
  it('blocker rows come from the live graph and the gate node is CRITICAL', () => {
    const html = render(ActivityBody, activityHref('blockers'));
    expect((html.match(/data-testid="activity-blocker-row"/g) ?? []).length).toBeGreaterThan(0);
    expect(blockerSeverity(NODES[0] as never, 'narrative')).toBe('CRITICAL');
    expect(blockerSeverity(NODES[1] as never, 'narrative')).toBe('HIGH');
    expect(blockerSeverity(NODES[4] as never, 'narrative')).toBe('MEDIUM');
  });
  it('comments are an honest UNMOUNTED shell', () => {
    const html = render(ActivityBody, activityHref('comments'));
    expect(html).toContain('data-state="UNMOUNTED"');
    expect(html).not.toMatch(/Maya Chen|Alex Rivas|Taylor Brooks/);
  });
  it('existing workspace + range filters are preserved in the filter popover source', () => {
    const src = read('src/site00/components/productionAuthority/ActivityBody.tsx');
    expect(src).toContain('testId="activity-category"');
    expect(src).toContain('testId="activity-range"');
  });
});

describe('ACTIVITY milestone detail (grandchild)', () => {
  it('mounts for a live node', () => {
    const html = render(ActivityBody, activityHref('all', 'cast'));
    expect(html).toContain('data-node="cast"');
    for (const id of ['activity-milestone-back', 'activity-milestone-open', 'activity-milestone-timeline', 'activity-milestone-dependencies', 'activity-milestone-unlocks'])
      expect(has(html, id), id).toBe(true);
  });
});

describe('Inbox Approvals and Activity Approvals stay distinct', () => {
  it('different routes, different surfaces', () => {
    expect(inboxHref('needs')).toBe('/production/queue');
    expect(activityHref('approvals')).toBe('/production/activity?view=approvals');
    const inbox = render(InboxBody, '/production/queue');
    const act = render(ActivityBody, activityHref('approvals'));
    expect(has(inbox, 'inbox-focus')).toBe(true);
    expect(has(inbox, 'activity-approval-feed')).toBe(false);
    expect(has(act, 'activity-approval-feed')).toBe(true);
    expect(has(act, 'inbox-focus')).toBe(false);
  });
});

describe('styles: body-only, recomposed per viewport, no scaling', () => {
  const css = read('src/site00/styles/site00-production-inbox-activity.css').replace(/\/\*[\s\S]*?\*\//g, '');
  it('never selects host chrome', () => {
    expect(css).not.toMatch(/\.pxh|\.ph-|\.prod-chrome|\.pxa-nav|\.pxa-top/);
  });
  it('tablet and mobile are independent compositions, not zoom/scale', () => {
    expect(css).toMatch(/@media \(min-width: 700px\) and \(max-width: 1119px\)/);
    expect(css).toMatch(/@media \(max-width: 699px\)/);
    expect(css).not.toMatch(/\bzoom\s*:|scale\s*\(/);
  });
  it('reference triptychs are not used as UI', () => {
    for (const f of ['InboxBody.tsx', 'ActivityBody.tsx', 'iaKit.tsx']) expect(read(`src/site00/components/productionAuthority/${f}`)).not.toMatch(/three-viewports|AUTHORITY_LITE/);
    expect(css).not.toMatch(/three-viewports/);
  });
});
