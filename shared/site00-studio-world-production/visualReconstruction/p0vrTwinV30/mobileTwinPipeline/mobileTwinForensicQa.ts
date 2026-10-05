/**
 * R6F2 repositioned as downstream forensic QA — not primary geometry source.
 */

import { R6F2_BLUEPRINT_ROLE } from './types.js';
import type { MobileTwinCompositionState } from './types.js';

export type MobileForensicQaReport = {
  role: typeof R6F2_BLUEPRINT_ROLE;
  primaryGeometrySource: 'MobileTwinCompositionState';
  secondaryQaSource: 'render_pixels_forensic';
  objectsCompared: number;
  note: string;
};

export function runMobileCompositionForensicQa(composition: MobileTwinCompositionState): MobileForensicQaReport {
  return {
    role: R6F2_BLUEPRINT_ROLE,
    primaryGeometrySource: 'MobileTwinCompositionState',
    secondaryQaSource: 'render_pixels_forensic',
    objectsCompared: composition.objectDefinitions.length,
    note: 'R6F2 pixel/boundary tools may validate render vs composition; they do not overwrite composition geometry.',
  };
}
