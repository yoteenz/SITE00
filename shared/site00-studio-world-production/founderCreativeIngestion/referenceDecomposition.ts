/**
 * P0.CB.1 — Reference decomposition engine (reconstruction intelligence, not bitmap slicing).
 */

import { randomUUID } from 'node:crypto';
import type { CreativeReferenceBoard, SlideReference } from './types.js';

export type SlideReferenceSeed = {
  slideNumber: number;
  observableCopy: string[];
  compositionNotes: string[];
  hasPhotography: boolean;
  hasTypography: boolean;
  hasAnnotations: boolean;
  confidence?: number;
};

export function decomposeReferenceBoard(params: {
  board: CreativeReferenceBoard;
  slideSeeds: SlideReferenceSeed[];
}): SlideReference[] {
  const { board, slideSeeds } = params;
  const totalCells = board.gridRows * board.gridCols;

  if (slideSeeds.length !== board.slideCount) {
    throw new Error(`Expected ${board.slideCount} slide seeds, received ${slideSeeds.length}`);
  }
  if (slideSeeds.length > totalCells) {
    throw new Error('Slide count exceeds grid capacity');
  }

  return slideSeeds.map((seed, index) => {
    const row = Math.floor(index / board.gridCols);
    const col = index % board.gridCols;
    const cellW = 1 / board.gridCols;
    const cellH = 1 / board.gridRows;

    return {
      slideReferenceId: randomUUID(),
      boardId: board.boardId,
      sequenceId: board.sequenceId,
      slideNumber: seed.slideNumber,
      referenceAssetIds: [board.referenceAssetId],
      referenceRegion: {
        row,
        col,
        normalizedBounds: { x: col * cellW, y: row * cellH, w: cellW, h: cellH },
      },
      observableCopy: seed.observableCopy,
      compositionNotes: seed.compositionNotes,
      hasPhotography: seed.hasPhotography,
      hasTypography: seed.hasTypography,
      hasAnnotations: seed.hasAnnotations,
      confidence: seed.confidence ?? 0.85,
    };
  });
}

/** Reference region is for display alignment only — never a production asset URL. */
export function referenceRegionIsNotProductionAsset(slide: SlideReference): boolean {
  return Boolean(slide.referenceRegion) && !slide.referenceAssetIds.some((id) => id.startsWith('production-'));
}

export function buildReferenceBoard(params: {
  sequenceId: string;
  referenceAssetId: string;
  gridRows: number;
  gridCols: number;
  slideCount: number;
}): CreativeReferenceBoard {
  return {
    boardId: randomUUID(),
    sequenceId: params.sequenceId,
    referenceAssetId: params.referenceAssetId,
    gridRows: params.gridRows,
    gridCols: params.gridCols,
    slideCount: params.slideCount,
    decomposedAt: null,
    slideReferenceIds: [],
  };
}
