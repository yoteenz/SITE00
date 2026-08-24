/**
 * Cultural / character calibration dimensions for Visual Reference Intelligence.
 */

import type { ReferenceCalibrationDimension } from '../site00-brand-lore/brandCharacterTerritory/constants.js';

export type ReferenceCalibrationAuthority = Partial<
  Record<ReferenceCalibrationDimension, 'NONE' | 'CALIBRATION_ONLY' | 'STRONG' | 'MODERATE'>
>;

export function classifyBurnBookReferenceAuthority(): ReferenceCalibrationAuthority {
  return {
    VISUAL_STYLE: 'NONE',
    ARTIFACT_BEHAVIOR: 'CALIBRATION_ONLY',
    CULTURAL_CALIBRATION: 'CALIBRATION_ONLY',
    CHARACTER_CALIBRATION: 'CALIBRATION_ONLY',
    HUMOR_CALIBRATION: 'CALIBRATION_ONLY',
    AUDIENCE_RELATIONSHIP: 'MODERATE',
    MATERIAL_BEHAVIOR: 'CALIBRATION_ONLY',
    TYPOGRAPHIC_BEHAVIOR: 'NONE',
    IMAGE_BEHAVIOR: 'CALIBRATION_ONLY',
    COMPOSITIONAL_BEHAVIOR: 'CALIBRATION_ONLY',
    TEMPORAL_CULTURE: 'MODERATE',
    SOCIAL_BEHAVIOR: 'CALIBRATION_ONLY',
  };
}

export function burnBookLiteralStyleAuthorityBlocked(): true {
  return true;
}

export function referenceMayHavePartialAuthority(): true {
  return true;
}
