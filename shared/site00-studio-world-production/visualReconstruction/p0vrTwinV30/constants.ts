export const P0_VR_TWIN_V30_BUILD = 'v386' as const;

/** Locked when founder approves both mobile + desktop authorities. */
export const DESIGN_PAGE_V3_AUTHORITY_LOCK_ID = 'DESIGN_PAGE_V3_AUTHORITY_V1' as const;

export const DESIGN_PAGE_V3_PILOT_PROJECT_ID = 'ndxbook' as const;

export const DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX = 430 as const;

export const DESIGN_PAGE_V3_WORKFLOW_PHASES = [
  'TARGET',
  'MASTER',
  'BUNDLE',
  'APPROVE',
  'BUILD',
  'FIDELITY',
] as const;

export const DESIGN_PAGE_V3_SKELETON_AREAS = [
  'TARGET_CONTEXT',
  'WORKFLOW_JOURNEY',
  'CURRENT_DECISION',
  'MASTER_CONCEPT_WORKSPACE',
  'DERIVATIVE_BUNDLE_WORKSPACE',
  'ASSET_WORKSPACE',
  'FUNCTION_OWNERSHIP_WORKSPACE',
  'COMPILER_READINESS',
  'BUILD',
  'FIDELITY_REVIEW',
  'TECHNICAL_DETAILS',
] as const;

export const DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE = '/site00/twin-v3-design-page-authority' as const;
