/**
 * P0.VR.8R2 — Route identity matching (not path-only).
 */

import type { RecoveredRouteRecord, RouteReconciliationClass } from './types.js';

export type RouteMatchKey = {
  routePattern: string;
  screenId: string;
  sourceFile: string | null;
  module: string | null;
  projectId: string;
};

export function buildRouteMatchKey(record: RecoveredRouteRecord): RouteMatchKey {
  return {
    routePattern: normalizePattern(record.routePattern),
    screenId: record.screenId,
    sourceFile: record.sourceFile,
    module: record.module,
    projectId: record.projectId,
  };
}

function normalizePattern(pattern: string): string {
  return pattern.replace(/\/+$/, '').replace(/:projectSlug/g, ':slug');
}

export function routeIdentityScore(a: RouteMatchKey, b: RouteMatchKey): number {
  if (a.projectId !== b.projectId) return 0;
  let score = 0;
  if (a.screenId === b.screenId) score += 40;
  if (a.routePattern === b.routePattern) score += 30;
  if (a.sourceFile && a.sourceFile === b.sourceFile) score += 15;
  if (a.module && a.module === b.module) score += 10;
  if (a.routePattern.replace(/:slug/g, '') === b.routePattern.replace(/:slug/g, '')) score += 5;
  return score;
}

export function matchRecoveredToCurrent(
  prior: RecoveredRouteRecord,
  currentRoutes: RecoveredRouteRecord[],
): { match: RecoveredRouteRecord | null; classification: RouteReconciliationClass } {
  const priorKey = buildRouteMatchKey(prior);
  let best: RecoveredRouteRecord | null = null;
  let bestScore = 0;

  for (const cur of currentRoutes) {
    const score = routeIdentityScore(priorKey, buildRouteMatchKey(cur));
    if (score > bestScore) {
      bestScore = score;
      best = cur;
    }
  }

  if (!best || bestScore < 30) {
    return { match: null, classification: 'REMOVED' };
  }

  if (priorKey.screenId === buildRouteMatchKey(best).screenId && priorKey.routePattern !== buildRouteMatchKey(best).routePattern) {
    return { match: best, classification: 'MOVED' };
  }

  if (priorKey.screenId !== buildRouteMatchKey(best).screenId && priorKey.routePattern === buildRouteMatchKey(best).routePattern) {
    return { match: best, classification: 'RENAMED' };
  }

  if (prior.path !== best.path || prior.pageName !== best.pageName) {
    return { match: best, classification: 'UPDATED' };
  }

  return { match: best, classification: 'UNCHANGED' };
}

export function classifyAllRoutes(
  priorRoutes: RecoveredRouteRecord[],
  currentRoutes: RecoveredRouteRecord[],
): Array<{ prior: RecoveredRouteRecord | null; current: RecoveredRouteRecord; classification: RouteReconciliationClass }> {
  const results: Array<{
    prior: RecoveredRouteRecord | null;
    current: RecoveredRouteRecord;
    classification: RouteReconciliationClass;
  }> = [];
  const matchedPriorIds = new Set<string>();

  for (const current of currentRoutes) {
    const currentKey = buildRouteMatchKey(current);
    let bestPrior: RecoveredRouteRecord | null = null;
    let bestScore = 0;

    for (const prior of priorRoutes) {
      const score = routeIdentityScore(buildRouteMatchKey(prior), currentKey);
      if (score > bestScore) {
        bestScore = score;
        bestPrior = prior;
      }
    }

    if (bestPrior && bestScore >= 30) {
      matchedPriorIds.add(bestPrior.routeId);
      const { classification } = matchRecoveredToCurrent(bestPrior, [current]);
      results.push({ prior: bestPrior, current, classification: classification === 'REMOVED' ? 'UNCHANGED' : classification });
    } else {
      results.push({ prior: null, current, classification: 'NEW' });
    }
  }

  for (const prior of priorRoutes) {
    if (!matchedPriorIds.has(prior.routeId)) {
      results.push({ prior, current: { ...prior, visibility: 'REMOVED', routeCurrentness: 'ROUTE_REMOVED' }, classification: 'REMOVED' });
    }
  }

  return results;
}
