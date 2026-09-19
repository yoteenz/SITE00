import type { VisualReferenceAssetResolution } from './types.js';

export type VisualReferenceAssetResolverInput = {
  regionId: string;
  existingAssetPath?: string | null;
  referenceCropPath?: string | null;
  approvedPipelineAssetPath?: string | null;
  isInteractiveDom?: boolean;
  isFullScreenUi?: boolean;
};

/** IMAGE REFERENCE > TEXT — FAL only for missing raster assets, never full UI. */
export function resolveVisualReferenceAsset(
  input: VisualReferenceAssetResolverInput,
): VisualReferenceAssetResolution {
  if (input.isFullScreenUi) {
    return {
      regionId: input.regionId,
      kind: 'DOM_UI',
      resolution: 'BLOCKED',
      assetPath: null,
      falAllowed: false,
      textOnlyBlocked: true,
    };
  }

  if (input.existingAssetPath) {
    return {
      regionId: input.regionId,
      kind: 'EXISTING_IMAGE_ASSET',
      resolution: 'EXACT_EXISTING',
      assetPath: input.existingAssetPath,
      falAllowed: false,
      textOnlyBlocked: false,
    };
  }

  if (input.approvedPipelineAssetPath) {
    return {
      regionId: input.regionId,
      kind: 'GENERATED_IMAGE_ASSET',
      resolution: 'APPROVED_PIPELINE',
      assetPath: input.approvedPipelineAssetPath,
      falAllowed: false,
      textOnlyBlocked: false,
    };
  }

  if (input.referenceCropPath) {
    return {
      regionId: input.regionId,
      kind: 'MATERIAL_TEXTURE',
      resolution: 'FAL_IMAGE_REFERENCE',
      assetPath: input.referenceCropPath,
      falAllowed: true,
      textOnlyBlocked: true,
    };
  }

  return {
    regionId: input.regionId,
    kind: input.isInteractiveDom ? 'DOM_UI' : 'GENERATED_IMAGE_ASSET',
    resolution: 'BLOCKED',
    assetPath: null,
    falAllowed: false,
    textOnlyBlocked: true,
  };
}

export function falFullScreenUiImplementationProhibited(isFullScreenUi: boolean): boolean {
  return isFullScreenUi;
}

export function falTextOnlyWhenImageReferenceAvailable(
  resolution: VisualReferenceAssetResolution,
): boolean {
  return resolution.textOnlyBlocked && resolution.resolution === 'FAL_IMAGE_REFERENCE';
}
