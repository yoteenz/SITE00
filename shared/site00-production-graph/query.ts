/**
 * Panel queries. Every panel asks ONE question of ONE project's graph:
 *
 *   getWorkspacePanelData({ graph, projectId, workspaceDomain, panelId, nodeId })
 *
 * No panel reads "whatever global data exists". Every count a panel shows is the length of a list this module
 * returns — so a count is always queryable (click → the same records).
 */
import { isTopLevel } from './graph.js';
import type {
  ArtifactRecord,
  ArtifactStatus,
  DecisionItem,
  DecisionState,
  NodeStage,
  ProductionBlocker,
  ProductionEvent,
  ProductionNode,
  ProjectProductionGraph,
  WorkDomain,
  WorkspaceDomain,
} from './types.js';
import { NODE_STAGES } from './types.js';

export class ProjectScopeViolation extends Error {
  constructor(expected: string, got: string) {
    super(`PROJECT_SCOPE_VIOLATION: panel asked for ${expected} but the graph belongs to ${got}`);
  }
}

export const domainNodes = (g: ProjectProductionGraph, d: WorkDomain) => g.nodes.filter((n) => n.domain === d);
export const topLevelNodes = (g: ProjectProductionGraph, d?: WorkDomain) => g.nodes.filter((n) => isTopLevel(n) && (!d || n.domain === d));
export const nodeById = (g: ProjectProductionGraph, id: string | null | undefined) => (id ? (g.nodes.find((n) => n.node_id === id) ?? null) : null);
export const childrenOf = (g: ProjectProductionGraph, id: string) => g.nodes.filter((n) => n.parent_id === id);

/** Every real blocker of the project (each one: node, reason, upstream, severity, owner, action, downstream effect). */
export const projectBlockers = (g: ProjectProductionGraph): ProductionBlocker[] => g.nodes.flatMap((n) => n.blockers);

export const decisionsIn = (g: ProjectProductionGraph, state: DecisionState | 'ALL') =>
  g.decisions.filter((d) => state === 'ALL' || d.state === state).sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'HIGH' ? -1 : 1));

export const artifactsIn = (g: ProjectProductionGraph, status: ArtifactStatus | 'ALL') => g.artifacts.filter((a) => status === 'ALL' || a.status === status);

export const eventsFor = (g: ProjectProductionGraph, nodeId?: string | null) => (nodeId ? g.events.filter((e) => e.node_id === nodeId) : g.events);

export function stageBreakdown(nodes: readonly ProductionNode[]): { stage: NodeStage; count: number }[] {
  return NODE_STAGES.map((stage) => ({ stage, count: nodes.filter((n) => n.current_stage === stage).length })).filter((s) => s.count > 0);
}

/** HUB control-plane numbers — every one is a list length. */
export function hubSummary(g: ProjectProductionGraph) {
  const top = g.nodes.filter(isTopLevel);
  const complete = top.filter((n) => n.status === 'COMPLETE');
  return {
    topLevel: top,
    complete,
    progressPercent: top.length ? Math.round((complete.length / top.length) * 100) : 0,
    needsYou: decisionsIn(g, 'NEEDS_YOU'),
    watching: decisionsIn(g, 'WATCHING'),
    resolved: decisionsIn(g, 'RESOLVED'),
    blockers: projectBlockers(g),
    reviewNodes: g.nodes.filter((n) => n.status === 'REVIEW_REQUIRED'),
    stages: stageBreakdown(top),
    events: g.events,
    canonicalArtifacts: artifactsIn(g, 'CANONICAL'),
  };
}

export type PanelQuery = {
  graph: ProjectProductionGraph;
  projectId: string;
  workspaceDomain: WorkspaceDomain;
  panelId: string;
  nodeId?: string | null;
};

export type PanelData =
  | { kind: 'NODES'; rows: readonly ProductionNode[] }
  | { kind: 'DECISIONS'; rows: DecisionItem[] }
  | { kind: 'ARTIFACTS'; rows: readonly ArtifactRecord[] }
  | { kind: 'EVENTS'; rows: readonly ProductionEvent[] }
  | { kind: 'BLOCKERS'; rows: ProductionBlocker[] }
  | { kind: 'NODE'; row: ProductionNode | null };

/** The one panel query. Throws when a panel tries to read another project's graph. */
export function getWorkspacePanelData(q: PanelQuery): PanelData {
  if (q.projectId !== q.graph.project_id) throw new ProjectScopeViolation(q.projectId, q.graph.project_id);
  const g = q.graph;
  switch (q.panelId) {
    case 'needs-you':
      return { kind: 'DECISIONS', rows: decisionsIn(g, 'NEEDS_YOU') };
    case 'watching':
      return { kind: 'DECISIONS', rows: decisionsIn(g, 'WATCHING') };
    case 'resolved':
      return { kind: 'DECISIONS', rows: decisionsIn(g, 'RESOLVED') };
    case 'blockers':
      return { kind: 'BLOCKERS', rows: projectBlockers(g) };
    case 'events':
      return { kind: 'EVENTS', rows: eventsFor(g, q.nodeId) };
    case 'artifacts':
      return { kind: 'ARTIFACTS', rows: q.nodeId ? g.artifacts.filter((a) => a.source_node_id === q.nodeId) : g.artifacts };
    case 'node':
      return { kind: 'NODE', row: nodeById(g, q.nodeId) };
    case 'domain-nodes':
      return { kind: 'NODES', rows: q.workspaceDomain === 'DESIGN' || q.workspaceDomain === 'EXPERIENCE' || q.workspaceDomain === 'EXPRESSION' ? domainNodes(g, q.workspaceDomain) : g.nodes };
    case 'top-level':
      return { kind: 'NODES', rows: topLevelNodes(g) };
    default:
      return { kind: 'NODES', rows: [] };
  }
}
