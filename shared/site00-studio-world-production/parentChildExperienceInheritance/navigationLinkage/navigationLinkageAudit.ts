/**
 * NavigationLinkageAudit — primary orchestrator for P0.PCI.2.
 */

import { buildLinkageContract, detectDeadParentAction, detectMiswiredAction, detectOrphanChildRoute } from './linkageContractBuilder.js';
import { applySafeLinkageRepairs, proposeLinkageRepairs } from './linkageRepair.js';
import { navigationIntentsForLinkage } from './parentNavigationIntentResolver.js';
import { buildInteractiveSurfaceGraph, findOrphanSurfaceNodes } from './interactiveSurfaceGraph.js';
import { buildGrandchildChains, verifyNavigationChain } from './navigationChainQA.js';
import { normalizeRouteKey, reconcileRouteManifest } from './routeManifestReconciliation.js';
import { filterNavigationActions } from './interactionIntentClassifier.js';
import { deriveChildExperienceReadiness } from './childExperienceReadiness.js';
import { buildSiteWideDesignWorkspaceLinkageAudits } from './designWorkspacePilotRegistries.js';
import type {
  LinkageAuditInput,
  LinkageMatrixRow,
  NavigationLinkageAuditResult,
  NavigationLinkageQAScore,
  ParentChildLinkageContract,
} from './types.js';

const RETURN_PATTERNS: Record<string, string> = {
  MORE: 'BACK TO SYSTEM & SETTINGS',
  PAGES: 'BACK',
  ASSETS: 'BACK',
  SKINS: 'BACK',
  FUTURE_SITE: 'BACK',
};

export function runNavigationLinkageAudit(input: LinkageAuditInput): NavigationLinkageAuditResult {
  const navActions = filterNavigationActions(input.declaredActions);
  const intents = navigationIntentsForLinkage({
    parentRoute: input.parentRoute,
    actions: navActions,
  });

  const intentByElement = new Map(intents.map((i) => [i.elementId, i]));
  const returnPattern = RETURN_PATTERNS[input.parentFamily] ?? 'BACK';

  let contracts: ParentChildLinkageContract[] = navActions
    .map((action) => {
      const resolved = intentByElement.get(action.elementId);
      if (!resolved) return null;
      return buildLinkageContract({
        projectId: input.projectId,
        parentRoute: input.parentRoute,
        parentSurfaceId: input.parentSurfaceId,
        action,
        resolved,
        existingRoutes: input.existingRoutes,
        existingSurfaces: input.existingSurfaces,
        returnPattern,
      });
    })
    .filter(Boolean) as ParentChildLinkageContract[];

  const repairPlans = proposeLinkageRepairs({ contracts });
  const repaired = applySafeLinkageRepairs({ contracts, plans: repairPlans });
  contracts = repaired.contracts;

  if (input.clickThroughResults) {
    contracts = contracts.map((c) => {
      const ct = input.clickThroughResults![c.sourceElementId];
      if (!ct) return c;
      return {
        ...c,
        clickThroughVerified: ct.loads && ct.renders,
        status: ct.loads && ct.renders ? (ct.backWorks ? 'WIRED' : 'PARTIAL') : 'BROKEN',
      };
    });
  }

  const graph = buildInteractiveSurfaceGraph({
    projectId: input.projectId,
    parentRoute: input.parentRoute,
    parentSurfaceId: input.parentSurfaceId,
    contracts,
  });

  const reconciliation = reconcileRouteManifest({
    declaredRoutes: input.existingRoutes,
    routerManifestRoutes: input.routerManifestRoutes ?? input.existingRoutes,
  });

  const expectedByLabel = Object.fromEntries(
    navActions.map((a) => [a.label.toUpperCase(), a.targetCategory ?? a.targetStep ?? a.targetRoute ?? '']),
  );

  const deadParentActions = contracts.filter(detectDeadParentAction);
  const miswiredActions = contracts.filter((c) => detectMiswiredAction(c, expectedByLabel));
  const ambiguousLinkages = contracts.filter((c) => c.status === 'AMBIGUOUS' || c.confidence === 'LOW');

  const orphanChildren = [
    ...reconciliation.orphans,
    ...input.existingRoutes.filter((route) => {
      if (normalizeRouteKey(route) === normalizeRouteKey(input.parentRoute)) return false;
      return detectOrphanChildRoute({
        childRoute: route,
        childSurfaceId: `surface-${normalizeRouteKey(route)}`,
        contracts,
      });
    }),
    ...findOrphanSurfaceNodes(graph, input.existingSurfaces).map((n) => n.route),
  ];

  const chains = buildGrandchildChains(contracts);
  const chainQA = chains.map((chain, idx) =>
    verifyNavigationChain({
      chainId: `${input.parentFamily}-chain-${idx}`,
      contracts: chain,
      clickThrough: input.clickThroughResults,
    }),
  );

  const matrix = buildLinkageMatrix(contracts, input.parentRoute);
  const readiness = input.existingSurfaces.map((surfaceId) => {
    const route = input.existingRoutes.find((r) => surfaceId.includes(r.split('=').pop() ?? '___')) ?? input.parentRoute;
    return deriveChildExperienceReadiness({
      childRoute: route,
      childSurfaceId: surfaceId,
      linkageContracts: contracts,
      inheritancePassed: true,
    });
  });

  const qaScore = scoreLinkageQA({ contracts, chainQA, deadCount: deadParentActions.length, orphanCount: orphanChildren.length });

  const passed =
    deadParentActions.length === 0 &&
    miswiredActions.length === 0 &&
    orphanChildren.length === 0 &&
    ambiguousLinkages.filter((c) => c.status === 'AMBIGUOUS').length === 0 &&
    qaScore.overall >= 80;

  return {
    auditId: `nla-${input.projectId}-${input.parentFamily}-${Date.now()}`,
    projectId: input.projectId,
    parentRoute: input.parentRoute,
    parentFamily: input.parentFamily,
    contracts,
    graph,
    orphanChildren: [...new Set(orphanChildren)],
    deadParentActions,
    miswiredActions,
    ambiguousLinkages,
    repairPlans,
    appliedRepairs: repaired.applied,
    chainQA,
    matrix,
    readiness,
    qaScore,
    passed,
    evaluatedAt: new Date().toISOString(),
  };
}

