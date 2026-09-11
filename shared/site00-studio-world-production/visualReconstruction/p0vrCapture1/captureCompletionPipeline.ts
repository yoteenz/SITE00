/**
 * P0.VR.CAPTURE.1R2 — Build receipts and persist capture atomically.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import { migrateHistoricalRootCapturePageId } from '../../pageFamilyWorkspace/pageFamilyRootTarget.js';
import {
  type CaptureCompletionReceipt,
  type CaptureJobReceipt,
  type CaptureNowExecutionTrace,
  type CaptureProgressMilestoneReceipt,
  type CaptureStorageReceipt,
  type ScreenshotReceipt,
  pushMilestone,
} from './captureReceipts.js';
import { P0_VR_CAPTURE_1R2_BUILD } from './constants.js';
import {
  buildPageViewportCapture,
  savePageViewportCapture,
} from './pageViewportCapture.js';
import type { CaptureCurrentPageInput, PageViewportCapture } from './types.js';

function generateCaptureId(jobId: string): string {
  return `cap_${jobId.replace(/^capture_now_/, '')}`;
}

export function beginCaptureJobReceipt(input: {
  jobId: string;
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  route: string;
  resolvedRuntimePath: string;
}): CaptureJobReceipt {
  const startedAt = new Date().toISOString();
  return {
    jobId: input.jobId,
    projectId: input.projectId,
    pageId: migrateHistoricalRootCapturePageId(input.projectId, input.pageId),
    viewport: input.viewport,
    route: input.route,
    resolvedRuntimePath: input.resolvedRuntimePath,
    status: 'RUNNING',
    startedAt,
    completedAt: null,
    errorCode: null,
    errorMessage: null,
    milestones: pushMilestone([], 'JOB_CREATED'),
  };
}

export function completeCapturePipeline(options: {
  input: CaptureCurrentPageInput;
  jobId: string;
  resolvedRuntimePath: string;
  screenshotUrl: string | null;
  captureId?: string;
  error?: string;
  errorCode?: CaptureCompletionReceipt['errorCode'];
  jobReceipt?: CaptureJobReceipt;
}): CaptureNowExecutionTrace {
  const viewport = options.input.viewport;
  const dims = CANONICAL_VIEWPORT_DIMENSIONS[viewport];
  const canonicalPageId = migrateHistoricalRootCapturePageId(options.input.projectId, options.input.pageId);
  const captureId = options.captureId ?? generateCaptureId(options.jobId);
  const capturedAt = new Date().toISOString();

  let milestones: CaptureProgressMilestoneReceipt[] =
    options.jobReceipt?.milestones ?? pushMilestone([], 'JOB_CREATED');
  milestones = pushMilestone(milestones, 'PAGE_OPENING');
  milestones = pushMilestone(milestones, 'PAGE_OPENED');
  milestones = pushMilestone(milestones, 'VIEWPORT_RENDERING');
  milestones = pushMilestone(milestones, 'VIEWPORT_READY');

  const failed = Boolean(options.error || !options.screenshotUrl);

  if (failed) {
    milestones = pushMilestone(milestones, 'SCREENSHOT_TAKING');
    const screenshot: ScreenshotReceipt = {
      jobId: options.jobId,
      pageId: canonicalPageId,
      viewport,
      width: dims.width,
      height: dims.height,
      capturedAt,
      artifactRef: null,
      mimeType: 'image/png',
      byteSize: null,
      status: 'FAILED',
    };
    const storage: CaptureStorageReceipt = {
      jobId: options.jobId,
      storageProvider: 'NONE',
      storagePath: null,
      publicOrSignedRef: null,
      writtenAt: null,
      status: 'FAILED',
      error: options.error ?? 'SCREENSHOT_FAILED',
    };
    savePageViewportCapture(
      buildPageViewportCapture({
        projectId: options.input.projectId,
        pageId: canonicalPageId,
        viewport,
        captureId,
        route: options.input.route,
        resolvedRuntimePath: options.resolvedRuntimePath,
        imageRef: null,
        capturedAt,
        status: 'CAPTURE_FAILED',
        screenId: options.input.screenId,
        captureSource: options.input.captureSource ?? 'FOUNDER_CAPTURE_NOW',
        capturedBuildVersion: options.input.capturedBuildVersion ?? P0_VR_CAPTURE_1R2_BUILD,
      }),
    );
    const completion: CaptureCompletionReceipt = {
      jobId: options.jobId,
      captureId,
      projectId: options.input.projectId,
      pageId: canonicalPageId,
      viewport,
      route: options.input.route,
      resolvedRuntimePath: options.resolvedRuntimePath,
      imageRef: null,
      capturedAt,
      storageStatus: 'FAILED',
      persistenceStatus: 'SUCCESS',
      bindingStatus: 'FAILED',
      completedAt: capturedAt,
      status: 'CAPTURE_FAILED',
      errorCode: options.errorCode ?? (options.screenshotUrl ? 'STORAGE_FAILED' : 'SCREENSHOT_FAILED'),
      errorMessage: options.error ?? 'CAPTURE_FAILED',
      milestones,
      screenshot,
      storage,
    };
    const jobReceipt: CaptureJobReceipt = {
      ...(options.jobReceipt ??
        beginCaptureJobReceipt({
          jobId: options.jobId,
          projectId: options.input.projectId,
          pageId: canonicalPageId,
          viewport,
          route: options.input.route,
          resolvedRuntimePath: options.resolvedRuntimePath,
        })),
      status: 'FAILED',
      completedAt: capturedAt,
      errorCode: completion.errorCode,
      errorMessage: completion.errorMessage,
      milestones,
      pageId: canonicalPageId,
    };
    return { jobReceipt, screenshot, storage, completion };
  }

  milestones = pushMilestone(milestones, 'SCREENSHOT_TAKING');
  milestones = pushMilestone(milestones, 'SCREENSHOT_CREATED', options.screenshotUrl!);
  milestones = pushMilestone(milestones, 'CAPTURE_SAVING');

  const screenshot: ScreenshotReceipt = {
    jobId: options.jobId,
    pageId: canonicalPageId,
    viewport,
    width: dims.width,
    height: dims.height,
    capturedAt,
    artifactRef: options.screenshotUrl,
    mimeType: 'image/png',
    byteSize: null,
    status: 'CREATED',
  };

  const storage: CaptureStorageReceipt = {
    jobId: options.jobId,
    storageProvider: 'PUBLIC_URL',
    storagePath: options.screenshotUrl,
    publicOrSignedRef: options.screenshotUrl,
    writtenAt: capturedAt,
    status: 'SUCCESS',
    error: null,
  };

  savePageViewportCapture(
    buildPageViewportCapture({
      projectId: options.input.projectId,
      pageId: canonicalPageId,
      viewport,
      captureId,
      route: options.input.route,
      resolvedRuntimePath: options.resolvedRuntimePath,
      imageRef: options.screenshotUrl,
      capturedAt,
      status: 'CAPTURE_READY',
      screenId: options.input.screenId,
      captureSource: options.input.captureSource ?? 'FOUNDER_CAPTURE_NOW',
      capturedBuildVersion: options.input.capturedBuildVersion ?? P0_VR_CAPTURE_1R2_BUILD,
    }),
  );

  milestones = pushMilestone(milestones, 'CAPTURE_PERSISTED', captureId);
  milestones = pushMilestone(milestones, 'COMPLETE');

  const completion: CaptureCompletionReceipt = {
    jobId: options.jobId,
    captureId,
    projectId: options.input.projectId,
    pageId: canonicalPageId,
    viewport,
    route: options.input.route,
    resolvedRuntimePath: options.resolvedRuntimePath,
    imageRef: options.screenshotUrl,
    capturedAt,
    storageStatus: 'SUCCESS',
    persistenceStatus: 'SUCCESS',
    bindingStatus: 'READY',
    completedAt: capturedAt,
    status: 'CAPTURE_READY',
    errorCode: null,
    errorMessage: null,
    milestones,
    screenshot,
    storage,
  };

  const jobReceipt: CaptureJobReceipt = {
    ...(options.jobReceipt ??
      beginCaptureJobReceipt({
        jobId: options.jobId,
        projectId: options.input.projectId,
        pageId: canonicalPageId,
        viewport,
        route: options.input.route,
        resolvedRuntimePath: options.resolvedRuntimePath,
      })),
    status: 'COMPLETE',
    completedAt: capturedAt,
    milestones,
    pageId: canonicalPageId,
  };

  return { jobReceipt, screenshot, storage, completion };
}

export function bindCaptureCompletionToClientStore(completion: CaptureCompletionReceipt): PageViewportCapture {
  return savePageViewportCapture(
    buildPageViewportCapture({
      projectId: completion.projectId,
      pageId: completion.pageId,
      viewport: completion.viewport,
      captureId: completion.captureId,
      route: completion.route,
      resolvedRuntimePath: completion.resolvedRuntimePath,
      imageRef: completion.imageRef,
      capturedAt: completion.capturedAt,
      status: completion.status === 'CAPTURE_READY' ? 'CAPTURE_READY' : 'CAPTURE_FAILED',
      captureSource: 'FOUNDER_CAPTURE_NOW',
    }),
  );
}
