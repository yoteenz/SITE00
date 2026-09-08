/**
 * C1.6 — Multi-unit package creative judgment types.
 */

import type {
  CreativeQualityTier,
  FounderHandholdingRisk,
  SeniorCreativeJudgmentOutput,
} from '../senior-creative-judgment/types.js';
export const CREATIVE_RUNTIME_MODES = ['FULL_REASONING', 'HYBRID', 'DETERMINISTIC_FALLBACK'] as const;
export type CreativeRuntimeModeShared = (typeof CREATIVE_RUNTIME_MODES)[number];

export const PACKAGE_CREATIVE_QUALITY_TIERS = ['VALID', 'STRONG', 'EXCEPTIONAL'] as const;
export type PackageCreativeQualityTier = (typeof PACKAGE_CREATIVE_QUALITY_TIERS)[number];

export const PACKAGE_FOUNDER_HANDHOLDING_RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH'] as const;
export type PackageFounderHandholdingRisk = (typeof PACKAGE_FOUNDER_HANDHOLDING_RISK_LEVELS)[number];

export const PACKAGE_CHALLENGE_OUTCOMES = [
  'KEEP_PACKAGE',
  'DEEPEN_PACKAGE',
  'HYBRIDIZE_PACKAGE',
  'SUPERSEDE_PACKAGE',
] as const;
export type PackageChallengeOutcome = (typeof PACKAGE_CHALLENGE_OUTCOMES)[number];

export const PACKAGE_CLONING_FAILURE_CLASSES = [
  'SAME_HEADLINE_EVERYWHERE',
  'SAME_COMPOSITION_EVERYWHERE',
  'SAME_ARTIFACT_EVERYWHERE',
  'SAME_WORLD_MECHANISM_EVERYWHERE',
  'SAME_COPY_STRUCTURE_EVERYWHERE',
  'SAME_REVEAL_EVERYWHERE',
  'PACKAGE_CLONED_ACROSS_FORMATS',
] as const;
export type PackageCloningFailureClass = (typeof PACKAGE_CLONING_FAILURE_CLASSES)[number];

export const CORRECTION_SCOPES = [
  'GLOBAL_METHOD',
  'BRAND_METHOD',
  'CAMPAIGN_METHOD',
  'MEDIUM_METHOD',
  'PROJECT_TASTE',
  'CAMPAIGN_TASTE',
] as const;
export type CorrectionScope = (typeof CORRECTION_SCOPES)[number];

export const CONTENT_UNIT_MEDIUMS = [
  'HERO_REEL',
  'SUPPORTING_REEL',
  'CAROUSEL',
  'STORY_SEQUENCE',
  'TIKTOK',
  'X_POST',
  'EMAIL',
  'LANDING_EXPRESSION',
  'STATIC_HERO',
  'LAUNCH_FILM',
  'EDITORIAL_UNIT',
  'OTHER_MAJOR_CREATIVE_UNIT',
  'LIGHTWEIGHT_CRAFT_REVIEW',
] as const;
export type ContentUnitMedium = (typeof CONTENT_UNIT_MEDIUMS)[number];

export type CampaignCreativeDNA = {
  coreTension: string;
  behavioralTruth: string;
  emotionalTemperature: string;
  worldLogic: string;
  rhetoricalBehavior: string;
  visualGrammar: string;
  motifRules: string[];
  forbiddenRepetition: string[];
  callbackRules: string[];
  handoffRules: string[];
  brandSpecificityMarkers: string[];
};

export type CampaignResponsibilityBrief = {
  campaignThesis: string;
  audienceStartingBelief: string;
  audienceDesiredShift: string;
  brandTruthToProve: string;
  emotionalDestination: string;
  conversionDestination: string;
  creativeRisk: string;
  campaignQuestion: string;
  campaignPayoff: string;
};

export type ContentUnitRole = {
  unitId: string;
  medium: ContentUnitMedium;
  campaignRole: string;
  audienceStateBefore: string;
  audienceStateAfter: string;
  whatItIntroduces: string;
  whatItProves: string;
  whatItEscalates: string;
  whatItHandsOff: string;
  whyThisMedium: string;
  whatItMustNotRepeat: string;
};

export type UnitHandoff = {
  fromUnitId: string;
  toUnitId: string;
  handoffType: string;
  handoffObject: string;
  handoffQuestion: string;
  handoffCopy: string;
  handoffEmotion: string;
  whyItWorks: string;
};

export type PackageCohesionQA = {
  feelsLikeOneCampaign: boolean;
  unitsHaveDistinctJobs: boolean;
  heroNotLazyResize: boolean;
  carouselNative: boolean;
  storyNative: boolean;
  xIsPublicDiscourse: boolean;
  emailAddsPersuasion: boolean;
  unitsEscalate: boolean;
  handoffsPresent: boolean;
  motifNotOverRepeated: boolean;
  cloningFailures: PackageCloningFailureClass[];
  passed: boolean;
};

export type PackageSeniorCreativeJudgment = {
  packageJudgmentId: string;
  campaignIdea: string;
  heroConcept: string;
  initialCampaignWinner: string;
  packageFirstAnswerChallenge: string;
  redTeamDiagnosis: string;
  packageChallenger: string;
  packageChallengerIdea: string;
  finalCampaignDirection: string;
  packageOutcome: PackageChallengeOutcome;
  campaignCreativeDNA: CampaignCreativeDNA;
  packageCohesionQA: PackageCohesionQA;
  packageQualityTier: PackageCreativeQualityTier;
  packageFounderHandholdingRisk: PackageFounderHandholdingRisk;
  campaignEnding: string;
  campaignEscalation: string[];
  runtimeMode: CreativeRuntimeModeShared;
  reasoningDepthLimited: boolean;
  blocksFounderReview: boolean;
  status: 'AWAITING_FOUNDER_REVIEW' | 'CREATIVE_DIRECTION_APPROVED' | 'NEEDS_FOUNDER_DIRECTION';
};

export type UnitCreativeDirection = {
  unitId: string;
  medium: ContentUnitMedium;
  role: ContentUnitRole;
  initialDirection: string;
  finalDirection: string;
  mediumRationale: string;
  heroMoment: string;
  handoffOut: string;
  judgment: SeniorCreativeJudgmentOutput;
  runtimeMode: CreativeRuntimeModeShared;
  reviewType: 'SENIOR_CREATIVE_JUDGMENT' | 'LIGHTWEIGHT_CRAFT_REVIEW';
  qualityTier: CreativeQualityTier;
  founderHandholdingRisk: FounderHandholdingRisk;
};

export type CreativeReasoningDispatchReceipt = {
  runId: string;
  provider: string;
  model: string;
  purpose: string;
  dispatchCount: number;
  tokenUsage?: number;
  estimatedCost?: number;
  startedAt: string;
  completedAt: string;
};

export type ProviderHealthStatus = {
  providerAvailable: boolean;
  providerName: string;
  model: string;
  runtimeMode: CreativeRuntimeModeShared | 'FULL_REASONING_LIVE_TEST_BLOCKED';
  structuredOutputSupported: boolean;
  lastHealthCheck: string;
  reasoningDispatchAllowed: boolean;
  blockReason?: string;
};
