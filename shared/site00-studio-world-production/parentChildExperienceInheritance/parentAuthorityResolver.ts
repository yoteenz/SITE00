/**
 * Parent authority resolution — determine experience parent for each child.
 * Does not blindly use URL depth.
 */

import type {
  ParentChildRouteGraph,
  ParentExperienceAuthority,
  RouteRelationshipType,
} from './types.js';

export type ResolvedExperienceParent = {
  childNodeId: string;
  childRoute: string;
  resolvedParentRoute: string;
  resolvedParentNodeId: string;
  resolutionStrategy:
    | 'IMMEDIATE_URL_PARENT'
    | 'MODULE_LANDING'
    | 'PROJECT_HOME'
    | 'WORKFLOW_ROOT'
    | 'SPECIALIZED_DESIGN_AUTHORITY'
    | 'ROOT_LANDING';
  relationshipType: RouteRelationshipType | null;
};

const MODULE_LANDING_PATTERNS: Array<{ pattern: RegExp; landingSuffix: string }> = [
  { pattern: /\/design\?tab=more/, landingSuffix: '/design?tab=more' },
  { pattern: /\/design(\?|$)/, landingSuffix: '/design?tab=pages' },
  { pattern: /\/content-operations/, landingSuffix: '/content-operations/campaign-board' },
  { pattern: /\/more(\?|$)/, landingSuffix: '/design?tab=more' },
  { pattern: /\/realism-lab/, landingSuffix: '/realism-lab/brief' },
];

export function resolveExperienceParent(input: {
  graph: ParentChildRouteGraph;
  childNodeId: string;
  authorities?: ParentExperienceAuthority[];
  moduleLandingOverrides?: Record<string, string>;
}): ResolvedExperienceParent | null {
  const node = input.graph.nodes.find((n) => n.nodeId === input.childNodeId);
  if (!node) return null;

  const edge = input.graph.edges.find((e) => e.to === input.childNodeId);
  const relationshipType = edge?.relationshipType ?? null;

  const designAuthorityParent = node.metadata?.designAuthorityParent as string | undefined;
  if (designAuthorityParent) {
    const parentRoute = designAuthorityParent;
    return {
      childNodeId: node.nodeId,
      childRoute: node.route,
      resolvedParentRoute: parentRoute,
      resolvedParentNodeId: `surface-${parentRoute.replace(/^\//, '').replace(/[/:?&=]/g, '-')}`,
      resolutionStrategy: 'SPECIALIZED_DESIGN_AUTHORITY',
      relationshipType,
    };
  }

  if (edge) {
    const parentNode = input.graph.nodes.find((n) => n.nodeId === edge.from);
    if (parentNode && (parentNode.kind === 'LANDING' || parentNode.route.includes('tab=more'))) {
      return {
        childNodeId: node.nodeId,
        childRoute: node.route,
        resolvedParentRoute: parentNode.route,
        resolvedParentNodeId: parentNode.nodeId,
        resolutionStrategy: parentNode.kind === 'LANDING' ? 'ROOT_LANDING' : 'IMMEDIATE_URL_PARENT',
        relationshipType,
      };
    }
  }

  for (const { pattern, landingSuffix } of MODULE_LANDING_PATTERNS) {
    if (pattern.test(node.route)) {
      const base = node.route.match(/^(\/projects\/[^/]+)/)?.[1];
      if (base) {
        const landing = input.moduleLandingOverrides?.[pattern.source] ?? `${base}${landingSuffix}`;
        return {
          childNodeId: node.nodeId,
          childRoute: node.route,
          resolvedParentRoute: landing,
          resolvedParentNodeId: `landing-${landing.replace(/^\//, '').replace(/[/:?&=]/g, '-')}`,
          resolutionStrategy: 'MODULE_LANDING',
          relationshipType,
        };
      }
    }
  }

  if (edge) {
    const parentNode = input.graph.nodes.find((n) => n.nodeId === edge.from);
    if (parentNode) {
      return {
        childNodeId: node.nodeId,
        childRoute: node.route,
        resolvedParentRoute: parentNode.route,
        resolvedParentNodeId: parentNode.nodeId,
        resolutionStrategy: parentNode.kind === 'LANDING' ? 'ROOT_LANDING' : 'IMMEDIATE_URL_PARENT',
        relationshipType,
      };
    }
  }

  const projectHome = node.route.match(/^(\/projects\/[^/]+)/)?.[1];
  if (projectHome && projectHome !== node.route) {
    return {
      childNodeId: node.nodeId,
      childRoute: node.route,
      resolvedParentRoute: `${projectHome}/overview`,
      resolvedParentNodeId: `surface-${projectHome.replace(/^\//, '')}-overview`,
      resolutionStrategy: 'PROJECT_HOME',
      relationshipType,
    };
  }

  return {
    childNodeId: node.nodeId,
    childRoute: node.route,
    resolvedParentRoute: input.graph.rootRoute,
    resolvedParentNodeId: input.graph.nodes.find((n) => n.kind === 'LANDING')?.nodeId ?? 'root',
    resolutionStrategy: 'ROOT_LANDING',
    relationshipType,
  };
}

export function resolveAllExperienceParents(input: {
  graph: ParentChildRouteGraph;
  authorities?: ParentExperienceAuthority[];
}): ResolvedExperienceParent[] {
  return input.graph.nodes
    .filter((n) => n.kind !== 'LANDING')
    .map((n) =>
      resolveExperienceParent({ graph: input.graph, childNodeId: n.nodeId, authorities: input.authorities }),
    )
    .filter(Boolean) as ResolvedExperienceParent[];
}
