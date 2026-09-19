/**
 * P0.VR.REPLICATION.1 — Twin vs authority diff scores (unknown ≠ 100).
 */

import type { VisualConvergenceScore } from '../p0vrDiag1/types.js';
import type { VisualReplicationDiff } from './types.js';

function scoreOrUnknown(value: number | undefined | null, measured: boolean): number | null {
  if (!measured || value == null || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function buildVisualReplicationDiff(input: {
  iteration: number;
  convergenceAfter?: VisualConvergenceScore | null;
  compositionCoveragePass: boolean;
  measured: boolean;
}): VisualReplicationDiff {
  const after = input.convergenceAfter;
  const compositionScore = input.compositionCoveragePass
    ? scoreOrUnknown(after?.composition ?? after?.order, input.measured)
    : scoreOrUnknown(after?.composition ?? 22, input.measured);

  const issues: string[] = [];
  if (compositionScore != null && compositionScore < 80) issues.push('COMPOSITION_MISMATCH');
  if (after && after.geometry < 70) issues.push('GEOMETRY_DRIFT');
  if (after && after.assets < 70) issues.push('ASSET_PLACEMENT');

  return {
    diffId: `vrd_${Date.now()}_${input.iteration}`,
    compositionScore,
    geometryScore: scoreOrUnknown(after?.geometry, input.measured),
    typographyScore: scoreOrUnknown(after?.typography, input.measured),
    assetPlacementScore: scoreOrUnknown(after?.assets, input.measured),
    surfaceScore: scoreOrUnknown(after?.spacing, input.measured),
    controlScore: scoreOrUnknown(after?.controls, input.measured),
    pixelDiffScore: null,
    highestImpactIssues: issues.length ? issues : ['NONE'],
    confidence: input.measured ? 'MEDIUM' : 'UNKNOWN',
    iteration: input.iteration,
  };
}

export function formatReplicationScore(value: number | null): string {
  if (value == null) return 'UNKNOWN';
  return String(value);
}
