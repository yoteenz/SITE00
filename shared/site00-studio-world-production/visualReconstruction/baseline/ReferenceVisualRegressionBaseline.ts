/**
 * Approved reference baseline for future AUDIT mode.
 */

import type {
  ReferenceMatchReadinessEvaluation,
  ReferenceVisualRegressionBaseline,
  VisualRegionLock,
} from '../types.js';

export function createReferenceVisualRegressionBaseline(input: {
  referenceId: string;
  targetRoute: string;
  viewport: { width: number; height: number };
  approvedRenderPath: string;
  regionLocks: VisualRegionLock[];
  readinessSnapshot: ReferenceMatchReadinessEvaluation;
}): ReferenceVisualRegressionBaseline {
  return {
    baselineId: `baseline-${input.referenceId}-${Date.now()}`,
    referenceId: input.referenceId,
    targetRoute: input.targetRoute,
    viewport: input.viewport,
    approvedAt: new Date().toISOString(),
    approvedRenderPath: input.approvedRenderPath,
    regionLocks: input.regionLocks,
    readinessSnapshot: input.readinessSnapshot,
  };
}

export function baselineReadyForAudit(baseline: ReferenceVisualRegressionBaseline): boolean {
  return baseline.readinessSnapshot.ready;
}
