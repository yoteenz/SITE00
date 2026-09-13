/** P0.VR.TWINV3.0R1 — SITE 00 design page authority (NDXBOOK open, not NDXBOOK-owned shell). */
export const P0_VR_TWIN_V30_BUILD = 'v388' as const;

export const DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE = 'DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE' as const;
export const DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP = 'DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP' as const;

/** @deprecated R1 uses per-viewport locks above */
export const DESIGN_PAGE_V3_AUTHORITY_LOCK_ID = 'DESIGN_PAGE_V3_AUTHORITY_V1' as const;

export const DESIGN_PAGE_V3_PILOT_PROJECT_ID = 'ndxbook' as const;

export const DESIGN_PAGE_V3_HOST_PRODUCT_NAME = 'SITE 00' as const;

export const DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX = 430 as const;

export const DESIGN_PAGE_V3_WORKFLOW_PHASES = [
  'TARGET',
  'MASTER',
  'BUNDLE',
  'APPROVE',
  'BUILD',
  'FIDELITY',
] as const;

/** R1 authority areas — host frame first, client project second, workflow third. */
export const DESIGN_PAGE_V3_SKELETON_AREAS = [
  'SITE_00_PAGE_FRAME',
  'PRIMARY_WORK_AREA',
  'CLIENT_TARGET_CONTEXT',
  'DECISION_REVIEW_SURFACE',
  'STRUCTURED_ARTIFACT_GROUPING',
  'SECONDARY_DETAIL_ZONES',
] as const;

export const DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE = '/site00/twin-v3-design-page-authority' as const;
