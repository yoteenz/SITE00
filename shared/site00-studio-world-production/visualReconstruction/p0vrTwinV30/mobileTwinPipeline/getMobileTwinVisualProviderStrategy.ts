import { resolveFocusedHybridNbpModel } from '../../../../site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';
import {
  FOUNDER_MANUAL_PROMOTION_SOURCE,
  type MobileTwinVisualProviderStrategyResolved,
} from './mobileTwinProviderPromotionTypes.js';
import type { MobileTwinPipelineState } from './types.js';

export function getMobileTwinVisualProviderStrategy(
  pipeline: MobileTwinPipelineState | null | undefined,
): MobileTwinVisualProviderStrategyResolved | null {
  if (!pipeline?.mobileTwinProviderLock?.locked) return null;
  const nbp = pipeline.mobileTwinProviderLock.actualModel || resolveFocusedHybridNbpModel();
  return {
    strategy: 'NBP_FULL_PAIR',
    actual: { provider: 'FAL', model: nbp },
    blueprint: { provider: 'FAL', model: pipeline.mobileTwinProviderLock.blueprintModel || nbp },
    source: FOUNDER_MANUAL_PROMOTION_SOURCE,
    locked: true,
    useNbpPageOnlyActualPrompt: true,
    useLightTechnicalBlueprint: true,
  };
}

export function assertLockedMobileProviderAvailable(pipeline: MobileTwinPipelineState): void {
  const route = getMobileTwinVisualProviderStrategy(pipeline);
  if (!route) return;
  const nbp = resolveFocusedHybridNbpModel();
  if (process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL === 'UNAVAILABLE') {
    throw new Error('MOBILE_TWIN_LOCKED_PROVIDER_UNAVAILABLE');
  }
  if (route.actual.model !== nbp && !route.actual.model.includes('nano-banana')) {
    throw new Error('MOBILE_TWIN_LOCKED_PROVIDER_UNAVAILABLE');
  }
}
