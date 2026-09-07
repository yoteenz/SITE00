/**
 * Sprint B4.4/B4.5 — Reel production gates including GATE_0_STORYBOARD and GATE_0B_CINEMATIC_SEQUENCE.
 */

import type { FounderReviewGate } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import type { StoryboardFounderJudgment } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import type { CinematicSequenceFounderJudgment } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';
import type { StoryboardApprovalState } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import type { PreStoryboardApprovalState } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import {
  STRUCTURAL_STORYBOARD_GATE_ID,
  assertStructuralStoryboardApprovedForKeyframeGeneration,
  isKeyframeGenerationBlockedByStructuralStoryboardGate,
} from './storyboardGate.js';
import {
  PRE_STORYBOARD_VISUAL_GATE_ID,
  assertPreStoryboardVisualAuthorityApprovedForStoryboard,
  isCinematicStoryboardBlockedByPreStoryboardGate,
} from './preStoryboardAuthorityGate.js';

export type StoryboardGateState = {
  gateId: 'GATE_0_STORYBOARD';
  label: string;
  founderJudgment: StoryboardFounderJudgment;
  blocksKeyframeGeneration: boolean;
  blocksNextStage: boolean;
  unlockActions: Record<StoryboardFounderJudgment, string>;
};

export function buildEntry002StoryboardGate(
  founderJudgment: StoryboardFounderJudgment = 'UNREVIEWED',
): StoryboardGateState {
  return {
    gateId: 'GATE_0_STORYBOARD',
    label: 'Storyboard authority review — complete reel sequence before keyframes',
    founderJudgment,
    blocksKeyframeGeneration: founderJudgment !== 'LOVE_IT',
    blocksNextStage: founderJudgment !== 'LOVE_IT',
    unlockActions: {
      UNREVIEWED: 'Founder must review complete storyboard',
      LOVE_IT: 'Unlock keyframe extraction from approved panels',
      PROMISING_REFINE: 'Repair storyboard panels only — no keyframe generation',
      NOT_FOR_ME: 'Preserve storyboard as NON_CANON; revise narrative direction',
    },
  };
}

export function buildEntry002CinematicSequenceGate(
  founderJudgment: CinematicSequenceFounderJudgment = 'UNREVIEWED',
): {
  gateId: 'GATE_REF_CINEMATIC_SEQUENCE';
  label: string;
  founderJudgment: CinematicSequenceFounderJudgment;
  blocksKeyframeGeneration: boolean;
  blocksNextStage: boolean;
} {
  return {
    gateId: 'GATE_REF_CINEMATIC_SEQUENCE',
    label: 'Cinematic visual sequence — PRE_AUTHORITY_EXPERIMENT reference only (not active gate)',
    founderJudgment,
    blocksKeyframeGeneration: false,
    blocksNextStage: false,
  };
}

export function buildEntry002PreStoryboardAuthorityGate(
  approvalState: PreStoryboardApprovalState,
): {
  gateId: typeof PRE_STORYBOARD_VISUAL_GATE_ID;
  label: string;
  approvalState: PreStoryboardApprovalState;
  blocksCinematicStoryboard: boolean;
  blocksNextStage: boolean;
} {
  return {
    gateId: PRE_STORYBOARD_VISUAL_GATE_ID,
    label: 'Pre-storyboard visual authorities — 5 glue boards must be LOVE_IT before cinematic storyboard',
    approvalState,
    blocksCinematicStoryboard: approvalState.blocksCinematicStoryboard,
    blocksNextStage: approvalState.blocksCinematicStoryboard,
  };
}

export function buildEntry002StructuralStoryboardGate(
  approvalState: StoryboardApprovalState,
  preStoryboardApproval?: PreStoryboardApprovalState,
): {
  gateId: typeof STRUCTURAL_STORYBOARD_GATE_ID;
  label: string;
  approvalState: StoryboardApprovalState;
  blocksKeyframeGeneration: boolean;
  blocksNextStage: boolean;
  blockedPendingPreStoryboard: boolean;
  unlockActions: Record<StoryboardFounderJudgment, string>;
} {
  const blockedPendingPreStoryboard = preStoryboardApproval
    ? preStoryboardApproval.blocksCinematicStoryboard
    : true;
  return {
    gateId: STRUCTURAL_STORYBOARD_GATE_ID,
    label: blockedPendingPreStoryboard
      ? 'Cinematic storyboard BLOCKED — pending pre-storyboard visual authority approval'
      : 'Structural storyboard authority — 5 boards must be LOVE_IT before keyframes',
    approvalState,
    blocksKeyframeGeneration: approvalState.blocksKeyframeGeneration || blockedPendingPreStoryboard,
    blocksNextStage: approvalState.blocksKeyframeGeneration || blockedPendingPreStoryboard,
    blockedPendingPreStoryboard,
    unlockActions: {
      UNREVIEWED: 'Founder must review each structural board separately',
      LOVE_IT: 'Board approved — contributes to keyframe unlock when all 5 LOVE_IT',
      PROMISING_REFINE: 'Revise this board only — keyframes remain blocked',
      NOT_FOR_ME: 'Board rejected — revise structural direction',
    },
  };
}

