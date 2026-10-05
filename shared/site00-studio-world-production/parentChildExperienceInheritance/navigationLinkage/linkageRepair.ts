/**
 * Safe auto-repair + LinkageRepairPlan for ambiguous cases.
 */

import type { LinkageRepairPlan, ParentChildLinkageContract } from './types.js';
import { normalizeRouteKey } from './routeManifestReconciliation.js';

export function proposeLinkageRepairs(input: {
  contracts: ParentChildLinkageContract[];
  canonicalRouteMap?: Record<string, string>;
}): LinkageRepairPlan[] {
  const plans: LinkageRepairPlan[] = [];

  for (const contract of input.contracts) {
    if (contract.status === 'WIRED' || contract.status === 'EXEMPT' || contract.status === 'PERMISSION_GATED') {
      continue;
    }

    const staleTarget = findStaleTarget(contract, input.canonicalRouteMap ?? {});
    if (staleTarget) {
      plans.push({
        repairId: `repair-${contract.linkageId}`,
        sourceRoute: contract.sourceParentRoute,
        sourceElement: contract.sourceElementId,
        currentBehavior: contract.resolvedRuntimePath,
        expectedTarget: contract.targetChildRoute,
        proposedTarget: staleTarget,
        confidence: 'HIGH',
        repairType: 'ROUTE_RENAME',
        risk: 'LOW',
        founderReviewRequired: false,
      });
      continue;
    }

    if (contract.errors.includes('HANDLER_MISSING') && contract.confidence === 'HIGH') {
      plans.push({
        repairId: `repair-${contract.linkageId}`,
        sourceRoute: contract.sourceParentRoute,
        sourceElement: contract.sourceElementId,
        currentBehavior: 'NO_HANDLER',
        expectedTarget: contract.targetChildRoute,
        proposedTarget: contract.targetChildRoute,
        confidence: 'HIGH',
        repairType: 'HANDLER_WIRE',
        risk: 'MEDIUM',
        founderReviewRequired: false,
      });
      continue;
    }

    if (contract.status === 'AMBIGUOUS' || contract.confidence === 'LOW') {
      plans.push({
        repairId: `repair-${contract.linkageId}`,
        sourceRoute: contract.sourceParentRoute,
        sourceElement: contract.sourceElementId,
        currentBehavior: contract.resolvedRuntimePath,
        expectedTarget: contract.targetChildRoute,
        proposedTarget: contract.targetChildRoute,
        confidence: 'LOW',
        repairType: 'OTHER',
        risk: 'HIGH',
        founderReviewRequired: true,
      });
    }
  }

  return plans;
}

function findStaleTarget(contract: ParentChildLinkageContract, canonicalMap: Record<string, string>): string | null {
  for (const [oldPath, newPath] of Object.entries(canonicalMap)) {
    if (normalizeRouteKey(contract.resolvedRuntimePath) === normalizeRouteKey(oldPath)) {
      return newPath;
    }
  }
  return null;
}

export function applySafeLinkageRepairs(input: {
  contracts: ParentChildLinkageContract[];
  plans: LinkageRepairPlan[];
}): { contracts: ParentChildLinkageContract[]; applied: LinkageRepairPlan[] } {
  const applied: LinkageRepairPlan[] = [];
  const planByElement = new Map(input.plans.map((p) => [p.sourceElement, p]));

  const contracts = input.contracts.map((contract) => {
    const plan = planByElement.get(contract.sourceElementId);
    if (!plan || plan.founderReviewRequired || plan.confidence !== 'HIGH') return contract;

    applied.push({ ...plan, applied: true });
    return {
      ...contract,
      targetChildRoute: plan.proposedTarget,
      resolvedRuntimePath: plan.proposedTarget,
      status: 'WIRED' as const,
      errors: contract.errors.filter((e) => e !== 'TARGET_MISSING' && e !== 'HANDLER_MISSING'),
    };
  });

  return { contracts, applied };
}
