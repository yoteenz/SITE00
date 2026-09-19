/**
 * PageInteractionGraph builder
 */

import type { PageInteractionContract, PageInteractionGraph, PageInteractionGraphEdge, RequiredChildSurface } from './types.js';

export function buildPageInteractionGraph(input: {
  pageId: string;
  primaryRoute: string;
  contracts: PageInteractionContract[];
  childSurfaces: RequiredChildSurface[];
}): PageInteractionGraph {
  const nodes = [
    { nodeId: `route:${input.primaryRoute}`, kind: 'ROUTE' as const, label: input.primaryRoute, route: input.primaryRoute },
    ...input.childSurfaces.map((c) => ({
      nodeId: c.childSurfaceId,
      kind: 'CHILD_SURFACE' as const,
      label: c.label,
      route: c.route,
    })),
    ...input.contracts
      .filter((c) => ['TAB_STATE', 'TOGGLE_STATE', 'FILTER_STATE', 'SORT_STATE'].includes(c.targetType))
      .map((c) => ({
        nodeId: `state:${c.interactionId}`,
        kind: 'STATE' as const,
        label: c.label,
      })),
  ];

  const edges: PageInteractionGraphEdge[] = input.contracts.flatMap((c) => {
    const from = `route:${input.primaryRoute}`;
    const to =
      c.targetId ??
      (c.route ? `route:${c.route}` : c.targetType.includes('STATE') ? `state:${c.interactionId}` : undefined);
    if (!to) return [];
    const edgeType: PageInteractionGraphEdge['edgeType'] =
      c.affordanceType === 'TAB' ? 'SELECT' : c.affordanceType === 'TOGGLE' ? 'TOGGLE' : c.affordanceType === 'BACK' ? 'BACK' : 'CLICK';
    return [{ from, to, edgeType, interactionId: c.interactionId }];
  });

  for (const child of input.childSurfaces) {
    if (child.route) {
      edges.push({
        from: child.childSurfaceId,
        to: `route:${input.primaryRoute}`,
        edgeType: 'BACK',
        interactionId: child.parentInteractionId,
      });
    }
  }

  return { pageId: input.pageId, nodes, edges };
}
