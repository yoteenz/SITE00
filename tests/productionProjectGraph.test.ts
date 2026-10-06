/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-ISOLATION-LOGIC-RECONCILIATION-PANEL-INTELLIGENCE1
 * The canonical project production graph: adapters, project isolation, real counts, domain establishment,
 * ledger propagation (cross-tab), project scope of the URL, and the panel contract registry.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AUDITED_PANELS,
  DESIGN_METHOD,
  GRAPH_PANEL_CONTRACTS,
  PANEL_CLASSIFICATIONS,
  PROJECT_DOMAIN_CAPABILITY_MAP,
  ProjectScopeViolation,
  WORK_DOMAINS,
  assembleProjectGraph,
  buildExpressionGraphPart,
  decisionsIn,
  expressionNodeId,
  designMethodOf,
  domainHeadline,
  experienceKinds,
  getWorkspacePanelData,
  hubSummary,
  projectBlockers,
  projectFromUrl,
  projectSwitchTarget,
  resolveActiveProject,
  scopedTabHref,
  topLevelNodes,
  workspaceAction,
  workspaceTabOf,
  type AssembledProjectGraph,
  type GraphPart,
  type WorkspaceAction,
} from '../shared/site00-production-graph/index';
import { AIO_PROJECT_ID, staticGraphParts } from '../src/site00/production/projectGraphSources';

const ROOT = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');

const NAMES: Record<string, string> = {
  jurnl: 'JURNL',
  [AIO_PROJECT_ID]: 'ALL IN ONE ENTERPRISES',
  'astral-world': 'ASTRAL WORLD',
  'frontal-slayer': 'FRONTAL SLAYER',
  'studio-world': 'STUDIO WORLD',
  site00: 'SITE 00',
  ndxbook: 'NDXBOOK',
};
const graphOf = (id: string, ledger: readonly WorkspaceAction[] = []): AssembledProjectGraph =>
  assembleProjectGraph({ project_id: id, project_name: NAMES[id] ?? id.toUpperCase(), project_type: 'TEST' }, staticGraphParts(id), ledger);

const PROJECTS = Object.keys(NAMES);
const NDX = /NDXBOOK|ndxbook|ENTRY 002|ENTRY-002|entry002/;

describe('project graph assembly (A — isolation)', () => {
  it('every record of every graph belongs to that graph’s project; nothing is foreign', () => {
    for (const id of PROJECTS) {
      const g = graphOf(id);
      expect(g.foreign_dropped, id).toBe(0);
      for (const rows of [g.nodes, g.artifacts, g.decisions, g.events]) for (const r of rows) expect(r.project_id, id).toBe(id);
    }
  });
  it('NDXBOOK never fills JURNL, AIO, Astral World, Frontal Slayer, Studio World or SITE 00', () => {
    for (const id of PROJECTS.filter((p) => p !== 'ndxbook')) expect(JSON.stringify(graphOf(id)), id).not.toMatch(NDX);
  });
  it('a part carrying another project’s rows has them dropped, not merged', () => {
    const jurnl = staticGraphParts('jurnl');
    const leak: GraphPart = { nodes: graphOf(AIO_PROJECT_ID).nodes, artifacts: graphOf(AIO_PROJECT_ID).artifacts };
    const g = assembleProjectGraph({ project_id: 'jurnl', project_name: 'JURNL', project_type: 'TEST' }, [...jurnl, leak]);
    expect(g.foreign_dropped).toBe(graphOf(AIO_PROJECT_ID).nodes.length + graphOf(AIO_PROJECT_ID).artifacts.length);
    expect(g.nodes.every((n) => n.project_id === 'jurnl')).toBe(true);
    expect(g.nodes.length).toBe(graphOf('jurnl').nodes.length);
  });
  it('projects without recorded truth have an empty graph — never a fallback', () => {
    for (const id of ['frontal-slayer', 'studio-world', 'site00', 'ndxbook', 'unknown-project']) {
      const g = graphOf(id);
      expect(g.nodes, id).toEqual([]);
      expect(g.phase, id).toBeNull();
      expect(g.next_action, id).toBeNull();
    }
  });
  it('the panel query refuses another project’s graph', () => {
    const g = graphOf('jurnl');
    expect(() => getWorkspacePanelData({ graph: g, projectId: 'ndxbook', workspaceDomain: 'HUB', panelId: 'needs-you' })).toThrow(ProjectScopeViolation);
    expect(getWorkspacePanelData({ graph: g, projectId: 'jurnl', workspaceDomain: 'HUB', panelId: 'needs-you' }).kind).toBe('DECISIONS');
  });
});

