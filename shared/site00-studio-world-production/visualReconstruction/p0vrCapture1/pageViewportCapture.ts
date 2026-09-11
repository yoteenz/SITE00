/**
 * P0.VR.CAPTURE.1 — Per-page, per-viewport capture authority store.
 * P0.VR.CAPTURE.1R2 — History, persistence, reactive subscriptions.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import { migrateHistoricalRootCapturePageId } from '../../pageFamilyWorkspace/pageFamilyRootTarget.js';
import { P0_VR_CAPTURE_1R2_BUILD } from './constants.js';
import type { CaptureSource, PageViewportCapture, PageViewportCaptureStatus } from './types.js';

const store = new Map<string, PageViewportCapture>();
const history = new Map<string, PageViewportCapture[]>();
const listeners = new Set<() => void>();

const LS_PREFIX = 'site00:pvc:';

export type PageViewportCaptureRecord = PageViewportCapture;

function key(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  return `${projectId}::${pageId}::${viewport}`;
}

function historyKey(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  return key(projectId, pageId, viewport);
}

function notifyListeners(): void {
  for (const fn of listeners) fn();
}

export function subscribePageViewportCaptures(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persistCapture(capture: PageViewportCapture): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  try {
    globalThis.localStorage.setItem(
      `${LS_PREFIX}${key(capture.projectId, capture.pageId, capture.viewport)}`,
      JSON.stringify(capture),
    );
  } catch {
    /* quota / private mode */
  }
}

export function hydratePageViewportCapturesFromStorage(projectId: string): number {
  if (typeof globalThis.localStorage === 'undefined') return 0;
  let count = 0;
  for (let i = 0; i < globalThis.localStorage.length; i++) {
    const k = globalThis.localStorage.key(i);
    if (!k?.startsWith(`${LS_PREFIX}${projectId}::`)) continue;
    try {
      const raw = globalThis.localStorage.getItem(k);
      if (!raw) continue;
      const capture = JSON.parse(raw) as PageViewportCapture;
      store.set(key(capture.projectId, capture.pageId, capture.viewport), capture);
      count++;
    } catch {
      /* skip corrupt */
    }
  }
  if (count > 0) notifyListeners();
  return count;
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
  const canonicalPageId = migrateHistoricalRootCapturePageId(options.projectId, options.pageId);
  return {
    pageId: canonicalPageId,
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
    capturedBuildVersion: options.capturedBuildVersion ?? P0_VR_CAPTURE_1R2_BUILD,
    captureSource: options.captureSource ?? 'FOUNDER_CAPTURE_NOW',
    screenId: options.screenId,
  };
}

export function savePageViewportCapture(capture: PageViewportCapture): PageViewportCapture {
  const canonicalPageId = migrateHistoricalRootCapturePageId(capture.projectId, capture.pageId);
  const normalized: PageViewportCapture = { ...capture, pageId: canonicalPageId };
  const k = key(normalized.projectId, normalized.pageId, normalized.viewport);
  store.set(k, normalized);

  const hk = historyKey(normalized.projectId, normalized.pageId, normalized.viewport);
  const prev = history.get(hk) ?? [];
  if (!prev.some((p) => p.captureId === normalized.captureId)) {
    history.set(hk, [...prev, normalized]);
  }

  persistCapture(normalized);
  notifyListeners();
  return normalized;
}

export function getPageViewportCapture(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageViewportCapture | null {
  const canonicalPageId = migrateHistoricalRootCapturePageId(projectId, pageId);
  return (
    store.get(key(projectId, canonicalPageId, viewport)) ??
    store.get(key(projectId, pageId, viewport)) ??
    null
  );
}

export function listPageViewportCaptureHistory(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageViewportCapture[] {
  const canonicalPageId = migrateHistoricalRootCapturePageId(projectId, pageId);
  return history.get(historyKey(projectId, canonicalPageId, viewport)) ?? [];
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
  const build = options?.currentBuildVersion ?? P0_VR_CAPTURE_1R2_BUILD;
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
  history.clear();
  listeners.clear();
}
