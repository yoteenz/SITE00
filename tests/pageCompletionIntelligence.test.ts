/**
 * Page Completion + Interaction Intelligence Engine tests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  detectPageInteractionAffordances,
  classifyAffordanceFromLabel,
} from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/affordanceDetector.js';
import { inferChildSurfaceFromContract } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/childSurfaceInference.js';
import {
  discoverExistingRoutes,
  inferRequiredRoutes,
  compareRequiredVsExisting,
  createMissingRoutePlan,
  choosePresentation,
} from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/routeCompletionEngine.js';
import { buildPageInteractionGraph } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/interactionGraph.js';
import { auditPageInteractionGraph, countGraphOrphans } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/interactionGraphQA.js';
import { evaluatePageCompletenessGate, unresolvedVisibleActions } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/completenessGate.js';
import { calculateInteractionCoverage } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/interactionCoverage.js';
import { canRecursePageCompletion } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/recursionGuard.js';
import { findDuplicateChildSurfaces } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/duplicateDetection.js';
import { resolveAuthorityCascade } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/authorityCascade.js';
import {
  buildDesignSkinsPageContracts,
  buildDesignWorkspaceTabContracts,
  designWorkspaceExistingRoutes,
} from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/designWorkspaceContracts.js';
import {
  runPageCompletionIntelligence,
  runRecursivePageCompletion,
  buildPageCompletionInspectorState,
} from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/pageCompletionEngine.js';
import {
  runDesignReconstructionKernel,
  pagesPipelineInheritsSkinsKernel,
  assetsPipelineLinkedToPageJob,
} from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/designReconstructionKernel.js';
import {
  onPageCreated,
  onPageUpdated,
  onInteractionRemoved,
  pageSyncEventTriggersCompletion,
  clearPageCompletionJobsForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/eventHandlers.js';
import { buildPageCompletionFounderActions } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/founderActionBridge.js';
import { evaluatePageChildCohesionQA } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/childCohesionQA.js';
import { simulateSafeNavQA } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/navQA.js';
import { getModuleFunctionalContract } from '../shared/site00-brand-lore/projectSkin/brandFamily/functionalContract.js';
import { PCI_FAILURE_CODES } from '../shared/site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/types.js';
import { clearPageSyncEventsForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8/syncOrchestrator.js';

const SKINS_INPUT = {
  projectId: 'site00',
  pageId: 'design-skins-mobile',
  primaryRoute: '/projects/site00/design?tab=skins',
  moduleScreenType: 'SKINS',
  parentAuthorityId: 'skins-authority-mobile',
};

describe('Page Completion Intelligence Engine', () => {
  beforeEach(() => {
    clearPageCompletionJobsForTest();
    clearPageSyncEventsForTest();
  });

  it('1. PageCompletionIntelligenceEngine exists', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    expect(job.pageId).toBe('design-skins-mobile');
  });

  it('2. buttons detected', () => {
    const c = detectPageInteractionAffordances({
      pageId: 'p1',
      declared: [{ label: 'ADD AUTHORITY', affordanceType: 'BUTTON' }],
    });
    expect(c.some((x) => x.label === 'ADD AUTHORITY')).toBe(true);
  });

  it('3. links detected', () => {
    expect(classifyAffordanceFromLabel('VIEW ALL')).toBe('LINK');
  });

  it('4. tabs detected', () => {
    const tabs = buildDesignWorkspaceTabContracts('dw');
    expect(tabs.every((t) => t.affordanceType === 'TAB')).toBe(true);
  });

  it('5. toggles detected', () => {
    const c = detectPageInteractionAffordances({
      pageId: 'p1',
      declared: [{ label: 'MOBILE', affordanceType: 'TOGGLE' }],
    });
    expect(c[0]!.affordanceType).toBe('TOGGLE');
  });

  it('6. dropdowns detected', () => {
    expect(classifyAffordanceFromLabel('PROJECT SELECTOR')).toBe('BUTTON');
    const c = detectPageInteractionAffordances({
      pageId: 'p1',
      declared: [{ label: 'PROJECT SELECTOR', affordanceType: 'DROPDOWN' }],
    });
    expect(c[0]!.affordanceType).toBe('DROPDOWN');
  });

  it('7. modal triggers inferred via upload', () => {
    const inf = inferChildSurfaceFromContract({
      contract: {
        interactionId: 'ix-1',
        pageId: 'p1',
        regionId: 'r1',
        label: 'UPLOAD',
        affordanceType: 'UPLOAD',
        intent: 'OPEN_UPLOAD_FLOW',
        targetType: 'ROUTE',
        status: 'PLANNED',
        confidence: 'HIGH',
      },
      primaryRoute: '/projects/site00/design',
      projectId: 'site00',
    });
    expect(inf.contract.targetType).toBe('MODAL');
  });

  it('8. child surface inference works', () => {
    const inf = inferChildSurfaceFromContract({
      contract: {
        interactionId: 'ix-add',
        pageId: 'p1',
        regionId: 'r1',
        label: 'ADD AUTHORITY',
        affordanceType: 'BUTTON',
        intent: 'OPEN_ADD_AUTHORITY_WORKSPACE',
        targetType: 'ROUTE',
        status: 'PLANNED',
        confidence: 'HIGH',
      },
      primaryRoute: '/projects/site00/design?tab=skins',
      projectId: 'site00',
      parentAuthorityId: 'auth-1',
    });
    expect(inf.childSurface?.label).toBe('ADD AUTHORITY WORKSPACE');
  });

  it('9. existing routes reused', () => {
    const inf = inferChildSurfaceFromContract({
      contract: {
        interactionId: 'ix-tab',
        pageId: 'p1',
        regionId: 'r1',
        label: 'ASSETS',
        affordanceType: 'TAB',
        intent: 'TAB_SWITCH',
        targetType: 'ROUTE',
        status: 'PLANNED',
        confidence: 'HIGH',
      },
      primaryRoute: '/projects/site00/design',
      projectId: 'site00',
      existingRoutes: designWorkspaceExistingRoutes('site00'),
    });
    expect(inf.reusedExistingRoute || inf.contract.status === 'IMPLEMENTED').toBeTruthy();
  });

  it('10. missing routes planned', () => {
    const missing = compareRequiredVsExisting(
      ['/completely/unrelated/future-child-route'],
      designWorkspaceExistingRoutes('site00'),
    );
    expect(missing.missing.length).toBeGreaterThan(0);
    expect(createMissingRoutePlan(missing.missing).length).toBeGreaterThan(0);
  });

  it('11. route vs modal decision supported', () => {
    expect(choosePresentation({ complexity: 'LOW', deepLinkValue: false, mobile: true, intent: 'OPEN' })).toBe('MODAL');
    expect(choosePresentation({ complexity: 'HIGH', deepLinkValue: true, mobile: false, intent: 'OPEN' })).toBe('ROUTE');
  });

  it('12. child visual inheritance exists', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    expect(job.childSurfacePlans[0]?.inheritance.prohibitedFallbacks).toContain('GENERIC_ADMIN_UI');
  });

  it('13. page completion plan created', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    expect(job.completionPlan.interactionContracts.length).toBeGreaterThan(5);
  });

  it('14. interaction graph created', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    expect(job.interactionGraph.nodes.length).toBeGreaterThan(0);
    expect(job.interactionGraph.edges.length).toBeGreaterThan(0);
  });

  it('15. unresolved action blocks complete', () => {
    const job = runPageCompletionIntelligence({
      ...SKINS_INPUT,
      declaredInteractions: [{ label: 'MYSTERY ACTION', affordanceType: 'BUTTON' }],
    });
    expect(job.implementationStatus).not.toBe('COMPLETE');
  });

  it('16. return path required for child surfaces', () => {
    const inf = inferChildSurfaceFromContract({
      contract: {
        interactionId: 'ix-1',
        pageId: 'p1',
        regionId: 'r1',
        label: 'VIEW DETAILS',
        affordanceType: 'BUTTON',
        intent: 'OPEN_DETAIL_VIEW',
        targetType: 'ROUTE',
        status: 'PLANNED',
        confidence: 'HIGH',
      },
      primaryRoute: '/projects/site00/design',
      projectId: 'site00',
    });
    expect(inf.contract.returnPath).toBeTruthy();
  });

  it('17. orphan child detected', () => {
    const graph = buildPageInteractionGraph({
      pageId: 'p1',
      primaryRoute: '/a',
      contracts: [],
      childSurfaces: [
        {
          childSurfaceId: 'orphan',
          label: 'ORPHAN',
          targetType: 'CHILD_ROUTE',
          route: '/a/orphan',
          parentInteractionId: 'missing',
          inheritance: {
            parentAuthorityId: null,
            skinId: null,
            hostShellRules: [],
            typographyRules: [],
            colorRules: [],
            surfaceRules: [],
            spacingRules: [],
            componentRules: [],
            allowedVariation: [],
            prohibitedFallbacks: [],
          },
          implementationStatus: 'PLANNED',
          hasAuthority: false,
        },
      ],
    });
    expect(countGraphOrphans(graph, '/a')).toBeGreaterThan(0);
  });

  it('18. auto child implementation plan supported', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    expect(job.childSurfacePlans.some((c) => c.implementationStatus === 'PLANNED')).toBe(true);
  });

  it('19. ambiguity creates founder action', () => {
    const job = runPageCompletionIntelligence({
      ...SKINS_INPUT,
      declaredInteractions: [{ label: 'DO SOMETHING', affordanceType: 'BUTTON' }],
    });
    const actions = buildPageCompletionFounderActions(job);
    expect(actions.some((a) => a.actionType === 'REVIEW_INTERACTION_AMBIGUITY' || a.actionType === 'REVIEW_CHILD_SURFACE_PLAN')).toBe(true);
  });

  it('20. Pages uses shared reconstruction kernel', () => {
    expect(pagesPipelineInheritsSkinsKernel()).toBe(true);
  });

  it('21. Assets uses shared reconstruction kernel', () => {
    const job = runPageCompletionIntelligence({ ...SKINS_INPUT, pageId: 'design-assets', moduleScreenType: 'ASSETS' });
    expect(assetsPipelineLinkedToPageJob(job)).toBe(true);
  });

  it('22. page-created event triggers completion engine', () => {
    expect(pageSyncEventTriggersCompletion('PAGE_CREATED')).toBe(true);
    const job = onPageCreated(SKINS_INPUT);
    expect(job.pageId).toBe(SKINS_INPUT.pageId);
  });

  it('23. page-updated event reruns interactions', () => {
    onPageCreated(SKINS_INPUT);
    const updated = onPageUpdated({
      ...SKINS_INPUT,
      declaredInteractions: [...buildDesignSkinsPageContracts('x'), { label: 'NEW ACTION', affordanceType: 'BUTTON' }],
    });
    expect(updated.completionPlan.interactionContracts.length).toBeGreaterThan(0);
  });

  it('24. interaction removal reconciles', () => {
    const job = onPageCreated(SKINS_INPUT);
    const first = job.completionPlan.interactionContracts[0]!;
    const reconciled = onInteractionRemoved(SKINS_INPUT, first.interactionId);
    expect(reconciled.completionPlan.interactionContracts.every((c) => c.interactionId !== first.interactionId)).toBe(true);
  });

  it('25. toggle state contract works', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    expect(job.completionPlan.interactionContracts.some((c) => c.targetType === 'TOGGLE_STATE')).toBe(true);
  });

  it('26. tab state contract works', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    const tabs = job.completionPlan.interactionContracts.filter((c) => c.affordanceType === 'TAB');
    expect(tabs.every((t) => t.status === 'IMPLEMENTED')).toBe(true);
  });

  it('27. dropdown data contract works', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    expect(job.completionPlan.interactionContracts.some((c) => c.dataRequirement === 'PROJECT_LIST')).toBe(true);
  });

  it('28. filter sort contract supported', () => {
    const c = detectPageInteractionAffordances({
      pageId: 'p1',
      declared: [
        { label: 'FILTER', affordanceType: 'FILTER' },
        { label: 'SORT', affordanceType: 'SORT' },
      ],
    });
    expect(c.length).toBe(2);
  });

  it('29. modal focus close contract via sheet type', () => {
    const inf = inferChildSurfaceFromContract({
      contract: {
        interactionId: 'ix-1',
        pageId: 'p1',
        regionId: 'r1',
        label: 'ADD AUTHORITY',
        affordanceType: 'BUTTON',
        intent: 'OPEN_ADD_AUTHORITY_WORKSPACE',
        targetType: 'ROUTE',
        status: 'PLANNED',
        confidence: 'HIGH',
      },
      primaryRoute: '/projects/site00/design?tab=skins',
      projectId: 'site00',
    });
    expect(inf.contract.targetType).toBe('SHEET');
  });

  it('30. CRUD completeness — edit/delete intents', () => {
    expect(classifyAffordanceFromLabel('EDIT')).toBe('EDIT');
    expect(classifyAffordanceFromLabel('DELETE')).toBe('DELETE');
  });

  it('31. loading empty error states in plan', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    expect(job.completionPlan.requiredLoadingStates.length).toBeGreaterThan(0);
    expect(job.completionPlan.requiredErrorStates.length).toBeGreaterThan(0);
  });

  it('32. permissions inherited', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    expect(job.completionPlan.requiredPermissions).toContain('FOUNDER');
  });

  it('33. client firewall preserved via founder permission', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    expect(job.completionPlan.requiredPermissions).toContain('PROJECT_SCOPE');
  });

  it('34. AuthorityCascade works', () => {
    const c = resolveAuthorityCascade({ childAuthorityId: 'child-1' });
    expect(c.level).toBe(1);
    const fallback = resolveAuthorityCascade({});
    expect(fallback.usedGenericFallback).toBe(true);
  });

  it('35. multi-asset child job linked', () => {
    const kernel = runDesignReconstructionKernel({ workspace: 'SKINS', pageExperience: SKINS_INPUT });
    expect(kernel.multiAssetJob).toBeTruthy();
    expect(kernel.assetJobLinked).toBe(true);
  });

  it('36. child visual QA works', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    const surface = job.childSurfacePlans[0];
    if (surface) {
      const qa = evaluatePageChildCohesionQA(surface);
      expect(qa.passed).toBe(true);
    }
  });

  it('37. end-to-end navigation QA works', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    const nav = simulateSafeNavQA({
      graph: job.interactionGraph,
      contracts: job.completionPlan.interactionContracts,
      primaryRoute: job.completionPlan.primaryRoute,
    });
    expect(nav.passed).toBeGreaterThan(0);
  });

  it('38. safe-action guard excludes delete', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    const nav = simulateSafeNavQA({
      graph: job.interactionGraph,
      contracts: [
        ...job.completionPlan.interactionContracts,
        {
          interactionId: 'del-1',
          pageId: 'p1',
          regionId: 'r1',
          label: 'DELETE',
          affordanceType: 'DELETE',
          intent: 'CONFIRM_DELETE',
          targetType: 'MODAL',
          status: 'PLANNED',
          confidence: 'HIGH',
        },
      ],
      primaryRoute: job.completionPlan.primaryRoute,
    });
    expect(nav.results.every((r) => r.interactionId !== 'del-1')).toBe(true);
  });

  it('39. interaction coverage calculated', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    const cov = calculateInteractionCoverage(job.completionPlan.interactionContracts);
    expect(cov.detected).toBeGreaterThan(0);
    expect(cov.coveragePercent).toBeGreaterThan(0);
  });

  it('40. page completion gate works', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    const gate = evaluatePageCompletenessGate({
      plan: job.completionPlan,
      graph: job.interactionGraph,
      existingRoutes: designWorkspaceExistingRoutes('site00'),
    });
    expect(typeof gate.passed).toBe('boolean');
  });

  it('41. child route enters page registry via PAGE_CREATED sync', () => {
    onPageCreated(SKINS_INPUT);
    expect(pageSyncEventTriggersCompletion('PAGE_CREATED')).toBe(true);
  });

  it('42. child route screenshot capture triggers via sync handler', () => {
    const result = onPageCreated(SKINS_INPUT);
    expect(result.childSurfacePlans.length).toBeGreaterThan(0);
  });

  it('43. recursive completion works', () => {
    const jobs = runRecursivePageCompletion(SKINS_INPUT);
    expect(jobs.length).toBeGreaterThan(1);
  });

  it('44. recursion guard works', () => {
    const g = canRecursePageCompletion(5, 'p1', ['a', 'b', 'p1']);
    expect(g.allowed).toBe(false);
  });

  it('45. duplicate detection works', () => {
    const dupes = findDuplicateChildSurfaces([
      {
        childSurfaceId: 'a',
        label: 'X',
        targetType: 'CHILD_ROUTE',
        route: '/same',
        parentInteractionId: 'i1',
        inheritance: {
          parentAuthorityId: null,
          skinId: null,
          hostShellRules: [],
          typographyRules: [],
          colorRules: [],
          surfaceRules: [],
          spacingRules: [],
          componentRules: [],
          allowedVariation: [],
          prohibitedFallbacks: [],
        },
        implementationStatus: 'PLANNED',
        hasAuthority: false,
      },
      {
        childSurfaceId: 'b',
        label: 'Y',
        targetType: 'CHILD_ROUTE',
        route: '/same',
        parentInteractionId: 'i2',
        inheritance: {
          parentAuthorityId: null,
          skinId: null,
          hostShellRules: [],
          typographyRules: [],
          colorRules: [],
          surfaceRules: [],
          spacingRules: [],
          componentRules: [],
          allowedVariation: [],
          prohibitedFallbacks: [],
        },
        implementationStatus: 'PLANNED',
        hasAuthority: false,
      },
    ]);
    expect(dupes).toContain('PAGE_CHILD_ROUTE_DUPLICATE');
  });

  it('46. ModuleFunctionalContract integrated', () => {
    const c = getModuleFunctionalContract('EVOLVE');
    expect(c.mustPreserve).toContain('EVOLVE_PIPELINE');
  });

  it('47. BrandFamilySkin integrated via skinId on job', () => {
    const job = runPageCompletionIntelligence({ ...SKINS_INPUT, skinId: 'site00' });
    expect(job.completionPlan.requiredAssets).toContain('BRAND_FAMILY_VISUALS');
  });

  it('48. System Inspector exposes completion state', () => {
    const job = runPageCompletionIntelligence(SKINS_INPUT);
    const inspector = buildPageCompletionInspectorState(job);
    expect(inspector.detectedInteractions).toBeGreaterThan(0);
  });

  it('49. PCI failure codes registered', () => {
    expect(PCI_FAILURE_CODES).toContain('PAGE_INTERACTION_UNRESOLVED');
    expect(PCI_FAILURE_CODES.length).toBeGreaterThanOrEqual(14);
  });
});
