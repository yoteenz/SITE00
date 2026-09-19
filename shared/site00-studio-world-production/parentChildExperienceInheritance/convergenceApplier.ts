/**
 * Safe batch migration applier — produces migration manifest without mutating runtime.
 */

import type {
  ChildConvergencePlan,
  ConvergenceMigrationManifest,
  InheritanceMode,
  MigrationRisk,
} from './types.js';
import { inheritanceModeSkipsTransform } from './inheritanceModes.js';

export type ApplyConvergenceInput = {
  projectId: string;
  parentAuthorityId: string;
  plans: ChildConvergencePlan[];
  dryRun?: boolean;
  maxRisk?: MigrationRisk;
};

const RISK_ORDER: MigrationRisk[] = ['LOW', 'MEDIUM', 'HIGH', 'BLOCKED'];

function riskAllowed(planRisk: MigrationRisk, maxRisk: MigrationRisk): boolean {
  return RISK_ORDER.indexOf(planRisk) <= RISK_ORDER.indexOf(maxRisk);
}

function canApplyPlan(plan: ChildConvergencePlan): { ok: boolean; reason?: string } {
  if (inheritanceModeSkipsTransform(plan.inheritanceMode)) {
    return { ok: false, reason: `SKIPPED_${plan.inheritanceMode}` };
  }
  if (plan.migrationRisk === 'BLOCKED') {
    return { ok: false, reason: 'BLOCKED_RISK' };
  }
  if (plan.functionalMustPreserve.length === 0) {
    return { ok: false, reason: 'NO_FUNCTIONAL_CONTRACT' };
  }
  return { ok: true };
}

export function applyConvergencePlans(input: ApplyConvergenceInput): ConvergenceMigrationManifest {
  const dryRun = input.dryRun ?? true;
  const maxRisk = input.maxRisk ?? 'HIGH';

  const appliedPlanIds: string[] = [];
  const skippedPlanIds: string[] = [];
  const blockedPlanIds: string[] = [];

  for (const plan of input.plans) {
    const gate = canApplyPlan(plan);
    if (!gate.ok) {
      skippedPlanIds.push(plan.planId);
      continue;
    }
    if (!riskAllowed(plan.migrationRisk, maxRisk)) {
      blockedPlanIds.push(plan.planId);
      continue;
    }
    if (!dryRun) {
      appliedPlanIds.push(plan.planId);
    } else {
      appliedPlanIds.push(plan.planId);
    }
  }

  return {
    manifestId: `manifest-${input.projectId}-${Date.now()}`,
    projectId: input.projectId,
    parentAuthorityId: input.parentAuthorityId,
    plans: input.plans,
    appliedPlanIds,
    skippedPlanIds,
    blockedPlanIds,
    dryRun,
    createdAt: new Date().toISOString(),
  };
}

export function summarizeMigrationManifest(manifest: ConvergenceMigrationManifest): {
  total: number;
  applied: number;
  skipped: number;
  blocked: number;
  byMode: Record<InheritanceMode, number>;
} {
  const byMode = {} as Record<InheritanceMode, number>;
  for (const plan of manifest.plans) {
    byMode[plan.inheritanceMode] = (byMode[plan.inheritanceMode] ?? 0) + 1;
  }
  return {
    total: manifest.plans.length,
    applied: manifest.appliedPlanIds.length,
    skipped: manifest.skippedPlanIds.length,
    blocked: manifest.blockedPlanIds.length,
    byMode,
  };
}
