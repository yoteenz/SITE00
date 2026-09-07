/**
 * Sprint B4.6 — Entry 002 pipeline state reconciliation (single source of truth).
 */

import type { PreStoryboardApprovalState } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { PRE_STORYBOARD_VISUAL_GATE_ID } from './preStoryboardAuthorityGate.js';

export const ENTRY_002_ACTIVE_PRODUCTION_ORDER = [
  'COVER_AUTHORITY_APPROVED',
  'REEL_TREATMENT_LOCKED',
  'PRE_STORYBOARD_VISUAL_AUTHORITIES',
  'FOUNDER_PRE_STORYBOARD_AUTHORITY_APPROVAL',
  'FINAL_CINEMATIC_STORYBOARD',
  'FOUNDER_STORYBOARD_APPROVAL',
  'START_MID_END_PRODUCTION_KEYFRAMES',
  'FOUNDER_KEYFRAME_APPROVAL',
  'VIDEO_CLIP_GENERATION',
  'ROUGH_CUT',
  'FINAL_REEL',
] as const;

export const ENTRY_002_ACTIVE_GATE_ID = PRE_STORYBOARD_VISUAL_GATE_ID;

export const ENTRY_002_ACTIVE_NEXT_ACTION =
  'FOUNDER REVIEW OF FIVE PRE-STORYBOARD VISUAL AUTHORITIES' as const;

export type Entry002PipelineReconciliationState = {
  productionOrder: typeof ENTRY_002_ACTIVE_PRODUCTION_ORDER;
  currentStage: (typeof ENTRY_002_ACTIVE_PRODUCTION_ORDER)[number];
  activeGate: {
    gateId: typeof ENTRY_002_ACTIVE_GATE_ID;
    label: string;
    requiredJudgment: 'LOVE_IT';
    authorityCount: 5;
    authorities: [
      'NDX_PRESENCE',
      'SUBJECT_WOMAN_DUAL_ERA',
      'NDX_HANDS_NAILS',
      'SUBJECT_FASHION_CONTINUITY',
      'PHONE_CULTURAL_GLITCH',
    ];
  };
  nextAction: typeof ENTRY_002_ACTIVE_NEXT_ACTION;
  coverAuthority: 'APPROVED';
  reelTreatment: 'LOCKED';
  preStoryboardVisualAuthorities: 'CURRENT_GATE';
  structuralStoryboard: {
    role: 'PLANNING_NARRATIVE_STRUCTURE';
    status: 'NOT_FINAL_VISUAL_AUTHORITY';
    activeGate: false;
    blockedUntil: typeof ENTRY_002_ACTIVE_GATE_ID;
  };
  cinematicSequence: {
    sequenceId: 'NDX-ENTRY-002-REEL-CINEMATIC-SEQUENCE-001';
    status: 'PRE_AUTHORITY_EXPERIMENT';
    canonState: 'NON_CANON';
    visualAuthority: false;
    referenceOnly: true;
  };
  finalStoryboard: {
    status: 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL';
    promotionBlocked: boolean;
  };
  keyframes: 'BLOCKED';
  video: 'BLOCKED';
  stopConditions: string[];
};

export function buildEntry002PipelineReconciliationState(
  preStoryboardApproval?: PreStoryboardApprovalState,
): Entry002PipelineReconciliationState {
  const preStoryboardComplete = preStoryboardApproval?.allAuthoritiesLoveIt ?? false;

  return {
    productionOrder: ENTRY_002_ACTIVE_PRODUCTION_ORDER,
    currentStage: preStoryboardComplete
      ? 'FINAL_CINEMATIC_STORYBOARD'
      : 'PRE_STORYBOARD_VISUAL_AUTHORITIES',
    activeGate: {
      gateId: ENTRY_002_ACTIVE_GATE_ID,
      label: 'Pre-storyboard visual authority — 5 glue boards must be LOVE_IT before final storyboard',
      requiredJudgment: 'LOVE_IT',
      authorityCount: 5,
      authorities: [
        'NDX_PRESENCE',
        'SUBJECT_WOMAN_DUAL_ERA',
        'NDX_HANDS_NAILS',
        'SUBJECT_FASHION_CONTINUITY',
        'PHONE_CULTURAL_GLITCH',
      ],
    },
    nextAction: ENTRY_002_ACTIVE_NEXT_ACTION,
    coverAuthority: 'APPROVED',
    reelTreatment: 'LOCKED',
    preStoryboardVisualAuthorities: 'CURRENT_GATE',
    structuralStoryboard: {
      role: 'PLANNING_NARRATIVE_STRUCTURE',
      status: 'NOT_FINAL_VISUAL_AUTHORITY',
      activeGate: false,
      blockedUntil: ENTRY_002_ACTIVE_GATE_ID,
    },
    cinematicSequence: {
      sequenceId: 'NDX-ENTRY-002-REEL-CINEMATIC-SEQUENCE-001',
      status: 'PRE_AUTHORITY_EXPERIMENT',
      canonState: 'NON_CANON',
      visualAuthority: false,
      referenceOnly: true,
    },
    finalStoryboard: {
      status: 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL',
      promotionBlocked: !preStoryboardComplete,
    },
    keyframes: 'BLOCKED',
    video: 'BLOCKED',
    stopConditions: [
      'Do not generate final storyboard until all 5 pre-storyboard authorities LOVE_IT',
      'Do not promote cinematic sequence to visual authority',
      'Do not generate keyframes or dispatch video',
    ],
  };
}
