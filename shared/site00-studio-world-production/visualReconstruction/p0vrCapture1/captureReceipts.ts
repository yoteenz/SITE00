/**
 * P0.VR.CAPTURE.1R2 — Receipt-driven capture now execution.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export const CAPTURE_JOB_STATUSES = [
  'PENDING',
  'RUNNING',
  'COMPLETE',
  'FAILED',
  'TIMEOUT',
  'CANCELLED',
] as const;

export type CaptureJobStatus = (typeof CAPTURE_JOB_STATUSES)[number];

export const CAPTURE_MILESTONES = [
  'JOB_CREATED',
  'PAGE_OPENING',
  'PAGE_OPENED',
  'VIEWPORT_RENDERING',
  'VIEWPORT_READY',
  'SCREENSHOT_TAKING',
  'SCREENSHOT_CREATED',
  'CAPTURE_SAVING',
  'CAPTURE_PERSISTED',
  'COMPLETE',
] as const;

export type CaptureMilestone = (typeof CAPTURE_MILESTONES)[number];

export const CAPTURE_ERROR_CODES = [
  'JOB_CREATE_FAILED',
  'PAGE_OPEN_FAILED',
  'RENDER_FAILED',
  'SCREENSHOT_FAILED',
  'STORAGE_FAILED',
  'PERSISTENCE_FAILED',
  'BINDING_FAILED',
  'PUBLIC_URL_INVALID',
  'CAPTURE_PAGE_MISMATCH',
  'TIMEOUT',
  'UNKNOWN',
] as const;

export type CaptureErrorCode = (typeof CAPTURE_ERROR_CODES)[number];

export type CaptureProgressMilestoneReceipt = {
  milestone: CaptureMilestone;
  at: string;
  detail?: string;
};

export type CaptureJobReceipt = {
  jobId: string;
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  route: string;
  resolvedRuntimePath: string;
  status: CaptureJobStatus;
  startedAt: string;
  completedAt: string | null;
  errorCode: CaptureErrorCode | null;
  errorMessage: string | null;
  milestones: CaptureProgressMilestoneReceipt[];
};

export type ScreenshotReceipt = {
  jobId: string;
  pageId: string;
  viewport: DesignViewportClass;
  width: number;
  height: number;
  capturedAt: string;
  artifactRef: string | null;
  mimeType: string;
  byteSize: number | null;
  status: 'CREATED' | 'FAILED';
};

export type CaptureStorageReceipt = {
  jobId: string;
  storageProvider: 'PUBLIC_URL' | 'LOCAL_SNAPSHOT' | 'NONE';
  storagePath: string | null;
  publicOrSignedRef: string | null;
  writtenAt: string | null;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  error: string | null;
};

export type CaptureCompletionReceipt = {
  jobId: string;
  captureId: string;
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  route: string;
  resolvedRuntimePath: string;
  imageRef: string | null;
  capturedAt: string;
  storageStatus: CaptureStorageReceipt['status'];
  persistenceStatus: 'SUCCESS' | 'FAILED';
  bindingStatus: 'READY' | 'PENDING' | 'FAILED';
  completedAt: string;
  status: 'CAPTURE_READY' | 'CAPTURE_FAILED';
  errorCode: CaptureErrorCode | null;
  errorMessage: string | null;
  milestones: CaptureProgressMilestoneReceipt[];
  screenshot: ScreenshotReceipt | null;
  storage: CaptureStorageReceipt | null;
  artifactProof?: import('../p0vrCapture1R3a/captureArtifactProof.js').CaptureArtifactProof | null;
  navigation?: import('../p0vrCapture1R3a/captureNavigationReceipt.js').CaptureNavigationReceipt | null;
};

export type CaptureNowExecutionTrace = {
  jobReceipt: CaptureJobReceipt;
  screenshot: ScreenshotReceipt | null;
  storage: CaptureStorageReceipt | null;
  completion: CaptureCompletionReceipt | null;
};

/** Map internal milestones to founder-facing UI steps. */
export function mapMilestoneToUiStep(milestone: CaptureMilestone | null): string | null {
  switch (milestone) {
    case 'JOB_CREATED':
    case 'PAGE_OPENING':
    case 'PAGE_OPENED':
      return 'OPENING_PAGE';
    case 'VIEWPORT_RENDERING':
    case 'VIEWPORT_READY':
      return 'RENDERING_VIEWPORT';
    case 'SCREENSHOT_TAKING':
    case 'SCREENSHOT_CREATED':
      return 'TAKING_SCREENSHOT';
    case 'CAPTURE_SAVING':
    case 'CAPTURE_PERSISTED':
    case 'COMPLETE':
      return 'SAVING_CAPTURE';
    default:
      return null;
  }
}

export function latestUiStepFromMilestones(milestones: CaptureProgressMilestoneReceipt[]): string | null {
  if (!milestones.length) return null;
  return mapMilestoneToUiStep(milestones[milestones.length - 1]!.milestone);
}

export function pushMilestone(
  milestones: CaptureProgressMilestoneReceipt[],
  milestone: CaptureMilestone,
  detail?: string,
): CaptureProgressMilestoneReceipt[] {
  return [...milestones, { milestone, at: new Date().toISOString(), detail }];
}
