/**
 * P0.PCI.3 — ParentNavigationIntentResolver — derive expected child surfaces from family graph.
 */

import type { NavigationPromise, PageFamily } from './types.js';

export function resolveNavigationPromises(input: {
  family: Pick<PageFamily, 'nodes' | 'edges'>;
  parentNodeId: string;
}): NavigationPromise[] {
  const parent = input.family.nodes.find((n) => n.nodeId === input.parentNodeId);
  if (!parent) return [];

  const childEdges = input.family.edges.filter((e) => e.sourceNodeId === input.parentNodeId);
  const promises: NavigationPromise[] = [];

  for (const edge of childEdges) {
    const target = input.family.nodes.find((n) => n.nodeId === edge.targetNodeId);
    if (!target) continue;

    let status: NavigationPromise['status'] = 'PROPOSED';
    if (target.existing && edge.linkageStatus === 'WIRED') status = 'WIRED';
    else if (target.existing) status = 'MISSING';
    else if (target.statusLabel === 'PROPOSED') status = 'PROPOSED';
    if (edge.entryPointCount > 1) status = 'AMBIGUOUS';

    promises.push({
      promiseId: `promise:${edge.edgeId}`,
      sourceElement: edge.sourceElementId,
      sourceLabel: edge.sourceElementLabel,
      sourceIntent: `Navigate to ${target.label}`,
      navigationType: edge.navigationMode,
      expectedChildRoute: target.route,
      expectedChildLabel: target.label,
      currentTarget: target.existing ? target.route : null,
      status,
      confidence: target.existing ? 0.92 : 0.65,
      targetNodeId: target.nodeId,
    });
  }

  return promises;
}

export function summarizeNavigationDetection(promises: NavigationPromise[]): {
  total: number;
  existing: number;
  proposed: number;
  broken: number;
  headline: string;
} {
  const existing = promises.filter((p) => p.status === 'WIRED').length;
  const proposed = promises.filter((p) => p.status === 'PROPOSED' || p.status === 'MISSING').length;
  const broken = promises.filter((p) => p.status === 'BROKEN' || p.status === 'AMBIGUOUS').length;
  return {
    total: promises.length,
    existing,
    proposed,
    broken,
    headline: `${promises.length} NAVIGATION PROMISE${promises.length === 1 ? '' : 'S'}`,
  };
}
