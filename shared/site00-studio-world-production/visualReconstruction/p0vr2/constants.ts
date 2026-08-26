/**
 * P0.VR.2 — Master Design Reconstruction constants.
 */

export const P0_VR_2_LINEAGE = 'P0.VR.2' as const;

export const NDX_ICON_VISUAL_CANON_REFERENCE = {
  id: 'NDX_ICON_VISUAL_CANON_REFERENCE',
  source: 'visual-references/founder/ndxbook/ndx-icon-reference-sheet-p0ui3d.jpg',
  lineage: 'P0.UI.3D → P0.UI.3E',
} as const;

export const DESIGN_WORKSPACE_ROUTES = {
  master: '/studio-world/design',
  project: '/projects/:projectSlug/design',
} as const;

export const CANONICAL_VIEWPORT_DIMENSIONS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const;

export const P0_VR_2_FAILURE_CODES = [
  'FAIL_CANONICAL_REFERENCE_MISSING',
  'FAIL_REFERENCE_SCOPE_UNKNOWN',
  'FAIL_REFERENCE_NOT_PASSED_TO_RECONSTRUCTION',
  'FAIL_TEXT_DESCRIPTION_OVERRIDES_REFERENCE',
  'FAIL_INCORRECT_VISUAL_SHELL_PROTECTED',
  'FAIL_FUNCTIONAL_BEHAVIOR_MUTATED',
  'FAIL_PARENT_GEOMETRY_NOT_FIXED_FIRST',
  'FAIL_STALE_LOCK_BLOCKS_REBUILD',
  'FAIL_REFERENCE_ASSET_NOT_RESOLVED',
  'FAIL_FAL_TEXT_ONLY_WITH_REFERENCE_AVAILABLE',
  'FAIL_FULL_SCREEN_IMAGE_USED_AS_IMPLEMENTATION',
  'FAIL_SHARED_COMPONENT_IMPACT_UNSCOPED',
  'FAIL_MOBILE_DESKTOP_AUTHORITY_CONFLATED',
  'FAIL_IMPLEMENTATION_CANON_STALE',
] as const;

export const VISUAL_AUTHORITY_ORDER = [
  'CANONICAL_REFERENCE_IMAGE',
  'REFERENCE_GEOMETRY',
  'REFERENCE_TYPOGRAPHY',
  'REFERENCE_ASSET_PLACEMENT',
  'CURRENT_BRAND_CANON',
  'FUNCTIONAL_IMPLEMENTATION',
  'GENERIC_UI_HEURISTICS',
] as const;

export const PARENT_GEOMETRY_FIRST_ORDER = [
  'viewport',
  'shell',
  'header',
  'content_frame',
  'major_regions',
  'children',
  'assets',
  'typography',
  'micro_spacing',
] as const;

export const DESIGN_WORKSPACE_PROJECTS = [
  { slug: 'ndxbook', displayName: 'NDXBOOK' },
  { slug: 'studio-world', displayName: 'STUDIO WORLD' },
  { slug: 'frontal-slayer', displayName: 'FRONTAL SLAYER' },
  { slug: 'all-in-one-enterprises', displayName: 'All In One Enterprises' },
] as const;

export const DEFAULT_QA_THRESHOLDS = {
  structural: 0.72,
  visual: 0.82,
  pixel: 0.92,
} as const;
