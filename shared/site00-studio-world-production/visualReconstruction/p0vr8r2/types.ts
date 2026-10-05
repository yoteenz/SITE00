/**
 * P0.VR.8R2 — Prior route audit recovery types.
 */

import type { DesignScreenDefinition } from '../p0vr2/types.js';

export type RouteRecoveryStatus =
  | 'PRIOR_AUDIT_NOT_FOUND'
  | 'PRIOR_AUDIT_FOUND'
  | 'RECOVERING'
  | 'RECONCILING'
  | 'REFRESHING'
  | 'CURRENT'
  | 'PARTIAL'
  | 'FAILED';

export type RouteReconciliationClass =
  | 'UNCHANGED'
  | 'UPDATED'
  | 'NEW'
  | 'REMOVED'
  | 'MOVED'
  | 'RENAMED'
  | 'ATTRIBUTION_CHANGED'
  | 'UNKNOWN';

export type RouteCurrentnessState = 'ROUTE_CURRENT' | 'ROUTE_STALE' | 'ROUTE_REMOVED';
export type CaptureCurrentnessState = 'CAPTURE_CURRENT' | 'CAPTURE_STALE' | 'CAPTURE_MISSING';
export type CompletionCurrentnessState = 'COMPLETION_CURRENT' | 'COMPLETION_STALE';
export type ReferenceCurrentnessState = 'REFERENCE_CURRENT' | 'REFERENCE_STALE' | 'REFERENCE_MISSING';

export type PriorAuditSourceKind =
  | 'P0_VR_3A_V1_HISTORICAL'
  | 'P0_VR_3B_V2_MANIFEST'
  | 'P0_VR_3D_SYNC_CONTRACT'
  | 'NDX_WORKSPACE_ROUTE_INVENTORY'
  | 'NDX_DESIGN_PILOT'
  | 'ASTRAL_SCREEN_MASTERS'
  | 'FSBW_LEGACY_SNAPSHOT'
  | 'MANAGED_BRAND_BOOTSTRAP';

export type PriorAuditDiscoveryRecord = {
  auditId: string;
  sourceKind: PriorAuditSourceKind;
  storageLocation: string;
  schema: string;
  schemaVersion: string;
  repositoryId: string;
  projectIds: string[];
  routeCount: number;
  lastKnownCompleteAt: string | null;
  sourceCommit: string | null;
  dynamicRoutesExpanded: boolean;
  childSurfacesIncluded: boolean;
  screenshotRecordsExist: boolean;
  projectAttributionExists: boolean;
  status: 'FOUND' | 'PARTIAL' | 'NOT_FOUND';
};

export type PriorRouteAuditRecoveryReport = {
  reportId: string;
  compiledAt: string;
  lineage: string;
  priorAuditFound: boolean;
  audits: PriorAuditDiscoveryRecord[];
  locationsSearched: readonly string[];
  repositoriesSearched: string[];
  lastCompleteAuditId: string | null;
  lastCompleteRouteCount: number;
  repositoryCoverage: Record<string, number>;
  projectCoverage: Record<string, number>;
};

export type RouteAuditLineageBreak = {
  previousProducer: string;
  previousStore: string;
  currentConsumer: string;
  missingAdapter: string;
  breakDescription: string;
  releaseOrCommit: string | null;
  introducedBySprint: string;
};

export type RecoveredRouteRecord = {
  routeId: string;
  repositoryId: string;
  projectId: string;
  path: string;
  routePattern: string;
  pageName: string;
  module: string | null;
  sourceFile: string | null;
  parentRoute: string | null;
  childRoutes: string[];
  dynamicParams: string[];
  visibility: 'ACTIVE' | 'HISTORICAL' | 'REMOVED';
  routeType: string;
  lastAuditedAt: string | null;
  historicalCaptureIds: string[];
  historicalReferenceIds: string[];
  historicalCompletionState: string | null;
  screenId: string;
  sourceAuditId: string;
  reconciliationClass?: RouteReconciliationClass;
  routeCurrentness: RouteCurrentnessState;
  captureCurrentness: CaptureCurrentnessState;
  completionCurrentness: CompletionCurrentnessState;
  referenceCurrentness: ReferenceCurrentnessState;
};

export type RecoveredRouteInventory = {
  inventoryId: string;
  projectId: string;
  repositoryId: string;
  recoveredAt: string;
  priorAuditId: string;
  routes: RecoveredRouteRecord[];
  routeCount: number;
  preservedAsLegacySnapshot: boolean;
};

export type RepositoryAuditSource = {
  repositoryId: string;
  repositoryName: string;
  sourceVersion: string | null;
  priorAuditId: string | null;
  priorRouteCount: number;
  currentRouteCount: number;
  projectBindings: string[];
};

export type RouteAuditVersion = {
  auditId: string;
  repositoryId: string;
  commit: string | null;
  createdAt: string;
  routeCount: number;
  projectCounts: Record<string, number>;
  schemaVersion: string;
  status: 'HISTORICAL' | 'CURRENT' | 'RECONCILED';
};

export type PriorAuditVsCurrentReport = {
  reportId: string;
  compiledAt: string;
  previousTotalRoutes: number;
  currentTotalRoutes: number;
  unchanged: number;
  updated: number;
  new: number;
  removed: number;
  moved: number;
  reAttributed: number;
  perRepository: Record<string, { prior: number; current: number }>;
  perProject: Record<string, { prior: number; current: number; unchanged: number; new: number; removed: number }>;
  routes: Array<{ routeId: string; projectId: string; path: string; classification: RouteReconciliationClass }>;
};

export type RouteRecoveryResult = {
  projectId: string;
  status: RouteRecoveryStatus;
  priorAuditFound: boolean;
  priorRouteCount: number;
  recoveredRouteCount: number;
  currentRouteCount: number;
  screensRegistered: number;
  capturesMarkedStale: number;
  captureRefreshQueued: number;
  completionRefreshQueued: number;
  inventory: RecoveredRouteInventory | null;
  reconciliation: PriorAuditVsCurrentReport | null;
  lineageBreak: RouteAuditLineageBreak;
  recoveryReport: PriorRouteAuditRecoveryReport;
  designScreens: DesignScreenDefinition[];
};

export type RouteRecoveryInspectorState = {
  status: RouteRecoveryStatus;
  priorAuditFound: boolean;
  priorRoutes: number;
  recoveredRoutes: number;
  currentRoutes: number;
  unchanged: number;
  updated: number;
  newRoutes: number;
  removed: number;
  unmatched: number;
  capturesStale: number;
  capturesRefreshing: number;
  completionRefreshing: number;
  repositories: RepositoryAuditSource[];
  lastAuditId: string | null;
};
