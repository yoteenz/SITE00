/**
 * Twin V3 authority gallery — auto-recover prototypes + skip broken ledger merge
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const memoryStore = new Map<string, string>();

beforeEach(() => {
  memoryStore.clear();
  const stub = {
    getItem: (k: string) => memoryStore.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memoryStore.set(k, v);
    },
    removeItem: (k: string) => {
      memoryStore.delete(k);
    },
    clear: () => memoryStore.clear(),
    key: () => null,
    length: 0,
  };
  vi.stubGlobal('localStorage', stub);
  vi.stubGlobal('sessionStorage', stub);
});

import {
  appendAuthorityBatchLedger,
  mergeGalleryFromBatchLedger,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityBatchLedger.js';
import {
  P0_VR_TWIN_V30_BUILD,
  createDesignPageAuthorityReviewSession,
  readDesignPageAuthoritySession,
  recoverDesignPageAuthorityGalleryIfBroken,
  seedDesignPageAuthorityPrototypeGallery,
  writeDesignPageAuthoritySession,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

describe('Twin V3 gallery recovery (v405)', () => {
  it('recovers stale buildRef to public-path prototype batch', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    session = {
      ...session,
      buildRef: 'v404',
      territoryGallery: {
        ...session.territoryGallery,
        A: [
          {
            ...session.territoryGallery.A[0]!,
            mobile: {
              ...session.territoryGallery.A[0]!.mobile,
              storageUrl: 'https://preview.test/assets/mobile-territory-a-r3.deadbeef.svg',
            },
          },
        ],
      },
    };
    const recovered = recoverDesignPageAuthorityGalleryIfBroken(session);
    expect(recovered.buildRef).toBe(P0_VR_TWIN_V30_BUILD);
    expect(recovered.territoryGallery.A[0]!.mobile.storageUrl).toContain('/site00/twin-v3-design-page-authority/');
    expect(recovered.territoryGallery.A.length).toBe(1);
  });

  it('does not merge broken batch ledger back over a healthy gallery', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    const good = session.territoryGallery;
    const brokenBatch2 = {
      ...good,
      A: [
        {
          ...good.A[0]!,
          batchGeneration: 2,
          mobile: {
            ...good.A[0]!.mobile,
            storageUrl: 'https://preview.test/assets/mobile-territory-a-r3.stale.svg',
          },
        },
      ],
    };
    appendAuthorityBatchLedger(session.projectId, brokenBatch2, 2);
    const merged = mergeGalleryFromBatchLedger(session.projectId, good);
    expect(merged.A.length).toBe(1);
    expect(merged.A[0]!.batchGeneration).toBe(1);
    expect(merged.A[0]!.mobile.storageUrl).toContain('/site00/twin-v3-design-page-authority/');
  });

  it('readDesignPageAuthoritySession auto-writes recovered gallery', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    session = { ...session, buildRef: 'v403' };
    writeDesignPageAuthoritySession(session);
    const fromRead = readDesignPageAuthoritySession(session.projectId);
    expect(fromRead?.buildRef).toBe(P0_VR_TWIN_V30_BUILD);
    expect(fromRead?.territoryGallery.A[0]!.mobile.storageUrl).toContain('/site00/twin-v3-design-page-authority/');
  });
});
