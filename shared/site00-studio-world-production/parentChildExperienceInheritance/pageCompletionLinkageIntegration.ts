/**
 * Page completion integration — block completion when child links missing.
 */

import type { PageCompletenessGateResult, PageCompletionPlan } from '../visualReconstruction/pageCompletionIntelligence/types.js';
import type { NavigationLinkageAuditResult } from './navigationLinkage/types.js';

export const PCI_PAGE_LINKAGE_BLOCKERS = [
  'PAGE_CHILD_LINK_MISSING',
  'CHILD_RETURN_PATH_MISSING',
] as const;

export function applyLinkageBlockersToCompletenessGate(input: {
  gate: PageCompletenessGateResult;
  linkageAudit: NavigationLinkageAuditResult;
}): PageCompletenessGateResult {
  const failureCodes = [...input.gate.failureCodes];

  if (input.linkageAudit.deadParentActions.length > 0) {
    failureCodes.push('PAGE_CHILD_LINK_MISSING');
  }
  if (input.linkageAudit.contracts.some((c) => c.errors.includes('CHILD_RETURN_PATH_MISSING'))) {
    failureCodes.push('CHILD_RETURN_PATH_MISSING');
  }
  if (input.linkageAudit.orphanChildren.length > 0) {
    failureCodes.push('PAGE_CHILD_LINK_MISSING');
  }

  const unique = [...new Set(failureCodes)];
  const addedBlocker = unique.some((c) =>
    (PCI_PAGE_LINKAGE_BLOCKERS as readonly string[]).includes(c),
  );
  return {
    ...input.gate,
    passed: input.gate.passed && !addedBlocker,
    failureCodes: unique,
  };
}

export function pageCompletionBlockedByLinkage(plan: PageCompletionPlan, linkage: NavigationLinkageAuditResult): boolean {
  const visibleChildAds = plan.requiredChildSurfaces.length > 0 || plan.interactionContracts.length > 0;
  if (!visibleChildAds) return false;
  return !linkage.passed || linkage.deadParentActions.length > 0;
}
