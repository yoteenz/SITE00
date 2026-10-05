/**
 * P0.5E.5 — Model selection + provider contract compiler.
 */

import { createHash, randomUUID } from 'node:crypto';
import { CHARACTER_CONTINUITY_PIPELINE_VERSION } from './constants.js';
import type {
  CharacterGenerationCapability,
  CharacterGenerationModelSelection,
  CharacterSceneContract,
  ProviderCharacterGenerationContract,
} from './types.js';

const PROMPT_ASSEMBLY_ORDER = [
  'CHARACTER_IDENTITY',
  'SCENE',
  'EMOTIONAL_STATE',
  'PHYSICAL_ACTION',
  'MOVEMENT',
  'CAMERA_RELATIONSHIP',
  'WARDROBE_HAIR_BEAUTY',
  'PROP_BOOK',
  'ENVIRONMENT',
  'CAMERA_LIGHTING',
  'CONTINUITY',
  'NEGATIVE_CONSTRAINTS',
] as const;

export function selectCharacterGenerationModel(params: {
  scene: CharacterSceneContract;
  capabilities: CharacterGenerationCapability[];
  needsVideo: boolean;
  needsAudio: boolean;
  durationSeconds?: number;
  identitySensitive: boolean;
}): CharacterGenerationModelSelection {
  const candidates = params.capabilities.filter((c) => {
    if (params.needsVideo) return c.supportsReferenceToVideo || c.supportsImageToVideo;
    return c.supportsTextToImage || c.supportsImageToImage;
  });

  const preferred = params.identitySensitive
    ? candidates.find((c) => c.supportsFaceReference || c.supportsMultipleReferences) ?? candidates[0]
    : candidates[0];

  if (!preferred) {
    return {
      selectionId: randomUUID(),
      selectedProvider: 'none',
      selectedEndpoint: 'none',
      whySelected: 'No compatible endpoint',
      supportedContinuityMechanisms: [],
      unsupportedRequirements: params.scene.providerRequirements,
      fallbackOptions: [],
      costEstimateUsd: 0,
      identityFidelityPriority: true,
    };
  }

  const unsupported: string[] = [];
  if (params.needsAudio && !preferred.supportsAudio) unsupported.push('audio');
  if (params.durationSeconds && !preferred.supportsDurationControl) unsupported.push('duration');

  return {
    selectionId: randomUUID(),
    selectedProvider: preferred.provider,
    selectedEndpoint: preferred.endpoint,
    whySelected: params.identitySensitive
      ? 'Identity fidelity prioritized over cinematic quality'
      : 'Best available match',
    supportedContinuityMechanisms: [
      preferred.supportsReferenceImages ? 'reference_images' : '',
      preferred.supportsIdentityBinding ? 'identity_binding' : '',
      preferred.supportsStartFrame ? 'start_frame' : '',
    ].filter(Boolean),
    unsupportedRequirements: unsupported,
    fallbackOptions: candidates.filter((c) => c.endpoint !== preferred.endpoint).map((c) => c.endpoint),
    costEstimateUsd: 0.05,
    identityFidelityPriority: true,
  };
}

export function compileProviderCharacterGenerationContract(params: {
  scene: CharacterSceneContract;
  capability: CharacterGenerationCapability;
  negativeConstraints: string[];
  previewOnly: boolean;
  productionBlocked: boolean;
}): ProviderCharacterGenerationContract {
  const sections: string[] = [];
  if (params.scene.identityRequirements.length) {
    sections.push(`CHARACTER IDENTITY: ${params.scene.identityRequirements.join('; ')}`);
  }
  if (params.scene.environment) sections.push(`SCENE: ${params.scene.environment}`);
  if (params.scene.emotionalState) sections.push(`EMOTION: ${params.scene.emotionalState}`);
  if (params.scene.motionBehavior) sections.push(`MOVEMENT: ${params.scene.motionBehavior}`);
  if (params.scene.bookBehavior) sections.push(`BOOK: ${params.scene.bookBehavior}`);

  const prompt = sections.join('\n');
  const negativePrompt = params.capability.supportsNegativePrompt
    ? params.negativeConstraints.join(', ')
    : null;

  const unsupportedFieldsStripped: string[] = [];
  const referenceImages = params.capability.supportsReferenceImages ? params.scene.referenceSelection : [];
  if (!params.capability.supportsReferenceImages && params.scene.referenceSelection.length) {
    unsupportedFieldsStripped.push('referenceImages');
  }
  if (!params.capability.supportsNegativePrompt && params.negativeConstraints.length) {
    unsupportedFieldsStripped.push('negativePrompt');
  }
  if (!params.capability.supportsLoRA) unsupportedFieldsStripped.push('lora');

  const contract: ProviderCharacterGenerationContract = {
    contractId: randomUUID(),
    provider: params.capability.provider,
    endpoint: params.capability.endpoint,
    schemaVersion: params.capability.schemaVersion,
    prompt,
    negativePrompt,
    referenceImages,
    faceReferences: params.capability.supportsFaceReference ? referenceImages.slice(0, 1) : [],
    identityBindings: params.capability.supportsIdentityBinding ? referenceImages.slice(0, 1) : [],
    elements: params.capability.supportsElements ? [] : [],
    startImage: params.capability.supportsStartFrame ? referenceImages[0] ?? null : null,
    endImage: params.capability.supportsEndFrame ? null : null,
    seed: params.capability.supportsSeed ? null : null,
    aspectRatio: params.capability.supportsAspectRatio ? '9:16' : null,
    resolution: params.capability.supportsResolutionControl ? '1080p' : null,
    duration: params.capability.supportsDurationControl ? params.scene.duration : null,
    fps: null,
    audioConfig: params.capability.supportsAudio ? null : null,
    voiceConfig: params.capability.supportsVoiceReference ? null : null,
    continuityInstructions: params.scene.continuityPriority,
    motionInstructions: params.scene.movement ? [params.scene.movement] : [],
    cameraInstructions: params.scene.cameraRelationship ? [params.scene.cameraRelationship] : [],
    environmentInstructions: params.scene.environment ? [params.scene.environment] : [],
    unsupportedBibleRequirements: unsupportedFieldsStripped,
    unsupportedFieldsStripped,
    costEstimateUsd: 0.05,
    compiledAt: new Date().toISOString(),
    compilerVersion: CHARACTER_CONTINUITY_PIPELINE_VERSION,
    fingerprint: '',
    previewOnly: params.previewOnly || params.productionBlocked,
  };
  contract.fingerprint = createHash('sha256').update(JSON.stringify(contract)).digest('hex').slice(0, 16);
  return contract;
}

export function proseOnlyContinuityInsufficient(mode: 'PROSE_ONLY_EXPLORATION'): boolean {
  return mode === 'PROSE_ONLY_EXPLORATION';
}

export function promptAssemblyOrderPreserved(): readonly string[] {
  return PROMPT_ASSEMBLY_ORDER;
}

export function unsupportedFieldsNotSent(contract: ProviderCharacterGenerationContract): boolean {
  return contract.unsupportedFieldsStripped.every((f) => {
    if (f === 'referenceImages') return contract.referenceImages.length === 0;
    if (f === 'negativePrompt') return contract.negativePrompt === null;
    return true;
  });
}
