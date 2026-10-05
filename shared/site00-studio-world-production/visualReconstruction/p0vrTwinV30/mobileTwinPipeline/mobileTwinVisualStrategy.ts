export type MobileTwinVisualGenerationStrategy =
  | 'ATOMIC_SIBLING_FROM_COMPOSITION'
  | 'ACTUAL_IMAGE_TO_BLUEPRINT_TRANSFORM'
  | 'UNRESOLVED';

export const FOUNDER_CAPABILITY_DECISION_TO_STRATEGY: Record<
  string,
  MobileTwinVisualGenerationStrategy
> = {
  FLOW_A_MORE_ACCURATE: 'ATOMIC_SIBLING_FROM_COMPOSITION',
  FLOW_B_MORE_ACCURATE: 'ACTUAL_IMAGE_TO_BLUEPRINT_TRANSFORM',
  BOTH_ACCEPTABLE: 'ATOMIC_SIBLING_FROM_COMPOSITION',
  NEITHER_ACCEPTABLE: 'UNRESOLVED',
};

import type { MobileTwinPipelineState } from './types.js';
import { LOCKED_MOBILE_STRATEGY_STATUS } from './mobileTwinProviderPromotionTypes.js';

export function assertFullMobileTwinPackageAllowed(
  strategy: MobileTwinVisualGenerationStrategy | undefined,
  pipeline?: MobileTwinPipelineState | null,
): void {
  if (pipeline?.mobileTwinProviderLock?.locked) {
    if (strategy === 'ATOMIC_SIBLING_FROM_COMPOSITION') return;
    throw new Error('MOBILE_TWIN_VISUAL_STRATEGY_UNRESOLVED');
  }
  if (!strategy || strategy === 'UNRESOLVED') {
    throw new Error('MOBILE_TWIN_VISUAL_STRATEGY_UNRESOLVED');
  }
}

export function canRunFullMobileTwinPackage(
  strategy: MobileTwinVisualGenerationStrategy | undefined,
  pipeline?: MobileTwinPipelineState | null,
): boolean {
  if (pipeline?.mobileTwinProviderLock?.locked && strategy === 'ATOMIC_SIBLING_FROM_COMPOSITION') {
    return true;
  }
  if (pipeline?.mobileTwinRenderStrategy?.status === LOCKED_MOBILE_STRATEGY_STATUS) {
    return strategy === 'ATOMIC_SIBLING_FROM_COMPOSITION';
  }
  return strategy === 'ATOMIC_SIBLING_FROM_COMPOSITION' || strategy === 'ACTUAL_IMAGE_TO_BLUEPRINT_TRANSFORM';
}
