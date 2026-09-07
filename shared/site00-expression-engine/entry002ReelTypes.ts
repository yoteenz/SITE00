/**
 * Entry 002 REEL production types — Sprint B4.
 */

import type { AudioPlan, GenerationReceipt, ProductionRoutingRecommendation } from './types.js';
import type { ChapterGrammarValidationResult } from './chapterGrammarTypes.js';
import type { ChapterRepetitionQAResult } from './chapterGrammarTypes.js';
import type { FormatNativeQAResult } from './types.js';
import type { SequenceQAResult } from './types.js';
import type { CoverAnnotationVariationQAResult } from './chapterCoverAnnotationTypes.js';

export const REEL_ARGUMENT_BEATS = [
  'CLAIM',
  'RECEIPT',
  'CONTRADICTION',
  'INTERJECTION',
  'SYNTHESIS',
] as const;

export type ReelArgumentBeat = (typeof REEL_ARGUMENT_BEATS)[number];

export type ReelShotPlanItem = {
  shotId: string;
  order: number;
  title: string;
  beat: ReelArgumentBeat | 'HOOK' | 'END_CARD';
  description: string;
  durationHintSec: string;
};

export type ReelKeyframeRole = 'START' | 'MID' | 'END';

export type ReelKeyframeSpec = {
  keyframeId: string;
  role: ReelKeyframeRole;
  shotIds: string[];
  description: string;
  visualRequirements: string[];
  continuityRefs: string[];
  coverConnection: 'ENTRY_IDENTITY_NOT_SHOT_LIST';
};

export type ReelKeyframeAsset = {
  assetId: string;
  keyframeId: string;
  role: ReelKeyframeRole;
  storagePath: string;
  previewUrl: string;
  receipt: GenerationReceipt;
  founderJudgment: 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';
  status: 'COMPILED' | 'DISPATCHED';
};

export type ReelKeyframeRasterFrame = {
  role: ReelKeyframeRole;
  assetId: string;
  storagePath: string;
  previewUrl: string;
  provider: string;
  model: string;
  dimensions: { width: number; height: number };
  aspectRatio: '9:16';
  planningReceiptId: string | null;
  generationReceipt: GenerationReceipt;
  founderJudgment: 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';
  canonState: 'NON_CANON' | 'PRODUCTION_CANDIDATE' | 'CANON';
  status: 'DISPATCHED' | 'CACHED';
  qaAdvisory: Array<{ check: string; passed: boolean; advisory: true }>;
};

export type ReelKeyframeRasterQASummary = {
  passed: boolean;
  advisoryOnly: true;
  notFounderApproval: true;
  checks: Array<{ check: string; passed: boolean; advisory: true }>;
  blockers: string[];
  continuity: {
    startToMid: { persists: string[]; changes: string[] };
    midToEnd: { persists: string[]; changes: string[] };
    visualVerification: boolean;
  };
};

export type ReelMotionPlan = {
  planId: string;
  entryId: 'entry-002';
  format: 'REEL';
  cameraBehavior: string[];
  phoneBehavior: string[];
  timelineBehavior: string[];
  cutBehavior: string[];
  transitionLogic: string[];
  status: 'COMPILED';
};

export type FounderReviewGate = {
  gateId: 'GATE_1_KEYFRAME' | 'GATE_2_ROUGH_CUT' | 'GATE_3_FINAL';
  label: string;
  founderJudgment: 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';
  blocksNextStage: boolean;
};

export type ReelPhoneRole = {
  role: 'CULTURAL_EVIDENCE_DEVICE' | 'INTERJECTION_SURFACE' | 'ARCHIVE_PORTAL';
  notAllowed: string[];
  evidenceBehavior: string[];
};

export type ReelFashionDirection = {
  subject: '2016 IG BADDIE FASHION';
  motifsUsed: string[];
  stylingNotes: string[];
  notAllowed: string[];
};

