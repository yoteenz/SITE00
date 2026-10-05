import { validateSidekickDerivationReference } from './sidekickReferenceBinding.js';
import {
  classifyGenerationRequest,
  validateGenerationReferenceBinding,
  type ValidateOptions,
} from './validateGenerationReferenceBinding.js';
import type { GenerationRequest, PrecheckResult } from './types.js';

export function precheckGenerationDispatch(request: GenerationRequest, options: ValidateOptions): PrecheckResult {
  const classification = classifyGenerationRequest(request, options.resolverContext);
  const sidekick = validateSidekickDerivationReference(classification);
  if (sidekick.status === 'BLOCKED') {
    return {
      classification,
      ...sidekick,
    };
  }
  const binding = validateGenerationReferenceBinding(classification, options);
  return {
    classification,
    ...binding,
  };
}

export type ProviderDispatchFn<T> = (validated: PrecheckResult) => Promise<T>;

/** Provider dispatch wrapper — only runs dispatch when precheck PASS. */
export async function runPrecheckedProviderDispatch<T>(
  request: GenerationRequest,
  options: ValidateOptions,
  dispatch: ProviderDispatchFn<T>,
): Promise<{ precheck: PrecheckResult; result?: T }> {
  const precheck = precheckGenerationDispatch(request, options);
  if (!precheck.dispatchAllowed) {
    return { precheck };
  }
  const result = await dispatch(precheck);
  return { precheck, result };
}
