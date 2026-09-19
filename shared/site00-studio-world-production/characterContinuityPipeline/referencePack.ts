/**
 * P0.5E.5 — Character Reference Pack + scoped authority.
 */

import { randomUUID } from 'node:crypto';
import type {
  CharacterReferenceEntry,
  CharacterReferencePack,
  ReferenceAuthorityEvaluation,
  ReferenceAuthorityLevel,
  ReferenceType,
} from './types.js';

export function buildEmptyReferencePack(characterId: string): CharacterReferencePack {
  return {
    packId: randomUUID(),
    characterId,
    references: [],
    readiness: 'NONE',
    approvedReferenceCount: 0,
  };
}

export function buildReferenceEntry(params: {
  characterId: string;
  referenceType: ReferenceType;
  identityStrength: ReferenceAuthorityLevel;
}): CharacterReferenceEntry {
  return {
    id: randomUUID(),
    characterId: params.characterId,
    referenceType: params.referenceType,
    assetId: null,
    approvalState: 'EMPTY',
    identityStrength: params.identityStrength,
    useCases: [],
    doNotUseFor: [],
    source: 'NOT_INGESTED',
    fingerprint: '',
  };
}

export function evaluateReferenceAuthority(reference: CharacterReferenceEntry): ReferenceAuthorityEvaluation {
  const level = reference.identityStrength;
  return {
    evaluationId: randomUUID(),
    referenceId: reference.id,
    authorityLevel: level,
    mayDefineFace: level === 'IDENTITY_HIGH' || level === 'IDENTITY_MEDIUM',
    mayDefineHair: level === 'IDENTITY_HIGH' || level === 'HAIR_ONLY',
    mayDefineWardrobe: level === 'WARDROBE_ONLY' || level === 'IDENTITY_MEDIUM',
    mayDefineExpression: level === 'EXPRESSION_ONLY' || level === 'IDENTITY_HIGH',
    scopeConflict: false,
    conflictReason: null,
  };
}

export function wardrobeReferenceCannotOverrideFace(
  wardrobeEval: ReferenceAuthorityEvaluation,
  faceEval: ReferenceAuthorityEvaluation,
): boolean {
  return !wardrobeEval.mayDefineFace && faceEval.mayDefineFace;
}

export function expressionReferenceCannotOverrideHair(
  expressionEval: ReferenceAuthorityEvaluation,
  hairEval: ReferenceAuthorityEvaluation,
): boolean {
  return !expressionEval.mayDefineHair && hairEval.mayDefineHair;
}

export function evaluateReferencePackReadiness(pack: CharacterReferencePack): CharacterReferencePack {
  const approved = pack.references.filter((r) => r.approvalState === 'APPROVED');
  let readiness: CharacterReferencePack['readiness'] = 'NONE';
  if (approved.length > 0) readiness = 'PARTIAL';
  if (approved.some((r) => r.referenceType.startsWith('MASTER_'))) readiness = 'IMAGE_READY';
  if (approved.some((r) => r.referenceType === 'APPROVED_MOTION_REFERENCE')) readiness = 'VIDEO_READY';
  return { ...pack, approvedReferenceCount: approved.length, readiness };
}
