/**
 * P0.VR.CAPTURE.1 — Page-scoped CAPTURE NOW + creative upgrade workflow.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_CAPTURE_1_BUILD,
  acquireCaptureNowLock,
  buildSinglePageCaptureJobId,
  finalizeCaptureCurrentPage,
  isCaptureNowInFlight,
  planCaptureCurrentPage,
  releaseCaptureNowLock,
  resetCaptureCurrentPageForTest,
  resolveCaptureViewport,
  buildPageViewportCapture,
  derivePageViewportCaptureStatus,
  getPageViewportCapture,
  migrateLegacyCaptureToViewportCapture,
  resetPageViewportCaptureStoreForTest,
  savePageViewportCapture,
  approvePageCreativeDirection,
  attachAfterCaptureToSession,
  getPageCreativeUpgradeSession,
  openPageCreativeUpgradeSession,
  resetPageCreativeUpgradeSessionsForTest,
  buildPageCreativeDiagnosis,
  buildPageCreativeDirectionPlan,
  resolvePageUpgradeNextAction,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.CAPTURE.1 — Page-scoped capture', () => {
  beforeEach(() => {
    resetCaptureCurrentPageForTest();
    resetPageViewportCaptureStoreForTest();
    resetPageCreativeUpgradeSessionsForTest();
  });

  it('1. CaptureCurrentPage module exists', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/captureCurrentPage.ts')).toContain(
      'planCaptureCurrentPage',
    );
  });

  it('2. PageViewportCapture store', () => {
    const c = savePageViewportCapture(
      buildPageViewportCapture({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook/overview',
        viewport: 'mobile',
        captureId: 'cap-1',
        route: '/projects/ndxbook/overview',
        resolvedRuntimePath: '/projects/ndxbook/overview',
        imageRef: '/img.png',
      }),
    );
    expect(getPageViewportCapture('ndxbook', c.pageId, 'mobile')?.captureId).toBe('cap-1');
  });

  it('3. resolves current project in plan', () => {
    const plan = planCaptureCurrentPage({
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      screenId: 'overview',
      route: '/OVERVIEW',
      viewport: 'mobile',
    });
    expect(plan.singlePageJob).toBe(true);
    expect(plan.projectRunCreated).toBe(false);
  });

  it('4. resolves page route via runtime resolver path', () => {
    const plan = planCaptureCurrentPage({
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      screenId: 'overview',
      route: '/OVERVIEW',
      viewport: 'mobile',
    });
    expect(plan.resolvedRuntimePath).toContain('/projects/');
  });

  it('5. mobile-only capture viewport', () => {
    expect(resolveCaptureViewport('mobile')).toBe('mobile');
    const plan = planCaptureCurrentPage({
      projectId: 'ndxbook',
      pageId: 'p1',
      screenId: 's1',
      route: '/r',
      viewport: 'mobile',
    });
    expect(plan.viewport).toBe('mobile');
  });

  it('6. desktop-only capture viewport', () => {
    const plan = planCaptureCurrentPage({
      projectId: 'ndxbook',
      pageId: 'p1',
      screenId: 's1',
      route: '/r',
      viewport: 'desktop',
    });
    expect(plan.viewport).toBe('desktop');
  });

  it('7. one job id — not project run', () => {
    const id = buildSinglePageCaptureJobId('ndxbook', 'page1', 'mobile');
    expect(id).toMatch(/^capture_now_/);
    const result = finalizeCaptureCurrentPage({
      input: { projectId: 'ndxbook', pageId: 'p1', screenId: 's1', route: '/r', viewport: 'mobile' },
      jobId: id,
      resolvedRuntimePath: '/projects/ndxbook/overview',
      screenshotUrl: '/shot.png',
    });
    expect(result.singlePageJob).toBe(true);
    expect(result.projectRunCreated).toBe(false);
  });

  it('8. no project-wide run flag', () => {
    const plan = planCaptureCurrentPage({
      projectId: 'ndxbook',
      pageId: 'p1',
      screenId: 's1',
      route: '/r',
      viewport: 'mobile',
    });
    expect(plan.projectRunCreated).toBe(false);
  });

  it('9. capture success status', () => {
    const r = finalizeCaptureCurrentPage({
      input: { projectId: 'ndxbook', pageId: 'p1', screenId: 's1', route: '/r', viewport: 'mobile' },
      jobId: 'j1',
      resolvedRuntimePath: '/r',
      screenshotUrl: '/x.png',
    });
    expect(r.status).toBe('CAPTURE_READY');
  });

  it('10. capture failure status', () => {
    const r = finalizeCaptureCurrentPage({
      input: { projectId: 'ndxbook', pageId: 'p1', screenId: 's1', route: '/r', viewport: 'mobile' },
      jobId: 'j1',
      resolvedRuntimePath: '/r',
      screenshotUrl: null,
      error: 'TIMEOUT',
    });
    expect(r.status).toBe('CAPTURE_FAILED');
  });

  it('11. duplicate-tap guard', () => {
    expect(acquireCaptureNowLock('ndxbook', 'p1', 'mobile')).toBe(true);
    expect(isCaptureNowInFlight('ndxbook', 'p1', 'mobile')).toBe(true);
    expect(acquireCaptureNowLock('ndxbook', 'p1', 'mobile')).toBe(false);
    releaseCaptureNowLock('ndxbook', 'p1', 'mobile');
    expect(isCaptureNowInFlight('ndxbook', 'p1', 'mobile')).toBe(false);
  });

  it('12. timeout constant defined', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/constants.ts')).toContain(
      'PAGE_CAPTURE_TIMEOUT_MS',
    );
  });

  it('13. RuntimeRouteResolver integration', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/captureCurrentPage.ts')).toContain(
      'resolveRuntimeRouteForPage',
    );
  });

  it('14. API capture_current_page action', () => {
    expect(read('api/site00/page-mirror.ts')).toContain('capture_current_page');
  });

  it('15. PageCreativeUpgradeSession', () => {
    const s = openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'p1',
      viewport: 'mobile',
      captureId: 'c1',
      pagePurpose: 'Operations',
      parentAuthorityLabel: 'Parent landing',
      route: '/ops',
    });
    expect(s.status).toBe('DIRECTION_READY');
    expect(getPageCreativeUpgradeSession('ndxbook', 'p1', 'mobile')?.sessionId).toBe(s.sessionId);
  });

  it('16. PageCreativeDiagnosis', () => {
    const d = buildPageCreativeDiagnosis({ isChildPage: true, missingParentGrammar: true });
    expect(d.codes).toContain('PARENT_GRAMMAR_DRIFT');
  });

  it('17. PageCreativeDirectionPlan', () => {
    const p = buildPageCreativeDirectionPlan({
      pagePurpose: 'Content ops',
      parentAuthorityLabel: 'Landing',
      route: '/ops',
    });
    expect(p.preserveFunction.length).toBeGreaterThan(0);
  });

  it('18. creative approval gate', () => {
    openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'p1',
      viewport: 'mobile',
      captureId: 'c1',
      pagePurpose: 'Ops',
      parentAuthorityLabel: 'Landing',
      route: '/ops',
    });
    const approved = approvePageCreativeDirection('ndxbook', 'p1', 'mobile');
    expect(approved?.status).toBe('APPROVED');
    expect(approved?.approvedAt).toBeTruthy();
  });

  it('19. post-build recapture attach', () => {
    openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'p1',
      viewport: 'mobile',
      captureId: 'before',
      pagePurpose: 'Ops',
      parentAuthorityLabel: 'Landing',
      route: '/ops',
    });
    const done = attachAfterCaptureToSession('ndxbook', 'p1', 'mobile', 'after');
    expect(done?.afterCaptureId).toBe('after');
    expect(done?.status).toBe('COMPLETE');
  });

  it('20. page family integration UI', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCaptureNowPanel.tsx')).toContain('CAPTURE NOW');
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain('PageCaptureNowPanel');
  });

  it('21. viewport-specific capture states', () => {
    savePageViewportCapture(
      buildPageViewportCapture({
        projectId: 'ndxbook',
        pageId: 'p1',
        viewport: 'mobile',
        captureId: 'm1',
        route: '/r',
        resolvedRuntimePath: '/r',
        imageRef: '/m.png',
      }),
    );
    expect(derivePageViewportCaptureStatus(getPageViewportCapture('ndxbook', 'p1', 'mobile'))).toBe('CAPTURE_READY');
    expect(derivePageViewportCaptureStatus(getPageViewportCapture('ndxbook', 'p1', 'desktop'))).toBe('NO_LIVE_CAPTURE');
  });

  it('22. outdated capture detection', () => {
    const c = buildPageViewportCapture({
      projectId: 'ndxbook',
      pageId: 'p1',
      viewport: 'mobile',
      captureId: 'old',
      route: '/r',
      resolvedRuntimePath: '/r',
      imageRef: '/m.png',
      capturedBuildVersion: 'v200',
    });
    expect(derivePageViewportCaptureStatus(c, { currentBuildVersion: P0_VR_CAPTURE_1_BUILD })).toBe('CAPTURE_OUTDATED');
  });

  it('23. legacy capture migration', () => {
    const m = migrateLegacyCaptureToViewportCapture({
      projectId: 'ndxbook',
      pageId: 'p1',
      screenId: 's1',
      route: '/r',
      resolvedRuntimePath: '/r',
      imageRef: '/legacy.png',
      capturedAt: '2026-01-01T00:00:00Z',
    });
    expect(m?.captureSource).toBe('OTHER');
  });

  it('24. batch capture demotion in wizard', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('CAPTURE MULTIPLE PAGES');
  });

  it('25. PageUpgradeNextAction', () => {
    const a = resolvePageUpgradeNextAction({
      projectId: 'ndxbook',
      pageId: 'p1',
      viewport: 'mobile',
      captureServiceAvailable: true,
    });
    expect(a.action).toBe('CAPTURE_THIS_PAGE');
    expect(a.label).toBe('CAPTURE NOW');
  });

  it('26. capture ready → upgrade action', () => {
    savePageViewportCapture(
      buildPageViewportCapture({
        projectId: 'ndxbook',
        pageId: 'p1',
        viewport: 'mobile',
        captureId: 'c1',
        route: '/r',
        resolvedRuntimePath: '/r',
        imageRef: '/x.png',
      }),
    );
    const a = resolvePageUpgradeNextAction({
      projectId: 'ndxbook',
      pageId: 'p1',
      viewport: 'mobile',
      captureServiceAvailable: true,
    });
    expect(a.label).toBe('UPGRADE THIS PAGE');
  });

  it('27. MORE capture advanced label', () => {
    expect(read('src/site00/components/designWorkspace/more/DesignMoreCapturePage.tsx')).toContain('CAPTURE MULTIPLE PAGES');
  });

  it('28. usePageMirror captureNow hook', () => {
    expect(read('src/site00/components/designWorkspace/usePageMirror.ts')).toContain('capture_current_page');
  });

  it('29. build version v272', () => {
    expect(P0_VR_CAPTURE_1_BUILD).toBe('v272');
  });

  it('30. derivative status chips DESIGN CAPTURE WIRING', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/DerivativeReviewCarousel.tsx')).toContain('DESIGN ·');
    expect(read('src/site00/components/designWorkspace/pageFamily/DerivativeReviewCarousel.tsx')).toContain('CAPTURE ·');
  });

  it('31. creative upgrade UI panel', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx')).toContain('CURRENT VS PROPOSED');
  });

  it('32. before/after verify flow', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx')).toContain('BEFORE / AFTER');
  });
});
