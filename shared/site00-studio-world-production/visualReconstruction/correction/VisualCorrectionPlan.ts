/**
 * Correction planning and scope evaluation.
 */

import type {
  MismatchKind,
  ReconstructionPass,
  RenderedReferenceComparison,
  VisualCorrection,
  VisualCorrectionPlan,
  VisualRegionLock,
} from '../types.js';
import { lockedRegionIds } from '../locks/VisualRegionLock.js';

export function evaluateCorrectionScope(
  mismatchKind: MismatchKind,
  severity: number,
): import('../types.js').CorrectionScope {
  if (severity < 0.05) return 'TOKEN';
  if (mismatchKind === 'TYPOGRAPHY') return 'ELEMENT';
  if (mismatchKind === 'GEOMETRY' || mismatchKind === 'OVERFLOW') return 'REGION';
  if (severity > 0.4) return 'PAGE';
  return 'ELEMENT';
}

export function buildVisualCorrectionPlan(
  comparison: RenderedReferenceComparison,
  locks: VisualRegionLock[],
  iteration: number,
  pass: ReconstructionPass,
): VisualCorrectionPlan {
  const locked = lockedRegionIds(locks);
  const corrections: VisualCorrection[] = [];

  for (const mismatch of comparison.mismatches) {
    if (locked.includes(mismatch.regionId)) continue;
    const scope = evaluateCorrectionScope(mismatch.kind, mismatch.severity);

    if (mismatch.kind === 'GEOMETRY' || mismatch.kind === 'OVERFLOW') {
      corrections.push({
        regionId: mismatch.regionId,
        scope,
        property: pass === 'GEOMETRY' ? 'marginTop' : 'paddingTop',
        delta: Math.round(mismatch.severity * -16),
        reason: mismatch.detail,
      });
    } else if (mismatch.kind === 'TYPOGRAPHY') {
      corrections.push({
        regionId: mismatch.regionId,
        scope: 'ELEMENT',
        property: 'fontSize',
        delta: mismatch.severity > 0.2 ? 1 : -1,
        reason: mismatch.detail,
      });
    } else if (mismatch.kind === 'COLOR' || mismatch.kind === 'SURFACE') {
      corrections.push({
        regionId: mismatch.regionId,
        scope: 'TOKEN',
        property: 'opacity',
        delta: 0.02,
        reason: mismatch.detail,
      });
    }
  }

  return {
    planId: `plan-${iteration}-${pass}-${Date.now()}`,
    iteration,
    pass,
    corrections: corrections.slice(0, 8),
    skippedLockedRegions: locked,
    generatedAt: new Date().toISOString(),
  };
}

export function applyCssCorrectionsToDocument(
  corrections: VisualCorrection[],
  cssVarPrefix = '--vr-correct',
): Record<string, string> {
  const vars: Record<string, string> = {};
  corrections.forEach((c, i) => {
    vars[`${cssVarPrefix}-${c.regionId}-${c.property}-${i}`] = String(c.delta);
  });
  return vars;
}
