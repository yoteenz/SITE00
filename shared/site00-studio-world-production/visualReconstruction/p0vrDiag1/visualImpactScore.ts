/**
 * P0.VR.DIAG.1 — Visual impact scoring for prioritization.
 */

import type { GeometryDelta, VisualImpactScore } from './types.js';

export function scoreGeometryImpact(
  diff: GeometryDelta,
  hierarchyWeight: number,
): VisualImpactScore {
  const abs = Math.abs(diff.absoluteDelta ?? 0);
  const geometryWeight = Math.min(1, abs / 48);
  const areaWeight = Math.min(1, (diff.relativeDeltaPct ?? 0) / 40);
  const salienceWeight = hierarchyWeight;
  const score = round((geometryWeight * 0.35 + areaWeight * 0.25 + salienceWeight * 0.4) * 100);
  return {
    evidenceId: diff.evidenceId,
    regionId: diff.regionId,
    score,
    areaWeight: round(areaWeight * 100),
    hierarchyWeight: round(hierarchyWeight * 100),
    geometryWeight: round(geometryWeight * 100),
    salienceWeight: round(salienceWeight * 100),
  };
}

export function pickTopImpactItems(scores: VisualImpactScore[], limit = 6): VisualImpactScore[] {
  return [...scores].sort((a, b) => b.score - a.score).slice(0, limit);
}

function round(n: number): number {
  return Math.round(n);
}
