/**
 * P0.VR.2A — FAL provider routing based on asset role and capabilities.
 */

import { FAL_PROVIDER_CAPABILITIES } from './constants.js';
import type { FalProviderRoute, ReferenceAssetBrief, ReferenceVisualAssetSlot } from './types.js';

export function routeFalProvider(slot: ReferenceVisualAssetSlot, brief: ReferenceAssetBrief): FalProviderRoute {
  if (slot.assetType === 'CHARACTER_IMAGE' || slot.requiresCharacterAuthority) {
    return {
      provider: 'fal',
      model: FAL_PROVIDER_CAPABILITIES.characterIdentity.model,
      mode: brief.referenceImageAuthority ? 'image-reference' : 'text-to-image',
      reason: 'character identity continuity',
    };
  }

  if (slot.assetType === 'TEXTURE' || slot.assetType === 'PAPER_ARTIFACT' || slot.assetType === 'TAPE') {
    return {
      provider: 'fal',
      model: FAL_PROVIDER_CAPABILITIES.materialReconstruction.model,
      mode: brief.referenceImageAuthority ? 'image-reference' : 'text-to-image',
      reason: 'material artifact reconstruction',
    };
  }

  if (slot.assetType === 'CAMPAIGN_ART' || slot.assetType === 'COLLAGE' || slot.assetType === 'IMAGE_COMPOSITE') {
    return {
      provider: 'fal',
      model: FAL_PROVIDER_CAPABILITIES.graphicReconstruction.model,
      mode: brief.referenceImageAuthority ? 'image-reference' : 'text-to-image',
      reason: 'editorial graphic reconstruction',
    };
  }

  return {
    provider: 'fal',
    model: FAL_PROVIDER_CAPABILITIES.imageReferenceEdit.model,
    mode: brief.referenceImageAuthority ? 'image-reference' : 'text-to-image',
    reason: brief.referenceImageAuthority ? 'reference-image fidelity' : 'missing reference crop',
  };
}

export function falFullScreenUiGenerationAllowed(): boolean {
  return false;
}
