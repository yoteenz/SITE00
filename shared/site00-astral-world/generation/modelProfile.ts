/**
 * P0.E.FT4 — Configurable model profile by asset class (uses canonical falImageModels).
 */

import type { AstralAssetClass } from './types.js';

export type AstralModelProfile = {
  assetClass: AstralAssetClass;
  preferReferenceEdit: boolean;
  aspectRatioDefault: string;
  outputFormat: 'webp' | 'png';
};

export const ASTRAL_MODEL_PROFILES: Record<AstralAssetClass, AstralModelProfile> = {
  CINEMATIC_ENVIRONMENT: {
    assetClass: 'CINEMATIC_ENVIRONMENT',
    preferReferenceEdit: true,
    aspectRatioDefault: '16:9',
    outputFormat: 'webp',
  },
  CHARACTER_PORTRAIT: {
    assetClass: 'CHARACTER_PORTRAIT',
    preferReferenceEdit: true,
    aspectRatioDefault: '1:1',
    outputFormat: 'webp',
  },
  PRODUCT_ARTIFACT: {
    assetClass: 'PRODUCT_ARTIFACT',
    preferReferenceEdit: true,
    aspectRatioDefault: '4:3',
    outputFormat: 'webp',
  },
  TAROT_CARD: {
    assetClass: 'TAROT_CARD',
    preferReferenceEdit: true,
    aspectRatioDefault: '2:3',
    outputFormat: 'webp',
  },
  IMAGE_EDIT: {
    assetClass: 'IMAGE_EDIT',
    preferReferenceEdit: true,
    aspectRatioDefault: '16:9',
    outputFormat: 'webp',
  },
  UPSCALE: {
    assetClass: 'UPSCALE',
    preferReferenceEdit: false,
    aspectRatioDefault: '16:9',
    outputFormat: 'webp',
  },
};

export function getModelProfile(assetClass: AstralAssetClass): AstralModelProfile {
  return ASTRAL_MODEL_PROFILES[assetClass];
}
