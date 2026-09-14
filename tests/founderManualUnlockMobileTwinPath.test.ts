import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { founderManualUnlockMobileTwinPath } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/founderManualUnlockMobileTwinPath.js';
import { isCapabilityTestFounderReviewReady } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/reconcileMobileTwinPipelineState.js';
import { hasFlowABaselineForBenchmark } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/reconcileMobileTwinPipelineState.js';

describe('founderManualUnlockMobileTwinPath', () => {
  it('unlocks strategy and capability gates with zero renders', () => {
    const session = founderManualUnlockMobileTwinPath(
      applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession()),
    );
    const p = session.mobileTwinPipeline!;
    expect(p.founderManualTwinPathUnlock).toBe(true);
    expect(p.mobileTwinVisualGenerationStrategy).toBe('ATOMIC_SIBLING_FROM_COMPOSITION');
    expect(p.twinCapabilityTest?.status).toBe('FOUNDER_REVIEW_READY');
    expect(isCapabilityTestFounderReviewReady(p)).toBe(true);
    expect(hasFlowABaselineForBenchmark(p)).toBe(true);
  });
});
