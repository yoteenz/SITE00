/**
 * P0.VR.1D.13 — Campaign Board full-screen reference rebuild lineage.
 */

export const P0_VR_1D13_LINEAGE = 'P0.VR.1D.13' as const;

export const CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY = 'CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY' as const;

export const CAMPAIGN_BOARD_REFERENCE_SCOPE = 'FULL_SCREEN_REFERENCE' as const;

export const NDX_CAMPAIGN_BOARD_V1D13_REFERENCE_PATH =
  'visual-references/founder/ndxbook/mobile-campaign-board-reference-p0vr1d13.jpg' as const;

export const NDX_CAMPAIGN_BOARD_ROUTE = '/projects/ndxbook/content-operations/campaign-board' as const;

export const NDX_CAMPAIGN_BOARD_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
} as const;

export const FAIL_CAMPAIGN_OLD_SHELL_PRESERVED = 'FAIL_CAMPAIGN_OLD_SHELL_PRESERVED' as const;
export const FAIL_CAMPAIGN_REFERENCE_NOT_FULL_SCREEN_AUTHORITY = 'FAIL_CAMPAIGN_REFERENCE_NOT_FULL_SCREEN_AUTHORITY' as const;
export const FAIL_CAMPAIGN_STATUS_CARD_GEOMETRY_DRIFT = 'FAIL_CAMPAIGN_STATUS_CARD_GEOMETRY_DRIFT' as const;
export const FAIL_CAMPAIGN_SCHEDULE_GEOMETRY_DRIFT = 'FAIL_CAMPAIGN_SCHEDULE_GEOMETRY_DRIFT' as const;
export const FAIL_CAMPAIGN_PAGE_CARD_GEOMETRY_DRIFT = 'FAIL_CAMPAIGN_PAGE_CARD_GEOMETRY_DRIFT' as const;
export const FAIL_CAMPAIGN_PAGE_ART_MISSING = 'FAIL_CAMPAIGN_PAGE_ART_MISSING' as const;
export const FAIL_BOOK_IN_MOTION_ART_MISSING = 'FAIL_BOOK_IN_MOTION_ART_MISSING' as const;
export const FAIL_QUICK_ACTION_LAYOUT_DRIFT = 'FAIL_QUICK_ACTION_LAYOUT_DRIFT' as const;
export const FAIL_FAL_TEXT_TO_IMAGE_USED_WHEN_REFERENCE_AVAILABLE = 'FAIL_FAL_TEXT_TO_IMAGE_USED_WHEN_REFERENCE_AVAILABLE' as const;
export const FAIL_CAMPAIGN_BOTTOM_NAV_DRIFT = 'FAIL_CAMPAIGN_BOTTOM_NAV_DRIFT' as const;
export const FAIL_PREVIOUS_CAMPAIGN_LOCK_BLOCKS_REBUILD = 'FAIL_PREVIOUS_CAMPAIGN_LOCK_BLOCKS_REBUILD' as const;
export const FAIL_CAMPAIGN_LOADING_FLASHES_OLD_SHELL = 'FAIL_CAMPAIGN_LOADING_FLASHES_OLD_SHELL' as const;

export const STALE_AFTER_CAMPAIGN_REFERENCE_REBUILD = 'STALE_AFTER_CAMPAIGN_REFERENCE_REBUILD' as const;

export const NDX_CAMPAIGN_V1D13_VR_REGION_IDS = [
  'ndx.campaign.screen',
  'ndx.campaign.header',
  'ndx.campaign.breadcrumb',
  'ndx.campaign.title',
  'ndx.campaign.status',
  'ndx.campaign.schedule',
  'ndx.campaign.pages',
  'ndx.campaign.page-card.1',
  'ndx.campaign.page-card.2',
  'ndx.campaign.page-card.3',
  'ndx.campaign.page-card.4',
  'ndx.campaign.motion',
  'ndx.campaign.quick-actions',
  'ndx.campaign.bottom-nav',
] as const;
