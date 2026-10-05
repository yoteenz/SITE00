/**
 * P0.5E.5 — Character Bible audit.
 */

import { randomUUID } from 'node:crypto';
import type { CharacterBibleAudit, EmbodiedCharacterBible, CharacterReferencePack } from './types.js';

export function auditCharacterBible(params: {
  bible: EmbodiedCharacterBible;
  referencePack: CharacterReferencePack;
  preCastingMode: boolean;
}): CharacterBibleAudit {
  const { bible, referencePack, preCastingMode } = params;
  const characterTruthReady = Boolean(
    bible.characterEssence && bible.psychologicalLogic && bible.contradictions.length >= 1,
  );
  const visualIdentityReady =
    !preCastingMode &&
    bible.visualAuthority === 'APPROVED' &&
    bible.identityAnchors.some((a) => a.anchorClass === 'FACE_GEOMETRY' && a.authority === 'APPROVED');
  const hasApprovedReferences = referencePack.approvedReferenceCount > 0;
  const imageGenerationReady = visualIdentityReady && hasApprovedReferences;
  const videoGenerationReady = imageGenerationReady && referencePack.readiness !== 'NONE';
  const voiceReady = bible.voiceAuthority === 'APPROVED';
  const multiSceneReady = videoGenerationReady && referencePack.readiness === 'MULTI_SCENE_READY';

  const missingCriticalAuthority: string[] = [];
  if (!bible.characterEssence) missingCriticalAuthority.push('characterEssence');
  if (!bible.faceLogic) missingCriticalAuthority.push('faceLogic');
  if (bible.identityAnchors.length === 0) missingCriticalAuthority.push('identityAnchors');
  if (preCastingMode) missingCriticalAuthority.push('visualIdentityCast');

  const blockedReasons: string[] = [];
  if (preCastingMode) blockedReasons.push('PRE_CASTING_MODE');
  if (!bible.founderApproval) blockedReasons.push('BIBLE_NOT_APPROVED');
  if (!visualIdentityReady) blockedReasons.push('VISUAL_IDENTITY_NOT_CAST');

  let status: CharacterBibleAudit['status'] = 'BIBLE_PARTIAL';
  if (preCastingMode && characterTruthReady) status = 'BIBLE_PARTIAL';
  else if (multiSceneReady) status = 'BIBLE_FULL_CONTINUITY_READY';
  else if (videoGenerationReady) status = 'BIBLE_VIDEO_GENERATION_READY';
  else if (imageGenerationReady) status = 'BIBLE_IMAGE_GENERATION_READY';
  else if (visualIdentityReady) status = 'BIBLE_VISUAL_READY';
  else if (characterTruthReady) status = 'BIBLE_CHARACTER_READY';
  else if (blockedReasons.length > 0) status = 'BIBLE_BLOCKED';

  return {
    auditId: randomUUID(),
    bibleId: bible.id,
    status,
    characterTruthReady,
    visualIdentityReady,
    imageGenerationReady,
    videoGenerationReady,
    voiceReady,
    multiSceneContinuityReady: multiSceneReady,
    blockedReasons,
    missingCriticalAuthority,
    conflicts: [],
    unresolvedVariations: bible.allowedVariation.filter((v) => v.includes('UNRESOLVED')),
    referenceGaps: hasApprovedReferences ? [] : ['NO_APPROVED_REFERENCES'],
    providerLimitations: bible.knownLimitations,
    auditedAt: new Date().toISOString(),
  };
}

export function characterTruthSeparateFromVisualReadiness(audit: CharacterBibleAudit): boolean {
  return audit.characterTruthReady && !audit.visualIdentityReady;
}
