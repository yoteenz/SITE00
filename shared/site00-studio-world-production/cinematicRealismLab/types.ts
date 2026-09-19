/**
 * P0.CR.1 — Cinematic Realism Lab types (generic Studio World).
 */

import type {
  CINEMATIC_REALISM_FAILURES,
  CINEMATIC_REALISM_FOUNDER_JUDGMENTS,
  CINEMATIC_REALISM_LANES,
  CINEMATIC_REALISM_PROVIDER_IDS,
  CINEMATIC_REALISM_PROVIDER_READINESS,
  CINEMATIC_REALISM_SHOT_TYPES,
  HYBRID_PIPELINE_STAGES,
  POST_PIPELINE_SLOTS,
  REALISM_REFERENCE_TYPES,
  REALISM_TEST_TYPES,
} from './constants.js';

export type CinematicRealismShotType = (typeof CINEMATIC_REALISM_SHOT_TYPES)[number];
export type CinematicRealismProviderId = (typeof CINEMATIC_REALISM_PROVIDER_IDS)[number];
export type CinematicRealismLaneId = (typeof CINEMATIC_REALISM_LANES)[number];
export type ProviderReadinessState = (typeof CINEMATIC_REALISM_PROVIDER_READINESS)[number];
export type RealismFailureCode = (typeof CINEMATIC_REALISM_FAILURES)[number];
export type RealismFounderJudgment = (typeof CINEMATIC_REALISM_FOUNDER_JUDGMENTS)[number];
export type HybridPipelineStage = (typeof HYBRID_PIPELINE_STAGES)[number];
export type PostPipelineSlot = (typeof POST_PIPELINE_SLOTS)[number];
export type RealismReferenceType = (typeof REALISM_REFERENCE_TYPES)[number];
export type RealismTestType = (typeof REALISM_TEST_TYPES)[number];

export type RealismProviderCapability = {
  providerId: CinematicRealismProviderId;
  label: string;
  readiness: ProviderReadinessState;
  capabilities: {
    textToImage: boolean;
    imageToVideo: boolean;
    referenceImage: boolean;
    multiReference: boolean;
    identityConsistency: boolean;
    lipSync: boolean;
    aspectRatios: string[];
    maxClipDurationSec: number | null;
    cameraMotionControl: 'NONE' | 'LIMITED' | 'MODERATE' | 'STRONG';
    styleAdherence: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  costEstimateUsdPerClip: number | null;
  latencyEstimateSec: number | null;
  strengthDomains: string[];
  weaknessDomains: string[];
  schemaStatus: 'DOCUMENTED' | 'SCHEMA_REVIEW_REQUIRED' | 'UNKNOWN';
  enabled: boolean;
};

export type RealismShotBrief = {
  briefId: string;
  shotType: CinematicRealismShotType;
  sceneDescription: string;
  realismTarget: string;
  wardrobe: string;
  props: string[];
  environment: string;
  cameraBehavior: string;
  performanceBehavior: string;
  voiceMode: 'NONE' | 'VOICEOVER' | 'ON_CAMERA_DIALOGUE';
  continuityAnchors: string[];
  socialFormat: 'REEL_9_16' | 'FEED_4_5' | 'LANDSCAPE_16_9';
  negativeConstraints: string[];
};

export type RealismReferenceItem = {
  referenceId: string;
  type: RealismReferenceType;
  label: string;
  source: string;
  url: string | null;
  approvalState: 'DRAFT' | 'FOUNDER_APPROVED' | 'REJECTED';
  role: string;
  authorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CONTINUITY_CRITICAL';
  founderApproved: boolean;
  continuityCritical: boolean;
};

export type RealismReferencePack = {
  packId: string;
  label: string;
  items: RealismReferenceItem[];
  fingerprint: string;
  createdAt: string;
};

export type PromptSectionSnapshot = {
  identity: string;
  environment: string;
  wardrobe: string;
  camera: string;
  lighting: string;
  motion: string;
  performance: string;
  realismEnforcement: string;
  negative: string;
  continuity: string;
  socialFormat: string;
  audio: string;
};

export type CompiledProviderPrompt = {
  providerId: CinematicRealismProviderId;
  laneId: CinematicRealismLaneId;
  payload: Record<string, unknown>;
  promptText: string;
  sections: PromptSectionSnapshot;
  compiledAt: string;
  fingerprint: string;
};

export type RealismBenchmarkAsset = {
  assetId: string;
  kind: 'STILL' | 'VIDEO' | 'AUDIO';
  url: string | null;
  thumbnailUrl: string | null;
  placeholder: boolean;
  lineageStage: HybridPipelineStage | 'DIRECT_VIDEO' | null;
  providerId: CinematicRealismProviderId | null;
  laneId: CinematicRealismLaneId;
};

export type RealismEvaluation = {
  evaluationId: string;
  assetId: string;
  scores: Record<string, number>;
  failures: RealismFailureCode[];
  systemNotes: string[];
  evaluatedAt: string;
  founderJudgment: RealismFounderJudgment | null;
};

export type RealismLaneRun = {
  runId: string;
  laneId: CinematicRealismLaneId;
  providerId: CinematicRealismProviderId;
  testType: RealismTestType;
  workflowKind: 'DIRECT_VIDEO' | 'STILL_FIRST' | 'MULTI_STEP_HYBRID' | 'PROVIDER_RELAY';
  readiness: ProviderReadinessState;
  status: 'PLANNED' | 'QUEUED' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  promptSnapshot: CompiledProviderPrompt | null;
  referencePackId: string | null;
  settings: Record<string, unknown>;
  assets: RealismBenchmarkAsset[];
  evaluation: RealismEvaluation | null;
  founderJudgments: Array<{ judgment: RealismFounderJudgment; assetId: string; at: string }>;
  costEstimateUsd: number | null;
  costActualUsd: number | null;
  error: string | null;
  hybridStages: HybridPipelineStage[];
  createdAt: string;
  updatedAt: string;
};

export type RealismExperiment = {
  experimentId: string;
  projectId: string;
  name: string;
  shotBrief: RealismShotBrief;
  referencePack: RealismReferencePack | null;
  testType: RealismTestType;
  selectedLanes: CinematicRealismLaneId[];
  laneRuns: RealismLaneRun[];
  status: 'DRAFT' | 'READY' | 'RUNNING' | 'REVIEW' | 'DECIDED' | 'ARCHIVED';
  decisionSummary: RealismDecisionSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type RealismDecisionSummary = {
  summaryId: string;
  topProviderByRealism: CinematicRealismProviderId | null;
  topProviderByMotion: CinematicRealismProviderId | null;
  topProviderByIdentity: CinematicRealismProviderId | null;
  topProviderByLuxuryTone: CinematicRealismProviderId | null;
  bestHybridStack: CinematicRealismLaneId | null;
  productionReadyRecommendation: string;
  useCaseNotes: Record<string, string>;
  decidedAt: string;
};

export type RealismLabState = {
  projectId: string;
  experiments: RealismExperiment[];
  accounting: {
    totalEstimatedUsd: number;
    totalActualUsd: number;
    providerRequests: number;
    falRequests: number;
  };
  updatedAt: string;
};

export type RealismLaneDefinition = {
  laneId: CinematicRealismLaneId;
  label: string;
  primaryProviderId: CinematicRealismProviderId;
  workflowKind: RealismLaneRun['workflowKind'];
  description: string;
};
