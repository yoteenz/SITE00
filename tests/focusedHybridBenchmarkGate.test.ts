import { describe, expect, it } from 'vitest';
import { getFocusedHybridBenchmarkGate } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/focusedHybridBenchmarkGate.js';
import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';

describe('focusedHybridBenchmarkGate', () => {
  it('blocks when Method A not locked', () => {
    const pipeline = { ...emptyMobileTwinPipelineState(), mobileTwinVisualGenerationStrategy: 'UNRESOLVED' as const };
    const gate = getFocusedHybridBenchmarkGate(pipeline);
    expect(gate.canRun).toBe(false);
    expect(gate.reason).toBe('METHOD_A_NOT_LOCKED');
  });

  it('allows founder manual unlock path without renders', () => {
    const pipeline = {
      ...emptyMobileTwinPipelineState(),
      mobileTwinVisualGenerationStrategy: 'ATOMIC_SIBLING_FROM_COMPOSITION' as const,
      founderManualTwinPathUnlock: true,
      twinCapabilityTest: {
        testId: 't1',
        snapshot: {
          compositionStateId: 'c1',
          compositionHash: 'h1',
          referenceAuthorityId: 'r1',
          referenceHash: 'rh',
          featureManifestVersion: 'v1',
          projectContextVersion: 'v1',
          hostProjectContractVersion: 'v1',
        },
        status: 'FOUNDER_REVIEW_READY',
      } as never,
    };
    const gate = getFocusedHybridBenchmarkGate(pipeline);
    expect(gate.canRun).toBe(true);
  });
});
