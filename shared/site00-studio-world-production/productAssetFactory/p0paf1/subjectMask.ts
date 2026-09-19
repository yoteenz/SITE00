/**
 * P0.PAF.1 — Subject mask reuse for edit consistency.
 */

import { subjectMaskStoragePath } from './storagePaths.js';
import type { ProductSubjectMask } from './types.js';

const maskStore = new Map<string, ProductSubjectMask>();

export function getOrCreateSubjectMask(masterHeroId: string, region: 'SUBJECT' | 'HAIR'): ProductSubjectMask {
  const key = `${masterHeroId}:${region}`;
  const existing = maskStore.get(key);
  if (existing) return existing;

  const storagePath = subjectMaskStoragePath(masterHeroId, region.toLowerCase() as 'subject' | 'hair');
  const mask: ProductSubjectMask = {
    maskId: `mask-${masterHeroId}-${region.toLowerCase()}`,
    masterHeroId,
    storagePath,
    publicUrl: `https://storage.site00.test/${storagePath}`,
    region,
    reusedFromMaster: true,
    createdAt: new Date().toISOString(),
  };
  maskStore.set(key, mask);
  return mask;
}

export function reuseSubjectMaskForVariant(masterHeroId: string): ProductSubjectMask {
  return getOrCreateSubjectMask(masterHeroId, 'SUBJECT');
}

export function clearMaskStoreForTest(): void {
  maskStore.clear();
}
