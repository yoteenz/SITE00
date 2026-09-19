/**
 * ParentChildRouteGraph — discover parent → child route relationships.
 */

import type {
  ParentChildRouteEdge,
  ParentChildRouteGraph,
  ParentChildRouteNode,
  ProjectSurfaceRegistryInput,
  RouteRelationshipType,
} from './types.js';

function slugFromRoute(route: string): string {
  return route.replace(/^\//, '').replace(/[/:?&=]/g, '-') || 'root';
}

function inferRelationship(parentRoute: string, childRoute: string): RouteRelationshipType {
  if (childRoute.includes('?tab=') || childRoute.includes('#')) return 'TAB_CHILD';
  const parentDepth = parentRoute.split('/').filter(Boolean).length;
  const childDepth = childRoute.split('/').filter(Boolean).length;
  if (childDepth === parentDepth + 1) return 'DIRECT_CHILD';
  if (childDepth > parentDepth + 1) return 'GRANDCHILD';
  if (childRoute.includes('/manage') || childRoute.includes('/edit')) return 'EDITOR_CHILD';
  if (childRoute.includes('/detail') || childRoute.includes('/:')) return 'DETAIL_CHILD';
  return 'DIRECT_CHILD';
}

function findParentRoute(route: string, routes: string[]): string | null {
  const normalized = route.replace(/\/$/, '');
  const segments = normalized.split('/').filter(Boolean);

  for (let i = segments.length - 1; i >= 1; i -= 1) {
    const candidate = `/${segments.slice(0, i).join('/')}`;
    if (routes.some((r) => r.replace(/\/$/, '') === candidate)) return candidate;
  }

  const paramParent = routes.find((r) => {
    const pattern = r.replace(/:[^/]+/g, '[^/]+');
    try {
      return new RegExp(`^${pattern}$`).test(normalized) && r !== route;
    } catch {
      return false;
    }
  });

  return paramParent ?? null;
}

function nodeKindFromRelationship(
  relationship: RouteRelationshipType,
  declaredKind?: ParentChildRouteNode['kind'],
): ParentChildRouteNode['kind'] {
  if (declaredKind) return declaredKind;
  switch (relationship) {
    case 'TAB_CHILD':
      return 'TAB_STATE';
    case 'MODAL_CHILD':
      return 'MODAL';
    case 'DRAWER_CHILD':
      return 'DRAWER';
    case 'EMBEDDED_CHILD':
      return 'EMBEDDED';
    case 'WORKFLOW_CHILD':
      return 'WORKSPACE';
    default:
      return 'ROUTE';
  }
}

export function discoverParentChildRouteGraph(input: ProjectSurfaceRegistryInput): ParentChildRouteGraph {
  const routes = [...new Set(input.routes.filter(Boolean))];
  const rootRoute = input.rootRoute.replace(/\/$/, '') || '/';
  const nodes: ParentChildRouteNode[] = [];
  const edges: ParentChildRouteEdge[] = [];
  const seenNodeIds = new Set<string>();

  function addNode(node: ParentChildRouteNode) {
    if (seenNodeIds.has(node.nodeId)) return;
    seenNodeIds.add(node.nodeId);
    nodes.push(node);
  }

  addNode({
    nodeId: `landing-${slugFromRoute(rootRoute)}`,
    route: rootRoute,
    surfaceId: input.parentSignals?.surfaceId ?? `surface-${slugFromRoute(rootRoute)}`,
    label: 'PARENT LANDING',
    kind: 'LANDING',
    viewport: input.parentSignals?.viewport ?? 'UNIVERSAL',
    isParentCandidate: true,
  });

  for (const declared of input.declaredSurfaces ?? []) {
    const parentRoute = declared.parentRoute ?? rootRoute;
    const relationship = declared.relationshipType ?? inferRelationship(parentRoute, declared.route);
    addNode({
      nodeId: declared.surfaceId,
      route: declared.route,
      surfaceId: declared.surfaceId,
      label: declared.label,
      kind: nodeKindFromRelationship(relationship, declared.kind),
      viewport: declared.viewport,
      isParentCandidate: declared.kind === 'LANDING',
      metadata: { moduleScreenType: declared.moduleScreenType, isHostShell: declared.isHostShell },
    });
    edges.push({
      from: `landing-${slugFromRoute(parentRoute)}`.replace(/landing-landing-/, 'landing-'),
      to: declared.surfaceId,
      relationshipType: relationship,
      label: declared.label,
    });
  }

  for (const route of routes) {
    if (route.replace(/\/$/, '') === rootRoute) continue;
    const parentRoute = findParentRoute(route, routes) ?? rootRoute;
    const surfaceId = `surface-${slugFromRoute(route)}`;
    const relationship = inferRelationship(parentRoute, route);

    addNode({
      nodeId: surfaceId,
      route,
      surfaceId,
      label: route.split('/').pop()?.toUpperCase() ?? route,
      kind: nodeKindFromRelationship(relationship),
      isParentCandidate: false,
    });

    const parentNodeId =
      parentRoute.replace(/\/$/, '') === rootRoute
        ? `landing-${slugFromRoute(rootRoute)}`
        : `surface-${slugFromRoute(parentRoute)}`;

    if (!edges.some((e) => e.from === parentNodeId && e.to === surfaceId)) {
      edges.push({ from: parentNodeId, to: surfaceId, relationshipType: relationship });
    }
  }

  return {
    graphId: `pci-graph-${input.projectId}-${Date.now()}`,
    projectId: input.projectId,
    rootRoute,
    nodes,
    edges,
    discoveredAt: new Date().toISOString(),
  };
}

export function listChildNodes(graph: ParentChildRouteGraph, parentNodeId?: string): ParentChildRouteNode[] {
  const parentId = parentNodeId ?? graph.nodes.find((n) => n.kind === 'LANDING')?.nodeId;
  if (!parentId) return graph.nodes.filter((n) => n.kind !== 'LANDING');

  const childIds = new Set(
    graph.edges.filter((e) => e.from === parentId).map((e) => e.to),
  );

  const direct = graph.nodes.filter((n) => childIds.has(n.nodeId));
  const grandchildren = graph.edges
    .filter((e) => childIds.has(e.from))
    .map((e) => graph.nodes.find((n) => n.nodeId === e.to))
    .filter(Boolean) as ParentChildRouteNode[];

  return [...direct, ...grandchildren];
}

export function getRelationshipForNode(
  graph: ParentChildRouteGraph,
  nodeId: string,
): RouteRelationshipType | null {
  const edge = graph.edges.find((e) => e.to === nodeId);
  return edge?.relationshipType ?? null;
}
