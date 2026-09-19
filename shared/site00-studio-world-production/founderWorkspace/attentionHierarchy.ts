/**
 * Map canonical production statuses → founder attention hierarchy.
 */

import type { FounderAttentionLevel } from './types.js';

const PACKAGE_ATTENTION: Record<string, FounderAttentionLevel> = {
  FOUNDER_REVIEW: 'NEEDS_YOUR_DECISION',
  FORMULATED: 'READY_TO_REVIEW',
  GENERATING: 'DEVELOPING',
  DRAFT: 'DEVELOPING',
  APPROVED: 'MOVING_WITHOUT_YOU',
  SCHEDULED: 'MOVING_WITHOUT_YOU',
  PUBLISHED: 'ARCHIVED',
  AWAITING_FOUNDER_APPROVAL: 'NEEDS_YOUR_DECISION',
  READY_FOR_REVIEW: 'READY_TO_REVIEW',
};

const PACKAGE_STATUS_LABEL: Record<string, string> = {
  FOUNDER_REVIEW: 'READY FOR REVIEW',
  FORMULATED: 'IN PRODUCTION',
  GENERATING: 'GENERATING',
  DRAFT: 'DEVELOPING',
  APPROVED: 'LOCKED',
  SCHEDULED: 'READY TO POST',
  PUBLISHED: 'PUBLISHED',
};

const ASSET_ATTENTION: Record<string, FounderAttentionLevel> = {
  LOCKED: 'ARCHIVED',
  GENERATED: 'READY_TO_REVIEW',
  GENERATING: 'DEVELOPING',
  PLANNED: 'DEVELOPING',
  CONTRACTS_READY: 'READY_TO_REVIEW',
  FAILED: 'NEEDS_YOUR_DECISION',
};

const ASSET_STATUS_LABEL: Record<string, string> = {
  LOCKED: 'LOCKED',
  GENERATED: 'READY FOR REVIEW',
  GENERATING: 'GENERATING',
  PLANNED: 'PLANNED',
  CONTRACTS_READY: 'CONTRACTS READY',
  FAILED: 'NEEDS ATTENTION',
};

export function packageAttentionLevel(internalStatus: string): FounderAttentionLevel {
  return PACKAGE_ATTENTION[internalStatus] ?? 'INFORMATIONAL';
}

export function packageStatusLabel(internalStatus: string): string {
  return PACKAGE_STATUS_LABEL[internalStatus] ?? internalStatus.replace(/_/g, ' ');
}

export function assetAttentionLevel(internalStatus: string): FounderAttentionLevel {
  return ASSET_ATTENTION[internalStatus] ?? 'INFORMATIONAL';
}

export function assetStatusLabel(internalStatus: string): string {
  return ASSET_STATUS_LABEL[internalStatus] ?? internalStatus.replace(/_/g, ' ');
}

export function opportunityLeadLine(params: {
  subject: string;
  whyHighPriority?: string[];
  liveLineage?: boolean;
  audienceAsk?: boolean;
}): string {
  if (params.audienceAsk) return 'Audience asked →';
  const why = params.whyHighPriority?.[0];
  if (why?.toLowerCase().includes('callback') || why?.toLowerCase().includes('historical')) {
    return 'Historical callback →';
  }
  if (why?.toLowerCase().includes('pattern') || why?.toLowerCase().includes('forming')) {
    return 'Pattern forming →';
  }
  if (params.liveLineage) return 'Live signal →';
  if (why) return `${why.slice(0, 48)} →`;
  return 'On radar →';
}

/** @deprecated use packageAttentionLevel */
export function mapPackageStatusToAttention(status: string): FounderAttentionLevel {
  return packageAttentionLevel(status);
}

export function mapGenerationStatusToAttention(status: string): FounderAttentionLevel {
  return assetAttentionLevel(status);
}

export function attentionLevelLabel(level: FounderAttentionLevel): string {
  return level.replace(/_/g, ' ');
}

export function attentionRequiresFounder(level: FounderAttentionLevel): boolean {
  return level === 'NEEDS_YOUR_DECISION' || level === 'READY_TO_REVIEW';
}
