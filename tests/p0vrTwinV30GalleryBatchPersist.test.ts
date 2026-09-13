/**
 * Twin V3 authority gallery — multi-batch persistence + dedupe by artifact id
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
import { buildTerritoryPrototypeBundles } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/buildTerritoryPrototypeBundles.js';
import {
  appendTerritoryBundlesToGallery,
  mergeTerritoryGalleries,
  normalizeDesignPageAuthoritySession,
  syncGalleryFromLastResult,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityTerritoryGallery.js';
import {
  createDesignPageAuthorityReviewSession,
  seedDesignPageAuthorityPrototypeGallery,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityReviewState.js';

describe('Twin V3 gallery batch persistence', () => {
  it('mergeTerritoryGalleries unions batches by candidateId', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    const batch1 = { ...session.territoryGallery };
    const bundles = buildTerritoryPrototypeBundles({
      authoritySessionId: session.authoritySessionId,
    });
    const batch2Gallery = appendTerritoryBundlesToGallery({
      gallery: session.territoryGallery,
      bundles,
      batchGeneration: 2,
    });
    const merged = mergeTerritoryGalleries(batch1, batch2Gallery);
    expect(merged.A.length).toBe(2);
    expect(merged.B.length).toBe(2);
    expect(merged.C.length).toBe(2);
  });

  it('syncGalleryFromLastResult keeps a second batch when storage URLs match after repair', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    const batch2Bundles = buildTerritoryPrototypeBundles({
      authoritySessionId: session.authoritySessionId,
    });
    session = {
      ...session,
      candidateGeneration: 2,
      territoryGallery: appendTerritoryBundlesToGallery({
        gallery: session.territoryGallery,
        bundles: batch2Bundles,
        batchGeneration: 2,
      }),
      lastResult: {
        ...(session.lastResult!),
        territories: batch2Bundles,
      },
    };
    session = normalizeDesignPageAuthoritySession(session);
    const onlyBatch1 = {
      ...session,
      territoryGallery: {
        A: [session.territoryGallery.A[0]!],
        B: [session.territoryGallery.B[0]!],
        C: [session.territoryGallery.C[0]!],
      },
      lastResult: { ...session.lastResult!, territories: batch2Bundles },
    };
    const healed = syncGalleryFromLastResult(onlyBatch1);
    expect(healed.territoryGallery.A.length).toBe(2);
  });

  it('batch ledger restores a batch missing from primary gallery read', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    const batch2Gallery = appendTerritoryBundlesToGallery({
      gallery: session.territoryGallery,
      bundles: buildTerritoryPrototypeBundles({ authoritySessionId: session.authoritySessionId }),
      batchGeneration: 2,
    });
    appendAuthorityBatchLedger('ndxbook', batch2Gallery, 2);
    const primaryOnlyBatch1 = session.territoryGallery;
    const restored = mergeGalleryFromBatchLedger('ndxbook', primaryOnlyBatch1);
    expect(restored.A.length).toBe(2);
  });
});
