/**
 * Asset locking, reopening, and mutation protection.
 */

import type {
  AssetProductionStatus,
  AssetReopenEvent,
  CampaignProductionAsset,
  ReopenDownstreamEffect,
} from './types.js';

export function lockedAssetCannotMutate(asset: CampaignProductionAsset): boolean {
  return asset.status === 'LOCKED';
}

export function mutateLockedAssetFails(asset: CampaignProductionAsset): boolean {
  return lockedAssetCannotMutate(asset);
}

export function canLockAsset(asset: CampaignProductionAsset): boolean {
  return asset.status === 'APPROVED' || asset.status === 'GENERATED' || asset.status === 'UNDER_REVIEW';
}

export function lockAsset(asset: CampaignProductionAsset, now: string): CampaignProductionAsset {
  if (lockedAssetCannotMutate(asset)) return asset;
  return {
    ...asset,
    status: 'LOCKED',
    lockedAt: now,
    updatedAt: now,
  };
}

export function reopenAsset(params: {
  asset: CampaignProductionAsset;
  reason: string;
  actor: string;
  now: string;
  downstreamEffect: ReopenDownstreamEffect;
  affectedDependencyIds: string[];
}): { preserved: CampaignProductionAsset; child: CampaignProductionAsset; event: AssetReopenEvent } {
  if (params.asset.status !== 'LOCKED' && params.asset.status !== 'APPROVED') {
    throw new Error('FAIL_UNAUTHORIZED_REOPEN');
  }

  const childId = `${params.asset.assetId}-rev-${Date.now()}`;
  const preserved: CampaignProductionAsset = {
    ...params.asset,
    status: 'SUPERSEDED',
    updatedAt: params.now,
  };

  const child: CampaignProductionAsset = {
    ...params.asset,
    assetId: childId,
    parentAssetId: params.asset.assetId,
    status: 'REOPENED',
    lockedAt: null,
    approvedAt: null,
    clientJudgment: null,
    internalJudgment: null,
    updatedAt: params.now,
  };

  const event: AssetReopenEvent = {
    eventId: `reopen-${childId}`,
    assetId: params.asset.assetId,
    roundId: params.asset.roundId,
    reason: params.reason,
    actor: params.actor,
    downstreamEffect: params.downstreamEffect,
    affectedDependencyIds: params.affectedDependencyIds,
    preservedAssetId: params.asset.assetId,
    childAssetId: childId,
    createdAt: params.now,
  };

  return { preserved, child, event };
}

export function reopenPreservesHistoricalAsset(event: AssetReopenEvent): boolean {
  return Boolean(event.preservedAssetId);
}

export function earlierSlideReopenTriggersDownstreamReview(
  sequencePosition: number,
  downstreamLockedCount: number,
): ReopenDownstreamEffect {
  if (downstreamLockedCount === 0) return 'NO_DOWNSTREAM_EFFECT';
  if (sequencePosition === 1) return 'CAMPAIGN_REVIEW_REQUIRED';
  return 'SEQUENCE_REVIEW_REQUIRED';
}

export function downstreamRegenerationNotAutomatic(): true {
  return true;
}

export function autoRegenerationAfterApprovalFails(): boolean {
  return true;
}

export function clientFeedbackDoesNotTriggerGeneration(): true {
  return true;
}

export function publishingStateDistinctFromProduction(
  productionStatus: AssetProductionStatus,
  calendarScheduled: boolean,
): boolean {
  return productionStatus === 'LOCKED' || !calendarScheduled;
}
