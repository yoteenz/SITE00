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
    status: 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL';
    gateId: 'GATE_0C_STRUCTURAL_STORYBOARD';
  };
  keyframes: 'BLOCKED';
  video: 'BLOCKED';
  qa: PreStoryboardAuthorityQAResult;
  nextAction: 'FOUNDER REVIEW OF FIVE PRE-STORYBOARD VISUAL AUTHORITIES';
};
