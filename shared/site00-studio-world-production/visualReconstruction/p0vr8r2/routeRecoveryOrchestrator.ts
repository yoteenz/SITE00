/**
 * P0.VR.8R2 — Route recovery orchestrator.
 */

import {
  listDesignScreensForProject,
  registerProjectDesignScreens,
} from '../p0vr2/designScreenRegistry.js';
import { registerNdxbookDesignPilot } from '../p0vr2/ndxPilotRegistration.js';
import { syncSite00ManifestToDesignRegistry } from '../p0vr3/designRouteManifest.js';
import { syncAstralScreensToDesignRegistry } from '../../../site00-astral-world/screen-masters/vr2Adapter.js';
import { SITE00_DESIGN_PROJECT_ID } from '../p0vr3/constants.js';
import { listDesignEnabledManagedProjects } from '../p0vr3m/managedProjectRegistry.js';
import { getProjectAuthority } from '../../../site00-design-control-plane/projectAuthorityRegistry.js';
import {
  adaptLegacyAuditToDesignScreens,
  adaptLegacyAuditToRecoveredInventory,
  mergeDesignScreensWithoutDuplicates,
} from './legacyRouteAuditAdapter.js';
import { buildPriorRouteAuditRecoveryReport } from './priorAuditDiscovery.js';
import {
  applyReconciliationToRoutes,
  buildCurrentRoutesFromRepo,
  reconcilePriorVsCurrent,
} from './currentRouteReconciliation.js';
import { getRouteAuditLineageBreak } from './routeAuditLineageBreak.js';
import {
  createCurrentAuditSnapshot,
  seedHistoricalAuditsFromDiscovery,
} from './routeAuditVersioning.js';
import {
  queueCaptureRefreshForRecoveredRoutes,
  queueCompletionRefreshForRecoveredRoutes,
} from './recoveryRefreshQueues.js';
import { getFsbwLegacyRouteCount } from './fsbwLegacyRouteAudit.js';
import { compileStudioWorldDesignRouteManifestV2 } from '../p0vr3b/manifestV2Compiler.js';
import { summarizeRouteInventory } from '../../founderWorkspace/cohesion/routeInventory.js';
import type {
  RecoveredRouteInventory,
  RepositoryAuditSource,
  RouteRecoveryInspectorState,
  RouteRecoveryResult,
  RouteRecoveryStatus,
} from './types.js';
import { KNOWN_REPOSITORIES, P0_VR_8R2_LINEAGE } from './constants.js';

const recoveryState = new Map<string, RouteRecoveryResult>();
let globalRecoveryReport = buildPriorRouteAuditRecoveryReport();
let globalStatus: RouteRecoveryStatus = 'PRIOR_AUDIT_FOUND';

export function getGlobalRecoveryStatus(): RouteRecoveryStatus {
  return globalStatus;
}

export function getGlobalRecoveryReport() {
  return globalRecoveryReport;
}

export function getProjectRecoveryResult(projectId: string): RouteRecoveryResult | null {
  return recoveryState.get(projectId) ?? null;
}

function buildRepositoryAuditSources(): RepositoryAuditSource[] {
  const site00V2 = compileStudioWorldDesignRouteManifestV2();
  const ndxSummary = summarizeRouteInventory();

  return [
    {
      repositoryId: KNOWN_REPOSITORIES.site00.repositoryId,
      repositoryName: KNOWN_REPOSITORIES.site00.repositoryName,
      sourceVersion: site00V2.version,
      priorAuditId: 'p0vr3b-v2-manifest',
      priorRouteCount: site00V2.designScreens.length,
      currentRouteCount: site00V2.designScreens.length,
      projectBindings: ['site00', 'ndxbook', 'astral-world'],
    },
    {
      repositoryId: KNOWN_REPOSITORIES.fsbw.repositoryId,
      repositoryName: KNOWN_REPOSITORIES.fsbw.repositoryName,
      sourceVersion: 'v1',
      priorAuditId: 'fsbw-legacy-route-audit:v1',
      priorRouteCount: getFsbwLegacyRouteCount(),
      currentRouteCount: getFsbwLegacyRouteCount(),
      projectBindings: ['frontal-slayer', 'all-in-one-enterprises', 'studio-world'],
    },
  ].map((src) => ({
    ...src,
    projectBindings: src.projectBindings.map((p) => {
      if (p === 'ndxbook') {
        return `${p} (${ndxSummary.total} prior routes)`;
      }
      return p;
    }),
  }));
}