export function buildEntry002FounderReviewGatesForPipeline(
  preStoryboardApproval: PreStoryboardApprovalState,
): Array<{
  gateId: string;
  label: string;
  founderJudgment: string;
  blocksNextStage: boolean;
  activeGate: boolean;
}> {
  const preStoryboardGate = buildEntry002PreStoryboardAuthorityGate(preStoryboardApproval);

  return [
    {
      gateId: preStoryboardGate.gateId,
      label: preStoryboardGate.label,
      founderJudgment: preStoryboardApproval.allAuthoritiesLoveIt ? 'LOVE_IT' : 'UNREVIEWED',
      blocksNextStage: preStoryboardGate.blocksNextStage,
      activeGate: true,
    },
    {
      gateId: 'GATE_0C_STRUCTURAL_STORYBOARD',
      label: 'Structural storyboard — planning / narrative structure (inactive until pre-storyboard approved)',
      founderJudgment: 'PLANNING_NARRATIVE_STRUCTURE',
      blocksNextStage: false,
      activeGate: false,
    },
    {
      gateId: 'GATE_REF_CINEMATIC_SEQUENCE',
      label: 'Cinematic sequence — PRE_AUTHORITY_EXPERIMENT reference only',
      founderJudgment: 'REFERENCE_ONLY',
      blocksNextStage: false,
      activeGate: false,
    },
    {
      gateId: 'GATE_1_KEYFRAME',
      label: 'Keyframe authority review',
      founderJudgment: 'UNREVIEWED',
      blocksNextStage: true,
      activeGate: false,
    },
  ];
}

export function buildEntry002FounderReviewGatesWithStructuralStoryboard(
  approvalState: StoryboardApprovalState,
  cinematicJudgment: CinematicSequenceFounderJudgment = 'UNREVIEWED',
): FounderReviewGate[] {
  const structuralGate = buildEntry002StructuralStoryboardGate(approvalState);
  const cinematicGate = buildEntry002CinematicSequenceGate(cinematicJudgment);
  return [
    {
      gateId: structuralGate.gateId,
      label: structuralGate.label,
      founderJudgment: approvalState.allBoardsLoveIt ? 'LOVE_IT' : 'UNREVIEWED',
      blocksNextStage: structuralGate.blocksNextStage,
    },
    {
      gateId: cinematicGate.gateId,
      label: cinematicGate.label,
      founderJudgment: cinematicGate.founderJudgment,
      blocksNextStage: false,
    },
    {
      gateId: 'GATE_0_STORYBOARD',
      label: 'B4.4 sketch storyboard retired — reference only',
      founderJudgment: 'REFERENCE_ONLY',
      blocksNextStage: false,
    },
    {
      gateId: 'GATE_1_KEYFRAME',
      label: 'Keyframe authority review (compiled from approved structural storyboard)',
      founderJudgment: 'UNREVIEWED',
      blocksNextStage: true,
    },
    {
      gateId: 'GATE_2_ROUGH_CUT',
      label: 'Rough cut review',
      founderJudgment: 'UNREVIEWED',
      blocksNextStage: true,
    },
    {
      gateId: 'GATE_3_FINAL',
      label: 'Final reel review',
      founderJudgment: 'UNREVIEWED',
      blocksNextStage: true,
    },
  ];
}