describe('project truth per project', () => {
  it('JURNL: 16 page families in DESIGN, founder verdicts / acceptance in NEEDS YOU, authority blockers', () => {
    const g = graphOf('jurnl');
    const fams = topLevelNodes(g, 'DESIGN');
    expect(fams).toHaveLength(16);
    expect(fams.map((f) => f.family_id)).toEqual(Array.from({ length: 16 }, (_, i) => `F${String(i + 1).padStart(2, '0')}`));
    expect(decisionsIn(g, 'NEEDS_YOU').length).toBeGreaterThan(0);
    expect(projectBlockers(g).every((b) => b.reason && b.owner && b.required_action && b.downstream_effect)).toBe(true);
    expect(g.domains.DESIGN.established).toBe(true);
    expect(g.domains.EXPERIENCE.established).toBe(false);
    expect(g.domains.EXPRESSION.established).toBe(false);
    expect(g.phase).not.toBeNull();
  });
  it('AIO: IFTA authority package — page family, actor modes, page tree, open decisions', () => {
    const g = graphOf(AIO_PROJECT_ID);
    expect(g.nodes.some((n) => n.node_type === 'PAGE_TREE')).toBe(true);
    expect(g.nodes.some((n) => n.node_type === 'PAGE_FAMILY_AUTHORITY')).toBe(true);
    expect(decisionsIn(g, 'NEEDS_YOU').length).toBeGreaterThan(0);
    expect(decisionsIn(g, 'RESOLVED').length).toBeGreaterThan(0);
    expect(g.domains.DESIGN.established).toBe(true);
    expect(g.domains.EXPRESSION.established).toBe(false);
  });
  it('Astral World: a world graph in EXPERIENCE (world → scenes → interactions), nothing in DESIGN / EXPRESSION', () => {
    const g = graphOf('astral-world');
    expect(g.domains.EXPERIENCE.established).toBe(true);
    expect(g.domains.DESIGN.established).toBe(false);
    expect(g.domains.EXPRESSION.established).toBe(false);
    const kinds = experienceKinds(g.nodes).map((k) => k.kind);
    expect(kinds).toContain('WORLD');
    expect(kinds).toContain('SCENE');
    expect(kinds).toContain('INTERACTION');
  });
  it('capability map declares every project; establishment comes from the project’s own nodes', () => {
    for (const id of ['ndxbook', 'jurnl', AIO_PROJECT_ID, 'studio-world', 'astral-world', 'frontal-slayer', 'site00'])
      expect(PROJECT_DOMAIN_CAPABILITY_MAP.some((p) => p.project_id === id), id).toBe(true);
    const fs = graphOf('frontal-slayer');
    for (const d of WORK_DOMAINS) expect(fs.domains[d].established).toBe(false);
    expect(domainHeadline('EXPRESSION', 'JURNL')).toBe('NO EXPRESSION WORKSPACE HAS BEEN ESTABLISHED FOR JURNL.');
  });
});

describe('E — count integrity: every count is the length of a list', () => {
  it('HUB summary numbers equal the panel query rows they link to', () => {
    for (const id of ['jurnl', AIO_PROJECT_ID, 'astral-world']) {
      const g = graphOf(id);
      const h = hubSummary(g);
      const q = (panelId: string) => getWorkspacePanelData({ graph: g, projectId: id, workspaceDomain: 'HUB', panelId });
      const rows = (panelId: string) => {
        const d = q(panelId);
        return 'rows' in d ? d.rows.length : -1;
      };
      expect(h.needsYou.length, id).toBe(rows('needs-you'));
      expect(h.watching.length, id).toBe(rows('watching'));
      expect(h.resolved.length, id).toBe(rows('resolved'));
      expect(h.blockers.length, id).toBe(rows('blockers'));
      expect(h.topLevel.length, id).toBe(rows('top-level'));
      expect(h.events.length, id).toBe(rows('events'));
      expect(h.stages.reduce((s, x) => s + x.count, 0), id).toBe(h.topLevel.length);
    }
  });
  it('DESIGN method counts sum to the families that sit in the method (step 03 is a rule)', () => {
    const g = graphOf('jurnl');
    const fams = topLevelNodes(g, 'DESIGN');
    const counted = DESIGN_METHOD.filter((m) => !m.rule).reduce((s, m) => s + fams.filter((f) => designMethodOf(f) === m.id).length, 0);
    expect(counted).toBe(fams.filter((f) => designMethodOf(f) !== null).length);
    expect(fams.some((f) => designMethodOf(f) === '03')).toBe(false);
  });
});

