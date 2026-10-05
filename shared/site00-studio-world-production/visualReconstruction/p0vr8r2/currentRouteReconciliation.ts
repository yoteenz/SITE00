/**
 * P0.VR.8R2 — Reconcile recovered prior routes with current repository state.
 */

import type { PriorAuditVsCurrentReport, RecoveredRouteRecord } from './types.js';
import { classifyAllRoutes } from './routeIdentityMatcher.js';
import { P0_VR_8R2_LINEAGE } from './constants.js';

/** Browser-safe current route projection — inventory paths are canonical; removed routes stay HISTORICAL. */
export function buildCurrentRoutesFromRepo(_projectId: string, priorRoutes: RecoveredRouteRecord[]): RecoveredRouteRecord[] {
  return priorRoutes
    .filter((r) => r.visibility !== 'REMOVED')
    .map((r) => ({
      ...r,
      routeCurrentness: r.routeCurrentness === 'ROUTE_REMOVED' ? ('ROUTE_REMOVED' as const) : ('ROUTE_CURRENT' as const),
    }));
}

export function reconcilePriorVsCurrent(
  projectId: string,
  priorRoutes: RecoveredRouteRecord[],
  currentRoutes: RecoveredRouteRecord[],
): PriorAuditVsCurrentReport {
  const classified = classifyAllRoutes(priorRoutes, currentRoutes);

  const counts = {
    unchanged: 0,
    updated: 0,
    new: 0,
    removed: 0,
    moved: 0,
    reAttributed: 0,
  };

  for (const row of classified) {
    switch (row.classification) {
      case 'UNCHANGED':
        counts.unchanged++;
        break;
      case 'UPDATED':
        counts.updated++;
        break;
      case 'NEW':
        counts.new++;
        break;
      case 'REMOVED':
        counts.removed++;
        break;
      case 'MOVED':
        counts.moved++;
        break;
      case 'RENAMED':
      case 'ATTRIBUTION_CHANGED':
        counts.reAttributed++;
        break;
      default:
        break;
    }
  }

  const perProject: PriorAuditVsCurrentReport['perProject'] = {
    [projectId]: {
      prior: priorRoutes.length,
      current: currentRoutes.filter((r) => r.routeCurrentness !== 'ROUTE_REMOVED').length,
      unchanged: counts.unchanged,
      new: counts.new,
      removed: counts.removed,
    },
  };

  const repoIds = [...new Set([...priorRoutes, ...currentRoutes].map((r) => r.repositoryId))];
  const perRepository: PriorAuditVsCurrentReport['perRepository'] = {};
  for (const repo of repoIds) {
    perRepository[repo] = {
      prior: priorRoutes.filter((r) => r.repositoryId === repo).length,
      current: currentRoutes.filter((r) => r.repositoryId === repo && r.routeCurrentness !== 'ROUTE_REMOVED').length,
    };
  }

  return {
    reportId: `prior-vs-current:${projectId}:${Date.now()}`,
    compiledAt: new Date().toISOString(),
    previousTotalRoutes: priorRoutes.length,
    currentTotalRoutes: currentRoutes.filter((r) => r.routeCurrentness !== 'ROUTE_REMOVED').length,
    ...counts,
    perRepository,
    perProject,
    routes: classified.map((row) => ({
      routeId: row.current.routeId,
      projectId,
      path: row.current.path,
      classification: row.classification,
    })),
  };
}

export function applyReconciliationToRoutes(
  priorRoutes: RecoveredRouteRecord[],
  report: PriorAuditVsCurrentReport,
): RecoveredRouteRecord[] {
  const byPath = new Map(priorRoutes.map((r) => [r.routeId, r]));
  return report.routes
    .filter((r) => r.classification !== 'REMOVED')
    .map((r) => {
      const base = byPath.get(r.routeId) ?? priorRoutes.find((p) => p.path === r.path);
      if (!base) return null;
      return {
        ...base,
        reconciliationClass: r.classification,
        routeCurrentness: r.classification === 'NEW' ? 'ROUTE_CURRENT' : base.routeCurrentness,
        captureCurrentness: 'CAPTURE_STALE' as const,
        completionCurrentness: 'COMPLETION_STALE' as const,
      };
    })
    .filter(Boolean) as RecoveredRouteRecord[];
}

export { P0_VR_8R2_LINEAGE };
