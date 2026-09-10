/**
 * P0.VR.CAPTURE.1 — Per-page, per-viewport capture authority store.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import { P0_VR_CAPTURE_1_BUILD } from './constants.js';
import type { CaptureSource, PageViewportCapture, PageViewportCaptureStatus } from './types.js';

const store = new Map<string, PageViewportCapture>();

function key(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  return `${projectId}::${pageId}::${viewport}`;
}

export function buildPageViewportCapture(options: {
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  captureId: string;
  route: string;
  resolvedRuntimePath: string;
  imageRef?: string | null;
  capturedAt?: string;
  capturedBuildVersion?: string;
  captureSource?: CaptureSource;
  screenId?: string;
  status?: PageViewportCaptureStatus;
}): PageViewportCapture {
  const dims = CANONICAL_VIEWPORT_DIMENSIONS[options.viewport];
  return {
    pageId: options.pageId,
    projectId: options.projectId,
    viewport: options.viewport,
    captureId: options.captureId,
    route: options.route,
    resolvedRuntimePath: options.resolvedRuntimePath,
    width: dims.width,
    height: dims.height,
    capturedAt: options.capturedAt ?? new Date().toISOString(),
    imageRef: options.imageRef ?? null,
    status: options.status ?? 'CAPTURE_READY',
    capturedBuildVersion: options.capturedBuildVersion ?? P0_VR_CAPTURE_1_BUILD,
    captureSource: options.captureSource ?? 'FOUNDER_CAPTURE_NOW',
    screenId: options.screenId,
  };
}

export function savePageViewportCapture(capture: PageViewportCapture): PageViewportCapture {
  store.set(key(capture.projectId, capture.pageId, capture.viewport), capture);
  return capture;
}

export function getPageViewportCapture(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageViewportCapture | null {
  return store.get(key(projectId, pageId, viewport)) ?? null;
}

export function listPageViewportCaptures(projectId: string, pageId?: string): PageViewportCapture[] {
  return [...store.values()].filter((c) => c.projectId === projectId && (!pageId || c.pageId === pageId));
}

export function derivePageViewportCaptureStatus(
  capture: PageViewportCapture | null,
  options?: { currentBuildVersion?: string; routeVersion?: string | null },
): PageViewportCaptureStatus {
  if (!capture) return 'NO_LIVE_CAPTURE';
  if (capture.status === 'CAPTURING') return 'CAPTURING';
  if (capture.status === 'CAPTURE_FAILED') return 'CAPTURE_FAILED';
  const build = options?.currentBuildVersion ?? P0_VR_CAPTURE_1_BUILD;
  if (capture.capturedBuildVersion && capture.capturedBuildVersion !== build) return 'CAPTURE_OUTDATED';
  if (options?.routeVersion && capture.captureId && !capture.imageRef) return 'CAPTURE_OUTDATED';
  return capture.imageRef ? 'CAPTURE_READY' : 'NO_LIVE_CAPTURE';
}

export function migrateLegacyCaptureToViewportCapture(options: {
  projectId: string;
  pageId: string;
  screenId: string;
  route: string;
  resolvedRuntimePath: string;
  viewport?: DesignViewportClass;
  imageRef?: string | null;
  capturedAt?: string | null;
}): PageViewportCapture | null {
  if (!options.imageRef && !options.capturedAt) return null;
  const viewport = options.viewport ?? 'mobile';
  const capture = buildPageViewportCapture({
    projectId: options.projectId,
    pageId: options.pageId,
    viewport,
    captureId: `legacy-${options.pageId}-${viewport}`,
    route: options.route,
    resolvedRuntimePath: options.resolvedRuntimePath,
    imageRef: options.imageRef ?? null,
    capturedAt: options.capturedAt ?? undefined,
    captureSource: 'OTHER',
    status: options.imageRef ? 'CAPTURE_READY' : 'NO_LIVE_CAPTURE',
  });
  return savePageViewportCapture(capture);
}

export function resetPageViewportCaptureStoreForTest(): void {
  store.clear();
}
