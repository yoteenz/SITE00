/**
 * P0.VR.1D.A — NDXBOOK project hub reference board decomposition.
 * Desktop + mobile moodboards are separate visual authorities.
 */

import { decomposeMoodboardIntoScreens } from '../../site00-studio-world-production/visualReconstruction/p0vr1d/moodboardScreenExtraction.js';
import {
  createCanonicalRouteVisualAuthority,
  resolveWebVisualReferenceAsset,
} from '../../site00-studio-world-production/visualReconstruction/index.js';
import type { ReferenceBoard, ScreenReference } from '../../site00-studio-world-production/visualReconstruction/p0vr1d/types.js';
import { NDX_FOUNDER_REFERENCE_PATHS } from './ndxVisualReconstructionAdapter.js';

export const NDX_PROJECT_HUB_DESKTOP_BOARD_ID = 'ndxbook-founder-workspace-desktop-board' as const;
export const NDX_PROJECT_HUB_MOBILE_BOARD_ID = 'ndxbook-founder-workspace-mobile-board' as const;

/** Normalized regions on the desktop reference board (Image A authority). */
export const NDX_DESKTOP_BOARD_REGIONS = [
  { regionId: 'LEFT_RAIL', label: 'Navigation rail', x: 0, y: 0, width: 0.12, height: 1 },
  { regionId: 'OVERVIEW_PANEL', label: 'Overview · Content Operations + Performance', x: 0.13, y: 0.04, width: 0.34, height: 0.46 },
  { regionId: 'CAMPAIGN_BOARD', label: 'Campaign Board · Week 01', x: 0.48, y: 0.04, width: 0.28, height: 0.46 },
  { regionId: 'EXPERIMENT_01', label: 'Experiments Hub · Experiment 01', x: 0.77, y: 0.04, width: 0.21, height: 0.46 },
  { regionId: 'CULTURAL_INTELLIGENCE', label: 'Cultural Intelligence', x: 0.13, y: 0.52, width: 0.18, height: 0.38 },
  { regionId: 'CHARACTER_LAB', label: 'Character Lab', x: 0.32, y: 0.52, width: 0.18, height: 0.38 },
  { regionId: 'PERFORMANCE_LEARNING', label: 'Performance + Learning', x: 0.51, y: 0.52, width: 0.16, height: 0.38 },
  { regionId: 'CONTENT_OPS_DESK', label: 'Content Ops Desk', x: 0.68, y: 0.52, width: 0.16, height: 0.38 },
  { regionId: 'EXPERIMENT_REVIEW', label: 'Experiment 01 Review', x: 0.85, y: 0.52, width: 0.13, height: 0.38 },
  { regionId: 'FOOTER_NAV', label: 'Footer navigation', x: 0.13, y: 0.92, width: 0.84, height: 0.06 },
] as const;

/** Mobile board — six independent screen authorities (Image B). */
export const NDX_MOBILE_SCREEN_SPECS = [
  { screenId: 'MOBILE_OVERVIEW', routeSuffix: '', label: 'Overview Home', x: 0.01, y: 0.06, width: 0.155, height: 0.88 },
  { screenId: 'MOBILE_CAMPAIGN', routeSuffix: '/content-operations/campaign-board', label: 'Campaign Board', x: 0.175, y: 0.06, width: 0.155, height: 0.88 },
  { screenId: 'MOBILE_EXPERIMENT_01', routeSuffix: '/marketing-expression/experiment-01', label: 'Experiment 01', x: 0.34, y: 0.06, width: 0.155, height: 0.88 },
  { screenId: 'MOBILE_CONTENT_OPS', routeSuffix: '/content-operations', label: 'Content Ops Desk', x: 0.505, y: 0.06, width: 0.155, height: 0.88 },
  { screenId: 'MOBILE_CULTURAL_INTELLIGENCE', routeSuffix: '/cultural-intelligence', label: 'Cultural Intelligence', x: 0.67, y: 0.06, width: 0.155, height: 0.88 },
  { screenId: 'MOBILE_CHARACTER_LAB', routeSuffix: '/character/discovery', label: 'Character Lab', x: 0.835, y: 0.06, width: 0.155, height: 0.88 },
] as const;

export type NdxProjectHubScreenReference = ScreenReference & {
  routePath: string;
  moduleLabel: string;
};

