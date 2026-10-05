import type { DesignPageAuthorityReviewSession } from '../types.js';
import {
  FOUNDER_CAPABILITY_DECISION_TO_STRATEGY,
  type MobileTwinVisualGenerationStrategy,
} from './mobileTwinVisualStrategy.js';
import type { FounderTwinCapabilityDecision } from './twinCapabilityTestTypes.js';
import { ensureMobileTwinPipelineDefaults } from './mobileTwinPipelinePersistence.js';
import { isCapabilityTestFounderReviewReady, reconcileMobileTwinPipelineState } from './reconcileMobileTwinPipelineState.js';

export function recordFounderTwinCapabilityDecision(
  session: DesignPageAuthorityReviewSession,
  decision: FounderTwinCapabilityDecision,
): DesignPageAuthorityReviewSession {
  if (!decision) throw new Error('FOUNDER_CAPABILITY_DECISION_REQUIRED');
  let pipeline = session.mobileTwinPipeline ?
    ensureMobileTwinPipelineDefaults(reconcileMobileTwinPipelineState(session.mobileTwinPipeline))
  : undefined;
  if (!pipeline?.twinCapabilityTest && pipeline && isCapabilityTestFounderReviewReady(pipeline)) {
    pipeline = reconcileMobileTwinPipelineState(pipeline);
  }
  if (!pipeline?.twinCapabilityTest) throw new Error('MOBILE_TWIN_CAPABILITY_TEST_MISSING');

  const strategy: MobileTwinVisualGenerationStrategy =
    FOUNDER_CAPABILITY_DECISION_TO_STRATEGY[decision] ?? 'UNRESOLVED';

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      mobileTwinVisualGenerationStrategy: strategy,
      twinCapabilityTest: {
        ...pipeline.twinCapabilityTest,
        founderDecision: decision,
        founderSelectedStrategy: strategy,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}
