/**
 * PageCompletenessGate
 */

import type {
  PageCompletenessGateResult,
  PageCompletionPlan,
  PageInteractionContract,
  PageInteractionGraph,
} from './types.js';
import { auditPageInteractionGraph, countGraphOrphans, buildGateResultFromAudit } from './interactionGraphQA.js';
import { compareRequiredVsExisting } from './routeCompletionEngine.js';

export function evaluatePageCompletenessGate(input: {
  plan: PageCompletionPlan;
  graph: PageInteractionGraph;
  existingRoutes: string[];
}): PageCompletenessGateResult {
  const routeCompare = compareRequiredVsExisting(input.plan.requiredRoutes, input.existingRoutes);
  const unresolved = input.plan.interactionContracts.filter(
    (c) => c.status === 'AMBIGUOUS' || c.intent === 'UNRESOLVED',
  ).length;
  const missingChildren = input.plan.requiredChildSurfaces.filter((c) => c.implementationStatus === 'MISSING' || c.implementationStatus === 'PLANNED').length;
  const orphans = countGraphOrphans(input.graph, input.plan.primaryRoute);

  const auditFailures = auditPageInteractionGraph({
    graph: input.graph,
    contracts: input.plan.interactionContracts,
    primaryRoute: input.plan.primaryRoute,
  });

  if (routeCompare.missing.length) auditFailures.push('PAGE_CHILD_ROUTE_MISSING');
  if (missingChildren > 0) auditFailures.push('PAGE_CHILD_SURFACE_MISSING');

  return buildGateResultFromAudit([...new Set(auditFailures)], {
    unresolved,
    orphans,
    missingChildren,
    missingRoutes: routeCompare.missing.length,
  });
}

export function pageMayReportComplete(gate: PageCompletenessGateResult, plan: PageCompletionPlan): boolean {
  if (!gate.passed) return false;
  if (plan.completionStatus !== 'COMPLETE' && plan.completionStatus !== 'VISUAL_QA') return false;
  return gate.unresolvedCount === 0 && gate.missingChildCount === 0;
}

export function unresolvedVisibleActions(contracts: PageInteractionContract[]): PageInteractionContract[] {
  return contracts.filter(
    (c) =>
      c.status !== 'IMPLEMENTED' &&
      c.status !== 'RESOLVED' &&
      c.status !== 'NO_OP_INTENTIONAL' &&
      c.affordanceType !== 'TAB',
  );
}
