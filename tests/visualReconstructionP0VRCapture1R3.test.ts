/**
 * P0.VR.CAPTURE.1R3 — Image delivery + canonical asset ref resolution.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_CAPTURE_1R3_BUILD,
  buildImageDeliveryTrace,
  buildSupabasePublicObjectUrl,
  classifyAssetRef,
  derivePreviewHealthFromBrowser,
  evaluateDeliveryProbe,
  evaluateRenderableAuthorityContract,
  isInvalidPersistedAssetRef,
  isPersistableCaptureUrl,
  isValidImageMime,
  normalizeLegacyAssetRef,
  previewHealthLabel,
  probeAssetDelivery,
  repairAssetRef,
  resolveAssetRenderableUrl,
  resolveStoragePublicUrl,
} from '../shared/site00-studio-world-production/assetDelivery/index.js';
import {
  computeArtifactChecksum,
  validateImageArtifactBuffer,
} from '../shared/site00-studio-world-production/assetDelivery/imageArtifactValidation.js';
import {
  completeCapturePipeline,
  deriveLivePageCaptureState,
  P0_VR_CAPTURE_1R2_BUILD,
  resetPageViewportCaptureStoreForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';
import {
  resolveDesignAuthorityPreview,
  resolvePageViewportAuthority,
} from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageViewportAuthority.js';
import { buildImplementationSnapshotPublicUrl } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotStoragePaths.js';
import { ensureNdxbookPilotRegistered } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.CAPTURE.1R3 — Asset delivery', () => {
  beforeEach(() => {
    resetPageViewportCaptureStoreForTest();
    ensureNdxbookPilotRegistered();
  });

  it('1. assetDelivery module exists', () => {
    expect(read('shared/site00-studio-world-production/assetDelivery/index.ts')).toContain('assetDelivery');
  });

  it('2. ImageDeliveryTrace fields', () => {
    const trace = buildImageDeliveryTrace({
      sourceType: 'DESIGN_AUTHORITY',
      sourceId: 'ndxbook:overview:mobile',
      ref: '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
    });
    expect(trace.sourceType).toBe('DESIGN_AUTHORITY');
    expect(trace.canonicalRef.provider).toBe('PUBLIC_SITE');
    expect(trace.resolvedBrowserImageUrl).toContain('/visual-references/founder/ndxbook/');
  });

  it('3. zero-byte artifact guard', () => {
    const receipt = validateImageArtifactBuffer({
      artifactId: 'art-1',
      sourceType: 'LIVE_CAPTURE',
      sourceId: 'cap-1',
      buffer: Buffer.alloc(0),
    });
    expect(receipt.status).toBe('ARTIFACT_EMPTY');
  });

  it('4. invalid image artifact guard', () => {
    const receipt = validateImageArtifactBuffer({
      artifactId: 'art-2',
      sourceType: 'LIVE_CAPTURE',
      sourceId: 'cap-2',
      buffer: Buffer.from('not-an-image'),
    });
    expect(receipt.status).toBe('ARTIFACT_INVALID');
  });

  it('5. valid PNG artifact', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const receipt = validateImageArtifactBuffer({
      artifactId: 'art-3',
      sourceType: 'LIVE_CAPTURE',
      sourceId: 'cap-3',
      buffer: png,
    });
    expect(receipt.status).toBe('VALID');
    expect(receipt.checksum).toBeTruthy();
  });

  it('6. CanonicalAssetRef normalization', () => {
    const ref = normalizeLegacyAssetRef('/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png');
    expect(ref?.provider).toBe('PUBLIC_SITE');
    expect(ref?.assetRefVersion).toBe('v2');
  });

  it('7. Supabase storage path resolves to public URL', () => {
    const url = buildSupabasePublicObjectUrl('studio-world/design/implementation-snapshots/ndxbook/overview/mobile/x.webp');
    expect(url).toContain('/storage/v1/object/public/live-preview/');
  });

  it('8. signed URL stored as absolute ref', () => {
    const signed = 'https://example.supabase.co/storage/v1/object/sign/live-preview/site00/x.webp?token=abc';
    const resolved = resolveAssetRenderableUrl(signed);
    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.authMode).toBe('SIGNED');
  });

  it('9. public site path resolves same-origin relative', () => {
    const resolved = resolveAssetRenderableUrl('/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png');
    expect(resolved.url).toBe('/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png');
  });

  it('10. HTTP 200 + image mime = renderable', () => {
    const probe = evaluateDeliveryProbe({ httpStatus: 200, mime: 'image/png', size: 1024, urlResolved: true });
    expect(probe.renderable).toBe(true);
  });

  it('11. MIME invalid on HTTP 200', () => {
    const probe = evaluateDeliveryProbe({ httpStatus: 200, mime: 'text/html', size: 512, urlResolved: true });
    expect(probe.error).toBe('MIME_INVALID');
  });

  it('12. LivePageCaptureState SAVED vs READY', () => {
    expect(
      deriveLivePageCaptureState({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        viewport: 'mobile',
        boundCapture: {
          pageId: 'ndxbook:/projects/ndxbook',
          projectId: 'ndxbook',
          viewport: 'mobile',
          captureId: 'cap-1',
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
    ).toBe('SAVED');

    expect(
      deriveLivePageCaptureState({
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        viewport: 'mobile',
        previewLoadSucceeded: true,
        boundCapture: {
          pageId: 'ndxbook:/projects/ndxbook',
          projectId: 'ndxbook',
          viewport: 'mobile',
          captureId: 'cap-1',
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
    ).toBe('READY');
  });

  it('13. PreviewHealth pass after browser load', () => {
    const health = derivePreviewHealthFromBrowser({
      ref: '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
      browserLoaded: true,
    });
    expect(health.status).toBe('PASS');
    expect(previewHealthLabel(health)).toBe('PREVIEW READY ✓');
  });

  it('14. RenderableAuthorityContract blocks upgrade when preview fails', () => {
    const contract = evaluateRenderableAuthorityContract({
      approvalStatus: 'APPROVED',
      captureStatus: 'SAVED',
      designAuthorityPreview: {
        assetExists: true,
        urlResolved: true,
        requestSucceeded: false,
        mimeValid: false,
        browserLoaded: false,
        status: 'FAIL',
        errorCode: 'IMAGE_DECODE_FAILED',
        resolvedUrl: '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
      },
      liveCapturePreview: {
        assetExists: true,
        urlResolved: true,
        requestSucceeded: true,
        mimeValid: true,
        browserLoaded: true,
        status: 'PASS',
        errorCode: null,
        resolvedUrl: 'https://example.test/live.webp',
      },
    });
    expect(contract.upgradeAllowed).toBe(false);
    expect(contract.blockReason).toBe('DESIGN AUTHORITY PREVIEW REQUIRED');
  });

  it('15. shared AssetRenderableUrlResolver for design authority', () => {
    const preview = resolveDesignAuthorityPreview({
      referencePath: '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
      authorityStatus: 'APPROVED',
    });
    expect(preview.previewUrl).toContain('/visual-references/founder/ndxbook/');
    expect(preview.assetRef).toContain('/visual-references/founder/ndxbook/');
  });

  it('16. NDX overview authority resolves + public asset exists', () => {
    const authority = resolvePageViewportAuthority({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      screenId: 'overview',
      viewport: 'mobile',
      isRoot: true,
    });
    expect(authority.authorityStatus).toBe('APPROVED');
    expect(authority.previewAssetRef).toContain('mobile-overview-fullscreen-reference-hifi.png');
    expect(
      existsSync(
        join(ROOT, 'public/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png'),
      ),
    ).toBe(true);
  });

  it('17. legacy relative storage path repair', () => {
    const repaired = repairAssetRef('/studio-world/design/implementation-snapshots/x.webp', {
      storageObjectExists: true,
    });
    expect(repaired.ref?.provider).toBe('SUPABASE');
    expect(repaired.repaired).toBe(true);
  });

  it('18. blob URL guard', () => {
    expect(isInvalidPersistedAssetRef('blob:https://site00.com/abc')).toBe(true);
    expect(isPersistableCaptureUrl('blob:abc')).toBe(false);
  });

  it('19. temp path guard', () => {
    expect(isInvalidPersistedAssetRef('/tmp/snap.png')).toBe(true);
  });

  it('20. blob URL fails capture pipeline (non-persistable ref)', () => {
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
      screenshotUrl: 'blob:https://site00.com/dead-beef',
    });
    expect(trace.completion.status).toBe('CAPTURE_FAILED');
    expect(trace.completion.errorCode).toBe('PUBLIC_URL_INVALID');
  });

  it('20b. legacy bare storage path is repaired to Supabase public URL', () => {
    const trace = completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_repair',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: '/studio-world/design/implementation-snapshots/ndxbook/overview/mobile/x.webp',
    });
    expect(trace.completion.status).toBe('CAPTURE_READY');
    expect(trace.completion.imageRef).toContain('/storage/v1/object/public/');
  });

  it('21. valid Supabase URL passes capture pipeline', () => {
    const url = resolveStoragePublicUrl('studio-world/design/implementation-snapshots/ndxbook/overview/mobile/x.webp');
    const trace = completeCapturePipeline({
      input: {
        projectId: 'ndxbook',
        pageId: 'ndxbook:/projects/ndxbook',
        screenId: 'overview',
        route: '/projects/ndxbook',
        viewport: 'mobile',
      },
      jobId: 'capture_now_test_ok',
      resolvedRuntimePath: '/projects/ndxbook',
      screenshotUrl: url,
    });
    expect(trace.completion.status).toBe('CAPTURE_READY');
    expect(trace.completion.imageRef).toBe(url);
  });

  it('22. implementation snapshot public URL uses Supabase not bare slash path', () => {
    const url = buildImplementationSnapshotPublicUrl('studio-world/design/implementation-snapshots/ndxbook/overview/mobile/x.webp');
    expect(url).toContain('/storage/v1/object/public/');
    expect(url.startsWith('/studio-world/')).toBe(false);
  });

  it('23. DesignAssetPreview component exists with onLoad/onError', () => {
    const src = read('src/site00/components/designWorkspace/shared/DesignAssetPreview.tsx');
    expect(src).toContain('onLoad');
    expect(src).toContain('onError');
    expect(src).toContain('RETRY PREVIEW');
  });

  it('24. PageCaptureNowPanel uses shared preview + upgrade gate', () => {
    const src = read('src/site00/components/designWorkspace/pageFamily/PageCaptureNowPanel.tsx');
    expect(src).toContain('DesignAssetPreview');
    expect(src).toContain('evaluateRenderableAuthorityContract');
    expect(src).toContain('upgradeContract.upgradeAllowed');
  });

  it('25. build constant v279', () => {
    expect(P0_VR_CAPTURE_1R3_BUILD).toBe('v279');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/constants.ts')).toContain(
      'P0_VR_CAPTURE_1R3_BUILD',
    );
  });

  it('26. shared root cause — both use AssetRenderableUrlResolver', () => {
    const authorityPath = '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png';
    const livePath = resolveStoragePublicUrl('studio-world/design/implementation-snapshots/ndxbook/overview/mobile/x.webp');
    expect(resolveAssetRenderableUrl(authorityPath).provider).toBe('PUBLIC_SITE');
    expect(resolveAssetRenderableUrl(livePath).provider).toBe('ABSOLUTE_URL');
    expect(classifyAssetRef(authorityPath)).toBe('PUBLIC_SITE');
  });

  it('27. checksum helper', () => {
    expect(computeArtifactChecksum(Buffer.from('abc'))).toHaveLength(16);
  });

  it('28. isValidImageMime rejects html', () => {
    expect(isValidImageMime('text/html')).toBe(false);
    expect(isValidImageMime('image/webp')).toBe(true);
  });

  it('29. classifyAssetRef absolute URL', () => {
    expect(classifyAssetRef('https://cdn.example.com/a.png')).toBe('ABSOLUTE_URL');
  });

  it('30. probeAssetDelivery vitest fetch mock', async () => {
    const fetchMock: typeof fetch = async () =>
      ({
        status: 200,
        headers: { get: (key: string) => (key === 'content-type' ? 'image/png' : key === 'content-length' ? '100' : null) },
      }) as Response;
    const probe = await probeAssetDelivery('/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png', fetchMock);
    expect(probe.renderable).toBe(true);
  });
});
