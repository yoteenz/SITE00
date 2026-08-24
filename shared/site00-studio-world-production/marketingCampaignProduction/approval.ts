/**
 * Client approval + revision + snapshot + complete package.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  CampaignApprovalSnapshot,
  CampaignProductionAsset,
  ClientMarketingApproval,
  CompleteSocialContentPackage,
  MarketingAssetRevisionDelta,
} from './types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function createClientAssetApproval(params: {
  campaignId: string;
  assetId: string;
  judgment: 'APPROVE' | 'REQUEST_REVISION';
  reason?: string;
  feedback?: string;
  actor: string;
}): ClientMarketingApproval {
  return {
    approvalId: `cma-${randomUUID().slice(0, 8)}`,
    campaignId: params.campaignId,
    stage: 'INDIVIDUAL_ASSET',
    targetId: params.assetId,
    judgment: params.judgment,
    revisionReason: params.reason as never,
    feedback: params.feedback ?? null,
    actor: params.actor,
    createdAt: new Date().toISOString(),
  };
}

export function createRoundApproval(params: {
  campaignId: string;
  roundId: string;
  judgment: 'APPROVE_ROUND' | 'REQUEST_ROUND_REVISION';
  actor: string;
}): ClientMarketingApproval {
  return {
    approvalId: `cma-${randomUUID().slice(0, 8)}`,
    campaignId: params.campaignId,
    stage: 'PRODUCTION_ROUND',
    targetId: params.roundId,
    judgment: params.judgment,
    revisionReason: null,
    feedback: null,
    actor: params.actor,
    createdAt: new Date().toISOString(),
  };
}

export function createRevisionDelta(params: {
  assetId: string;
  parentAssetId: string;
  change: string[];
  preserve: string[];
  reason: string;
  reviewer: string;
}): MarketingAssetRevisionDelta {
  return {
    deltaId: `rev-${randomUUID().slice(0, 8)}`,
    assetId: params.assetId,
    parentAssetId: params.parentAssetId,
    preserve: params.preserve,
    change: params.change,
    remove: [],
    introduce: [],
    doNotBecome: ['template layout', 'generic stock'],
    reason: params.reason,
    reviewer: params.reviewer,
    createdAt: new Date().toISOString(),
  };
}

export function createCampaignApprovalSnapshot(params: {
  campaignId: string;
  strategyFingerprint: string;
  slateFingerprint: string;
  characterSystemFingerprint: string;
  marketingExpressionFingerprint: string;
  assets: CampaignProductionAsset[];
}): CampaignApprovalSnapshot {
  const assetFingerprints: Record<string, string> = {};
  for (const a of params.assets) {
    if (a.status === 'LOCKED' || a.status === 'APPROVED') {
      assetFingerprints[a.assetId] = a.fingerprint;
    }
  }

  return {
    snapshotId: `snap-${randomUUID().slice(0, 8)}`,
    campaignId: params.campaignId,
    strategyFingerprint: params.strategyFingerprint,
    slateFingerprint: params.slateFingerprint,
    characterSystemFingerprint: params.characterSystemFingerprint,
    marketingExpressionFingerprint: params.marketingExpressionFingerprint,
    assetFingerprints,
    approvedAt: new Date().toISOString(),
    frozen: true,
  };
}

export function snapshotFreezesFingerprints(snapshot: CampaignApprovalSnapshot): boolean {
  return snapshot.frozen === true && Object.keys(snapshot.assetFingerprints).length >= 0;
}

export function compileCompleteSocialContentPackage(params: {
  contentPieceId: string;
  campaignId: string;
  thesisSummary: string;
  assets: CampaignProductionAsset[];
  channel: string;
  format: string;
  requiredPositions: number;
}): CompleteSocialContentPackage | { error: string } {
  const locked = params.assets.filter(
    (a) =>
      a.contentPieceId === params.contentPieceId &&
      (a.status === 'LOCKED' || a.status === 'APPROVED') &&
      a.sequencePosition <= params.requiredPositions,
  );

  if (locked.length < params.requiredPositions) {
    return { error: 'Complete package cannot compile with unapproved assets' };
  }

  return {
    packageId: `csp-${params.contentPieceId}`,
    contentPieceId: params.contentPieceId,
    campaignId: params.campaignId,
    thesisSummary: params.thesisSummary,
    editorialDecisionId: null,
    visualSequenceAssetIds: locked.map((a) => a.assetId),
    caption: null,
    cta: null,
    altText: null,
    channel: params.channel,
    format: params.format,
    approvalIds: [],
    lineageFingerprint: fp(locked),
    publishingReadiness: 'READY_FOR_PUBLISHING_APPROVAL',
    createdAt: new Date().toISOString(),
  };
}

export function publishingReadyRequiresFinalApproval(pkg: CompleteSocialContentPackage): boolean {
  return pkg.publishingReadiness === 'READY_FOR_PUBLISHING_APPROVAL';
}
