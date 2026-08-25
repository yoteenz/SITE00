/**
 * Browser-safe character readiness summary (no node:crypto).
 */

import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';

export type CharacterReadinessSummary = {
  characterTruthReady: boolean;
  visualIdentityReady: boolean;
  visualIdentityStatus: string;
  productionReady: boolean;
  productionStatus: string;
  stillProductionReady: boolean;
  motionProductionReady: boolean;
  blockers: string[];
};

export function summarizeCharacterReadiness(
  casting: CharacterVisualCastingState | null | undefined,
): CharacterReadinessSummary {
  const characterTruthReady = Boolean(
    casting?.founderIKnowHerConfirmed &&
      casting.characterTruthLockedForCasting &&
      casting.activeTruthSnapshotId,
  );

  const anchorApproved = casting?.canonicalAnchor?.status === 'APPROVED';
  const locksActive = Boolean(
    casting?.visualAuthoritySnapshot?.identityLock &&
      casting.visualAuthoritySnapshot.wardrobeLock &&
      casting.visualAuthoritySnapshot.environmentLock,
  );
  const referenceActive = Boolean(casting?.activeReferenceAuthority);
  const packApproved = casting?.characterBibleAssetPack?.status === 'APPROVED';

  const visualIdentityReady = anchorApproved && locksActive && referenceActive && packApproved;
  const stillProductionReady = visualIdentityReady && Boolean(casting?.characterReferencePackReady);
  const motionProductionReady = stillProductionReady && Boolean(casting?.continuityTestReady);

  const blockers: string[] = [];
  if (!characterTruthReady) blockers.push('CHARACTER_TRUTH');
  if (!referenceActive) blockers.push('VISUAL_REFERENCE');
  if (!anchorApproved) blockers.push('CANONICAL_ANCHOR');
  if (!packApproved) blockers.push('ANGLE_PACK');
  if (!stillProductionReady) blockers.push('PRODUCTION_STILL');
  if (!motionProductionReady && stillProductionReady) blockers.push('MOTION_CONTINUITY');

  let visualIdentityStatus = 'NOT_STARTED';
  if (casting?.founderReferences.length) visualIdentityStatus = 'IN_DISCOVERY';
  if (referenceActive) visualIdentityStatus = 'REFERENCE_SELECTED';
  if (casting?.canonicalAnchor && !anchorApproved) visualIdentityStatus = 'ANCHOR_PENDING';
  if (anchorApproved && !packApproved) visualIdentityStatus = 'PACK_INCOMPLETE';
  if (visualIdentityReady) visualIdentityStatus = 'READY';

  let productionStatus = 'BLOCKED_CHARACTER_IDENTITY';
  if (visualIdentityReady && !packApproved) productionStatus = 'BLOCKED_REFERENCE_PACK';
  else if (stillProductionReady && !motionProductionReady) productionStatus = 'READY_FOR_STILL_PRODUCTION';
  else if (motionProductionReady) productionStatus = 'READY_FOR_MOTION_PRODUCTION';

  return {
    characterTruthReady,
    visualIdentityReady,
    visualIdentityStatus,
    productionReady: stillProductionReady,
    productionStatus,
    stillProductionReady,
    motionProductionReady,
    blockers,
  };
}
