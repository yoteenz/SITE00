/**
 * P0.VR.DIAG.1 / P0.VR.DIAG.1R1 — Before/after drift convergence scoring.
 */

import type { AuthorityRelativeForensicsReport, RegionConvergenceResult, VisualConvergenceScore } from './types.js';

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

function regionScore(report: AuthorityRelativeForensicsReport, regionId: string): number {
  const bundle = report.regionForensics.find((b) => b.regionId === regionId);
  if (!bundle) return 0;
  if (bundle.dimensions.length === 0 && bundle.status === 'AMBIGUOUS') return 40;
  const driftDims = bundle.dimensions.filter((d) => d.delta && !d.delta.includes('MISSING') && d.delta !== '0px');
  const penalty = driftDims.length * 12;
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function computeRegionConvergenceResults(input: {
  before: AuthorityRelativeForensicsReport;
  after: AuthorityRelativeForensicsReport;
}): RegionConvergenceResult[] {
  const regionIds = new Set([
    ...input.before.regionForensics.map((b) => b.regionId),
    ...input.after.regionForensics.map((b) => b.regionId),
  ]);

  return [...regionIds].map((regionId) => {
    const beforeBundle = input.before.regionForensics.find((b) => b.regionId === regionId);
    const afterBundle = input.after.regionForensics.find((b) => b.regionId === regionId);
    const beforeScore = regionScore(input.before, regionId);
    const afterScore = regionScore(input.after, regionId);
    const improvement = afterScore - beforeScore;
    const improvementPct = beforeScore > 0 ? Math.round((improvement / beforeScore) * 100) : afterScore > 0 ? 100 : 0;
    const remaining = afterBundle?.dimensions.filter((d) => d.delta && d.delta !== '0px').map((d) => `${d.dimension}: ${d.delta}`) ?? [];

    let status: RegionConvergenceResult['status'] = 'UNCHANGED';
    if (!beforeBundle || !afterBundle) status = 'UNANALYZED';
    else if (improvement > 5) status = 'IMPROVED';
    else if (improvement < -5) status = 'REGRESSED';

    return {
      regionId,
      regionName: afterBundle?.regionName ?? beforeBundle?.regionName ?? regionId,
      beforeScore,
      afterScore,
      improvement,
      improvementPct,
      remainingIssues: remaining.slice(0, 4),
      status,
    };
  });
}
