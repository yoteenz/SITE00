/**
 * P0.VR.8R3 — Project capture refresh orchestration types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export const PAGE_CAPTURE_STATUS = [
  'NEVER_CAPTURED',
  'QUEUED',
  'CAPTURING',
  'CURRENT',
  'STALE',
  'FAILED',
  'SKIPPED',
  'UNSUPPORTED',
] as const;

export type PageCaptureStatus = (typeof PAGE_CAPTURE_STATUS)[number];

export const PROJECT_CAPTURE_RUN_STATUS = [
  'PLANNING',
  'QUEUING',
  'CAPTURING',
  'PARTIAL',
  'COMPLETE',
  'FAILED',
] as const;

export type ProjectCaptureRunStatus = (typeof PROJECT_CAPTURE_RUN_STATUS)[number];

export type CaptureTarget = {
  pageId: string;
  screenId: string;
  route: string;
  viewport: DesignViewportClass;
};

export type PageCaptureJob = {
  jobId: string;
  runId: string;
  projectId: string;
  pageId: string;
  route: string;
  viewport: DesignViewportClass;
  status: 'QUEUED' | 'CAPTURING' | 'COMPLETE' | 'FAILED' | 'SKIPPED' | 'COALESCED';
  attempt: number;
  maxAttempts: number;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  captureId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  sourceVersion: string | null;
  deploymentVersion: string | null;
};

export type ProjectCaptureRun = {
  captureRefreshRunId: string;
  projectId: string;
  totalPages: number;
  captureTargets: CaptureTarget[];
  queuedCount: number;
  capturingCount: number;
  completedCount: number;
  failedCount: number;
  skippedCount: number;
  startedAt: string;
  completedAt: string | null;
  status: ProjectCaptureRunStatus;
  viewportMode: 'MOBILE_ONLY' | 'ALL_SUPPORTED';
};

export type ProjectCaptureRefreshResult = ProjectCaptureRun & {
  duplicateBlocked?: boolean;
  activeRunId?: string | null;
  workerHealth: import('./captureWorkerHealth.js').CaptureWorkerHealth;
};

export type CaptureOrchestrationInspectorState = {
  projectId: string;
  activeRun: ProjectCaptureRun | null;
  recentRuns: ProjectCaptureRun[];
  queuedJobs: number;
  capturingJobs: number;
  completedJobs: number;
  failedJobs: number;
  workerHealth: import('./captureWorkerHealth.js').CaptureWorkerHealth;
  concurrencyLimit: number;
  lastDispatchAt: string | null;
  lastError: string | null;
  deploymentTarget: string;
};
