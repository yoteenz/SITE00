import type { ClassifiedGenerationRequest, GenerationClass, ReferenceBindingValidation } from './types.js';

const SIDEKICK_DERIVED: readonly GenerationClass[] = [
  'ENVIRONMENT_PLATE',
  'BOTANICAL',
  'BRAND_LOCKUP',
  'MATERIAL',
  'OBJECT',
  'DECORATIVE',
  'ILLUSTRATION',
  'SPECIAL_PANEL',
  'SPECIAL_CONTROL',
  'SIDEKICK_DERIVED',
];

/** Same-session linked-asset sidekick must reference screen authority when visually derived. */
export function validateSidekickDerivationReference(
  request: ClassifiedGenerationRequest,
): ReferenceBindingValidation {
  const isSidekick = SIDEKICK_DERIVED.includes(request.generationClass);
  const base = {
    referenceRequired: request.referenceRequired,
    referenceFound: false,
    referenceAttached: Boolean(request.referenceInputAttached),
    generationMode: request.generationMode,
    resolvedReference: null,
    referencePath: null,
    referenceAuthorityId: request.referenceAuthorityIdHint ?? null,
    referenceStatus: null,
  };

  if (!isSidekick) {
    return {
      ...base,
      status: 'PASS',
      dispatchAllowed: true,
      blockedReason: null,
      creditsSpent: 0,
    };
  }

  if (request.generationMode !== 'REFERENCE_GUIDED') {
    return {
      ...base,
      status: 'BLOCKED',
      dispatchAllowed: false,
      blockedReason: 'INVALID_GENERATION_MODE',
      creditsSpent: 0,
    };
  }

  if (!request.referenceInputAttached) {
    return {
      ...base,
      status: 'BLOCKED',
      dispatchAllowed: false,
      blockedReason: 'REFERENCE_BINDING_FAILURE_PREVENTED',
      creditsSpent: 0,
    };
  }

  return {
    ...base,
    status: 'PASS',
    dispatchAllowed: true,
    blockedReason: null,
    creditsSpent: 0,
  };
}
