/**
 * InteractiveSurfaceGraph — experience tree aligned with navigation tree.
 */

import type {
  InteractiveSurfaceGraph,
  InteractiveSurfaceGraphEdge,
  InteractiveSurfaceGraphNode,
  ParentChildLinkageContract,
} from './types.js';

function slug(s: string): string {
  return s.replace(/^\//, '').replace(/[/:?&=]/g, '-');
}

export function buildInteractiveSurfaceGraph(input: {
  projectId: string;
  parentRoute: string;
  parentSurfaceId: string;
  contracts: ParentChildLinkageContract[];
}): InteractiveSurfaceGraph {
  const nodes: InteractiveSurfaceGraphNode[] = [
    {
      nodeId: `page-${slug(input.parentSurfaceId)}`,
      kind: 'PAGE',
      route: input.parentRoute,
      surfaceId: input.parentSurfaceId,
      label: 'PARENT',
    },
  ];
  const edges: InteractiveSurfaceGraphEdge[] = [];
  const seen = new Set<string>();

  for (const contract of input.contracts) {
    const childNodeId = `surface-${slug(contract.targetSurfaceId)}`;
    if (!seen.has(childNodeId)) {
      seen.add(childNodeId);
      nodes.push({
        nodeId: childNodeId,
        kind: modeToKind(contract.navigationMode),
        route: contract.targetChildRoute,
        surfaceId: contract.targetSurfaceId,
        label: contract.sourceLabel,
      });
    }

    edges.push({
      from: `page-${slug(input.parentSurfaceId)}`,
      to: childNodeId,
      edgeKind: contract.navigationMode === 'WORKFLOW_STEP' ? 'CONTINUES_TO' : 'NAVIGATES_TO',
      linkageId: contract.linkageId,
      navigationMode: contract.navigationMode,
    });

    if (contract.backTarget) {
      edges.push({
        from: childNodeId,
        to: `page-${slug(input.parentSurfaceId)}`,
        edgeKind: 'RETURNS_TO',
        linkageId: contract.linkageId,
      });
    }
  }

  return {
    graphId: `isg-${input.projectId}-${Date.now()}`,
    projectId: input.projectId,
    nodes,
    edges,
  };
}

function modeToKind(mode: ParentChildLinkageContract['navigationMode']): InteractiveSurfaceGraphNode['kind'] {
  switch (mode) {
    case 'TAB_STATE':
      return 'TAB';
    case 'MODAL':
      return 'MODAL';
    case 'DRAWER':
      return 'DRAWER';
    case 'SHEET':
      return 'SHEET';
    case 'WORKFLOW_STEP':
      return 'WORKFLOW_STEP';
    default:
      return 'PAGE';
  }
}

export function findUnlinkedSurfaceIds(input: {
  graph: InteractiveSurfaceGraph;
  registeredSurfaceIds: string[];
}): string[] {
  return input.registeredSurfaceIds.filter((id) => !input.graph.nodes.some((n) => n.surfaceId === id));
}

export function findOrphanSurfaceNodes(
  graph: InteractiveSurfaceGraph,
  registeredSurfaceIds: string[],
): InteractiveSurfaceGraphNode[] {
  const parentId = graph.nodes.find((n) => n.kind === 'PAGE')?.nodeId;
  const reachable = new Set<string>();
  if (parentId) {
    const queue = [parentId];
    while (queue.length) {
      const id = queue.pop()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      graph.edges.filter((e) => e.from === id && e.edgeKind !== 'RETURNS_TO').forEach((e) => queue.push(e.to));
    }
  }

  return graph.nodes.filter(
    (n) =>
      n.kind !== 'PAGE' &&
      registeredSurfaceIds.includes(n.surfaceId) &&
      !reachable.has(n.nodeId),
  );
}
