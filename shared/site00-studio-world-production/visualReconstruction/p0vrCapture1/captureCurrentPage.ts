/**
 * P0.VR.CAPTURE.1 / 1R2 — Capture exactly one page + one viewport (no project run).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import { resolveRuntimeRouteForPage } from '../p0vr8r3/runtimeRouteResolver.js';
import { getProjectPageRecord } from '../p0vr8/projectPageRegistry.js';
import { P0_VR_CAPTURE_1R2_BUILD, PAGE_CAPTURE_TIMEOUT_MS } from './constants.js';
import { beginCaptureJobReceipt, completeCapturePipeline } from './captureCompletionPipeline.js';
import type { CaptureCompletionReceipt } from './captureReceipts.js';
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
  jobReceipt: ReturnType<typeof beginCaptureJobReceipt>;
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
  const jobId = buildSinglePageCaptureJobId(input.projectId, input.pageId, viewport);

  return {
    jobId,
    resolvedRuntimePath,
    viewport,
    singlePageJob: true,
    projectRunCreated: false,
    jobReceipt: beginCaptureJobReceipt({
      jobId,
      projectId: input.projectId,
      pageId: input.pageId,
      viewport,
      route: input.route,
      resolvedRuntimePath,
    }),
  };
}

function resultFromCompletion(
  completion: CaptureCompletionReceipt,
  jobId: string,
  dimensions: { width: number; height: number },
): CaptureCurrentPageResult {
  return {
    captureId: completion.captureId,
    screenshot: completion.imageRef,
    capturedAt: completion.capturedAt,
    viewport: completion.viewport,
    dimensions,
    route: completion.route,
    pageId: completion.pageId,
    status: completion.status,
    jobId,
    singlePageJob: true,
    projectRunCreated: false,
    error: completion.errorMessage ?? undefined,
    completion,
    imageRef: completion.imageRef,
  };
}

export function finalizeCaptureCurrentPage(options: {
  input: CaptureCurrentPageInput;
  jobId: string;
  resolvedRuntimePath: string;
  screenshotUrl: string | null;
  captureId?: string;
  error?: string;
  jobReceipt?: ReturnType<typeof beginCaptureJobReceipt>;
}): CaptureCurrentPageResult {
  const viewport = resolveCaptureViewport(options.input.viewport);
  const dims = CANONICAL_VIEWPORT_DIMENSIONS[viewport];
  const trace = completeCapturePipeline({
    input: options.input,
    jobId: options.jobId,
    resolvedRuntimePath: options.resolvedRuntimePath,
    screenshotUrl: options.screenshotUrl,
    captureId: options.captureId,
    error: options.error,
    jobReceipt: options.jobReceipt,
  });
  if (!trace.completion) {
    throw new Error('CAPTURE_COMPLETION_MISSING');
  }
  return resultFromCompletion(trace.completion, options.jobId, dims);
}

export function resetCaptureCurrentPageForTest(): void {
  inFlight.clear();
}

export { P0_VR_CAPTURE_1R2_BUILD };
