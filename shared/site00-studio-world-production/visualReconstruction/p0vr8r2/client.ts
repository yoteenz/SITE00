/**
 * P0.VR.8R2 — Browser-safe route audit recovery exports.
 */

export {
  P0_VR_8R2_LINEAGE,
  KNOWN_REPOSITORIES,
  PRIOR_AUDIT_SEARCH_LOCATIONS,
  LEGACY_AUDIT_SNAPSHOT_LABEL,
} from './constants.js';

export type {
  RouteRecoveryStatus,
  RouteReconciliationClass,
  RouteCurrentnessState,
  CaptureCurrentnessState,
  CompletionCurrentnessState,
  ReferenceCurrentnessState,
  PriorAuditDiscoveryRecord,
  PriorRouteAuditRecoveryReport,
  RouteAuditLineageBreak,
  RecoveredRouteRecord,
  RecoveredRouteInventory,
  RepositoryAuditSource,
  RouteAuditVersion,
  PriorAuditVsCurrentReport,
  RouteRecoveryResult,
  RouteRecoveryInspectorState,
} from './types.js';

export { discoverPriorRouteAudits, buildPriorRouteAuditRecoveryReport } from './priorAuditDiscovery.js';
export { getRouteAuditLineageBreak, ROUTE_AUDIT_LINEAGE_BREAK } from './routeAuditLineageBreak.js';
export {
  adaptLegacyAuditToRecoveredInventory,
  adaptLegacyAuditToDesignScreens,
  mergeDesignScreensWithoutDuplicates,
} from './legacyRouteAuditAdapter.js';
export {
  buildCurrentRoutesFromRepo,
  reconcilePriorVsCurrent,
  applyReconciliationToRoutes,
} from './currentRouteReconciliation.js';
export { classifyAllRoutes, matchRecoveredToCurrent, buildRouteMatchKey } from './routeIdentityMatcher.js';
export {
  recoverProjectRouteInventory,
  ensureProjectRouteRecovery,
  recoverAllManagedProjectRoutes,
  buildRouteRecoveryInspectorState,
  getProjectCurrentPageCount,
  projectRecoveryShowsInventoryNotZero,
  getGlobalRecoveryStatus,
  getGlobalRecoveryReport,
  getProjectRecoveryResult,
  clearRouteRecoveryStateForTest,
} from './routeRecoveryOrchestrator.js';
export {
  registerHistoricalAuditVersion,
  createCurrentAuditSnapshot,
  listHistoricalAuditVersions,
  listCurrentAuditVersions,
  seedHistoricalAuditsFromDiscovery,
  clearRouteAuditVersionsForTest,
} from './routeAuditVersioning.js';
export {
  queueCaptureRefreshForRecoveredRoutes,
  queueCompletionRefreshForRecoveredRoutes,
  listRecoveryCaptureQueue,
} from './recoveryRefreshQueues.js';
export {
  FSBW_LEGACY_AUDIT_SNAPSHOT,
  getFsbwLegacyAuditSnapshot,
  getFsbwLegacyAuditId,
  getFsbwLegacyRouteCount,
} from './fsbwLegacyRouteAudit.js';
