/**
 * P0.VR.1D.3 — Single-screen NDX overview menu-open constants.
 */

export const P0_VR_1D3_LINEAGE = 'P0.VR.1D.3' as const;

export const NDX_OVERVIEW_MENU_OPEN_SCREEN_ID = 'MOBILE_OVERVIEW_MENU_OPEN' as const;

export const NDX_OVERVIEW_MENU_OPEN_REFERENCE_PATH =
  'visual-references/founder/ndxbook/mobile-overview-menu-open.png' as const;

export const NDX_OVERVIEW_MENU_OPEN_ROUTE = '/projects/ndxbook' as const;

export const NDX_OVERVIEW_VR_REGION_IDS = [
  'ndx.header',
  'ndx.overview.hero',
  'ndx.overview.metrics',
  'ndx.production.row',
  'ndx.radar.list',
  'ndx.bottom-nav',
  'ndx.project.menu',
] as const;

export const NDX_OVERVIEW_MENU_OPEN_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  safeAreaTop: 47,
  safeAreaBottom: 34,
} as const;

export const NDX_OVERVIEW_MENU_OPEN_ROUTE_SEARCH = '?site00MobileLayout=1&vrMenuOpen=1' as const;
