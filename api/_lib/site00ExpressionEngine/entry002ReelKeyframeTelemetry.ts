/**
 * Sprint B4.2 — REEL keyframe telemetry semantics (planning vs dispatch).
 */

import type { GenerationReceipt } from '../../../shared/site00-expression-engine/types.js';
import type { ReelKeyframeRasterResult } from './entry002ReelKeyframeDispatch.js';

export type ReelKeyframeTelemetrySemantics = {
  compiledPlans: number;
  planningReceipts: number;
  dispatchedGenerations: number;
  successfulRasterResults: number;
  failedGenerations: number;
  /** @deprecated use dispatchedGenerations — COMPILED plans are NOT generation attempts */
  generationAttempts: number;
};

export function isPlanningReceipt(receipt: GenerationReceipt): boolean {
  return receipt.model === 'COMPILED_SPEC' || receipt.provider === 'planning';
}

export function isDispatchedGenerationReceipt(receipt: GenerationReceipt): boolean {
  return (
    receipt.format === 'REEL' &&
    !isPlanningReceipt(receipt) &&
    !receipt.promptLineage.includes('vitest-no-dispatch')
  );
}

export function countPlanningReceipts(receipts: GenerationReceipt[]): number {
  return receipts.filter(isPlanningReceipt).length;
}

export function buildReelKeyframeTelemetrySemantics(
  rasters: ReelKeyframeRasterResult[],
  planningReceiptCount: number,
): ReelKeyframeTelemetrySemantics {
  const successfulRasterResults = rasters.filter((r) => r.actualFileExists && r.providerRequestId).length;
  const failedGenerations = rasters.filter((r) => r.dispatchAttempted && !r.actualFileExists).length;
  const dispatchedGenerations = rasters.filter((r) => r.dispatchAttempted).length;

  return {
    compiledPlans: planningReceiptCount,
    planningReceipts: planningReceiptCount,
    dispatchedGenerations,
    successfulRasterResults,
    failedGenerations,
    generationAttempts: dispatchedGenerations,
  };
}

export function compiledKeyframePlanCount(keyframeCount: number): number {
  return keyframeCount;
}
