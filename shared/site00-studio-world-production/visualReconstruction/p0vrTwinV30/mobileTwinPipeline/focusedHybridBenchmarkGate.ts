import { isCapabilityTestFounderReviewReady } from './reconcileMobileTwinPipelineState.js';
import type { MobileTwinPipelineState } from './types.js';

export type FocusedHybridGateReason =
  | 'READY'
  | 'MISSING_MOBILE_MASTER'
  | 'METHOD_A_NOT_LOCKED'
  | 'CAPABILITY_NOT_READY'
  | 'MISSING_CAPABILITY_SNAPSHOT';

export function getFocusedHybridBenchmarkGate(pipeline: MobileTwinPipelineState | null | undefined): {
  canRun: boolean;
  reason: FocusedHybridGateReason;
  hint: string;
} {
  if (!pipeline) {
    return {
      canRun: false,
      reason: 'MISSING_MOBILE_MASTER',
      hint: 'Mobile design reference required.',
    };
  }
  if (pipeline.mobileTwinVisualGenerationStrategy !== 'ATOMIC_SIBLING_FROM_COMPOSITION') {
    return {
      canRun: false,
      reason: 'METHOD_A_NOT_LOCKED',
      hint: 'Tap FLOW A MORE ACCURATE below, or use FOUNDER OVERRIDE in the founder path panel above.',
    };
  }
  if (!pipeline.twinCapabilityTest?.snapshot) {
    return {
      canRun: false,
      reason: 'MISSING_CAPABILITY_SNAPSHOT',
      hint: 'Run MOBILE TWIN CAPABILITY TEST once, or use FOUNDER OVERRIDE to skip.',
    };
  }
  if (!isCapabilityTestFounderReviewReady(pipeline)) {
    return {
      canRun: false,
      reason: 'CAPABILITY_NOT_READY',
      hint: 'Finish capability test (or FOUNDER OVERRIDE). Railway will create GPT2 control pair on first RUN if needed.',
    };
  }
  return {
    canRun: true,
    reason: 'READY',
    hint: 'Keep this tab open — each step ~60–90s on Railway.',
  };
}
