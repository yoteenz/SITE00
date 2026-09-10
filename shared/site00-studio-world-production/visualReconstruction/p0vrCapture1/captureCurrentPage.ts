/**
 * P0.VR.CAPTURE.1 — Capture exactly one page + one viewport (no project run).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import { resolveRuntimeRouteForPage } from '../p0vr8r3/runtimeRouteResolver.js';
import { getProjectPageRecord } from '../p0vr8/projectPageRegistry.js';
import { P0_VR_CAPTURE_1_BUILD, PAGE_CAPTURE_TIMEOUT_MS } from './constants.js';
import {
  buildPageViewportCapture,
  savePageViewportCapture,
} from './pageViewportCapture.js';
import type { CaptureCurrentPageInput, CaptureCurrentPageResult } from './types.js';

const inFlight = new Map<string, number>();

function lockKey(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  return `${projectId}:${pageId}:${viewport}`;
}

export function isCaptureNowInFlight(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): boolean {
  const until = inFlight.get(lockKey(projectId, pageId, viewport));
  if (!until) return false;
  if (Date.now() > until) {
    inFlight.delete(lockKey(projectId, pageId, viewport));
    return false;
  }
  return true;
}

export function acquireCaptureNowLock(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): boolean {
  if (isCaptureNowInFlight(projectId, pageId, viewport)) return false;
  inFlight.set(lockKey(projectId, pageId, viewport), Date.now() + PAGE_CAPTURE_TIMEOUT_MS);
  return true;
}

export function releaseCaptureNowLock(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): void {
  inFlight.delete(lockKey(projectId, pageId, viewport));
}

export function resolveCaptureViewport(viewport: DesignViewportClass): DesignViewportClass {
  if (viewport === 'ultrawide') return 'desktop';
  return viewport;
}

export function buildSinglePageCaptureJobId(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  const short = pageId.split(':').pop()?.slice(0, 12) ?? 'page';
  return `capture_now_${projectId}_${short}_${viewport}_${Date.now()}`;
}

export function planCaptureCurrentPage(input: CaptureCurrentPageInput): {
  jobId: string;
  resolvedRuntimePath: string;
  viewport: DesignViewportClass;
  singlePageJob: true;
  projectRunCreated: false;
} {
  const viewport = resolveCaptureViewport(input.viewport);
  const pageRecord =
    getProjectPageRecord(input.projectId, input.pageId) ??
    ({
      projectId: input.projectId,
      pageId: input.pageId,
      screenId: input.screenId,
      route: input.route,
      normalizedRoute: input.route,
      status: 'DISCOVERED',
    } as Parameters<typeof resolveRuntimeRouteForPage>[0]);
  const routeIdentity = resolveRuntimeRouteForPage(pageRecord);
  const resolvedRuntimePath =
    input.resolvedRuntimePath ??
    routeIdentity.resolvedRuntimePath ??
    input.route;

  return {
    jobId: buildSinglePageCaptureJobId(input.projectId, input.pageId, viewport),
    resolvedRuntimePath,
    viewport,
    singlePageJob: true,
    projectRunCreated: false,
  };
}

export function finalizeCaptureCurrentPage(options: {
  input: CaptureCurrentPageInput;
  jobId: string;
  resolvedRuntimePath: string;
  screenshotUrl: string | null;
  captureId?: string;
  error?: string;
}): CaptureCurrentPageResult {
  const viewport = resolveCaptureViewport(options.input.viewport);
  const dims = CANONICAL_VIEWPORT_DIMENSIONS[viewport];
  const capturedAt = new Date().toISOString();
  const captureId = options.captureId ?? `${options.jobId}-capture`;

  if (options.error || !options.screenshotUrl) {
    savePageViewportCapture(
      buildPageViewportCapture({
        projectId: options.input.projectId,
        pageId: options.input.pageId,
        viewport,
        captureId,
        route: options.input.route,
        resolvedRuntimePath: options.resolvedRuntimePath,
        imageRef: null,
        capturedAt,
        status: 'CAPTURE_FAILED',
        screenId: options.input.screenId,
        captureSource: options.input.captureSource ?? 'FOUNDER_CAPTURE_NOW',
        capturedBuildVersion: options.input.capturedBuildVersion ?? P0_VR_CAPTURE_1_BUILD,
      }),
    );
    return {
      captureId,
      screenshot: null,
      capturedAt,
      viewport,
      dimensions: { width: dims.width, height: dims.height },
      route: options.input.route,
      pageId: options.input.pageId,
      status: 'CAPTURE_FAILED',
      jobId: options.jobId,
      singlePageJob: true,
      projectRunCreated: false,
      error: options.error ?? 'CAPTURE_FAILED',
    };
  }

  savePageViewportCapture(
    buildPageViewportCapture({
      projectId: options.input.projectId,
      pageId: options.input.pageId,
      viewport,
      captureId,
      route: options.input.route,
      resolvedRuntimePath: options.resolvedRuntimePath,
      imageRef: options.screenshotUrl,
      capturedAt,
      status: 'CAPTURE_READY',
      screenId: options.input.screenId,
      captureSource: options.input.captureSource ?? 'FOUNDER_CAPTURE_NOW',
      capturedBuildVersion: options.input.capturedBuildVersion ?? P0_VR_CAPTURE_1_BUILD,
    }),
  );

  return {
    captureId,
    screenshot: options.screenshotUrl,
    capturedAt,
    viewport,
    dimensions: { width: dims.width, height: dims.height },
    route: options.input.route,
    pageId: options.input.pageId,
    status: 'CAPTURE_READY',
    jobId: options.jobId,
    singlePageJob: true,
    projectRunCreated: false,
  };
}

export function resetCaptureCurrentPageForTest(): void {
  inFlight.clear();
}
