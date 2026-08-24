/**
 * Visual reconstruction report generation.
 */

import type {
  ConvergenceTrend,
  NormalizedVisualReference,
  ReferenceMatchReadinessEvaluation,
  RenderedReferenceComparison,
  VisualReconstructionMode,
  VisualReconstructionReport,
  VisualReferenceRegion,
  VisualRegionLock,
} from '../types.js';
import type { ResponsiveInferenceEvaluation } from '../types.js';

export function buildVisualReconstructionReport(input: {
  reference: NormalizedVisualReference;
  targetRoute: string;
  viewport: { width: number; height: number; deviceScaleFactor: number };
  mode: VisualReconstructionMode;
  iterations: number;
  regions: VisualReferenceRegion[];
  locks: VisualRegionLock[];
  comparison: RenderedReferenceComparison | null;
  readiness: ReferenceMatchReadinessEvaluation;
  responsiveInference: ResponsiveInferenceEvaluation;
  finalScreenshotPath: string | null;
  heatmapPath: string | null;
  repositoryAssetsReused: string[];
  newComponentsCreated: string[];
  convergenceTrend: ConvergenceTrend;
  manualFounderCorrections: number;
  knownLimitations: string[];
}): VisualReconstructionReport {
  const comparison = input.comparison;
  return {
    reportId: `report-${input.reference.referenceId}-${Date.now()}`,
    reference: input.reference,
    targetRoute: input.targetRoute,
    viewport: input.viewport,
    mode: input.mode,
    iterations: input.iterations,
    regions: input.regions,
    lockedRegions: input.locks,
    unresolvedRegions: input.readiness.unresolvedRegions,
    overallScore: comparison?.structuralSimilarity ?? 0,
    geometryScore: comparison ? 1 - comparison.layoutDifference : 0,
    typographyScore: comparison ? 1 - comparison.textBoundsDifference : 0,
    assetScore: comparison?.regionOverlap ?? 0,
    surfaceScore: comparison ? 1 - comparison.colorDifference : 0,
    knownLimitations: input.knownLimitations,
    responsiveInference: input.responsiveInference,
    finalScreenshotPath: input.finalScreenshotPath,
    heatmapPath: input.heatmapPath,
    repositoryAssetsReused: input.repositoryAssetsReused,
    newComponentsCreated: input.newComponentsCreated,
    convergenceTrend: input.convergenceTrend,
    manualFounderCorrections: input.manualFounderCorrections,
    completedAt: new Date().toISOString(),
  };
}
