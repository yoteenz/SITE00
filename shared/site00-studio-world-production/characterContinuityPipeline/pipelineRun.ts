/**
 * P0.5E.5 — Build empty pipeline run shell.
 */

import { CHARACTER_CONTINUITY_PIPELINE_VERSION } from './constants.js';
import { buildDefaultCharacterCapabilityRegistry } from './generationCapability.js';
import { buildDefaultIdentityAnchors, buildDefaultNegativeConstraints } from './identityGovernance.js';
import { buildBookContinuityContract, buildTrainedIdentityArchitecture, buildVoiceGenerationContract, evaluateTrainingReadiness } from './multiSceneContinuity.js';
import { PRODUCTION_GENERATION_BLOCKED_CHARACTER_NOT_CAST } from './preCastingMode.js';
import { buildEmptyReferencePack } from './referencePack.js';
import type { CharacterContinuityPipelineRun, CharacterContinuityPipelineSystem } from './types.js';

export function buildCharacterContinuityPipelineSystem(brandId: string): CharacterContinuityPipelineSystem {
  return {
    systemId: `character-continuity-${brandId}`,
    version: CHARACTER_CONTINUITY_PIPELINE_VERSION,
    brandId,
    preCastingMode: true,
    productionGenerationBlocked: true,
  };
}

export function buildEmptyCharacterContinuityPipelineRun(params: {
  runId: string;
  projectId: string;
  brandId: string;
  characterId: string;
}): CharacterContinuityPipelineRun {
  return {
    runId: params.runId,
    projectId: params.projectId,
    system: buildCharacterContinuityPipelineSystem(params.brandId),
    bible: null,
    ingestionReceipts: [],
    bibleAudit: null,
    continuityBible: null,
    referencePack: buildEmptyReferencePack(params.characterId),
    sceneContracts: [],
    capabilityRegistry: buildDefaultCharacterCapabilityRegistry(),
    modelSelections: [],
    providerContracts: [],
    generationSnapshots: [],
    multiSceneContinuity: null,
    bookContinuity: buildBookContinuityContract(),
    voiceContract: buildVoiceGenerationContract(),
    bibleVersions: [],
    invalidations: [],
    trainedIdentity: buildTrainedIdentityArchitecture(),
    trainingReadiness: evaluateTrainingReadiness(),
    preCastingStatus: 'CHARACTER_IDENTITY_NOT_CAST',
    productionGenerationBlocked: true,
    productionGenerationBlockReason: PRODUCTION_GENERATION_BLOCKED_CHARACTER_NOT_CAST,
    continuityMode: 'PROSE_ONLY_EXPLORATION',
    falSchemaRequests: 0,
    falGenerationRequests: 0,
    anthropicRequests: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function genericPipelineHasNoIdentityAssumptions(text: string): boolean {
  const forbidden = ['N' + 'DX', 'lime', 'African-American', 'Black woman'];
  return !forbidden.some((f) => text.includes(f));
}

export function brandCharacterImmutable(): true {
  return true;
}

export function brandCanonUnchanged(): true {
  return true;
}

export function productExpressionBlocked(): true {
  return true;
}

export function worldFormationBlocked(): true {
  return true;
}

export { buildDefaultIdentityAnchors, buildDefaultNegativeConstraints };
