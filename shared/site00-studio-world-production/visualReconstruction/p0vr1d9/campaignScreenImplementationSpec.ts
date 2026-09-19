/**
 * P0.VR.1D.9 — Full-screen ScreenImplementationSpec for Campaign Board (includes shell regions).
 */

import type { RegionCodeSpec, ScreenImplementationSpec } from '../p0vr1d1/types.js';
import { NDX_CAMPAIGN_BOARD_SHELL_ROUTE, NDX_MOBILE_REFERENCE_VIEWPORT } from './constants.js';
import { CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC } from './mobileScreenVisualShellSpec.js';

function shellRegion(
  regionId: string,
  semanticRole: string,
  bounds: { x: number; y: number; width: number; height: number },
  viewport: { width: number; height: number },
  interactionMode: RegionCodeSpec['interactionMode'] = 'static',
): RegionCodeSpec {
  return {
    regionId,
    semanticRole,
    xPx: bounds.x,
    yPx: bounds.y,
    widthPx: bounds.width,
    heightPx: bounds.height,
    xPercent: (bounds.x / viewport.width) * 100,
    yPercent: (bounds.y / viewport.height) * 100,
    widthPercent: (bounds.width / viewport.width) * 100,
    heightPercent: (bounds.height / viewport.height) * 100,
    layoutParent: null,
    positioningMode: semanticRole.includes('nav') ? 'fixed' : 'relative',
    displayMode: 'block',
    gridTemplate: null,
    flexDirection: null,
    gapPx: 0,
    padding: '0',
    margin: '0',
    border: null,
    borderRadius: 0,
    background: null,
    zIndex: semanticRole.includes('nav') ? 120 : 1,
    overflow: 'visible',
    assetId: null,
    textStyles: {},
    interactionMode,
  };
}

export function buildCampaignFullScreenImplementationSpec(): ScreenImplementationSpec {
  const shell = CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC;
  const vp = shell.viewport;
  const regions: RegionCodeSpec[] = [
    shellRegion('ndx.campaign.screen', 'PAGE_SHELL', { x: 0, y: 0, width: vp.width, height: vp.height }, vp),
    shellRegion('ndx.campaign.header-shell', 'TOP_NAV', shell.headerBounds, vp),
    shellRegion('ndx.campaign.content-shell', 'CENTER_PANEL', shell.contentBounds, vp, 'scroll'),
    shellRegion('ndx.campaign.day-selector', 'DAY_SELECTOR', {
      x: shell.contentBounds.x,
      y: shell.contentBounds.y + 88,
      width: shell.sectionWidth,
      height: 52,
    }, vp),
    shellRegion('ndx.campaign.pages', 'PAGES_LANE', {
      x: shell.contentBounds.x,
      y: shell.contentBounds.y + 160,
      width: shell.sectionWidth,
      height: 168,
    }, vp, 'scroll'),
    shellRegion('ndx.campaign.margins', 'MARGINS_ROW', {
      x: shell.contentBounds.x,
      y: shell.contentBounds.y + 360,
      width: shell.sectionWidth,
      height: 120,
    }, vp),
    shellRegion('ndx.campaign.motion', 'MOTION_CARD', {
      x: shell.contentBounds.x,
      y: shell.contentBounds.y + 500,
      width: shell.sectionWidth,
      height: 112,
    }, vp),
    shellRegion('ndx.campaign.bottom-nav-shell', 'BOTTOM_NAV', shell.bottomNavBounds, vp, 'link'),
  ];

  return {
    specId: 'ndx-campaign-full-screen-v1d9',
    screenId: 'MOBILE_CAMPAIGN_BOARD',
    route: NDX_CAMPAIGN_BOARD_SHELL_ROUTE,
    referenceAuthorityId: shell.referencePath,
    referenceSource: 'FOUNDER_FULL_SCREEN_REFERENCE',
    viewportWidth: NDX_MOBILE_REFERENCE_VIEWPORT.width,
    viewportHeight: NDX_MOBILE_REFERENCE_VIEWPORT.height,
    layoutModel: 'FLOW',
    regions,
    components: regions.map((r) => ({ componentId: r.regionId, regionId: r.regionId, role: r.semanticRole })),
    typography: [],
    assets: [],
    fixedElements: ['ndx.campaign.header-shell', 'ndx.campaign.bottom-nav-shell'],
    stickyElements: ['ndx.campaign.header-shell'],
    scrollRegions: ['ndx.campaign.content-shell'],
    responsiveMode: 'REFERENCE_LOCKED',
    doNotChangeRegions: [],
    referenceConfidence: 0.92,
    precisionOverrideAvailable: true,
  };
}