export type ReelEditSuiteBehavior = {
  worldBehavior: string[];
  artifactBehavior: string[];
  allowedElements: string[];
  forbiddenElements: string[];
};

export type ReelProductionTelemetry = {
  generationAttempts: number;
  repairAttempts: number;
  manualInterventions: number;
  founderRevisions: number;
  costUsd: null;
  productionTimeMs: null;
  lineageCompleteness: 'COMPLETE' | 'INCOMPLETE';
};

export type ReelAnnotationUsageContract = {
  rule: {
    consumesLockedSystem: 'B3.2';
    systemId: string;
    reelIsNotCoverInMotion: true;
    coverIdentityNotReelShotLanguage: true;
  };
  lockedEntry002CoverPlan: {
    annotationFamily: string;
    primaryMark: string;
    secondaryMark?: string;
  };
  titleCardPolicy: {
    mayOmit: true;
    maySimplify: true;
    coverRemainsPrimaryAuthority: true;
  };
  entry003PreAssigned: false;
  annotationQASecondaryForReel: true;
};

export type Entry002ReelQAResult = {
  passed: boolean;
  blocking: boolean;
  formatNative: FormatNativeQAResult;
  chapterGrammar: ChapterGrammarValidationResult;
  continuity: { passed: boolean; checks: Array<{ check: string; passed: boolean }> };
  sequence: SequenceQAResult;
  repetition: ChapterRepetitionQAResult;
  entry001Differentiation: { passed: boolean; blockers: string[] };
  coverNotTemplate: { passed: boolean; detail: string };
  audioBeforeVideo: { passed: boolean };
  annotationVariation: CoverAnnotationVariationQAResult | null;
  annotationSurfaceQA: CoverAnnotationVariationQAResult | null;
  reelAnnotationOveruse: { passed: boolean; blockers: string[] };
  blockers: string[];
};

export type DownstreamFormatHold = {
  format: string;
  status: 'UNLOCKED_PENDING_PRODUCTION';
  produced: false;
};

export type Entry002B41BootstrapResult = {
  sprint: 'B4.1_ENTRY_002_REEL_KEYFRAME_RASTERIZATION';
  reelId: string;
  runtimeTargetSec: { min: number; max: number };
  argumentArc: ReelArgumentBeat[];
  shotPlan: ReelShotPlanItem[];
  keyframeRasters: ReelKeyframeRasterFrame[];
  motionPlan: ReelMotionPlan;
  audioPlan: AudioPlan;
  phoneRole: ReelPhoneRole;
  fashionDirection: ReelFashionDirection;
  editSuiteBehavior: ReelEditSuiteBehavior;
  providerRouting: ProductionRoutingRecommendation[];
  founderGates: FounderReviewGate[];
  qa: ReelKeyframeRasterQASummary;
  downstreamHold: DownstreamFormatHold[];
  telemetry: ReelProductionTelemetry;
  lineage: { tracked: number; orphanAssets: number; legacyUntracked: number };
  videoDispatched: false;
  klingBlocked: true;
  roughCutBlocked: true;
  assetsGenerated: 3;
};

export type Entry002B4BootstrapResult = {
  sprint: 'B4_ENTRY_002_REEL_PRODUCTION';
  reelId: string;
  runtimeTargetSec: { min: number; max: number };
  argumentArc: ReelArgumentBeat[];
  shotPlan: ReelShotPlanItem[];
  keyframes: ReelKeyframeAsset[];
  motionPlan: ReelMotionPlan;
  audioPlan: AudioPlan;
  phoneRole: ReelPhoneRole;
  fashionDirection: ReelFashionDirection;
  editSuiteBehavior: ReelEditSuiteBehavior;
  providerRouting: ProductionRoutingRecommendation[];
  founderGates: FounderReviewGate[];
  qa: Entry002ReelQAResult;
  annotationUsage: ReelAnnotationUsageContract;
  downstreamHold: DownstreamFormatHold[];
  telemetry: ReelProductionTelemetry;
  videoDispatched: false;
  assetsGenerated: number;
};
