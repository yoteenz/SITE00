/**
 * Provider routing — image-reference-capable providers for screenshot-faithful reconstruction.
 */

import type { WebReconstructionProviderCapability } from './types.js';

export type WebReconstructionProvider = {
  providerId: string;
  capability: WebReconstructionProviderCapability;
  supportsVisionInput: boolean;
  supportsImageToImage: boolean;
  supportsReferenceImage: boolean;
  supportsMultiImage: boolean;
  supportsLayoutAwareInput: boolean;
};

export const WEB_RECONSTRUCTION_PROVIDERS: WebReconstructionProvider[] = [
  {
    providerId: 'fal-gpt-image',
    capability: 'REFERENCE_STRONG',
    supportsVisionInput: true,
    supportsImageToImage: true,
    supportsReferenceImage: true,
    supportsMultiImage: true,
    supportsLayoutAwareInput: true,
  },
  {
    providerId: 'anthropic-vision',
    capability: 'REFERENCE_SUPPORTED',
    supportsVisionInput: true,
    supportsImageToImage: false,
    supportsReferenceImage: true,
    supportsMultiImage: true,
    supportsLayoutAwareInput: true,
  },
  {
    providerId: 'anthropic-text',
    capability: 'TEXT_ONLY',
    supportsVisionInput: false,
    supportsImageToImage: false,
    supportsReferenceImage: false,
    supportsMultiImage: false,
    supportsLayoutAwareInput: false,
  },
];

export function selectProviderForScreenshotReconstruction(
  providers: WebReconstructionProvider[] = WEB_RECONSTRUCTION_PROVIDERS,
): WebReconstructionProvider | null {
  const ranked = [...providers].sort((a, b) => {
    const order: WebReconstructionProviderCapability[] = [
      'REFERENCE_STRONG',
      'REFERENCE_SUPPORTED',
      'TEXT_ONLY',
      'UNSUITABLE',
    ];
    return order.indexOf(a.capability) - order.indexOf(b.capability);
  });
  const best = ranked.find((p) => p.capability !== 'TEXT_ONLY' && p.capability !== 'UNSUITABLE');
  return best ?? null;
}

export function textOnlyProviderBlockedAsPrimary(
  provider: WebReconstructionProvider,
  workflowMode: 'WEBSITE_RECONSTRUCTION' | 'WEBSITE_DESIGN_GENERATION',
): boolean {
  if (workflowMode !== 'WEBSITE_RECONSTRUCTION') return false;
  return provider.capability === 'TEXT_ONLY';
}
