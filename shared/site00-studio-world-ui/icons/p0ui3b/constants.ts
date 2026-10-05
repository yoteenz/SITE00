import type { NDXIconName } from '../types.js';
import type { ExactIconReferenceCrop } from './types.js';

export const NDX_ICON_VISUAL_VERSION_V2 = 'NDX_ICON_V2_PIXEL_TRACED' as const;

export const NDX_ICON_PIXEL_AUTHORITY_ID = 'ndx-icon-pixel-reference-authority-v2' as const;

export const NDX_ICON_PIXEL_REFERENCE_SOURCE_ID = 'ndxbook-mobile-overview-menu-open' as const;

export const NDX_ICON_PIXEL_REFERENCE_ASSET_PATH =
  'visual-references/founder/ndxbook/mobile-overview-menu-open.png' as const;

export const NDX_ICON_PIXEL_IMAGE_WIDTH = 941;
export const NDX_ICON_PIXEL_IMAGE_HEIGHT = 1672;

/** Absolute pixel crops from approved mobile-overview-menu-open.png (icon-only, labels excluded). */
function crop(
  iconName: NDXIconName,
  x: number,
  y: number,
  w: number,
  h: number,
  activeState: 'inactive' | 'active' = 'inactive',
): ExactIconReferenceCrop {
  return {
    iconName,
    sourceReferenceId: NDX_ICON_PIXEL_REFERENCE_SOURCE_ID,
    cropX: x,
    cropY: y,
    cropWidth: w,
    cropHeight: h,
    referenceScale: 1,
    activeState,
    foregroundColor: activeState === 'active' ? '#c8e600' : '#2a2a24',
    backgroundColor: '#f5f0e6',
  };
}

export const NDX_ICON_V2_CROPS: Record<string, ExactIconReferenceCrop> = {
  overview: crop('overview', 53, 1538, 69, 49, 'active'),
  campaigns: crop('campaigns', 238, 1538, 74, 49),
  content_ops: crop('content_ops', 393, 1538, 74, 49),
  lab: crop('lab', 555, 1538, 50, 49),
  more: crop('more', 708, 1538, 38, 49),
  notifications: crop('notifications', 752, 53, 47, 68),
  ellipsis: crop('ellipsis', 793, 53, 35, 70),
  project_overview: crop('project_overview', 53, 1538, 69, 49, 'active'),
  back_to_projects: crop('back_to_projects', 533, 357, 44, 22),
  return_to_origin: crop('return_to_origin', 528, 408, 48, 36),
  inspect: crop('inspect', 533, 450, 36, 21),
  help: crop('help', 533, 512, 44, 21),
  experiments_hub: crop('experiments_hub', 53, 1538, 69, 49, 'active'),
  campaign_board: crop('campaign_board', 238, 1538, 74, 49),
  cultural_intelligence: crop('cultural_intelligence', 393, 1538, 74, 49),
  character_lab: crop('character_lab', 555, 1538, 50, 49),
  performance_learning: crop('performance_learning', 393, 1538, 74, 49),
  archive: crop('archive', 708, 1538, 38, 49),
  project_settings: crop('project_settings', 533, 357, 44, 22),
};

export const NDX_ICON_V2_PRIORITY: NDXIconName[] = [
  'overview',
  'content_ops',
  'campaigns',
  'notifications',
  'lab',
  'more',
  'ellipsis',
  'back_to_projects',
  'return_to_origin',
  'inspect',
  'help',
  'project_overview',
];

export const NDX_ICON_V2_FAILURE_TAXONOMY = [
  'FAIL_ICON_SEMANTIC_SUBSTITUTION',
  'FAIL_ICON_REFERENCE_NOT_USED',
  'FAIL_ICON_SILHOUETTE_DRIFT',
  'FAIL_ICON_STROKE_DRIFT',
  'FAIL_ICON_PROPORTION_DRIFT',
  'FAIL_ICON_OPTICAL_SIZE_DRIFT',
  'FAIL_ICON_OVERLAY_NOT_RUN',
  'FAIL_ICON_GENERIC_LIBRARY_FALLBACK',
] as const;

/** Reference silhouette classes for semantic substitution detection. */
export const NDX_ICON_REFERENCE_SILHOUETTE: Partial<Record<NDXIconName, string>> = {
  overview: 'HOUSE',
  campaigns: 'CLAPPER',
  content_ops: 'CIRCLE_TARGET',
  lab: 'FLASK',
  more: 'DOTS',
  ellipsis: 'DOTS',
  notifications: 'BELL',
  back_to_projects: 'EXIT_ARROW',
  return_to_origin: 'GLOBE',
  inspect: 'MAGNIFIER',
  help: 'QUESTION_CIRCLE',
};

/** V0 semantic silhouettes that must NOT appear in V2 implementation. */
export const NDX_ICON_V0_SEMANTIC_SILHOUETTE: Partial<Record<NDXIconName, string>> = {
  overview: 'GRID',
  campaigns: 'DOCUMENT',
  content_ops: 'DOCUMENT',
};
