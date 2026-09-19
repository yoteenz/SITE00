/**
 * B5.0R1 — derived content / social package state from canonical blueprint.
 */

import type { Entry002ProductionBlueprint } from '../../../../../shared/site00-expression-engine/types.js';
import {
  buildDerivedContentCardsFromBlueprint,
  buildSocialPackageReadiness,
  type SocialPackageReadiness,
} from './socialPackageReadiness.js';

export type DerivedContentStatus =
  | 'LOCKED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'AWAITING_REVIEW'
  | 'APPROVED'
  | 'REVISION_REQUIRED'
  | 'PENDING';

export type DerivedContentCard = {
  id: string;
  label: string;
  platform: string;
  format: string;
  status: DerivedContentStatus;
  lockedReason?: string;
  nextAction?: string;
  lineageSource?: string;
};

export function buildDerivedContentCards(
  blueprint: Entry002ProductionBlueprint,
  finalReelApproved: boolean,
): DerivedContentCard[] {
  return buildDerivedContentCardsFromBlueprint(blueprint, finalReelApproved);
}

export function resolveSocialPackageReadiness(
  blueprint: Entry002ProductionBlueprint,
  finalReelApproved: boolean,
): SocialPackageReadiness {
  return buildSocialPackageReadiness(blueprint, finalReelApproved);
}

/** @deprecated Use resolveSocialPackageReadiness().packageStatus */
export function resolveSocialPackageStatus(
  cards: DerivedContentCard[],
  finalReelApproved: boolean,
): DerivedContentStatus {
  if (!finalReelApproved) return 'LOCKED';
  if (cards.length > 0 && cards.every((c) => c.status === 'APPROVED')) return 'APPROVED';
  if (cards.some((c) => c.status === 'IN_PROGRESS' || c.status === 'AWAITING_REVIEW')) return 'IN_PROGRESS';
  if (cards.some((c) => c.status === 'READY')) return 'READY';
  return 'PENDING';
}

export function resolveCampaignBoardDerivedStatus(
  readiness: SocialPackageReadiness,
): DerivedContentStatus {
  if (readiness.campaignBoardEligible) return 'READY';
  if (readiness.packageStatus === 'IN_PROGRESS' || readiness.packageStatus === 'INCOMPLETE') return 'PENDING';
  return 'LOCKED';
}