export function decomposeNdxDesktopReferenceBoard(input: {
  imageWidth: number;
  imageHeight: number;
}): ReferenceBoard {
  return decomposeMoodboardIntoScreens({
    boardAssetId: NDX_PROJECT_HUB_DESKTOP_BOARD_ID,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    screenBounds: [{ x: 0.02, y: 0.02, width: 0.96, height: 0.96, type: 'desktop' }],
  });
}

export function decomposeNdxMobileReferenceBoard(input: {
  imageWidth: number;
  imageHeight: number;
}): ReferenceBoard {
  return decomposeMoodboardIntoScreens({
    boardAssetId: NDX_PROJECT_HUB_MOBILE_BOARD_ID,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    screenBounds: NDX_MOBILE_SCREEN_SPECS.map((spec) => ({
      x: spec.x,
      y: spec.y,
      width: spec.width,
      height: spec.height,
      type: 'mobile' as const,
    })),
  });
}

export function bindNdxProjectHubScreenReferences(projectSlug: string): NdxProjectHubScreenReference[] {
  const mobileBoard = decomposeNdxMobileReferenceBoard({ imageWidth: 390 * 6, imageHeight: 844 });
  return mobileBoard.screens.map((screen, index) => {
    const spec = NDX_MOBILE_SCREEN_SPECS[index]!;
    return {
      ...screen,
      routePath: `/projects/${projectSlug}${spec.routeSuffix}`,
      moduleLabel: spec.label,
    };
  });
}

export function createNdxProjectHubRouteAuthorities(projectSlug: string) {
  const desktopAsset = resolveWebVisualReferenceAsset({
    assetId: NDX_PROJECT_HUB_DESKTOP_BOARD_ID,
    sourceType: 'APPROVED_SCREENSHOT',
    source: NDX_FOUNDER_REFERENCE_PATHS.desktop,
  });
  const mobileAsset = resolveWebVisualReferenceAsset({
    assetId: NDX_PROJECT_HUB_MOBILE_BOARD_ID,
    sourceType: 'APPROVED_SCREENSHOT',
    source: NDX_FOUNDER_REFERENCE_PATHS.mobile,
  });

  const overviewRoute = `/projects/${projectSlug}`;
  const mobileScreens = bindNdxProjectHubScreenReferences(projectSlug);

  return {
    desktopOverview: createCanonicalRouteVisualAuthority({
      route: overviewRoute,
      projectSlug,
      desktopRef: desktopAsset.resolvedUrl
        ? {
            referenceAssetId: desktopAsset.assetId,
            referenceImageUrl: desktopAsset.resolvedUrl,
            surfaceType: 'founder-workspace-desktop-board',
            viewportClass: 'desktop',
            viewportWidth: desktopAsset.width,
            viewportHeight: desktopAsset.height,
            aspectRatio: desktopAsset.width / Math.max(desktopAsset.height, 1),
            deviceClass: 'desktop',
            authorityStatus: 'REFERENCE_READY',
            sourceType: 'APPROVED_SCREENSHOT',
            workflowMode: 'WEBSITE_RECONSTRUCTION',
            responsiveMode: 'REFERENCE_LOCKED',
            createdAt: new Date().toISOString(),
            imageAuthorityPath: desktopAsset.resolvedUrl,
          }
        : null,
      mobileRef: mobileAsset.resolvedUrl
        ? {
            referenceAssetId: mobileAsset.assetId,
            referenceImageUrl: mobileAsset.resolvedUrl,
            surfaceType: 'founder-workspace-mobile-board',
            viewportClass: 'mobile',
            viewportWidth: mobileAsset.width,
            viewportHeight: mobileAsset.height,
            aspectRatio: mobileAsset.width / Math.max(mobileAsset.height, 1),
            deviceClass: 'mobile',
            authorityStatus: 'REFERENCE_READY',
            sourceType: 'APPROVED_SCREENSHOT',
            workflowMode: 'WEBSITE_RECONSTRUCTION',
            responsiveMode: 'REFERENCE_LOCKED',
            createdAt: new Date().toISOString(),
            imageAuthorityPath: mobileAsset.resolvedUrl,
          }
        : null,
      approvedVersion: 'P0.VR.1D.A',
    }),
    mobileScreens,
    desktopRegions: NDX_DESKTOP_BOARD_REGIONS,
  };
}

export function projectHubUsesImageReferenceNotTextPrimary(): true {
  return true;
}
