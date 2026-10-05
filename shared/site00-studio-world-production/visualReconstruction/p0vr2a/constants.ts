/**
 * P0.VR.2A — Reference asset slot compiler constants.
 */

import { P0_VR_2A_LINEAGE } from './types.js';

export { P0_VR_2A_LINEAGE };

export const P0_VR_2A_FAILURE_CODES = [
  'FAIL_REFERENCE_ASSET_SLOT_MISSING',
  'FAIL_ASSET_SLOT_GEOMETRY_UNKNOWN',
  'FAIL_FAL_PROMPT_MISSING',
  'FAIL_FAL_PROMPT_IGNORES_REFERENCE',
  'FAIL_FAL_ASSET_WRONG_ASPECT_RATIO',
  'FAIL_FAL_ASSET_INCOMPATIBLE_WITH_CROP',
  'FAIL_GENERATED_ASSET_NOT_BOUND_TO_SLOT',
  'FAIL_ASSET_BIND_CAUSES_LAYOUT_SHIFT',
  'FAIL_EXISTING_ASSET_REGENERATED_UNNECESSARILY',
  'FAIL_FULL_SCREEN_RECONSTRUCTION_BLOCKED_ON_ASSET_GENERATION',
  'FAIL_CHARACTER_ASSET_GENERATED_WITHOUT_IDENTITY_AUTHORITY',
] as const;

export const DEFAULT_SAFE_AREA_INSET = 0.08;

export const DEFAULT_PRODUCTION_DENSITY = 4 as const;

export const FAL_PROVIDER_CAPABILITIES = {
  imageReferenceEdit: { provider: 'fal', model: 'fal-ai/flux-pro/kontext', fidelity: 'high' },
  characterIdentity: { provider: 'fal', model: 'fal-ai/flux-pro/kontext', fidelity: 'identity' },
  materialReconstruction: { provider: 'fal', model: 'fal-ai/flux-pro/kontext', fidelity: 'material' },
  graphicReconstruction: { provider: 'fal', model: 'fal-ai/flux-pro/kontext', fidelity: 'graphic' },
} as const;

export const INTERACTIVE_REGION_CLASSIFICATIONS: readonly string[] = ['DOM_UI', 'DOM_TEXT', 'SVG_ICON'];

export const FAL_ELIGIBLE_CLASSIFICATIONS: readonly string[] = ['IMAGE_ASSET', 'MATERIAL_TEXTURE', 'MIXED_REGION'];

export const DESIGN_WORKSPACE_DEEP_LINK = '/projects/site00/design';
