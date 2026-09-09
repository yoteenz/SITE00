/**
 * Full-screen asset mismatch discovery — reference vs live.
 * P0.VR.6R6
 */

import {
  BRAND_KEY_TO_ASSET_SLOT,
  assetSlotToExtractedPath,
  resolveFamilyThumbnailUrl,
  type SkinsViewportClass,
} from '../p0vr6/skinsReferenceFidelity.js';
import { approvedVisualAssetExists } from '../p0vr6/skinsCanonicalBindings.js';
import {
  buildAssetTreatmentPlan,
  buildReferenceAssetPrompt,
  classifyReferenceAsset,
  type AssetTreatmentPlan,
  type ReferenceAssetSource,
} from '../p0vr6/referenceAssetPipeline.js';

export const VISUAL_MISMATCH_TYPES = [
  'MATCHED',
  'GEOMETRY_MISMATCH',
  'TYPOGRAPHY_MISMATCH',
  'SURFACE_MISMATCH',
  'ASSET_MISMATCH',
  'MISSING',
  'EXTRA',
  'WRONG_STATE',
] as const;

export type VisualMismatchType = (typeof VISUAL_MISMATCH_TYPES)[number];

export type ReferenceLiveInventoryEntry = {
  regionId: string;
  semanticSlot: string;
  classification: VisualMismatchType;
  referenceHasVisual: boolean;
  liveHasVisual: boolean;
  liveUsesPlaceholder: boolean;
  liveUsesColorSwatch: boolean;
  liveUsesBrokenImage: boolean;
  notes: string | null;
};

export type ReferenceLiveVisualInventory = {
  authorityId: string;
  viewport: SkinsViewportClass;
  entries: ReferenceLiveInventoryEntry[];
  assetMismatchCount: number;
  geometryMismatchCount: number;
  matchedCount: number;
};

export type ReferenceAssetCandidate = {
  candidateId: string;
  semanticSlot: string;
  assetType: string;
  brandKey: string;
  referenceRegion: string;
  liveRegion: string;
  mismatchType: VisualMismatchType;
  sourceCrop: ReferenceAssetSource;
  cropStatus: 'PENDING' | 'PREPARED' | 'APPROVED' | 'REJECTED';
  treatmentPlan: AssetTreatmentPlan;
  generatedPrompt: string;
  generationStatus: 'BLOCKED' | 'READY' | 'DISPATCHED' | 'COMPLETE' | 'FAILED';
  output: { outputId: string; outputUrl: string | null; approvalStatus: string } | null;
  backgroundStatus: 'NOT_RUN' | 'COMPLETE';
  qaStatus: 'NOT_RUN' | 'PASS' | 'FAIL';
  approvalStatus: 'PENDING' | 'LOVE_IT' | 'REVISE' | 'REJECTED';
  bindingStatus: 'UNBOUND' | 'BOUND' | 'BLOCKED';
};

const SKINS_FAMILY_KEYS = ['NDXBOOK', 'FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'] as const;

