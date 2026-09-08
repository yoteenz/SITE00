/**
 * Sprint B4.6 — Entry 002 pipeline state reconciliation (single source of truth).
 * Sprint B4.7 — Gate satisfaction → final storyboard READY_FOR_GENERATION.
 * Sprint B4.8 — Founder approval persisted; active step = FINAL_CINEMATIC_STORYBOARD.
 * Sprint B4.9 — Generated storyboard → AWAITING_FOUNDER_APPROVAL + founder review gate.
 * Sprint B4.9R — Valid storyboard requires structural + continuity + duplication QA pass.
 */

import type {
  FinalStoryboardEligibilityState,
  FounderStoryboardApprovalState,
  KeyframeEligibilityState,
  PreStoryboardApprovalState,
} from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import type { FinalStoryboardFounderJudgment } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION,
  ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION,
  FINAL_STORYBOARD_REVIEW_GATE_ID,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
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

export { ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION, ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION };

export function resolveEntry002NextAction(params?: {
  preStoryboardApproval?: PreStoryboardApprovalState;
  storyboardGenerated?: boolean;
  storyboardValid?: boolean;
  storyboardFounderJudgment?: FinalStoryboardFounderJudgment;
  structuralQaPassed?: boolean;
}): typeof ENTRY_002_ACTIVE_NEXT_ACTION | typeof ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION | typeof ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION | typeof ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION {
  const preStoryboardComplete = params?.preStoryboardApproval?.allAuthoritiesLoveIt ?? false;
  if (!preStoryboardComplete) return ENTRY_002_ACTIVE_NEXT_ACTION;

  const valid = params?.storyboardValid ?? params?.storyboardGenerated ?? false;
  if (valid) return ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION;

  if (params?.storyboardGenerated && !params?.structuralQaPassed) {
    return ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION;
  }

  return ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION;
}

export type Entry002ProductionEligibility = {
  preStoryboardAuthorityGate: 'AWAITING_FOUNDER_APPROVAL' | 'SATISFIED';
  requiredAuthorityCount: 5;
  approvedAuthorityCount: number;
  finalStoryboardEligibility: FinalStoryboardEligibilityState;
  keyframeEligibility: KeyframeEligibilityState;
  videoEligibility: 'BLOCKED';
  founderStoryboardApproval: FounderStoryboardApprovalState;
};

export function resolveEntry002ProductionEligibility(params?: {
  preStoryboardApproval?: PreStoryboardApprovalState;
  storyboardGenerated?: boolean;
  storyboardValid?: boolean;
  storyboardFounderJudgment?: FinalStoryboardFounderJudgment;
  structuralQaPassed?: boolean;
  continuityQaPassed?: boolean;
  duplicationQaPassed?: boolean;
}): Entry002ProductionEligibility {
  const satisfied = params?.preStoryboardApproval?.allAuthoritiesLoveIt ?? false;
  const approvedCount = satisfied ? 5 : 0;
  const judgment = params?.storyboardFounderJudgment ?? 'UNREVIEWED';
  const valid = params?.storyboardValid ?? false;
  const generatedAttempt = params?.storyboardGenerated ?? false;
  const structuralPassed = params?.structuralQaPassed ?? false;
  const continuityPassed = params?.continuityQaPassed ?? false;
  const duplicationPassed = params?.duplicationQaPassed ?? false;
  const allQaPassed = structuralPassed && continuityPassed && duplicationPassed;

  let finalStoryboardEligibility: FinalStoryboardEligibilityState = satisfied
    ? 'READY_FOR_GENERATION'
    : 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL';

  if (valid && allQaPassed) {
    finalStoryboardEligibility =
      judgment === 'PROMISING_REFINE' ? 'REVISION_REQUIRED' : 'AWAITING_FOUNDER_APPROVAL';
  } else if (generatedAttempt && !allQaPassed) {
    finalStoryboardEligibility = 'REVISION_REQUIRED';
  }

  let founderStoryboardApproval: FounderStoryboardApprovalState = 'BLOCKED_PENDING_STORYBOARD';
  if (valid && allQaPassed) founderStoryboardApproval = 'ACTIVE';
  else if (generatedAttempt && !allQaPassed) founderStoryboardApproval = 'INACTIVE';
  else if (satisfied && !generatedAttempt) founderStoryboardApproval = 'NOT_YET_ACTIVE';

  let keyframeEligibility: KeyframeEligibilityState = 'BLOCKED';
  if (valid) {
    keyframeEligibility =
      judgment === 'LOVE_IT' ? 'READY_FOR_GENERATION' : 'BLOCKED_PENDING_FINAL_STORYBOARD_APPROVAL';
  } else if (generatedAttempt) {
    keyframeEligibility = 'BLOCKED_PENDING_FINAL_STORYBOARD_APPROVAL';
  }

  return {
    preStoryboardAuthorityGate: satisfied ? 'SATISFIED' : 'AWAITING_FOUNDER_APPROVAL',
    requiredAuthorityCount: 5,
    approvedAuthorityCount: approvedCount,
    finalStoryboardEligibility,
    keyframeEligibility,
    videoEligibility: 'BLOCKED',
    founderStoryboardApproval,
  };
}

