/**
 * P0.VR.2A — Visual region classification during reference decomposition.
 */

import type {
  DetectedVisualRegion,
  ReferenceAssetRole,
  ReferenceAssetType,
  ReferenceBounds,
  VisualRegionClassification,
} from './types.js';
import { FAL_ELIGIBLE_CLASSIFICATIONS, INTERACTIVE_REGION_CLASSIFICATIONS } from './constants.js';

export type RegionClassificationInput = {
  regionId: string;
  kind: string;
  bounds: { x: number; y: number; width: number; height: number };
  hasRasterContent?: boolean;
  hasTextContent?: boolean;
  hasSvgIcon?: boolean;
  assetRoleHint?: ReferenceAssetRole;
  assetTypeHint?: ReferenceAssetType;
};

function toBounds(input: RegionClassificationInput['bounds']): ReferenceBounds {
  const aspectRatio = input.width / Math.max(input.height, 1);
  return { ...input, aspectRatio: Math.round(aspectRatio * 100) / 100 };
}

export function classifyVisualRegion(input: RegionClassificationInput): VisualRegionClassification {
  if (input.hasSvgIcon || input.kind === 'SVG_ICON') return 'SVG_ICON';
  if (input.kind === 'DOM_UI' || input.kind === 'BUTTON' || input.kind === 'NAV') return 'DOM_UI';
  if (input.hasTextContent && !input.hasRasterContent) return 'DOM_TEXT';
  if (input.hasRasterContent && input.hasTextContent) return 'MIXED_REGION';
  if (input.kind === 'MATERIAL_TEXTURE' || input.kind === 'TEXTURE') return 'MATERIAL_TEXTURE';
  if (input.kind === 'IMAGE_ASSET' || input.hasRasterContent) return 'IMAGE_ASSET';
  return 'DOM_UI';
}

export function regionCreatesAssetSlot(classification: VisualRegionClassification): boolean {
  return FAL_ELIGIBLE_CLASSIFICATIONS.includes(classification);
}

export function regionRoutesThroughFal(classification: VisualRegionClassification, isInteractiveDom: boolean): boolean {
  if (isInteractiveDom || INTERACTIVE_REGION_CLASSIFICATIONS.includes(classification)) return false;
  return regionCreatesAssetSlot(classification);
}

export function detectVisualRegions(inputs: RegionClassificationInput[]): DetectedVisualRegion[] {
  return inputs.map((input) => {
    const classification = classifyVisualRegion(input);
    const isInteractiveDom = INTERACTIVE_REGION_CLASSIFICATIONS.includes(classification);
    return {
      regionId: input.regionId,
      classification,
      referenceBounds: toBounds(input.bounds),
      assetRoleHint: input.assetRoleHint ?? null,
      assetTypeHint: input.assetTypeHint ?? null,
      isInteractiveDom,
      mixedRasterComponent: classification === 'MIXED_REGION',
    };
  });
}

export function filterImageAssetRegions(regions: DetectedVisualRegion[]): DetectedVisualRegion[] {
  return regions.filter((r) => regionCreatesAssetSlot(r.classification));
}
