/**
 * P0.VR.6R1 — Calibration constants.
 */

import { P0_VR_6R1_LINEAGE } from './types.js';
import type { CalibrationScreenId } from './types.js';

export { P0_VR_6R1_LINEAGE };

/** Mobile design authority canvas for normalization. */
export const CALIBRATION_CANVAS = { width: 390, height: 844 } as const;

export const CALIBRATION_REFERENCE_BASE = '/visual-references/founder/site00/calibration-p0vr6r1';

export const CALIBRATION_SCREEN_META: Record<
  CalibrationScreenId,
  { referenceFile: string; routeQuery: string }
> = {
  '01_ASSETS_UPLOAD': {
    referenceFile: '01-assets-upload.jpg',
    routeQuery: 'tab=ASSETS&assetStep=UPLOAD&viewport=mobile',
  },
  '02_ASSETS_INSTRUCT': {
    referenceFile: '02-assets-instruct.jpg',
    routeQuery: 'tab=ASSETS&assetStep=INSTRUCT&viewport=mobile',
  },
  '03_ASSETS_DETECT': {
    referenceFile: '03-assets-detect.jpg',
    routeQuery: 'tab=ASSETS&assetStep=DETECT&viewport=mobile',
  },
  '04_ASSETS_CROP': {
    referenceFile: '04-assets-crop.jpg',
    routeQuery: 'tab=ASSETS&assetStep=CONFIRM_CROP&viewport=mobile',
  },
  '05_ASSETS_RECONSTRUCT': {
    referenceFile: '05-assets-reconstruct.jpg',
    routeQuery: 'tab=ASSETS&assetStep=RECONSTRUCT&viewport=mobile',
  },
  '06_ASSETS_APPROVE': {
    referenceFile: '06-assets-approve.jpg',
    routeQuery: 'tab=ASSETS&assetStep=APPROVE&viewport=mobile',
  },
  '07_ASSETS_LIVE': {
    referenceFile: '07-assets-live.jpg',
    routeQuery: 'tab=ASSETS&assetStep=REPLACE&viewport=mobile',
  },
  '08_REFERENCES': {
    referenceFile: '08-references.jpg',
    routeQuery: 'tab=REFERENCES&viewport=mobile',
  },
  '09_PAGES': {
    referenceFile: '09-pages.jpg',
    routeQuery: 'tab=PAGES&viewport=mobile',
  },
  '10_HISTORY': {
    referenceFile: '10-history.jpg',
    routeQuery: 'tab=HISTORY&viewport=mobile',
  },
  '11_MORE': {
    referenceFile: '11-more.jpg',
    routeQuery: 'tab=MORE&viewport=mobile',
  },
};

export const CALIBRATION_ORDER = [
  'CANVAS_WIDTH',
  'SHARED_SHELL',
  'SECTION_START_POSITIONS',
  'COMPONENT_BOXES',
  'INTERNAL_PADDING',
  'TYPOGRAPHY',
  'IMAGE_ASSET_SCALE',
  'ICONS',
  'COLORS',
  'BORDERS_RADII',
  'MICRO_SPACING',
] as const;
