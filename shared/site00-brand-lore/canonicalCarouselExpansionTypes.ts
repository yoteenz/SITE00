/**
 * Canonical same-topic carousel world expansion — Experiment C types.
 */

import type { CanonicalNdxbookDirectionName } from './canonicalCreativeRangeConstants.js';
import type { DirectionDnaEnvelope } from './canonicalCreativeRangeTypes.js';
import type { ReplayHeroAsset } from './personalityReplayTypes.js';
import type {
  CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT,
  CarouselCompositionMode,
} from './canonicalCarouselExpansionConstants.js';

export type CarouselExpansionStatus =
  | 'NOT_STARTED'
  | 'LOADING_COVERS'
  | 'BUILDING_WORLD_BIBLES'
  | 'GENERATING_SLIDE'
  | 'ANALYZING'
  | 'COMPLETE'
  | 'FAILED'
  | 'BLOCKED_MISSING_COVERS';

export type CarouselExecuteMode =
  | 'NEXT_SLIDE'
  | 'REST_OF_CAROUSEL'
  | 'NEXT_CAROUSEL'
  | 'ALL_REMAINING'
  | 'INITIALIZE';

export type SharedCarouselTopicContext = {
  topicId: string;
  topicName: string;
  topicSummary: string;
  coreClaim: string;
  challengedClaim: string;
  knownEvidence: string[];
  openQuestions: string[];
  possibleMisconceptions: string[];
  usefulContext: string[];
  audienceTakeaway: string;
  sourceBehavior: string;
  editorialRisk: string;
  factAccuracyRequirements: string[];
};

export type DirectionCarouselWorldBible = {
  directionId: string;
  directionName: CanonicalNdxbookDirectionName;
  carouselThesis: string;
  whatTheReaderLearns: string;
  emotionalArc: string;
  editorialArc: string;
  whyThisDirectionNeedsMultipleSlides: string;
  coverBehavior: string;
  continuationBehavior: string;
  evidenceBehavior: string;
  transitionBehavior: string;
  revealBehavior: string;
  payoffBehavior: string;
  endingBehavior: string;
  contentOrder: string[];
  argumentProgression: string;
  evidenceProgression: string;
  pacing: string;
  densityBySlide: Record<string, string>;
  whereContextLives: string;
  whereContradictionLives: string;
  wherePayoffLives: string;
  compositionSystem: string;
  recurringGridBehavior: string;
  deliberateGridBreaks: string;
  typographyBehavior: string;
  paletteBehavior: string;
  graphicGrammar: string;
  imageBehavior: string;
  artifactBehavior: string;
  annotationBehavior: string;
  recurringDevices: string[];
  escalationRules: string[];
  restraintRules: string[];
  confidenceBehavior: string;
  witBehavior: string;
  disagreementBehavior: string;
  humanityBehavior: string;
  observationBehavior: string;
  selfCorrectionBehavior: string;
  memorabilityBehavior: string;
  whatMustRepeatAcrossSlides: string[];
  whatMustChangeAcrossSlides: string[];
  visualAnchors: string[];
  typographyAnchors: string[];
  colorAnchors: string[];
  artifactAnchors: string[];
  narrativeAnchors: string[];
  whatWouldMakeThisFeelLikeGenericCarouselDesign: string[];
  whatWouldMakeThisFeelLikeAnotherDirection: string[];
  whatWouldMakeThisFeelLikeSimpleResizing: string[];
  whatWouldMakeThisFeelLikeRepeatedCoverVariations: string[];
  dominant: string;
  secondary: string;
  accent: string;
  functionalColors: string[];
  backgrounds: string[];
  contrastRules: string;
  frequencyRules: string;
};

export type PreservedCarouselCover = {
  directionId: string;
  directionName: CanonicalNdxbookDirectionName;
  comparisonIndex: number;
  existingHeroAssetId: string;
  existingHeroStoragePath: string;
  existingHeroPromptLineage: string | null;
  existingHeroFormat: string;
  existingHeroGenerationReceipt: Record<string, unknown> | null;
  carouselSlideNumber: 1;
  role: 'CANONICAL_CAROUSEL_COVER';
  preserved: true;
};

export type CarouselSlideCopy = {
  headline: string;
  supportingCopy: string;
  microcopy: string;
  annotationCopy: string;
  metadataCopy: string;
  sourceCopy: string;
  visualPunchline: string;
  copyPurpose: string;
};

export type CarouselSlideTypography = {
  fontRole: string;
  typeScaleRole: string;
  hierarchyRole: string;
  typographyDevice: string;
  whyThisTypographyHere: string;
};

export type CarouselSlideRecord = {
  slideNumber: number;
  slideRole: string;
  slidePurpose: string;
  readerQuestion: string;
  readerTakeaway: string;
  whyThisSlideExists: string;
  relationshipToPreviousSlide: string;
  relationshipToNextSlide: string;
  compositionMode: CarouselCompositionMode;
  copy: CarouselSlideCopy;
  typography: CarouselSlideTypography;
  colorLogic: string;
  worldSignals: string[];
  visualBrief: Record<string, unknown> | null;
  asset: ReplayHeroAsset | null;
  generationReceipt: CarouselSlideGenerationReceipt | null;
  preserved: boolean;
  idempotencyKey: string;
  founderJudgment: CarouselSlideFounderJudgment;
};

