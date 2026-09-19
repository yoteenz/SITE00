/**
 * P0.VR.8 — Live page mirror types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type {
  PAGE_MIRROR_FAILURE_CODES,
  PAGE_MIRROR_FILTERS,
  PAGE_MIRROR_STATUS,
  PAGE_SYNC_EVENT_TYPES,
} from './constants.js';

export type PageMirrorFailureCode = (typeof PAGE_MIRROR_FAILURE_CODES)[number];
export type PageMirrorStatus = (typeof PAGE_MIRROR_STATUS)[number];
export type PageMirrorFilter = (typeof PAGE_MIRROR_FILTERS)[number];
export type PageSyncEventType = (typeof PAGE_SYNC_EVENT_TYPES)[number];

export type ProjectPageRecord = {
  pageId: string;
  projectId: string;
  route: string;
  normalizedRoute: string;
  pageName: string;
  pageType: string;
  source: 'ROUTE_DISCOVERY' | 'MANIFEST' | 'PILOT_REGISTRATION';
  sourceFile?: string | null;
  routeSource?: string | null;
  deploymentTarget?: string | null;
  isActive: boolean;
  isDynamic: boolean;
  isAuthProtected: boolean;
  isParameterized: boolean;
  viewportAvailability: DesignViewportClass[];
  createdAt: string;
  updatedAt: string;
  lastDiscoveredAt: string;
  lastRenderedAt: string | null;
  lastCapturedAt: string | null;
  lastContentHash: string | null;
  lastVisualHash: string | null;
  lastDeploymentId: string | null;
  status: PageMirrorStatus;
  representativeRoute?: string | null;
  sharedComponentPaths?: string[];
  screenId: string;
};

export type ProjectPageSnapshotCaptureType =
  | 'LIVE_CURRENT'
  | 'REFERENCE'
  | 'DESIGN_AUTHORITY'
  | 'PRE_CHANGE'
  | 'POST_CHANGE'
  | 'MANUAL_CAPTURE'
  | 'DEPLOY_CAPTURE';

export type ProjectPageSnapshot = {
  snapshotId: string;
  projectId: string;
  pageId: string;
  route: string;
  viewport: DesignViewportClass;
  captureType: ProjectPageSnapshotCaptureType;
  imageUrl: string;
  storagePath: string;
  width: number;
  height: number;
  devicePixelRatio: number;
  contentHash?: string | null;
  visualHash?: string | null;
  deploymentId?: string | null;
  sourceRevision?: string | null;
  capturedAt: string;
  status: PageMirrorStatus;
  previousSnapshotId?: string | null;
  isCurrent: boolean;
};

export type PageSnapshotFreshness = {
  pageId: string;
  projectId: string;
  lastPageChangeAt: string | null;
  lastDeployAt: string | null;
  lastCaptureAt: string | null;
  isStale: boolean;
  staleReason: string | null;
  neverCaptured?: boolean;
};

export type PageCaptureQueueJob = {
  jobId: string;
  projectId: string;
  pageId: string;
  route: string;
  viewport: DesignViewportClass;
  reason: PageSyncEventType | string;
  priority: number;
  status: 'QUEUED' | 'CAPTURING' | 'COMPLETE' | 'FAILED' | 'COALESCED';
  attempts: number;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  deploymentId?: string | null;
  runId?: string | null;
  targetId?: string | null;
};

export type PageCaptureReadyContract = {
  documentReady: boolean;
  appHydrated: boolean;
  fontsLoaded: boolean;
  criticalImagesLoaded: boolean;
  layoutStable: boolean;
  projectReadyMarker?: boolean;
  ready: boolean;
  blockReason?: string | null;
};

export type RepresentativeRouteInstance = {
  templateRoute: string;
  representativeRoute: string;
  projectId: string;
  pageId: string;
};

export type PageContentSummary = {
  pageId: string;
  projectId: string;
  majorHeadings: string[];
  primaryCtas: string[];
  majorRegions: string[];
  keyModules: string[];
  updatedAt: string;
};

export type PageDomManifest = {
  pageId: string;
  projectId: string;
  headings: string[];
  landmarks: string[];
  forms: string[];
  buttons: string[];
  navigation: string[];
  imageSlots: string[];
  componentMarkers: string[];
  capturedAt: string;
};

export type PageMirrorRow = {
  page: ProjectPageRecord;
  freshness: PageSnapshotFreshness;
  liveSnapshot: ProjectPageSnapshot | null;
  referenceSnapshot: ProjectPageSnapshot | null;
  mobile: { publicUrl: string | null; status: string; capturedAt: string | null } | null;
  tablet: { publicUrl: string | null; status: string; capturedAt: string | null } | null;
  desktop: { publicUrl: string | null; status: string; capturedAt: string | null } | null;
  referenceUrl: string | null;
  visualMatchStatus: string;
  historyCount: number;
  missingImplementation: boolean;
  screenId: string;
  displayName: string;
  routeFamily: string;
  pageCaptureStatus?: import('../p0vr8r3/types.js').PageCaptureStatus;
  resolvedCaptureState?: import('../p0vr8r3/pageCaptureStateResolver.js').ResolvedPageCaptureState;
};

export type PageMirrorInspectorState = {
  activeDesignProjectId: string;
  routeCount: number;
  activePageCount: number;
  stalePageCount: number;
  captureQueueCount: number;
  lastRouteDiscoveryAt: string | null;
  lastDeploymentId: string | null;
  lastCaptureAt: string | null;
  captureFailures: number;
  pageRegistrySource: string;
};

export type PageSyncEvent = {
  eventId: string;
  type: PageSyncEventType;
  projectId: string;
  pageId?: string | null;
  route?: string | null;
  deploymentId?: string | null;
  changedFiles?: string[];
  occurredAt: string;
};
