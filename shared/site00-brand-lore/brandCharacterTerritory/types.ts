/**
 * Brand Character Territory — WHO the brand is as expressive cultural entity.
 */

import type {
  BRAND_CHARACTER_FORMATION_CLASSIFICATION,
  BRAND_CHARACTER_TERRITORY_V1,
  BrandCharacterJudgment,
  CharacterAbstractionFailure,
  CharacterArtifactEvalResult,
  CharacterDistinctivenessResult,
  CharacterDiscoveryMode,
  CharacterFidelityDimension,
  PresentationConceptCompatibilityResult,
  ReferenceCalibrationDimension,
} from './constants.js';

export type BrandCharacterCore = {
  characterThesis: string;
  characterEssence: string;
  characterContradiction: string;
  internalTension: string;
  worldview: string;
  orientationTowardWorld: string;
  whatItNotices: string;
  whatItValues: string;
  whatItRejects: string;
  whatItFindsInteresting: string;
  whatItFindsBoring: string;
  whatItTakesSeriously: string;
  whatItRefusesToTakeSeriously: string;
};

export type BrandCharacterIntellectual = {
  intelligenceStyle: string;
  curiosityBehavior: string;
  knowledgePosture: string;
  reasoningBehavior: string;
  relationshipToCertainty: string;
  relationshipToComplexity: string;
  relationshipToExpertise: string;
  relationshipToDiscovery: string;
  relationshipToMemory: string;
};

export type BrandCharacterSocial = {
  socialPresence: string;
  audienceRelationship: string;
  intimacyDistance: string;
  statusBehavior: string;
  authorityBehavior: string;
  participationBehavior: string;
  conversationalBehavior: string;
  communityRelationship: string;
  relationshipToAttention: string;
};

export type BrandCharacterEmotional = {
  emotionalRange: string;
  emotionalBaseline: string;
  emotionalVolatility: string;
  restraintBehavior: string;
  enthusiasmBehavior: string;
  irritationBehavior: string;
  delightBehavior: string;
  seriousnessBehavior: string;
  vulnerabilityBoundary: string;
};

export type BrandCharacterHumorWit = {
  humorLogic: string;
  witMechanism: string;
  comedicTemperature: string;
  ironyRelationship: string;
  absurdityRelationship: string;
  shadeBehavior: string;
  teasingBehavior: string;
  understatementBehavior: string;
  exaggerationBehavior: string;
  whatTheBrandWouldNeverJokeAbout: string;
};

export type BrandCharacterCulturalIntelligence = {
  culturalPosition: string;
  culturalFluency: string;
  culturalReferenceBehavior: string;
  referenceDensity: string;
  referenceSelectionLogic: string;
  subculturalRelationship: string;
  temporalCultureRelationship: string;
  internetCultureRelationship: string;
  historicalCultureRelationship: string;
  culturalMemoryBehavior: string;
  appropriationGuardrails: string;
  culturalAuthenticityRules: string;
};

export type BrandCharacterLanguage = {
  verbalCadence: string;
  sentenceBehavior: string;
  vocabularyBehavior: string;
  shorthandBehavior: string;
  explanationThreshold: string;
  namingBehavior: string;
  interruptionBehavior: string;
  annotationBehavior: string;
  emphasisBehavior: string;
  silenceBehavior: string;
  captionBehavior: string;
  linguisticTexture: string;
};

export type BrandCharacterTaste = {
  tasteLogic: string;
  beautyRelationship: string;
  uglinessRelationship: string;
  polishRelationship: string;
  messRelationship: string;
  preciousnessRelationship: string;
  irreverenceRelationship: string;
  restraintVsExcess: string;
  orderVsChaos: string;
  permanenceVsEphemerality: string;
  highLowCultureRelationship: string;
};

export type BrandCharacterExpressiveBehavior = {
  expressiveGestures: string;
  recurringBehaviors: string;
  artifactBehavior: string;
  imageBehavior: string;
  typographyBehavior: string;
  colorBehavior: string;
  compositionBehavior: string;
  materialBehavior: string;
  motionBehavior: string;
  soundBehavior: string | null;
};

