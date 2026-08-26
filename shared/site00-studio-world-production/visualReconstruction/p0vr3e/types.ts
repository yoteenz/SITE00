/**
 * P0.VR.3E — Implementation snapshot types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { P0_VR_3E_LINEAGE } from './constants.js';

export { P0_VR_3E_LINEAGE };

export type ImplementationSnapshotCaptureType = 'VIEWPORT' | 'FULL_PAGE' | 'STATE';

export type ScreenshotAuthContext =
  | 'PUBLIC'
  | 'CUSTOMER'
  | 'MEMBER'
  | 'ADMIN'
  | 'OFFICE'
  | 'CARRIER'
  | 'SHIPPER'
  | 'PROJECT_SPECIFIC_ROLE';

export type ImplementationSnapshotStatus =
  | 'CURRENT'
  | 'STALE'
  | 'POSSIBLY_STALE'
  | 'CAPTURING'
  | 'FAILED'
  | 'MISSING'
  | 'AUTH_BLOCKED'
  | 'IMPLEMENTATION_MISSING';

export type ImplementationSnapshotBatchStatus =
  | 'PLANNED'
  | 'QUEUED'
  | 'CAPTURING'
  | 'PARTIAL'
  | 'COMPLETE'
  | 'FAILED_PARTIAL'
  | 'CANCELLED';

export type ImplementationSnapshotRecord = {
  snapshotId: string;
  projectId: string;
  designScreenId: string;
  implementationRouteId: string | null;
  viewportClass: DesignViewportClass;
  route: string;
  resolvedRoute: string;
  templateRoute?: string | null;
  representativeRoute?: string | null;
  capturedUrl: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  storagePath: string;
  publicUrl: string;
  sourceCommit: string | null;
  sourceBuildId: string | null;
  capturedAt: string;
  captureStatus: ImplementationSnapshotStatus;
  captureType: ImplementationSnapshotCaptureType;
  authContext: ScreenshotAuthContext;
  routeState: string | null;
  visualStateId: string | null;
  stale: boolean;
  error: string | null;
  qaPassed: boolean;
  qaIssues: string[];
};

export type LatestImplementationSnapshotPointer = {
  projectId: string;
  designScreenId: string;
  viewportClass: DesignViewportClass;
  visualStateId: string | null;
  snapshotId: string;
  updatedAt: string;
};

export type ImplementationSnapshotBatch = {
  batchId: string;
  projectId: string;
  status: ImplementationSnapshotBatchStatus;
  viewports: DesignViewportClass[];
  screenIds: string[];
  planned: number;
  complete: number;
  capturing: number;
  queued: number;
  failed: number;
  startedAt: string;
  completedAt: string | null;
};

export type ImplementationSnapshotCoverage = {
  projectId: string;
  designScreens: number;
  eligibleScreens: number;
  mobile: { captured: number; missing: number; stale: number; failed: number };
  tablet: { captured: number; missing: number; stale: number; failed: number };
  desktop: { captured: number; missing: number; stale: number; failed: number };
  referenceCoverage: number;
  matchCoverage: number;
  implementationSnapshotCoverage: number;
};

export type FamilyOutlierSignal = {
  familySeed: string;
  screenId: string;
  signal: 'POSSIBLE_FAMILY_OUTLIER';
  reason: string;
};

export type CaptureScreenInput = {
  projectId: string;
  screenId: string;
  viewportClass: DesignViewportClass;
  route?: string;
  visualStateId?: string | null;
  captureType?: ImplementationSnapshotCaptureType;
  authContext?: ScreenshotAuthContext;
  baseUrl?: string;
  sourceCommit?: string | null;
};

export type CaptureProjectInput = {
  projectId: string;
  viewports?: DesignViewportClass[];
  screenSetMode?: 'PRIMARY' | 'ALL_DESIGNABLE';
  concurrency?: number;
  baseUrl?: string;
};
