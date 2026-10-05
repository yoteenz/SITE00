/**
 * Twin V3 batch 2 module — isolated from batch 1 persistence
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

import { BATCH2_MODULE_STORAGE_KEY, readDesignPageAuthorityBatch2Module, writeDesignPageAuthorityBatch2Module } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityBatch2Persistence.js';
import { emptyDesignPageAuthorityBatch2Module } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityBatch2Module.js';
import {
  readDesignPageAuthoritySession,
  seedDesignPageAuthorityPrototypeGallery,
  writeDesignPageAuthoritySession,
  createDesignPageAuthorityReviewSession,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { buildTerritoryPrototypeBundles } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/buildTerritoryPrototypeBundles.js';
import { replaceTerritoryBundlesInGallery } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityTerritoryGallery.js';

describe('Twin V3 batch 2 module storage', () => {
  it('uses a separate localStorage key from batch 1', () => {
    expect(BATCH2_MODULE_STORAGE_KEY).toContain('batch2-module');
    expect(BATCH2_MODULE_STORAGE_KEY).not.toBe('site00:design-page-v3-authority:v1');
  });

  it('auto-seeds prototype SVG gallery when batch 2 store is empty', () => {
    const projectId = 'ndxbook';
    const loaded = readDesignPageAuthorityBatch2Module(projectId);
    expect(loaded.territoryGallery.A.length).toBe(1);
    expect(loaded.territoryGallery.A[0]!.batchGeneration).toBe(2);
    expect(loaded.territoryGallery.A[0]!.mobile.storageUrl).toContain('/site00/twin-v3-design-page-authority/');
    expect(loaded.territoryGallery.B.length).toBe(1);
    expect(loaded.territoryGallery.C.length).toBe(1);
  });

  it('batch 2 survives batch 1 session overwrite', () => {
    const projectId = 'ndxbook';
    let batch2 = emptyDesignPageAuthorityBatch2Module(projectId);
    const bundles = buildTerritoryPrototypeBundles({ authoritySessionId: 'batch2-test' });
    batch2 = {
      ...batch2,
      candidateGeneration: 2,
      territoryGallery: replaceTerritoryBundlesInGallery({
        gallery: batch2.territoryGallery,
        bundles,
        batchGeneration: 2,
      }),
    };
    writeDesignPageAuthorityBatch2Module(batch2);

    let batch1 = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession({ projectId }));
    batch1 = {
      ...batch1,
      territoryGallery: {
        ...batch1.territoryGallery,
        A: [
          {
            ...batch1.territoryGallery.A[0]!,
            mobile: {
              ...batch1.territoryGallery.A[0]!.mobile,
              storageUrl: 'https://dead.test/assets/mobile-territory-a-r3.stale.svg',
            },
          },
        ],
      },
    };
    writeDesignPageAuthoritySession(batch1);

    const fromBatch2 = readDesignPageAuthorityBatch2Module(projectId);
    expect(fromBatch2.territoryGallery.A[0]!.batchGeneration).toBe(2);
    expect(fromBatch2.territoryGallery.A[0]!.mobile.storageUrl).toContain('/site00/twin-v3-design-page-authority/');
    expect(memoryStore.has(BATCH2_MODULE_STORAGE_KEY)).toBe(true);
    expect(memoryStore.has('site00:design-page-v3-authority:v1')).toBe(true);
    const batch2Raw = JSON.parse(memoryStore.get(BATCH2_MODULE_STORAGE_KEY)!) as Record<string, unknown>;
    const batch1Raw = JSON.parse(memoryStore.get('site00:design-page-v3-authority:v1')!) as Record<string, unknown>;
    expect(batch2Raw.ndxbook).toBeTruthy();
    expect(batch1Raw.ndxbook).toBeTruthy();
    expect(readDesignPageAuthoritySession(projectId)).toBeTruthy();
  });
});
