/**
 * P0.VR.1D.9 — Mobile shell reconstruction constants + failure taxonomy.
 */

export const P0_VR_1D9_LINEAGE = 'P0.VR.1D.9' as const;

export const FAIL_EXISTING_SHELL_INCORRECTLY_PROTECTED = 'FAIL_EXISTING_SHELL_INCORRECTLY_PROTECTED' as const;
export const FAIL_REFERENCE_SHELL_NOT_IMPLEMENTED = 'FAIL_REFERENCE_SHELL_NOT_IMPLEMENTED' as const;
export const FAIL_CONTENT_WRAPPER_WIDTH_DRIFT = 'FAIL_CONTENT_WRAPPER_WIDTH_DRIFT' as const;
export const FAIL_HEADER_SHELL_GEOMETRY_DRIFT = 'FAIL_HEADER_SHELL_GEOMETRY_DRIFT' as const;
export const FAIL_PAGE_GUTTER_DRIFT = 'FAIL_PAGE_GUTTER_DRIFT' as const;
export const FAIL_SECTION_FRAME_DRIFT = 'FAIL_SECTION_FRAME_DRIFT' as const;
export const FAIL_BOTTOM_NAV_SHELL_DRIFT = 'FAIL_BOTTOM_NAV_SHELL_DRIFT' as const;
export const FAIL_GIANT_CONTAINER_NOT_IN_REFERENCE = 'FAIL_GIANT_CONTAINER_NOT_IN_REFERENCE' as const;
export const FAIL_CHILD_LOCKED_BEFORE_PARENT_GEOMETRY = 'FAIL_CHILD_LOCKED_BEFORE_PARENT_GEOMETRY' as const;
export const FAIL_STALE_LOCK_BLOCKING_SHELL_REBUILD = 'FAIL_STALE_LOCK_BLOCKING_SHELL_REBUILD' as const;

export const NDX_MOBILE_REFERENCE_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
} as const;

export const NDX_CAMPAIGN_BOARD_SHELL_ROUTE = '/projects/ndxbook/content-operations/campaign-board' as const;
export const NDX_LAB_EXPERIMENT_01_SHELL_ROUTE = '/projects/ndxbook/marketing-expression/experiment-01' as const;
export const NDX_MOBILE_SHELL_ROUTE_SEARCH = '?site00MobileLayout=1' as const;

export const NDX_CAMPAIGN_SHELL_VR_REGION_IDS = [
  'ndx.campaign.screen',
  'ndx.campaign.header-shell',
  'ndx.campaign.content-shell',
  'ndx.campaign.day-selector',
  'ndx.campaign.pages',
  'ndx.campaign.margins',
  'ndx.campaign.motion',
  'ndx.campaign.bottom-nav-shell',
] as const;

export const NDX_LAB_SHELL_VR_REGION_IDS = [
  'ndx.lab.screen',
  'ndx.lab.header-shell',
  'ndx.lab.content-shell',
  'ndx.lab.breadcrumb',
  'ndx.lab.title',
  'ndx.lab.metrics',
  'ndx.lab.grid',
  'ndx.lab.direction',
  'ndx.lab.bottom-nav-shell',
] as const;

/** Parent shell regions evaluated before child content locks (PARENT_GEOMETRY_FIRST). */
export const PARENT_SHELL_REGION_ORDER = [
  'ndx.campaign.screen',
  'ndx.campaign.header-shell',
  'ndx.campaign.content-shell',
  'ndx.campaign.bottom-nav-shell',
  'ndx.lab.screen',
  'ndx.lab.header-shell',
  'ndx.lab.content-shell',
  'ndx.lab.bottom-nav-shell',
] as const;

export const SHELL_MATCH_TOLERANCE_PX = 4;
