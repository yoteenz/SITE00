/**
 * P0.VR.AUTH.1 — Design authority replacement + preview health lifecycle.
 */

import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import {
  PREVIEW_STATIC_IMAGE_TIMEOUT_MS,
  appendCacheBustQuery,
  derivePreviewHealthFromBrowser,
  designAuthorityBlockReasonFromLifecycle,
  evaluateRenderableAuthorityContract,
  mapLifecycleToPreviewHealthStatus,
  markPreviewHealthTimeout,
  startPreviewHealthLoading,
} from '../shared/site00-studio-world-production/assetDelivery/index.js';
import {
  approveDesignAuthorityReplacement,
  beginReplaceDesignAuthorityUpload,
  getCurrentDesignAuthorityVersion,
  listDesignAuthorityApprovalReceipts,
  listDesignAuthoritySupersessionReceipts,
  resetDesignAuthorityReceiptsForTest,
  resetDesignAuthorityVersionsForTest,
  resolveCurrentDesignAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/index.js';
import { clearCurrentAuthorityPointersForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/currentAuthorityPointer.js';
import { syncAllFounderAuthorityVersionsForProject } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/syncFounderAuthorityRegistry.js';
import { ensureNdxbookPilotRegistered, resetNdxPilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { clearCanonicalRegistryForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/canonicalReferenceRegistry.js';
import { clearCanonicalRegistryStorageForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/canonicalReferencePersistence.js';
import { resolvePageViewportAuthority } from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageViewportAuthority.js';

describe('P0.VR.AUTH.1 — authority + preview lifecycle', () => {
  beforeEach(() => {
    resetDesignAuthorityVersionsForTest();
    resetDesignAuthorityReceiptsForTest();
    clearCurrentAuthorityPointersForTest();
    clearCanonicalRegistryForTest();
    resetNdxPilotForTest();
    clearCanonicalRegistryStorageForTest('ndxbook');
    ensureNdxbookPilotRegistered();
  });

  it('PreviewHealthLifecycle maps LOADING to UNKNOWN gate status', () => {
    expect(mapLifecycleToPreviewHealthStatus('LOADING')).toBe('UNKNOWN');
    expect(mapLifecycleToPreviewHealthStatus('PASS')).toBe('PASS');
    expect(mapLifecycleToPreviewHealthStatus('TIMEOUT')).toBe('FAIL');
  });

  it('design authority block reasons distinguish loading vs fail vs timeout', () => {
    expect(designAuthorityBlockReasonFromLifecycle('LOADING')).toBe('DESIGN AUTHORITY PREVIEW LOADING');
    expect(designAuthorityBlockReasonFromLifecycle('FAIL')).toBe('DESIGN AUTHORITY PREVIEW FAILED');
    expect(designAuthorityBlockReasonFromLifecycle('TIMEOUT')).toBe('DESIGN AUTHORITY PREVIEW TIMED OUT');
    expect(designAuthorityBlockReasonFromLifecycle('PASS')).toBeNull();
  });

  it('derivePreviewHealthFromBrowser never treats TIMEOUT as PASS', () => {
    const health = derivePreviewHealthFromBrowser({
      ref: '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
      lifecycle: 'TIMEOUT',
    });
    expect(health.status).toBe('FAIL');
    expect(health.lifecycle).toBe('TIMEOUT');
  });

  it('approve & replace creates version, receipts, and supersedes old', async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([png], 'ref.png', { type: 'image/png' });
    const ctx = {
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      screenId: 'overview',
      route: '/projects/ndxbook',
      viewport: 'mobile' as const,
      displayName: 'NDXBOOK OVERVIEW',
    };
    const firstDraft = await beginReplaceDesignAuthorityUpload(ctx, file);
    expect(firstDraft.ok).toBe(true);
    if (!firstDraft.ok) return;
    approveDesignAuthorityReplacement(firstDraft.draft, {
      storagePath: 'site00/visual-references/founder/ndxbook/page-authority/overview-mobile-v2.webp',
      publicUrl: 'https://example.test/storage/v1/object/public/live-preview/site00/visual-references/founder/ndxbook/page-authority/overview-mobile-v2.webp',
      byteSize: 12000,
    });

    const secondDraft = await beginReplaceDesignAuthorityUpload(ctx, file);
    if (!secondDraft.ok) return;
    const second = approveDesignAuthorityReplacement(secondDraft.draft, {
      storagePath: 'site00/visual-references/founder/ndxbook/page-authority/overview-mobile-v3.webp',
      publicUrl: 'https://example.test/storage/v1/object/public/live-preview/site00/visual-references/founder/ndxbook/page-authority/overview-mobile-v3.webp',
      byteSize: 13000,
    });
    expect(second.ok).toBe(true);

    const current = getCurrentDesignAuthorityVersion('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile');
    expect(current?.assetRef).toContain('overview-mobile-v3.webp');
    expect(listDesignAuthoritySupersessionReceipts().length).toBeGreaterThan(0);
    expect(listDesignAuthorityApprovalReceipts('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile').length).toBe(2);
  });

  it('founder current authority wins over pilot seed path', async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([png], 'ref.png', { type: 'image/png' });
    const ctx = {
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      screenId: 'overview',
      route: '/projects/ndxbook',
      viewport: 'mobile' as const,
      displayName: 'NDXBOOK OVERVIEW',
    };
    const draft = await beginReplaceDesignAuthorityUpload(ctx, file);
    if (!draft.ok) return;
    approveDesignAuthorityReplacement(draft.draft, {
      storagePath: 'site00/visual-references/founder/ndxbook/page-authority/founder-current.webp',
      publicUrl: 'https://example.test/storage/v1/object/public/live-preview/site00/visual-references/founder/ndxbook/page-authority/founder-current.webp',
      byteSize: 90000,
    });

    syncAllFounderAuthorityVersionsForProject('ndxbook');
    resetNdxPilotForTest();
    ensureNdxbookPilotRegistered();

    const resolved = resolveCurrentDesignAuthority({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      screenId: 'overview',
      viewport: 'mobile',
    });
    expect(resolved.previewAssetRef).toContain('founder-current.webp');
    expect(resolved.isStale).toBe(false);
    expect(resolved.isCurrent).toBe(true);
  });

  it('gate requires PASS not UNKNOWN for design authority', () => {
    const contract = evaluateRenderableAuthorityContract({
      approvalStatus: 'APPROVED',
      captureStatus: 'READY',
      designAuthorityPreview: derivePreviewHealthFromBrowser({
        ref: '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
        lifecycle: 'LOADING',
      }),
      liveCapturePreview: derivePreviewHealthFromBrowser({
        ref: 'https://example.test/cap.webp',
        lifecycle: 'PASS',
      }),
      pageIdentityMatch: true,
      routeMatch: true,
      viewportMatch: true,
    });
    expect(contract.upgradeAllowed).toBe(false);
    expect(contract.blockReason).toBe('DESIGN AUTHORITY PREVIEW LOADING');
  });

  it('cache bust helper appends version query', () => {
    expect(appendCacheBustQuery('/visual-references/x.png', 'authv-1')).toContain('v=authv-1');
  });

  it('preview timeout constant is bounded', () => {
    expect(PREVIEW_STATIC_IMAGE_TIMEOUT_MS).toBeGreaterThanOrEqual(8000);
    expect(PREVIEW_STATIC_IMAGE_TIMEOUT_MS).toBeLessThanOrEqual(15000);
  });

  it('approve tolerates invalid viewport class on draft context (Safari width crash)', async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([png], 'ref.png', { type: 'image/png' });
    const draft = await beginReplaceDesignAuthorityUpload(
      {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
        displayName: 'NDXBOOK OVERVIEW',
      },
      file,
    );
    if (!draft.ok) return;
    const broken = {
      ...draft.draft,
      context: { ...draft.draft.context, viewport: undefined as unknown as 'mobile' },
    };
    const result = approveDesignAuthorityReplacement(broken);
    expect(result.ok).toBe(true);
  });

  it('mobile replacement does not change desktop authority', async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([png], 'ref.png', { type: 'image/png' });
    const draft = await beginReplaceDesignAuthorityUpload(
      {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
        displayName: 'NDXBOOK OVERVIEW',
      },
      file,
    );
    if (!draft.ok) return;
    approveDesignAuthorityReplacement(draft.draft);
    expect(getCurrentDesignAuthorityVersion('ndxbook', 'ndxbook:/projects/ndxbook', 'desktop')).toBeNull();
    expect(getCurrentDesignAuthorityVersion('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile')?.status).toBe(
      'CURRENT',
    );
  });
});

describe('P0.VR.AUTH.1 — preview lifecycle timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('markPreviewHealthTimeout transitions from LOADING to TIMEOUT', () => {
    const loading = startPreviewHealthLoading(
      { state: 'IDLE', retryCount: 0, startedAt: null, resolvedUrl: null },
      '/visual-references/x.png',
    );
    expect(loading.state).toBe('LOADING');
    const timedOut = markPreviewHealthTimeout(loading);
    expect(timedOut.state).toBe('TIMEOUT');
  });
});
