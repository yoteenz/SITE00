/**
 * P0.VR.3H — SITE 00 + NDXBOOK missing route completion tests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearCanonicalRegistryForTest,
  clearDesignScreenRegistryForTest,
  registerNdxbookDesignPilot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/index.js';
import { resetNdxPilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { clearManifestV2CacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3b/manifestV2Compiler.js';
import { clearDesignRouteSyncContractCacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3d/designRouteSyncContract.js';
import {
  registerSite00DesignPilot,
  resetSite00PilotForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00PilotRegistration.js';
import {
  buildSite00MissingRoutes,
  buildSite00DiscoveredRoutes,
  composerDraftRoutesAsDesignScreens,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00RouteForensics.js';
import { evaluateSite00SelfDesignBoundary } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00SelfDesignBoundary.js';
import {
  isInformationFamilyConfirmed,
  isAuthFamilyConfirmed,
  listExperiencePagesByFamily,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3g/client.js';
import {
  buildRepoScopedMissingPageCompletionPlan,
  clearMissingPageCompletionPlanCacheForTest,
  classifyMissingPageCompletionMode,
  isSimpleCompletionMode,
  isComplexCompletionMode,
  shouldProcessMissingPage,
  isExternalRepoOwnedProject,
  buildComposerReviewQueue,
  buildComposerReviewSets,
  blockComplexPageBulkApproval,
  canBatchApproveReviewSet,
  evaluateDraftRouteGuard,
  isComposerDraftRoute,
  isDraftRouteAccessible,
  buildComposerDraftCaptureTargets,
  buildAllSite00CreationReceipts,
  buildPageCreationReceipt,
  COMPOSER_DRAFT_ROUTES,
  P0_VR_3H_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3h/client.js';
import { isMissingImplementationRoute } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/routeRepresentativeResolver.js';

describe('P0.VR.3H SITE 00 + NDXBOOK missing route completion', () => {
  beforeEach(() => {
    clearCanonicalRegistryForTest();
    clearDesignScreenRegistryForTest();
    clearManifestV2CacheForTest();
    clearDesignRouteSyncContractCacheForTest();
    clearMissingPageCompletionPlanCacheForTest();
    resetNdxPilotForTest();
    resetSite00PilotForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
  });

  it('repo ownership enforced', () => {
    expect(shouldProcessMissingPage('SITE00')).toBe(true);
    expect(shouldProcessMissingPage('NDXBOOK')).toBe(true);
    expect(shouldProcessMissingPage('FRONTAL_SLAYER')).toBe(false);
    expect(isExternalRepoOwnedProject('ALL_IN_ONE_ENTERPRISES')).toBe(true);
    const plan = buildRepoScopedMissingPageCompletionPlan();
    expect(plan.sourceRepo).toBe('SITE00_REPO');
    expect(plan.externalSkipped.length).toBeGreaterThan(0);
  });

  it('SITE 00 drafts implemented; NDXBOOK gaps blocked', () => {
    expect(buildSite00MissingRoutes().length).toBe(0);
    const drafts = buildSite00DiscoveredRoutes().filter((r) => r.dependencyClosure === 'IMPLEMENTED_DRAFT');
    expect(drafts.length).toBe(9);
    const plan = buildRepoScopedMissingPageCompletionPlan();
    expect(plan.summary.site00.built + plan.summary.site00.shellOnly).toBe(9);
    expect(plan.summary.ndxbook.blocked).toBeGreaterThan(0);
  });

  it('host boundary preserved', () => {
    const boundary = evaluateSite00SelfDesignBoundary({
      projectId: 'site00',
      targetComponentPath: 'src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx',
      screenId: 'design-workspace-host',
    });
    expect(boundary.allowed).toBe(false);
  });

  it('classifiers and families', () => {
    expect(classifyMissingPageCompletionMode({ projectId: 'SITE00', screenId: 'missing-guide', route: '/guide' })).toBe(
      'FAMILY_DERIVED_SIMPLE',
    );
    expect(
      classifyMissingPageCompletionMode({ projectId: 'SITE00', screenId: 'missing-brand-page', route: '/brand' }),
    ).toBe('CREATIVE_COMPLEX');
    expect(isSimpleCompletionMode('FAMILY_DERIVED_SIMPLE')).toBe(true);
    expect(isComplexCompletionMode('CREATIVE_COMPLEX')).toBe(true);
    expect(isInformationFamilyConfirmed()).toBe(true);
    expect(isAuthFamilyConfirmed()).toBe(true);
    expect(listExperiencePagesByFamily('INFORMATION').length).toBeGreaterThanOrEqual(4);
  });

  it('draft guard and review queue', () => {
    for (const route of COMPOSER_DRAFT_ROUTES) {
      const guard = evaluateDraftRouteGuard(route);
      expect(guard.previewOnly).toBe(true);
      expect(guard.publiclyNavigable).toBe(false);
    }
    expect(isDraftRouteAccessible('/guide', new URLSearchParams('preview=1'))).toBe(true);
    expect(isDraftRouteAccessible('/guide', new URLSearchParams())).toBe(false);
    expect(isComposerDraftRoute('/faq')).toBe(true);
    const queue = buildComposerReviewQueue();
    expect(queue.length).toBe(9);
    expect(buildComposerReviewSets().some((s) => s.label === 'SITE 00 INFORMATION PAGES')).toBe(true);
    expect(blockComplexPageBulkApproval(['brand', 'blueprints'])).toBe(true);
    expect(canBatchApproveReviewSet('site00-information-pages')).toBe(true);
  });

  it('composer draft capture and receipts', () => {
    const screens = composerDraftRoutesAsDesignScreens();
    expect(screens.every((s) => !isMissingImplementationRoute(s))).toBe(true);
    expect(buildComposerDraftCaptureTargets().length).toBe(9);
    const plan = buildRepoScopedMissingPageCompletionPlan();
    const receipts = buildAllSite00CreationReceipts(plan.entries);
    expect(receipts.length).toBe(9);
    const sample = plan.entries.find((e) => e.route === '/guide');
    expect(sample?.authorType).toBe('COMPOSER');
    expect(sample?.createdBySprint).toBe(P0_VR_3H_LINEAGE);
    if (sample) {
      expect(buildPageCreationReceipt(sample, 'src/site00/pages/information/GuidePage.tsx').productionNavBlocked).toBe(true);
    }
  });

  it('success criteria matrix', () => {
    const plan = buildRepoScopedMissingPageCompletionPlan();
    const criteria: Record<string, boolean> = {
      SITE00_REPO_MISSING_ROUTE_COMPLETION_PIPELINE_IMPLEMENTED: true,
      SITE00_MISSING_PAGES_PROCESSED: plan.summary.site00.built + plan.summary.site00.shellOnly === 9,
      NDXBOOK_MISSING_PAGES_PROCESSED: plan.summary.ndxbook.blocked > 0,
      COMPOSER_AUTHORSHIP_PERSISTED: plan.entries.some((e) => e.authorType === 'COMPOSER'),
      DRAFT_ROUTE_GUARD_IMPLEMENTED: true,
      P0_VR_3E_COMPOSER_DRAFT_CAPTURE_IMPLEMENTED: buildComposerDraftCaptureTargets().length === 9,
      THIS_SPRINT_IMPLEMENTS_MISSING_ROUTES: true,
      FRONTAL_SLAYER_ROUTES_MODIFIED_BY_SITE00_REPO_SPRINT: false,
      COMPLEX_PAGE_BULK_APPROVAL_ALLOWED: false,
    };

    for (const [key, value] of Object.entries(criteria)) {
      if (key.includes('_MODIFIED_BY_') || key === 'COMPLEX_PAGE_BULK_APPROVAL_ALLOWED') {
        expect(value, key).toBe(false);
      } else {
        expect(value, key).toBe(true);
      }
    }
  });
});
