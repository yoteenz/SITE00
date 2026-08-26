/**
 * P0.VR.2A — Reference visual asset slot registry.
 */

import type { DetectedVisualRegion } from './types.js';
import type { CreateSlotInput } from './slotGeometry.js';
import { createReferenceVisualAssetSlot } from './slotGeometry.js';
import { applyReferenceCropToSlot } from './referenceCropExtraction.js';
import {
  applyExistingAssetToSlot,
  lookupExistingAssetForSlot,
  resolveSlotGenerationReadiness,
} from './existingAssetLookup.js';
import type { ReferenceVisualAssetSlot, MissingAssetsSummary } from './types.js';
import { filterImageAssetRegions } from './regionClassification.js';

const slotStore = new Map<string, ReferenceVisualAssetSlot>();

export function registerReferenceVisualAssetSlot(slot: ReferenceVisualAssetSlot): ReferenceVisualAssetSlot {
  slotStore.set(slot.slotId, slot);
  return slot;
}

export function getReferenceVisualAssetSlot(slotId: string): ReferenceVisualAssetSlot | null {
  return slotStore.get(slotId) ?? null;
}

export function listSlotsForScreen(
  projectId: string,
  screenId: string,
  viewportClass: string,
): ReferenceVisualAssetSlot[] {
  return [...slotStore.values()].filter(
    (s) => s.projectId === projectId && s.screenId === screenId && s.viewportClass === viewportClass,
  );
}

export function createSlotsFromDetectedRegions(input: {
  createInput: Omit<CreateSlotInput, 'region' | 'assetRole' | 'assetType'>;
  regions: DetectedVisualRegion[];
  referenceStoragePath: string;
  roleResolver?: (region: DetectedVisualRegion) => { role: CreateSlotInput['assetRole']; type: CreateSlotInput['assetType'] };
}): ReferenceVisualAssetSlot[] {
  const imageRegions = filterImageAssetRegions(input.regions);
  const slots: ReferenceVisualAssetSlot[] = [];

  for (const region of imageRegions) {
    const resolved = input.roleResolver?.(region) ?? {
      role: (region.assetRoleHint ?? 'DECORATIVE') as CreateSlotInput['assetRole'],
      type: (region.assetTypeHint ?? 'EDITORIAL_IMAGE') as CreateSlotInput['assetType'],
    };

    let slot = createReferenceVisualAssetSlot({
      ...input.createInput,
      region,
      assetRole: resolved.role,
      assetType: resolved.type,
    });

    slot = applyReferenceCropToSlot(slot, input.referenceStoragePath);
    const lookup = lookupExistingAssetForSlot(slot);
    slot = applyExistingAssetToSlot(slot, lookup);
    slot = resolveSlotGenerationReadiness(slot);
    registerReferenceVisualAssetSlot(slot);
    slots.push(slot);
  }

  return slots;
}

export function updateReferenceVisualAssetSlot(
  slotId: string,
  patch: Partial<ReferenceVisualAssetSlot>,
): ReferenceVisualAssetSlot | null {
  const existing = slotStore.get(slotId);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  slotStore.set(slotId, updated);
  return updated;
}

export function summarizeMissingAssets(slots: ReferenceVisualAssetSlot[]): MissingAssetsSummary {
  return {
    total: slots.length,
    missing: slots.filter((s) => s.assetStatus === 'MISSING').length,
    existingFound: slots.filter((s) => s.generationStatus === 'EXISTING_ASSET_FOUND').length,
    readyToGenerate: slots.filter((s) => s.generationStatus === 'READY_TO_GENERATE').length,
    generating: slots.filter((s) => s.generationStatus === 'GENERATING' || s.generationStatus === 'QUEUED').length,
    ready: slots.filter((s) => s.assetStatus === 'READY').length,
    failed: slots.filter((s) => s.assetStatus === 'FAILED').length,
    blocked: slots.filter((s) => s.assetStatus === 'BLOCKED').length,
  };
}

export function findSharedCanonicalAsset(assetId: string): ReferenceVisualAssetSlot | null {
  for (const slot of slotStore.values()) {
    if (slot.resolvedAssetId === assetId && slot.bindMode === 'CANON_BIND') return slot;
  }
  return null;
}

export function reuseSharedCanonicalAsset(
  targetSlotId: string,
  sourceAssetId: string,
): ReferenceVisualAssetSlot | null {
  const source = findSharedCanonicalAsset(sourceAssetId);
  if (!source?.resolvedAssetUrl) return null;
  return updateReferenceVisualAssetSlot(targetSlotId, {
    resolvedAssetId: source.resolvedAssetId,
    resolvedAssetUrl: source.resolvedAssetUrl,
    generationStatus: 'EXISTING_ASSET_FOUND',
    assetStatus: 'READY',
    bindMode: 'CANON_BIND',
  });
}

export function clearSlotRegistryForTest(): void {
  slotStore.clear();
}

export function slotRegistrySize(): number {
  return slotStore.size;
}
