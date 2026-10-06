/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-ISOLATION-LOGIC-RECONCILIATION-PANEL-INTELLIGENCE1
 * Render-level isolation: the seven tabs of a non-NDX project render ONLY that project's graph (A), a domain the
 * project has not established renders its project-scoped NOT_ESTABLISHED state (B), stale child state from another
 * project never resolves (C), a ledger action propagates across tabs (D), counts equal the lists they open (E),
 * graph media is contained and role-tagged (F), DESIGN defaults to the overview (G) and the chrome keeps the
 * project on every tab link (H). Live proof: scripts/production-workspace/project-isolation-qa.mjs.
 */
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import {
  assembleProjectGraph,
  decisionsIn,
  hubSummary,
  workspaceAction,
  type AssembledProjectGraph,
  type WorkspaceAction,
} from '../shared/site00-production-graph/index';
import { DesignModeBar, designModesFor, useDesignSurface } from '../src/site00/components/productionAuthority/DesignChamber';
import { ProjectGraphContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import { ExpressionDomainGate, ProjectDesignSurface, ProjectExperienceSurface } from '../src/site00/components/productionAuthority/projectGraph/ProjectDomainSurfaces';
import { ProjectSelectState } from '../src/site00/components/productionAuthority/projectGraph/ProjectScopeStates';
import { ProductionWorkspaceHeader, ProductionWorkspaceNav } from '../src/site00/components/productionHub/chrome';
import { AIO_PROJECT_ID, staticGraphParts } from '../src/site00/production/projectGraphSources';
import { ActivitySurface, HubSurface, InboxSurface, LibrarySurface } from '../src/site00/production/WorkspaceSurfaces';

const NAMES: Record<string, string> = { jurnl: 'JURNL', [AIO_PROJECT_ID]: 'ALL IN ONE ENTERPRISES', 'astral-world': 'ASTRAL WORLD', 'frontal-slayer': 'FRONTAL SLAYER' };
const graphOf = (id: string, ledger: readonly WorkspaceAction[] = []): AssembledProjectGraph =>
  assembleProjectGraph({ project_id: id, project_name: NAMES[id] ?? id.toUpperCase(), project_type: 'TEST' }, staticGraphParts(id), ledger);

function render(graph: AssembledProjectGraph | null, url: string, node: ReactNode, pattern = '*'): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [url] },
      createElement(ProjectGraphContext.Provider, { value: graph }, createElement(Routes, null, createElement(Route, { path: pattern, element: node }))),
    ),
  );
}

const NDX = /NDXBOOK|ENTRY 002|SUBJECT WOMAN|ndxbook|NDX GROTESK|OH, NOW IT WAS FUN/;
const ExpressionProbe = () => createElement('div', { 'data-testid': 'expression-probe' }, 'NDXBOOK ENTRY 002 CASTING');

type Tab = { tab: string; url: (p: string) => string; node: ReactNode; pattern?: string };
const TABS: Tab[] = [
  { tab: 'HUB', url: (p) => `/production?project=${p}`, node: createElement(HubSurface) },
  { tab: 'INBOX', url: (p) => `/production/queue?project=${p}`, node: createElement(InboxSurface) },
  { tab: 'DESIGN', url: (p) => `/production/${p}/design`, node: createElement(ProjectDesignSurface), pattern: '/production/:projectSlug/design' },
  { tab: 'EXPERIENCE', url: (p) => `/production/${p}/experience`, node: createElement(ProjectExperienceSurface), pattern: '/production/:projectSlug/experience' },
  { tab: 'EXPRESSION', url: (p) => `/production/${p}/expression`, node: createElement(ExpressionDomainGate, null, createElement(ExpressionProbe)), pattern: '/production/:projectSlug/expression' },
  { tab: 'LIBRARY', url: (p) => `/production/libraries?project=${p}`, node: createElement(LibrarySurface) },
  { tab: 'ACTIVITY', url: (p) => `/production/activity?project=${p}`, node: createElement(ActivitySurface) },
];