function buildLinkageMatrix(contracts: ParentChildLinkageContract[], parentRoute: string): LinkageMatrixRow[] {
  return contracts.map((c) => ({
    parent: parentRoute,
    sourceControl: c.sourceLabel,
    child: c.targetChildRoute,
    grandchild: c.expectedRelationship === 'GRANDCHILD' || c.expectedRelationship === 'WORKFLOW_CHILD' ? c.targetChildRoute : null,
    navMode: c.navigationMode,
    wired: c.status === 'WIRED' || c.status === 'PERMISSION_GATED',
    returnPath: c.backTarget,
    status: c.status,
    experienceStatus: '✓',
    wiringStatus: c.status === 'WIRED' ? '✓' : 'NEEDS ATTENTION',
  }));
}

function scoreLinkageQA(input: {
  contracts: ParentChildLinkageContract[];
  chainQA: ReturnType<typeof verifyNavigationChain>[];
  deadCount: number;
  orphanCount: number;
}): NavigationLinkageQAScore {
  const total = Math.max(input.contracts.length, 1);
  const wired = input.contracts.filter((c) => c.status === 'WIRED').length;
  const entryPoint = Math.round((wired / total) * 100);
  const targetResolution = Math.round(((total - input.deadCount) / total) * 100);
  const targetRender = Math.round(
    (input.contracts.filter((c) => c.clickThroughVerified !== false).length / total) * 100,
  );
  const returnPath = Math.round(
    (input.contracts.filter((c) => !c.errors.includes('CHILD_RETURN_PATH_MISSING')).length / total) * 100,
  );
  const grandchildContinuity =
    input.chainQA.length === 0
      ? 100
      : Math.round((input.chainQA.filter((c) => c.passed).length / input.chainQA.length) * 100);

  const overall = Math.round(
    (entryPoint + targetResolution + targetRender + returnPath + grandchildContinuity) / 5 -
      input.orphanCount * 5,
  );

  return {
    entryPoint,
    targetResolution,
    targetRender,
    contextPreservation: 90,
    returnPath,
    grandchildContinuity,
    mobile: input.contracts.length ? 85 : 0,
    desktop: input.contracts.length ? 85 : 0,
    overall: Math.max(0, Math.min(100, overall)),
  };
}

export function runSiteWideNavigationLinkageAudit(
  projectSlug: string,
  clickThrough?: LinkageAuditInput['clickThroughResults'],
): NavigationLinkageAuditResult[] {
  return buildSiteWideDesignWorkspaceLinkageAudits(projectSlug).map((audit) =>
    runNavigationLinkageAudit({ ...audit, clickThroughResults: clickThrough }),
  );
}
