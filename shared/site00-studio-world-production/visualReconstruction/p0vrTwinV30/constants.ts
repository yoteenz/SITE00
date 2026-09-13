/** P0.VR.TWINV3.0R2 — SITE 00 design page authority lock (zero host/client ambiguity). */
export const P0_VR_TWIN_V30_BUILD = 'v389' as const;

export const P0_VR_TWIN_V30R2_LINEAGE = 'P0.VR.TWINV3.0R2' as const;

export const DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE = 'DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE' as const;
export const DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP = 'DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP' as const;

/** @deprecated use per-viewport locks */
export const DESIGN_PAGE_V3_AUTHORITY_LOCK_ID = 'DESIGN_PAGE_V3_AUTHORITY_V1' as const;

export const DESIGN_PAGE_V3_PILOT_PROJECT_ID = 'ndxbook' as const;

export const DESIGN_PAGE_V3_HOST_PRODUCT_NAME = 'SITE 00' as const;

export const DESIGN_PAGE_V3_CANONICAL_PATH = 'SITE 00 → PROJECT: NDXBOOK → PAGE: DESIGN' as const;

export const DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX = 430 as const;

export const DESIGN_PAGE_V3_WORKFLOW_PHASES = [
  'TARGET',
  'MASTER',
  'BUNDLE',
  'APPROVE',
  'BUILD',
  'FIDELITY',
] as const;

/** R2 required page zones (A–G) — order is hierarchy. */
export const DESIGN_PAGE_V3_SKELETON_AREAS = [
  'HOST_HEADER_PAGE_FRAME',
  'TARGET_CONTEXT_STRIP',
  'PRIMARY_WORKSPACE_PANEL',
  'DECISION_BAR_ACTION_BAND',
  'STRUCTURED_OUTPUT_REVIEW_SYSTEM',
  'PIPELINE_STATE_READINESS',
  'SECONDARY_DETAIL_EXPANDABLE',
] as const;

export const DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE = '/site00/twin-v3-design-page-authority' as const;

export const DESIGN_PAGE_V3_R2_PROTOTYPE_MOBILE = `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/mobile-authority-r2.svg` as const;
export const DESIGN_PAGE_V3_R2_PROTOTYPE_DESKTOP = `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/desktop-authority-r2.svg` as const;
