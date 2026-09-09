/**
 * PageCompletionIntelligenceEngine — primary orchestrator.
 */

import { detectPageInteractionAffordances } from './affordanceDetector.js';
import { inferChildSurfacesForContracts } from './childSurfaceInference.js';
import {
  discoverExistingRoutes,
  inferRequiredRoutes,
  compareRequiredVsExisting,
} from './routeCompletionEngine.js';
import { buildPageInteractionGraph } from './interactionGraph.js';
import { evaluatePageCompletenessGate, unresolvedVisibleActions } from './completenessGate.js';
import { calculateInteractionCoverage } from './interactionCoverage.js';
import { canRecursePageCompletion, nextVisited } from './recursionGuard.js';
import { findDuplicateChildSurfaces } from './duplicateDetection.js';
import { resolveAuthorityCascade, childCohesionWouldFailGenericFallback } from './authorityCascade.js';
import { resolveDesignPageContractSet, designWorkspaceExistingRoutes } from './designWorkspaceContracts.js';
import type {
  PageCompletionPlan,
  PageCompletionStatus,
  PageExperienceImplementationJob,
  PageExperienceInput,
  PageInteractionContract,
  PageCompletionInspectorState,
} from './types.js';

function deriveCompletionStatus(input: {
  gatePassed: boolean;
  missingRoutes: number;
  missingChildren: number;
  unresolved: number;
  coveragePercent: number;
}): PageCompletionStatus {
  if (input.unresolved > 0) return 'BLOCKED';
  if (input.missingChildren > 0 || input.missingRoutes > 0) return 'CHILD_SURFACES_REQUIRED';
  if (input.coveragePercent < 100) return 'IMPLEMENTING_CHILDREN';
  if (!input.gatePassed) return 'FUNCTIONAL_QA';
  return 'COMPLETE';
}

export function runPageCompletionIntelligence(input: PageExperienceInput): PageExperienceImplementationJob {
  const depth = input.depth ?? 0;
  const visited = input.visitedPageIds ?? [];
  const guard = canRecursePageCompletion(depth, input.pageId, visited);
  if (!guard.allowed) {
    const emptyPlan: PageCompletionPlan = {
      pageId: input.pageId,
      primaryRoute: input.primaryRoute,
      interactionContracts: [],
      requiredChildSurfaces: [],
      requiredRoutes: [],
      requiredStates: [],
      requiredAssets: [],
      requiredDataBindings: [],
      requiredPermissions: ['FOUNDER', 'PROJECT_SCOPE'],
      requiredEmptyStates: ['NO_INTERACTIONS'],
      requiredLoadingStates: ['CAPTURE_PENDING'],
      requiredErrorStates: ['CAPTURE_FAILED'],
      implementationStatus: 'BLOCKED',
      completionStatus: 'BLOCKED',
    };
    return {
      projectId: input.projectId,
      pageId: input.pageId,
      primaryScreenAuthorityId: input.parentAuthorityId ?? null,
      completionPlan: emptyPlan,
      interactionGraph: { pageId: input.pageId, nodes: [], edges: [] },
      childSurfacePlans: [],
      assetJobs: [],
      implementationStatus: 'BLOCKED',
      functionalQaStatus: 'FAIL',
      visualQaStatus: 'NOT_RUN',
      completionGate: {
        passed: false,
        failureCodes: [guard.reason ?? 'PAGE_COMPLETION_RECURSION_LOOP'],
        unresolvedCount: 0,
        orphanCount: 0,
        missingChildCount: 0,
        missingRouteCount: 0,
      },
    };
  }

  const declared =
    input.declaredInteractions ??
    resolveDesignPageContractSet(input.pageId, input.moduleScreenType).map((d) => ({
      ...d,
      affordanceType: d.affordanceType,
      label: d.label,
    }));

  let contracts = detectPageInteractionAffordances({
    pageId: input.pageId,
    declared,
    dom: input.domAffordances,
  });

  const existingRoutes = discoverExistingRoutes([
    ...designWorkspaceExistingRoutes(input.projectId),
    ...(input.existingRoutes ?? []),
  ]);

  const { contracts: resolvedContracts, childSurfaces } = inferChildSurfacesForContracts(contracts, {
    primaryRoute: input.primaryRoute,
    projectId: input.projectId,
    moduleScreenType: input.moduleScreenType,
    parentAuthorityId: input.parentAuthorityId,
    skinId: input.skinId,
    existingRoutes,
  });

  contracts = resolvedContracts.map((c) => {
    if (c.affordanceType === 'TAB' && c.intent === 'TAB_SWITCH') {
      return { ...c, targetType: 'TAB_STATE', status: 'IMPLEMENTED', route: `${input.primaryRoute}?tab=${c.label.toLowerCase()}` };
    }
    if (c.intent === 'PROJECT_SCOPE_SWITCH') {
      return { ...c, targetType: 'POPOVER', status: 'IMPLEMENTED', dataRequirement: 'PROJECT_LIST' };
    }
    if (c.intent === 'TOGGLE_VIEWPORT') {
      return { ...c, targetType: 'TOGGLE_STATE', status: 'IMPLEMENTED' };
    }
    return c;
  });

  const routeCompare = compareRequiredVsExisting(
    inferRequiredRoutes(contracts, childSurfaces),
    existingRoutes,
  );

  for (const child of childSurfaces) {
    if (routeCompare.missing.includes(child.route ?? '')) {
      child.implementationStatus = 'PLANNED';
    }
  }

  const dupes = findDuplicateChildSurfaces(childSurfaces);
  const cascade = resolveAuthorityCascade({
    parentAuthorityId: input.parentAuthorityId,
    skinContinuityRecordId: input.skinId,
  });

  const plan: PageCompletionPlan = {
    pageId: input.pageId,
    primaryRoute: input.primaryRoute,
    interactionContracts: contracts,
    requiredChildSurfaces: childSurfaces,
    requiredRoutes: inferRequiredRoutes(contracts, childSurfaces),
    requiredStates: contracts.filter((c) => c.targetType.includes('STATE')).map((c) => c.interactionId),
    requiredAssets: input.pageId.includes('skins') ? ['BRAND_FAMILY_VISUALS'] : [],
    requiredDataBindings: contracts.filter((c) => c.dataRequirement).map((c) => c.dataRequirement!),
    requiredPermissions: ['FOUNDER', 'PROJECT_SCOPE'],
    requiredEmptyStates: ['NO_PAGES', 'NO_ASSETS'],
    requiredLoadingStates: ['MIRROR_LOADING', 'CAPTURE_PENDING'],
    requiredErrorStates: ['CAPTURE_FAILED'],
    implementationStatus: 'INTERACTION_DISCOVERY',
    completionStatus: 'INTERACTION_DISCOVERY',
  };

  const graph = buildPageInteractionGraph({
    pageId: input.pageId,
    primaryRoute: input.primaryRoute,
    contracts,
    childSurfaces,
  });

  const gate = evaluatePageCompletenessGate({ plan, graph, existingRoutes });
  if (dupes.length) gate.failureCodes.push('PAGE_CHILD_ROUTE_DUPLICATE');
  if (childCohesionWouldFailGenericFallback(cascade)) gate.failureCodes.push('PAGE_CHILD_GENERIC_UI_FALLBACK');

  const coverage = calculateInteractionCoverage(contracts);
  const status = deriveCompletionStatus({
    gatePassed: gate.passed,
    missingRoutes: routeCompare.missing.length,
    missingChildren: childSurfaces.filter((c) => c.implementationStatus !== 'IMPLEMENTED').length,
    unresolved: unresolvedVisibleActions(contracts).length,
    coveragePercent: coverage.coveragePercent,
  });

  plan.implementationStatus = status;
  plan.completionStatus = status;

  const assetJobs =
    input.pageId.includes('skins') || input.pageId.includes('assets')
      ? [`rri-multi-asset-${input.pageId}`]
      : [];

  return {
    projectId: input.projectId,
    pageId: input.pageId,
    primaryScreenAuthorityId: input.parentAuthorityId ?? null,
    completionPlan: plan,
    interactionGraph: graph,
    childSurfacePlans: childSurfaces,
    assetJobs,
    implementationStatus: status,
    functionalQaStatus: gate.passed ? 'PASS' : 'FAIL',
    visualQaStatus: cascade.usedGenericFallback ? 'FAIL' : 'NOT_RUN',
    completionGate: gate,
  };
}

