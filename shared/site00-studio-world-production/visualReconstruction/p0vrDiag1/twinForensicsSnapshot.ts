/**
 * P0.VR.DIAG.1 — Post-twin forensics input derived from measured spec (no hardcoded pilot px).
 */

import type { ReconstructionPlan } from '../p0vrCapture1/reconstructionPlan.js';

export function deriveTwinCssSnapshotFromPlan(plan: ReconstructionPlan): Record<string, number> {
  const snapshot: Record<string, number> = {};
  for (const change of [...plan.spacingChanges, ...plan.geometryChanges, ...plan.componentChanges]) {
    if (!change.authorityValue) continue;
    const gutter = /(\d+(?:\.\d+)?)px/.exec(change.authorityValue);
    if (change.regionName?.includes('GUTTER') && gutter) {
      snapshot.contentPaddingX = Number(gutter[1]);
    }
    if (change.regionName?.includes('GAP') && gutter) {
      snapshot.sectionGap = Number(gutter[1]);
    }
    if (change.regionName?.includes('HEADER') && gutter) {
      snapshot.headerHeightPx = Number(gutter[1]);
    }
    if (change.regionName?.includes('BOTTOM NAV') && gutter) {
      snapshot.bottomNavHeightPx = Number(gutter[1]);
    }
  }
  return snapshot;
}
