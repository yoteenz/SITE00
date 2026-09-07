/**
 * Sprint B4.5 — Cinematic Visual Sequence Board types.
 */

import type { ReelArgumentBeat } from './entry002ReelTypes.js';

export const CINEMATIC_VIDEO_PRODUCTION_ORDER = [
  'ENTRY_ARGUMENT_GRAMMAR',
  'REEL_TREATMENT',
  'DIRECTOR_BLOCKING_SHOT_MAP',
  'CINEMATIC_VISUAL_SEQUENCE_BOARD',
  'FOUNDER_VISUAL_SEQUENCE_JUDGMENT',
  'START_MID_END_PRODUCTION_KEYFRAMES',
  'FOUNDER_KEYFRAME_JUDGMENT',
  'VIDEO_CLIP_GENERATION',
  'ROUGH_CUT',
  'FOUNDER_ROUGH_CUT_JUDGMENT',
  'FINAL_REEL',
] as const;

export type CinematicVideoProductionStage = (typeof CINEMATIC_VIDEO_PRODUCTION_ORDER)[number];

export type CinematicSequenceFounderJudgment = 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';

export type BlockingStoryboardStatus = {
  storyboardId: 'NDX-ENTRY-002-REEL-STORYBOARD-001';
  type: 'DIRECTOR_BLOCKING_STORYBOARD';
  status: 'REFERENCE_ONLY';
  canonState: 'NON_CANON';
  visualAuthority: false;
  purpose: 'shot order, argument beats, basic blocking, narrative progression only';
  preserves: string[];
  doesNotDefine: string[];
};

export type CinematicContinuityReferenceBoard = {
  boardId: string;
  label: string;
  role: 'CHARACTER_IDENTITY' | 'HANDS_NAILS' | 'HAIR_SILHOUETTE' | 'FASHION_EVIDENCE' | 'PHONE_EDIT_SUITE';
  storagePath: string;
  previewUrl: string | null;
  resolved: boolean;
};

export type CinematicVisualSequenceFrame = {
  frameId: string;
  frameNumber: number;
  argumentBeat: ReelArgumentBeat | 'HOOK' | 'END_CARD';
  shotPurpose: string;
  visualDescription: string;
  cameraBehavior: string;
  characterPresence: string;
  phoneRole: string;
  fashionEvidence: string[];
  editSuiteBehavior: string;
  textBehavior: string;
  transitionLogic: string;
  continuityNotes: string;
  referenceBoardIds: string[];
  priorFrameReference: boolean;
  keyframeExtractionCandidate: boolean;
  storagePath: string | null;
  previewUrl: string | null;
};

export type CinematicVisualSequenceBoard = {
  sequenceId: string;
  entryId: 'entry-002';
  chapterId: string;
  formatId: 'REEL';
  visualStyle: 'CINEMATIC_VISUAL_DEVELOPMENT';
  frameCount: number;
  frames: CinematicVisualSequenceFrame[];
  contactSheetPath: string | null;
  contactSheetUrl: string | null;
  continuityReferences: CinematicContinuityReferenceBoard[];
  characterVisualCanon: {
    ndxRole: string;
    ndxVisibility: string;
    subjectWomanRole: string;
    subjectWomanIdentity: string;
    subjectWomanSkinTone: string;
    subjectWomanHair: string;
    subjectWomanMakeup: string;
    ndxNails: string;
    subjectWomanWardrobe: string;
    roleSplitCorrected: true;
    deprecatedCollapsedIdentity: string;
  };
  authorityExperimentStatus: 'PRE_AUTHORITY_EXPERIMENT';
  visualAuthority: false;
  keyframeExtractionMap: {
    START: { sourceFrameIds: string[]; blockedUntilApproval: true };
    MID: { sourceFrameIds: string[]; blockedUntilApproval: true };
    END: { sourceFrameIds: string[]; blockedUntilApproval: true };
  };
  founderJudgment: CinematicSequenceFounderJudgment;
  canonState: 'NON_CANON' | 'PRODUCTION_CANDIDATE' | 'CANON';
  gateId: 'GATE_REF_CINEMATIC_SEQUENCE';
};

export type CinematicSequenceQAResult = {
  passed: boolean;
  checks: Array<{ check: string; passed: boolean; severity: 'PASS' | 'WARN' | 'FAIL' }>;
  blockers: string[];
  result: 'PASS' | 'WARN' | 'FAIL';
};

export type Entry002B45BootstrapResult = {
  sprint: 'B4.5_ENTRY_002_CINEMATIC_VISUAL_SEQUENCE';
  productionOrder: typeof CINEMATIC_VIDEO_PRODUCTION_ORDER;
  blockingStoryboard: BlockingStoryboardStatus;
  cinematicSequence: CinematicVisualSequenceBoard;
  qa: CinematicSequenceQAResult;
  telemetry: {
    blockingStoryboardGeneration: number;
    cinematicSequenceGeneration: number;
    keyframeGeneration: number;
    videoGeneration: number;
  };
  preStoryboardKeyframes: Array<{ assetId: string; status: string; canonState: string }>;
  keyframeGenerationBlocked: true;
  videoGenerationBlocked: true;
  klingBlocked: true;
  roughCutBlocked: true;
  downstreamBlocked: true;
  founderGates: Array<{ gateId: string; label: string; founderJudgment: string; blocksNextStage: boolean }>;
  cinematicSequenceGate: {
    gateId: 'GATE_REF_CINEMATIC_SEQUENCE';
    label: string;
    founderJudgment: CinematicSequenceFounderJudgment;
    blocksKeyframeGeneration: boolean;
    blocksNextStage: boolean;
  };
  frameVisuals: Array<{
    frameNumber: number;
    frameId: string;
    storagePath: string;
    previewUrl: string | null;
    status: string;
    actualFileExists: boolean;
    referenceBoardsUsed: string[];
  }>;
  contactSheetVisual: {
    storagePath: string;
    previewUrl: string | null;
    status: string;
    actualFileExists: boolean;
  } | null;
  nextAction: 'FOUNDER CINEMATIC VISUAL SEQUENCE REVIEW';
};
