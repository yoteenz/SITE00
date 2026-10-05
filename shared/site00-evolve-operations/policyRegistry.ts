/**
 * EvolveOperationsPolicyRegistry — configurable thresholds by plan / tier / mode.
 */

import type { EvolveDeliveryMode, EvolveOperationsPolicy, EvolveServicePackageId } from './types.js';

const DEFAULT_POLICY: EvolveOperationsPolicy = {
  id: 'default',
  planId: '*',
  deliveryMode: '*',
  spendWarningPercent: 70,
  spendCriticalPercent: 85,
  hardBlockAtPercent: 100,
  allowTopUp: true,
  maxAutomatedRetries: 1,
  maxPaidRegenerationWithoutApproval: 0,
  stallThresholdDays: 5,
  clientApprovalNudgeCooldownHours: 24,
  escalationCeiling: 'LEVEL_2_SUPPORT_QUEUE',
  serviceTierPriorityBoost: 0,
  internalBudgetSoftLimitCents: null,
  internalBudgetHardLimitCents: null,
  marginWatchThresholdPercent: 25,
  providerIncidentMinJobs: 25,
};

const POLICIES: EvolveOperationsPolicy[] = [
  DEFAULT_POLICY,
  {
    id: 'evolve-solo-self-directed',
    planId: 'EVOLVE_SOLO',
    deliveryMode: 'SELF_DIRECTED',
    spendWarningPercent: 70,
    spendCriticalPercent: 90,
    hardBlockAtPercent: 100,
    allowTopUp: true,
    maxAutomatedRetries: 1,
    maxPaidRegenerationWithoutApproval: 0,
    stallThresholdDays: 7,
    clientApprovalNudgeCooldownHours: 48,
    escalationCeiling: 'LEVEL_1_USER_ACTION',
    serviceTierPriorityBoost: 0,
    internalBudgetSoftLimitCents: null,
    internalBudgetHardLimitCents: null,
    marginWatchThresholdPercent: 25,
    providerIncidentMinJobs: 25,
  },
  {
    id: 'evolve-studio-self-directed',
    planId: 'EVOLVE_STUDIO',
    deliveryMode: 'SELF_DIRECTED',
    spendWarningPercent: 70,
    spendCriticalPercent: 85,
    hardBlockAtPercent: 100,
    allowTopUp: true,
    maxAutomatedRetries: 1,
    maxPaidRegenerationWithoutApproval: 0,
    stallThresholdDays: 6,
    clientApprovalNudgeCooldownHours: 36,
    escalationCeiling: 'LEVEL_2_SUPPORT_QUEUE',
    serviceTierPriorityBoost: 5,
    internalBudgetSoftLimitCents: null,
    internalBudgetHardLimitCents: null,
    marginWatchThresholdPercent: 25,
    providerIncidentMinJobs: 25,
  },
  {
    id: 'marketing-retainer-directed',
    planId: 'MARKETING_RETAINER',
    deliveryMode: 'SITE00_DIRECTED',
    spendWarningPercent: 80,
    spendCriticalPercent: 90,
    hardBlockAtPercent: 100,
    allowTopUp: false,
    maxAutomatedRetries: 1,
    maxPaidRegenerationWithoutApproval: 0,
    stallThresholdDays: 5,
    clientApprovalNudgeCooldownHours: 24,
    escalationCeiling: 'LEVEL_3_SPECIALIST',
    serviceTierPriorityBoost: 20,
    internalBudgetSoftLimitCents: 150_000,
    internalBudgetHardLimitCents: 250_000,
    marginWatchThresholdPercent: 30,
    providerIncidentMinJobs: 20,
  },
  {
    id: 'directed-build',
    planId: 'DIRECTED_BUILD',
    deliveryMode: 'SITE00_DIRECTED',
    spendWarningPercent: 75,
    spendCriticalPercent: 90,
    hardBlockAtPercent: 100,
    allowTopUp: false,
    maxAutomatedRetries: 1,
    maxPaidRegenerationWithoutApproval: 0,
    stallThresholdDays: 3,
    clientApprovalNudgeCooldownHours: 24,
    escalationCeiling: 'LEVEL_3_SPECIALIST',
    serviceTierPriorityBoost: 25,
    internalBudgetSoftLimitCents: 200_000,
    internalBudgetHardLimitCents: 350_000,
    marginWatchThresholdPercent: 28,
    providerIncidentMinJobs: 20,
  },
  {
    id: 'growth-partner',
    planId: 'GROWTH_PARTNER',
    deliveryMode: 'SITE00_DIRECTED',
    spendWarningPercent: 85,
    spendCriticalPercent: 95,
    hardBlockAtPercent: 100,
    allowTopUp: false,
    maxAutomatedRetries: 1,
    maxPaidRegenerationWithoutApproval: 0,
    stallThresholdDays: 2,
    clientApprovalNudgeCooldownHours: 12,
    escalationCeiling: 'LEVEL_4_FOUNDER',
    serviceTierPriorityBoost: 40,
    internalBudgetSoftLimitCents: 500_000,
    internalBudgetHardLimitCents: 800_000,
    marginWatchThresholdPercent: 35,
    providerIncidentMinJobs: 15,
  },
  {
    id: 'discovery-sprint',
    planId: 'DISCOVERY_SPRINT',
    deliveryMode: 'SITE00_DIRECTED',
    spendWarningPercent: 90,
    spendCriticalPercent: 95,
    hardBlockAtPercent: 100,
    allowTopUp: false,
    maxAutomatedRetries: 1,
    maxPaidRegenerationWithoutApproval: 0,
    stallThresholdDays: 3,
    clientApprovalNudgeCooldownHours: 24,
    escalationCeiling: 'LEVEL_2_SUPPORT_QUEUE',
    serviceTierPriorityBoost: 10,
    internalBudgetSoftLimitCents: 75_000,
    internalBudgetHardLimitCents: 100_000,
    marginWatchThresholdPercent: 20,
    providerIncidentMinJobs: 25,
  },
  {
    id: 'agency-enterprise',
    planId: 'AGENCY_ENTERPRISE',
    deliveryMode: 'SITE00_DIRECTED',
    spendWarningPercent: 85,
    spendCriticalPercent: 95,
    hardBlockAtPercent: 100,
    allowTopUp: false,
    maxAutomatedRetries: 1,
    maxPaidRegenerationWithoutApproval: 0,
    stallThresholdDays: 2,
    clientApprovalNudgeCooldownHours: 8,
    escalationCeiling: 'LEVEL_4_FOUNDER',
    serviceTierPriorityBoost: 50,
    internalBudgetSoftLimitCents: 1_000_000,
    internalBudgetHardLimitCents: 1_500_000,
    marginWatchThresholdPercent: 40,
    providerIncidentMinJobs: 15,
  },
];

export function resolveEvolveOperationsPolicy(
  servicePackage: EvolveServicePackageId,
  deliveryMode: EvolveDeliveryMode,
): EvolveOperationsPolicy {
  const exact = POLICIES.find((p) => p.planId === servicePackage && p.deliveryMode === deliveryMode);
  if (exact) return exact;
  const byPlan = POLICIES.find((p) => p.planId === servicePackage && p.deliveryMode === '*');
  if (byPlan) return byPlan;
  const byMode = POLICIES.find((p) => p.planId === '*' && p.deliveryMode === deliveryMode);
  if (byMode) return byMode;
  return DEFAULT_POLICY;
}

export function listEvolveOperationsPolicies(): EvolveOperationsPolicy[] {
  return [...POLICIES];
}

export function getPolicyRegistrySnapshot(): { defaultPolicyId: string; policyCount: number } {
  return { defaultPolicyId: DEFAULT_POLICY.id, policyCount: POLICIES.length };
}
