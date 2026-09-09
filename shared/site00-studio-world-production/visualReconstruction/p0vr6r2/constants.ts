/**
 * P0.VR.6R2 — Visual convergence constants.
 */

import { P0_VR_6R2_LINEAGE } from './types.js';

export { P0_VR_6R2_LINEAGE };

export const DEFAULT_MAX_AUTOMATIC_ITERATIONS = 3;
export const DEFAULT_OVERLAY_OPACITY = 0.5;

export const CORRECTION_PRIORITY_ORDER = [
  'CANVAS',
  'PARENT_GEOMETRY',
  'MAJOR_REGIONS',
  'COMPONENT_BOXES',
  'ASSET_POSITION_SCALE',
  'TYPOGRAPHY',
  'INTERNAL_SPACING',
  'COLORS',
  'BORDERS_RADII',
  'MICRO_DETAIL',
] as const;

export const DEFAULT_FIDELITY_SETTINGS = {
  defaultAuthorityMode: 'DESIGN_AUTHORITY' as const,
  defaultFidelityMode: 'EXACT' as const,
  maxAutoCorrectionPasses: DEFAULT_MAX_AUTOMATIC_ITERATIONS,
  requireOverlayQa: true,
  requireFounderApproval: false,
};

export const PIPELINE_STAGES_WITH_VISUAL_QA = [
  'REFERENCE',
  'ANALYZE',
  'PLAN',
  'IMPLEMENT',
  'VISUAL_QA',
  'CORRECT',
  'VERIFY',
  'LIVE',
] as const;

export { P0_VR_6R2_FAILURE_CODES } from './types.js';
