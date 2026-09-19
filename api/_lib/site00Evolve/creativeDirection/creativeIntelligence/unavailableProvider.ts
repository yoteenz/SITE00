/**
 * Unavailable Creative Intelligence provider — truthful state when no LLM credentials exist.
 */

import type {
  CoreDirectionFormationInput,
  CoreDirectionFormationResult,
  CoreDirectionCritiqueResult,
  CreativeIntelligenceProvider,
  FormedCoreDirection,
  ReviseCoreDirectionsInput,
} from './types.js';

const UNAVAILABLE_ERROR = 'CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE';

export function createUnavailableCreativeIntelligenceProvider(): CreativeIntelligenceProvider {
  const capability = {
    providerId: 'unavailable',
    modelId: 'none',
    supportsStructuredOutput: false,
    supportsLongContext: false,
    supportsVision: false,
    supportsToolUse: false,
    maxContext: 0,
    status: 'UNAVAILABLE' as const,
  };

  const reject = async (): Promise<never> => {
    throw new Error(UNAVAILABLE_ERROR);
  };

  return {
    providerId: 'unavailable',
    capability,
    formCoreDirections: reject,
    critiqueCoreDirections: async (_input: CoreDirectionFormationInput, _candidates: FormedCoreDirection[]) =>
      reject() as Promise<CoreDirectionCritiqueResult>,
    reviseCoreDirections: async (_input: ReviseCoreDirectionsInput) => reject() as Promise<CoreDirectionFormationResult>,
  };
}

export function isProviderUnavailableError(error: unknown): boolean {
  return error instanceof Error && error.message === UNAVAILABLE_ERROR;
}