describe('A — NDXBOOK → JURNL: every tab shows only JURNL', () => {
  const g = graphOf('jurnl');
  for (const t of TABS) {
    it(`${t.tab}`, () => {
      const html = render(g, t.url('jurnl'), t.node, t.pattern);
      expect(html.length).toBeGreaterThan(200);
      expect(html).not.toMatch(NDX);
      for (const m of html.matchAll(/data-project="([^"]+)"/g)) expect(m[1], t.tab).toBe('jurnl');
      expect(html).not.toContain('expression-probe');
    });
  }
  it('the same holds for ALL IN ONE ENTERPRISES and ASTRAL WORLD', () => {
    for (const id of [AIO_PROJECT_ID, 'astral-world']) {
      const g2 = graphOf(id);
      for (const t of TABS) {
        const html = render(g2, t.url(id), t.node, t.pattern);
        expect(html, `${id} ${t.tab}`).not.toMatch(NDX);
        for (const m of html.matchAll(/data-project="([^"]+)"/g)) expect(m[1], `${id} ${t.tab}`).toBe(id);
      }
    }
  });
});

describe('B — a domain the project has not established renders its own empty state', () => {
  const cases: [string, string, number][] = [
    ['jurnl', 'EXPRESSION', 4],
    ['jurnl', 'EXPERIENCE', 3],
    [AIO_PROJECT_ID, 'EXPRESSION', 4],
    ['astral-world', 'DESIGN', 2],
    ['frontal-slayer', 'DESIGN', 2],
    ['frontal-slayer', 'EXPERIENCE', 3],
  ];
  for (const [id, domain, i] of cases) {
    it(`${id} · ${domain}`, () => {
      const t = TABS[i]!;
      const html = render(graphOf(id), t.url(id), t.node, t.pattern);
      expect(html).toContain(`data-testid="domain-empty-${domain.toLowerCase()}"`);
      expect(html).toContain('data-state="NOT_ESTABLISHED"');
      expect(html).toContain(`NO ${domain} WORKSPACE HAS BEEN ESTABLISHED FOR ${NAMES[id]}.`);
      expect(html).toContain(`href="/production?project=${id}"`);
      expect(html).not.toMatch(NDX);
    });
  }
  it('a project with no recorded truth gets empty HUB / INBOX / LIBRARY / ACTIVITY — never another project', () => {
    const g = graphOf('frontal-slayer');
    expect(render(g, '/production?project=frontal-slayer', createElement(HubSurface))).toContain('data-testid="project-hub-progress-empty"');
    expect(render(g, '/production/queue?project=frontal-slayer', createElement(InboxSurface))).toContain('data-testid="project-inbox-empty"');
    expect(render(g, '/production/libraries?project=frontal-slayer', createElement(LibrarySurface))).toContain('data-testid="project-library-empty"');
    expect(render(g, '/production/activity?project=frontal-slayer', createElement(ActivitySurface))).toContain('data-testid="project-activity-empty"');
  });
});

describe('C — stale child state from another project never resolves', () => {
  const g = graphOf('jurnl');
  it('INBOX ?item= / LIBRARY ?artifact= / ACTIVITY ?node= / DESIGN ?family= / EXPERIENCE ?scene=', () => {
    expect(render(g, '/production/queue?project=jurnl&item=attn.narrative', createElement(InboxSurface))).toContain('project-inbox-item-missing');
    expect(render(g, '/production/libraries?project=jurnl&artifact=production.ndxbook.entry-002.frame.1', createElement(LibrarySurface))).toContain('project-library-artifact-missing');
    expect(render(g, '/production/activity?project=jurnl&node=narrative', createElement(ActivitySurface))).toContain('project-activity-node-missing');
    expect(render(g, '/production/jurnl/design?family=AIO.IFTA', createElement(ProjectDesignSurface), '/production/:projectSlug/design')).toContain('project-design-family-missing');
  });
  it('a JURNL id resolves only inside JURNL', () => {
    const verdict = decisionsIn(g, 'NEEDS_YOU')[0]!;
    expect(render(g, `/production/queue?project=jurnl&item=${verdict.item_id}`, createElement(InboxSurface))).toContain('data-testid="project-inbox-item"');
    const aio = graphOf(AIO_PROJECT_ID);
    expect(render(aio, `/production/queue?project=${AIO_PROJECT_ID}&item=${verdict.item_id}`, createElement(InboxSurface))).toContain('project-inbox-item-missing');
  });
});