describe('D — cross-tab propagation through the workspace ledger', () => {
  const at = '2026-10-06T12:00:00.000Z';
  it('APPROVE a JURNL authority verdict: node approved, artifacts promoted, item resolved, events recorded', () => {
    const base = graphOf('jurnl');
    const verdict = decisionsIn(base, 'NEEDS_YOU').find((d) => d.kind === 'AUTHORITY_VERDICT')!;
    expect(verdict).toBeTruthy();
    const action = workspaceAction({ project_id: 'jurnl', kind: 'APPROVE', node_id: verdict.node_id, item_id: verdict.item_id, note: '', at });
    const g = graphOf('jurnl', [action]);
    const node = g.nodes.find((n) => n.node_id === verdict.node_id)!;
    expect(node.approval_status).toBe('APPROVED');
    expect(node.authority_status).toBe('LOCKED');
    // INBOX: the item resolves and NEEDS YOU drops by one
    expect(g.decisions.find((d) => d.item_id === verdict.item_id)!.state).toBe('RESOLVED');
    expect(decisionsIn(g, 'NEEDS_YOU').length).toBe(decisionsIn(base, 'NEEDS_YOU').length - 1);
    // LIBRARY: no artifact of the node is left IN_REVIEW
    expect(g.artifacts.filter((a) => a.source_node_id === node.node_id && a.status === 'IN_REVIEW')).toEqual([]);
    // ACTIVITY: approval + resolution events, origin WORKSPACE
    const types = g.events.filter((e) => e.origin === 'WORKSPACE').map((e) => e.event_type);
    expect(types).toContain('APPROVED');
    expect(types).toContain('RESOLVED');
  });
  it('REQUEST_REVISION blocks the node, marks its authority REVISE and opens a WATCHING review request', () => {
    const base = graphOf('jurnl');
    const verdict = decisionsIn(base, 'NEEDS_YOU').find((d) => d.kind === 'AUTHORITY_VERDICT')!;
    const g = graphOf('jurnl', [workspaceAction({ project_id: 'jurnl', kind: 'REQUEST_REVISION', node_id: verdict.node_id, item_id: verdict.item_id, note: 'tighten the hierarchy', at })]);
    const node = g.nodes.find((n) => n.node_id === verdict.node_id)!;
    expect(node.status).toBe('BLOCKED');
    expect(node.blockers.some((b) => b.reason.includes('tighten the hierarchy'))).toBe(true);
    expect(decisionsIn(g, 'WATCHING').some((d) => d.kind === 'REVIEW_REQUEST' && d.node_id === node.node_id)).toBe(true);
    expect(g.events.some((e) => e.event_type === 'REVISED')).toBe(true);
  });
  it('RESOLVE an AIO open decision: it resolves and a DECIDED event is recorded', () => {
    const base = graphOf(AIO_PROJECT_ID);
    const open = decisionsIn(base, 'NEEDS_YOU')[0]!;
    const g = graphOf(AIO_PROJECT_ID, [workspaceAction({ project_id: AIO_PROJECT_ID, kind: 'RESOLVE', node_id: open.node_id, item_id: open.item_id, note: 'decided', at })]);
    expect(g.decisions.find((d) => d.item_id === open.item_id)!.state).toBe('RESOLVED');
    expect(g.events.some((e) => e.event_type === 'DECIDED' && e.origin === 'WORKSPACE')).toBe(true);
  });
  it('EXPERIENCE world asset rejected: scene BLOCKED, scene authority REVISE, revision item WATCHING, verdict recorded, HUB blocker', () => {
    const base = graphOf('astral-world');
    const scene = base.nodes.find((n) => n.node_type === 'SCENE' && base.artifacts.some((a) => a.source_node_id === n.node_id))!;
    expect(scene).toBeTruthy();
    const g = graphOf('astral-world', [workspaceAction({ project_id: 'astral-world', kind: 'REJECT', node_id: scene.node_id, item_id: null, note: 'wrong district palette', at })]);
    const node = g.nodes.find((n) => n.node_id === scene.node_id)!;
    expect(node.status).toBe('BLOCKED');
    expect(node.approval_status).toBe('REJECTED');
    expect(g.artifacts.filter((a) => a.source_node_id === scene.node_id).every((a) => a.status === 'REVISE')).toBe(true);
    expect(decisionsIn(g, 'WATCHING').some((d) => d.kind === 'REVIEW_REQUEST' && d.node_id === scene.node_id)).toBe(true);
    expect(g.events.some((e) => e.event_type === 'REJECTED' && e.node_id === scene.node_id)).toBe(true);
    // HUB reflects the blocker; every downstream node is held ("downstream scene cannot become authority-ready")
    expect(hubSummary(g).blockers.length).toBe(hubSummary(base).blockers.length + 1 + scene.downstream_nodes.length);
    for (const d of scene.downstream_nodes) expect(g.nodes.find((n) => n.node_id === d)!.blockers.some((b) => b.upstream === scene.node_id)).toBe(true);
  });
  it('EXPRESSION casting approved: casting decision resolves, cast node approved, LOOK unlocks, decision logged', () => {
    const IDS = ['narrative', 'cast', 'look', 'performance', 'set', 'storyboard', 'keyframes'] as const;
    const STATUS = ['COMPLETE', 'REVIEW_REQUIRED', 'LOCKED', 'LOCKED', 'LOCKED', 'LOCKED', 'LOCKED'] as const;
    const nodes = IDS.map((id, i) => ({ id, order: i, label: id.toUpperCase(), status: STATUS[i], statusDetail: `${id} detail`, dependsOn: i ? [IDS[i - 1]] : [], unlocks: i < 6 ? [IDS[i + 1]] : [], quickActions: [], assetSlotId: null }));
    const hubGraph = { nodes, byId: Object.fromEntries(nodes.map((n) => [n.id, n])), activeNodeId: 'cast', progressPercent: 14, completeCount: 1, blockers: [], founderGate: { open: true, nodeId: 'cast', headline: 'CASTING APPROVAL', detail: '', decidableInHub: false }, operation: { label: 'CASTING' } };
    const part = buildExpressionGraphPart({
      projectId: 'ndxbook',
      productionId: 'entry-002',
      productionLabel: 'ENTRY 002',
      productionTitle: null,
      graph: hubGraph as never,
      sceneCount: 0,
      roles: [{ roleId: 'lead', label: 'LEAD', importance: 'HERO', characterName: 'LEAD', actorName: 'SW-001', actorMissingFromCatalogue: false, route: '/production/ndxbook/expression/casting' }],
      attention: [{ id: 'attn.cast', kind: 'FOUNDER_APPROVAL', title: 'CASTING APPROVAL', subtitle: '', priority: 'HIGH', nodeId: 'cast', why: 'Cast awaiting founder approval' }],
      activity: [],
      requests: [],
      assets: [],
      route: (sub) => `/production/ndxbook/expression${sub ? `/${sub}` : ''}`,
      pipelineAvailable: true,
    });
    const g0 = assembleProjectGraph({ project_id: 'ndxbook', project_name: 'NDXBOOK', project_type: 'TEST' }, [part]);
    const item = decisionsIn(g0, 'NEEDS_YOU')[0]!;
    const castNode = expressionNodeId('ndxbook', 'entry-002', 'cast');
    const lookNode = expressionNodeId('ndxbook', 'entry-002', 'look');
    expect(item.node_id).toBe(castNode);
    expect(g0.nodes.find((n) => n.node_id === lookNode)!.blockers.some((b) => b.upstream === castNode)).toBe(true);
    const g = assembleProjectGraph({ project_id: 'ndxbook', project_name: 'NDXBOOK', project_type: 'TEST' }, [part], [workspaceAction({ project_id: 'ndxbook', kind: 'APPROVE', node_id: castNode, item_id: item.item_id, note: '', at })]);
    expect(decisionsIn(g, 'NEEDS_YOU')).toEqual([]); // INBOX removes the casting decision
    expect(g.nodes.find((n) => n.node_id === castNode)!.approval_status).toBe('APPROVED'); // casting state updates
    expect(g.nodes.find((n) => n.node_id === lookNode)!.blockers.some((b) => b.upstream === castNode)).toBe(false); // downstream readiness
    expect(g.events.map((e) => e.event_type)).toEqual(expect.arrayContaining(['APPROVED', 'UNLOCKED', 'RESOLVED'])); // ACTIVITY logs it
  });
  it('an action recorded for one project never changes another project', () => {
    const verdict = decisionsIn(graphOf('jurnl'), 'NEEDS_YOU')[0]!;
    const action = workspaceAction({ project_id: 'jurnl', kind: 'APPROVE', node_id: verdict.node_id, item_id: verdict.item_id, note: '', at });
    expect(graphOf(AIO_PROJECT_ID, [action])).toEqual(graphOf(AIO_PROJECT_ID));
    // even a mis-keyed action naming another project's node does nothing
    const foreign = { ...action, project_id: AIO_PROJECT_ID };
    expect(graphOf(AIO_PROJECT_ID, [foreign]).decisions).toEqual(graphOf(AIO_PROJECT_ID).decisions);
  });
});

