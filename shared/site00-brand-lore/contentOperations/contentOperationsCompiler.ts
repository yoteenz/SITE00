/**
 * Compile ContentOperationsSystem from upstream authority.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { ContentOperationsSystem } from './types.js';
import { CONTENT_OPERATIONS_V1, DEFAULT_OPERATING_MODE } from './constants.js';
import { buildDefaultEditorialStrategy } from './editorialStrategy.js';
import { buildDefaultApprovalPolicy } from './approvalPolicy.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function contentOperationsRequiresUpstream(params: {
  brandCharacterSystemId: string | null;
  marketingExpressionSystemId: string | null;
}): boolean {
  return Boolean(params.brandCharacterSystemId && params.marketingExpressionSystemId);
}

export function compileContentOperationsSystem(params: {
  projectId?: string;
  brandCharacterSystemId: string;
  marketingExpressionSystemId: string;
}): ContentOperationsSystem {
  const now = new Date().toISOString();
  const strategy = buildDefaultEditorialStrategy(params.projectId ?? 'ndxbook');
  const system: ContentOperationsSystem = {
    id: `cops-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId ?? 'ndxbook',
    brandId: 'ndxbook',
    brandCharacterSystemId: params.brandCharacterSystemId,
    marketingExpressionSystemId: params.marketingExpressionSystemId,
    version: 1,
    status: 'COMPILED',
    operatingMode: DEFAULT_OPERATING_MODE,
    editorialStrategyId: strategy.id,
    opportunityPolicyId: `opp-pol-${params.projectId ?? 'ndxbook'}`,
    approvalPolicyId: buildDefaultApprovalPolicy(params.projectId ?? 'ndxbook').id,
    channelPolicyId: `ch-pol-${params.projectId ?? 'ndxbook'}`,
    performanceLearningPolicyId: `perf-pol-${params.projectId ?? 'ndxbook'}`,
    activeChannels: ['INSTAGRAM_FEED', 'INSTAGRAM_STORY', 'INSTAGRAM_REEL'],
    contentCadenceRules: [
      'Pilot: quality over volume — 3–5 feed, 3–7 stories, 1–2 reels per week unless founder changes',
      'Restraint: not every opportunity becomes content',
    ],
    editorialBalanceRules: strategy.balanceGuidance,
    riskRules: ['High-risk content requires stronger evidence and founder review', 'No autonomous publishing'],
    costRules: ['One approved primary asset path per content item', 'No uncontrolled topic×format×channel multiplication'],
    productionState: { methodologyVersion: CONTENT_OPERATIONS_V1 },
    fingerprint: '',
    createdAt: now,
    updatedAt: now,
  };
  system.fingerprint = fp(system);
  return system;
}

export function assistedAutonomyDefault(mode: ContentOperationsSystem['operatingMode']): boolean {
  return mode === 'ASSISTED_AUTONOMY';
}
