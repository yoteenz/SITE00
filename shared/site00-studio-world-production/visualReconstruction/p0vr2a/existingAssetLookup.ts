/**
 * P0.VR.2A — Existing asset lookup before FAL dispatch.
 * Priority: EXACT CANONICAL → APPROVED PIPELINE → REFERENCE CROP → FAL
 */

import type { ExistingAssetLookupResult, ReferenceVisualAssetSlot } from './types.js';

export type ExistingAssetCatalogEntry = {
  assetId: string;
  url: string;
  role: string;
  canonical: boolean;
  approvedPipeline: boolean;
};

const catalogStore = new Map<string, ExistingAssetCatalogEntry[]>();

export function registerExistingAssetCatalog(projectId: string, entries: ExistingAssetCatalogEntry[]): void {
  catalogStore.set(projectId, entries);
}

export function clearExistingAssetCatalogForTest(): void {
  catalogStore.clear();
}

export function lookupExistingAssetForSlot(slot: ReferenceVisualAssetSlot): ExistingAssetLookupResult {
  const catalog = catalogStore.get(slot.projectId) ?? [];

  for (const candidateId of slot.existingAssetCandidateIds) {
    const match = catalog.find((e) => e.assetId === candidateId);
    if (match) {
      return {
        slotId: slot.slotId,
        found: true,
        source: match.canonical ? 'EXACT_CANONICAL' : 'APPROVED_PIPELINE',
        assetId: match.assetId,
        assetUrl: match.url,
      };
    }
  }

  const roleMatch = catalog.find(
    (e) => e.role === slot.assetRole && (e.canonical || e.approvedPipeline),
  );
  if (roleMatch) {
    return {
      slotId: slot.slotId,
      found: true,
      source: roleMatch.canonical ? 'EXACT_CANONICAL' : 'APPROVED_PIPELINE',
      assetId: roleMatch.assetId,
      assetUrl: roleMatch.url,
    };
  }

  if (slot.referenceCropStoragePath) {
    return {
      slotId: slot.slotId,
      found: false,
      source: 'REFERENCE_CROP',
      assetId: null,
      assetUrl: null,
    };
  }

  return { slotId: slot.slotId, found: false, source: 'NONE', assetId: null, assetUrl: null };
}

export function applyExistingAssetToSlot(
  slot: ReferenceVisualAssetSlot,
  lookup: ExistingAssetLookupResult,
): ReferenceVisualAssetSlot {
  if (!lookup.found || !lookup.assetUrl) return slot;
  return {
    ...slot,
    resolvedAssetId: lookup.assetId,
    resolvedAssetUrl: lookup.assetUrl,
    generationStatus: 'EXISTING_ASSET_FOUND',
    assetStatus: 'READY',
    bindMode: 'CANON_BIND',
    updatedAt: new Date().toISOString(),
  };
}

export function resolveSlotGenerationReadiness(slot: ReferenceVisualAssetSlot): ReferenceVisualAssetSlot {
  if (slot.assetStatus === 'READY' || slot.generationStatus === 'EXISTING_ASSET_FOUND') return slot;
  if (slot.requiresCharacterAuthority && !slot.characterAuthorityReady) {
    return { ...slot, generationStatus: 'BLOCKED', assetStatus: 'BLOCKED', updatedAt: new Date().toISOString() };
  }
  if (slot.referenceCropStoragePath || slot.assetType !== 'CHARACTER_IMAGE') {
    return { ...slot, generationStatus: 'READY_TO_GENERATE', assetStatus: 'MISSING', updatedAt: new Date().toISOString() };
  }
  return { ...slot, generationStatus: 'BLOCKED', assetStatus: 'BLOCKED', updatedAt: new Date().toISOString() };
}
