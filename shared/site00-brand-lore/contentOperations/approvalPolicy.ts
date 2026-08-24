/**
 * Founder approval policy — ASSISTED_AUTONOMY default.
 */

import type { ContentApprovalPolicy } from './types.js';

export function buildDefaultApprovalPolicy(projectId: string): ContentApprovalPolicy {
  return {
    id: `cap-${projectId}`,
    projectId,
    requiresFounderApproval: true,
    opportunityApproval: 'OPTIONAL',
    slateApproval: 'REQUIRED',
    finalContentApproval: 'REQUIRED',
    publishApproval: 'REQUIRED',
    autonomousPublishingEnabled: false,
  };
}

export function founderApprovalRequiredForPilot(policy: ContentApprovalPolicy): boolean {
  return policy.requiresFounderApproval && !policy.autonomousPublishingEnabled;
}

export function noAutomaticExternalPublishing(): true {
  return true;
}

export function autonomousPublishingEnabled(): false {
  return false;
}
