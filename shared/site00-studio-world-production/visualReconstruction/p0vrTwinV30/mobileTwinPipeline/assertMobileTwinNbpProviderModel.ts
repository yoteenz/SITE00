import { resolveFocusedHybridNbpModel } from '../../../../site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';
import { getMobileTwinVisualProviderStrategy } from './getMobileTwinVisualProviderStrategy.js';
import type { MobileTwinPipelineState } from './types.js';

export const MOBILE_TWIN_PROVIDER_LOCK_VIOLATION = 'MOBILE_TWIN_PROVIDER_LOCK_VIOLATION' as const;

/** Final boundary before FAL dispatch — locked Mobile must use NBP edit model only. */
export function assertMobileTwinNbpModelAtDispatch(
  model: string | undefined,
  pipeline: MobileTwinPipelineState | null | undefined,
  leg: 'actual' | 'blueprint',
): string {
  const route = getMobileTwinVisualProviderStrategy(pipeline);
  const nbp = resolveFocusedHybridNbpModel();
  if (!route?.locked) {
    return model?.trim() || nbp;
  }
  const expected = leg === 'actual' ? route.actual.model : route.blueprint.model;
  const resolved = (model?.trim() || expected || nbp).trim();
  if (!resolved.includes('nano-banana')) {
    throw new Error(MOBILE_TWIN_PROVIDER_LOCK_VIOLATION);
  }
  return resolved;
}

export function assertMobileTwinNbpModelAfterJob(
  returnedModel: string,
  pipeline: MobileTwinPipelineState | null | undefined,
): void {
  const route = getMobileTwinVisualProviderStrategy(pipeline);
  if (!route?.locked) return;
  if (!returnedModel.includes('nano-banana')) {
    throw new Error(MOBILE_TWIN_PROVIDER_LOCK_VIOLATION);
  }
}
