/**
 * P0.VR.CAPTURE.1R2 — Capture receipt + persistence + live preview binding.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_CAPTURE_1R2_BUILD,
  acquireCaptureNowLock,
  beginCaptureJobReceipt,
  bindCaptureCompletionToClientStore,
  completeCapturePipeline,
  deriveLivePageCaptureState,
  finalizeCaptureCurrentPage,
  latestUiStepFromMilestones,
  listPageViewportCaptureHistory,
  mapMilestoneToUiStep,
  planCaptureCurrentPage,
  pushMilestone,
  resetCaptureCurrentPageForTest,
  resetPageViewportCaptureStoreForTest,
  resolveCurrentPageViewportCapture,
  savePageViewportCapture,
  buildPageViewportCapture,
  getPageViewportCapture,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';
import { migrateHistoricalRootCapturePageId } from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyRootTarget.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.CAPTURE.1R2 — Capture receipt + live binding', () => {
  beforeEach(() => {
    resetCaptureCurrentPageForTest();
    resetPageViewportCaptureStoreForTest();
  });

  it('1. CaptureNowExecutionTrace module exists', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/captureReceipts.ts')).toContain(
      'CaptureNowExecutionTrace',
    );
  });

  it('2. CaptureJobReceipt with jobId', () => {
    const receipt = beginCaptureJobReceipt({
      jobId: 'capture_now_ndxbook_root_mobile_1',
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      route: '/projects/ndxbook',
      resolvedRuntimePath: '/projects/ndxbook',
    });
    expect(receipt.jobId).toContain('capture_now_');
    expect(receipt.milestones[0]?.milestone).toBe('JOB_CREATED');
  });

  it('3. one real job creation via planCaptureCurrentPage', () => {
    const plan = planCaptureCurrentPage({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      screenId: 'overview',
      route: '/projects/ndxbook',
      viewport: 'mobile',
    });
    expect(plan.jobId).toMatch(/^capture_now_/);
    expect(plan.singlePageJob).toBe(true);
  });

  it('4. usePageMirror stages capture progress while API runs', () => {
    const src = read('src/site00/components/designWorkspace/usePageMirror.ts');
    const start = src.indexOf('const captureNow = useCallback(');
    const end = src.indexOf('const refreshPage = useCallback(', start);
    const captureBlock = src.slice(start, end);
    expect(captureBlock).toContain('startCaptureProgressAnimation');
    expect(captureBlock).toContain('CAPTURE_CURRENT_PAGE_TIMEOUT_MS');
    expect(src).toContain('bindCaptureCompletionToClientStore');
    expect(src).toContain('latestUiStepFromMilestones');
  });

  it('4b. capture progress timing module spreads steps across server timeout', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/captureProgressTiming.ts')).toContain(
      'startCaptureProgressAnimation',
    );
    expect(read('src/site00/services/captureApiFetch.ts')).toContain('CAPTURE_CURRENT_PAGE_TIMEOUT_MS');
  });

  it('5. real milestone to UI step mapping', () => {
    expect(mapMilestoneToUiStep('PAGE_OPENING')).toBe('OPENING_PAGE');
    expect(mapMilestoneToUiStep('VIEWPORT_READY')).toBe('RENDERING_VIEWPORT');
    expect(mapMilestoneToUiStep('SCREENSHOT_CREATED')).toBe('TAKING_SCREENSHOT');
    expect(mapMilestoneToUiStep('CAPTURE_PERSISTED')).toBe('SAVING_CAPTURE');
  });

  it('6. page opened receipt in pipeline', () => {
    const trace = completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_test',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/snap.png',
    });
    expect(trace.completion?.milestones.some((m) => m.milestone === 'PAGE_OPENED')).toBe(true);
  });

  it('7. viewport ready receipt in pipeline', () => {
    const trace = completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_test',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/snap.png',
    });
    expect(trace.completion?.milestones.some((m) => m.milestone === 'VIEWPORT_READY')).toBe(true);
  });

  it('8. ScreenshotReceipt on success', () => {
    const trace = completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_test',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/snap.png',
    });
    expect(trace.screenshot?.status).toBe('CREATED');
    expect(trace.screenshot?.artifactRef).toBe('https://cdn.example.com/snap.png');
  });

  it('9. CaptureStorageReceipt success', () => {
    const trace = completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_test',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/snap.png',
    });
    expect(trace.storage?.status).toBe('SUCCESS');
  });

  it('10. storage failure stops at save', () => {
    const trace = completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_test',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: null,
      error: 'STORAGE_FAILED',
      errorCode: 'STORAGE_FAILED',
    });
    expect(trace.completion?.status).toBe('CAPTURE_FAILED');
    expect(trace.storage?.status).toBe('FAILED');
    expect(trace.completion?.milestones.some((m) => m.milestone === 'COMPLETE')).toBe(false);
  });

  it('11. PageViewportCapture persisted on success', () => {
    completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_test',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/snap.png',
    });
    const stored = getPageViewportCapture('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile');
    expect(stored?.status).toBe('CAPTURE_READY');
    expect(stored?.imageRef).toBe('https://cdn.example.com/snap.png');
  });

  it('12. current capture pointer via resolver', () => {
    savePageViewportCapture(
      buildPageViewportCapture({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        viewport: 'mobile',
        captureId: 'cap-current',
        route: '/projects/ndxbook',
        resolvedRuntimePath: '/projects/ndxbook',
        imageRef: '/a.png',
      }),
    );
    const current = resolveCurrentPageViewportCapture('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile');
    expect(current?.captureId).toBe('cap-current');
  });

  it('13. historical captures preserved', () => {
    completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'job-1',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/a.png',
      captureId: 'cap-1',
    });
    completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'job-2',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/b.png',
      captureId: 'cap-2',
    });
    const history = listPageViewportCaptureHistory('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile');
    expect(history.length).toBe(2);
    expect(getPageViewportCapture('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile')?.captureId).toBe('cap-2');
  });

  it('14. CaptureCompletionReceipt in finalize result', () => {
    const result = finalizeCaptureCurrentPage({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_test',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/snap.png',
    });
    expect(result.completion?.captureId).toBeTruthy();
    expect(result.imageRef).toBe('https://cdn.example.com/snap.png');
    expect(result.captureId).not.toBe(result.jobId);
  });

  it('15. bindCaptureCompletionToClientStore updates resolver', () => {
    const result = finalizeCaptureCurrentPage({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_bind',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/bind.png',
    });
    resetPageViewportCaptureStoreForTest();
    bindCaptureCompletionToClientStore(result.completion!);
    expect(resolveCurrentPageViewportCapture('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile')?.imageRef).toBe(
      'https://cdn.example.com/bind.png',
    );
  });

  it('16. usePageViewportCapture hook exists', () => {
    expect(read('src/site00/components/designWorkspace/usePageViewportCapture.ts')).toContain('useSyncExternalStore');
    expect(read('src/site00/components/designWorkspace/usePageViewportCapture.ts')).toContain(
      'resolveCurrentPageViewportCapture',
    );
  });

  it('17. PageCaptureNowPanel uses live capture state', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCaptureNowPanel.tsx');
    expect(panel).toContain('deriveLivePageCaptureState');
    expect(panel).toContain('usePageViewportCapture');
    expect(panel).not.toContain('getPageViewportCapture');
  });

  it('18. design authority separate from live preview source', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCaptureNowPanel.tsx');
    expect(panel).toContain('preview--authority');
    expect(panel).toContain('preview--live');
    expect(panel).toContain('authority.previewAssetRef');
  });

  it('19. READY state derivation', () => {
    savePageViewportCapture(
      buildPageViewportCapture({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        viewport: 'mobile',
        captureId: 'cap-ready',
        route: '/projects/ndxbook',
        resolvedRuntimePath: '/projects/ndxbook',
        imageRef: '/ready.png',
        capturedBuildVersion: P0_VR_CAPTURE_1R2_BUILD,
      }),
    );
    expect(
      deriveLivePageCaptureState({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        viewport: 'mobile',
        previewLoadSucceeded: true,
      }),
    ).toBe('READY');
  });

  it('20. CTA upgrade requires persisted capture + renderable previews', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCaptureNowPanel.tsx');
    expect(panel).toContain('UPGRADE THIS PAGE');
    expect(panel).toContain('shouldOfferPageUpgrade');
    expect(panel).toContain('resolvePageCapturePrimaryLabel');
    expect(panel).toContain('upgradeContract.upgradeAllowed');
  });

  it('21. authoritative success only — no fake timer in panel progress', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCaptureNowPanel.tsx')).not.toContain('setTimeout');
  });

  it('22. failure stage stop — no COMPLETE milestone on storage fail', () => {
    const trace = completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'fail-job',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: null,
      error: 'SCREENSHOT_FAILED',
      errorCode: 'SCREENSHOT_FAILED',
    });
    expect(trace.completion?.milestones.some((m) => m.milestone === 'COMPLETE')).toBe(false);
  });

  it('23. duplicate-tap guard still in captureCurrentPage', () => {
    expect(acquireCaptureNowLock('ndxbook', 'p1', 'mobile')).toBe(true);
    expect(acquireCaptureNowLock('ndxbook', 'p1', 'mobile')).toBe(false);
  });

  it('24. canonical root binding for NDXBOOK overview mobile', () => {
    const canonical = migrateHistoricalRootCapturePageId('ndxbook', 'ndxbook:/projects/ndxbook/overview');
    completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: canonical,
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
        captureSource: 'FOUNDER_CAPTURE_NOW',
        capturedBuildVersion: P0_VR_CAPTURE_1R2_BUILD,
      },
      jobId: 'ndxbook-root-mobile',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/ndxbook-mobile.png',
    });
    const stored = getPageViewportCapture('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile');
    expect(stored?.captureSource).toBe('FOUNDER_CAPTURE_NOW');
    expect(stored?.capturedBuildVersion).toBe(P0_VR_CAPTURE_1R2_BUILD);
  });

  it('25. alias route does not create duplicate history keys', () => {
    completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook/overview',
        screenId: 'overview',
        route: '/projects/ndxbook/overview',
        viewport: 'mobile',
      },
      jobId: 'alias-job',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: 'https://cdn.example.com/alias.png',
      captureId: 'cap-alias',
    });
    const history = listPageViewportCaptureHistory('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile');
    expect(history.length).toBe(1);
    expect(history[0]?.pageId).toBe('ndxbook:/projects/ndxbook');
  });

  it('26. build version v278', () => {
    expect(P0_VR_CAPTURE_1R2_BUILD).toBe('v278');
  });

  it('27. telemetry logging in usePageMirror', () => {
    const mirror = read('src/site00/components/designWorkspace/usePageMirror.ts');
    expect(mirror).toContain('logCaptureTelemetry');
    expect(mirror).toContain("'capture_button_clicked'");
    expect(mirror).toContain("'completion_receipt_received'");
  });

  it('28. latestUiStepFromMilestones for progress binding', () => {
    let milestones = pushMilestone([], 'JOB_CREATED');
    milestones = pushMilestone(milestones, 'CAPTURE_PERSISTED');
    expect(latestUiStepFromMilestones(milestones)).toBe('SAVING_CAPTURE');
  });

  it('29. CAPTURING live state while in flight', () => {
    expect(
      deriveLivePageCaptureState({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        viewport: 'mobile',
        isCapturing: true,
      }),
    ).toBe('CAPTURING');
  });

  it('30. PageFamilyWorkspace no batch preview fallback for live capture', () => {
    const ws = read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx');
    expect(ws).toContain('usePageViewportCapture');
    expect(ws).not.toMatch(/viewportCapture\?\.imageRef \?\? activeNode\.previewUrl/);
  });
});
