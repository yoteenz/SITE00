/**
 * Twin V3 authority gallery — prototype URL repair + img src resolution
 */

import { describe, expect, it } from 'vitest';
import {
  createDesignPageAuthorityReviewSession,
  repairAuthorityVisualStorageUrl,
  isBrokenPersistedAuthorityImageStorageUrl,
  repairPrototypeGallerySession,
  rewritePrototypeGalleryUrls,
  seedDesignPageAuthorityPrototypeGallery,
  normalizeDesignPageAuthoritySession,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS,
  resolveDesignPageAuthorityImageSrc,
} from '../src/site00/components/designWorkspace/designPageAuthorityR3PrototypeUrls.js';

describe('Twin V3 authority prototype image wiring', () => {
  it('detects stale Vite /assets/*-r3.svg URLs as broken', () => {
    const stale = 'https://preview.example.test/assets/mobile-territory-a-r3.Dk8s9f.svg';
    expect(isBrokenPersistedAuthorityImageStorageUrl(stale)).toBe(true);
    expect(repairAuthorityVisualStorageUrl(stale, { territoryId: 'A', viewport: 'mobile' })).toBe(
      '/site00/twin-v3-design-page-authority/mobile-territory-a-r3.svg',
    );
    expect(resolveDesignPageAuthorityImageSrc(stale, { territoryId: 'A', viewport: 'mobile' })).toBe(
      '/site00/twin-v3-design-page-authority/mobile-territory-a-r3.svg',
    );
  });

  it('repairs origin-prefixed data: URLs (broken img src)', () => {
    const broken = 'https://preview.example.test/data:image/svg+xml;base64,PHN2Zy8+';
    expect(repairAuthorityVisualStorageUrl(broken)).toBe('data:image/svg+xml;base64,PHN2Zy8+');
    expect(resolveDesignPageAuthorityImageSrc(broken)).toBe('data:image/svg+xml;base64,PHN2Zy8+');
  });

  it('repairs persisted data: prototype back to canonical /site00 path', () => {
    const dataUrl = 'data:image/svg+xml;base64,PHN2Zy8+';
    const fixed = repairAuthorityVisualStorageUrl(dataUrl, { territoryId: 'A', viewport: 'mobile' });
    expect(fixed).toBe('/site00/twin-v3-design-page-authority/mobile-territory-a-r3.svg');
  });

  it('normalize + repair keeps stable public paths in session (no data: in gallery)', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    session = rewritePrototypeGalleryUrls(session, DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS);
    for (const id of ['A', 'B', 'C'] as const) {
      const c = session.territoryGallery[id][0]!;
      expect(c.mobile.storageUrl).toContain('/site00/twin-v3-design-page-authority/');
      expect(c.mobile.storageUrl.startsWith('data:')).toBe(false);
      expect(c.desktop.storageUrl.startsWith('data:')).toBe(false);
    }
  });

  it('resolve maps canonical path to stable public /site00 R3 path (not hashed /assets)', () => {
    const canonical = '/site00/twin-v3-design-page-authority/mobile-territory-a-r3.svg';
    const resolved = resolveDesignPageAuthorityImageSrc(canonical);
    expect(resolved).toBe(canonical);
    expect(resolved).not.toContain('/assets/');
  });

  it('normalizeDesignPageAuthoritySession repairs mangled gallery from storage shape', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    const broken = 'https://preview.example.test/data:image/svg+xml;base64,PHN2Zy8+';
    session = {
      ...session,
      territoryGallery: {
        ...session.territoryGallery,
        A: [
          {
            ...session.territoryGallery.A[0]!,
            mobile: { ...session.territoryGallery.A[0]!.mobile, storageUrl: broken },
          },
        ],
      },
    };
    session = normalizeDesignPageAuthoritySession(session);
    expect(session.territoryGallery.A[0]!.mobile.storageUrl).toBe(
      '/site00/twin-v3-design-page-authority/mobile-territory-a-r3.svg',
    );
    expect(repairPrototypeGallerySession(session).territoryGallery.A[0]!.mobile.representativePrototype).toBe(true);
  });
});
