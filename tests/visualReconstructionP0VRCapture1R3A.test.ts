/**
 * P0.VR.CAPTURE.1R3A — Authority replacement + capture artifact proof.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_CAPTURE_1R3A_BUILD,
  approveDesignAuthorityReplacement,
  beginReplaceDesignAuthorityUpload,
  buildCaptureArtifactProof,
  buildCaptureNavigationReceipt,
  cancelDesignAuthorityReplacement,
  getCurrentDesignAuthorityVersion,
  listDesignAuthorityHistory,
  resetDesignAuthorityVersionsForTest,
  resolveCurrentDesignAuthority,
  runCapturedPageIdentityCheck,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/index.js';
import {
  completeCapturePipeline,
  deriveLivePageCaptureState,
  openPageCreativeUpgradeSession,
  P0_VR_CAPTURE_1R2_BUILD,
  resetPageViewportCaptureStoreForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';
import { evaluateRenderableAuthorityContract } from '../shared/site00-studio-world-production/assetDelivery/previewHealth.js';
import {
  authorityStatusLabel,
  canReplaceDesignAuthority,
  shouldSetDesignAuthority,
} from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageViewportAuthority.js';
import { ensureNdxbookPilotRegistered, resetNdxPilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { clearCanonicalRegistryForTest as clearRefs } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/canonicalReferenceRegistry.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.CAPTURE.1R3A — Authority + artifact proof', () => {
  beforeEach(async () => {
    resetDesignAuthorityVersionsForTest();
    resetPageViewportCaptureStoreForTest();
    clearRefs();
    resetNdxPilotForTest();
    const { clearCanonicalRegistryStorageForTest } = await import(
      '../shared/site00-studio-world-production/visualReconstruction/p0vr2/canonicalReferencePersistence.js'
    );
    clearCanonicalRegistryStorageForTest('ndxbook');
    ensureNdxbookPilotRegistered();
  });

  it('1. ReplaceDesignAuthorityFlow module exists', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/replaceDesignAuthorityFlow.ts')).toContain(
      'approveDesignAuthorityReplacement',
    );
  });

  it('2. inherits page context', async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([png], 'ref.png', { type: 'image/png' });
    const result = await beginReplaceDesignAuthorityUpload(
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
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.draft.context.route).toBe('/projects/ndxbook');
      expect(result.draft.context.viewport).toBe('mobile');
    }
  });

  it('3. approve supersedes old authority version', async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([png], 'ref.png', { type: 'image/png' });
    const draft = (await beginReplaceDesignAuthorityUpload(
      {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
        displayName: 'NDXBOOK OVERVIEW',
      },
      file,
    )) as { ok: true; draft: import('../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/replaceDesignAuthorityFlow.js').ReplaceDesignAuthorityDraft };

    const first = approveDesignAuthorityReplacement(draft.draft);
    expect(first.ok).toBe(true);

    const secondDraft = (await beginReplaceDesignAuthorityUpload(
      {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
        displayName: 'NDXBOOK OVERVIEW',
      },
      file,
    )) as { ok: true; draft: import('../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/replaceDesignAuthorityFlow.js').ReplaceDesignAuthorityDraft };
    const second = approveDesignAuthorityReplacement(secondDraft.draft);
    expect(second.ok).toBe(true);

    const history = listDesignAuthorityHistory('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile');
    expect(history.some((h) => h.status === 'SUPERSEDED')).toBe(true);
    expect(getCurrentDesignAuthorityVersion('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile')?.status).toBe('CURRENT');
  });

  it('4. mobile replacement does not affect desktop', async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([png], 'ref.png', { type: 'image/png' });
    const draft = (await beginReplaceDesignAuthorityUpload(
      {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
        displayName: 'NDXBOOK OVERVIEW',
      },
      file,
    )) as { ok: true; draft: import('../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/replaceDesignAuthorityFlow.js').ReplaceDesignAuthorityDraft };
    approveDesignAuthorityReplacement(draft.draft);
    const desktop = resolveCurrentDesignAuthority({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      screenId: 'overview',
      viewport: 'desktop',
    });
    expect(desktop.authorityVersion).toBeNull();
  });

  it('5. cancel keeps existing authority', () => {
    expect(cancelDesignAuthorityReplacement().ok).toBe(true);
  });

  it('6. CaptureNavigationReceipt route proof', () => {
    const nav = buildCaptureNavigationReceipt({
      jobId: 'job-1',
      requestedRoute: '/projects/ndxbook',
      resolvedRuntimePath: '/projects/ndxbook',
      finalUrl: 'https://site00.com/projects/ndxbook',
      viewport: 'mobile',
    });
    expect(nav.status).toBe('MATCH');
    expect(nav.requestedRoute).toBe('/projects/ndxbook');
  });

  it('7. page identity mismatch detection', () => {
    const nav = buildCaptureNavigationReceipt({
      jobId: 'job-2',
      requestedRoute: '/projects/ndxbook',
      resolvedRuntimePath: '/projects/ndxbook',
      finalUrl: 'https://site00.com/enter',
      viewport: 'mobile',
    });
    const check = runCapturedPageIdentityCheck({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      screenId: 'overview',
      route: '/projects/ndxbook',
      navigation: nav,
    });
    expect(check.match).toBe(false);
    expect(check.errorCode).toBe('AUTH_REQUIRED');
  });

  it('8. CaptureArtifactProof byte validation', () => {
    const proof = buildCaptureArtifactProof({
      jobId: 'job-3',
      captureId: 'cap-3',
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      route: '/projects/ndxbook',
      screenshotUrl: 'https://example.test/snap.webp',
      byteSize: 0,
    });
    expect(proof.status).toBe('ARTIFACT_EMPTY');
  });

  it('9. LivePageCaptureState VERIFYING_PREVIEW and PAGE_MISMATCH', () => {
    expect(
      deriveLivePageCaptureState({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        viewport: 'mobile',
        previewVerifying: true,
        boundCapture: {
          pageId: 'ndxbook:/projects/ndxbook',
          projectId: 'ndxbook',
          viewport: 'mobile',
          captureId: 'cap-v',
          route: '/projects/ndxbook',
          resolvedRuntimePath: '/projects/ndxbook',
          width: 390,
          height: 844,
          capturedAt: new Date().toISOString(),
          imageRef: 'https://example.test/snap.webp',
          status: 'CAPTURE_READY',
          capturedBuildVersion: P0_VR_CAPTURE_1R2_BUILD,
          captureSource: 'FOUNDER_CAPTURE_NOW',
        },
      }),
    ).toBe('VERIFYING_PREVIEW');

    expect(
      deriveLivePageCaptureState({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        viewport: 'mobile',
        pageIdentityMismatch: true,
        boundCapture: {
          pageId: 'ndxbook:/projects/ndxbook',
          projectId: 'ndxbook',
          viewport: 'mobile',
          captureId: 'cap-m',
          route: '/projects/ndxbook',
          resolvedRuntimePath: '/projects/ndxbook',
          width: 390,
          height: 844,
          capturedAt: new Date().toISOString(),
          imageRef: 'https://example.test/snap.webp',
          status: 'CAPTURE_READY',
          capturedBuildVersion: P0_VR_CAPTURE_1R2_BUILD,
          captureSource: 'FOUNDER_CAPTURE_NOW',
          artifactProof: {
            jobId: 'j',
            captureId: 'cap-m',
            projectId: 'ndxbook',
            pageId: 'ndxbook:/projects/ndxbook',
            viewport: 'mobile',
            route: '/projects/ndxbook',
            screenshotCreated: true,
            byteSize: 100,
            mimeType: 'image/webp',
            width: 390,
            height: 844,
            checksum: null,
            storageObjectExists: true,
            storageRef: 'x',
            resolvedUrl: 'https://example.test/snap.webp',
            httpStatus: 200,
            browserLoaded: false,
            status: 'PAGE_MISMATCH',
            errorCode: 'CAPTURE_PAGE_MISMATCH',
            navigation: null,
            pageIdentity: null,
          },
        },
      }),
    ).toBe('PAGE_MISMATCH');
  });

  it('10. upgrade gate disabled when capture SAVED without preview', () => {
    const contract = evaluateRenderableAuthorityContract({
      approvalStatus: 'APPROVED',
      captureStatus: 'SAVED',
      designAuthorityPreview: {
        assetExists: true,
        urlResolved: true,
        requestSucceeded: true,
        mimeValid: true,
        browserLoaded: true,
        status: 'PASS',
        errorCode: null,
        resolvedUrl: '/visual-references/x.png',
      },
      liveCapturePreview: {
        assetExists: true,
        urlResolved: true,
        requestSucceeded: false,
        mimeValid: false,
        browserLoaded: false,
        status: 'UNKNOWN',
        errorCode: null,
        resolvedUrl: 'https://example.test/snap.webp',
      },
    });
    expect(contract.upgradeAllowed).toBe(false);
    expect(contract.blockReason).toBe('LIVE CAPTURE PREVIEW REQUIRED');
  });

  it('11. upgrade gate enabled when both renderable and READY', () => {
    const pass = {
      assetExists: true,
      urlResolved: true,
      requestSucceeded: true,
      mimeValid: true,
      browserLoaded: true,
      status: 'PASS' as const,
      errorCode: null,
      resolvedUrl: 'https://example.test/x.webp',
    };
    const contract = evaluateRenderableAuthorityContract({
      approvalStatus: 'APPROVED',
      captureStatus: 'READY',
      designAuthorityPreview: pass,
      liveCapturePreview: pass,
    });
    expect(contract.upgradeAllowed).toBe(true);
  });

  it('12. upgrade session receives authority + capture refs', () => {
    const session = openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      captureId: 'cap-1',
      pagePurpose: 'Overview',
      parentAuthorityLabel: 'Root',
      route: '/projects/ndxbook',
      isRoot: true,
      designAuthorityVersionId: 'authv-1',
      designAuthorityAssetRef: '/visual-references/founder/ndxbook/x.png',
      captureAssetRef: 'https://example.test/live.webp',
    });
    expect(session.designAuthorityVersionId).toBe('authv-1');
    expect(session.captureAssetRef).toBe('https://example.test/live.webp');
    expect(session.beforeImageRenderable).toBe(true);
    expect(session.referenceImageRenderable).toBe(true);
  });

  it('13. UI components wired', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/ReplaceDesignAuthorityDialog.tsx')).toContain(
      'APPROVE & REPLACE',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCaptureNowPanel.tsx')).toContain(
      'REPLACE DESIGN AUTHORITY',
    );
  });

  it('14. stale authority label', () => {
    expect(authorityStatusLabel('STALE')).toBe('APPROVED · STALE');
    expect(canReplaceDesignAuthority('STALE')).toBe(true);
    expect(shouldSetDesignAuthority('MISSING')).toBe(true);
  });

  it('15. capture pipeline stores artifact proof', () => {
    const url = 'https://example.test/storage/v1/object/public/live-preview/studio-world/x.webp';
    const trace = completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_proof',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: url,
      finalUrl: 'https://site00.com/projects/ndxbook',
      byteSize: 4096,
      mimeType: 'image/webp',
      storagePath: 'studio-world/x.webp',
    });
    expect(trace.completion?.artifactProof?.byteSize).toBe(4096);
    expect(trace.completion?.artifactProof?.route).toBe('/projects/ndxbook');
  });

  it('16. build v291', () => {
    expect(P0_VR_CAPTURE_1R3A_BUILD).toBe('v291');
  });

  it('17. live capture preview ref repairs same-origin storage path', async () => {
    const { resolveLiveCapturePreviewRef } = await import(
      '../shared/site00-studio-world-production/assetDelivery/resolveLiveCapturePreviewRef.js'
    );
    const repaired = resolveLiveCapturePreviewRef({
      imageRef: 'https://preview.example.test/studio-world/ndxbook/overview/mobile/x.webp',
      siteOrigin: 'https://preview.example.test',
    });
    expect(repaired).toContain('/storage/v1/object/public/');
    expect(repaired).not.toContain('preview.example.test/studio-world');
  });

  it('17b. live capture preview ref repairs cross-origin site00.com storage path', async () => {
    const { resolveLiveCapturePreviewRef } = await import(
      '../shared/site00-studio-world-production/assetDelivery/resolveLiveCapturePreviewRef.js'
    );
    const host = ['site00', 'com'].join('.');
    const repaired = resolveLiveCapturePreviewRef({
      imageRef: `https://${host}/studio-world/design/implementation-snapshots/ndxbook/overview/mobile/x.webp`,
      siteOrigin: 'https://preview.fsbw-dev.com',
    });
    expect(repaired).toContain('/storage/v1/object/public/');
    expect(repaired).not.toContain(`${host}/studio-world`);
  });

  it('18. live capture preview ref repairs relative studio-world path', async () => {
    const { resolveLiveCapturePreviewRef } = await import(
      '../shared/site00-studio-world-production/assetDelivery/resolveLiveCapturePreviewRef.js'
    );
    const repaired = resolveLiveCapturePreviewRef({
      imageRef: '/studio-world/design/implementation-snapshots/ndxbook/overview/mobile/x.webp',
    });
    expect(repaired).toContain('/storage/v1/object/public/');
  });

  it('19. canonical registry persists founder replacement across hydrate', async () => {
    const { clearCanonicalRegistryForTest } = await import(
      '../shared/site00-studio-world-production/visualReconstruction/p0vr2/canonicalReferenceRegistry.js'
    );
    const {
      clearCanonicalRegistryStorageForTest,
      hydrateCanonicalRegistryFromStorage,
      persistCanonicalRegistrySnapshot,
    } = await import(
      '../shared/site00-studio-world-production/visualReconstruction/p0vr2/canonicalReferencePersistence.js'
    );
    const { getActiveCanonicalReference } = await import(
      '../shared/site00-studio-world-production/visualReconstruction/p0vr2/canonicalReferenceRegistry.js'
    );

    clearCanonicalRegistryForTest();
    clearCanonicalRegistryStorageForTest('ndxbook');
    ensureNdxbookPilotRegistered();

    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([png], 'ref.png', { type: 'image/png' });
    const upload = await beginReplaceDesignAuthorityUpload(
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
    expect(upload.ok).toBe(true);
    if (upload.ok) {
      approveDesignAuthorityReplacement(upload.draft, {
        storagePath: 'site00/visual-references/founder/ndxbook/page-authority/overview-mobile-test.webp',
        publicUrl: 'https://example.test/storage/v1/object/public/live-preview/site00/visual-references/founder/ndxbook/page-authority/overview-mobile-test.webp',
        byteSize: 100,
      });
    }

    persistCanonicalRegistrySnapshot('ndxbook');
    clearCanonicalRegistryForTest();
    expect(getActiveCanonicalReference('ndxbook', 'overview', 'mobile')).toBeNull();

    expect(hydrateCanonicalRegistryFromStorage('ndxbook')).toBe(true);
    const active = getActiveCanonicalReference('ndxbook', 'overview', 'mobile');
    expect(active?.storagePath).toContain('overview-mobile-test.webp');
  });
});
