/**
 * Sprint B4.6 — Compile START/MID/END keyframe specs from approved structural storyboard.
 */

import type { ReelKeyframeRole } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import type {
  StoryboardApprovalState,
  StoryboardBoard,
} from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import { assertStructuralStoryboardApprovedForKeyframeGeneration } from './storyboardGate.js';

export type CompiledKeyframeFromStoryboard = {
  role: ReelKeyframeRole;
  sourceBoardId: string;
  sourceBoardNumber: number;
  sourceBoardTitle: string;
  visualDescription: string;
  continuityNotes: string;
  requiredVisualElements: string[];
  argumentGrammarRole: string;
  canonState: 'NON_CANON' | 'PRODUCTION_CANDIDATE';
};

export function compileKeyframesFromApprovedStoryboard(
  boards: StoryboardBoard[],
  approvalState: StoryboardApprovalState,
): CompiledKeyframeFromStoryboard[] {
  assertStructuralStoryboardApprovedForKeyframeGeneration(approvalState);

  const roles: ReelKeyframeRole[] = ['START', 'MID', 'END'];
  return roles.map((role) => {
    const board = boards.find((b) => b.keyframeExtractionRole === role);
    if (!board) {
      throw new Error(`Missing structural storyboard board for keyframe role ${role}`);
    }
    return {
      role,
      sourceBoardId: board.boardId,
      sourceBoardNumber: board.boardNumber,
      sourceBoardTitle: board.boardTitle,
      visualDescription: board.visualDescription,
      continuityNotes: board.continuityNotes,
      requiredVisualElements: board.requiredVisualElements,
      argumentGrammarRole: board.argumentGrammarRole,
      canonState: 'PRODUCTION_CANDIDATE',
    };
  });
}

export function previewKeyframeCompilationBlocked(
  approvalState: StoryboardApprovalState,
): { blocked: true; reason: string } | { blocked: false } {
  if (approvalState.allBoardsLoveIt) return { blocked: false };
  return {
    blocked: true,
    reason: `${approvalState.gateId} — all 5 structural boards require LOVE_IT before keyframe compilation`,
  };
}