export type Entry002PipelineReconciliationState = {
  productionOrder: typeof ENTRY_002_ACTIVE_PRODUCTION_ORDER;
  currentStage: (typeof ENTRY_002_ACTIVE_PRODUCTION_ORDER)[number];
  activeProductionStep: (typeof ENTRY_002_ACTIVE_PRODUCTION_ORDER)[number];
  activeGate: {
    gateId: typeof ENTRY_002_ACTIVE_GATE_ID | 'FINAL_CINEMATIC_STORYBOARD' | typeof FINAL_STORYBOARD_REVIEW_GATE_ID;
    label: string;
    requiredJudgment: 'LOVE_IT';
    authorityCount: 5;
    satisfied: boolean;
    gateStatus: 'AWAITING_FOUNDER_APPROVAL' | 'SATISFIED' | 'ACTIVE' | 'INACTIVE';
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
    | typeof ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION
    | typeof ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION
    | typeof ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION;
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
    approved: boolean;
    rendered: boolean;
    valid: boolean;
    founderJudgment: FinalStoryboardFounderJudgment;
  };
  keyframes: KeyframeEligibilityState;
  video: 'BLOCKED';
  eligibility: Entry002ProductionEligibility;
  stopConditions: string[];
};

export function buildEntry002PipelineReconciliationState(params?: {
  preStoryboardApproval?: PreStoryboardApprovalState;
  storyboardGenerated?: boolean;
  storyboardValid?: boolean;
  storyboardFounderJudgment?: FinalStoryboardFounderJudgment;
  storyboardApproved?: boolean;
  structuralQaPassed?: boolean;
  continuityQaPassed?: boolean;
  duplicationQaPassed?: boolean;
}): Entry002PipelineReconciliationState {
  const preStoryboardComplete = params?.preStoryboardApproval?.allAuthoritiesLoveIt ?? false;
  const valid = params?.storyboardValid ?? params?.storyboardGenerated ?? false;
  const generatedAttempt = params?.storyboardGenerated ?? false;
  const judgment = params?.storyboardFounderJudgment ?? 'UNREVIEWED';
  const approved = params?.storyboardApproved ?? judgment === 'LOVE_IT';
  const structuralPassed = params?.structuralQaPassed ?? false;
  const continuityPassed = params?.continuityQaPassed ?? false;
  const duplicationPassed = params?.duplicationQaPassed ?? false;
  const allQaPassed = structuralPassed && continuityPassed && duplicationPassed;

  const eligibility = resolveEntry002ProductionEligibility({
    preStoryboardApproval: params?.preStoryboardApproval,
    storyboardGenerated: generatedAttempt,
    storyboardValid: valid,
    storyboardFounderJudgment: judgment,
    structuralQaPassed: structuralPassed,
    continuityQaPassed: continuityPassed,
    duplicationQaPassed: duplicationPassed,
  });

  const finalStoryboardStatus = eligibility.finalStoryboardEligibility;

  let currentStage: (typeof ENTRY_002_ACTIVE_PRODUCTION_ORDER)[number] = 'PRE_STORYBOARD_VISUAL_AUTHORITIES';
  let activeProductionStep: (typeof ENTRY_002_ACTIVE_PRODUCTION_ORDER)[number] = 'PRE_STORYBOARD_VISUAL_AUTHORITIES';
  let activeGateId: Entry002PipelineReconciliationState['activeGate']['gateId'] = ENTRY_002_ACTIVE_GATE_ID;
  let activeGateLabel = 'Pre-storyboard visual authority — 5 glue boards must be LOVE_IT before final storyboard';
  let activeGateStatus: Entry002PipelineReconciliationState['activeGate']['gateStatus'] = 'AWAITING_FOUNDER_APPROVAL';

  if (preStoryboardComplete && !valid) {
    currentStage = 'FINAL_CINEMATIC_STORYBOARD';
    activeProductionStep = 'FINAL_CINEMATIC_STORYBOARD';
    activeGateId = 'FINAL_CINEMATIC_STORYBOARD';
    activeGateLabel = generatedAttempt
      ? 'Final cinematic storyboard — REPAIR REQUIRED (structural QA failed or incomplete panels)'
      : 'Final cinematic storyboard — READY FOR GENERATION (pre-storyboard gate satisfied)';
    activeGateStatus = generatedAttempt ? 'INACTIVE' : 'SATISFIED';
  } else if (preStoryboardComplete && valid && allQaPassed) {
    currentStage = 'FOUNDER_STORYBOARD_APPROVAL';
    activeProductionStep = 'FOUNDER_STORYBOARD_APPROVAL';
    activeGateId = FINAL_STORYBOARD_REVIEW_GATE_ID;
    activeGateLabel = 'Founder final cinematic storyboard review — AWAITING FOUNDER APPROVAL';
    activeGateStatus = 'ACTIVE';
  }

  return {
    productionOrder: ENTRY_002_ACTIVE_PRODUCTION_ORDER,
    currentStage,
    activeProductionStep,
    activeGate: {
      gateId: activeGateId,
      label: activeGateLabel,
      requiredJudgment: 'LOVE_IT',
      authorityCount: 5,
      satisfied: preStoryboardComplete && !valid,
      gateStatus: activeGateStatus,
      authorities: [
        'NDX_PRESENCE',
        'SUBJECT_WOMAN_DUAL_ERA',
        'NDX_HANDS_NAILS',
        'SUBJECT_FASHION_CONTINUITY',
        'PHONE_CULTURAL_GLITCH',
      ],
    },
    nextAction: resolveEntry002NextAction({
      preStoryboardApproval: params?.preStoryboardApproval,
      storyboardGenerated: generatedAttempt,
      storyboardValid: valid,
      storyboardFounderJudgment: judgment,
      structuralQaPassed: structuralPassed,
    }),
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
      promotionBlocked: !approved,
      autoApproved: false,
      approved,
      rendered: valid,
      valid,
      founderJudgment: judgment,
    },
    keyframes: eligibility.keyframeEligibility,
    video: 'BLOCKED',
    eligibility,
    stopConditions: valid
      ? [
          'Do not auto-approve final storyboard — founder review required',
          'Do not generate keyframes until storyboard LOVE_IT',
          'Do not promote cinematic sequence to visual authority',
          'Do not dispatch video',
        ]
      : preStoryboardComplete
        ? [
            'Generate or repair final cinematic storyboard — distinct panel assets required',
            'Do not activate founder storyboard review until structural + continuity QA pass',
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
