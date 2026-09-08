/**
 * Sprint B4.6 — Entry 002 pipeline state reconciliation (single source of truth).
 * Sprint B4.7 — Gate satisfaction → final storyboard READY_FOR_GENERATION.
 * Sprint B4.8 — Founder approval persisted; active step = FINAL_CINEMATIC_STORYBOARD.
 */

import type {
  FinalStoryboardEligibilityState,
  PreStoryboardApprovalState,
} from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
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

export const ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION =
  'GENERATE FINAL CINEMATIC STORYBOARD' as const;

export function resolveEntry002NextAction(
  preStoryboardApproval?: PreStoryboardApprovalState,
): typeof ENTRY_002_ACTIVE_NEXT_ACTION | typeof ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION {
  return preStoryboardApproval?.allAuthoritiesLoveIt
    ? ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION
    : ENTRY_002_ACTIVE_NEXT_ACTION;
}

export type Entry002ProductionEligibility = {
  preStoryboardAuthorityGate: 'AWAITING_FOUNDER_APPROVAL' | 'SATISFIED';
  requiredAuthorityCount: 5;
  approvedAuthorityCount: number;
  finalStoryboardEligibility: FinalStoryboardEligibilityState;
  keyframeEligibility: 'BLOCKED';
  videoEligibility: 'BLOCKED';
  founderStoryboardApproval: 'BLOCKED_PENDING_STORYBOARD' | 'NOT_YET_ACTIVE';
};

export function resolveEntry002ProductionEligibility(
  preStoryboardApproval?: PreStoryboardApprovalState,
): Entry002ProductionEligibility {
  const satisfied = preStoryboardApproval?.allAuthoritiesLoveIt ?? false;
  const approvedCount = satisfied ? 5 : 0;

  return {
    preStoryboardAuthorityGate: satisfied ? 'SATISFIED' : 'AWAITING_FOUNDER_APPROVAL',
    requiredAuthorityCount: 5,
    approvedAuthorityCount: approvedCount,
    finalStoryboardEligibility: satisfied
      ? 'READY_FOR_GENERATION'
      : 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL',
    keyframeEligibility: 'BLOCKED',
    videoEligibility: 'BLOCKED',
    founderStoryboardApproval: 'BLOCKED_PENDING_STORYBOARD',
  };
}

export type Entry002PipelineReconciliationState = {
  productionOrder: typeof ENTRY_002_ACTIVE_PRODUCTION_ORDER;
  currentStage: (typeof ENTRY_002_ACTIVE_PRODUCTION_ORDER)[number];
  activeProductionStep: (typeof ENTRY_002_ACTIVE_PRODUCTION_ORDER)[number];
  activeGate: {
    gateId: typeof ENTRY_002_ACTIVE_GATE_ID | 'FINAL_CINEMATIC_STORYBOARD';
    label: string;
    requiredJudgment: 'LOVE_IT';
    authorityCount: 5;
    satisfied: boolean;
    gateStatus: 'AWAITING_FOUNDER_APPROVAL' | 'SATISFIED';
    authorities: [
      'NDX_PRESENCE',
      'SUBJECT_WOMAN_DUAL_ERA',
      'NDX_HANDS_NAILS',
      'SUBJECT_FASHION_CONTINUITY',
      'PHONE_CULTURAL_GLITCH',
    ];
  };
  nextAction:
    | typeof ENTRY_002_ACTIVE_NEXT_ACTION
    | typeof ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION;
  coverAuthority: 'APPROVED';
  reelTreatment: 'LOCKED';
  preStoryboardVisualAuthorities: 'CURRENT_GATE' | 'GATE_SATISFIED' | 'APPROVED';
  founderPreStoryboardAuthorityApproval: 'AWAITING_FOUNDER' | 'SATISFIED';
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
    active: false;
  };
  finalStoryboard: {
    status: FinalStoryboardEligibilityState;
    promotionBlocked: boolean;
    autoApproved: false;
    approved: false;
  };
  keyframes: 'BLOCKED';
  video: 'BLOCKED';
  eligibility: Entry002ProductionEligibility;
  stopConditions: string[];
};

export function buildEntry002PipelineReconciliationState(
  preStoryboardApproval?: PreStoryboardApprovalState,
): Entry002PipelineReconciliationState {
  const preStoryboardComplete = preStoryboardApproval?.allAuthoritiesLoveIt ?? false;
  const finalStoryboardStatus: FinalStoryboardEligibilityState = preStoryboardComplete
    ? 'READY_FOR_GENERATION'
    : 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL';
  const eligibility = resolveEntry002ProductionEligibility(preStoryboardApproval);

  return {
    productionOrder: ENTRY_002_ACTIVE_PRODUCTION_ORDER,
    currentStage: preStoryboardComplete
      ? 'FINAL_CINEMATIC_STORYBOARD'
      : 'PRE_STORYBOARD_VISUAL_AUTHORITIES',
    activeProductionStep: preStoryboardComplete
      ? 'FINAL_CINEMATIC_STORYBOARD'
      : 'PRE_STORYBOARD_VISUAL_AUTHORITIES',
    activeGate: {
      gateId: preStoryboardComplete ? 'FINAL_CINEMATIC_STORYBOARD' : ENTRY_002_ACTIVE_GATE_ID,
      label: preStoryboardComplete
        ? 'Final cinematic storyboard — READY FOR GENERATION (pre-storyboard gate satisfied)'
        : 'Pre-storyboard visual authority — 5 glue boards must be LOVE_IT before final storyboard',
      requiredJudgment: 'LOVE_IT',
      authorityCount: 5,
      satisfied: preStoryboardComplete,
      gateStatus: preStoryboardComplete ? 'SATISFIED' : 'AWAITING_FOUNDER_APPROVAL',
      authorities: [
        'NDX_PRESENCE',
        'SUBJECT_WOMAN_DUAL_ERA',
        'NDX_HANDS_NAILS',
        'SUBJECT_FASHION_CONTINUITY',
        'PHONE_CULTURAL_GLITCH',
      ],
    },
    nextAction: resolveEntry002NextAction(preStoryboardApproval),
    coverAuthority: 'APPROVED',
    reelTreatment: 'LOCKED',
    preStoryboardVisualAuthorities: preStoryboardComplete ? 'APPROVED' : 'CURRENT_GATE',
    founderPreStoryboardAuthorityApproval: preStoryboardComplete ? 'SATISFIED' : 'AWAITING_FOUNDER',
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
      active: false,
    },
    finalStoryboard: {
      status: finalStoryboardStatus,
      promotionBlocked: !preStoryboardComplete,
      autoApproved: false,
      approved: false,
    },
    keyframes: 'BLOCKED',
    video: 'BLOCKED',
    eligibility,
    stopConditions: preStoryboardComplete
      ? [
          'Do not auto-approve final storyboard — founder review required after generation',
          'Do not promote cinematic sequence to visual authority',
          'Do not generate keyframes or dispatch video',
        ]
      : [
          'Do not generate final storyboard until all 5 pre-storyboard authorities LOVE_IT',
          'Do not promote cinematic sequence to visual authority',
          'Do not generate keyframes or dispatch video',
        ],
  };
}
