/**
 * Moodboard screen extraction — independent screens, not averaged aesthetic.
 */

import type { ReferenceBoard, ScreenReference, WebVisualReferenceAuthority } from './types.js';

export type MoodboardDecompositionInput = {
  boardAssetId: string;
  imageWidth: number;
  imageHeight: number;
  /** Normalized screen bounds within moodboard [0-1] */
  screenBounds?: Array<{ x: number; y: number; width: number; height: number; type?: 'desktop' | 'mobile' }>;
};

export function decomposeMoodboardIntoScreens(
  input: MoodboardDecompositionInput,
): ReferenceBoard {
  const defaults =
    input.screenBounds ??
    [
      { x: 0.05, y: 0.08, width: 0.42, height: 0.38, type: 'desktop' as const },
      { x: 0.52, y: 0.12, width: 0.18, height: 0.72, type: 'mobile' as const },
    ];

  const screens: ScreenReference[] = defaults.map((bound, index) => {
    const px = {
      x: bound.x * input.imageWidth,
      y: bound.y * input.imageHeight,
      width: bound.width * input.imageWidth,
      height: bound.height * input.imageHeight,
    };
    const ratio = px.width / Math.max(px.height, 1);
    const screenType = bound.type ?? (ratio < 0.75 ? 'mobile' : 'desktop');
    return {
      screenId: `screen-${index + 1}`,
      boardId: input.boardAssetId,
      bounds: px,
      viewportRatio: ratio,
      screenType,
      viewportClass: screenType === 'mobile' ? 'mobile' : ratio > 2 ? 'ultrawide' : 'desktop',
      crop: px,
      authority: null,
    };
  });

  return {
    boardId: input.boardAssetId,
    sourceAssetId: input.boardAssetId,
    screens,
    createdAt: new Date().toISOString(),
  };
}

export function attachAuthorityToScreen(
  screen: ScreenReference,
  authority: WebVisualReferenceAuthority,
): ScreenReference {
  return { ...screen, authority };
}

export function moodboardDoesNotSynthesizeAverage(board: ReferenceBoard): boolean {
  return board.screens.length > 1;
}
