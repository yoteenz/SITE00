/**
 * P0.VR.1D.13 — Full-screen ScreenImplementationSpec for Campaign Board.
 */

import type { RegionCodeSpec, ScreenImplementationSpec } from '../p0vr1d1/types.js';
import { NDX_CAMPAIGN_BOARD_ROUTE, NDX_CAMPAIGN_BOARD_VIEWPORT } from './constants.js';
import { buildCampaignBoardMobileVisualShellSpec } from './campaignBoardMobileVisualShellSpec.js';

function region(
  regionId: string,
  semanticRole: string,
  bounds: { x: number; y: number; width: number; height: number },
  interactionMode: RegionCodeSpec['interactionMode'] = 'static',
): RegionCodeSpec {
  const vp = NDX_CAMPAIGN_BOARD_VIEWPORT;
  return {
    regionId,
    semanticRole,
    xPx: bounds.x,
    yPx: bounds.y,
    widthPx: bounds.width,
    heightPx: bounds.height,
    xPercent: (bounds.x / vp.width) * 100,
    yPercent: (bounds.y / vp.height) * 100,
    widthPercent: (bounds.width / vp.width) * 100,
    heightPercent: (bounds.height / vp.height) * 100,
    layoutParent: null,
    positioningMode: semanticRole.includes('NAV') ? 'fixed' : 'relative',
    displayMode: 'block',
    gridTemplate: null,
    flexDirection: null,
    gapPx: 0,
    padding: '0',
    margin: '0',
    border: null,
    borderRadius: 0,
    background: null,
    zIndex: semanticRole.includes('NAV') ? 120 : 1,
    overflow: 'visible',
    assetId: null,
    textStyles: {},
    interactionMode,
  };
}

export function buildCampaignBoardFullScreenImplementationSpec(): ScreenImplementationSpec {
  const shell = buildCampaignBoardMobileVisualShellSpec();
  const gutter = shell.contentGutters.x;

  const regions: RegionCodeSpec[] = [
    region('ndx.campaign.screen', 'PAGE_SHELL', { x: 0, y: 0, width: shell.viewport.width, height: shell.viewport.height }),
    region('ndx.campaign.header', 'TOP_NAV', shell.headerBounds),
    region('ndx.campaign.breadcrumb', 'BREADCRUMB', shell.breadcrumbBounds),
    region('ndx.campaign.title', 'TITLE_BLOCK', shell.titleBounds),
    region('ndx.campaign.status', 'STATUS_CARD', shell.statusBounds),
    region('ndx.campaign.schedule', 'SCHEDULE_ROW', shell.scheduleBounds, 'button'),
    region('ndx.campaign.pages', 'PAGES_LANE', shell.pagesBounds, 'link'),
    region('ndx.campaign.page-card.1', 'PAGE_CARD', { x: gutter, y: shell.pagesBounds.y + 28, width: 148, height: 168 }, 'link'),
    region('ndx.campaign.page-card.2', 'PAGE_CARD', { x: gutter + 158, y: shell.pagesBounds.y + 28, width: 148, height: 168 }, 'link'),
    region('ndx.campaign.page-card.3', 'PAGE_CARD', { x: gutter + 316, y: shell.pagesBounds.y + 28, width: 148, height: 168 }, 'link'),
    region('ndx.campaign.page-card.4', 'PAGE_CARD', { x: gutter + 474, y: shell.pagesBounds.y + 28, width: 148, height: 168 }, 'link'),
    region('ndx.campaign.motion', 'MOTION_CARD', shell.motionBounds, 'link'),
    region('ndx.campaign.quick-actions', 'QUICK_ACTIONS', shell.quickActionsBounds, 'button'),
    region('ndx.campaign.bottom-nav', 'BOTTOM_NAV', shell.bottomNavBounds, 'link'),
  ];

  return {
    specId: 'ndx-campaign-board-full-screen-v1d13',
    screenId: 'MOBILE_CAMPAIGN_BOARD',
    route: NDX_CAMPAIGN_BOARD_ROUTE,
    referenceAuthorityId: shell.referencePath,
    referenceSource: 'FOUNDER_FULL_SCREEN_REFERENCE',
    viewportWidth: NDX_CAMPAIGN_BOARD_VIEWPORT.width,
    viewportHeight: NDX_CAMPAIGN_BOARD_VIEWPORT.height,
    layoutModel: 'FLOW',
    regions,
    components: regions.map((r) => ({ componentId: r.regionId, regionId: r.regionId, role: r.semanticRole })),
    typography: [],
    assets: [],
    fixedElements: ['ndx.campaign.header', 'ndx.campaign.bottom-nav'],
    stickyElements: ['ndx.campaign.header'],
    scrollRegions: ['ndx.campaign.screen'],
    responsiveMode: 'REFERENCE_LOCKED',
    doNotChangeRegions: [],
    referenceConfidence: 0.94,
    precisionOverrideAvailable: true,
  };
}
