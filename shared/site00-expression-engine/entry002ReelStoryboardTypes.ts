/**
 * Sprint B4.4 — Reel storyboard authority types.
 */

import type { ReelArgumentBeat } from './entry002ReelTypes.js';

export const REEL_PRODUCTION_ORDER = [
  'ENTRY_ARGUMENT_GRAMMAR',
  'REEL_STORY_NARRATIVE_ARC',
  'COMPLETE_STORYBOARD',
  'FOUNDER_STORYBOARD_JUDGMENT',
  'START_MID_END_KEYFRAMES',
  'FOUNDER_KEYFRAME_JUDGMENT',
  'SHOT_CLIP_GENERATION',
  'ROUGH_CUT',
  'FOUNDER_ROUGH_CUT_JUDGMENT',
  'FINAL_REEL',
] as const;

export type ReelProductionStage = (typeof REEL_PRODUCTION_ORDER)[number];

export type StoryboardFounderJudgment = 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';

export type ReelStoryboardPanel = {
  panelId: string;
  panelNumber: number;
  argumentBeat: ReelArgumentBeat | 'HOOK' | 'END_CARD';
  shotPurpose: string;
  visualDescription: string;
  characterBehavior: string;
  phoneRole: string;
  fashionEvidence: string[];
  editSuiteBehavior: string;
  cameraBehavior: string;
  textBehavior: string;
  audioFoleyCue: string;
  transitionToNext: string;
  narrativeState: string;
  continuityNotes: string;
  keyframeExtractionCandidate: boolean;
  storagePath: string | null;
  previewUrl: string | null;
};

export type ReelStoryboardContinuityAuthority = {
  characterIdentity: string;
  hairSilhouette: string;
  shortLimeNails: string;
  fashionEvidence: string;
  phoneArtifact: string;
  nostalgiaEditSuite: string;
  source: 'ENTRY_002_CONTINUITY_GRAPH' | 'FOUNDER_DIRECTED_TEMPORARY';
};

export type ReelStoryboard = {
  storyboardId: string;
  entryId: 'entry-002';
  chapterId: string;
  formatId: 'REEL';
  runtimeTarget: { min: number; max: number };
  argumentArc: ReelArgumentBeat[];
  sceneCount: number;
  sceneOrder: number[];
  sceneRoles: string[];
  sceneDescriptions: string[];
  visualAction: string[];
  cameraBehavior: string[];
  characterBehavior: string[];
  phoneBehavior: string[];
  artifactBehavior: string[];
  fashionEvidence: string[];
  textBehavior: string[];
  audioBehavior: string[];
  transitionBehavior: string[];
  narrativeState: string[];
  continuityNotes: string[];
  panels: ReelStoryboardPanel[];
  storyboardStripPath: string | null;
  storyboardStripUrl: string | null;
  continuityAuthority: ReelStoryboardContinuityAuthority;
  keyframeExtractionMap: {
    START: { sourcePanelIds: string[]; blockedUntilApproval: true };
    MID: { sourcePanelIds: string[]; blockedUntilApproval: true };
    END: { sourcePanelIds: string[]; blockedUntilApproval: true };
  };
  founderJudgment: StoryboardFounderJudgment;
  canonState: 'NON_CANON' | 'PRODUCTION_CANDIDATE' | 'CANON';
  gateId: 'GATE_0_STORYBOARD';
};

export type ReelStoryboardQAResult = {
  passed: boolean;
  checks: Array<{ check: string; passed: boolean; severity: 'PASS' | 'WARN' | 'FAIL' }>;
  blockers: string[];
  result: 'PASS' | 'WARN' | 'FAIL';
};

export type PreStoryboardKeyframeStatus = {
  assetId: string;
  role: 'START' | 'MID' | 'END';
  status: 'PRE_STORYBOARD_EXPERIMENT';
  canonState: 'NON_CANON';
  founderJudgment: 'UNREVIEWED';
  mayNotBecomeReelAuthority: true;
  mayNotSourceMotion: true;
};

export type ReelStoryboardTelemetry = {
  storyboardGeneration: number;
  keyframeGeneration: number;
  videoGeneration: number;
};

export type Entry002B44BootstrapResult = {
  sprint: 'B4.4_ENTRY_002_REEL_STORYBOARD_AUTHORITY';
  productionOrder: typeof REEL_PRODUCTION_ORDER;
  storyboard: ReelStoryboard;
  qa: ReelStoryboardQAResult;
  telemetry: ReelStoryboardTelemetry;
  preStoryboardKeyframes: PreStoryboardKeyframeStatus[];
  keyframeGenerationBlocked: true;
  videoGenerationBlocked: true;
  klingBlocked: true;
  roughCutBlocked: true;
  downstreamBlocked: true;
  founderGates: Array<{
    gateId: string;
    label: string;
    founderJudgment: string;
    blocksNextStage: boolean;
  }>;
  storyboardGate: {
    gateId: 'GATE_0_STORYBOARD';
    label: string;
    founderJudgment: StoryboardFounderJudgment;
    blocksKeyframeGeneration: boolean;
    blocksNextStage: boolean;
    unlockActions: Record<StoryboardFounderJudgment, string>;
  };
  panelVisuals: Array<{
    panelNumber: number;
    panelId: string;
    storagePath: string;
    previewUrl: string | null;
    status: string;
    actualFileExists: boolean;
  }>;
  stripVisual: {
    stripId: string;
    storagePath: string;
    previewUrl: string | null;
    status: string;
    actualFileExists: boolean;
  } | null;
  nextAction: 'FOUNDER STORYBOARD REVIEW';
};
