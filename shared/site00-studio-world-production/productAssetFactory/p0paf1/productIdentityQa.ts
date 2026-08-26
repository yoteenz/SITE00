/**
 * P0.PAF.1 — Product identity QA (drift detection).
 */

import type {
  BackgroundMode,
  CompiledProductVariantPrompt,
  ProductIdentityQaResult,
  ProductMasterHero,
  QaFailCode,
} from './types.js';

export function evaluateProductIdentityQa(input: {
  masterHero: ProductMasterHero;
  prompt: CompiledProductVariantPrompt;
  backgroundMode: BackgroundMode;
  targetAxes: Record<string, string>;
  simulatedPass?: boolean;
}): ProductIdentityQaResult {
  const failures: QaFailCode[] = [];
  const checks: Record<string, boolean> = {
    silhouette: true,
    hairline: true,
    lace: true,
    density: true,
    length: true,
    camera: true,
    crop: true,
    pose: true,
    mannequinIdentity: true,
    background: true,
    targetVariationAccuracy: true,
  };

  if (!input.prompt.imageReferencePrimary) {
    failures.push('FAIL_PRODUCT_IDENTITY_DRIFT');
    checks.silhouette = false;
  }

  if (input.prompt.textToImagePrimary) {
    failures.push('FAIL_PRODUCT_IDENTITY_DRIFT');
  }

  const colorOnly = isColorOnlyTarget(input.targetAxes);
  if (colorOnly) {
    const colorQa = evaluateColorQa(input.targetAxes, input.simulatedPass ?? true);
    if (!colorQa.colorMatch) failures.push('FAIL_VARIANT_TARGET_MISSED');
    if (!colorQa.strandDetailPreserved) failures.push('FAIL_STRAND_DETAIL_LOST');
    if (colorQa.colorBleed) failures.push('FAIL_COLOR_BLEED');

    let alphaQuality: boolean | undefined;
    let canvasAligned: boolean | undefined;
    if (
      input.backgroundMode === 'TRANSPARENT_CUTOUT' ||
      input.backgroundMode === 'REMOVE_BACKGROUND'
    ) {
      const alphaQa = evaluateTransparentCanvasQa(input.simulatedPass ?? true);
      alphaQuality = alphaQa.alphaQuality;
      canvasAligned = alphaQa.canvasAligned;
      if (!alphaQa.alphaQuality) failures.push('FAIL_ALPHA_HALO');
      if (!alphaQa.strandRetention) failures.push('FAIL_HAIR_STRAND_CUTOUT');
      if (!alphaQa.canvasAligned) failures.push('FAIL_VARIANT_CANVAS_MISALIGNMENT');
    }

    return {
      passed: failures.length === 0,
      failures,
      checks,
      colorMatch: colorQa.colorMatch,
      strandDetailPreserved: colorQa.strandDetailPreserved,
      alphaQuality,
      canvasAligned,
    };
  }

  if (input.targetAxes.STYLE) {
    if (!checks.targetVariationAccuracy) failures.push('FAIL_UNREQUESTED_STYLE_CHANGE');
  }

  if (
    input.backgroundMode === 'TRANSPARENT_CUTOUT' ||
    input.backgroundMode === 'REMOVE_BACKGROUND'
  ) {
    const alphaQa = evaluateTransparentCanvasQa(input.simulatedPass ?? true);
    if (!alphaQa.alphaQuality) failures.push('FAIL_ALPHA_HALO');
    if (!alphaQa.strandRetention) failures.push('FAIL_HAIR_STRAND_CUTOUT');
    if (!alphaQa.canvasAligned) failures.push('FAIL_VARIANT_CANVAS_MISALIGNMENT');
    return {
      passed: failures.length === 0,
      failures,
      checks,
      alphaQuality: alphaQa.alphaQuality,
      canvasAligned: alphaQa.canvasAligned,
    };
  }

  if (input.simulatedPass === false) {
    failures.push('FAIL_PRODUCT_IDENTITY_DRIFT');
    checks.silhouette = false;
  }

  return { passed: failures.length === 0, failures, checks };
}

export function evaluateColorQa(
  targetAxes: Record<string, string>,
  simulatedPass: boolean,
): { colorMatch: boolean; strandDetailPreserved: boolean; colorBleed: boolean } {
  return {
    colorMatch: simulatedPass && Boolean(targetAxes.COLOR || targetAxes.variantValue),
    strandDetailPreserved: simulatedPass,
    colorBleed: !simulatedPass,
  };
}

export function evaluateTransparentCanvasQa(simulatedPass: boolean): {
  alphaQuality: boolean;
  strandRetention: boolean;
  canvasAligned: boolean;
} {
  return {
    alphaQuality: simulatedPass,
    strandRetention: simulatedPass,
    canvasAligned: simulatedPass,
  };
}

function isColorOnlyTarget(axes: Record<string, string>): boolean {
  if (axes.variantType === 'COLOR') return true;
  return Boolean(axes.COLOR) && !axes.STYLE && !axes.TEXTURE;
}

export function evaluateStyleQa(passed: boolean): { passed: boolean; failures: QaFailCode[] } {
  return passed
    ? { passed: true, failures: [] }
    : { passed: false, failures: ['FAIL_UNREQUESTED_STYLE_CHANGE'] };
}
