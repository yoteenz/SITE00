/**
 * Founder attention hierarchy — presentation adapters.
 */

import type { FounderAttentionLevel } from './types.js';

export function mapPackageStatusToAttention(status: string): FounderAttentionLevel {
  switch (status) {
    case 'AWAITING_FOUNDER_APPROVAL':
    case 'READY_FOR_REVIEW':
    case 'FOUNDER_REVIEW':
      return 'READY_TO_REVIEW';
    case 'GENERATING':
    case 'IN_PRODUCTION':
      return 'DEVELOPING';
    case 'LOCKED':
    case 'PUBLISHED':
      return 'ARCHIVED';
    case 'FAILED':
      return 'NEEDS_YOUR_DECISION';
    default:
      return 'MOVING_WITHOUT_YOU';
  }
}

export function mapGenerationStatusToAttention(status: string): FounderAttentionLevel {
  switch (status) {
    case 'NOT_GENERATED':
      return 'DEVELOPING';
    case 'GENERATING':
      return 'MOVING_WITHOUT_YOU';
    case 'GENERATED':
      return 'READY_TO_REVIEW';
    case 'FAILED':
      return 'NEEDS_YOUR_DECISION';
    default:
      return 'INFORMATIONAL';
  }
}

export function attentionLevelLabel(level: FounderAttentionLevel): string {
  return level.replace(/_/g, ' ');
}

export function attentionRequiresFounder(level: FounderAttentionLevel): boolean {
  return level === 'NEEDS_YOUR_DECISION' || level === 'READY_TO_REVIEW';
}
