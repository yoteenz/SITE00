/**
 * PageInteractionGraphQA — orphan / dead-end detection
 */

import type { PageCompletenessGateResult, PageInteractionContract, PageInteractionGraph } from './types.js';

export function auditPageInteractionGraph(input: {
  graph: PageInteractionGraph;
  contracts: PageInteractionContract[];
  primaryRoute: string;
}): string[] {
  const failures: string[] = [];
  const nodeIds = new Set(input.graph.nodes.map((n) => n.nodeId));
  const reachable = new Set<string>([`route:${input.primaryRoute}`]);

  for (const edge of input.graph.edges) {
    if (!nodeIds.has(edge.from)) failures.push('PAGE_INTERACTION_GRAPH_ORPHAN');
    if (!nodeIds.has(edge.to)) failures.push('PAGE_ROUTE_GRAPH_ORPHAN');
    if (edge.from.startsWith('route:') || reachable.has(edge.from)) reachable.add(edge.to);
  }

  for (const contract of input.contracts) {
    if (contract.status === 'AMBIGUOUS') continue;
    if (contract.status === 'NO_OP_INTENTIONAL') continue;
    if (contract.intent === 'UNRESOLVED') failures.push('PAGE_INTERACTION_UNRESOLVED');
    if (!contract.returnPath && contract.targetType !== 'TAB_STATE' && contract.affordanceType !== 'TAB') {
      if (!['FILTER', 'SORT', 'SEARCH', 'SUBMIT', 'CANCEL'].includes(contract.affordanceType)) {
        failures.push('PAGE_CHILD_NO_RETURN_PATH');
      }
    }
    if (contract.status === 'PLANNED' && contract.confidence === 'HIGH') {
      failures.push('PAGE_CHILD_SURFACE_MISSING');
    }
  }

  for (const contract of input.contracts) {
    if (contract.status === 'AMBIGUOUS' || contract.intent === 'UNRESOLVED') {
      failures.push('PAGE_VISIBLE_ACTION_NO_IMPLEMENTATION');
    }
  }

  return [...new Set(failures)];
}

export function countGraphOrphans(graph: PageInteractionGraph, primaryRoute: string): number {
  const reachable = new Set<string>([`route:${primaryRoute}`]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of graph.edges) {
      if (reachable.has(edge.from) && !reachable.has(edge.to)) {
        reachable.add(edge.to);
        changed = true;
      }
    }
  }
  return graph.nodes.filter((n) => !reachable.has(n.nodeId)).length;
}

export function buildGateResultFromAudit(failures: string[], stats: {
  unresolved: number;
  orphans: number;
  missingChildren: number;
  missingRoutes: number;
}): PageCompletenessGateResult {
  return {
    passed: failures.length === 0,
    failureCodes: failures,
    unresolvedCount: stats.unresolved,
    orphanCount: stats.orphans,
    missingChildCount: stats.missingChildren,
    missingRouteCount: stats.missingRoutes,
  };
}
