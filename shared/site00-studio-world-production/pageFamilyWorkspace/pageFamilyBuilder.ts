/**
 * P0.PCI.3 — Build PageFamily tree from canonical page mirror rows.
 */

import type {
  LinkageStatus,
  NavigationType,
  PageFamily,
  PageFamilyEdge,
  PageFamilyNode,
  PageFamilyRowInput,
  DerivativeStatus,
} from './types.js';
import { resolveNavigationPromises } from './parentNavigationIntentResolver.js';
import {
  isRootAliasRoute,
  resolveCanonicalRootDisplayName,
  resolveCanonicalRootRoute,
  resolveRootScreenId,
} from './pageFamilyRootTarget.js';

function normalizeRoute(route: string): string {
  const trimmed = route.split('?')[0]?.replace(/\/+$/, '') ?? '';
  return trimmed.toLowerCase() || '/';
}

function routeLabel(route: string, fallback: string): string {
  const segment = route.split('/').filter(Boolean).pop();
  return (segment ?? fallback).replace(/-/g, ' ').toUpperCase();
}

function routeDepthFromProject(route: string, projectPrefix: string): number {
  if (!route.startsWith(`${projectPrefix}/`)) return route === projectPrefix ? 0 : -1;
  return route.slice(projectPrefix.length + 1).split('/').filter(Boolean).length;
}

function captureDerivativeStatus(row: PageFamilyRowInput | undefined): DerivativeStatus {
  if (!row) return 'PROPOSED';
  const raw = (row.resolvedCaptureState ?? row.pageCaptureStatus ?? '').toUpperCase();
  if (raw === 'CURRENT') return 'CURRENT';
  if (raw === 'FAILED' || raw === 'CAPTURE_FAILED') return 'NEEDS_REVIEW';
  if (raw === 'CAPTURING' || raw === 'QUEUED') return 'CAPTURE_PENDING';
  if (row.neverCaptured || raw === 'NEVER_CAPTURED') return 'CAPTURE_PENDING';
  if (row.isStale) return 'NEEDS_REVIEW';
  if (row.missingImplementation) return 'DESIGN_PENDING';
  return 'CAPTURE_PENDING';
}

function nodeVisual(status: DerivativeStatus, existing: boolean): PageFamilyNode['statusVisual'] {
  if (!existing) return 'proposed';
  if (status === 'CURRENT' || status === 'APPROVED' || status === 'WIRED' || status === 'BUILT') return 'ready';
  if (status === 'NEEDS_REVIEW' || status === 'CAPTURE_PENDING' || status === 'DESIGN_PENDING') return 'attention';
  if (status === 'BROKEN') return 'offline';
  return 'neutral';
}

function nodeStatusLabel(status: DerivativeStatus, existing: boolean): string {
  if (!existing) return 'PROPOSED';
  switch (status) {
    case 'CURRENT':
      return 'EXISTING';
    case 'WIRED':
      return 'WIRED';
    case 'APPROVED':
      return 'APPROVED';
    case 'NEEDS_REVIEW':
      return 'NEEDS REVIEW';
    case 'CAPTURE_PENDING':
      return 'NEEDS CAPTURE';
    case 'DESIGN_PENDING':
      return 'NEEDS DESIGN';
    case 'PROPOSED':
      return 'PROPOSED';
    default:
      return status.replace(/_/g, ' ');
  }
}

function linkageFor(existing: boolean, wired: boolean): LinkageStatus {
  if (!existing) return 'UNWIRED';
  return wired ? 'WIRED' : 'UNWIRED';
}

function inferArchetype(route: string): string {
  const r = route.toLowerCase();
  if (r.includes('library')) return 'LIBRARY';
  if (r.includes('experiment') || r.includes('review')) return 'REVIEW';
  if (r.includes('settings') || r.includes('more')) return 'SETTINGS';
  if (r.includes('design')) return 'WORKSPACE';
  return 'OPERATIONS';
}

function inferNavType(route: string): NavigationType {
  if (route.includes('tab=')) return 'TAB';
  if (route.includes('modal')) return 'MODAL';
  return 'ROUTE';
}