export type CarouselSlideGenerationReceipt = {
  firstGenerationResult: 'SUCCESS' | 'TRANSPORT_FAILURE' | 'BLOCKED' | 'PRESERVED' | 'SKIPPED';
  creativeAttemptCount: number;
  firstGenerationPromptHash: string | null;
  firstGenerationModel: string;
  firstGenerationCostUsd: number;
  failureReason: string | null;
  generatedAt: string | null;
};

export type CarouselSlideFounderJudgment = 'LOVE_IT' | 'REVISE' | 'PROMISING_REFINE' | 'NOT_FOR_ME' | null;

export type CarouselDirectionFounderVerdict =
  | 'LOVE_THIS_DIRECTION'
  | 'KEEP_IN_CONTENTION'
  | 'BEAUTIFUL_BUT_TOO_NARROW'
  | 'TOO_REPETITIVE'
  | 'NOT_NDXBOOK'
  | null;

export type CarouselDirectionCarousel = {
  comparisonIndex: number;
  directionId: string;
  directionName: CanonicalNdxbookDirectionName;
  cover: PreservedCarouselCover | null;
  worldBible: DirectionCarouselWorldBible | null;
  slides: CarouselSlideRecord[];
  dnaEnvelope: DirectionDnaEnvelope | null;
  compositionModesUsed: CarouselCompositionMode[];
  paletteRecognitionTest: 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT_EVALUATED';
  founderVerdict: CarouselDirectionFounderVerdict;
  founderNote: string | null;
  rangeAnalysis: CarouselDirectionRangeAnalysis | null;
};

export type CarouselDirectionRangeAnalysis = {
  worldCoherence: string;
  carouselContinuity: string;
  compositionRange: string;
  typographyRecognition: string;
  paletteRecognition: string;
  voiceContinuity: string;
  informationDesignRange: string;
  socialNativeness: string;
  saveability: string;
  wit: string;
  secondReadDepth: string;
  riskOfRepetition: string;
  observations: string[];
};

export type CarouselCrossDirectionPairClassification =
  | 'CLONED'
  | 'TOO_CLOSE'
  | 'RELATED'
  | 'DISTINCT_SIBLINGS'
  | 'POSSIBLY_DIFFERENT_BRAND';

export type CarouselCrossDirectionPairReport = {
  directionA: CanonicalNdxbookDirectionName;
  directionB: CanonicalNdxbookDirectionName;
  classification: CarouselCrossDirectionPairClassification;
  editorialPremise: string;
  observations: string[];
};

export type CarouselEmergentDnaReport = {
  typographyDna: string;
  colorDna: string;
  editorialDna: string;
  visualInterventionDna: string;
  socialBehaviorDna: string;
  voiceDna: string;
  informationDesignDna: string;
  memorabilityDna: string;
  limeStatus: 'NATURAL_CANON_CANDIDATE' | 'DIRECTION_SPECIFIC' | 'COMPATIBLE_NOT_EMERGENT' | 'UNSUPPORTED' | 'NOT_EVALUATED';
  fontSystemStatus:
    | 'RECURRING_CANON_CANDIDATE'
    | 'MULTI_FONT_SYSTEM_CANDIDATE'
    | 'DIRECTION_SPECIFIC'
    | 'INCONSISTENT'
    | 'NOT_EVALUATED';
  traitClassifications: Array<{ trait: string; classification: string }>;
  observations: string[];
};

export type CarouselExecutionAccounting = {
  anthropicRequests: number;
  anthropicInputTokens: number;
  anthropicOutputTokens: number;
  anthropicEstimatedCostUsd: number;
  gptImage2Requests: number;
  gptImage2CostUsd: number;
  falRequests: number;
  falCostUsd: number;
  durationMs: number;
  transportRetries: number;
  generationAttempts: number;
};

export type CarouselExpansionPreflight = {
  carouselExpansionReady: boolean;
  experimentClassification: typeof CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT;
  coversResolved: number;
  coversRequired: 6;
  sharedTopicLocked: boolean;
  canonicalDirectionCount: 6;
  blockers: string[];
};

export type CanonicalCarouselExpansionRun = {
  experimentClassification: typeof CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT;
  runId: string;
  organizationId: string;
  projectId: string;
  carouselExperimentVersion: string;
  status: CarouselExpansionStatus;
  currentDirectionIndex: number | null;
  currentSlideNumber: number | null;
  sharedTopic: SharedCarouselTopicContext | null;
  directions: CarouselDirectionCarousel[];
  crossDirectionPairs: CarouselCrossDirectionPairReport[];
  emergentDna: CarouselEmergentDnaReport | null;
  contaminationTest: { passed: boolean; notes: string[] } | null;
  accounting: CarouselExecutionAccounting;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
};