export type CharacterArtifactRelationship = {
  makerPresence: string;
  reactionEvidence: string;
  judgmentEvidence: string;
  selectionEvidence: string;
  interventionEvidence: string;
  accumulationEvidence: string;
  traceOfHandling: string;
  explainabilityPrinciple: string;
};

export type BrandCharacterTerritory = {
  id: string;
  name: string;
  characterClassification: 'BRAND_CHARACTER_TERRITORY';
  core: BrandCharacterCore;
  intellectual: BrandCharacterIntellectual;
  social: BrandCharacterSocial;
  emotional: BrandCharacterEmotional;
  humorWit: BrandCharacterHumorWit;
  culturalIntelligence: BrandCharacterCulturalIntelligence;
  language: BrandCharacterLanguage;
  taste: BrandCharacterTaste;
  expressiveBehavior: BrandCharacterExpressiveBehavior;
  artifactRelationship: CharacterArtifactRelationship;
  whyItIsNdxbook: string;
  whatItMustNeverBecome: string[];
  antiCharacterRules: string[];
  notThis: string[];
  abstractionEval: CharacterAbstractionEvaluation | null;
  distinctivenessEval: CharacterTerritoryDistinctivenessSlot | null;
  founderJudgment: BrandCharacterJudgment;
  judgmentNote: string | null;
  methodologyVersion: typeof BRAND_CHARACTER_TERRITORY_V1 | string;
  experimentId: string;
  formationVersion: number;
  snapshotVersion: number;
  snapshotFingerprint: string | null;
  formationPromptVersion: string;
  formationPromptFingerprint: string | null;
  formationReceipt: Record<string, unknown> | null;
  provenance: string;
  createdAt: string;
};

export type CharacterAbstractionEvaluation = {
  result: 'PASS_CHARACTER' | CharacterAbstractionFailure;
  answersWhoQuestion: boolean;
  notes: string[];
};

export type CharacterTerritoryDistinctivenessSlot = {
  result: CharacterDistinctivenessResult;
  notes: string[];
};

export type BrandCharacterSetDistinctivenessEvaluation = {
  result: CharacterDistinctivenessResult;
  deterministicPreflight: {
    passed: boolean;
    adjectiveOverlapFlags: string[];
    styleOverlapFlags: string[];
    humorIntensityOnlyFlags: string[];
    notes: string[];
  };
  semanticAuditRequired: boolean;
  dimensions: Array<{
    dimension: string;
    structurallyDistinct: boolean;
    note: string;
  }>;
  notes: string[];
};

export type CharacterArtifactEvaluation = {
  result: CharacterArtifactEvalResult;
  whoAppearsToHaveMadeThis: string | null;
  revealsAboutEntity: string | null;
  whyThisExpressiveChoice: string | null;
  reactionJudgmentEvidence: boolean;
  genericBrandRisk: boolean;
  personalityAboutNotIn: boolean;
  notes: string[];
};

export type BrandCharacterIntelligenceProvenanceEntry = {
  source: string;
  classification: 'BRAND_INTELLIGENCE' | 'PERSONALITY_EVIDENCE' | 'CALIBRATION_EVIDENCE' | 'EXCLUDED';
  summary: string;
};

export type BrandCharacterIntelligenceSnapshot = {
  snapshotVersion: number;
  fingerprint: string;
  compiledAt: string;
  frozen: boolean;
  provenanceEntries: BrandCharacterIntelligenceProvenanceEntry[];
  brandLevelTruth: string[];
  personalityEvidence: string[];
  founderCreativeLatitude: string | null;
  culturalCalibrationEvidence: Array<{
    source: string;
    purpose: string;
    policy: 'CALIBRATION_ONLY';
    dimensions: ReferenceCalibrationDimension[];
  }>;
  excludedHistoricalEvidence: string[];
  topicBlind: true;
  characterDiscoveryMode: CharacterDiscoveryMode;
  upstreamCharacterLayerMissingNote: string;
};