describe('H — route persistence and project switching', () => {
  it('every root tab carries the project; the tab resolves from the path', () => {
    const tabs = ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'] as const;
    for (const t of tabs) {
      const href = scopedTabHref(t, 'jurnl');
      const [p, q = ''] = href.split('?');
      expect(workspaceTabOf(p!), href).toBe(t);
      expect(projectFromUrl(p!, q ? `?${q}` : ''), href).toBe('jurnl');
    }
  });
  it('active project: path slug > ?project= > stored choice > none (no default project)', () => {
    expect(resolveActiveProject({ pathname: '/production/jurnl/design', search: '?project=ndxbook', stored: 'aio' })).toBe('jurnl');
    expect(resolveActiveProject({ pathname: '/production/queue', search: '?project=jurnl', stored: 'ndxbook' })).toBe('jurnl');
    expect(resolveActiveProject({ pathname: '/production/activity', search: '', stored: 'astral-world' })).toBe('astral-world');
    expect(resolveActiveProject({ pathname: '/production', search: '', stored: null })).toBeNull();
  });
  it('C — a project switch keeps the tab and drops every project-dependent child state', () => {
    const cases: [string, string, string][] = [
      ['/production', '?project=ndxbook&view=machine&node=cast', '/production?project=jurnl'],
      ['/production/queue', '?project=ndxbook&view=watching&item=attn.narrative&notice=n1', '/production/queue?project=jurnl&view=watching'],
      ['/production/libraries', '?project=ndxbook&artifact=x&status=REVISE', '/production/libraries?project=jurnl'],
      ['/production/activity', '?project=ndxbook&view=blockers&milestone=cast&node=x', '/production/activity?project=jurnl&view=blockers'],
      ['/production/ndxbook/design', '?mode=viewport&screen=F01.03&family=F01', '/production/jurnl/design?mode=viewport'],
      ['/production/ndxbook/experience/world', '?scene=x', '/production/jurnl/experience'],
      ['/production/ndxbook/expression/casting/roles/cast-req-entry002-subject-woman', '?entry=002', '/production/jurnl/expression'],
    ];
    for (const [p, s, want] of cases) expect(projectSwitchTarget(p, s, 'jurnl'), `${p}${s}`).toBe(want);
  });
});

