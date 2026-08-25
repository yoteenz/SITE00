/**
 * P0.5E.4F — Character truth / visual / production readiness evaluation.
 */

import { randomUUID } from 'node:crypto';
import { CHARACTER_BIBLE_ASSET_SLOTS } from '../characterVisualCasting/constants.js';
import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';
import type {
  NDXCharacterTruthReadiness,
  NDXProductionReadiness,
  NDXVisualIdentityReadiness,
  ProductionReadinessStatus,
  VisualIdentityReadinessStatus,
} from './types.js';

export function evaluateNDXCharacterTruthReadiness(
  casting: CharacterVisualCastingState | null | undefined,
): NDXCharacterTruthReadiness {
  const snapshot = casting?.truthSnapshots.find((s) => s.snapshotId === casting.activeTruthSnapshotId) ?? null;
  const blockers: string[] = [];

  if (!casting?.founderIKnowHerConfirmed) blockers.push('FOUNDER_I_KNOW_HER_NOT_CONFIRMED');
  if (!casting?.characterTruthLockedForCasting) blockers.push('CHARACTER_TRUTH_NOT_LOCKED_FOR_CASTING');
  if (!snapshot) blockers.push('NO_ACTIVE_TRUTH_SNAPSHOT');

  return {
    evaluationId: randomUUID(),
    characterId: snapshot?.characterId ?? 'ndx',
    ready: blockers.length === 0,
    blockers,
    truthSnapshotId: snapshot?.snapshotId ?? null,
    founderIKnowHerConfirmed: casting?.founderIKnowHerConfirmed ?? false,
    characterTruthLockedForCasting: casting?.characterTruthLockedForCasting ?? false,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateNDXVisualIdentityReadiness(
  casting: CharacterVisualCastingState | null | undefined,
): NDXVisualIdentityReadiness {
  const deps = {
    founderReferenceAuthorityApproved: Boolean(
      casting?.activeReferenceAuthority && casting.founderReferences.some((r) => r.decomposition),
    ),
    canonicalAnchorApproved: casting?.canonicalAnchor?.status === 'APPROVED' || casting?.characterIsolate?.status === 'APPROVED',
    visualIdentityLockActive: Boolean(casting?.visualAuthoritySnapshot?.identityLock),
    wardrobeLockActive: Boolean(casting?.visualAuthoritySnapshot?.wardrobeLock),
    environmentLockActive: Boolean(casting?.visualAuthoritySnapshot?.environmentLock),
    anglePackComplete: anglePackComplete(casting),
    identityDriftQaPass: anchorDriftQaPass(casting),
    expressionPackComplete: hasAssetSlot(casting, 'SEATED_EDITORIAL_VIEW'),
    cameraPresencePackComplete: hasAssetSlot(casting, 'FRONT_VIEW'),
    bodyAuthorityConfirmed: hasAssetSlot(casting, 'FULL_BODY_VIEW'),
  };

  const required = [
    deps.founderReferenceAuthorityApproved,
    deps.canonicalAnchorApproved,
    deps.visualIdentityLockActive,
    deps.wardrobeLockActive,
    deps.environmentLockActive,
    deps.anglePackComplete,
    deps.identityDriftQaPass,
  ];

  const blockers: string[] = [];
  if (!deps.founderReferenceAuthorityApproved) blockers.push('FOUNDER_REFERENCE_AUTHORITY_NOT_APPROVED');
  if (!deps.canonicalAnchorApproved) blockers.push('CANONICAL_ANCHOR_NOT_APPROVED');
  if (!deps.visualIdentityLockActive) blockers.push('VISUAL_IDENTITY_LOCK_INACTIVE');
  if (!deps.wardrobeLockActive) blockers.push('WARDROBE_LOCK_INACTIVE');
  if (!deps.environmentLockActive) blockers.push('ENVIRONMENT_LOCK_INACTIVE');
  if (!deps.anglePackComplete) blockers.push('ANGLE_PACK_INCOMPLETE');
  if (!deps.identityDriftQaPass) blockers.push('IDENTITY_DRIFT_QA_BLOCKED');

  const status = resolveVisualIdentityStatus(casting, deps, required.every(Boolean));

  return {
    evaluationId: randomUUID(),
    characterId: 'ndx',
    status,
    ready: status === 'READY',
    blockers,
    dependencies: deps,
    evaluatedAt: new Date().toISOString(),
  };
}

function resolveVisualIdentityStatus(
  casting: CharacterVisualCastingState | null | undefined,
  deps: NDXVisualIdentityReadiness['dependencies'],
  allRequired: boolean,
): VisualIdentityReadinessStatus {
  if (allRequired) return 'READY';
  if (!casting || casting.founderReferences.length === 0) return 'NOT_STARTED';
  if (!casting.visualCastingReady) return 'IN_DISCOVERY';
  if (deps.founderReferenceAuthorityApproved && !deps.canonicalAnchorApproved) {
    return casting.canonicalAnchor?.status === 'REVIEW' || casting.canonicalAnchor?.status === 'GENERATING'
      ? 'ANCHOR_PENDING'
      : 'REFERENCE_SELECTED';
  }
  if (deps.canonicalAnchorApproved && !deps.anglePackComplete) return 'PACK_INCOMPLETE';
  if (deps.canonicalAnchorApproved && !deps.identityDriftQaPass) return 'QA_BLOCKED';
  if (deps.canonicalAnchorApproved) return 'ANCHOR_APPROVED';
  return 'REFERENCE_SELECTED';
}

function anglePackComplete(casting: CharacterVisualCastingState | null | undefined): boolean {
  if (!casting?.characterBibleAssetPack || casting.characterBibleAssetPack.status !== 'APPROVED') {
    const requiredAngles = ['FRONT_VIEW', 'LEFT_SIDE_VIEW', 'RIGHT_SIDE_VIEW', 'BACK_VIEW', 'FULL_BODY_VIEW'];
    const packRound = casting?.characterBibleAssetPack?.roundId;
    if (!packRound) return false;
    const slots = casting.candidates
      .filter((c) => c.roundId === packRound)
      .map((c) => c.assetSlot)
      .filter(Boolean);
    return requiredAngles.every((slot) => slots.includes(slot as typeof slots[number]));
  }
  return casting.characterBibleAssetPack.slots.length >= CHARACTER_BIBLE_ASSET_SLOTS.length - 2;
}

function hasAssetSlot(casting: CharacterVisualCastingState | null | undefined, slot: string): boolean {
  return casting?.candidates.some((c) => c.assetSlot === slot && c.previewUrl) ?? false;
}

function anchorDriftQaPass(casting: CharacterVisualCastingState | null | undefined): boolean {
  const anchorEval = casting?.canonicalAnchor?.qaEvaluation;
  if (!anchorEval) return casting?.canonicalAnchor?.status === 'APPROVED';
  return anchorEval.passed || casting?.canonicalAnchor?.status === 'APPROVED';
}

export function evaluateNDXProductionReadiness(params: {
  casting: CharacterVisualCastingState | null | undefined;
  stillContinuityPass?: boolean;
  shortVideoContinuityPass?: boolean;
}): NDXProductionReadiness {
  const visual = evaluateNDXVisualIdentityReadiness(params.casting);
  const referencePackComplete = Boolean(
    params.casting?.characterReferencePackReady && params.casting.characterBibleAssetPack?.status === 'APPROVED',
  );
  const stillPass = params.stillContinuityPass ?? params.casting?.continuityTestReady ?? false;
  const videoPass = params.shortVideoContinuityPass ?? false;

  const blockers: string[] = [];
  if (!visual.ready) blockers.push('NDX_VISUAL_IDENTITY_NOT_READY');
  if (!referencePackComplete) blockers.push('CHARACTER_REFERENCE_PACK_INCOMPLETE');
  if (!stillPass) blockers.push('STILL_CONTINUITY_NOT_PASS');

  let status: ProductionReadinessStatus = 'BLOCKED_CHARACTER_IDENTITY';
  if (visual.ready && !referencePackComplete) status = 'BLOCKED_REFERENCE_PACK';
  else if (visual.ready && referencePackComplete && !stillPass) status = 'BLOCKED_STILL_CONTINUITY';
  else if (visual.ready && referencePackComplete && stillPass && !videoPass) status = 'READY_FOR_STILL_PRODUCTION';
  else if (visual.ready && referencePackComplete && stillPass && videoPass) status = 'READY_FOR_MOTION_PRODUCTION';

  return {
    evaluationId: randomUUID(),
    characterId: 'ndx',
    status,
    readyForStillProduction: status === 'READY_FOR_STILL_PRODUCTION' || status === 'READY_FOR_MOTION_PRODUCTION',
    readyForMotionProduction: status === 'READY_FOR_MOTION_PRODUCTION',
    blockers,
    stillContinuityPass: stillPass,
    shortVideoContinuityPass: videoPass,
    referencePackComplete,
    evaluatedAt: new Date().toISOString(),
  };
}

export function characterTruthDistinctFromVisualReadiness(
  truth: NDXCharacterTruthReadiness,
  visual: NDXVisualIdentityReadiness,
): boolean {
  return truth.ready !== visual.ready;
}

export function visualIdentityDistinctFromProductionReadiness(
  visual: NDXVisualIdentityReadiness,
  production: NDXProductionReadiness,
): boolean {
  return visual.ready !== production.readyForStillProduction;
}
