/**
 * P0.VR.1D.1 — MoodBoardScreenExtractionPipeline
 * Default input: desktop + mobile mood boards → ScreenReference[] automatically.
 */

import { randomUUID } from 'node:crypto';
import { decomposeMoodboardIntoScreens } from '../p0vr1d/moodboardScreenExtraction.js';
import type { ReferenceBoard } from '../p0vr1d/types.js';
import type { ExtractedScreenReference, MoodBoardScreenExtractionResult } from './types.js';
import { evaluateScreenReferenceResolution } from './screenReferenceResolutionEvaluation.js';
import { createMoodBoardCropAuthority } from './screenReferenceAuthorityVersion.js';

export type MoodBoardIngestInput = {
  boardAssetId: string;
  sourceAssetPath: string;
  imageWidth: number;
  imageHeight: number;
  viewportClass: 'desktop' | 'mobile';
  screenBounds: Array<{
    screenId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type?: 'desktop' | 'mobile';
    route?: string;
    moduleLabel?: string;
    surfaceType?: string;
  }>;
};

export function runMoodBoardScreenExtractionPipeline(input: MoodBoardIngestInput): MoodBoardScreenExtractionResult {
  const board: ReferenceBoard = decomposeMoodboardIntoScreens({
    boardAssetId: input.boardAssetId,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    screenBounds: input.screenBounds.map((spec) => ({
      x: spec.x,
      y: spec.y,
      width: spec.width,
      height: spec.height,
      type: spec.type ?? input.viewportClass,
    })),
  });

  if (board.screens.length <= 1 && input.screenBounds.length > 1) {
    throw new Error('FAIL_MOOD_BOARD_NOT_DECOMPOSED');
  }

  const screens: ExtractedScreenReference[] = board.screens.map((screen, index) => {
    const spec = input.screenBounds[index]!;
    const cropWidth = Math.round(spec.width * input.imageWidth);
    const cropHeight = Math.round(spec.height * input.imageHeight);
    const resolution = evaluateScreenReferenceResolution({ cropWidth, cropHeight, viewportClass: screen.viewportClass });
    const croppedReferenceAssetId = `${input.boardAssetId}__crop__${spec.screenId}`;
    const authority = createMoodBoardCropAuthority({
      assetId: croppedReferenceAssetId,
      sourcePath: input.sourceAssetPath,
      width: cropWidth,
      height: cropHeight,
      viewportClass: screen.viewportClass,
      surfaceType: spec.surfaceType ?? spec.screenId,
    });

    return {
      ...screen,
      screenId: spec.screenId,
      sourceBoardId: input.boardAssetId,
      croppedReferenceAssetId,
      surfaceType: spec.surfaceType ?? spec.screenId,
      confidence: resolution.confidence,
      referenceResolution: resolution.status,
      authoritySource: 'MOOD_BOARD_CROP',
      authorityVersion: 1,
      route: spec.route,
      moduleLabel: spec.moduleLabel,
      authority,
    };
  });

  return {
    boardId: input.boardAssetId,
    sourceAssetId: input.sourceAssetPath,
    viewportClass: input.viewportClass,
    screens,
    treatedAsSingleScreen: false,
    screensAveraged: false,
    extractedAt: new Date().toISOString(),
  };
}

export function moodBoardIngestionSufficientByDefault(result: MoodBoardScreenExtractionResult): boolean {
  return result.screens.some((s) => s.referenceResolution !== 'INSUFFICIENT');
}

export function extractedScreenCount(result: MoodBoardScreenExtractionResult): number {
  return result.screens.length;
}

export function buildCroppedReferenceAssetId(boardId: string, screenId: string): string {
  return `${boardId}__crop__${screenId}`;
}

export function moodBoardExtractionId(): string {
  return randomUUID();
}
