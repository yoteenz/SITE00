/**
 * Sprint B4.4 — Reel production gates including GATE_0_STORYBOARD.
 */

import type { FounderReviewGate } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import type { StoryboardFounderJudgment } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';

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

export function buildEntry002FounderReviewGatesWithStoryboard(
  storyboardJudgment: StoryboardFounderJudgment = 'UNREVIEWED',
): FounderReviewGate[] {
  const storyboardGate = buildEntry002StoryboardGate(storyboardJudgment);
  return [
    {
      gateId: storyboardGate.gateId,
      label: storyboardGate.label,
      founderJudgment: storyboardGate.founderJudgment,
      blocksNextStage: storyboardGate.blocksNextStage,
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

export function assertStoryboardApprovedForKeyframeGeneration(
  founderJudgment: StoryboardFounderJudgment,
): void {
  if (isKeyframeGenerationBlockedByStoryboardGate(founderJudgment)) {
    throw new Error(
      'KEYFRAME_GENERATION blocked — GATE_0_STORYBOARD requires LOVE_IT before START/MID/END keyframe generation',
    );
  }
}
