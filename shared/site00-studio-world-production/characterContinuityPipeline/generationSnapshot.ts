/**
 * P0.5E.5 — Generation snapshot + versioning + invalidation + fallback.
 */

import { randomUUID } from 'node:crypto';
import type {
  CharacterBibleInvalidation,
  CharacterBibleVersion,
  CharacterGenerationSnapshot,
  CharacterProviderFallbackPolicy,
  ProviderCharacterGenerationContract,
} from './types.js';

export function createCharacterGenerationSnapshot(params: {
  characterBibleVersion: string;
  continuityBibleVersion: string;
  sceneContractVersion: string;
  referencePackVersion: string;
  contract: ProviderCharacterGenerationContract;
}): CharacterGenerationSnapshot {
  return {
    snapshotId: randomUUID(),
    characterBibleVersion: params.characterBibleVersion,
    continuityBibleVersion: params.continuityBibleVersion,
    sceneContractVersion: params.sceneContractVersion,
    referencePackVersion: params.referencePackVersion,
    provider: params.contract.provider,
    endpoint: params.contract.endpoint,
    endpointSchemaVersion: params.contract.schemaVersion,
    generationContract: params.contract,
    prompt: params.contract.prompt,
    references: params.contract.referenceImages,
    seed: params.contract.seed,
    costEstimateUsd: params.contract.costEstimateUsd,
    result: null,
    continuityEvaluation: null,
    dispatched: false,
    immutableAfterDispatch: true,
    createdAt: new Date().toISOString(),
  };
}

export function createBibleVersion(params: {
  bibleId: string;
  major: number;
  minor: number;
  changeSummary: string;
  identityChanging: boolean;
  recast: boolean;
}): CharacterBibleVersion {
  return {
    versionId: randomUUID(),
    bibleId: params.bibleId,
    major: params.major,
    minor: params.minor,
    changeSummary: params.changeSummary,
    identityChanging: params.identityChanging,
    recast: params.recast,
    createdAt: new Date().toISOString(),
  };
}

export function evaluateBibleInvalidation(params: {
  fromVersion: CharacterBibleVersion;
  toVersion: CharacterBibleVersion;
}): CharacterBibleInvalidation {
  let outcome: CharacterBibleInvalidation['outcome'] = 'UNAFFECTED';
  if (params.toVersion.recast) outcome = 'IDENTITY_INVALIDATED';
  else if (params.toVersion.identityChanging) outcome = 'FULL_REGENERATION_RECOMMENDED';
  else if (params.toVersion.minor > params.fromVersion.minor) outcome = 'SOFT_REVIEW_REQUIRED';

  return {
    invalidationId: randomUUID(),
    fromVersion: `${params.fromVersion.major}.${params.fromVersion.minor}`,
    toVersion: `${params.toVersion.major}.${params.toVersion.minor}`,
    outcome,
    affectedAssets: [],
    automaticRegeneration: false,
  };
}

export function evaluateProviderFallback(params: {
  preferredEndpoint: string;
  identityRequirementUnmet: boolean;
  hasFallback: boolean;
}): CharacterProviderFallbackPolicy {
  if (params.identityRequirementUnmet && !params.hasFallback) {
    return {
      policyId: randomUUID(),
      preferredEndpoint: params.preferredEndpoint,
      outcome: 'NO_SAFE_FALLBACK',
      identityFidelitySacrificed: false,
      reason: 'Identity fidelity cannot be silently sacrificed',
    };
  }
  if (params.hasFallback) {
    return {
      policyId: randomUUID(),
      preferredEndpoint: params.preferredEndpoint,
      outcome: 'FALLBACK_REQUIRES_FOUNDER_APPROVAL',
      identityFidelitySacrificed: false,
      reason: 'Fallback available but requires founder approval',
    };
  }
  return {
    policyId: randomUUID(),
    preferredEndpoint: params.preferredEndpoint,
    outcome: 'FALLBACK_AVAILABLE',
    identityFidelitySacrificed: false,
    reason: 'Compatible fallback exists',
  };
}

export function minorBibleChangeDoesNotInvalidateIdentity(invalidation: CharacterBibleInvalidation): boolean {
  return invalidation.outcome === 'UNAFFECTED' || invalidation.outcome === 'SOFT_REVIEW_REQUIRED';
}

export function noAutomaticRegeneration(invalidation: CharacterBibleInvalidation): boolean {
  return invalidation.automaticRegeneration === false;
}
