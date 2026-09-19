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
  it('replaceTerritoryBundlesInGallery drops batch 1 when batch 2 is applied', async () => {
    const { replaceTerritoryBundlesInGallery } = await import(
      '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityTerritoryGallery.js'
    );
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    expect(session.territoryGallery.A[0]!.batchGeneration).toBe(1);
    const bundles = buildTerritoryPrototypeBundles({ authoritySessionId: session.authoritySessionId });
    const replaced = replaceTerritoryBundlesInGallery({
      gallery: session.territoryGallery,
      bundles,
      batchGeneration: 2,
    });
    expect(replaced.A.length).toBe(1);
    expect(replaced.A[0]!.batchGeneration).toBe(2);
  });

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

  it('normalize keeps only latest batch (drops older broken batch)', async () => {
    const { pruneGalleryToLatestBatch } = await import(
      '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityTerritoryGallery.js'
    );
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    const batch2Gallery = appendTerritoryBundlesToGallery({
      gallery: session.territoryGallery,
      bundles: buildTerritoryPrototypeBundles({ authoritySessionId: session.authoritySessionId }),
      batchGeneration: 2,
    });
    const both = { ...session.territoryGallery, ...batch2Gallery, A: [...session.territoryGallery.A, ...batch2Gallery.A] };
    const merged = {
      A: [...session.territoryGallery.A, ...batch2Gallery.A],
      B: [...session.territoryGallery.B, ...batch2Gallery.B],
      C: [...session.territoryGallery.C, ...batch2Gallery.C],
    };
    const pruned = pruneGalleryToLatestBatch(merged);
    expect(pruned.A.length).toBe(1);
    expect(pruned.A[0]!.batchGeneration).toBe(2);
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
