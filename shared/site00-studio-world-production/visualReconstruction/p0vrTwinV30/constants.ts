/** Founder manual override unlock for Method A + benchmark path. */
export const P0_VR_TWIN_V30_BUILD = 'v469' as const;

/** NDXBOOK: auto materialize founder package + twin cache; hide manual founder gate UI (temporary). */
export const MOBILE_TWIN_NDXBOOK_AUTOBUILD_NO_MANUAL_GATES_V1 = true as const;

/** Bump when client must one-time reset persisted gallery (independent of buildRef). */
export const AUTHORITY_GALLERY_RECOVERY_EPOCH = 2 as const;

export const P0_VR_TWIN_V30R2_LINEAGE = 'P0.VR.TWINV3.0R2' as const;
export const P0_VR_TWIN_V30R3_LINEAGE = 'P0.VR.TWINV3.0R3' as const;
export const P0_VR_TWIN_V30R4_LINEAGE = 'P0.VR.TWINV3.0R4' as const;
export const P0_VR_TWIN_V30R5_LINEAGE = 'P0.VR.TWINV3.0R5' as const;
export const P0_VR_TWIN_V30R5F1_LINEAGE = 'P0.VR.TWINV3.0R5F1' as const;
export const P0_VR_TWIN_V30R5F2_LINEAGE = 'P0.VR.TWINV3.0R5F2' as const;
export const P0_VR_TWIN_V30R6_LINEAGE = 'P0.VR.TWINV3.0R6' as const;
export const P0_VR_TWIN_V30R6F1_LINEAGE = 'P0.VR.TWINV3.0R6F1' as const;
export const P0_VR_TWIN_V30R6F2_LINEAGE = 'P0.VR.TWINV3.0R6F2' as const;
export const P0_VR_TWIN_V30R7M_LINEAGE = 'P0.VR.TWINV3.0R7M' as const;
export const P0_VR_TWIN_V30R7MF1_LINEAGE = 'P0.VR.TWINV3.0R7MF1' as const;
export const P0_VR_TWIN_V30R7MF2_LINEAGE = 'P0.VR.TWINV3.0R7MF2' as const;
export const P0_VR_TWIN_V30R7MF3_LINEAGE = 'P0.VR.TWINV3.0R7MF3' as const;
export const P0_VR_TWIN_V30R7MF3P1_LINEAGE = 'P0.VR.TWINV3.0R7MF3P1' as const;
export const P0_VR_TWIN_V30R7MF3P2_LINEAGE = 'P0.VR.TWINV3.0R7MF3P2' as const;
export const P0_VR_TWIN_V30R7MF3P3_LINEAGE = 'P0.VR.TWINV3.0R7MF3P3' as const;
export const P0_VR_TWIN_V30R7MF3P4_LINEAGE = 'P0.VR.TWINV3.0R7MF3P4' as const;
export const P0_VR_TWIN_V30R7MF3P5_LINEAGE = 'P0.VR.TWINV3.0R7MF3P5' as const;
export const P0_VR_TWIN_V30R7MF3P6_LINEAGE = 'P0.VR.TWINV3.0R7MF3P6' as const;
export const P0_VR_TWIN_V30R7MF3P6F1_LINEAGE = 'P0.VR.TWINV3.0R7MF3P6F1' as const;
export const P0_VR_TWIN_V30R7MF3P7_LINEAGE = 'P0.VR.TWINV3.0R7MF3P7' as const;
export const P0_VR_TWIN_V30R8M_LINEAGE = 'P0.VR.TWINV3.0R8M' as const;

/** Tracked defect — injection unblocks pipeline; gallery display fix is separate. */
export const AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_ID = 'AUTHORITY_IMAGE_DISPLAY_BROKEN' as const;
export const AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_STATUS = 'OPEN' as const;

export const DESIGN_WORKSPACE_FEATURE_MANIFEST_V1 = 'design-workspace-feature-manifest-v1' as const;

export const DESIGN_WORKSPACE_TYPE_DESIGN_PAGE_V3 = 'DESIGN_PAGE_V3' as const;

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

/** Immutable founder-attached authority assets (R5F2 recovery). SHA256 of original JPG bytes. */
export const FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER = {
  originalFilename: 'mobile-master.jpg',
  publicPath: `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/founder-r5f2-ndxbook/mobile-master.jpg`,
  originalFileHashSha256: 'd6468fd91c15bcb596e88015eddf7a4a37304934309a6a3e0b8932620c852cca',
  mimeType: 'image/jpeg',
  widthPx: 1200,
  heightPx: 2600,
} as const;

export const FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER = {
  originalFilename: 'desktop-master.jpg',
  publicPath: `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/founder-r5f2-ndxbook/desktop-master.jpg`,
  originalFileHashSha256: '72573e0293ca43e96ceec74f55249b6359d1f4fcfc90642e77332e73be5e4002',
  mimeType: 'image/jpeg',
  widthPx: 2400,
  heightPx: 1600,
} as const;

export const DESIGN_PAGE_V3_R2_PROTOTYPE_MOBILE = `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/mobile-authority-r2.svg` as const;
export const DESIGN_PAGE_V3_R2_PROTOTYPE_DESKTOP = `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/desktop-authority-r2.svg` as const;

export const DESIGN_PAGE_V3_R3_TERRITORY_PROTOTYPES = {
  A: {
    mobile: `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/mobile-territory-a-r3.svg`,
    desktop: `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/desktop-territory-a-r3.svg`,
  },
  B: {
    mobile: `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/mobile-territory-b-r3.svg`,
    desktop: `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/desktop-territory-b-r3.svg`,
  },
  C: {
    mobile: `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/mobile-territory-c-r3.svg`,
    desktop: `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/desktop-territory-c-r3.svg`,
  },
} as const;
