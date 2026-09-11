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
  isPersistableCaptureUrl,
  resolveAssetRenderableUrl,
} from '../../assetDelivery/index.js';
import {
  buildCaptureArtifactProof,
  captureArtifactProofAllowsReady,
  buildCaptureNavigationReceipt,
  runCapturedPageIdentityCheck,
  type CaptureArtifactProof,
  type CaptureNavigationReceipt,
} from '../p0vrCapture1R3a/index.js';
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
  finalUrl?: string | null;
  byteSize?: number | null;
  mimeType?: string | null;
  storagePath?: string | null;
  checksum?: string | null;
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

  const navigation: CaptureNavigationReceipt | null = options.finalUrl
    ? buildCaptureNavigationReceipt({
        jobId: options.jobId,
        requestedRoute: options.input.route,
        resolvedRuntimePath: options.resolvedRuntimePath,
        finalUrl: options.finalUrl,
        viewport,
      })
    : null;

  const pageIdentity = navigation
    ? runCapturedPageIdentityCheck({
        projectId: options.input.projectId,
        pageId: canonicalPageId,
        screenId: options.input.screenId,
        route: options.input.route,
        navigation,
      })
    : null;

  const artifactProof: CaptureArtifactProof = buildCaptureArtifactProof({
    jobId: options.jobId,
    captureId,
    projectId: options.input.projectId,
    pageId: canonicalPageId,
    viewport,
    route: options.input.route,
    screenshotUrl: options.screenshotUrl,
    byteSize: options.byteSize,
    mimeType: options.mimeType ?? 'image/webp',
    width: dims.width,
    height: dims.height,
    checksum: options.checksum ?? null,
    storagePath: options.storagePath ?? null,
    navigation,
    pageIdentity,
  });

  const resolvedScreenshot = options.screenshotUrl
    ? resolveAssetRenderableUrl(options.screenshotUrl)
    : null;
  const renderableScreenshotUrl =
    resolvedScreenshot?.status === 'RESOLVED' ? resolvedScreenshot.url : null;
  const deliveryInvalid =
    Boolean(options.screenshotUrl) &&
    (!isPersistableCaptureUrl(options.screenshotUrl) || !renderableScreenshotUrl);
  const pageMismatch = pageIdentity != null && !pageIdentity.match;
  const artifactInvalid = !captureArtifactProofAllowsReady(artifactProof) && Boolean(options.screenshotUrl);
  const failed = Boolean(options.error || !options.screenshotUrl || deliveryInvalid || pageMismatch || artifactInvalid);

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
      error: deliveryInvalid ? 'IMAGE_DELIVERY_INVALID' : (options.error ?? 'SCREENSHOT_FAILED'),
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
      errorCode:
        options.errorCode ??
        (pageMismatch
          ? 'CAPTURE_PAGE_MISMATCH'
          : deliveryInvalid
            ? 'PUBLIC_URL_INVALID'
            : options.screenshotUrl
              ? 'STORAGE_FAILED'
              : 'SCREENSHOT_FAILED'),
      errorMessage: pageMismatch
        ? 'CAPTURE_PAGE_MISMATCH'
        : deliveryInvalid
          ? 'CAPTURE_IMAGE_URL_NOT_RENDERABLE'
          : (options.error ?? 'CAPTURE_FAILED'),
      milestones,
      screenshot,
      storage,
      artifactProof,
      navigation,
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
  milestones = pushMilestone(milestones, 'SCREENSHOT_CREATED', renderableScreenshotUrl!);
  milestones = pushMilestone(milestones, 'CAPTURE_SAVING');

  const screenshot: ScreenshotReceipt = {
    jobId: options.jobId,
    pageId: canonicalPageId,
    viewport,
    width: dims.width,
    height: dims.height,
    capturedAt,
    artifactRef: renderableScreenshotUrl,
    mimeType: options.mimeType ?? 'image/webp',
    byteSize: options.byteSize ?? null,
    status: 'CREATED',
  };

  const storage: CaptureStorageReceipt = {
    jobId: options.jobId,
    storageProvider: 'PUBLIC_URL',
    storagePath: resolvedScreenshot?.canonicalRef.objectPath ?? options.screenshotUrl,
    publicOrSignedRef: renderableScreenshotUrl,
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
      imageRef: renderableScreenshotUrl,
      capturedAt,
      status: 'CAPTURE_READY',
      screenId: options.input.screenId,
      captureSource: options.input.captureSource ?? 'FOUNDER_CAPTURE_NOW',
      capturedBuildVersion: options.input.capturedBuildVersion ?? P0_VR_CAPTURE_1R2_BUILD,
      artifactProof,
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
    imageRef: renderableScreenshotUrl,
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
    artifactProof,
    navigation,
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