describe('D — a decision taken in INBOX reaches HUB, INBOX, LIBRARY and ACTIVITY', () => {
  const base = graphOf('jurnl');
  const verdict = decisionsIn(base, 'NEEDS_YOU').find((d) => d.kind === 'AUTHORITY_VERDICT')!;
  const after = graphOf('jurnl', [workspaceAction({ project_id: 'jurnl', kind: 'APPROVE', node_id: verdict.node_id, item_id: verdict.item_id, note: 'locked', at: '2026-10-06T12:00:00.000Z' })]);
  it('HUB NEED YOU count drops by one', () => {
    const count = (g: AssembledProjectGraph) => Number(/data-testid="project-hub-count-needs-you" data-count="(\d+)"/.exec(render(g, '/production?project=jurnl', createElement(HubSurface)))?.[1]);
    expect(count(after)).toBe(count(base) - 1);
  });
  it('INBOX moves the item to RESOLVED', () => {
    const html = render(after, '/production/queue?project=jurnl&view=resolved', createElement(InboxSurface));
    expect(html).toContain(`data-item="${verdict.item_id}" data-state="RESOLVED"`);
    expect(render(after, '/production/queue?project=jurnl', createElement(InboxSurface))).not.toContain(`data-item="${verdict.item_id}"`);
  });
  it('ACTIVITY records the approval', () => {
    const html = render(after, '/production/activity?project=jurnl&view=approvals', createElement(ActivitySurface));
    expect(html).toContain('data-event="APPROVED"');
    expect(html).toContain('data-event="RESOLVED"');
  });
  it('DESIGN shows the family approved', () => {
    const fam = after.nodes.find((n) => n.node_id === verdict.node_id)!;
    const html = render(after, `/production/jurnl/design?family=${fam.family_id}`, createElement(ProjectDesignSurface), '/production/:projectSlug/design');
    expect(html).toContain('APPROVED');
    expect(html).toContain('LOCKED');
  });
});

describe('E — counts equal the lists they open', () => {
  for (const id of ['jurnl', AIO_PROJECT_ID]) {
    it(id, () => {
      const g = graphOf(id);
      const h = hubSummary(g);
      const hub = render(g, `/production?project=${id}`, createElement(HubSurface));
      expect(hub).toContain(`data-testid="project-hub-count-needs-you" data-count="${h.needsYou.length}"`);
      expect(hub).toContain(`data-testid="project-hub-count-blockers" data-count="${h.blockers.length}"`);
      const inbox = render(g, `/production/queue?project=${id}`, createElement(InboxSurface));
      expect(inbox.match(/data-testid="graph-decision-row"/g)?.length ?? 0).toBe(h.needsYou.length);
      const blockers = render(g, `/production/activity?project=${id}&view=blockers`, createElement(ActivitySurface));
      expect(blockers.match(/data-testid="graph-blocker-row"/g)?.length ?? 0).toBe(h.blockers.length);
      const lib = render(g, `/production/libraries?project=${id}&status=ALL`, createElement(LibrarySurface));
      expect(lib.match(/data-testid="project-library-tile"/g)?.length ?? 0).toBe(g.artifacts.length);
    });
  }
  it('host chrome ITEMS NEED YOU is the active project’s NEEDS YOU list length', () => {
    const g = graphOf('jurnl');
    const html = render(g, '/production/queue?project=jurnl', createElement(ProductionWorkspaceHeader));
    const n = decisionsIn(g, 'NEEDS_YOU').length;
    expect(html).toContain(`data-count="${n}"`);
    expect(html).not.toMatch(/NDXBOOK/);
  });
});

