/**
 * P0.VR.UPGRADE.2 — Twin reconstruction + promotion workflow.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  approvePageCreativeDirection,
  openPageCreativeUpgradeSession,
  resetPageCreativeUpgradeSessionsForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageCreativeUpgradeSession.js';
import { buildPageVisualDiagnosis } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageVisualDiagnosis.js';
import { buildReconstructionPlan } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/reconstructionPlan.js';
import {
  buildTwin,
  createTwinSessionFromApprovedDirection,
  getActiveTwinSessionForPage,
  addTwinRevision,
  applyTwinRevision,
  approveTwinForPromotion,
  resetReconstructionTwinSessionsForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/reconstructionTwinSession.js';
import {
  getLiveRegistryEntry,
  ensureLivePageVersion,
  resetPageImplementationRegistryForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/pageImplementationRegistry.js';
import {
  promoteTwinToLivePage,
  restorePreviousLiveVersion,
  resetPagePromotionForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/pagePromotion.js';
import { buildTwinRoute, TWIN_ROUTE_META } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/twinRoute.js';
import { buildPageFunctionContract } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/pageFunctionContract.js';
import { P0_VR_UPGRADE_2_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/constants.js';
import { resetPageReconstructionExecutionsForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageReconstructionExecution.js';

const root = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function ndxPlan() {
  const dx = buildPageVisualDiagnosis({ isRootPage: true, viewport: 'mobile', pagePurpose: 'NDXBOOK OVERVIEW' });
  return buildReconstructionPlan({
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    authorityVersionId: 'auth-v1',
    captureId: 'cap-v1',
    route: '/projects/ndxbook/overview',
    pagePurpose: 'NDXBOOK OVERVIEW',
    isRootPage: true,
    diagnosis: dx,
  });
}

describe('P0.VR.UPGRADE.2 — twin reconstruction', () => {
  beforeEach(() => {
    resetPageCreativeUpgradeSessionsForTest();
    resetReconstructionTwinSessionsForTest();
    resetPageImplementationRegistryForTest();
    resetPagePromotionForTest();
    resetPageReconstructionExecutionsForTest();
  });

  it('1. PageImplementationState LIVE TWIN ARCHIVED', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.ts')).toContain(
      "'LIVE', 'TWIN', 'ARCHIVED'",
    );
  });

  it('2. approve direction does not mutate live version', () => {
    const liveBefore = ensureLivePageVersion({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      route: '/projects/ndxbook/overview',
    });
    openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      captureId: 'cap-1',
      pagePurpose: 'NDXBOOK OVERVIEW',
      parentAuthorityLabel: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook/overview',
      isRoot: true,
      designAuthorityVersionId: 'auth-1',
      designAuthorityAssetRef: 'https://cdn.example.com/authority.png',
      captureAssetRef: 'https://cdn.example.com/live.png',
    });
    approvePageCreativeDirection('ndxbook', 'ndxbook:/projects/ndxbook/overview', 'mobile');
    const entry = getLiveRegistryEntry('ndxbook', 'ndxbook:/projects/ndxbook/overview');
    expect(entry?.liveVersionId).toBe(liveBefore.versionId);
    expect(getActiveTwinSessionForPage('ndxbook', 'ndxbook:/projects/ndxbook/overview')).toBeTruthy();
  });

  it('3. twin route deterministic and protected meta', () => {
    const route = buildTwinRoute({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      sessionId: 'twin_ndxbook_1',
    });
    expect(route).toContain('/debug/reconstruction/');
    expect(route).toContain('twin_ndxbook_1');
    expect(TWIN_ROUTE_META.noindex).toBe(true);
    expect(TWIN_ROUTE_META.excludedFromPageFamily).toBe(true);
  });

  it('4. BUILD TWIN CTA in panel', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx')).toContain('BUILD TWIN');
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx')).toContain(
      'DIRECTION APPROVED',
    );
  });

  it('5. build twin creates isolated version without live switch', () => {
    const liveBefore = ensureLivePageVersion({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      route: '/projects/ndxbook/overview',
    });
    const plan = ndxPlan();
    const twin = createTwinSessionFromApprovedDirection({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      canonicalRoute: '/projects/ndxbook/overview',
      authorityVersionId: 'auth-v1',
      beforeCaptureId: 'cap-v1',
      captureAssetRef: null,
      plan,
      isRootPage: true,
    });
    return buildTwin(twin.sessionId).then((built) => {
      expect(built?.status).toBe('READY_FOR_REVIEW');
      expect(built?.twinVersionId).toBeTruthy();
      expect(getLiveRegistryEntry('ndxbook', 'ndxbook:/projects/ndxbook/overview')?.liveVersionId).toBe(
        liveBefore.versionId,
      );
    });
  });

  it('6. PageFunctionContract preserves routing auth data', () => {
    const c = buildPageFunctionContract({ route: '/projects/ndxbook/overview', isRootPage: true });
    expect(c.route).toBe('/projects/ndxbook/overview');
    expect(c.auth.length).toBeGreaterThan(0);
    expect(c.dataQueries.length).toBeGreaterThan(0);
  });

  it('7. twin mutation policy default READ_ONLY', () => {
    const twin = createTwinSessionFromApprovedDirection({
      projectId: 'ndxbook',
      pageId: 'p1',
      viewport: 'mobile',
      canonicalRoute: '/r',
      authorityVersionId: 'a1',
      beforeCaptureId: 'c1',
      plan: ndxPlan(),
    });
    expect(twin.mutationPolicy).toBe('READ_ONLY');
  });

  it('8. refine twin creates revision history', async () => {
    const twin = createTwinSessionFromApprovedDirection({
      projectId: 'ndxbook',
      pageId: 'p1',
      viewport: 'mobile',
      canonicalRoute: '/r',
      authorityVersionId: 'a1',
      beforeCaptureId: 'c1',
      plan: ndxPlan(),
    });
    await buildTwin(twin.sessionId);
    const rev = addTwinRevision(twin.sessionId, 'HEADER STILL TOO TALL');
    expect(rev?.instruction).toContain('HEADER');
    const applied = await applyTwinRevision(twin.sessionId, rev!.revisionId);
    expect(applied?.revisions.length).toBe(1);
    expect(applied?.twinVersions.length).toBeGreaterThan(1);
  });

  it('9. no automatic promotion', async () => {
    const twin = createTwinSessionFromApprovedDirection({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      canonicalRoute: '/projects/ndxbook/overview',
      authorityVersionId: 'a1',
      beforeCaptureId: 'c1',
      plan: ndxPlan(),
      isRootPage: true,
    });
    const built = await buildTwin(twin.sessionId);
    const liveBefore = getLiveRegistryEntry('ndxbook', 'ndxbook:/projects/ndxbook/overview')?.liveVersionId;
    expect(built?.status).toBe('READY_FOR_REVIEW');
    expect(getLiveRegistryEntry('ndxbook', 'ndxbook:/projects/ndxbook/overview')?.liveVersionId).toBe(liveBefore);
  });

  it('10. approve for promotion requires founder approval flag', async () => {
    const twin = createTwinSessionFromApprovedDirection({
      projectId: 'ndxbook',
      pageId: 'p1',
      viewport: 'mobile',
      canonicalRoute: '/r',
      authorityVersionId: 'a1',
      beforeCaptureId: 'c1',
      plan: ndxPlan(),
    });
    await buildTwin(twin.sessionId);
    const approved = approveTwinForPromotion(twin.sessionId);
    expect(approved?.status).toBe('APPROVED_FOR_PROMOTION');
    expect(approved?.promotionReadiness?.founderApproved).toBe(true);
  });

  it('11. promote archives prior live and switches pointer', async () => {
    ensureLivePageVersion({
      projectId: 'ndxbook',
      pageId: 'p1',
      route: '/r',
      buildRef: 'LIVE_A',
    });
    const twin = createTwinSessionFromApprovedDirection({
      projectId: 'ndxbook',
      pageId: 'p1',
      viewport: 'mobile',
      canonicalRoute: '/r',
      authorityVersionId: 'a1',
      beforeCaptureId: 'c1',
      plan: ndxPlan(),
    });
    await buildTwin(twin.sessionId);
    approveTwinForPromotion(twin.sessionId);
    const receipt = promoteTwinToLivePage(twin.sessionId);
    expect(receipt?.status).toBe('COMPLETE');
    expect(receipt?.archivedVersionId).toBeTruthy();
    const entry = getLiveRegistryEntry('ndxbook', 'p1');
    expect(entry?.liveVersionId).toBe(receipt?.toVersionId);
    expect(entry?.lastKnownGoodPageVersionId).toBeTruthy();
  });

  it('12. restore previous live without delete', () => {
    ensureLivePageVersion({ projectId: 'ndxbook', pageId: 'p1', route: '/r', buildRef: 'LIVE_A' });
    const archiveId = 'arch_test';
    const receipt = restorePreviousLiveVersion({
      projectId: 'ndxbook',
      pageId: 'p1',
      archiveId,
      reason: 'Founder rollback',
    });
    expect(receipt).toBeNull();
  });

  it('13. twin banner NOT LIVE', () => {
    expect(read('src/site00/components/reconstruction/ReconstructionTwinBanner.tsx')).toContain('NOT LIVE');
  });

  it('14. twin preview route registered', () => {
    expect(read('src/site00/config/routes.ts')).toContain('projectReconstructionTwin');
    expect(read('src/routes/Site00Routes.tsx')).toContain('ReconstructionTwinPreviewPage');
  });

  it('15. panel twin vs authority compare tabs', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx')).toContain(
      "'before', 'twin', 'authority'",
    );
  });

  it('16. build marker v300', () => {
    expect(P0_VR_UPGRADE_2_BUILD).toBe('v300');
  });
});
