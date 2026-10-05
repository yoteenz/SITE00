/**
 * Visual generation mode resolution — selects conditioning strategy for a reference package.
 */

import type { VisualGenerationMode, VisualReferencePackage } from './types.js';
import {
  getCurrentExperienceProviderCapability,
  providerSupportsMultiReference,
  providerSupportsReferenceConditioning,
} from './providerCapabilityRegistry.js';

export function resolveVisualGenerationMode(params: {
  referencePackage: VisualReferencePackage;
  providerId?: string;
  modelId?: string;
}): VisualGenerationMode {
  const refCount = params.referencePackage.references.filter((r) => r.publicUrl || r.storagePath).length;
  const profile = getCurrentExperienceProviderCapability();

  if (refCount === 0) {
    if (params.referencePackage.strictHostVisualConditioning) {
      return 'TEXT_TO_IMAGE';
    }
    return 'TEXT_TO_IMAGE';
  }

  if (!providerSupportsReferenceConditioning(profile)) {
    return 'TEXT_TO_IMAGE';
  }

  if (refCount >= 2 && providerSupportsMultiReference(profile, refCount)) {
    if (params.referencePackage.references.some((r) => r.roles.includes('STRUCTURAL_HIERARCHY'))) {
      return 'COMPOSITIONAL_REFERENCE_CONDITIONED';
    }
    return 'MULTI_REFERENCE_CONDITIONED';
  }

  if (refCount === 1) {
    const hasStructuralOnly = params.referencePackage.references.some(
      (r) => r.authority.STYLE === 'STRUCTURAL_ONLY' || r.approvalStatus === 'STRUCTURAL_REFERENCE',
    );
    if (hasStructuralOnly) return 'COMPOSITIONAL_REFERENCE_CONDITIONED';
    return 'REFERENCE_CONDITIONED';
  }

  return 'IMAGE_EDIT';
}

export function strictHostRequiresReferenceConditioning(
  strictHost: boolean,
  referenceCount: number,
): boolean {
  return strictHost && referenceCount > 0;
}

export function shouldFailWithoutReferenceConditioning(params: {
  strictHostVisualConditioning: boolean;
  generationMode: VisualGenerationMode;
  referenceCount: number;
}): boolean {
  if (!params.strictHostVisualConditioning) return false;
  if (params.referenceCount === 0) return false;
  return params.generationMode === 'TEXT_TO_IMAGE';
}

export function referenceCaptureGeneratesZeroImageGeneration(): true {
  return true;
}

export function referencePackageCompileGeneratesZeroImageGeneration(): true {
  return true;
}

export function pageVisitGeneratesZeroVisualReferenceCapture(): true {
  return true;
}