export function recoverProjectRouteInventory(
  projectId: string,
  options?: { queueRefresh?: boolean; screenSetMode?: 'PRIMARY' | 'ALL_DESIGNABLE' },
): RouteRecoveryResult {
  globalStatus = 'RECOVERING';
  seedHistoricalAuditsFromDiscovery();
  globalRecoveryReport = buildPriorRouteAuditRecoveryReport();

  const priorInventory = adaptLegacyAuditToRecoveredInventory(projectId);
  globalStatus = 'RECONCILING';

  const currentRoutes = buildCurrentRoutesFromRepo(projectId, priorInventory.routes);
  const reconciliation = reconcilePriorVsCurrent(projectId, priorInventory.routes, currentRoutes);
  const reconciledRoutes = applyReconciliationToRoutes(priorInventory.routes, reconciliation);

  const recoveredInventory: RecoveredRouteInventory = {
    ...priorInventory,
    routes: reconciledRoutes,
    routeCount: reconciledRoutes.filter((r) => r.routeCurrentness !== 'ROUTE_REMOVED').length,
  };

  let designScreens = adaptLegacyAuditToDesignScreens(projectId);

  if (projectId === SITE00_DESIGN_PROJECT_ID) {
    syncSite00ManifestToDesignRegistry();
    designScreens = adaptLegacyAuditToDesignScreens(projectId);
  } else if (projectId === 'ndxbook') {
    registerNdxbookDesignPilot();
    const existing = listDesignScreensForProject('ndxbook', true);
    designScreens = mergeDesignScreensWithoutDuplicates(existing, adaptLegacyAuditToDesignScreens('ndxbook'));
    registerProjectDesignScreens('ndxbook', designScreens);
  } else if (projectId === 'astral-world') {
    syncAstralScreensToDesignRegistry();
    designScreens = adaptLegacyAuditToDesignScreens(projectId);
  } else {
    const existing = listDesignScreensForProject(projectId, true);
    designScreens = mergeDesignScreensWithoutDuplicates(existing, designScreens);
    registerProjectDesignScreens(projectId, designScreens);
  }

  globalStatus = 'REFRESHING';
  const refresh = options?.queueRefresh !== false
    ? queueCaptureRefreshForRecoveredRoutes(projectId, reconciledRoutes, designScreens)
    : { capturesQueued: 0, capturesMarkedStale: reconciledRoutes.filter((r) => r.captureCurrentness === 'CAPTURE_STALE').length };

  const completionQueued = queueCompletionRefreshForRecoveredRoutes(reconciledRoutes);

  createCurrentAuditSnapshot({ [projectId]: recoveredInventory.routeCount }, priorInventory.repositoryId);

  const priorAuditFound = globalRecoveryReport.priorAuditFound;
  const status: RouteRecoveryStatus =
    !priorAuditFound ? 'PRIOR_AUDIT_NOT_FOUND' : recoveredInventory.routeCount > 0 ? 'CURRENT' : 'PARTIAL';

  const result: RouteRecoveryResult = {
    projectId,
    status,
    priorAuditFound,
    priorRouteCount: priorInventory.routeCount,
    recoveredRouteCount: recoveredInventory.routeCount,
    currentRouteCount: reconciliation.currentTotalRoutes,
    screensRegistered: designScreens.length,
    capturesMarkedStale: refresh.capturesMarkedStale,
    captureRefreshQueued: refresh.capturesQueued,
    completionRefreshQueued: completionQueued,
    inventory: recoveredInventory,
    reconciliation,
    lineageBreak: getRouteAuditLineageBreak(),
    recoveryReport: globalRecoveryReport,
    designScreens,
  };

  recoveryState.set(projectId, result);
  globalStatus = status;
  void options?.screenSetMode;
  void getProjectAuthority(projectId);
  return result;
}

export function ensureProjectRouteRecovery(projectId: string): RouteRecoveryResult {
  const existing = recoveryState.get(projectId);
  if (existing && existing.status !== 'FAILED') return existing;
  return recoverProjectRouteInventory(projectId);
}

export function recoverAllManagedProjectRoutes(): Map<string, RouteRecoveryResult> {
  const results = new Map<string, RouteRecoveryResult>();
  for (const project of listDesignEnabledManagedProjects()) {
    results.set(project.projectId, recoverProjectRouteInventory(project.projectId));
  }
  return results;
}

export function buildRouteRecoveryInspectorState(projectId?: string): RouteRecoveryInspectorState {
  const report = globalRecoveryReport;
  const result = projectId ? recoveryState.get(projectId) : null;
  const allResults = [...recoveryState.values()];

  const sum = (fn: (r: RouteRecoveryResult) => number) =>
    projectId && result ? fn(result) : allResults.reduce((a, r) => a + fn(r), 0);

  return {
    status: globalStatus,
    priorAuditFound: report.priorAuditFound,
    priorRoutes: sum((r) => r.priorRouteCount),
    recoveredRoutes: sum((r) => r.recoveredRouteCount),
    currentRoutes: sum((r) => r.currentRouteCount),
    unchanged: sum((r) => r.reconciliation?.unchanged ?? 0),
    updated: sum((r) => r.reconciliation?.updated ?? 0),
    newRoutes: sum((r) => r.reconciliation?.new ?? 0),
    removed: sum((r) => r.reconciliation?.removed ?? 0),
    unmatched: sum((r) => (r.reconciliation?.routes.filter((x) => x.classification === 'UNKNOWN').length ?? 0)),
    capturesStale: sum((r) => r.capturesMarkedStale),
    capturesRefreshing: sum((r) => r.captureRefreshQueued),
    completionRefreshing: sum((r) => r.completionRefreshQueued),
    repositories: buildRepositoryAuditSources(),
    lastAuditId: report.lastCompleteAuditId,
  };
}

export function getProjectCurrentPageCount(projectId: string): number {
  const result = recoveryState.get(projectId);
  if (result) return result.currentRouteCount;
  return ensureProjectRouteRecovery(projectId).currentRouteCount;
}

export function projectRecoveryShowsInventoryNotZero(projectId: string): boolean {
  const status = recoveryState.get(projectId)?.status ?? globalStatus;
  if (status === 'RECOVERING' || status === 'RECONCILING' || status === 'REFRESHING') return true;
  const count = getProjectCurrentPageCount(projectId);
  return count > 0;
}

export function clearRouteRecoveryStateForTest(): void {
  recoveryState.clear();
  globalRecoveryReport = buildPriorRouteAuditRecoveryReport();
  globalStatus = globalRecoveryReport.priorAuditFound ? 'PRIOR_AUDIT_FOUND' : 'PRIOR_AUDIT_NOT_FOUND';
}

export { P0_VR_8R2_LINEAGE };
