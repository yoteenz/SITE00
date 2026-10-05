/**
 * P0.VR.1D.13 — Campaign Board mobile visual shell spec from full-screen reference.
 */

import {
  CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY,
  CAMPAIGN_BOARD_REFERENCE_SCOPE,
  NDX_CAMPAIGN_BOARD_V1D13_REFERENCE_PATH,
  NDX_CAMPAIGN_BOARD_ROUTE,
  NDX_CAMPAIGN_BOARD_VIEWPORT,
} from './constants.js';

export type CampaignBoardMobileVisualShellSpec = {
  authorityId: typeof CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY;
  scope: typeof CAMPAIGN_BOARD_REFERENCE_SCOPE;
  viewport: typeof NDX_CAMPAIGN_BOARD_VIEWPORT;
  background: string;
  route: typeof NDX_CAMPAIGN_BOARD_ROUTE;
  referencePath: typeof NDX_CAMPAIGN_BOARD_V1D13_REFERENCE_PATH;
  headerBounds: { x: number; y: number; width: number; height: number };
  contentBounds: { x: number; y: number; width: number; height: number };
  contentGutters: { x: number; y: number };
  breadcrumbBounds: { x: number; y: number; width: number; height: number };
  titleBounds: { x: number; y: number; width: number; height: number };
  statusBounds: { x: number; y: number; width: number; height: number };
  scheduleBounds: { x: number; y: number; width: number; height: number };
  pagesBounds: { x: number; y: number; width: number; height: number };
  motionBounds: { x: number; y: number; width: number; height: number };
  quickActionsBounds: { x: number; y: number; width: number; height: number };
  bottomNavBounds: { x: number; y: number; width: number; height: number };
  sectionGaps: {
    headerToBreadcrumb: number;
    breadcrumbToTitle: number;
    titleToStatus: number;
    statusToSchedule: number;
    scheduleToPages: number;
    pagesToMotion: number;
    motionToQuickActions: number;
    quickActionsToNav: number;
  };
  zLayers: { header: number; content: number; bottomNav: number };
};

const GUTTER_X = 20;
const HEADER_H = 52;
const BOTTOM_NAV_H = 56;

export function buildCampaignBoardMobileVisualShellSpec(): CampaignBoardMobileVisualShellSpec {
  const { width, height } = NDX_CAMPAIGN_BOARD_VIEWPORT;
  const contentWidth = width - GUTTER_X * 2;
  const contentTop = HEADER_H + 1;
  const contentHeight = height - contentTop - BOTTOM_NAV_H;

  return {
    authorityId: CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY,
    scope: CAMPAIGN_BOARD_REFERENCE_SCOPE,
    viewport: NDX_CAMPAIGN_BOARD_VIEWPORT,
    background: 'var(--ndx-paper, #faf8f5)',
    route: NDX_CAMPAIGN_BOARD_ROUTE,
    referencePath: NDX_CAMPAIGN_BOARD_V1D13_REFERENCE_PATH,
    headerBounds: { x: 0, y: 0, width, height: HEADER_H },
    contentBounds: { x: GUTTER_X, y: contentTop, width: contentWidth, height: contentHeight },
    contentGutters: { x: GUTTER_X, y: 12 },
    breadcrumbBounds: { x: GUTTER_X, y: contentTop + 8, width: contentWidth, height: 16 },
    titleBounds: { x: GUTTER_X, y: contentTop + 28, width: contentWidth, height: 88 },
    statusBounds: { x: GUTTER_X, y: contentTop + 124, width: contentWidth, height: 72 },
    scheduleBounds: { x: GUTTER_X, y: contentTop + 212, width: contentWidth, height: 88 },
    pagesBounds: { x: GUTTER_X, y: contentTop + 316, width: contentWidth, height: 220 },
    motionBounds: { x: GUTTER_X, y: contentTop + 552, width: contentWidth, height: 160 },
    quickActionsBounds: { x: GUTTER_X, y: contentTop + 728, width: contentWidth, height: 200 },
    bottomNavBounds: { x: 0, y: height - BOTTOM_NAV_H, width, height: BOTTOM_NAV_H },
    sectionGaps: {
      headerToBreadcrumb: 8,
      breadcrumbToTitle: 4,
      titleToStatus: 12,
      statusToSchedule: 16,
      scheduleToPages: 16,
      pagesToMotion: 16,
      motionToQuickActions: 16,
      quickActionsToNav: 24,
    },
    zLayers: { header: 20, content: 1, bottomNav: 120 },
  };
}
