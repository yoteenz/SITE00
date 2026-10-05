/**
 * P0.VR.DIAG.1R4 — Merge recovered dimensions; preserve valid high-confidence evidence.
 */

import type { RegionDimensionEvidence } from '../p0vrDiag1/types.js';

function sourceRank(row: RegionDimensionEvidence): number {
  const cur = row.currentSource ?? row.source;
  if (cur === 'DOM_RECT' || cur === 'COMPUTED_STYLE' || cur === 'CHILD_ANCHOR') return 4;
  if (cur === 'CSS_SNAPSHOT' || cur === 'DOM') return 3;
  if (row.authoritySource === 'AUTHORITY_IMAGE_ESTIMATE') return 2;
  return 1;
}

function confidenceRank(c: RegionDimensionEvidence['confidence']): number {
  if (c === 'HIGH') return 3;
  if (c === 'MEDIUM') return 2;
  return 1;
}

function isValidComparable(row: RegionDimensionEvidence): boolean {
  return Boolean(row.authorityValue != null && row.currentValue != null && row.delta != null);
}

export function mergeRecoveredDimensions(
  existing: RegionDimensionEvidence[],
  recovered: RegionDimensionEvidence[],
): { merged: RegionDimensionEvidence[]; added: number; conflicts: string[] } {
  const byDim = new Map<string, RegionDimensionEvidence>();
  const conflicts: string[] = [];

  for (const row of existing) {
    byDim.set(row.dimension, row);
  }

  let added = 0;
  for (const row of recovered) {
    const prev = byDim.get(row.dimension);
    if (!prev) {
      byDim.set(row.dimension, row);
      added += 1;
      continue;
    }

    if (prev.measurementConflict || row.measurementConflict) {
      conflicts.push(row.dimension);
    }

    const prevValid = isValidComparable(prev);
    const nextValid = isValidComparable(row);
    const prevScore = prevValid ? sourceRank(prev) + confidenceRank(prev.confidence) : 0;
    const nextScore = nextValid ? sourceRank(row) + confidenceRank(row.confidence) : 0;

    if (nextScore > prevScore) {
      if (
        prevValid &&
        nextValid &&
        prev.currentValue !== row.currentValue &&
        sourceRank(prev) >= sourceRank(row)
      ) {
        byDim.set(row.dimension, { ...row, measurementConflict: true });
        conflicts.push(row.dimension);
      } else {
        byDim.set(row.dimension, row);
        if (!prevValid && nextValid) added += 1;
      }
    }
  }

  return { merged: [...byDim.values()], added, conflicts };
}
