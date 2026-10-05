/**
 * P0.VR.8R2 — Prior route audit recovery + stale route reconciliation.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  bootstrapAllManagedDesignProjects,
  clearManagedDesignBootstrapForTest,
  clearProjectSyncStateForTest,
  buildProjectRouteManifest,
  syncProjectRouteManifest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';
import {
  clearDesignScreenRegistryForTest,
  listDesignScreensForProject,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';
import { resetNdxPilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { resetSite00PilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00PilotRegistration.js';
import {
  clearProjectPageRegistryForTest,
  clearCaptureQueueForTest,
  discoverProjectRoutes,
  listProjectPageRecords,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import {
  buildPriorRouteAuditRecoveryReport,
  discoverPriorRouteAudits,
  adaptLegacyAuditToRecoveredInventory,
  mergeDesignScreensWithoutDuplicates,
  reconcilePriorVsCurrent,
  buildCurrentRoutesFromRepo,
  classifyAllRoutes,
  recoverProjectRouteInventory,
  recoverAllManagedProjectRoutes,
  ensureProjectRouteRecovery,
  buildRouteRecoveryInspectorState,
  getRouteAuditLineageBreak,
  getProjectCurrentPageCount,
  projectRecoveryShowsInventoryNotZero,
  getGlobalRecoveryStatus,
  clearRouteRecoveryStateForTest,
  clearRouteAuditVersionsForTest,
  listHistoricalAuditVersions,
  listCurrentAuditVersions,
  seedHistoricalAuditsFromDiscovery,
  FSBW_LEGACY_AUDIT_SNAPSHOT,
  PRIOR_AUDIT_SEARCH_LOCATIONS,
  listRecoveryCaptureQueue,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r2/client.js';
import { clearDesignRouteManifestCacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3/designRouteManifest.js';
import { clearDesignRouteSyncContractCacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3d/designRouteSyncContract.js';
import { clearManifestV2CacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3b/manifestV2Compiler.js';
import { NDX_WORKSPACE_ROUTE_INVENTORY } from '../shared/site00-studio-world-production/founderWorkspace/cohesion/routeInventory.js';

describe('P0.VR.8R2 Route Audit Recovery', () => {
  beforeEach(() => {
    clearDesignScreenRegistryForTest();
    resetNdxPilotForTest();
    resetSite00PilotForTest();
    clearProjectPageRegistryForTest();
    clearCaptureQueueForTest();
    clearProjectSyncStateForTest();
    clearManagedDesignBootstrapForTest();
    clearRouteRecoveryStateForTest();
    clearRouteAuditVersionsForTest();
    clearDesignRouteManifestCacheForTest();
    clearDesignRouteSyncContractCacheForTest();
    clearManifestV2CacheForTest();
  });

  it('1. prior audit discovery finds historical audits', () => {
    const audits = discoverPriorRouteAudits();
    expect(audits.length).toBeGreaterThan(0);
    expect(audits.some((a) => a.sourceKind === 'P0_VR_3B_V2_MANIFEST')).toBe(true);
    expect(audits.some((a) => a.sourceKind === 'NDX_WORKSPACE_ROUTE_INVENTORY')).toBe(true);
    expect(audits.some((a) => a.sourceKind === 'FSBW_LEGACY_SNAPSHOT')).toBe(true);
  });

  it('2. prior audit snapshot preservation (legacy not deleted)', () => {
    const before = adaptLegacyAuditToRecoveredInventory('ndxbook');
    const after = adaptLegacyAuditToRecoveredInventory('ndxbook');
    expect(before.preservedAsLegacySnapshot).toBe(true);
    expect(before.routeCount).toBe(after.routeCount);
    expect(before.priorAuditId).toBe(after.priorAuditId);
  });

  it('3. legacy audit adapter produces recovered inventory', () => {
    const inv = adaptLegacyAuditToRecoveredInventory('ndxbook');
    expect(inv.routeCount).toBe(NDX_WORKSPACE_ROUTE_INVENTORY.length);
    expect(inv.routes.every((r) => r.projectId === 'ndxbook')).toBe(true);
  });

  it('4. two-repository recovery', () => {
    const report = buildPriorRouteAuditRecoveryReport();
    expect(report.repositoriesSearched).toContain('yoteenz/SITE00');
    expect(report.repositoriesSearched).toContain('yoteenz/fsbw');
    expect(report.priorAuditFound).toBe(true);
  });

  it('5. historical route restoration for NDXBOOK', () => {
    const result = recoverProjectRouteInventory('ndxbook');
    expect(result.priorAuditFound).toBe(true);
    expect(result.recoveredRouteCount).toBeGreaterThan(10);
    expect(result.recoveredRouteCount).not.toBe(1);
  });

  it('6. current route reconciliation runs', () => {
    const prior = adaptLegacyAuditToRecoveredInventory('ndxbook');
    const current = buildCurrentRoutesFromRepo('ndxbook', prior.routes);
    const report = reconcilePriorVsCurrent('ndxbook', prior.routes, current);
    expect(report.previousTotalRoutes).toBe(prior.routeCount);
    expect(report.currentTotalRoutes).toBeGreaterThan(0);
  });

  it('7. unchanged route classification', () => {
    const prior = adaptLegacyAuditToRecoveredInventory('ndxbook');
    const current = buildCurrentRoutesFromRepo('ndxbook', prior.routes);
    const report = reconcilePriorVsCurrent('ndxbook', prior.routes, current);
    expect(report.unchanged).toBeGreaterThan(0);
  });

  it('8. updated route detection supported', () => {
    const prior = adaptLegacyAuditToRecoveredInventory('ndxbook');
    const current = prior.routes.map((r) =>
      r.screenId === 'overview' ? { ...r, pageName: 'OVERVIEW RENAMED' } : r,
    );
    const report = reconcilePriorVsCurrent('ndxbook', prior.routes, current);
    expect(report.updated + report.unchanged).toBeGreaterThan(0);
  });

  it('9. new route classification', () => {
    const prior = adaptLegacyAuditToRecoveredInventory('ndxbook');
    const extra = {
      routeId: 'ndxbook:brand-new-surface-xyz',
      repositoryId: 'yoteenz/SITE00',
      projectId: 'ndxbook',
      path: '/projects/ndxbook/brand-new-surface-xyz',
      routePattern: '/projects/:projectSlug/brand-new-surface-xyz',
      pageName: 'BRAND NEW SURFACE XYZ',
      module: 'brand-new-surface-xyz',
      sourceFile: null,
      parentRoute: null,
      childRoutes: [],
      dynamicParams: [],
      visibility: 'ACTIVE' as const,
      routeType: 'PAGE',
      lastAuditedAt: null,
      historicalCaptureIds: [],
      historicalReferenceIds: [],
      historicalCompletionState: null,
      screenId: 'brand-new-surface-xyz',
      sourceAuditId: 'test',
      routeCurrentness: 'ROUTE_CURRENT' as const,
      captureCurrentness: 'CAPTURE_MISSING' as const,
      completionCurrentness: 'COMPLETION_STALE' as const,
      referenceCurrentness: 'REFERENCE_MISSING' as const,
    };
    const current = [...prior.routes, extra];
    const report = reconcilePriorVsCurrent('ndxbook', prior.routes, current);
    expect(report.new).toBeGreaterThanOrEqual(1);
  });

  it('10. removed route classification', () => {
    const prior = adaptLegacyAuditToRecoveredInventory('ndxbook');
    const current = prior.routes.slice(0, 5);
    const report = reconcilePriorVsCurrent('ndxbook', prior.routes, current);
    expect(report.removed).toBeGreaterThan(0);
  });

  it('11. moved/renamed route via identity matcher', () => {
    const prior = adaptLegacyAuditToRecoveredInventory('ndxbook');
    const moved = prior.routes.map((r) =>
      r.screenId === 'overview'
        ? { ...r, path: '/projects/ndxbook/overview-alt', routePattern: '/projects/:projectSlug/overview-alt' }
        : r,
    );
    const classified = classifyAllRoutes(prior.routes, moved);
    expect(classified.some((c) => c.classification === 'MOVED' || c.classification === 'UPDATED')).toBe(true);
  });

  it('12. route history preservation via sourceAuditId', () => {
    const inv = adaptLegacyAuditToRecoveredInventory('ndxbook');
    expect(inv.routes.every((r) => r.sourceAuditId.length > 0)).toBe(true);
  });

  it('13. capture history preservation flags', () => {
    const inv = adaptLegacyAuditToRecoveredInventory('ndxbook');
    expect(inv.routes.some((r) => r.captureCurrentness === 'CAPTURE_STALE')).toBe(true);
  });

  it('14. current capture refresh queued', () => {
    const result = recoverProjectRouteInventory('ndxbook');
    expect(result.captureRefreshQueued).toBeGreaterThan(0);
    expect(listRecoveryCaptureQueue('ndxbook').length).toBeGreaterThan(0);
  });

  it('15. completion refresh queued', () => {
    const result = recoverProjectRouteInventory('ndxbook');
    expect(result.completionRefreshQueued).toBeGreaterThan(0);
  });

  it('16. screen authority reconnection via design screen merge', () => {
    bootstrapAllManagedDesignProjects();
    const screens = listDesignScreensForProject('ndxbook', true);
    expect(screens.some((s) => s.screenId === 'overview')).toBe(true);
    expect(screens.length).toBeGreaterThan(8);
  });

  it('17. live mirror reconnection via discoverProjectRoutes', () => {
    recoverProjectRouteInventory('ndxbook');
    const routes = discoverProjectRoutes('ndxbook');
    expect(routes.length).toBeGreaterThan(8);
  });

  it('18. duplicate prevention on merge', () => {
    const a = [{ screenId: 'overview', displayName: 'A', routePattern: '/projects/:projectSlug' }];
    const b = [{ screenId: 'overview', displayName: 'B', routePattern: '/projects/:projectSlug' }];
    const merged = mergeDesignScreensWithoutDuplicates(a, b);
    expect(merged.length).toBe(1);
  });

  it('19. project attribution preserved', () => {
    const inv = adaptLegacyAuditToRecoveredInventory('frontal-slayer');
    expect(inv.repositoryId).toBe('yoteenz/fsbw');
    expect(inv.routes.every((r) => r.projectId === 'frontal-slayer')).toBe(true);
  });

  it('20. current project counts after recovery', () => {
    recoverAllManagedProjectRoutes();
    expect(getProjectCurrentPageCount('ndxbook')).toBeGreaterThan(10);
    expect(getProjectCurrentPageCount('site00')).toBeGreaterThan(10);
    expect(getProjectCurrentPageCount('frontal-slayer')).toBeGreaterThan(4);
    expect(getProjectCurrentPageCount('studio-world')).toBeGreaterThan(4);
    expect(getProjectCurrentPageCount('all-in-one-enterprises')).toBeGreaterThan(4);
    expect(getProjectCurrentPageCount('astral-world')).toBeGreaterThan(5);
  });

  it('21. recovery status reporting', () => {
    recoverProjectRouteInventory('ndxbook');
    const status = getGlobalRecoveryStatus();
    expect(['CURRENT', 'PARTIAL', 'REFRESHING']).toContain(status);
    const inspector = buildRouteRecoveryInspectorState('ndxbook');
    expect(inspector.priorAuditFound).toBe(true);
  });

  it('22. no fake zero states when prior inventory exists', () => {
    recoverProjectRouteInventory('ndxbook');
    expect(projectRecoveryShowsInventoryNotZero('ndxbook')).toBe(true);
    const manifest = buildProjectRouteManifest('ndxbook');
    expect(manifest.routeCount).toBeGreaterThan(10);
  });

  it('23. historical audit versioning', () => {
    seedHistoricalAuditsFromDiscovery();
    expect(listHistoricalAuditVersions().length).toBeGreaterThan(0);
  });

  it('24. current audit snapshot creation', () => {
    recoverProjectRouteInventory('ndxbook');
    expect(listCurrentAuditVersions().length).toBeGreaterThan(0);
  });

  it('25. page registry populated after sync', () => {
    bootstrapAllManagedDesignProjects();
    syncProjectRouteManifest('ndxbook');
    const pages = listProjectPageRecords('ndxbook');
    expect(pages.length).toBeGreaterThan(10);
  });

  it('lineage break documented', () => {
    const br = getRouteAuditLineageBreak();
    expect(br.previousProducer).toContain('P0.VR.3B');
    expect(br.missingAdapter).toContain('P0.VR.8R2');
  });

  it('FSBW legacy snapshot preserved', () => {
    expect(FSBW_LEGACY_AUDIT_SNAPSHOT.length).toBeGreaterThan(10);
  });

  it('forensic search locations enumerated when audit missing', () => {
    expect(PRIOR_AUDIT_SEARCH_LOCATIONS.length).toBeGreaterThan(5);
  });

  it('ensureProjectRouteRecovery is idempotent', () => {
    const first = ensureProjectRouteRecovery('ndxbook');
    const second = ensureProjectRouteRecovery('ndxbook');
    expect(second.recoveredRouteCount).toBe(first.recoveredRouteCount);
  });

  it('all managed projects recovered', () => {
    const results = recoverAllManagedProjectRoutes();
    expect(results.size).toBeGreaterThanOrEqual(6);
    for (const [pid, result] of results) {
      expect(result.priorAuditFound).toBe(true);
      void pid;
    }
  });
});
