/**
 * P0.VR.1D.A + P0.VR.1D.1 — NDXBOOK project hub reference board decomposition.
 * Desktop + mobile moodboards are separate visual authorities.
 * P0.VR.1D.1: mood-board auto screen extraction is default input path.
 */

import {
  runMoodBoardScreenExtractionPipeline,
  applyFullScreenOverrideToScreens,
  buildScreenImplementationSpecFromReference,
  runDomPatchConvergencePipeline,
  moodBoardIngestionSufficientByDefault,
} from '../../site00-studio-world-production/visualReconstruction/p0vr1d1/index.js';
import type {
  ExtractedScreenReference,
  MoodBoardScreenExtractionResult,
} from '../../site00-studio-world-production/visualReconstruction/p0vr1d1/types.js';
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

/** Desktop mood board — distinct screen compositions (P0.VR.1D.1 auto-extraction). */
export const NDX_DESKTOP_SCREEN_SPECS = [
  {
    screenId: 'DESKTOP_COMPOSITE_OVERVIEW',
    routeSuffix: '',
    label: 'Overview · Content Operations + Performance Learning',
    x: 0.02,
    y: 0.02,
    width: 0.96,
    height: 0.96,
    surfaceType: 'founder-workspace-desktop-composite',
  },
  {
    screenId: 'DESKTOP_CAMPAIGN_BOARD',
    routeSuffix: '/content-operations/campaign-board',
    label: 'Campaign Board',
    x: 0.48,
    y: 0.04,
    width: 0.28,
    height: 0.46,
    surfaceType: 'campaign-board-panel',
  },
  {
    screenId: 'DESKTOP_EXPERIMENT_01',
    routeSuffix: '/marketing-expression/experiment-01',
    label: 'Experiment 01',
    x: 0.77,
    y: 0.04,
    width: 0.21,
    height: 0.46,
    surfaceType: 'experiment-01-panel',
  },
  {
    screenId: 'DESKTOP_CONTENT_OPS',
    routeSuffix: '/content-operations',
    label: 'Content Ops Desk',
    x: 0.68,
    y: 0.52,
    width: 0.16,
    height: 0.38,
    surfaceType: 'content-ops-panel',
  },
  {
    screenId: 'DESKTOP_CULTURAL_INTELLIGENCE',
    routeSuffix: '/cultural-intelligence',
    label: 'Cultural Intelligence',
    x: 0.13,
    y: 0.52,
    width: 0.18,
    height: 0.38,
    surfaceType: 'cultural-intelligence-panel',
  },
  {
    screenId: 'DESKTOP_CHARACTER_LAB',
    routeSuffix: '/character/discovery',
    label: 'Character Lab / Performance',
    x: 0.32,
    y: 0.52,
    width: 0.18,
    height: 0.38,
    surfaceType: 'character-lab-panel',
  },
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

export type NdxExtractedScreenReference = ExtractedScreenReference & {
  routePath: string;
};

function bindRoutePaths(projectSlug: string, screens: ExtractedScreenReference[]): NdxExtractedScreenReference[] {
  const allSpecs = [...NDX_DESKTOP_SCREEN_SPECS, ...NDX_MOBILE_SCREEN_SPECS];
  return screens.map((screen) => {
    const spec = allSpecs.find((s) => s.screenId === screen.screenId);
    const routeSuffix = spec && 'routeSuffix' in spec ? spec.routeSuffix : '';
    const label = spec && 'label' in spec ? spec.label : screen.surfaceType;
    return {
      ...screen,
      routePath: `/projects/${projectSlug}${routeSuffix}`,
      moduleLabel: label,
      route: `/projects/${projectSlug}${routeSuffix}`,
    };
  });
}

export function ingestNdxDesktopMoodBoard(input: {
  imageWidth: number;
  imageHeight: number;
  sourceAssetPath?: string;
}): MoodBoardScreenExtractionResult {
  return runMoodBoardScreenExtractionPipeline({
    boardAssetId: NDX_PROJECT_HUB_DESKTOP_BOARD_ID,
    sourceAssetPath: input.sourceAssetPath ?? NDX_FOUNDER_REFERENCE_PATHS.desktop,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    viewportClass: 'desktop',
    screenBounds: NDX_DESKTOP_SCREEN_SPECS.map((spec) => ({
      screenId: spec.screenId,
      x: spec.x,
      y: spec.y,
      width: spec.width,
      height: spec.height,
      type: 'desktop' as const,
      route: spec.routeSuffix ? `/projects/ndxbook${spec.routeSuffix}` : '/projects/ndxbook',
      moduleLabel: spec.label,
      surfaceType: spec.surfaceType,
    })),
  });
}

export function ingestNdxMobileMoodBoard(input: {
  imageWidth: number;
  imageHeight: number;
  sourceAssetPath?: string;
}): MoodBoardScreenExtractionResult {
  return runMoodBoardScreenExtractionPipeline({
    boardAssetId: NDX_PROJECT_HUB_MOBILE_BOARD_ID,
    sourceAssetPath: input.sourceAssetPath ?? NDX_FOUNDER_REFERENCE_PATHS.mobile,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    viewportClass: 'mobile',
    screenBounds: NDX_MOBILE_SCREEN_SPECS.map((spec) => ({
      screenId: spec.screenId,
      x: spec.x,
      y: spec.y,
      width: spec.width,
      height: spec.height,
      type: 'mobile' as const,
      route: `/projects/ndxbook${spec.routeSuffix}`,
      moduleLabel: spec.label,
      surfaceType: spec.screenId,
    })),
  });
}

export function ingestNdxProjectHubMoodBoards(input: {
  projectSlug: string;
  desktopImageWidth: number;
  desktopImageHeight: number;
  mobileImageWidth: number;
  mobileImageHeight: number;
}): {
  desktop: MoodBoardScreenExtractionResult;
  mobile: MoodBoardScreenExtractionResult;
  allScreens: NdxExtractedScreenReference[];
  sufficientByDefault: boolean;
} {
  const desktop = ingestNdxDesktopMoodBoard({
    imageWidth: input.desktopImageWidth,
    imageHeight: input.desktopImageHeight,
  });
  const mobile = ingestNdxMobileMoodBoard({
    imageWidth: input.mobileImageWidth,
    imageHeight: input.mobileImageHeight,
  });
  const allScreens = bindRoutePaths(input.projectSlug, [...desktop.screens, ...mobile.screens]);
  return {
    desktop,
    mobile,
    allScreens,
    sufficientByDefault: moodBoardIngestionSufficientByDefault(desktop) && moodBoardIngestionSufficientByDefault(mobile),
  };
}

/** @deprecated Use ingestNdxDesktopMoodBoard — kept for P0.VR.1D.A compatibility */
export function decomposeNdxDesktopReferenceBoard(input: {
  imageWidth: number;
  imageHeight: number;
}): ReferenceBoard {
  const result = ingestNdxDesktopMoodBoard(input);
  return {
    boardId: result.boardId,
    sourceAssetId: result.sourceAssetId,
    screens: result.screens,
    createdAt: result.extractedAt,
  };
}

/** @deprecated Use ingestNdxMobileMoodBoard */
export function decomposeNdxMobileReferenceBoard(input: {
  imageWidth: number;
  imageHeight: number;
}): ReferenceBoard {
  const result = ingestNdxMobileMoodBoard(input);
  return {
    boardId: result.boardId,
    sourceAssetId: result.sourceAssetId,
    screens: result.screens,
    createdAt: result.extractedAt,
  };
}

export function bindNdxProjectHubScreenReferences(projectSlug: string): NdxProjectHubScreenReference[] {
  const mobile = ingestNdxMobileMoodBoard({ imageWidth: 2340, imageHeight: 844 });
  return mobile.screens.map((screen, index) => {
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
  const moodBoards = ingestNdxProjectHubMoodBoards({
    projectSlug,
    desktopImageWidth: desktopAsset.width || 1920,
    desktopImageHeight: desktopAsset.height || 1080,
    mobileImageWidth: mobileAsset.width || 2340,
    mobileImageHeight: mobileAsset.height || 844,
  });
  const mobileScreens = moodBoards.allScreens.filter((s) => s.viewportClass === 'mobile');

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
      approvedVersion: 'P0.VR.1D.1',
    }),
    mobileScreens,
    desktopScreens: moodBoards.allScreens.filter((s) => s.viewportClass === 'desktop'),
    desktopRegions: NDX_DESKTOP_BOARD_REGIONS,
    moodBoardExtraction: moodBoards,
  };
}