export function buildPageFamilyFromRows(input: {
  projectId: string;
  rows: PageFamilyRowInput[];
  rootRoute?: string;
  activeParentRoute?: string;
}): PageFamily {
  const projectPrefix = `/projects/${input.projectId}`.toLowerCase();
  const rowByRoute = new Map<string, PageFamilyRowInput>();

  for (const row of input.rows) {
    const route = normalizeRoute(row.normalizedRoute ?? row.route ?? '');
    if (route.startsWith(projectPrefix)) rowByRoute.set(route, row);
  }

  const rootResolution = resolveCanonicalRootRoute(input.projectId, input.rows);
  const rootRoute = normalizeRoute(input.rootRoute ?? rootResolution.canonicalRoute);
  const rootAliases = rootResolution.aliases;

  const subfamilyAnchor = input.activeParentRoute ? normalizeRoute(input.activeParentRoute) : null;
  const parentRoute = subfamilyAnchor && subfamilyAnchor !== rootRoute ? subfamilyAnchor : rootRoute;
  const parentNodeId = `node:${parentRoute}`;
  const parentRow =
    rowByRoute.get(parentRoute) ??
    (parentRoute === rootRoute ? rootResolution.rootRow : undefined) ??
    rowByRoute.get(rootRoute);
  const parentCapture = captureDerivativeStatus(parentRow);
  const parentExisting = Boolean(parentRow);
  const rootScreenId = resolveRootScreenId(input.projectId, parentRow);
  const rootCanonicalLabel = resolveCanonicalRootDisplayName(input.projectId, parentRow);

  const nodes: PageFamilyNode[] = [];
  const edges: PageFamilyEdge[] = [];

  nodes.push({
    nodeId: parentNodeId,
    route: parentRoute === rootRoute ? rootRoute : parentRoute,
    surfaceId: parentRow?.screenId ?? rootScreenId ?? parentNodeId,
    label: parentRoute === rootRoute ? rootCanonicalLabel : parentRow?.displayName?.toUpperCase() ?? routeLabel(parentRoute, input.projectId.toUpperCase()),
    level: 0,
    archetype: 'OVERVIEW',
    inheritanceMode: null,
    existing: parentExisting,
    designStatus: parentExisting ? 'DESIGN_READY' : 'PROPOSED',
    buildStatus: parentExisting ? 'BUILT' : 'PROPOSED',
    linkageStatus: linkageFor(parentExisting, true),
    captureStatus: parentCapture,
    parentNodeId: null,
    childCount: 0,
    previewUrl: parentRow?.mobile?.publicUrl ?? null,
    referenceUrl: parentRow?.referenceUrl ?? null,
    screenId: rootScreenId,
    statusVisual: nodeVisual(parentCapture, parentExisting),
    statusLabel: parentExisting ? 'MAPPED' : 'PROPOSED',
    derivedFromLabel: null,
  });

  const parentDepth = subfamilyAnchor ? routeDepthFromProject(parentRoute, projectPrefix) : 0;
  const targetChildDepth = parentDepth + 1;

  const childRoutes = new Map<string, { row?: PageFamilyRowInput; grandchildren: string[] }>();

  for (const [route, row] of rowByRoute) {
    if (route === parentRoute) continue;
    if (parentRoute === rootRoute && isRootAliasRoute(route, input.projectId, rootAliases)) continue;
    const depth = routeDepthFromProject(route, projectPrefix);
    if (depth < 0) continue;

    if (!subfamilyAnchor) {
      if (depth === 1 && route !== parentRoute) {
        if (!childRoutes.has(route)) childRoutes.set(route, { row, grandchildren: [] });
        else childRoutes.get(route)!.row = row;
      } else if (depth === 2) {
        const segments = route.slice(projectPrefix.length + 1).split('/').filter(Boolean);
        const childRoute = `${projectPrefix}/${segments[0]}`.toLowerCase();
        if (!childRoutes.has(childRoute)) childRoutes.set(childRoute, { grandchildren: [] });
        childRoutes.get(childRoute)!.grandchildren.push(route);
      }
    } else {
      if (!route.startsWith(`${parentRoute}/`)) continue;
      const relative = route.slice(parentRoute.length + 1);
      const segments = relative.split('/').filter(Boolean);
      if (segments.length === 0) continue;
      const childRoute = `${parentRoute}/${segments[0]}`.toLowerCase();
      if (!childRoutes.has(childRoute)) childRoutes.set(childRoute, { grandchildren: [] });
      const bucket = childRoutes.get(childRoute)!;
      if (segments.length === 1) bucket.row = row;
      else bucket.grandchildren.push(route);
    }
  }

  if (!subfamilyAnchor && targetChildDepth === 1) {
    for (const [route, row] of rowByRoute) {
      const depth = routeDepthFromProject(route, projectPrefix);
      if (depth !== 1 || route === parentRoute) continue;
      if (parentRoute === rootRoute && isRootAliasRoute(route, input.projectId, rootAliases)) continue;
      if (!childRoutes.has(route)) childRoutes.set(route, { row, grandchildren: [] });
    }
  }

  for (const [childRoute, bucket] of childRoutes) {
    const childRow = bucket.row ?? rowByRoute.get(childRoute);
    const childNodeId = `node:${childRoute}`;
    const capture = captureDerivativeStatus(childRow);
    const existing = Boolean(childRow);
    const wired = existing && capture !== 'PROPOSED';

    nodes.push({
      nodeId: childNodeId,
      route: childRoute,
      surfaceId: childRow?.screenId ?? childNodeId,
      label: childRow?.displayName?.toUpperCase() ?? routeLabel(childRoute, 'PAGE'),
      level: 1,
      archetype: inferArchetype(childRoute),
      inheritanceMode: 'INHERIT_GRAMMAR',
      existing,
      designStatus: existing ? 'DESIGN_READY' : 'PROPOSED',
      buildStatus: existing ? 'BUILT' : 'PROPOSED',
      linkageStatus: linkageFor(existing, wired),
      captureStatus: capture,
      parentNodeId,
      childCount: bucket.grandchildren.length,
      previewUrl: childRow?.mobile?.publicUrl ?? null,
      referenceUrl: childRow?.referenceUrl ?? null,
      screenId: childRow?.screenId ?? null,
      statusVisual: nodeVisual(capture, existing),
      statusLabel: nodeStatusLabel(capture, existing),
      derivedFromLabel: nodes[0]?.label ?? null,
    });

    if (childNodeId === parentNodeId) continue;

    edges.push({
      edgeId: `edge:${parentNodeId}:${childNodeId}`,
      sourceNodeId: parentNodeId,
      targetNodeId: childNodeId,
      sourceElementId: `nav:${childRoute}`,
      sourceElementLabel: routeLabel(childRoute, 'CHILD'),
      navigationMode: inferNavType(childRoute),
      linkageStatus: linkageFor(existing, wired),
      entryPointCount: 1,
    });

    for (const gcRoute of bucket.grandchildren) {
      const gcRow = rowByRoute.get(gcRoute);
      const gcNodeId = `node:${gcRoute}`;
      const gcCapture = captureDerivativeStatus(gcRow);
      const gcExisting = Boolean(gcRow);

      nodes.push({
        nodeId: gcNodeId,
        route: gcRoute,
        surfaceId: gcRow?.screenId ?? gcNodeId,
        label: gcRow?.displayName?.toUpperCase() ?? routeLabel(gcRoute, 'PAGE'),
        level: 2,
        archetype: inferArchetype(gcRoute),
        inheritanceMode: 'INHERIT_GRAMMAR',
        existing: gcExisting,
        designStatus: gcExisting ? 'DESIGN_READY' : 'PROPOSED',
        buildStatus: gcExisting ? 'BUILT' : 'PROPOSED',
        linkageStatus: linkageFor(gcExisting, gcExisting),
        captureStatus: gcCapture,
        parentNodeId: childNodeId,
        childCount: 0,
        previewUrl: gcRow?.mobile?.publicUrl ?? null,
        referenceUrl: gcRow?.referenceUrl ?? null,
        screenId: gcRow?.screenId ?? null,
        statusVisual: nodeVisual(gcCapture, gcExisting),
        statusLabel: nodeStatusLabel(gcCapture, gcExisting),
        derivedFromLabel: routeLabel(childRoute, 'PARENT'),
      });

      edges.push({
        edgeId: `edge:${childNodeId}:${gcNodeId}`,
        sourceNodeId: childNodeId,
        targetNodeId: gcNodeId,
        sourceElementId: `nav:${gcRoute}`,
        sourceElementLabel: routeLabel(gcRoute, 'SUBPAGE'),
        navigationMode: inferNavType(gcRoute),
        linkageStatus: linkageFor(gcExisting, gcExisting),
        entryPointCount: 1,
      });
    }
  }

  nodes[0]!.childCount = childRoutes.size;

  const partialFamily = { nodes, edges } as PageFamily;
  const promises = resolveNavigationPromises({ family: partialFamily, parentNodeId });

  return {
    familyId: `family:${input.projectId}:${parentRoute}`,
    projectId: input.projectId,
    rootParentRoute: rootRoute,
    rootParentSurfaceId: parentNodeId,
    familyName: rootCanonicalLabel,
    authorityVersion: 'pci3-v1',
    nodeCount: nodes.length,
    childCount: nodes.filter((n) => n.level === 1).length,
    grandchildCount: nodes.filter((n) => n.level === 2).length,
    status: 'DRAFT',
    approvedAt: null,
    nodes,
    edges,
    promises,
  };
}

export function listSiblingNodes(family: PageFamily, nodeId: string): PageFamilyNode[] {
  const node = family.nodes.find((n) => n.nodeId === nodeId);
  if (!node) return [];
  return family.nodes.filter((n) => n.parentNodeId === node.parentNodeId && n.level === node.level);
}

export function detectRouteCycle(family: PageFamily): string[] {
  const cycles: string[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const dfs = (nodeId: string, stack: string[]) => {
    if (visiting.has(nodeId)) {
      cycles.push(`ROUTE_CYCLE:${stack.join('→')}→${nodeId}`);
      return;
    }
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    for (const edge of family.edges.filter((e) => e.sourceNodeId === nodeId)) {
      dfs(edge.targetNodeId, [...stack, nodeId]);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  const root = family.nodes.find((n) => n.level === 0);
  if (root) dfs(root.nodeId, []);
  return cycles;
}
