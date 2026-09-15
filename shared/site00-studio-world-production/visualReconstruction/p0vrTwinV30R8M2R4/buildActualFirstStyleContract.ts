import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { CompositionRelationshipTargets } from './actualFirstTypes.js';
import { ACTUAL_FIRST_CSS_PREFIX } from './constants.js';

export type ActualFirstStyleContract = {
  id: string;
  hash: string;
  rootClass: string;
  cssVariables: Record<string, string>;
};

export function buildActualFirstStyleContract(input: {
  compositionTargets: CompositionRelationshipTargets;
  iterationCorrectionBoost: number;
}): ActualFirstStyleContract {
  const boost = input.iterationCorrectionBoost;
  const cssVariables: Record<string, string> = {
    '--af-hero-headline-col': `${Math.round((input.compositionTargets.headlineBlockWidthRatio + boost * 0.02) * 100)}%`,
    '--af-hero-artifact-col': `${Math.round(input.compositionTargets.artifactWidthRatio * 100)}%`,
    '--af-hero-authority-col': `${Math.round((1 - input.compositionTargets.headlineBlockWidthRatio - input.compositionTargets.artifactWidthRatio) * 100)}%`,
    '--af-gallery-gap': `${input.compositionTargets.galleryCardGapPx}px`,
    '--af-section-gap': `${input.compositionTargets.sectionVerticalSpacingPx}px`,
    '--af-lime-cap': `${Math.max(0.12, 0.18 - boost * 0.02)}`,
  };
  const body = JSON.stringify(cssVariables);
  return {
    id: `afsc-${fnv1aHex(body).slice(0, 10)}`,
    hash: fnv1aHex(body),
    rootClass: ACTUAL_FIRST_CSS_PREFIX,
    cssVariables,
  };
}
