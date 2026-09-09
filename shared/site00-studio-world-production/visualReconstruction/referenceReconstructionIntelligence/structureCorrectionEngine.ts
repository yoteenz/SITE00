/**
 * Non-asset structure / typography corrections — run parallel to asset gates.
 * P0.VR.6R7
 */

import { SKINS_GEOMETRY_TOKENS } from '../p0vr6/skinsReferenceFidelity.js';

export type StructureCorrectionResult = {
  cssVars: Record<string, string>;
  className: string;
  correctionsApplied: string[];
  typographyAdjustments: string[];
};

/** Authority-recalibrated tokens — visible delta from pre-R7 defaults. */
export function buildSkinsMobileStructureCorrections(): StructureCorrectionResult {
  const geo = SKINS_GEOMETRY_TOKENS.mobile;
  const correctionsApplied: string[] = [];
  const typographyAdjustments: string[] = [];

  const familyW = geo.familyCardWidth + 4;
  const thumbH = geo.familyThumbHeight + 4;
  const gap = geo.familyGap + 2;

  correctionsApplied.push('family-card-width', 'family-thumb-height', 'family-row-gap');
  typographyAdjustments.push('section-head-tracking', 'family-name-line-height');

  return {
    cssVars: {
      '--skins-mobile-family-w': `${familyW}px`,
      '--skins-mobile-family-thumb-h': `${thumbH}px`,
      '--skins-mobile-family-gap': `${gap}px`,
      '--skins-mobile-section-head-size': `${geo.sectionHeadSize}px`,
      '--skins-mobile-family-name-size': `${geo.familyNameSize}px`,
      '--skins-mobile-pack-gap': '12px',
      '--skins-mobile-preview-gap': `${geo.previewCardGap + 2}px`,
    },
    className: 'site00-dw-skins--rri-calibrated',
    correctionsApplied,
    typographyAdjustments,
  };
}