describe('panel intelligence contracts', () => {
  const SOURCES = [
    'src/site00/components/productionAuthority/projectGraph/ProjectProjections.tsx',
    'src/site00/components/productionAuthority/projectGraph/ProjectDomainSurfaces.tsx',
    'src/site00/components/productionAuthority/projectGraph/ProjectScopeStates.tsx',
    'src/site00/components/productionHub/chrome.tsx',
  ]
    .map(read)
    .join('\n');
  it('every graph panel answers the eleven questions and exists in the UI under its test id', () => {
    for (const c of GRAPH_PANEL_CONTRACTS) {
      for (const k of ['display_purpose', 'node_scope', 'source_of_truth', 'query_source', 'empty_state', 'loading_state', 'error_state', 'visibility_rule', 'refresh_rule'] as const) expect(c[k], `${c.panel_id}.${k}`).toBeTruthy();
      expect(c.project_id).toBe('ACTIVE_PROJECT');
      expect(SOURCES.includes(c.panel_id), c.panel_id).toBe(true);
    }
  });
  it('decision panels declare their transition and the tabs it reaches', () => {
    for (const c of GRAPH_PANEL_CONTRACTS.filter((x) => x.primary_action?.startsWith('Approve'))) {
      expect(c.state_transition, c.panel_id).toMatch(/APPROVE/);
      expect(c.downstream_effects.length, c.panel_id).toBe(7);
    }
  });
  it('every audited panel is classified with the canonical vocabulary and has a disposition', () => {
    const ids = new Set<string>();
    for (const [id, , cls, disp] of AUDITED_PANELS) {
      expect(ids.has(id), id).toBe(false);
      ids.add(id);
      expect(cls.length, id).toBeGreaterThan(0);
      for (const c of cls) expect(PANEL_CLASSIFICATIONS, id).toContain(c);
      // a leak is never simply kept
      if (cls.includes('PROJECT_LEAK')) expect(disp, id).not.toBe('KEPT');
    }
  });
});
