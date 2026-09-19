/**
 * P0.VR.8R3R2 — Reconcile recovered page records to canonical capture states.
 */

import { listProjectPageRecords, upsertProjectPageRecord } from '../p0vr8/projectPageRegistry.js';
import { resolvePageCaptureStateFromRecord } from './pageCaptureStateResolver.js';

export function reconcileRecoveredPageCaptureStates(projectId: string): {
  reconciled: number;
  neverCaptured: number;
} {
  let reconciled = 0;
  let neverCaptured = 0;
  const pages = listProjectPageRecords(projectId, false);

  for (const page of pages) {
    if (!page.isActive) continue;

    const resolved = resolvePageCaptureStateFromRecord(page, null);
    if (resolved === 'NEVER_CAPTURED') neverCaptured++;

    const hasCapture = Boolean(page.lastCapturedAt || page.lastVisualHash);
    if (!hasCapture && (page.status === 'STALE' || page.status === 'DISCOVERED' || page.status === 'CAPTURE_PENDING')) {
      upsertProjectPageRecord({
        ...page,
        status: 'DISCOVERED',
        updatedAt: new Date().toISOString(),
      });
      reconciled++;
    }
  }

  return { reconciled, neverCaptured };
}

/** @deprecated use reconcileRecoveredPageCaptureStates */
export function normalizeRecoveredCaptureStatuses(projectId: string): { normalized: number } {
  const result = reconcileRecoveredPageCaptureStates(projectId);
  return { normalized: result.reconciled };
}
