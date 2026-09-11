/**
 * P0.VR.CAPTURE.1R2 — Client-side capture now helpers (pageId, errors, telemetry).
 */

import {
  buildPageId,
  migrateHistoricalRootCapturePageId,
} from '../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyRootTarget.js';
import type { CaptureCompletionReceipt, CaptureErrorCode } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/captureReceipts.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';

export function resolveCapturePageId(projectId: string, row: PageVisualIndexRow): string {
  const route = row.normalizedRoute ?? row.route ?? '/';
  const raw = buildPageId(projectId, route);
  return migrateHistoricalRootCapturePageId(projectId, raw);
}

export function captureFailureMessage(errorCode: CaptureErrorCode | null | undefined, fallback?: string): string {
  switch (errorCode) {
    case 'PAGE_OPEN_FAILED':
      return 'CAPTURE FAILED — THE PAGE COULD NOT BE OPENED.';
    case 'SCREENSHOT_FAILED':
    case 'RENDER_FAILED':
      return 'CAPTURE FAILED — THE PAGE OPENED, BUT THE SCREENSHOT COULD NOT BE CREATED.';
    case 'STORAGE_FAILED':
      return 'CAPTURE FAILED — WE TOOK THE SCREENSHOT, BUT COULD NOT SAVE IT.';
    case 'PERSISTENCE_FAILED':
      return 'CAPTURE FAILED — THE SCREENSHOT WAS CREATED, BUT THE CAPTURE RECORD COULD NOT BE SAVED.';
    case 'BINDING_FAILED':
      return 'CAPTURE SAVED — PREVIEW COULD NOT REFRESH.';
    case 'TIMEOUT':
      return 'CAPTURE TOOK TOO LONG.';
    default:
      if (fallback?.includes('CAPTURE_SCREENSHOT_TOO_SMALL') || fallback?.includes('PAGE_NOT_FOUND')) {
        return 'CAPTURE FAILED — PAGE DID NOT RENDER (404 OR BLANK). RECAPTURE AFTER HARD REFRESH.';
      }
      if (fallback?.includes('CAPTURE_ANCHOR_MISSING')) {
        return 'CAPTURE FAILED — PAGE OPENED BUT NDX HEADER DID NOT RENDER. TRY AGAIN IN A MOMENT.';
      }
      return fallback ?? 'CAPTURE FAILED';
  }
}

export function logCaptureTelemetry(event: string, payload: Record<string, unknown>): void {
  if (typeof console === 'undefined' || !console.info) return;
  console.info(`[capture-now] ${event}`, payload);
}

export function completionBindingFailed(completion: CaptureCompletionReceipt): boolean {
  return (
    completion.status === 'CAPTURE_READY' &&
    completion.persistenceStatus === 'SUCCESS' &&
    completion.storageStatus === 'SUCCESS' &&
    completion.bindingStatus === 'FAILED'
  );
}
