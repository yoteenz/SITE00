/**
 * P0.VR.4 — Provider capability discovery for reconstruction + transparency.
 */

import { SITE00_FAL_TEXT_TO_IMAGE_MODEL } from '../../../site00-visual-generation/falImageModels.js';
import { discoverBackgroundRemovalProviders } from './backgroundRemovalProvider.js';
import { DEFAULT_RECONSTRUCTION_MODEL } from './constants.js';

export type ReconstructionCapability = {
  provider: string;
  model: string;
  mode: 'image-edit' | 'text-to-image';
  available: boolean;
  supportsReferenceCrop: boolean;
  supportsTransparentOutput: boolean;
};

export function discoverReconstructionCapabilities(env?: { falKey?: string }): ReconstructionCapability[] {
  const falAvailable = Boolean(env?.falKey?.trim());
  return [
    {
      provider: 'fal',
      model: DEFAULT_RECONSTRUCTION_MODEL,
      mode: 'image-edit',
      available: falAvailable,
      supportsReferenceCrop: true,
      supportsTransparentOutput: true,
    },
    {
      provider: 'fal',
      model: SITE00_FAL_TEXT_TO_IMAGE_MODEL,
      mode: 'text-to-image',
      available: falAvailable,
      supportsReferenceCrop: false,
      supportsTransparentOutput: false,
    },
  ];
}

export function resolveDefaultReconstructionModel(
  capabilities: ReconstructionCapability[],
  assetHasReferenceCrop: boolean,
): string {
  const edit = capabilities.find(
    (c) => c.model === DEFAULT_RECONSTRUCTION_MODEL && c.available && c.supportsReferenceCrop,
  );
  if (assetHasReferenceCrop && edit) return edit.model;
  const fallback = capabilities.find((c) => c.available);
  return fallback?.model ?? DEFAULT_RECONSTRUCTION_MODEL;
}

export function discoverAllProviderCapabilities(env?: {
  falKey?: string;
  ideogramApiKey?: string;
  pixelcutApiKey?: string;
}) {
  return {
    reconstruction: discoverReconstructionCapabilities(env),
    backgroundRemoval: discoverBackgroundRemovalProviders(env),
    defaultReconstructionModel: DEFAULT_RECONSTRUCTION_MODEL,
  };
}
