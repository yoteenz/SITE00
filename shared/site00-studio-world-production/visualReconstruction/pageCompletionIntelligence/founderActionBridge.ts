/**
 * Bridge ambiguous page completion → DesignFounderAction
 */

import type { DesignFounderAction } from '../referenceReconstructionIntelligence/founderAction.js';
import type { PageExperienceImplementationJob, PageInteractionContract } from './types.js';

export function buildPageCompletionFounderActions(job: PageExperienceImplementationJob): DesignFounderAction[] {
  const actions: DesignFounderAction[] = [];
  const ambiguous = job.completionPlan.interactionContracts.filter((c) => c.status === 'AMBIGUOUS');

  for (const contract of ambiguous) {
    actions.push(ambiguousContractToAction(job, contract, 'REVIEW_INTERACTION_AMBIGUITY'));
  }

  const missingChildren = job.childSurfacePlans.filter((c) => c.implementationStatus === 'PLANNED');
  if (missingChildren.length > 0 && ambiguous.length === 0) {
    actions.push({
      actionId: `action-review-child-surface-plan-${job.pageId}`,
      projectId: job.projectId,
      workspace: 'ASSETS',
      jobId: job.pageId,
      actionType: 'REVIEW_CHILD_SURFACE_PLAN',
      title: `${missingChildren.length} CHILD SURFACES REQUIRED`,
      summary: `PAGE ${job.pageId.toUpperCase()} · PLAN CHILD ROUTES BEFORE COMPLETE`,
      priority: 'BLOCKING',
      blocking: true,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      deepLink: `?tab=PAGES&pciAction=child-plan&pageId=${encodeURIComponent(job.pageId)}`,
      context: { missingChildCount: missingChildren.length, pageId: job.pageId },
    });
  }

  const missingRoutes = job.completionGate.missingRouteCount;
  if (missingRoutes > 0) {
    actions.push({
      actionId: `action-review-route-plan-${job.pageId}`,
      projectId: job.projectId,
      workspace: 'PAGES',
      jobId: job.pageId,
      actionType: 'REVIEW_ROUTE_PLAN',
      title: `${missingRoutes} ROUTES REQUIRED`,
      summary: `PAGE ${job.pageId.toUpperCase()} · MISSING CHILD ROUTES`,
      priority: 'HIGH',
      blocking: true,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      deepLink: `?tab=PAGES&pciAction=route-plan&pageId=${encodeURIComponent(job.pageId)}`,
      context: { missingRouteCount: missingRoutes },
    });
  }

  return actions;
}

function ambiguousContractToAction(
  job: PageExperienceImplementationJob,
  contract: PageInteractionContract,
  actionType: 'REVIEW_INTERACTION_AMBIGUITY' | 'REVIEW_CHILD_SURFACE_PLAN',
): DesignFounderAction {
  return {
    actionId: `action-${actionType.toLowerCase()}-${contract.interactionId}`,
    projectId: job.projectId,
    workspace: 'PAGES',
    jobId: job.pageId,
    actionType,
    title: `DESTINATION AMBIGUOUS: ${contract.label}`,
    summary: `${contract.label} · REVIEW CHILD SURFACE PLAN`,
    priority: 'BLOCKING',
    blocking: true,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    deepLink: `?tab=PAGES&pciAction=review-interaction&interactionId=${encodeURIComponent(contract.interactionId)}`,
    context: { interactionId: contract.interactionId, label: contract.label },
  };
}
