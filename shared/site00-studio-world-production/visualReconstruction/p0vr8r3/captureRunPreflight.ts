/**
 * P0.VR.8R3R2 — Capture run preflight (must pass before run creation).
 */

import { listProjectPageRecords } from '../p0vr8/projectPageRegistry.js';
import { getCaptureWorkerHealth } from './captureWorkerHealth.js';
import { CAPTURE_RUN_CONTRACT_VERSION } from './projectCaptureRunContract.js';
import { resolveRuntimeRoutesForProject } from './runtimeRouteResolver.js';
import type { PageRouteIdentity } from './pageRouteIdentity.js';
import { resolvePageCaptureStateFromRecord } from './pageCaptureStateResolver.js';
import { resolveCaptureViewportsForPage } from '../p0vr8/capturePolicy.js';
import type { DesignViewportClass } from '../p0vr2/types.js';

export type CaptureRunPreflight = {
  projectId: string;
  inventoryCount: number;
  eligibleCount: number;
  resolvedUrlCount: number;
  unresolvedUrlCount: number;
  unsupportedCount: number;
  contractVersion: typeof CAPTURE_RUN_CONTRACT_VERSION;
  workerStatus: ReturnType<typeof getCaptureWorkerHealth>['status'];
  ready: boolean;
  blockReason: string | null;
  goldenFirstTargetValid: boolean;
  goldenFirstRoute: string | null;
  routeManifestVersion: string;
  pageInventoryVersion: string;
  unresolvedPages: Array<{ pageId: string; displayRoute: string }>;
};

const GOLDEN_FIRST_ROUTE_SUFFIX = '/projects/ndxbook';

function isGoldenFirstRoute(path: string | null, projectId: string): boolean {
  if (!path) return false;
  if (projectId === 'ndxbook') {
    return path === GOLDEN_FIRST_ROUTE_SUFFIX || path.startsWith(`${GOLDEN_FIRST_ROUTE_SUFFIX}/`);
  }
  return path.includes(`/${projectId}`) || path.includes(`/${projectId}/`);
}

export function buildCaptureRunPreflight(
  projectId: string,
  options?: { baseUrl?: string | null; viewportMode?: 'MOBILE_ONLY' | 'ALL_SUPPORTED' },
): CaptureRunPreflight {
  const pages = listProjectPageRecords(projectId, true);
  const workerHealth = getCaptureWorkerHealth();
  const { identities, resolvedCount, unresolvedCount } = resolveRuntimeRoutesForProject(pages, {
    baseUrl: options?.baseUrl,
  });

  const eligiblePages = pages.filter((page) => {
    if (!page.isActive || page.status === 'ROUTE_MISSING' || page.status === 'REMOVED') return false;
    const state = resolvePageCaptureStateFromRecord(page, null);
    if (state === 'UNSUPPORTED') return false;
    const viewports = resolveCaptureViewportsForPage(page);
    if (options?.viewportMode === 'MOBILE_ONLY' && !viewports.includes('mobile')) return false;
    return true;
  });

  const unsupportedCount = pages.filter((p) => resolvePageCaptureStateFromRecord(p, null) === 'UNSUPPORTED').length;
  const unresolvedPages = identities
    .filter((i) => !i.routeValid)
    .map((i) => ({ pageId: i.pageId, displayRoute: i.displayRoute }));

  const goldenIdentity =
    identities.find((i) => isGoldenFirstRoute(i.resolvedRuntimePath, projectId) && i.routeValid) ??
    identities.find((i) => i.routeValid) ??
    null;

  let blockReason: string | null = null;
  if (workerHealth.status === 'OFFLINE') blockReason = 'CAPTURE_WORKER_OFFLINE';
  else if (eligiblePages.length === 0) blockReason = 'TARGET_PLAN_EMPTY';
  else if (resolvedCount === 0) blockReason = 'RUNTIME_URLS_UNRESOLVED';
  else if (!goldenIdentity?.routeValid) blockReason = 'RUNTIME_URLS_UNRESOLVED';
  else if (unresolvedCount > 0 && resolvedCount === 0) blockReason = 'RUNTIME_URLS_UNRESOLVED';

  const ready =
    !blockReason &&
    workerHealth.status !== 'OFFLINE' &&
    eligiblePages.length > 0 &&
    resolvedCount > 0 &&
    Boolean(goldenIdentity?.routeValid);

  const inventoryVersion = pages.length > 0 ? String(pages[0]!.updatedAt ?? pages.length) : '0';
  const manifestVersion = identities[0]?.routePattern ?? 'unknown';

  return {
    projectId,
    inventoryCount: pages.filter((p) => p.isActive).length,
    eligibleCount: eligiblePages.length,
    resolvedUrlCount: resolvedCount,
    unresolvedUrlCount: unresolvedCount,
    unsupportedCount,
    contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
    workerStatus: workerHealth.status,
    ready,
    blockReason,
    goldenFirstTargetValid: Boolean(goldenIdentity?.routeValid),
    goldenFirstRoute: goldenIdentity?.resolvedRuntimePath ?? null,
    routeManifestVersion: manifestVersion,
    pageInventoryVersion: inventoryVersion,
    unresolvedPages,
  };
}

export function listEligibleCaptureTargets(
  projectId: string,
  runId: string,
  options?: { baseUrl?: string | null; viewportMode?: 'MOBILE_ONLY' | 'ALL_SUPPORTED' },
): Array<{
  identity: PageRouteIdentity;
  viewport: DesignViewportClass;
  targetId: string;
}> {
  const pages = listProjectPageRecords(projectId, true);
  const { identities } = resolveRuntimeRoutesForProject(pages, { baseUrl: options?.baseUrl });
  const identityByPageId = new Map(identities.map((i) => [i.pageId, i]));
  const targets: Array<{ identity: PageRouteIdentity; viewport: DesignViewportClass; targetId: string }> = [];

  for (const page of pages) {
    if (!page.isActive || page.status === 'ROUTE_MISSING' || page.status === 'REMOVED') continue;
    const identity = identityByPageId.get(page.pageId);
    if (!identity?.routeValid || !identity.resolvedRuntimePath) continue;

    let viewports = resolveCaptureViewportsForPage(page);
    if (options?.viewportMode === 'MOBILE_ONLY') {
      viewports = viewports.includes('mobile') ? ['mobile'] : viewports.slice(0, 1);
    }

    for (const viewport of viewports) {
      targets.push({
        identity,
        viewport,
        targetId: `pct-${runId}-${page.pageId}-${viewport}`,
      });
    }
  }

  return sortTargetsGoldenFirst(targets, projectId);
}

function sortTargetsGoldenFirst(
  targets: Array<{ identity: PageRouteIdentity; viewport: DesignViewportClass; targetId: string }>,
  projectId: string,
): typeof targets {
  return [...targets].sort((a, b) => {
    const aGolden = isGoldenFirstRoute(a.identity.resolvedRuntimePath, projectId) ? 0 : 1;
    const bGolden = isGoldenFirstRoute(b.identity.resolvedRuntimePath, projectId) ? 0 : 1;
    if (aGolden !== bGolden) return aGolden - bGolden;
    return (a.identity.resolvedRuntimePath ?? '').localeCompare(b.identity.resolvedRuntimePath ?? '');
  });
}

export function generateCaptureRunId(projectId: string): string {
  const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `capture_${projectId}_${ts}_${suffix}`;
}
