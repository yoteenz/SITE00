/**
 * P0.VR.1D.1 — Screen reference authority versioning + mood-board crop authority.
 */

import type { ViewportClass, WebVisualReferenceAuthority } from '../p0vr1d/types.js';
import type { ExtractedScreenReference, ScreenReferenceAuthoritySource, ScreenReferenceAuthorityVersion } from './types.js';
import { SCREEN_REFERENCE_AUTHORITY_PRIORITY } from './constants.js';

export function createMoodBoardCropAuthority(input: {
  assetId: string;
  sourcePath: string;
  width: number;
  height: number;
  viewportClass: ViewportClass;
  surfaceType: string;
}): WebVisualReferenceAuthority {
  const url = sourceToUrl(input.sourcePath);
  return {
    referenceAssetId: input.assetId,
    referenceImageUrl: url,
    surfaceType: input.surfaceType,
    viewportClass: input.viewportClass,
    viewportWidth: input.width,
    viewportHeight: input.height,
    aspectRatio: input.width / Math.max(input.height, 1),
    deviceClass: input.viewportClass === 'mobile' ? 'mobile' : 'desktop',
    authorityStatus: 'REFERENCE_READY',
    sourceType: 'APPROVED_MOODBOARD',
    workflowMode: 'WEBSITE_RECONSTRUCTION',
    responsiveMode: 'REFERENCE_LOCKED',
    createdAt: new Date().toISOString(),
    imageAuthorityPath: url,
  };
}

function sourceToUrl(source: string): string {
  if (source.startsWith('http')) return source;
  return source.startsWith('file://') ? source : `file://${source}`;
}

export function createScreenReferenceAuthorityVersion(
  screen: ExtractedScreenReference,
): ScreenReferenceAuthorityVersion {
  return {
    screenId: screen.screenId,
    version: screen.authorityVersion,
    authoritySource: screen.authoritySource,
    referenceAssetId: screen.croppedReferenceAssetId,
    supersededBy: null,
    updatedAt: new Date().toISOString(),
  };
}

export function supersedeScreenReferenceAuthority(input: {
  screen: ExtractedScreenReference;
  fullScreenAssetId: string;
  fullScreenUrl: string;
  width: number;
  height: number;
}): { screen: ExtractedScreenReference; version: ScreenReferenceAuthorityVersion } {
  const authority: WebVisualReferenceAuthority = {
    referenceAssetId: input.fullScreenAssetId,
    referenceImageUrl: input.fullScreenUrl,
    surfaceType: input.screen.surfaceType,
    viewportClass: input.screen.viewportClass,
    viewportWidth: input.width,
    viewportHeight: input.height,
    aspectRatio: input.width / Math.max(input.height, 1),
    deviceClass: input.screen.viewportClass === 'mobile' ? 'mobile' : 'desktop',
    authorityStatus: 'REFERENCE_READY',
    sourceType: 'APPROVED_SCREENSHOT',
    workflowMode: 'WEBSITE_RECONSTRUCTION',
    responsiveMode: 'REFERENCE_LOCKED',
    createdAt: new Date().toISOString(),
    imageAuthorityPath: input.fullScreenUrl,
  };

  const updated: ExtractedScreenReference = {
    ...input.screen,
    croppedReferenceAssetId: input.fullScreenAssetId,
    authoritySource: 'FOUNDER_FULL_SCREEN_REFERENCE',
    authorityVersion: input.screen.authorityVersion + 1,
    authority,
    referenceResolution: 'SUFFICIENT',
    confidence: 0.98,
  };

  const version: ScreenReferenceAuthorityVersion = {
    screenId: input.screen.screenId,
    version: updated.authorityVersion,
    authoritySource: 'FOUNDER_FULL_SCREEN_REFERENCE',
    referenceAssetId: input.fullScreenAssetId,
    supersededBy: null,
    updatedAt: new Date().toISOString(),
  };

  return { screen: updated, version };
}

export function authoritySourcePriority(source: ScreenReferenceAuthoritySource): number {
  return SCREEN_REFERENCE_AUTHORITY_PRIORITY.indexOf(source);
}

export function moodBoardCropIsPrimaryUnlessOverridden(screen: ExtractedScreenReference): boolean {
  return screen.authoritySource === 'MOOD_BOARD_CROP';
}
