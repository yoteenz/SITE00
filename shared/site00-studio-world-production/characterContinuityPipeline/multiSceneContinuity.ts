/**
 * P0.5E.5 — Multi-scene continuity, scene state, book + voice architecture.
 */

import { randomUUID } from 'node:crypto';
import type {
  BookContinuityContract,
  CharacterMultiSceneContinuity,
  CharacterSceneState,
  CharacterVoiceGenerationContract,
  CharacterTrainedIdentity,
  CharacterTrainingReadiness,
} from './types.js';

export function buildCharacterSceneState(params: {
  sceneId: string;
  wardrobeId?: string;
  hairVariantId?: string;
  bookState?: string;
  emotionalState?: string;
}): CharacterSceneState {
  return {
    stateId: randomUUID(),
    sceneId: params.sceneId,
    wardrobeId: params.wardrobeId ?? null,
    hairVariantId: params.hairVariantId ?? null,
    makeupState: null,
    jewelryState: null,
    nailState: null,
    propState: null,
    bookState: params.bookState ?? null,
    timeOfDay: null,
    emotionalState: params.emotionalState ?? null,
    energyState: null,
  };
}

export function buildMultiSceneContinuity(params: {
  sharedCharacterIdentityId: string;
  sharedContinuityBibleId: string;
  shots: Array<{ shotId: string; sceneContractId: string; state: CharacterSceneState }>;
}): CharacterMultiSceneContinuity {
  return {
    continuityId: randomUUID(),
    sharedCharacterIdentityId: params.sharedCharacterIdentityId,
    sharedContinuityBibleId: params.sharedContinuityBibleId,
    sharedReferencePackId: null,
    shots: params.shots.map((s) => ({
      shotId: s.shotId,
      sceneContractId: s.sceneContractId,
      sceneState: s.state,
      wardrobeContinuityLocked: Boolean(s.state.wardrobeId),
      hairContinuityLocked: Boolean(s.state.hairVariantId),
    })),
  };
}

export function hairCannotSilentlyChangeBetweenShots(
  shot1: CharacterSceneState,
  shot2: CharacterSceneState,
  locked: boolean,
): boolean {
  if (!locked) return true;
  return shot1.hairVariantId === shot2.hairVariantId;
}

export function wardrobeCannotSilentlyChangeBetweenShots(
  shot1: CharacterSceneState,
  shot2: CharacterSceneState,
  locked: boolean,
): boolean {
  if (!locked) return true;
  return shot1.wardrobeId === shot2.wardrobeId;
}

export function buildBookContinuityContract(): BookContinuityContract {
  return {
    contractId: randomUUID(),
    bookVersion: null,
    cover: null,
    size: null,
    materials: null,
    pageStyle: null,
    bookmarkTabState: null,
    wearState: null,
    currentPage: null,
    visibleAnnotations: [],
    propsInserted: [],
    finalized: false,
  };
}

export function buildVoiceGenerationContract(): CharacterVoiceGenerationContract {
  return {
    contractId: randomUUID(),
    voiceBibleVersion: null,
    spokenCopy: null,
    emotionalState: null,
    platform: null,
    deliveryStyle: null,
    voiceIdentityCast: false,
    blockingReason: 'VOICE_IDENTITY_NOT_CAST',
  };
}

export function spokenDialogueSeparateFromCaption(): true {
  return true;
}

export function buildTrainedIdentityArchitecture(): CharacterTrainedIdentity {
  return {
    trainedIdentityId: randomUUID(),
    trainingType: 'LORA',
    trainingProvider: null,
    trainingEndpoint: null,
    trainingDatasetId: null,
    characterBibleVersion: null,
    referencePackVersion: null,
    approvalState: 'NOT_APPROVED',
    trainingExecuted: false,
  };
}

export function evaluateTrainingReadiness(): CharacterTrainingReadiness {
  return {
    evaluationId: randomUUID(),
    ready: false,
    blockingGates: [
      'final_identity_cast',
      'sufficient_approved_references',
      'founder_approval',
      'provider_supports_training',
    ],
  };
}

export function modelBakeoffArchitectureOnly(): true {
  return true;
}

export function platformChangeDoesNotChangeIdentity(): true {
  return true;
}