export async function rebuildNdxProjectHubThroughP0VR1D1(input: {
  projectSlug: string;
  referenceBufferDesktop: Buffer;
  referenceBufferMobile: Buffer;
  skipRender?: boolean;
}) {
  const boards = ingestNdxProjectHubMoodBoards({
    projectSlug: input.projectSlug,
    desktopImageWidth: 1920,
    desktopImageHeight: 1080,
    mobileImageWidth: 2340,
    mobileImageHeight: 844,
  });

  const mobileOrder = NDX_MOBILE_SCREEN_SPECS.map((s) => s.screenId);
  const convergenceResults = [];

  for (const screen of boards.allScreens) {
    const isMobile = screen.viewportClass === 'mobile';
    const buffer = isMobile ? input.referenceBufferMobile : input.referenceBufferDesktop;
    const path = isMobile ? NDX_FOUNDER_REFERENCE_PATHS.mobile : NDX_FOUNDER_REFERENCE_PATHS.desktop;

    const result = await runDomPatchConvergencePipeline({
      screen,
      route: screen.routePath,
      referenceImagePath: path,
      referenceBuffer: buffer,
      mobileScreenOrder: isMobile ? mobileOrder : undefined,
      skipRender: input.skipRender ?? true,
      domDrift: screen.screenId.includes('CAMPAIGN') ? { CAMPAIGN_BOARD: { width: 33, x: 32 } } : {},
    });
    convergenceResults.push(result);
  }

  return {
    boards,
    convergenceResults,
    mobileScreenOrder: mobileOrder,
  };
}

export function applyNdxFullScreenOverride(
  screens: ExtractedScreenReference[],
  upload: Parameters<typeof applyFullScreenOverrideToScreens>[1],
) {
  return applyFullScreenOverrideToScreens(screens, upload);
}

export { buildScreenImplementationSpecFromReference, runDomPatchConvergencePipeline };

export function projectHubUsesImageReferenceNotTextPrimary(): true {
  return true;
}

export function moodBoardTreatedAsSingleScreen(): false {
  return false;
}

export function multipleScreensAveragedIntoOneDesign(): false {
  return false;
}
