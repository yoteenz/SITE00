/**
 * P0.PAF.1 — FAL provider routing for product variant tasks.
 */

import { FAL_PRODUCT_PROVIDER_CAPABILITIES } from './constants.js';
import type { BackgroundMode, VariationAxis } from './types.js';

export type ProductFalRoute = {
  provider: string;
  model: string;
  mode: 'image-reference' | 'text-to-image' | 'multi-reference';
  task: string;
  reason: string;
};

export function routeProductFalProvider(input: {
  hasMasterHero: boolean;
  variationAxes: Record<string, string>;
  backgroundMode: BackgroundMode;
  styleReferenceUrl?: string | null;
  explicitNewConcept?: boolean;
}): ProductFalRoute {
  if (input.hasMasterHero && !input.explicitNewConcept) {
    if (input.styleReferenceUrl) {
      return {
        provider: FAL_PRODUCT_PROVIDER_CAPABILITIES.multiReferenceEdit.provider,
        model: FAL_PRODUCT_PROVIDER_CAPABILITIES.multiReferenceEdit.model,
        mode: 'multi-reference',
        task: 'MULTI_REFERENCE_EDIT',
        reason: 'Master hero identity + style reference authority',
      };
    }

    if (input.backgroundMode === 'TRANSPARENT_CUTOUT' || input.backgroundMode === 'REMOVE_BACKGROUND') {
      const colorOnly = isColorOnlyEdit(input.variationAxes);
      if (colorOnly) {
        return {
          provider: FAL_PRODUCT_PROVIDER_CAPABILITIES.hairColorEdit.provider,
          model: FAL_PRODUCT_PROVIDER_CAPABILITIES.hairColorEdit.model,
          mode: 'image-reference',
          task: 'HAIR_COLOR_EDIT',
          reason: 'Color edit with background removal',
        };
      }
      return {
        provider: FAL_PRODUCT_PROVIDER_CAPABILITIES.backgroundRemoval.provider,
        model: FAL_PRODUCT_PROVIDER_CAPABILITIES.backgroundRemoval.model,
        mode: 'image-reference',
        task: 'BACKGROUND_REMOVAL',
        reason: 'Isolated product cutout',
      };
    }

    if (isColorOnlyEdit(input.variationAxes)) {
      return {
        provider: FAL_PRODUCT_PROVIDER_CAPABILITIES.hairColorEdit.provider,
        model: FAL_PRODUCT_PROVIDER_CAPABILITIES.hairColorEdit.model,
        mode: 'image-reference',
        task: 'HAIR_COLOR_EDIT',
        reason: 'Hair color only — preserve all non-hair attributes',
      };
    }

    if (input.variationAxes.STYLE) {
      return {
        provider: FAL_PRODUCT_PROVIDER_CAPABILITIES.hairStyleEdit.provider,
        model: FAL_PRODUCT_PROVIDER_CAPABILITIES.hairStyleEdit.model,
        mode: 'image-reference',
        task: 'HAIR_STYLE_EDIT',
        reason: 'Style transformation with master hero identity lock',
      };
    }

    return {
      provider: FAL_PRODUCT_PROVIDER_CAPABILITIES.productFidelity.provider,
      model: FAL_PRODUCT_PROVIDER_CAPABILITIES.productFidelity.model,
      mode: 'image-reference',
      task: 'PRODUCT_FIDELITY',
      reason: 'Master hero image-reference edit',
    };
  }

  return {
    provider: 'blocked',
    model: 'none',
    mode: 'text-to-image',
    task: 'BLOCKED',
    reason: 'TEXT_TO_IMAGE blocked for canonical master derivatives',
  };
}

export function textToImageBlockedForCanonicalDerivative(hasMasterHero: boolean, explicitNewConcept?: boolean): boolean {
  return hasMasterHero && !explicitNewConcept;
}

export function imageReferenceRequiredForMasterDerivative(hasMasterHero: boolean): boolean {
  return hasMasterHero;
}

function isColorOnlyEdit(axes: Record<string, string>): boolean {
  const keys = Object.keys(axes);
  if (keys.length === 1 && keys[0] === 'COLOR') return true;
  if (keys.includes('COLOR') && !keys.includes('STYLE') && !keys.includes('TEXTURE')) return true;
  if (keys.includes('variantType') && axes.variantType === 'COLOR') return true;
  return false;
}

export function resolveTaskForAxis(axis: VariationAxis): string {
  switch (axis) {
    case 'COLOR':
      return 'HAIR_COLOR_EDIT';
    case 'STYLE':
      return 'HAIR_STYLE_EDIT';
    case 'TEXTURE':
      return 'TEXTURE_EDIT';
    default:
      return 'PRODUCT_FIDELITY';
  }
}
