/**
 * P0.VR.DIAG.1 — Before/after drift convergence scoring.
 */

import type { AuthorityRelativeForensicsReport, VisualConvergenceScore } from './types.js';

export function computeVisualConvergenceScore(input: {
  before: AuthorityRelativeForensicsReport;
  after: AuthorityRelativeForensicsReport;
  functionScore?: number;
}): { before: VisualConvergenceScore; after: VisualConvergenceScore } {
  const before = dimensionScores(input.before);
  const after = dimensionScores(input.after);
  before.function = input.functionScore ?? 100;
  after.function = input.functionScore ?? 100;
  before.overall = overallFromDimensions(before);
  after.overall = overallFromDimensions(after);
  return { before, after };
}

function dimensionScores(report: AuthorityRelativeForensicsReport): VisualConvergenceScore {
  const geometry = scoreFromDiffCount(report.geometryDiffs.length, report.regionMatches.length);
  const spacing = scoreFromDiffCount(report.spacingDiffs.length, report.regionMatches.length);
  const typography = scoreFromDiffCount(report.typographyDiffs.length, report.regionMatches.length);
  const assets = scoreFromDiffCount(report.assetDiffs.length, report.regionMatches.length);
  const hierarchy = scoreFromDiffCount(report.hierarchyDiffs.length, 1);
  const controls = scoreFromDiffCount(report.controlDiffs.length, report.regionMatches.length);
  const order = scoreFromDiffCount(report.orderDiffs.length, 1);
  return {
    geometry,
    spacing,
    typography,
    assets,
    hierarchy,
    controls,
    order,
    function: 100,
    overall: 0,
  };
}

function scoreFromDiffCount(diffCount: number, regionCount: number): number {
  const denom = Math.max(1, regionCount);
  const ratio = diffCount / denom;
  return Math.max(0, Math.min(100, Math.round(100 - ratio * 35 - diffCount * 4)));
}

function overallFromDimensions(score: VisualConvergenceScore): number {
  const visual =
    score.geometry * 0.25 +
    score.spacing * 0.2 +
    score.typography * 0.15 +
    score.assets * 0.15 +
    score.hierarchy * 0.1 +
    score.controls * 0.1 +
    score.order * 0.05;
  return Math.round(visual * 0.85 + score.function * 0.15);
}