export function buildEntry002FounderReviewGatesWithStoryboard(
  storyboardJudgment: StoryboardFounderJudgment | 'REFERENCE_ONLY' = 'UNREVIEWED',
  cinematicJudgment: CinematicSequenceFounderJudgment = 'UNREVIEWED',
): FounderReviewGate[] {
  const storyboardGate = buildEntry002StoryboardGate(
    storyboardJudgment === 'REFERENCE_ONLY' ? 'UNREVIEWED' : storyboardJudgment,
  );
  const cinematicGate = buildEntry002CinematicSequenceGate(cinematicJudgment);
  return [
    {
      gateId: storyboardGate.gateId,
      label:
        storyboardJudgment === 'REFERENCE_ONLY'
          ? 'Blocking storyboard retired — reference only (B4.4 sketch panels)'
          : storyboardGate.label,
      founderJudgment: storyboardJudgment === 'REFERENCE_ONLY' ? 'REFERENCE_ONLY' : storyboardGate.founderJudgment,
      blocksNextStage: storyboardJudgment === 'REFERENCE_ONLY' ? false : storyboardGate.blocksNextStage,
    },
    {
      gateId: cinematicGate.gateId,
      label: cinematicGate.label,
      founderJudgment: cinematicGate.founderJudgment,
      blocksNextStage: cinematicGate.blocksNextStage,
    },
    {
      gateId: 'GATE_1_KEYFRAME',
      label: 'Keyframe authority review (extracted from approved storyboard)',
      founderJudgment: 'UNREVIEWED',
      blocksNextStage: true,
    },
    {
      gateId: 'GATE_2_ROUGH_CUT',
      label: 'Rough cut review',
      founderJudgment: 'UNREVIEWED',
      blocksNextStage: true,
    },
    {
      gateId: 'GATE_3_FINAL',
      label: 'Final reel review',
      founderJudgment: 'UNREVIEWED',
      blocksNextStage: true,
    },
  ];
}

export function isKeyframeGenerationBlockedByStoryboardGate(
  founderJudgment: StoryboardFounderJudgment,
): boolean {
  return founderJudgment !== 'LOVE_IT';
}

export function isKeyframeGenerationBlockedByCinematicSequenceGate(
  founderJudgment: CinematicSequenceFounderJudgment,
): boolean {
  return founderJudgment !== 'LOVE_IT';
}

export function assertStoryboardApprovedForKeyframeGeneration(
  founderJudgment: StoryboardFounderJudgment,
): void {
  if (isKeyframeGenerationBlockedByStoryboardGate(founderJudgment)) {
    throw new Error(
      'KEYFRAME_GENERATION blocked — GATE_0_STORYBOARD requires LOVE_IT before START/MID/END keyframe generation',
    );
  }
}

export function assertCinematicSequenceApprovedForKeyframeGeneration(
  cinematicJudgment: CinematicSequenceFounderJudgment,
): void {
  if (isKeyframeGenerationBlockedByCinematicSequenceGate(cinematicJudgment)) {
    throw new Error(
      'KEYFRAME_GENERATION blocked — GATE_0B_CINEMATIC_SEQUENCE requires LOVE_IT before START/MID/END production keyframes',
    );
  }
}

export function assertProductionKeyframeGenerationAllowed(params: {
  cinematicSequenceJudgment?: CinematicSequenceFounderJudgment;
  storyboardJudgment?: StoryboardFounderJudgment;
  structuralStoryboardApproval?: StoryboardApprovalState;
  preStoryboardApproval?: PreStoryboardApprovalState;
}): void {
  if (params.preStoryboardApproval) {
    assertPreStoryboardVisualAuthorityApprovedForStoryboard(params.preStoryboardApproval);
  } else {
    assertPreStoryboardVisualAuthorityApprovedForStoryboard({
      gateId: PRE_STORYBOARD_VISUAL_GATE_ID,
      boardJudgments: {
        AUTHORITY_01: 'UNREVIEWED',
        AUTHORITY_02: 'UNREVIEWED',
        AUTHORITY_03: 'UNREVIEWED',
        AUTHORITY_04: 'UNREVIEWED',
        AUTHORITY_05: 'UNREVIEWED',
      },
      allAuthoritiesLoveIt: false,
      anyNotForMe: false,
      blocksCinematicStoryboard: true,
    });
  }

  if (params.structuralStoryboardApproval) {
    assertStructuralStoryboardApprovedForKeyframeGeneration(params.structuralStoryboardApproval);
    return;
  }
  const defaultApproval: StoryboardApprovalState = {
    gateId: STRUCTURAL_STORYBOARD_GATE_ID,
    boardJudgments: {
      BOARD_01: 'UNREVIEWED',
      BOARD_02: 'UNREVIEWED',
      BOARD_03: 'UNREVIEWED',
      BOARD_04: 'UNREVIEWED',
      BOARD_05: 'UNREVIEWED',
    },
    allBoardsLoveIt: false,
    anyNotForMe: false,
    blocksKeyframeGeneration: true,
    blocksVideoGeneration: true,
  };
  assertStructuralStoryboardApprovedForKeyframeGeneration(defaultApproval);
}

export {
  isKeyframeGenerationBlockedByStructuralStoryboardGate,
  assertStructuralStoryboardApprovedForKeyframeGeneration,
  isCinematicStoryboardBlockedByPreStoryboardGate,
  assertPreStoryboardVisualAuthorityApprovedForStoryboard,
};
