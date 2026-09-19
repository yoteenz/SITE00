/**
 * Image provider capability registry — records actual model support without hardcoding assumptions.
 */

import {
  SITE00_FAL_REFERENCE_EDIT_MODEL,
  SITE00_FAL_TEXT_TO_IMAGE_MODEL,
} from '../site00-visual-generation/falImageModels.js';

export type ProviderCapabilityProfile = {
  providerId: string;
  modelId: string;
  supportsImageReferences: boolean;
  supportsMultipleImageReferences: boolean;
  supportsImageEditing: boolean;
  supportsReferenceStrength: boolean;
  supportsMasks: boolean;
  supportsAspectControl: boolean;
  supportsTypographyAccuracy: boolean;
  supportsLayoutConditioning: boolean;
  supportsTransparentOutput: boolean;
  supportsStyleTransfer: boolean;
  supportsImageToImage: boolean;
  supportsCompositionReference: boolean;
  maxReferenceCount: number;
  costEstimateUsd: number;
};

export const SITE00_PROVIDER_CAPABILITY_REGISTRY: ProviderCapabilityProfile[] = [
  {
    providerId: 'fal',
    modelId: SITE00_FAL_TEXT_TO_IMAGE_MODEL,
    supportsImageReferences: false,
    supportsMultipleImageReferences: false,
    supportsImageEditing: false,
    supportsReferenceStrength: false,
    supportsMasks: false,
    supportsAspectControl: true,
    supportsTypographyAccuracy: false,
    supportsLayoutConditioning: false,
    supportsTransparentOutput: false,
    supportsStyleTransfer: false,
    supportsImageToImage: false,
    supportsCompositionReference: false,
    maxReferenceCount: 0,
    costEstimateUsd: 0.045,
  },
  {
    providerId: 'fal',
    modelId: SITE00_FAL_REFERENCE_EDIT_MODEL,
    supportsImageReferences: true,
    supportsMultipleImageReferences: true,
    supportsImageEditing: true,
    supportsReferenceStrength: false,
    supportsMasks: false,
    supportsAspectControl: true,
    supportsTypographyAccuracy: false,
    supportsLayoutConditioning: true,
    supportsTransparentOutput: false,
    supportsStyleTransfer: true,
    supportsImageToImage: true,
    supportsCompositionReference: true,
    maxReferenceCount: 8,
    costEstimateUsd: 0.045,
  },
];

export function getProviderCapability(providerId: string, modelId: string): ProviderCapabilityProfile | null {
  return SITE00_PROVIDER_CAPABILITY_REGISTRY.find((p) => p.providerId === providerId && p.modelId === modelId) ?? null;
}

export function getCurrentExperienceProviderCapability(): ProviderCapabilityProfile {
  return SITE00_PROVIDER_CAPABILITY_REGISTRY.find((p) => p.modelId === SITE00_FAL_REFERENCE_EDIT_MODEL)!;
}

export function providerSupportsReferenceConditioning(profile: ProviderCapabilityProfile): boolean {
  return profile.supportsImageReferences || profile.supportsMultipleImageReferences || profile.supportsImageEditing;
}

export function providerSupportsMultiReference(profile: ProviderCapabilityProfile, referenceCount: number): boolean {
  if (referenceCount === 0) return profile.supportsImageReferences === false;
  if (referenceCount === 1) return profile.supportsImageReferences;
  return profile.supportsMultipleImageReferences && referenceCount <= profile.maxReferenceCount;
}

export function assertReferenceConditioningSupported(params: {
  providerId: string;
  modelId: string;
  referenceCount: number;
  strictHostRequired: boolean;
}): { ok: true } | { ok: false; error: string } {
  const profile = getProviderCapability(params.providerId, params.modelId);
  if (!profile) {
    return { ok: false, error: `Unknown provider/model: ${params.providerId}/${params.modelId}` };
  }
  if (params.strictHostRequired && !providerSupportsReferenceConditioning(profile)) {
    return {
      ok: false,
      error: 'STRICT_HOST_VISUAL_CONDITIONING requires reference-conditioned generation; provider does not support it',
    };
  }
  if (params.referenceCount > 0 && !providerSupportsMultiReference(profile, params.referenceCount)) {
    return {
      ok: false,
      error: `Provider ${params.modelId} does not support ${params.referenceCount} reference images`,
    };
  }
  return { ok: true };
}
