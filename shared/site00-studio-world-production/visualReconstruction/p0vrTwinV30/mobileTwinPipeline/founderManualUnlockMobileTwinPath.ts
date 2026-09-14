import type { DesignPageAuthorityReviewSession } from '../types.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { buildMobileTwinCompositionState } from './buildMobileTwinCompositionState.js';
import { buildTwinCapabilityTestCompositionSnapshot } from './buildTwinCapabilityTestSnapshot.js';
import { ensureMobileTwinPipelineDefaults } from './mobileTwinPipelinePersistence.js';
import type { MobileTwinPipelineState } from './types.js';

/** Founder override when FAL ran but browser never persisted mobile-twin pipeline state. */
export function founderManualUnlockMobileTwinPath(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const withRef = ensureMobileDesignReferenceAuthority(session);
  const pipeline = ensureMobileTwinPipelineDefaults(withRef.mobileTwinPipeline!);
  const ref = pipeline.designReference!;
  const testId = `founder-manual-unlock-${Date.now()}`;
  const composition = buildMobileTwinCompositionState({ runId: testId, reference: ref });
  composition.status = 'FROZEN';
  const snapshot = buildTwinCapabilityTestCompositionSnapshot({ testId, reference: ref, composition });

  const nextPipeline: MobileTwinPipelineState = {
    ...pipeline,
    founderManualTwinPathUnlock: true,
    mobileTwinVisualGenerationStrategy: 'ATOMIC_SIBLING_FROM_COMPOSITION',
    compositionStates: pipeline.compositionStates.some((c) => c.id === composition.id) ?
      pipeline.compositionStates
    : [...pipeline.compositionStates, composition],
    activeCompositionStateId: composition.id,
    twinCapabilityTest: {
      testId,
      snapshot,
      actualControlMode: 'SHARED_CANONICAL_ACTUAL',
      canonicalActualRenderId: pipeline.twinCapabilityTest?.canonicalActualRenderId ?? null,
      flowABlueprintId: pipeline.twinCapabilityTest?.flowABlueprintId ?? null,
      flowBBlueprintId: pipeline.twinCapabilityTest?.flowBBlueprintId ?? null,
      flowAReceiptId: pipeline.twinCapabilityTest?.flowAReceiptId ?? `tfar-${testId}`,
      flowBReceiptId: pipeline.twinCapabilityTest?.flowBReceiptId ?? `tfbr-${testId}`,
      flowAVisualMatchReceiptId: pipeline.twinCapabilityTest?.flowAVisualMatchReceiptId ?? `tvmr-a-${testId}`,
      flowBVisualMatchReceiptId: pipeline.twinCapabilityTest?.flowBVisualMatchReceiptId ?? `tvmr-b-${testId}`,
      status: 'FOUNDER_REVIEW_READY',
      founderDecision: 'FLOW_A_MORE_ACCURATE',
      founderSelectedStrategy: 'ATOMIC_SIBLING_FROM_COMPOSITION',
      idempotencyKey: `capability-test:${ref.id}:${composition.compositionHash}`,
      capabilityTestCostUsd: pipeline.twinCapabilityTest?.capabilityTestCostUsd ?? 0,
      assetJobsDispatched: 0,
      fullPackageFanoutBlocked: true,
    },
  };

  return {
    ...withRef,
    mobileTwinPipeline: nextPipeline,
    updatedAt: new Date().toISOString(),
  };
}

export function isFounderManualTwinPathUnlocked(pipeline: MobileTwinPipelineState | null | undefined): boolean {
  return Boolean(pipeline?.founderManualTwinPathUnlock);
}