describe('F — graph media is contained and role-tagged; missing media says so', () => {
  it('every image declares a role inside a THUMBNAIL_CONTAIN slot', () => {
    for (const id of ['jurnl', AIO_PROJECT_ID, 'astral-world']) {
      const g = graphOf(id);
      const html = [
        render(g, `/production/libraries?project=${id}&status=ALL`, createElement(LibrarySurface)),
        render(g, `/production/${id}/design`, createElement(ProjectDesignSurface), '/production/:projectSlug/design'),
        render(g, `/production/${id}/experience`, createElement(ProjectExperienceSurface), '/production/:projectSlug/experience'),
      ].join('');
      for (const img of html.match(/<img[^>]*>/g) ?? []) expect(img, id).toMatch(/data-media-role="[A-Z_]+"/);
      for (const slot of html.match(/<span[^>]*data-media-fit="[A-Z_]+"/g) ?? []) expect(slot, id).toContain('data-media-fit="THUMBNAIL_CONTAIN"');
      for (const src of html.matchAll(/<img[^>]*src="([^"]+)"/g)) expect(src[1], id).not.toMatch(/ndxbook|entry-002/);
    }
  });
  it('an artifact without a mounted file renders an explicit state, not borrowed art', () => {
    const g = graphOf(AIO_PROJECT_ID);
    const html = render(g, `/production/libraries?project=${AIO_PROJECT_ID}&status=ALL`, createElement(LibrarySurface));
    expect(html).toMatch(/data-media-state="missing"[^>]*>(RECORDED · NOT MOUNTED|MISSING)</);
  });
});

describe('G — DESIGN default / overview / modes', () => {
  const Probe = ({ slug }: { slug: string }) => createElement('i', { 'data-surface': useDesignSurface(slug) });
  const surface = (slug: string, search: string) =>
    /data-surface="([a-z]+)"/.exec(render(null, `/production/${slug}/design${search}`, createElement(Probe, { slug }), '/production/:projectSlug/design'))?.[1];
  it('no ?mode → OVERVIEW for every project', () => {
    for (const slug of ['ndxbook', 'jurnl', AIO_PROJECT_ID, 'astral-world']) expect(surface(slug, ''), slug).toBe('overview');
  });
  it('a mode the project does not have renders its overview (never another project’s chamber)', () => {
    expect(designModesFor(AIO_PROJECT_ID)).toEqual([]);
    expect(surface(AIO_PROJECT_ID, '?mode=brand')).toBe('overview');
    expect(surface('astral-world', '?mode=viewport')).toBe('overview');
    expect(surface('jurnl', '?mode=brand')).toBe('brand');
    expect(surface('jurnl', '?mode=viewport')).toBe('viewport');
  });
  it('the mode bar offers OVERVIEW + the project’s own modes only', () => {
    const bar = (slug: string) => render(null, `/production/${slug}/design`, createElement(DesignModeBar, { active: 'overview' }), '/production/:projectSlug/design');
    expect(bar('jurnl')).toContain('data-testid="design-surface-overview"');
    expect(bar('jurnl').match(/data-testid="design-mode-[a-z]+"/g)).toHaveLength(6);
    expect(bar(AIO_PROJECT_ID)).toBe('');
  });
  it('the DESIGN overview shows the method strip with real counts', () => {
    const html = render(graphOf('jurnl'), '/production/jurnl/design', createElement(ProjectDesignSurface), '/production/:projectSlug/design');
    for (let i = 1; i <= 8; i++) expect(html).toContain(`data-testid="project-design-step-0${i}"`);
    expect(html.match(/data-testid="project-design-family-row"/g)).toHaveLength(16);
  });
});

describe('H — the project travels with every tab link; no project → picker', () => {
  it('bottom / host nav hrefs carry the active project', () => {
    const html = render(graphOf('jurnl'), '/production/queue?project=jurnl', createElement(ProductionWorkspaceNav));
    const hrefs = [...html.matchAll(/<a[^>]*href="([^"]+)"/g)].map((m) => m[1]!.replace(/&amp;/g, '&'));
    expect(hrefs.length).toBeGreaterThanOrEqual(7);
    for (const h of hrefs) expect(h, h).toMatch(/project=jurnl|\/production\/jurnl\//);
  });
  it('no project chosen → the picker lists projects on the current tab', () => {
    const html = render(null, '/production/activity', createElement(ProjectSelectState));
    expect(html).toContain('data-testid="production-project-select"');
    expect(html).toContain('href="/production/activity?project=jurnl"');
  });
});
