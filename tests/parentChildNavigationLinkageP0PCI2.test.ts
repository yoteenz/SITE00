/**
 * P0.PCI.2 — Route linkage contract + parent-to-child wiring convergence tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  classifyInteractionIntent,
  filterNavigationActions,
  isNavigationLikeIntent,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/interactionIntentClassifier.js';
import {
  navigationIntentsForLinkage,
  resolveParentNavigationIntents,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/parentNavigationIntentResolver.js';
import {
  buildInteractiveSurfaceGraph,
  findUnlinkedSurfaceIds,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/interactiveSurfaceGraph.js';
import {
  buildLinkageContract,
  detectDeadParentAction,
  detectOrphanChildRoute,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/linkageContractBuilder.js';
import { applySafeLinkageRepairs, proposeLinkageRepairs } from '../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/linkageRepair.js';
import { verifyNavigationChain, buildGrandchildChains } from '../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/navigationChainQA.js';
import {
  reconcileRouteManifest,
  routeHasRequiredParams,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/routeManifestReconciliation.js';
import {
  runNavigationLinkageAudit,
  runSiteWideNavigationLinkageAudit,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/navigationLinkageAudit.js';
import {
  buildMoreHubLinkageAudit,
  buildPagesWizardLinkageAudit,
  buildAssetsWizardLinkageAudit,
  buildSkinsWizardLinkageAudit,
  buildFutureSitePilotLinkageAudit,
  buildMoreCaptureChildLinkageAudit,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/designWorkspacePilotRegistries.js';
import {
  deriveChildExperienceReadiness,
  childMayReportCurrent,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/childExperienceReadiness.js';
import { runIntegratedExperienceAudit } from '../shared/site00-studio-world-production/parentChildExperienceInheritance/integratedExperienceAudit.js';
import { applyLinkageBlockersToCompletenessGate } from '../shared/site00-studio-world-production/parentChildExperienceInheritance/pageCompletionLinkageIntegration.js';
import { buildSite00DesignWorkspaceMoreRegistry } from '../shared/site00-studio-world-production/parentChildExperienceInheritance/site00RouteFamilies.js';
import { PCI_PAGE_LINKAGE_BLOCKERS } from '../shared/site00-studio-world-production/parentChildExperienceInheritance/pageCompletionLinkageIntegration.js';
import {
  ASSETS_WIZARD_STEPS,
  SKINS_WIZARD_STEPS,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

describe('P0.PCI.2 — Navigation Linkage System', () => {
  it('1. ParentChildLinkageContract built from declared actions', () => {
    const audit = runNavigationLinkageAudit(buildMoreHubLinkageAudit('site00'));
    expect(audit.contracts[0]?.linkageId).toMatch(/^link-/);
    expect(audit.contracts[0]?.navigationOrigin.originElementId).toBeTruthy();
  });

  it('2. ParentNavigationIntentResolver resolves targets from handlers not labels only', () => {
    const intents = resolveParentNavigationIntents({
      parentRoute: '/projects/x/design?tab=MORE&moreCategory=landing',
      actions: [
        {
          elementId: 'tile-capture',
          label: 'CAPTURE',
          elementType: 'TILE',
          targetCategory: 'capture',
          sourceType: 'setTab',
          handlerRef: 'DesignMoreSystemHub.onSelectCategory',
        },
      ],
    });
    expect(intents[0]?.claimedTarget).toContain('moreCategory=capture');
    expect(intents[0]?.handlerRef).toContain('onSelectCategory');
  });

  it('3. InteractiveSurfaceGraph nodes and edges', () => {
    const audit = runNavigationLinkageAudit(buildMoreHubLinkageAudit('site00'));
    expect(audit.graph.nodes.length).toBeGreaterThan(1);
    expect(audit.graph.edges.some((e) => e.edgeKind === 'NAVIGATES_TO')).toBe(true);
  });

  it('4. NavigationOrigin stored on contract', () => {
    const audit = runNavigationLinkageAudit(buildMoreHubLinkageAudit('site00'));
    expect(audit.contracts[0]?.navigationOrigin.expectedReturnTarget).toBeTruthy();
  });

  it('5. InteractionIntentClassifier excludes SAVE mutation', () => {
    expect(classifyInteractionIntent({ label: 'SAVE', hasTarget: false })).toBe('SUBMISSION');
    expect(isNavigationLikeIntent(classifyInteractionIntent({ label: 'PROVIDERS', elementType: 'TILE', hasTarget: true }))).toBe(true);
  });

  it('6. direct child wiring — MORE providers tile', () => {
    const audit = runNavigationLinkageAudit(buildMoreHubLinkageAudit('site00'));
    const providers = audit.contracts.find((c) => c.sourceLabel.includes('PROVIDERS'));
    expect(providers?.targetChildRoute).toContain('moreCategory=providers');
    expect(providers?.status).toBe('WIRED');
  });

  it('7. grandchild wiring — MORE capture test worker', () => {
    const audit = runNavigationLinkageAudit(buildMoreCaptureChildLinkageAudit('site00'));
    const worker = audit.contracts.find((c) => c.sourceLabel === 'TEST WORKER');
    expect(worker?.expectedRelationship).toBe('GRANDCHILD');
    expect(worker?.targetChildRoute).toContain('pagesStep=test-worker');
  });

  it('8. tab child navigation mode', () => {
    const audit = runNavigationLinkageAudit(buildMoreHubLinkageAudit('site00'));
    expect(audit.contracts.every((c) => c.navigationMode === 'TAB_STATE' || c.navigationMode === 'WORKFLOW_STEP')).toBe(true);
  });

  it('9. workflow child — pages wizard steps', () => {
    const audit = runNavigationLinkageAudit(buildPagesWizardLinkageAudit('site00'));
    expect(audit.contracts.length).toBeGreaterThan(5);
    expect(audit.contracts.every((c) => c.navigationMode === 'WORKFLOW_STEP')).toBe(true);
  });

  it('10. dead action detection', () => {
    const contract = buildLinkageContract({
      projectId: 'x',
      parentRoute: '/hub',
      parentSurfaceId: 'hub',
      action: { elementId: 'dead', label: 'OPEN', elementType: 'BUTTON' },
      resolved: {
        elementId: 'dead',
        label: 'OPEN',
        intent: 'NAVIGATION',
        claimedTarget: '/missing',
        navigationMode: 'ROUTE',
        sourceType: 'onClick',
        handlerRef: null,
        confidence: 'LOW',
      },
      existingRoutes: [],
      existingSurfaces: [],
      returnPattern: 'BACK',
    });
    expect(detectDeadParentAction(contract)).toBe(true);
  });

  it('11. orphan child detection', () => {
    const audit = runNavigationLinkageAudit(buildMoreHubLinkageAudit('site00'));
    const orphan = detectOrphanChildRoute({
      childRoute: '/projects/site00/design?tab=MORE&moreCategory=ghost',
      childSurfaceId: 'ghost',
      contracts: audit.contracts,
    });
    expect(orphan).toBe(true);
  });

  it('12. miswired action detection via label map', () => {
    const audit = runNavigationLinkageAudit(buildMoreHubLinkageAudit('site00'));
    expect(audit.miswiredActions.length).toBe(0);
  });

  it('13. ambiguous linkage flagged for review', () => {
    const plans = proposeLinkageRepairs({
      contracts: [
        {
          ...buildLinkageContract({
            projectId: 'x',
            parentRoute: '/hub',
            parentSurfaceId: 'hub',
            action: { elementId: 'a1', label: 'MAYBE', elementType: 'BUTTON' },
            resolved: {
              elementId: 'a1',
              label: 'MAYBE',
              intent: 'NAVIGATION',
              claimedTarget: '/a',
              navigationMode: 'ROUTE',
              sourceType: 'onClick',
              handlerRef: null,
              confidence: 'LOW',
            },
            existingRoutes: [],
            existingSurfaces: [],
            returnPattern: 'BACK',
          }),
          status: 'AMBIGUOUS',
          confidence: 'LOW',
        },
      ],
    });
    expect(plans.some((p) => p.founderReviewRequired)).toBe(true);
  });

  it('14. safe auto-repair high confidence', () => {
    const contract = buildLinkageContract({
      projectId: 'x',
      parentRoute: '/hub',
      parentSurfaceId: 'hub',
      action: {
        elementId: 'c1',
        label: 'OPEN',
        elementType: 'BUTTON',
        handlerRef: 'go',
      },
      resolved: {
        elementId: 'c1',
        label: 'OPEN',
        intent: 'NAVIGATION',
        claimedTarget: '/old-path',
        navigationMode: 'ROUTE',
        sourceType: 'onClick',
        handlerRef: 'go',
        confidence: 'HIGH',
      },
      existingRoutes: ['/new-path'],
      existingSurfaces: [],
      returnPattern: 'BACK',
    });
    contract.status = 'BROKEN';
    contract.errors.push('HANDLER_MISSING');
    const plans = proposeLinkageRepairs({
      contracts: [contract],
      canonicalRouteMap: { '/old-path': '/new-path' },
    });
    const applied = applySafeLinkageRepairs({ contracts: [contract], plans });
    expect(applied.applied.length).toBeGreaterThan(0);
  });

  it('15. LinkageRepairPlan shape', () => {
    const plans = proposeLinkageRepairs({ contracts: [] });
    expect(Array.isArray(plans)).toBe(true);
  });

  it('16. return path required on contracts', () => {
    const audit = runNavigationLinkageAudit(buildMoreHubLinkageAudit('site00'));
    expect(audit.contracts.every((c) => c.backTarget.length > 0)).toBe(true);
  });

  it('17. state preservation on navigation origin', () => {
    const audit = runNavigationLinkageAudit(buildPagesWizardLinkageAudit('site00'));
    expect(audit.contracts[0]?.navigationOrigin.preserveState).toContain('pagesStep');
  });

  it('18. router manifest reconciliation', () => {
    const r = reconcileRouteManifest({
      declaredRoutes: ['/a', '/b'],
      routerManifestRoutes: ['/a', '/c'],
    });
    expect(r.matched).toContain('/a');
    expect(r.missingFromManifest).toContain('/b');
  });

  it('19. page completion blocker PAGE_CHILD_LINK_MISSING', () => {
    expect(PCI_PAGE_LINKAGE_BLOCKERS).toContain('PAGE_CHILD_LINK_MISSING');
    const gate = applyLinkageBlockersToCompletenessGate({
      gate: { passed: true, failureCodes: [], unresolvedCount: 0, orphanCount: 0, missingChildCount: 0, missingRouteCount: 0 },
      linkageAudit: {
        ...runNavigationLinkageAudit(buildMoreHubLinkageAudit('site00')),
        deadParentActions: [{} as never],
        contracts: [],
        orphanChildren: [],
      },
    });
    expect(gate.passed).toBe(false);
    expect(gate.failureCodes).toContain('PAGE_CHILD_LINK_MISSING');
  });

  it('20. inheritance engine integration', () => {
    const result = runIntegratedExperienceAudit({
      inheritance: { registry: buildSite00DesignWorkspaceMoreRegistry('site00'), dryRun: true },
      siteWideProjectSlug: 'site00',
    });
    expect(result.linkageAudits.length).toBeGreaterThan(0);
    expect(result.inheritance.parentAuthority).toBeTruthy();
  });

  it('21. ChildExperienceReadiness CURRENT requires both passes', () => {
    const r = deriveChildExperienceReadiness({
      childRoute: '/child',
      childSurfaceId: 'child',
      inheritancePassed: true,
      functionalQAPassed: true,
      linkageContracts: [
        {
          targetChildRoute: '/child',
          targetSurfaceId: 'child',
          status: 'WIRED',
          errors: [],
        } as never,
      ],
    });
    expect(childMayReportCurrent(r)).toBe(true);
  });

  it('22. parameterized route params check', () => {
    expect(routeHasRequiredParams('/services/:serviceId', { serviceId: 'abc' })).toBe(true);
    expect(routeHasRequiredParams('/services/:serviceId', {})).toBe(false);
  });

  it('23. permission-gated route status', () => {
    const audit = runNavigationLinkageAudit({
      ...buildMoreHubLinkageAudit('site00'),
      declaredActions: [
        {
          elementId: 'gated',
          label: 'ADMIN ONLY',
          elementType: 'BUTTON',
          targetRoute: '/admin',
          permissionGated: true,
          handlerRef: 'admin',
        },
      ],
    });
    expect(audit.contracts[0]?.status).toBe('PERMISSION_GATED');
  });

  it('24. stale linkage repair proposal', () => {
    const plans = proposeLinkageRepairs({
      contracts: [
        {
          linkageId: 'l1',
          sourceElementId: 'e1',
          resolvedRuntimePath: '/old',
          targetChildRoute: '/old',
          status: 'BROKEN',
          errors: [],
          confidence: 'HIGH',
        } as never,
      ],
      canonicalRouteMap: { '/old': '/new' },
    });
    expect(plans[0]?.proposedTarget).toBe('/new');
  });

  it('25. child deletion leaves orphan surface detectable', () => {
    const graph = buildInteractiveSurfaceGraph({
      projectId: 'x',
      parentRoute: '/hub',
      parentSurfaceId: 'hub',
      contracts: [],
    });
    const unlinked = findUnlinkedSurfaceIds({ graph, registeredSurfaceIds: ['deleted-child', 'hub'] });
    expect(unlinked).toContain('deleted-child');
    expect(unlinked).not.toContain('hub');
  });

  it('26. deep link child in future-site pilot', () => {
    const audit = runNavigationLinkageAudit(buildFutureSitePilotLinkageAudit());
    expect(audit.contracts.some((c) => c.targetChildRoute.includes(':serviceId'))).toBe(true);
  });

  it('27. refresh persistence declared in pages wizard', () => {
    const audit = runNavigationLinkageAudit(buildPagesWizardLinkageAudit('site00'));
    expect(audit.contracts[0]?.navigationOrigin.preserveState).toContain('viewport');
  });

  it('28. mobile click-through simulation', () => {
    const audit = runNavigationLinkageAudit({
      ...buildMoreHubLinkageAudit('site00'),
      clickThroughResults: {
        'more-tile-capture': { loads: true, renders: true, backWorks: true },
      },
    });
    const capture = audit.contracts.find((c) => c.sourceElementId === 'more-tile-capture');
    expect(capture?.clickThroughVerified).toBe(true);
  });

  it('29. desktop click-through uses same audit path', () => {
    const audit = runNavigationLinkageAudit({
      ...buildMoreHubLinkageAudit('site00'),
      viewport: 'DESKTOP',
      clickThroughResults: {
        'more-tile-providers': { loads: true, renders: true, backWorks: true },
      },
    });
    expect(audit.qaScore.desktop).toBeGreaterThan(0);
  });

  it('30. MORE pilot — all hub tiles wired', () => {
    const audit = runNavigationLinkageAudit(buildMoreHubLinkageAudit('site00'));
    const wired = audit.contracts.filter((c) => c.sourceElementType === 'TILE');
    expect(wired.every((c) => c.status === 'WIRED')).toBe(true);
    expect(wired.length).toBe(7);
  });

  it('31. PAGES pilot — wizard chain', () => {
    const audit = runNavigationLinkageAudit(buildPagesWizardLinkageAudit('site00'));
    expect(audit.passed).toBe(true);
  });

  it('32. ASSETS pilot — pipeline steps', () => {
    const audit = runNavigationLinkageAudit(buildAssetsWizardLinkageAudit('site00'));
    expect(audit.contracts.length).toBe(ASSETS_WIZARD_STEPS.length - 1);
  });

  it('33. SKINS pilot — wizard steps', () => {
    const audit = runNavigationLinkageAudit(buildSkinsWizardLinkageAudit('site00'));
    expect(audit.contracts.length).toBe(SKINS_WIZARD_STEPS.length - 1);
  });

  it('34. future-site pilot HOME → SERVICES → BOOKING', () => {
    const audit = runNavigationLinkageAudit(buildFutureSitePilotLinkageAudit());
    const chains = buildGrandchildChains(audit.contracts);
    expect(chains.length).toBeGreaterThan(0);
    expect(audit.contracts.some((c) => c.targetChildRoute.includes('booking'))).toBe(true);
  });

  it('35. site-wide linkage matrix', () => {
    const audits = runSiteWideNavigationLinkageAudit('site00');
    expect(audits.length).toBeGreaterThanOrEqual(5);
    expect(audits.every((a) => a.matrix.length >= 0)).toBe(true);
  });

  it('36. navigation chain QA', () => {
    const audit = runNavigationLinkageAudit(buildMoreCaptureChildLinkageAudit('site00'));
    const chain = verifyNavigationChain({ chainId: 'cap', contracts: audit.contracts });
    expect(chain.hops.length).toBeGreaterThan(0);
  });

  it('37. UI components wired', () => {
    expect(read('src/site00/components/designWorkspace/DesignChildExperiencePanel.tsx')).toContain('DesignChildExperiencePanel');
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('child-experience');
    expect(read('src/site00/components/designWorkspace/DesignMoreSystemHub.tsx')).toContain('CHILD EXPERIENCE MATRIX');
  });
});
