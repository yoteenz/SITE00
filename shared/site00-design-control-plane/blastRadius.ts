/**
 * P0.BRIDGE.1 — Blast radius calculation for change requests.
 */

import type { BlastRadiusSummary, Site00ChangeOperationRecord, Site00ChangeScope } from './types.js';

export function calculateBlastRadius(input: {
  scope: Site00ChangeScope;
  routeKey?: string | null;
  pageKey?: string | null;
  familyKey?: string | null;
  shellKey?: string | null;
  operations: Site00ChangeOperationRecord[];
}): BlastRadiusSummary {
  const routes = new Set<string>();
  const pages = new Set<string>();
  const families = new Set<string>();
  const components = new Set<string>();
  const viewports = new Set<string>();

  if (input.routeKey) {
    routes.add(input.routeKey);
    pages.add(input.pageKey ?? input.routeKey);
  }
  if (input.pageKey) pages.add(input.pageKey);
  if (input.familyKey) families.add(input.familyKey);

  for (const op of input.operations) {
    if (op.targetSelector) routes.add(op.targetSelector);
    if (op.targetComponentKey) components.add(op.targetComponentKey);
    const vp = op.payload?.viewport;
    if (typeof vp === 'string') viewports.add(vp);
  }

  if (input.scope === 'DESIGN_FAMILY' && input.familyKey) {
    families.add(input.familyKey);
  }

  if (input.scope === 'SHARED_SHELL_GLOBAL' && input.shellKey) {
    pages.add('*shell-consumers*');
  }

  const staleRefs = [...pages].map((p) => `ref:${p}`);
  const staleSnaps = [...pages].map((p) => `snap:${p}`);

  return {
    affectedPages: [...pages],
    affectedFamilies: [...families],
    affectedRoutes: [...routes],
    affectedComponents: [...components],
    affectedViewports: viewports.size ? [...viewports] : ['mobile', 'tablet', 'desktop'],
    referencesPotentiallyStale: staleRefs,
    snapshotsPotentiallyStale: staleSnaps,
  };
}

export function markReferenceAndSnapshotStaleness(
  blastRadius: BlastRadiusSummary,
): { referenceIds: string[]; snapshotIds: string[] } {
  return {
    referenceIds: blastRadius.referencesPotentiallyStale,
    snapshotIds: blastRadius.snapshotsPotentiallyStale,
  };
}
