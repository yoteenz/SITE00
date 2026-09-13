export const P0_VR_TWIN_V28_BUILD = 'v383' as const;

export const FAL_TWIN_GENERATION_MODES = [
  'SINGLE_CALL_MULTI_OUTPUT',
  'COORDINATED_DUAL_CALL',
  'AUTHORITY_PLUS_SIBLING_REFERENCE',
  'UNPROVEN',
] as const;

export const FAL_CAPABILITY_CLASSIFICATIONS = [
  'FAL_PARALLEL_TWIN_CAPABILITY_PROVEN',
  'FAL_PARALLEL_TWIN_CAPABILITY_PARTIAL',
  'FAL_PARALLEL_TWIN_CAPABILITY_FAILED',
] as const;

export const FAL_TWIN_FAILURE_CODES = [
  'FAL_TWIN_OUTPUT_NOT_PROVEN',
  'FAL_BLUEPRINT_TWIN_DRIFT',
  'FAL_BLUEPRINT_NOT_SURGICAL',
  'FAL_PARALLEL_TWIN_CAPABILITY_FAILED',
] as const;

/** Required object IDs for NDXBOOK overview mobile FAL twin proof pilot. */
export const MINIMAL_TWIN_REQUIRED_OBJECT_IDS = [
  'masthead.projectMark',
  'masthead.projectName',
  'masthead.status',
  'sectionNav.overview',
  'sectionNav.identity',
  'sectionNav.evolve',
  'sectionNav.production',
  'sectionNav.reviews',
  'sectionNav.library',
  'hero.eyebrow',
  'hero.headline',
  'hero.body',
  'hero.primaryAsset',
  'hero.ndxOverlay',
  'progress.percent',
  'progress.track',
  'progress.fill',
  'progress.phase',
  'metrics.entryCount.label',
  'metrics.entryCount.value',
  'metrics.sourceCount.label',
  'metrics.sourceCount.value',
  'focus.title',
  'focus.body',
  'focus.cta',
  'milestone.title',
  'activity.row01',
] as const;

export const ASSET_PROOF_OBJECT_IDS = ['hero.ndxOverlay', 'hero.decorativeGraphic'] as const;
