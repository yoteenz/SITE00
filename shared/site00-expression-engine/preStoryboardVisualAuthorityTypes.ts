/**
 * Sprint B4.6 follow-up — Pre-storyboard visual authority types (glue before cinematic storyboard).
 */

export type PreStoryboardFounderJudgment = 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';

export const PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER = [
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

export type PreStoryboardVisualAuthorityRole =
  | 'NDX_PRESENCE'
  | 'SUBJECT_WOMAN_DUAL_ERA'
  | 'NDX_HAND_NAIL_INTERACTION'
  | 'SUBJECT_FASHION_CONTINUITY'
  | 'PHONE_CULTURAL_GLITCH';

export type PreStoryboardAuthorityType =
  | 'NDX_PRESENCE'
  | 'SUBJECT_DUAL_ERA'
  | 'NDX_HANDS_NAILS'
  | 'SUBJECT_FASHION_CONTINUITY'
  | 'PHONE_CULTURAL_GLITCH';

export type PreStoryboardAuthorityStatus =
  | 'REGISTERED'
  | 'VISUAL_INGESTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

/** First-class pre-storyboard authority record (B4.7). */
export type PreStoryboardAuthorityRecord = {
  authorityId: string;
  entryId: 'entry-002';
  authorityType: PreStoryboardAuthorityType;
  title: string;
  domain: PreStoryboardVisualAuthorityRole;
  status: PreStoryboardAuthorityStatus;
  founderJudgment: PreStoryboardFounderJudgment;
  visualAuthority: boolean;
  canon: boolean;
  referenceOnly: boolean;
  assetId: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  notes: string | null;
};

export type PreStoryboardVisualAuthority = {
  boardNumber: number;
  boardId: string;
  boardTitle: string;
  role: PreStoryboardVisualAuthorityRole;
  purpose: string;
  continuityRules: string[];
  requiredVisualElements: string[];
  forbiddenElements: string[];
  visualDescription: string;
  founderJudgment: PreStoryboardFounderJudgment;
  storagePath: string | null;
  previewUrl: string | null;
  /** B4.7 — linked first-class authority record */
  record?: PreStoryboardAuthorityRecord;
};

export type FinalStoryboardEligibilityState =
  | 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL'
  | 'READY_FOR_GENERATION'
  | 'AWAITING_FOUNDER_APPROVAL'
  | 'REVISION_REQUIRED'
  | 'GENERATION_FAILED'
  | 'FAILED_STORYBOARD_STRUCTURE'
  | 'PIPELINE_TEST_ONLY'
  | 'FAILED_VISUAL_AUTHORITY_BINDING';

export type KeyframeEligibilityState =
  | 'BLOCKED'
  | 'BLOCKED_PENDING_FINAL_STORYBOARD_APPROVAL'
  | 'READY_FOR_GENERATION';

export type FounderStoryboardApprovalState =
  | 'BLOCKED_PENDING_STORYBOARD'
  | 'NOT_YET_ACTIVE'
  | 'INACTIVE'
  | 'ACTIVE'
  | 'SATISFIED';

export type PreStoryboardGateSatisfaction = {
  gateId: 'GATE_0B_PRE_STORYBOARD_AUTHORITY';
  satisfied: boolean;
  requiredCount: 5;
  loveItCount: number;
  unreviewedCount: number;
  promisingCount: number;
  notForMeCount: number;
};

export type PreStoryboardApprovalState = {
  gateId: 'GATE_0B_PRE_STORYBOARD_AUTHORITY';
  boardJudgments: Record<
    'AUTHORITY_01' | 'AUTHORITY_02' | 'AUTHORITY_03' | 'AUTHORITY_04' | 'AUTHORITY_05',
    PreStoryboardFounderJudgment
  >;
  allAuthoritiesLoveIt: boolean;
  anyNotForMe: boolean;
  blocksCinematicStoryboard: boolean;
};

export type PreStoryboardVisualAuthorityPack = {
  packId: string;
  entryId: 'entry-002';
  treatmentId: string;
  authorities: PreStoryboardVisualAuthority[];
  approvalState: PreStoryboardApprovalState;
  canonState: 'NON_CANON' | 'PRODUCTION_CANDIDATE' | 'CANON';
};

export type PreStoryboardAuthorityQAResult = {
  passed: boolean;
  boardChecks: Array<{ boardNumber: number; check: string; passed: boolean }>;
  blockers: string[];
  result: 'PASS' | 'WARN' | 'FAIL';
};

export type Entry002PreStoryboardAuthorityBootstrapResult = {
  sprint: 'B4.6_FOLLOWUP_PRE_STORYBOARD_VISUAL_AUTHORITY_PACK';
  productionOrder: typeof PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER;
  roleCorrection: {
    ndx: string;
    subjectWoman: string;
    collapsedIdentityFixed: true;
    deprecatedStatement: string;
  };
  treatment: import('./storyboardGateTypes.js').ReelTreatmentAuthority;
  preStoryboardAuthorityPack: PreStoryboardVisualAuthorityPack;
  cinematicSequence: {
    sequenceId: string;
    status: 'PRE_AUTHORITY_EXPERIMENT';
    canonState: 'NON_CANON';
    founderJudgment: 'UNREVIEWED';
    visualAuthority: false;
  };
  finalStoryboard: {
    status: 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL' | 'READY_FOR_GENERATION';
    gateId: 'GATE_0C_STRUCTURAL_STORYBOARD';
  };
  keyframes: 'BLOCKED';
  video: 'BLOCKED';
  qa: PreStoryboardAuthorityQAResult;
  nextAction: 'FOUNDER REVIEW OF FIVE PRE-STORYBOARD VISUAL AUTHORITIES';
};
