/**
 * Sprint B4.6 — Storyboard gate + reel treatment authority types.
 * (Founder methodology: storyboard gate before keyframes — Entry 002 proof case.)
 */

import { PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER } from './preStoryboardVisualAuthorityTypes.js';

export type StoryboardFounderJudgment = 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';

export const STORYBOARD_GATED_PRODUCTION_ORDER = PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER;

export type StoryboardGateProductionStage = (typeof STORYBOARD_GATED_PRODUCTION_ORDER)[number];

export type Entry002ArgumentArcExtended = [
  'CLAIM',
  'RECEIPT',
  'CONTRADICTION',
  'LENS',
  'INTERJECTION',
  'SYNTHESIS',
];

export type StoryboardBeat = {
  beatNumber: number;
  beatId: string;
  title: string;
  argumentRole: Entry002ArgumentArcExtended[number] | 'HOOK' | 'HANDOFF';
  description: string;
  ndxRole: string;
  subjectWomanRole: string;
  phoneRole: string;
  fashionEvidence: string[];
  continuityNotes: string;
};

export type StoryboardBoard = {
  boardNumber: number;
  boardId: string;
  boardTitle: string;
  storyFunction: string;
  argumentGrammarRole: Entry002ArgumentArcExtended[number];
  beatNumbers: number[];
  visualDescription: string;
  continuityNotes: string;
  requiredVisualElements: string[];
  transitionIn: string;
  transitionOut: string;
  ndxPresence: string;
  subjectWomanPresence: string;
  founderJudgment: StoryboardFounderJudgment;
  storagePath: string | null;
  previewUrl: string | null;
  keyframeExtractionRole: 'START' | 'MID' | 'END' | null;
};

export type StoryboardApprovalState = {
  gateId: 'GATE_0C_STRUCTURAL_STORYBOARD';
  boardJudgments: Record<
    'BOARD_01' | 'BOARD_02' | 'BOARD_03' | 'BOARD_04' | 'BOARD_05',
    StoryboardFounderJudgment
  >;
  allBoardsLoveIt: boolean;
  anyNotForMe: boolean;
  blocksKeyframeGeneration: boolean;
  blocksVideoGeneration: boolean;
};

export type KeyframeGenerationPrerequisite = {
  requiresStoryboardApproval: true;
  requiresAllBoardsLoveIt: true;
  sourceBoardIds: {
    START: string;
    MID: string;
    END: string;
  };
  blockedUntil: StoryboardApprovalState['gateId'];
  satisfied: boolean;
};

export type ReelTreatmentAuthority = {
  treatmentId: string;
  entryId: 'entry-002';
  entryTitle: string;
  subject: string;
  chapterId: string;
  chapterTitle: string;
  argumentArc: Entry002ArgumentArcExtended;
  territory: string;
  world: string;
  status: 'LOCKED';
  logline: string;
  dramaticEngine: string;
  characterRoles: {
    ndx: string;
    subjectWoman: string;
  };
  coreStory: string;
  visualWorldRules: string[];
  fashionEvidenceRules: string[];
  storyEndingRule: string;
  entry003HandoffHook: string;
  canonState: 'PRODUCTION_AUTHORITY';
};

export type CharacterAuthoritySet = {
  ndxPresenceProfile: {
    role: 'observer_investigator_interjector';
    visibility: 'partial_only';
    allowedPresence: string[];
    nailAuthority: string;
  };
  subjectWomanContinuityProfile: {
    role: 'proof_same_woman_both_timelines';
    identityLock: string;
    fashionStability: string;
    timelineRule: string;
  };
  handAndNailAuthority: string;
  hairSilhouetteAuthority: string;
  fashionEvidenceAuthority: string;
};

export type ReelStoryboardAuthority = {
  authorityId: string;
  entryId: 'entry-002';
  treatmentId: string;
  beatOutline: StoryboardBeat[];
  boards: StoryboardBoard[];
  characterAuthority: CharacterAuthoritySet;
  approvalState: StoryboardApprovalState;
  keyframePrerequisite: KeyframeGenerationPrerequisite;
  canonState: 'NON_CANON' | 'PRODUCTION_CANDIDATE' | 'CANON';
};

export type StoryboardAuthorityQAResult = {
  passed: boolean;
  boardChecks: Array<{ boardNumber: number; check: string; passed: boolean }>;
  blockers: string[];
  result: 'PASS' | 'WARN' | 'FAIL';
};

export type Entry002StoryboardGateBootstrapResult = {
  sprint: 'B4.6_ENTRY_002_STORYBOARD_GATE_REEL_TREATMENT';
  productionOrder: typeof STORYBOARD_GATED_PRODUCTION_ORDER;
  currentStateAudit: {
    coverAnchorApproved: true;
    preStoryboardKeyframes: 'NON_CANON';
    b44SketchStoryboard: 'REFERENCE_ONLY';
    b45CinematicSequence: 'PRE_AUTHORITY_EXPERIMENT' | 'PARALLEL_VISUAL_DEV';
    preStoryboardVisualAuthorities: 'ACTIVE';
    structuralStoryboardAuthority:
      | 'ACTIVE'
      | 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL';
  };
  storyCorrection: {
    coreStory: string;
    sameWomanRule: string;
    ndxRole: string;
  };
  treatment: ReelTreatmentAuthority;
  storyboardAuthority: ReelStoryboardAuthority;
  qa: StoryboardAuthorityQAResult;
  blockingRules: {
    keyframeGeneration: 'BLOCKED_PENDING_STORYBOARD_APPROVAL';
    motionGeneration: 'BLOCKED';
    kling: 'BLOCKED';
    roughCut: 'BLOCKED';
    videoDispatch: 'BLOCKED';
  };
  nextAction: 'FOUNDER REVIEW OF FIVE PRE-STORYBOARD VISUAL AUTHORITIES';
  founderReviewSlots?: Array<{
    boardKey: string;
    boardNumber: number;
    boardId: string;
    boardTitle: string;
    founderJudgment: StoryboardFounderJudgment;
  }>;
  telemetry?: {
    structuralBoardGenerations: number;
    preStoryboardKeyframeCount: number;
    b44Retired: string;
  };
};
