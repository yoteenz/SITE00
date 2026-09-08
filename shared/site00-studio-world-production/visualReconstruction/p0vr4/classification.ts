/**
 * P0.VR.4 — Asset classification from detection regions.
 */

import type {
  DesignReconstructionAssetType,
  DetectedAssetRegion,
  LiveUiRole,
} from './types.js';

const CLASSIFICATION_TO_ASSET_TYPE: Partial<Record<DetectedAssetRegion['classification'], DesignReconstructionAssetType>> = {
  ICON: 'ICON',
  NAV_ICON: 'NAV_ICON',
  HERO_OBJECT: 'HERO_OBJECT',
  DECORATIVE_OBJECT: 'DECORATIVE_OBJECT',
  PROJECT_VISUAL: 'PROJECT_VISUAL',
  ILLUSTRATION: 'ILLUSTRATION',
  LOGO_MARK: 'LOGO_MARK',
  BADGE: 'BADGE',
  TEXTURE: 'TEXTURE',
  BACKGROUND_ELEMENT: 'BACKGROUND_ELEMENT',
  PRODUCT_VISUAL: 'PRODUCT_VISUAL',
  '3D_OBJECT': 'HERO_OBJECT',
  OTHER: 'OTHER',
};

export function classifyReconstructionAsset(region: DetectedAssetRegion): DesignReconstructionAssetType {
  return CLASSIFICATION_TO_ASSET_TYPE[region.classification] ?? 'OTHER';
}

export function inferLiveUiRole(
  assetType: DesignReconstructionAssetType,
  semanticName: string,
): LiveUiRole | null {
  const name = semanticName.toUpperCase();
  if (name.includes('HEADER') && (assetType === 'HERO_OBJECT' || assetType === 'ICON')) {
    return 'PAGE_HEADER_HERO';
  }
  if (assetType === 'NAV_ICON' || name.includes(' TAB ') || name.includes(' ICON')) {
    return 'NAV_ICON';
  }
  if (assetType === 'PROJECT_VISUAL' || name.includes('PROJECT VISUAL') || name.includes(' CARD ')) {
    return 'PROJECT_CARD_VISUAL';
  }
  if (assetType === 'DECORATIVE_OBJECT') return 'DECORATIVE';
  return 'OTHER';
}

export function isAssetTypeAmbiguous(region: DetectedAssetRegion): boolean {
  return region.classification === 'OTHER' || region.confidence === 'LOW';
}