export function buildReferenceLiveVisualInventory(input: {
  authorityId: string;
  viewport?: SkinsViewportClass;
  liveColorSwatchBrands?: string[];
}): ReferenceLiveVisualInventory {
  const viewport = input.viewport ?? 'MOBILE';
  const colorSwatches = new Set(input.liveColorSwatchBrands ?? ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD']);

  const entries: ReferenceLiveInventoryEntry[] = SKINS_FAMILY_KEYS.map((brandKey) => {
    const slot = BRAND_KEY_TO_ASSET_SLOT[brandKey]!;
    const resolution = resolveFamilyThumbnailUrl({ brandKey, viewport });
    const approved = approvedVisualAssetExists(viewport, slot);
    const usesSwatch = colorSwatches.has(brandKey) || resolution.colorSwatchFallback;

    let classification: VisualMismatchType = 'MATCHED';
    if (usesSwatch) classification = 'ASSET_MISMATCH';
    else if (!approved && !resolution.url) classification = 'MISSING';
    else if (approved && usesSwatch) classification = 'WRONG_STATE';

    return {
      regionId: `family-thumb-${brandKey.toLowerCase()}`,
      semanticSlot: `BRAND_FAMILY_${brandKey}_THUMBNAIL`,
      classification,
      referenceHasVisual: true,
      liveHasVisual: Boolean(resolution.url) && !usesSwatch,
      liveUsesPlaceholder: !resolution.url,
      liveUsesColorSwatch: usesSwatch,
      liveUsesBrokenImage: false,
      notes: usesSwatch ? 'FLAT COLOR SWATCH — NOT CANONICAL VISUAL' : approved ? 'CANONICAL BOUND' : 'NO CANONICAL',
    };
  });

  return {
    authorityId: input.authorityId,
    viewport,
    entries,
    assetMismatchCount: entries.filter((e) => e.classification === 'ASSET_MISMATCH' || e.classification === 'MISSING').length,
    geometryMismatchCount: 0,
    matchedCount: entries.filter((e) => e.classification === 'MATCHED').length,
  };
}

export function discoverAssetMismatchCandidates(input: {
  inventory: ReferenceLiveVisualInventory;
  viewport?: SkinsViewportClass;
  sourceReferenceId: string;
  includeMatched?: boolean;
}): ReferenceAssetCandidate[] {
  const viewport = input.viewport ?? input.inventory.viewport;

  if (input.includeMatched !== false) {
    return SKINS_FAMILY_KEYS.map((brandKey) => {
      const entry = input.inventory.entries.find((e) => e.regionId === `family-thumb-${brandKey.toLowerCase()}`);
      const mismatchType = entry?.classification ?? 'ASSET_MISMATCH';
      return buildCandidate(brandKey, viewport, input.sourceReferenceId, mismatchType);
    });
  }

  const mismatches = input.inventory.entries.filter(
    (e) => e.classification === 'ASSET_MISMATCH' || e.classification === 'MISSING' || e.classification === 'WRONG_STATE',
  );

  return mismatches.map((entry) => {
    const brandKey = entry.semanticSlot.replace('BRAND_FAMILY_', '').replace('_THUMBNAIL', '');
    return buildCandidate(brandKey, viewport, input.sourceReferenceId, entry.classification);
  });
}

function buildCandidate(
  brandKey: string,
  viewport: SkinsViewportClass,
  sourceReferenceId: string,
  mismatchType: VisualMismatchType,
): ReferenceAssetCandidate {
  const slot = BRAND_KEY_TO_ASSET_SLOT[brandKey as keyof typeof BRAND_KEY_TO_ASSET_SLOT]!;
  const slotId = `BRAND_FAMILY_${brandKey}_THUMBNAIL`;
  const sourceCropUrl = assetSlotToExtractedPath(viewport, slot);
  const assetType = classifyReferenceAsset({ slotId, hints: { hasDeviceFrame: true, hasText: true } });

  const source: ReferenceAssetSource = {
    sourceReferenceId,
    sourceScreenshotId: `skins-authority-${viewport.toLowerCase()}`,
    cropId: `crop-${viewport}-${slot}`,
    sourceRegion: { x: 0, y: 0, width: 1, height: 1 },
    sourceCropUrl,
    sourceCropChecksum: `checksum-${viewport}-${slot}`,
    assetType,
    sourceStatus: 'CROP_CONFIRMED',
    slotId,
    viewport,
    uiContaminationSuspected: true,
  };

  const treatmentPlan = buildAssetTreatmentPlan({ assetType, cropClean: false, uiContaminationSuspected: true });
  const generatedPrompt = buildReferenceAssetPrompt({
    assetType,
    targetSlot: slotId,
    backgroundPolicy: treatmentPlan.backgroundPolicy,
    brandLabel: brandKey.replace(/_/g, ' '),
  });

  return {
    candidateId: `candidate-${viewport}-${brandKey}`,
    semanticSlot: slotId,
    assetType,
    brandKey,
    referenceRegion: `family-thumb-${brandKey.toLowerCase()}`,
    liveRegion: `family-thumb-${brandKey.toLowerCase()}`,
    mismatchType,
    sourceCrop: source,
    cropStatus: 'PREPARED',
    treatmentPlan,
    generatedPrompt,
    generationStatus: 'BLOCKED',
    output: null,
    backgroundStatus: 'NOT_RUN',
    qaStatus: 'NOT_RUN',
    approvalStatus: 'PENDING',
    bindingStatus: 'UNBOUND',
  };
}

export function detectIncompleteMultiAssetDiscovery(input: {
  expectedCount: number;
  discoveredCount: number;
}): { incomplete: boolean; failureCode: 'REFERENCE_MULTI_ASSET_DISCOVERY_INCOMPLETE' | null } {
  if (input.discoveredCount < input.expectedCount) {
    return { incomplete: true, failureCode: 'REFERENCE_MULTI_ASSET_DISCOVERY_INCOMPLETE' };
  }
  return { incomplete: false, failureCode: null };
}
