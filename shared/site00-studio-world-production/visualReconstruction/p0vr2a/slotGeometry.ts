/**
 * P0.VR.2A — Slot geometry from canonical reference bounds.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import { createCropContractFromBounds } from './referenceAssetCropContract.js';
import { createDefaultSafeAreaContract } from './assetSafeAreaContract.js';
import type {
  DetectedVisualRegion,
  ReferenceAssetRole,
  ReferenceAssetType,
  ReferenceBounds,
  ReferenceVisualAssetSlot,
  TargetBounds,
} from './types.js';
import { DEFAULT_PRODUCTION_DENSITY } from './constants.js';

export function computeAspectRatio(width: number, height: number): number {
  return Math.round((width / Math.max(height, 1)) * 100) / 100;
}

export function mapReferenceBoundsToTarget(
  referenceBounds: ReferenceBounds,
  referenceViewport: { width: number; height: number },
  targetViewport: { width: number; height: number },
): TargetBounds {
  const scaleX = targetViewport.width / referenceViewport.width;
  const scaleY = targetViewport.height / referenceViewport.height;
  const width = Math.round(referenceBounds.width * scaleX);
  const height = Math.round(referenceBounds.height * scaleY);
  return {
    x: Math.round(referenceBounds.x * scaleX),
    y: Math.round(referenceBounds.y * scaleY),
    width,
    height,
    aspectRatio: computeAspectRatio(width, height),
  };
}

export function computeGenerationDimensions(
  displayWidth: number,
  displayHeight: number,
  density: 1 | 2 | 4 = DEFAULT_PRODUCTION_DENSITY,
): { generationWidth: number; generationHeight: number } {
  return {
    generationWidth: displayWidth * density,
    generationHeight: displayHeight * density,
  };
}

export type CreateSlotInput = {
  projectId: string;
  screenId: string;
  route: string;
  viewportClass: DesignViewportClass;
  referenceId: string;
  region: DetectedVisualRegion;
  assetRole: ReferenceAssetRole;
  assetType: ReferenceAssetType;
  referenceViewport?: { width: number; height: number };
  objectFit?: ReferenceVisualAssetSlot['objectFit'];
  objectPosition?: string;
  backgroundBehavior?: ReferenceVisualAssetSlot['backgroundBehavior'];
  transparencyRequired?: boolean;
  referenceCropStoragePath?: string | null;
  existingAssetCandidateIds?: string[];
  requiresCharacterAuthority?: boolean;
  characterAuthorityReady?: boolean;
};

export function createReferenceVisualAssetSlot(input: CreateSlotInput): ReferenceVisualAssetSlot {
  const viewport = input.referenceViewport ?? CANONICAL_VIEWPORT_DIMENSIONS[input.viewportClass];
  const targetBounds = mapReferenceBoundsToTarget(input.region.referenceBounds, viewport, viewport);
  const objectFit = input.objectFit ?? 'cover';
  const safeArea = createDefaultSafeAreaContract(objectFit);
  const cropContract = createCropContractFromBounds(targetBounds, objectFit, input.objectPosition ?? 'center 42%');
  const { generationWidth, generationHeight } = computeGenerationDimensions(
    targetBounds.width,
    targetBounds.height,
    DEFAULT_PRODUCTION_DENSITY,
  );
  const now = new Date().toISOString();

  return {
    slotId: `slot-${input.referenceId}-${input.region.regionId}`,
    projectId: input.projectId,
    screenId: input.screenId,
    route: input.route,
    viewportClass: input.viewportClass,
    referenceId: input.referenceId,
    regionId: input.region.regionId,
    assetRole: input.assetRole,
    assetType: input.assetType,
    referenceBounds: input.region.referenceBounds,
    targetBounds,
    x: targetBounds.x,
    y: targetBounds.y,
    width: targetBounds.width,
    height: targetBounds.height,
    aspectRatio: targetBounds.aspectRatio,
    objectFit,
    objectPosition: input.objectPosition ?? cropContract.objectPosition,
    cropMode: objectFit === 'cover' ? 'cover' : 'contain',
    zIndex: 1,
    borderRadius: 0,
    mask: null,
    clipPath: null,
    backgroundBehavior: input.backgroundBehavior ?? 'REFERENCE_MATCHED',
    transparencyRequired: input.transparencyRequired ?? false,
    referenceCropAssetId: input.referenceCropStoragePath ? `crop-${input.region.regionId}` : null,
    referenceCropStoragePath: input.referenceCropStoragePath ?? null,
    existingAssetCandidateIds: input.existingAssetCandidateIds ?? [],
    promptId: null,
    generationStatus: 'MISSING',
    assetStatus: 'MISSING',
    resolvedAssetId: null,
    resolvedAssetUrl: null,
    bindMode: null,
    safeArea,
    cropContract,
    requiresCharacterAuthority: input.requiresCharacterAuthority ?? input.assetType === 'CHARACTER_IMAGE',
    characterAuthorityReady: input.characterAuthorityReady ?? false,
    productionDensity: DEFAULT_PRODUCTION_DENSITY,
    generationWidth,
    generationHeight,
    createdAt: now,
    updatedAt: now,
  };
}

export function slotGeometryLocked(slot: ReferenceVisualAssetSlot): boolean {
  return slot.width > 0 && slot.height > 0 && slot.aspectRatio > 0;
}

export function bindWouldCauseLayoutShift(
  slot: ReferenceVisualAssetSlot,
  renderedWidth: number,
  renderedHeight: number,
): boolean {
  return renderedWidth !== slot.width || renderedHeight !== slot.height;
}

export function formatSlotDisplay(slot: ReferenceVisualAssetSlot): string {
  return `${slot.width} × ${slot.height} · ${slot.aspectRatio}:1 · ${slot.objectFit.toUpperCase()} · ${slot.objectPosition.toUpperCase()}`;
}
