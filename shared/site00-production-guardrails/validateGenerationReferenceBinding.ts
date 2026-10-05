import { checkReferenceFileHealth } from './referenceFileHealth.js';
import { providerSupportsReferenceInput } from './providerCapability.js';
import { classifyReferenceRequired } from './referenceRequired.js';
import {
  assertProjectFirewall,
  registryHasApprovedReference,
  rejectSupersededWhenCanonicalExists,
  resolveGenerationReference,
  type ReferenceResolverContext,
} from './referenceResolver.js';
import type {
  BlockedReason,
  ClassifiedGenerationRequest,
  GenerationRequest,
  ReferenceBindingValidation,
} from './types.js';

export type ValidateOptions = {
  resolverContext: ReferenceResolverContext;
  /** When true, missing on-disk file blocks even if registry matched. */
  enforceFileHealth?: boolean;
};

function block(
  partial: Omit<ReferenceBindingValidation, 'status' | 'dispatchAllowed' | 'creditsSpent'> & { blockedReason: BlockedReason },
): ReferenceBindingValidation {
  return {
    ...partial,
    status: 'BLOCKED',
    dispatchAllowed: false,
    creditsSpent: 0,
  };
}

function pass(partial: Omit<ReferenceBindingValidation, 'status' | 'dispatchAllowed' | 'creditsSpent'>): ReferenceBindingValidation {
  return {
    ...partial,
    status: 'PASS',
    dispatchAllowed: true,
    blockedReason: null,
    creditsSpent: 0,
  };
}

export function classifyGenerationRequest(
  request: GenerationRequest,
  ctx: ReferenceResolverContext,
): ClassifiedGenerationRequest {
  const hasRegistry = registryHasApprovedReference(request.projectId, ctx.repoRoot);
  const referenceRequired = classifyReferenceRequired(request.generationClass, request.generationIntent, hasRegistry);
  return { ...request, referenceRequired };
}

/** Core binding validation — PASS or BLOCKED with reason. */
export function validateGenerationReferenceBinding(
  request: GenerationRequest,
  options: ValidateOptions,
): ReferenceBindingValidation {
  const ctx = options.resolverContext;
  const classified = classifyGenerationRequest(request, ctx);
  const referenceRequired = classified.referenceRequired;
  const resolved = resolveGenerationReference(ctx, classified);
  const firewall = assertProjectFirewall(classified.projectId, resolved);

  const base = {
    referenceRequired,
    referenceFound: Boolean(resolved),
    referenceAttached: Boolean(classified.referenceInputAttached),
    generationMode: classified.generationMode,
    resolvedReference: resolved,
    referencePath: resolved?.referencePath ?? null,
    referenceAuthorityId: resolved?.referenceAuthorityId ?? null,
    referenceStatus: resolved?.referenceStatus ?? null,
  };

  if (firewall === 'CROSS_PROJECT_REFERENCE_DENIED') {
    return block({ ...base, blockedReason: 'CROSS_PROJECT_REFERENCE_DENIED' });
  }

  if (resolved && rejectSupersededWhenCanonicalExists(ctx, classified, resolved)) {
    return block({ ...base, blockedReason: 'SUPERSEDED_REFERENCE_WHEN_CANONICAL_EXISTS' });
  }

  if (referenceRequired && !resolved) {
    return block({ ...base, blockedReason: 'REFERENCE_MISSING' });
  }

  if (classified.generationMode === 'TEXT_TO_IMAGE_NET_NEW' && referenceRequired) {
    return block({ ...base, blockedReason: 'INVALID_GENERATION_MODE' });
  }

  if (classified.generationMode === 'REFERENCE_GUIDED') {
    if (!resolved) {
      return block({ ...base, blockedReason: 'REFERENCE_RESOLUTION_FAILED' });
    }
    if (!classified.referenceInputAttached) {
      return block({ ...base, blockedReason: 'REFERENCE_BINDING_FAILURE_PREVENTED' });
    }
    if (!providerSupportsReferenceInput(classified.provider, classified.model)) {
      return block({ ...base, blockedReason: 'PROVIDER_REFERENCE_UNSUPPORTED' });
    }
    if (options.enforceFileHealth !== false && resolved.referencePath) {
      const health = checkReferenceFileHealth(resolved.referencePath);
      if (!health.ok) {
        return block({ ...base, blockedReason: 'REFERENCE_FILE_CORRUPT' });
      }
    }
  }

  if (referenceRequired && resolved && classified.generationMode !== 'REFERENCE_GUIDED') {
    return block({ ...base, blockedReason: 'INVALID_GENERATION_MODE' });
  }

  return pass({ ...base, blockedReason: null });
}
