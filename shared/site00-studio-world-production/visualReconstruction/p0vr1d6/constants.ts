/**
 * P0.VR.1D.6 — Campaign Board design correction lineage.
 */

export const P0_VR_1D6_LINEAGE = 'P0.VR.1D.6' as const;

export const FAIL_CAMPAIGN_LIME_DIAMOND_MISSING = 'FAIL_CAMPAIGN_LIME_DIAMOND_MISSING' as const;
export const FAIL_DAY_SELECTOR_GEOMETRY_DRIFT = 'FAIL_DAY_SELECTOR_GEOMETRY_DRIFT' as const;
export const FAIL_PAGES_ARTWORK_MISSING = 'FAIL_PAGES_ARTWORK_MISSING' as const;
export const FAIL_MARGINS_ARTWORK_MISSING = 'FAIL_MARGINS_ARTWORK_MISSING' as const;
export const FAIL_BOOK_IN_MOTION_ARTWORK_MISSING = 'FAIL_BOOK_IN_MOTION_ARTWORK_MISSING' as const;

export const NDX_CAMPAIGN_BOARD_REFERENCE_PATH =
  'visual-references/founder/ndxbook/mobile-campaign-board-reference.png' as const;

export const NDX_CAMPAIGN_BOARD_ROUTE = '/projects/ndxbook/content-operations/campaign-board' as const;

export const NDX_CAMPAIGN_BOARD_ROUTE_SEARCH = '?site00MobileLayout=1' as const;

export const NDX_CAMPAIGN_BOARD_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
} as const;

export const NDX_CAMPAIGN_BOARD_VR_REGION_IDS = [
  'ndx.header',
  'ndx.campaign.title',
  'ndx.campaign.day-selector',
  'ndx.campaign.pages',
  'ndx.campaign.pages.card.1',
  'ndx.campaign.pages.card.2',
  'ndx.campaign.margins',
  'ndx.campaign.margins.card.1',
  'ndx.campaign.margins.card.2',
  'ndx.campaign.margins.card.3',
  'ndx.campaign.motion',
  'ndx.bottom-nav',
] as const;
