/**
 * P0.VR.1D.3 — Compile ScreenReferenceState + implementation spec from attached reference.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  ingestScreenshotReference,
  decomposePageVisual,
  buildVisualRegionMap,
  buildPixelGeometryContract,
  buildReferenceTypographyContract,
  extractFrameAuthority,
  matchReferenceAssets,
} from '../index.js';
import { buildVisualSpecToCodeBridge } from '../p0vr1d1/index.js';
import {
  NDX_OVERVIEW_MENU_OPEN_REFERENCE_PATH,
  NDX_OVERVIEW_MENU_OPEN_ROUTE,
  NDX_OVERVIEW_MENU_OPEN_SCREEN_ID,
  NDX_OVERVIEW_MENU_OPEN_VIEWPORT,
  NDX_OVERVIEW_VR_REGION_IDS,
} from './constants.js';
import type { ScreenReferenceState } from './types.js';

export async function buildScreenReferenceStateFromAttachedReference(rootDir: string): Promise<ScreenReferenceState> {
  const referencePath = join(rootDir, NDX_OVERVIEW_MENU_OPEN_REFERENCE_PATH);
  const buffer = readFileSync(referencePath);
  const meta = await sharp(buffer).metadata();
  const refWidth = meta.width ?? 941;
  const refHeight = meta.height ?? 1672;
  const aspect = refWidth / refHeight;
  const inferredHeight = Math.round(NDX_OVERVIEW_MENU_OPEN_VIEWPORT.width / aspect);

  return {
    screenId: NDX_OVERVIEW_MENU_OPEN_SCREEN_ID,
    route: NDX_OVERVIEW_MENU_OPEN_ROUTE,
    viewport: 'mobile',
    interactionState: 'THREE_DOT_PROJECT_MENU_OPEN',
    menuOpen: true,
    referenceAssetId: NDX_OVERVIEW_MENU_OPEN_SCREEN_ID,
    referencePath,
    viewportWidth: NDX_OVERVIEW_MENU_OPEN_VIEWPORT.width,
    viewportHeight: inferredHeight > 700 && inferredHeight < 920 ? inferredHeight : NDX_OVERVIEW_MENU_OPEN_VIEWPORT.height,
    safeAreaTop: NDX_OVERVIEW_MENU_OPEN_VIEWPORT.safeAreaTop,
    safeAreaBottom: NDX_OVERVIEW_MENU_OPEN_VIEWPORT.safeAreaBottom,
    deviceFrameAssumptions: 'iOS mobile status bar visible; logical width 390 @2x reference crop',
    confidence: 0.86,
  };
}

export async function compileNdxOverviewMenuOpenImplementationSpec(rootDir: string) {
  const referenceState = await buildScreenReferenceStateFromAttachedReference(rootDir);
  const buffer = readFileSync(referenceState.referencePath);
  const reference = await ingestScreenshotReference({
    sourceAsset: referenceState.referencePath,
    buffer,
    forceMobileChrome: true,
  });
  const decomposition = decomposePageVisual({
    reference,
    referenceAssetId: referenceState.referenceAssetId,
  });
  const regionMap = buildVisualRegionMap(decomposition);
  const geometryContract = buildPixelGeometryContract({
    decomposition,
    viewportClass: 'mobile',
  });
  const typographyContract = buildReferenceTypographyContract(decomposition);
  const frameAuthority = extractFrameAuthority(decomposition);
  const assetMatches = matchReferenceAssets({ decomposition, projectAssets: [] });

  const extractedScreen = {
    screenId: referenceState.screenId,
    boardId: 'attached-reference',
    bounds: { x: 0, y: 0, width: referenceState.viewportWidth, height: referenceState.viewportHeight },
    viewportRatio: referenceState.viewportWidth / referenceState.viewportHeight,
    screenType: 'mobile' as const,
    viewportClass: 'mobile' as const,
    crop: { x: 0, y: 0, width: referenceState.viewportWidth, height: referenceState.viewportHeight },
    authority: null,
    sourceBoardId: 'attached-reference',
    croppedReferenceAssetId: referenceState.referenceAssetId,
    surfaceType: referenceState.screenId,
    confidence: referenceState.confidence,
    referenceResolution: 'SUFFICIENT' as const,
    authoritySource: 'FOUNDER_FULL_SCREEN_REFERENCE' as const,
    authorityVersion: 1,
    route: referenceState.route,
    moduleLabel: 'NDX Overview · menu open',
  };

  const implementationSpec = buildVisualSpecToCodeBridge({
    screen: extractedScreen,
    route: referenceState.route,
    regionMap,
    geometryContract,
    typographyContract,
    frameAuthority,
    assetMatches,
    layoutModel: 'FLOW',
  });

  const regionCodeSpecs = NDX_OVERVIEW_VR_REGION_IDS.map((regionId) => ({
    regionId,
    domSelector: `[data-vr-region="${regionId}"]`,
    layoutModel: 'FLOW' as const,
  }));

  return {
    referenceState,
    reference,
    decomposition,
    regionMap,
    geometryContract,
    typographyContract,
    implementationSpec,
    regionCodeSpecs,
  };
}
