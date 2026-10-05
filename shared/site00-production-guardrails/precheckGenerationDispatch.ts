import { validateCrossFamilyPlateReuse } from './familyEnvironmentDistinctness.js';
import { validateFamilyExpressionBrief } from './familyExpressionBrief.js';
import { validateHierarchicalExpression } from './hierarchicalExpression.js';
import { validatePlateOccupancy } from './plateOccupancy.js';
import { validateFamilyOutputProject } from './familyOutputProjects.js';
import { validateSidekickDerivationReference } from './sidekickReferenceBinding.js';
import {
  classifyGenerationRequest,
  validateGenerationReferenceBinding,
  type ValidateOptions,
} from './validateGenerationReferenceBinding.js';
import type { GenerationRequest, PrecheckResult } from './types.js';

export function precheckGenerationDispatch(request: GenerationRequest, options: ValidateOptions): PrecheckResult {
  const classification = classifyGenerationRequest(request, options.resolverContext);
  const expression = validateFamilyExpressionBrief(classification, options.resolverContext.repoRoot);
  const hierarchy =
    expression.status === 'PASS' ? validateHierarchicalExpression(classification, options.resolverContext.repoRoot) : expression;
  if (hierarchy.status === 'BLOCKED') {
    return {
      classification,
      status: 'BLOCKED',
      dispatchAllowed: false,
      blockedReason: hierarchy.blockedReason,
      referenceRequired: classification.referenceRequired,
      referenceFound: false,
      referenceAttached: Boolean(classification.referenceInputAttached),
      generationMode: classification.generationMode,
      resolvedReference: null,
      referencePath: null,
      referenceAuthorityId: classification.referenceAuthorityIdHint ?? null,
      referenceStatus: null,
      creditsSpent: 0,
    };
  }
  const occupancy = validatePlateOccupancy(classification, options.resolverContext.repoRoot);
  if (occupancy.status === 'BLOCKED') {
    return {
      classification,
      status: 'BLOCKED',
      dispatchAllowed: false,
      blockedReason: occupancy.blockedReason,
      referenceRequired: classification.referenceRequired,
      referenceFound: false,
      referenceAttached: Boolean(classification.referenceInputAttached),
      generationMode: classification.generationMode,
      resolvedReference: null,
      referencePath: null,
      referenceAuthorityId: classification.referenceAuthorityIdHint ?? null,
      referenceStatus: null,
      creditsSpent: 0,
    };
  }
  const plateReuse = validateCrossFamilyPlateReuse(classification);
  if (plateReuse.status === 'BLOCKED') {
    return {
      classification,
      status: 'BLOCKED',
      dispatchAllowed: false,
      blockedReason: plateReuse.blockedReason,
      referenceRequired: classification.referenceRequired,
      referenceFound: false,
      referenceAttached: Boolean(classification.referenceInputAttached),
      generationMode: classification.generationMode,
      resolvedReference: null,
      referencePath: null,
      referenceAuthorityId: classification.referenceAuthorityIdHint ?? null,
      referenceStatus: null,
      creditsSpent: 0,
    };
  }
  if (options.enforceFamilyOutputProject !== false) {
    const folder = validateFamilyOutputProject(classification);
    if (folder.status === 'BLOCKED') {
      return {
        classification,
        status: 'BLOCKED',
        dispatchAllowed: false,
        blockedReason: folder.blockedReason,
        referenceRequired: classification.referenceRequired,
        referenceFound: false,
        referenceAttached: Boolean(classification.referenceInputAttached),
        generationMode: classification.generationMode,
        resolvedReference: null,
        referencePath: null,
        referenceAuthorityId: classification.referenceAuthorityIdHint ?? null,
        referenceStatus: null,
        creditsSpent: 0,
      };
    }
  }
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
