/**
 * P0.5E.5 — Embodied Character Bible builder + empty shell.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { EmbodiedCharacterBible } from './types.js';

export function fingerprintBible(bible: Partial<EmbodiedCharacterBible>): string {
  return createHash('sha256')
    .update(JSON.stringify({ id: bible.id, version: bible.version, characterEssence: bible.characterEssence }))
    .digest('hex')
    .slice(0, 16);
}

export function buildEmptyEmbodiedCharacterBible(params: {
  projectId: string;
  brandId: string;
  characterId: string;
}): EmbodiedCharacterBible {
  const now = new Date().toISOString();
  const bible: EmbodiedCharacterBible = {
    id: randomUUID(),
    projectId: params.projectId,
    brandId: params.brandId,
    characterId: params.characterId,
    version: '0.0.0-precast',
    status: 'BIBLE_NOT_INGESTED',
    identityAuthority: 'NOT_APPROVED',
    continuityAuthority: 'NOT_APPROVED',
    visualAuthority: 'NOT_APPROVED',
    voiceAuthority: 'NOT_APPROVED',
    behaviorAuthority: 'NOT_APPROVED',
    characterEssence: null,
    psychologicalLogic: null,
    worldview: null,
    culturalContext: null,
    intelligenceProfile: null,
    contradictions: [],
    flaws: [],
    humorSystem: null,
    emotionalRange: null,
    voiceSystem: null,
    bookOrArtifactRelationship: null,
    physicalBehavior: null,
    cameraRelationship: null,
    everydayLife: null,
    relationships: null,
    publicPrivateDifference: null,
    visualIdentity: null,
    hairLogic: null,
    skinLogic: null,
    faceLogic: null,
    bodyLogic: null,
    beautyLogic: null,
    wardrobeLogic: null,
    jewelryLogic: null,
    nailLogic: null,
    accessoryLogic: null,
    expressionLogic: null,
    gestureLogic: null,
    movementLogic: null,
    environmentLogic: null,
    propLogic: null,
    lightingLogic: null,
    cameraLogic: null,
    allowedVariation: [],
    prohibitedVariation: [],
    identityAnchors: [],
    recognitionAnchors: [],
    negativeIdentityConstraints: [],
    referencePackIds: [],
    continuityRules: [],
    providerNotes: [],
    knownLimitations: [],
    founderApproval: false,
    fingerprint: '',
    createdAt: now,
    updatedAt: now,
  };
  bible.fingerprint = fingerprintBible(bible);
  return bible;
}

export function isCharacterTruthSeparateFromVisual(bible: EmbodiedCharacterBible): boolean {
  const truthReady = Boolean(bible.characterEssence && bible.psychologicalLogic);
  const visualReady = bible.visualAuthority === 'APPROVED' && bible.faceLogic !== null;
  return truthReady !== visualReady || (!visualReady && truthReady);
}

export const CHARACTER_BIBLE_IS_AUTHORITY = true as const;
