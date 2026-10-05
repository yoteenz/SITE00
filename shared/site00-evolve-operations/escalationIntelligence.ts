/**
 * EscalationIntelligence — L0–L4 levels with service-tier priority.
 */

import { resolveEvolveOperationsPolicy } from './policyRegistry.js';
import type {
  EvolveAssignee,
  EvolveEscalation,
  EvolveEscalationLevel,
  EvolveFailureClassification,
  EvolveOperationalPriority,
  EvolveProjectHealthResult,
  EvolveProjectOpsInput,
  EvolveRetryGuardResult,
} from './types.js';

function levelRank(level: EvolveEscalationLevel): number {
  const map: Record<EvolveEscalationLevel, number> = {
    LEVEL_0_SELF_HEAL: 0,
    LEVEL_1_USER_ACTION: 1,
    LEVEL_2_SUPPORT_QUEUE: 2,
    LEVEL_3_SPECIALIST: 3,
    LEVEL_4_FOUNDER: 4,
  };
  return map[level];
}

function assigneeForLevel(level: EvolveEscalationLevel): EvolveAssignee {
  switch (level) {
    case 'LEVEL_0_SELF_HEAL':
      return 'SYSTEM';
    case 'LEVEL_1_USER_ACTION':
      return 'CLIENT';
    case 'LEVEL_2_SUPPORT_QUEUE':
      return 'SITE00_SUPPORT';
    case 'LEVEL_3_SPECIALIST':
      return 'CREATIVE_SPECIALIST';
    case 'LEVEL_4_FOUNDER':
      return 'FOUNDER';
  }
}

export function deriveEscalationLevel(
  input: EvolveProjectOpsInput,
  health: EvolveProjectHealthResult,
  priority: EvolveOperationalPriority,
  retryResult: EvolveRetryGuardResult | null,
  classification: EvolveFailureClassification | null,
): EvolveEscalationLevel {
  const policy = resolveEvolveOperationsPolicy(input.servicePackage, input.deliveryMode);
  let level: EvolveEscalationLevel = 'LEVEL_0_SELF_HEAL';

  if (retryResult?.action === 'AUTO_RETRY') return 'LEVEL_0_SELF_HEAL';
  if (retryResult?.action === 'RETURN_TO_INPUT') return 'LEVEL_1_USER_ACTION';
  if (retryResult?.action === 'OFFER_TOP_UP') return 'LEVEL_1_USER_ACTION';

  if (health.health === 'WAITING_ON_CLIENT') level = 'LEVEL_1_USER_ACTION';
  if (health.health === 'WAITING_ON_SITE00') level = 'LEVEL_2_SUPPORT_QUEUE';
  if (health.health === 'SYSTEM_BLOCKED') level = 'LEVEL_2_SUPPORT_QUEUE';
  if (health.health === 'STALLED') level = 'LEVEL_2_SUPPORT_QUEUE';
  if (health.health === 'AT_RISK') level = 'LEVEL_3_SPECIALIST';

  if (classification?.escalate && levelRank(level) < 2) level = 'LEVEL_2_SUPPORT_QUEUE';
  if (input.repeatedFailureCount >= 3) level = 'LEVEL_3_SPECIALIST';

  if (priority.founderInterventionRequired && priority.score >= 60) {
    level = 'LEVEL_4_FOUNDER';
  }

  if (input.servicePackage === 'GROWTH_PARTNER' && priority.score >= 70) {
    level = 'LEVEL_4_FOUNDER';
  }

  if (levelRank(level) > levelRank(policy.escalationCeiling)) {
    level = policy.escalationCeiling;
  }

  return level;
}

export function buildEscalation(
  input: EvolveProjectOpsInput,
  level: EvolveEscalationLevel,
  priority: EvolveOperationalPriority,
  id = `esc-${input.projectId}`,
): EvolveEscalation | null {
  if (level === 'LEVEL_0_SELF_HEAL') return null;

  return {
    id,
    level,
    reasons: priority.reasons,
    assignee: assigneeForLevel(level),
    priorityScore: priority.score,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
}