export type BrandCharacterFormationReceipt = {
  receiptId: string;
  provider: 'anthropic';
  model: string;
  promptFingerprint: string;
  snapshotFingerprint: string;
  formationVersion: number;
  formationPromptVersion: string;
  idempotencyKey: string;
  inputTokens: number | null;
  outputTokens: number | null;
  providerRequestId: string | null;
  durationMs: number;
  createdAt: string;
};

export type BrandCharacterFormationRun = {
  experimentClassification: typeof BRAND_CHARACTER_FORMATION_CLASSIFICATION;
  runId: string;
  organizationId: string;
  projectId: string;
  methodologyVersion: typeof BRAND_CHARACTER_TERRITORY_V1 | string;
  currentStage: 'BRAND_CHARACTER_FORMATION';
  status:
    | 'NOT_STARTED'
    | 'SNAPSHOT_READY'
    | 'FORMING'
    | 'CHARACTERS_FORMED'
    | 'EVALUATIONS_COMPLETE'
    | 'NEEDS_REFORMATION'
    | 'FOUNDER_REVIEWED'
    | 'FAILED';
  formationVersion: number;
  formationPromptVersion: string;
  idempotencyKey: string | null;
  intelligenceSnapshot: BrandCharacterIntelligenceSnapshot | null;
  characters: BrandCharacterTerritory[];
  setDistinctiveness: BrandCharacterSetDistinctivenessEvaluation | null;
  formationReceipt: BrandCharacterFormationReceipt | null;
  selectedCharacterId: string | null;
  brandCharacterSystemId: string | null;
  characterDiscoveryMode: CharacterDiscoveryMode;
  presentationDevelopmentAllowed: boolean;
  identityDevelopmentAllowed: boolean;
  visualGenerationAllowed: false;
  brandCanonMutationAllowed: false;
  accounting: {
    anthropicRequests: number;
    anthropicInputTokens: number;
    anthropicOutputTokens: number;
    anthropicEstimatedCostUsd: number;
    falRequests: 0;
    visualGenerationCostUsd: 0;
  };
  error: string | null;
  formationStartedAt: string | null;
  formationAttemptId: string | null;
  startedAt: string;
  completedAt: string | null;
};

export type BrandCharacterSystem = {
  id: string;
  sourceTerritoryId: string;
  sourceFingerprint: string;
  methodologyVersion: typeof BRAND_CHARACTER_TERRITORY_V1 | string;
  founderApproval: 'PENDING' | 'APPROVED' | 'NOT_EVALUATED';
  characterCore: BrandCharacterCore;
  intellectualBehavior: BrandCharacterIntellectual;
  socialBehavior: BrandCharacterSocial;
  emotionalBehavior: BrandCharacterEmotional;
  humorSystem: BrandCharacterHumorWit;
  culturalIntelligenceSystem: BrandCharacterCulturalIntelligence;
  languageBehavior: BrandCharacterLanguage;
  tasteSystem: BrandCharacterTaste;
  expressiveBehavior: BrandCharacterExpressiveBehavior;
  artifactRelationship: CharacterArtifactRelationship;
  antiCharacterRules: string[];
  allowedRange: string[];
  contextualModulationRules: string[];
  mediumTranslationRules: string[];
  brandCharacterFingerprint: string;
  compiledAt: string;
};

export type DownstreamCharacterDependency = {
  brandCharacterSystemId: string;
  brandCharacterFingerprint: string;
  dependencyState: 'CURRENT' | 'STALE' | 'REVIEW_REQUIRED' | 'RECOMPILE_REQUIRED' | 'SUPERSEDE_REQUIRED' | 'NOT_EVALUATED';
};

export type CharacterFidelityEvaluation = {
  dimension: CharacterFidelityDimension;
  result: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  notes: string[];
};

export type PresentationConceptCharacterCompatibility = {
  presentationConceptId: string;
  presentationConceptName: string;
  result: PresentationConceptCompatibilityResult;
  notes: string[];
};
