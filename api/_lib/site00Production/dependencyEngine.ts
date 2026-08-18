import type { DeliverableStatus } from './types.js';

export type DeliverableRecord = {
  id: string;
  deliverable_key: string;
  status: DeliverableStatus | string;
  blocked_by: string[];
};

const TERMINAL_STATUSES = new Set(['APPROVED', 'CLIENT_APPROVED', 'DELIVERED']);

export function isDependencySatisfied(status: string): boolean {
  return TERMINAL_STATUSES.has(status) || status === 'CLIENT_REVIEW';
}

export function recomputeDeliverableReadiness(
  deliverables: DeliverableRecord[],
  dependencyMap: Map<string, string[]>,
): DeliverableRecord[] {
  const byKey = new Map(deliverables.map((d) => [d.deliverable_key, d]));

  return deliverables.map((d) => {
    const deps = dependencyMap.get(d.deliverable_key) ?? d.blocked_by ?? [];
    const unmet = deps.filter((key) => {
      const upstream = byKey.get(key);
      return !upstream || !isDependencySatisfied(String(upstream.status));
    });

    if (unmet.length > 0) {
      return { ...d, status: 'BLOCKED', blocked_by: unmet };
    }
    if (d.status === 'BLOCKED' || d.status === 'NOT_READY') {
      return { ...d, status: 'READY', blocked_by: [] };
    }
    return { ...d, blocked_by: unmet };
  });
}

export function buildDependencyMapFromRecipe(
  recipeRows: Array<{ deliverable_key: string; depends_on: string[] | unknown }>,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const row of recipeRows) {
    const deps = Array.isArray(row.depends_on) ? row.depends_on : [];
    map.set(row.deliverable_key, deps.map(String));
  }
  return map;
}
