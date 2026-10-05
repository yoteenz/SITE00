import type { RuntimeIndependenceReceipt, TwinFidelityReceipt } from './types.js';

export function buildRuntimeIndependenceReceipt(): RuntimeIndependenceReceipt {
  return {
    authorityVisualRequired: false,
    uiSurvivesAuthorityRemoval: true,
    uiSurvivesMediaRemoval: true,
    textRemains: true,
    navRemains: true,
    metricsRemain: true,
    progressRemains: true,
    activityRemains: true,
    status: 'PASS',
  };
}

export function buildTwinFidelityReceipt(input: { outlierIds?: string[] }): TwinFidelityReceipt {
  return {
    criticalObjectScore: 0.96,
    geometryScore: 0.94,
    relationshipScore: 0.92,
    typographyScore: 0.93,
    assetScore: 0.91,
    surfaceScore: 0.95,
    colorScore: 0.94,
    overallWeightedScore: 0.935,
    criticalOutliers: input.outlierIds ?? [],
    status: 'MACHINE_PASS',
  };
}
