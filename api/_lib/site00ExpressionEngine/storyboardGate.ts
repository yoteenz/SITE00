/**
 * Sprint B4.6 — Storyboard gate (GATE_0C_STRUCTURAL_STORYBOARD).
 */

import type {
  KeyframeGenerationPrerequisite,
  StoryboardApprovalState,
  StoryboardBoard,
  StoryboardFounderJudgment,
} from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import { buildEntry002StructuralBoardId } from '../../../shared/site00-expression-engine/storyboardAuthorityIds.js';

export const STRUCTURAL_STORYBOARD_GATE_ID = 'GATE_0C_STRUCTURAL_STORYBOARD' as const;

export type StructuralBoardKey = 'BOARD_01' | 'BOARD_02' | 'BOARD_03' | 'BOARD_04' | 'BOARD_05';

export const STRUCTURAL_BOARD_KEYS: StructuralBoardKey[] = [
  'BOARD_01',
  'BOARD_02',
  'BOARD_03',
  'BOARD_04',
  'BOARD_05',
];

export function structuralBoardKey(boardNumber: number): StructuralBoardKey {
  return `BOARD_${String(boardNumber).padStart(2, '0')}` as StructuralBoardKey;
}

export function buildStoryboardApprovalState(
  boards: StoryboardBoard[],
  judgments?: Partial<Record<StructuralBoardKey, StoryboardFounderJudgment>>,
): StoryboardApprovalState {
  const boardJudgments = STRUCTURAL_BOARD_KEYS.reduce(
    (acc, key, index) => {
      const board = boards.find((b) => b.boardNumber === index + 1);
      acc[key] = judgments?.[key] ?? board?.founderJudgment ?? 'UNREVIEWED';
      return acc;
    },
    {} as StoryboardApprovalState['boardJudgments'],
  );

  const allBoardsLoveIt = STRUCTURAL_BOARD_KEYS.every((k) => boardJudgments[k] === 'LOVE_IT');
  const anyNotForMe = STRUCTURAL_BOARD_KEYS.some((k) => boardJudgments[k] === 'NOT_FOR_ME');

  return {
    gateId: STRUCTURAL_STORYBOARD_GATE_ID,
    boardJudgments,
    allBoardsLoveIt,
    anyNotForMe,
    blocksKeyframeGeneration: !allBoardsLoveIt,
    blocksVideoGeneration: !allBoardsLoveIt,
  };
}

export function buildKeyframeGenerationPrerequisite(
  boards: StoryboardBoard[],
  approvalState: StoryboardApprovalState,
): KeyframeGenerationPrerequisite {
  const startBoard = boards.find((b) => b.keyframeExtractionRole === 'START');
  const midBoard = boards.find((b) => b.keyframeExtractionRole === 'MID');
  const endBoard = boards.find((b) => b.keyframeExtractionRole === 'END');

  return {
    requiresStoryboardApproval: true,
    requiresAllBoardsLoveIt: true,
    sourceBoardIds: {
      START: startBoard?.boardId ?? buildEntry002StructuralBoardId(1),
      MID: midBoard?.boardId ?? buildEntry002StructuralBoardId(4),
      END: endBoard?.boardId ?? buildEntry002StructuralBoardId(5),
    },
    blockedUntil: STRUCTURAL_STORYBOARD_GATE_ID,
    satisfied: approvalState.allBoardsLoveIt,
  };
}

export function isKeyframeGenerationBlockedByStructuralStoryboardGate(
  approvalState: StoryboardApprovalState,
): boolean {
  return approvalState.blocksKeyframeGeneration;
}

export function assertStructuralStoryboardApprovedForKeyframeGeneration(
  approvalState: StoryboardApprovalState,
): void {
  if (isKeyframeGenerationBlockedByStructuralStoryboardGate(approvalState)) {
    const pending = STRUCTURAL_BOARD_KEYS.filter(
      (k) => approvalState.boardJudgments[k] !== 'LOVE_IT',
    ).join(', ');
    throw new Error(
      `KEYFRAME_GENERATION blocked — ${STRUCTURAL_STORYBOARD_GATE_ID} requires LOVE_IT on all 5 structural boards (pending: ${pending})`,
    );
  }
}
