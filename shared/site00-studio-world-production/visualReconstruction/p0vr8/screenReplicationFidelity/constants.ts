/**
 * P0.VR.8-SRF — Screen Replication Fidelity / Asset-Deferred Convergence
 */

export const P0_VR_8_SRF_LINEAGE = 'P0.VR.8-SRF' as const;

export const ASSET_DEFERRED_STATES = [
  'CANONICAL_ASSET',
  'EXISTING_APPROVED_ASSET',
  'TEMPORARY_PLACEHOLDER',
  'ASSET_PENDING',
] as const;

export const AUTHORITY_REBUILD_CLASSES = [
  'HOST_LOCKED',
  'AUTHORITY_CONTROLLED',
  'FUNCTIONAL_ONLY',
  'ASSET_DEFERRED',
] as const;

export const SCREEN_REPLICATION_DIFFERENCE_CLASSES = [
  'STRUCTURAL_DRIFT',
  'GEOMETRY_DRIFT',
  'SPACING_DRIFT',
  'TYPOGRAPHY_DRIFT',
  'COMPOSITION_DRIFT',
  'CONTROL_DRIFT',
  'ASSET_DRIFT',
  'CONTENT_VARIANCE',
  'EXPECTED_DYNAMIC_VARIANCE',
  'TEMPLATE_DRIFT',
  'COMPOSITION_CLONING',
] as const;

export const STRUCTURAL_FIDELITY_THRESHOLDS = {
  STRUCTURE_MATCH: 95,
  GEOMETRY_MATCH: 95,
  SPACING_MATCH: 93,
  TYPOGRAPHY_MATCH: 92,
  COMPOSITION_MATCH: 95,
  CONTROL_MATCH: 95,
  INTERACTION_MATCH: 95,
  RESPONSIVE_MATCH: 90,
} as const;

export const HOST_BOUNDARY_SUSPECT_THRESHOLD = 0.55;

export const MAX_CONVERGENCE_PASSES = 8;

export const GOLDEN_NDX_OVERVIEW_MOBILE = {
  projectId: 'ndxbook',
  brandFamilyId: 'NDXBOOK',
  moduleId: 'PROJECTS',
  screenId: 'overview',
  packScreenType: 'PROJECT_OVERVIEW' as const,
  viewport: 'mobile' as const,
  route: '/projects/ndxbook/overview',
  authorityId: 'ndxbook:overview:mobile:v1',
  referencePath: '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
  viewportWidth: 390,
  viewportHeight: 844,
} as const;
