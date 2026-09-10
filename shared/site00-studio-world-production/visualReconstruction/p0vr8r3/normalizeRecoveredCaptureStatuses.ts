/**
 * P0.VR.8R3R1 — One-time normalization: never-captured pages must not show STALE.
 */

import { listProjectPageRecords, upsertProjectPageRecord } from '../p0vr8/projectPageRegistry.js';

export function normalizeRecoveredCaptureStatuses(projectId: string): { normalized: number } {
  let normalized = 0;
  const pages = listProjectPageRecords(projectId, false);

  for (const page of pages) {
    if (!page.isActive) continue;
    const neverCaptured = !page.lastCapturedAt && !page.lastVisualHash;
    if (!neverCaptured) continue;

    if (page.status === 'STALE' || page.status === 'DISCOVERED') {
      upsertProjectPageRecord({
        ...page,
        status: 'DISCOVERED',
        updatedAt: new Date().toISOString(),
      });
      normalized++;
    }
  }

  return { normalized };
}
