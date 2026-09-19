/**
 * P0.5E.5 — Character scene contract + compiler.
 */

import { randomUUID } from 'node:crypto';
import type {
  CharacterContinuityBible,
  CharacterReferencePack,
  CharacterSceneContract,
  EmbodiedCharacterBible,
} from './types.js';

export function compileCharacterSceneContract(params: {
  bible: EmbodiedCharacterBible;
  continuityBible: CharacterContinuityBible;
  referencePack: CharacterReferencePack;
  scene: {
    sceneId: string;
    platform: string;
    emotionalState?: string;
    motionBehavior?: string;
    bookBehavior?: string;
    environment?: string;
  };
}): CharacterSceneContract {
  const relevantIdentity = params.continuityBible.categories.IDENTITY.slice(0, 2);
  const relevantFace = params.continuityBible.categories.FACE.slice(0, 1);
  const refs = params.referencePack.references
    .filter((r) => r.approvalState === 'APPROVED')
    .map((r) => r.id)
    .slice(0, 3);

  return {
    contractId: randomUUID(),
    characterBibleId: params.bible.id,
    continuityBibleId: params.continuityBible.continuityBibleId,
    referencePackId: params.referencePack.packId,
    sceneId: params.scene.sceneId,
    platform: params.scene.platform,
    contentEventId: null,
    motionBehavior: params.scene.motionBehavior ?? null,
    bookBehavior: params.scene.bookBehavior ?? null,
    environment: params.scene.environment ?? null,
    emotionalState: params.scene.emotionalState ?? null,
    thoughtState: null,
    spokenState: null,
    cameraRelationship: params.bible.cameraRelationship ? JSON.stringify(params.bible.cameraRelationship) : null,
    wardrobeState: null,
    hairState: null,
    beautyState: null,
    accessoryState: null,
    physicalAction: null,
    gesture: null,
    movement: null,
    propInteraction: null,
    camera: null,
    shotType: null,
    framing: null,
    duration: null,
    lighting: null,
    audioNeeds: params.scene.platform === 'TIKTOK' || params.scene.platform === 'REEL',
    identityRequirements: [...relevantIdentity, ...relevantFace],
    allowedVariation: params.bible.allowedVariation,
    prohibitedVariation: params.bible.prohibitedVariation,
    referenceSelection: refs,
    providerRequirements: ['identity_fidelity'],
    continuityPriority: ['FACE', 'SKIN', 'EXPRESSION'],
    compiledAt: new Date().toISOString(),
  };
}

export function sceneContractSelectsRelevantSectionsOnly(
  contract: CharacterSceneContract,
  fullBible: EmbodiedCharacterBible,
): boolean {
  const fullSize = JSON.stringify(fullBible).length;
  const contractSize = JSON.stringify(contract).length;
  return contractSize < fullSize * 0.5;
}
