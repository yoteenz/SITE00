import type { NDXIconName } from '../types.js';

export const NDX_ICON_VISUAL_VERSION = 'NDX_ICON_V1_REFERENCE_TRACED' as const;

export const NDX_ICON_VISUAL_AUTHORITY_ID = 'ndx-icon-visual-reference-authority-v1' as const;

export const NDX_ICON_REFERENCE_SOURCE_ID = 'ndxbook-founder-workspace-mobile-board' as const;

export const NDX_ICON_REFERENCE_ASSET_PATH =
  'tests/fixtures/visual-reconstruction/ndxbook-workspace-mobile-primary.png' as const;

/** MOBILE_OVERVIEW screen on Image B mood board (normalized board coords). */
export const NDX_ICON_MOBILE_OVERVIEW_SCREEN = {
  x: 0.01,
  y: 0.06,
  width: 0.155,
  height: 0.88,
} as const;

/** Icon crop bounds normalized within MOBILE_OVERVIEW phone frame (0–1). */
export const NDX_ICON_CROP_BOUNDS: Record<string, { x: number; y: number; width: number; height: number }> = {
  notifications: { x: 0.76, y: 0.018, width: 0.1, height: 0.055 },
  ellipsis: { x: 0.88, y: 0.018, width: 0.1, height: 0.055 },
  overview: { x: 0.04, y: 0.905, width: 0.14, height: 0.07 },
  campaigns: { x: 0.24, y: 0.905, width: 0.14, height: 0.07 },
  content_ops: { x: 0.44, y: 0.905, width: 0.14, height: 0.07 },
  lab: { x: 0.64, y: 0.905, width: 0.14, height: 0.07 },
  more: { x: 0.84, y: 0.905, width: 0.14, height: 0.07 },
  project_overview: { x: 0.62, y: 0.22, width: 0.12, height: 0.045 },
  project_settings: { x: 0.62, y: 0.28, width: 0.12, height: 0.045 },
  back_to_projects: { x: 0.62, y: 0.34, width: 0.12, height: 0.045 },
  return_to_origin: { x: 0.62, y: 0.4, width: 0.12, height: 0.045 },
  inspect: { x: 0.62, y: 0.46, width: 0.12, height: 0.045 },
  help: { x: 0.62, y: 0.52, width: 0.12, height: 0.045 },
  experiments_hub: { x: 0.04, y: 0.905, width: 0.14, height: 0.07 },
  campaign_board: { x: 0.24, y: 0.905, width: 0.14, height: 0.07 },
  cultural_intelligence: { x: 0.64, y: 0.905, width: 0.14, height: 0.07 },
  character_lab: { x: 0.64, y: 0.905, width: 0.14, height: 0.07 },
  performance_learning: { x: 0.44, y: 0.905, width: 0.14, height: 0.07 },
  archive: { x: 0.84, y: 0.905, width: 0.14, height: 0.07 },
};

export const NDX_ICON_FAILURE_TAXONOMY = [
  'FAIL_ICON_SEMANTIC_SUBSTITUTION',
  'FAIL_ICON_REFERENCE_NOT_USED',
  'FAIL_ICON_SILHOUETTE_DRIFT',
  'FAIL_ICON_STROKE_DRIFT',
  'FAIL_ICON_PROPORTION_DRIFT',
  'FAIL_ICON_OPTICAL_SIZE_DRIFT',
  'FAIL_ICON_BASELINE_DRIFT',
  'FAIL_ICON_ACTIVE_STATE_DRIFT',
  'FAIL_NON_SVG_ICON_FALLBACK',
  'FAIL_EMOJI_ICON_RENDER',
  'FAIL_ICON_GENERIC_LIBRARY_FALLBACK',
  'FAIL_ICON_OVERLAY_NOT_RUN',
] as const;

export type NdxIconFailureCode = (typeof NDX_ICON_FAILURE_TAXONOMY)[number];

export const NDX_ICON_FIRST_PASS_TRACED: NDXIconName[] = [
  'overview',
  'campaigns',
  'content_ops',
  'lab',
  'more',
  'notifications',
  'ellipsis',
  'project_overview',
  'project_settings',
  'back_to_projects',
  'return_to_origin',
  'inspect',
  'help',
];

export const NDX_ICON_EXTENDED_TRACED: NDXIconName[] = [
  'experiments_hub',
  'campaign_board',
  'cultural_intelligence',
  'character_lab',
  'performance_learning',
  'archive',
];