export function runRecursivePageCompletion(input: PageExperienceInput): PageExperienceImplementationJob[] {
  const jobs: PageExperienceImplementationJob[] = [];
  const primary = runPageCompletionIntelligence(input);
  jobs.push(primary);

  const childRoutes = primary.childSurfacePlans.filter((c) => c.route && c.implementationStatus === 'PLANNED');
  for (const child of childRoutes.slice(0, 2)) {
    const childPageId = child.childSurfaceId;
    const childJob = runPageCompletionIntelligence({
      projectId: input.projectId,
      pageId: childPageId,
      primaryRoute: child.route ?? input.primaryRoute,
      parentAuthorityId: input.parentAuthorityId,
      skinId: input.skinId,
      depth: (input.depth ?? 0) + 1,
      visitedPageIds: nextVisited(input.visitedPageIds ?? [], input.pageId),
      declaredInteractions: [{ label: 'BACK', affordanceType: 'BACK', intent: 'RETURN' }],
      existingRoutes: input.existingRoutes,
    });
    jobs.push(childJob);
  }

  return jobs;
}

export function buildPageCompletionInspectorState(job: PageExperienceImplementationJob): PageCompletionInspectorState {
  const coverage = calculateInteractionCoverage(job.completionPlan.interactionContracts);
  return {
    pageId: job.pageId,
    route: job.completionPlan.primaryRoute,
    detectedInteractions: coverage.detected,
    resolvedInteractions: coverage.resolved,
    childSurfaceCount: job.childSurfacePlans.length,
    missingChildCount: job.childSurfacePlans.filter((c) => c.implementationStatus !== 'IMPLEMENTED').length,
    routeCount: job.completionPlan.requiredRoutes.length,
    orphanCount: job.completionGate.orphanCount,
    interactionCoverage: coverage,
    completionStatus: job.implementationStatus,
    assetJobs: job.assetJobs,
    visualQaStatus: job.visualQaStatus,
    ambiguousActions: job.completionPlan.interactionContracts
      .filter((c) => c.status === 'AMBIGUOUS')
      .map((c) => c.label),
  };
}

export function markTabContractsImplemented(contracts: PageInteractionContract[]): PageInteractionContract[] {
  return contracts.map((c) =>
    c.affordanceType === 'TAB' ? { ...c, status: 'IMPLEMENTED' as const } : c,
  );
}
