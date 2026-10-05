/**
 * P0.VR.3E — Family outlier detection from implementation snapshots.
 */

import type { FamilyOutlierSignal } from './types.js';
import { listScreensWithSnapshots } from './implementationSnapshotCoverage.js';

export function detectPossibleFamilyOutliers(projectId: string, familySeed: string): FamilyOutlierSignal[] {
  const screens = listScreensWithSnapshots(projectId).filter((s) => s.routeFamily === familySeed);
  if (screens.length < 2) return [];

  const withMobile = screens.filter((s) => s.mobile?.publicUrl);
  if (withMobile.length < 2) return [];

  const signals: FamilyOutlierSignal[] = [];
  for (const screen of withMobile) {
    const peers = withMobile.filter((p) => p.screenId !== screen.screenId);
    const peerStatuses = peers.map((p) => p.mobile?.captureStatus ?? 'MISSING');
    const selfStatus = screen.mobile?.captureStatus ?? 'MISSING';
    const peerFailed = peerStatuses.filter((s) => s === 'CURRENT').length;
    if (selfStatus === 'FAILED' && peerFailed >= 1) {
      signals.push({
        familySeed,
        screenId: screen.screenId,
        signal: 'POSSIBLE_FAMILY_OUTLIER',
        reason: 'Capture failed while peer family members captured successfully',
      });
    }
  }
  return signals;
}
