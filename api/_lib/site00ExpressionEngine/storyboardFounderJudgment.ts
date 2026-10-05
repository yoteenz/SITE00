/**
 * Sprint B4.6 — Per-board founder judgment helpers.
 */

import type {
  StoryboardBoard,
  StoryboardFounderJudgment,
} from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import {
  STRUCTURAL_BOARD_KEYS,
  structuralBoardKey,
  type StructuralBoardKey,
} from './storyboardGate.js';

export type FounderBoardReviewSlot = {
  boardKey: StructuralBoardKey;
  boardNumber: number;
  boardId: string;
  boardTitle: string;
  founderJudgment: StoryboardFounderJudgment;
  allowedJudgments: StoryboardFounderJudgment[];
};

export const FOUNDER_STORYBOARD_JUDGMENT_OPTIONS: Exclude<
  StoryboardFounderJudgment,
  'UNREVIEWED'
>[] = ['LOVE_IT', 'PROMISING_REFINE', 'NOT_FOR_ME'];

export function buildFounderBoardReviewSlots(boards: StoryboardBoard[]): FounderBoardReviewSlot[] {
  return boards.map((board) => ({
    boardKey: structuralBoardKey(board.boardNumber),
    boardNumber: board.boardNumber,
    boardId: board.boardId,
    boardTitle: board.boardTitle,
    founderJudgment: board.founderJudgment,
    allowedJudgments: ['UNREVIEWED', ...FOUNDER_STORYBOARD_JUDGMENT_OPTIONS],
  }));
}

export function applyFounderBoardJudgments(
  boards: StoryboardBoard[],
  judgments: Partial<Record<StructuralBoardKey, StoryboardFounderJudgment>>,
): StoryboardBoard[] {
  return boards.map((board) => {
    const key = structuralBoardKey(board.boardNumber);
    const judgment = judgments[key];
    if (!judgment) return board;
    return { ...board, founderJudgment: judgment };
  });
}

export function summarizeFounderStoryboardReview(boards: StoryboardBoard[]): {
  reviewedCount: number;
  loveItCount: number;
  promisingRefineCount: number;
  notForMeCount: number;
  unreviewedCount: number;
  readyForKeyframeCompilation: boolean;
} {
  const counts = boards.reduce(
    (acc, board) => {
      if (board.founderJudgment === 'LOVE_IT') acc.loveItCount += 1;
      else if (board.founderJudgment === 'PROMISING_REFINE') acc.promisingRefineCount += 1;
      else if (board.founderJudgment === 'NOT_FOR_ME') acc.notForMeCount += 1;
      else acc.unreviewedCount += 1;
      return acc;
    },
    { loveItCount: 0, promisingRefineCount: 0, notForMeCount: 0, unreviewedCount: 0 },
  );

  return {
    reviewedCount: boards.length - counts.unreviewedCount,
    ...counts,
    readyForKeyframeCompilation: counts.loveItCount === STRUCTURAL_BOARD_KEYS.length,
  };
}
