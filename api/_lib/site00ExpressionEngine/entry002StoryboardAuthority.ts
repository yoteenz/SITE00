/**
 * Sprint B4.6 — Build Entry 002 reel storyboard authority record.
 */

import type { ReelStoryboardAuthority } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import { ENTRY_002_STORYBOARD_AUTHORITY_001 } from '../../../shared/site00-expression-engine/storyboardAuthorityIds.js';
import { buildEntry002ReelTreatmentAuthority } from './entry002ReelTreatment.js';
import { buildEntry002CharacterAuthoritySet } from './storyboardContinuityRules.js';
import {
  buildEntry002StoryboardBeatOutline,
  buildEntry002StructuralStoryboardBoards,
} from './storyboardBoardPlanner.js';
import {
  buildKeyframeGenerationPrerequisite,
  buildStoryboardApprovalState,
} from './storyboardGate.js';

export function buildEntry002ReelStoryboardAuthorityRecord(
  boardsWithUrls?: ReturnType<typeof buildEntry002StructuralStoryboardBoards>,
): ReelStoryboardAuthority {
  const treatment = buildEntry002ReelTreatmentAuthority();
  const boards = boardsWithUrls ?? buildEntry002StructuralStoryboardBoards();
  const approvalState = buildStoryboardApprovalState(boards);

  return {
    authorityId: ENTRY_002_STORYBOARD_AUTHORITY_001,
    entryId: 'entry-002',
    treatmentId: treatment.treatmentId,
    beatOutline: buildEntry002StoryboardBeatOutline(),
    boards,
    characterAuthority: buildEntry002CharacterAuthoritySet(),
    approvalState,
    keyframePrerequisite: buildKeyframeGenerationPrerequisite(boards, approvalState),
    canonState: approvalState.allBoardsLoveIt ? 'PRODUCTION_CANDIDATE' : 'NON_CANON',
  };
}
