/**
 * P0.5C — Brand Marketing Expression types
 */

import type {
  ARTIFACT_EXPRESSION_CLASSES,
  BEHAVIORAL_MODE_KINDS,
  MARKETING_ARTIFACT_FOUNDER_JUDGMENTS,
  MARKETING_CHANNELS,
  MARKETING_CHARACTER_TEMPERATURES,
  MARKETING_FAILURE_STATES,
  MARKETING_SET_FOUNDER_JUDGMENTS,
  RESOLUTION_STATES,
  SURFACE_CLASSIFICATIONS,
} from './constants.js';

export type SurfaceClassification = (typeof SURFACE_CLASSIFICATIONS)[number];
export type ResolutionState = (typeof RESOLUTION_STATES)[number];
export type MarketingCharacterTemperature = (typeof MARKETING_CHARACTER_TEMPERATURES)[number];
export type MarketingChannel = (typeof MARKETING_CHANNELS)[number];
export type ArtifactExpressionClass = (typeof ARTIFACT_EXPRESSION_CLASSES)[number];
export type BehavioralModeKind = (typeof BEHAVIORAL_MODE_KINDS)[number];
export type MarketingArtifactFounderJudgment = (typeof MARKETING_ARTIFACT_FOUNDER_JUDGMENTS)[number] | null;
export type MarketingSetFounderJudgment = (typeof MARKETING_SET_FOUNDER_JUDGMENTS)[number] | null;
export type MarketingFailureState = (typeof MARKETING_FAILURE_STATES)[number];

export type BrandMarketingExpressionSystem = {
  id: string;
  projectId: string;
  brandId: string;
  brandCharacterSystemId: string;
  version: number;
  status: 'DRAFT' | 'COMPILED' | 'FOUNDER_REVIEWED' | 'APPROVED';
  publicBehaviorThesis: string;
  marketingRelationshipToAudience: string;
  attentionBehavior: string;
  reactionBehavior: string;
  investigationBehavior: string;
  judgmentBehavior: string;
  memoryBehavior: string;
  connectionBehavior: string;
  humorBehavior: string;
  correctionBehavior: string;
  culturalParticipationBehavior: string;
  evidenceBehavior: string;
  makerBehavior: string;
  contentInitiationRules: string[];
  contentDevelopmentRules: string[];
  contentResolutionRules: string[];
  behavioralModes: NDXBehavioralMode[];
  channelModulationRules: MarketingChannelModulation[];
  artifactBehaviorRules: string[];
  visualFreedomContract: string;
  northStarCalibrationIds: string[];
  negativeCalibrationIds: string[];
  mustPreserve: string[];
  mustNotRequire: string[];
  mustNeverBecome: string[];
  evaluation: Record<string, unknown> | null;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type FounderMarketingNorthStarArtifact = {
  id: string;
  projectId: string;
  classification: 'CHARACTER_EXPRESSION_CALIBRATION';
  founderJudgment: 'THIS_IS_NDX' | null;
  gridLayout: '3x3';
  panels: NorthStarPanel[];
  characterExpressionAuthority: 'HIGH';
  identityAuthority: 'NONE';
  surfaceAestheticsCanonized: false;
  persistedAt: string;
  fingerprint: string;
};

export type NorthStarPanel = {
  panelIndex: number;
  panelCode: string;
  title: string;
  topicDomain: string;
  behavioralModeId: string;
  headline: string;
  characterBehaviors: string[];
  makerTraces: string[];
  surfaceNotes: string[];
  whyFeelsLikeNdx: string;
};

export type MarketingNorthStarForensicEvaluation = {
  evaluationId: string;
  northStarId: string;
  characterPresence: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  makerPresence: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  reaction: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  judgment: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  curiosity: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  synthesis: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  memory: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  culturalInteriority: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  humor: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  selfCorrection: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  graphicIntelligence: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  artisticAuthorship: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  surprise: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  informationDensityRange: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  humanResidue: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  surfaceCauseRecords: SurfaceCauseRecord[];
  notes: string[];
  evaluatedAt: string;
};

export type SurfaceCauseRecord = {
  visibleCharacteristic: string;
  classification: SurfaceClassification;
  causalBehavior: string | null;
  behavioralTrace: string | null;
  possibleManifestation: string | null;
  surfaceStyle: string | null;
  mustNotEncodeAsRule: string;
};

export type NDXBehavioralMode = {
  id: string;
  kind: BehavioralModeKind;
  name: string;
  sequence: string[];
  possibleExpression: string;
  description: string;
  isTemplate: false;
};

export type MarketingCharacterEvent = {
  id: string;
  projectId: string;
  characterSystemId: string;
  trigger: string;
  subject: string;
  context: string;
  initialObservation: string;
  initialReaction: string;
  whyNDXCares: string;
  questionsRaised: string[];
  contradictionsDetected: string[];
  memoriesTriggered: string[];
  culturalAssociations: string[];
  evidenceNeeded: string[];
  connectionsSuspected: string[];
  humorPotential: string | null;
  seriousnessRequirement: string | null;
  investigationDepth: string;
  provisionalJudgment: string | null;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  unresolvedQuestions: string[];
  possibleBehavioralModes: string[];
  status: 'DRAFT' | 'FORMULATED' | 'USED';
  fingerprint: string;
};

export type MarketingContentThesis = {
  id: string;
  characterEventId: string;
  behavioralModeId: string;
  whatHappened: string;
  whatNDXNoticed: string;
  whyItMatters: string;
  whatNDXInitiallyThought: string;
  whatNDXInvestigated: string;
  whatNDXFound: string;
  whatNDXConnected: string;
  whatNDXRemembered: string;
  whatNDXChangedItsMindAbout: string | null;
  centralContradiction: string | null;
  centralQuestion: string | null;
  centralClaim: string | null;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  evidenceRequirements: string[];
  culturalContext: string[];
  humorOpportunity: string | null;
  humorDecision: 'USE' | 'SUPPRESS' | 'NONE';
  seriousnessRequirement: string | null;
  audienceRelationship: string;
  desiredAudienceReaction: string;
  artifactImplications: string[];
  resolutionState: ResolutionState;
  status: 'DRAFT' | 'FORMULATED' | 'APPROVED';
  evaluation: Record<string, unknown> | null;
};

export type VisualCausalityRecord = {
  visualElement: string;
  sourceBehavior: string;
  sourceTrace: string;
  reasonForExistence: string;
  informationAffected: string;
  characterMeaning: string;
  alternativeManifestations: string[];
  required: boolean;
  optional: boolean;
};

export type MarketingTypographyBehavior = {
  behavior: string;
  description: string;
  prescribesFont: false;
};

export type MarketingColorBehavior = {
  function: string;
  description: string;
  prescribesPalette: false;
};

export type MarketingChannelModulation = {
  channel: MarketingChannel;
  characterAdjustment: string;
  resolutionExpectation: string;
  visualAuthorshipLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  notes: string;
};

export type BrandMarketingArtifact = {
  id: string;
  expressionSystemId: string;
  characterEventId: string;
  contentThesisId: string;
  behavioralModeId: string;
  channel: MarketingChannel;
  format: 'FIRST_SLIDE' | 'CAROUSEL' | 'STORY' | 'REEL' | 'EMAIL' | 'LONG_FORM';
  topic: string;
  subject: string;
  characterTemperature: MarketingCharacterTemperature;
  resolutionState: ResolutionState;
  artifactExpressionClass: ArtifactExpressionClass;
  visualCausalityRecords: VisualCausalityRecord[];
  evidenceObjects: string[];
  makerTraces: string[];
  headline: string;
  supportingLanguage: string[];
  visibleEvidence: string[];
  hiddenEvidence: string[];
  humorDecision: 'USE' | 'SUPPRESS' | 'NONE';
  culturalContext: string[];
  judgmentState: string;
  generationContract: MarketingFalPromptContract | null;
  generatedAssetId: string | null;
  generatedAssetUrl: string | null;
  generationStatus: 'NOT_GENERATED' | 'GENERATING' | 'GENERATED' | 'FAILED';
  characterEvaluation: MarketingCharacterRecognitionEvaluation | null;
  northStarDistanceEvaluation: NorthStarCharacterDistanceEvaluation | null;
  visualEvaluation: MarketingArtifactEvaluation | null;
  founderJudgment: MarketingArtifactFounderJudgment;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketingFalPromptContract = {
  prompt: string;
  negativePrompt: string;
  promptHash: string;
  sectionOrder: string[];
};

export type MarketingCharacterRecognitionEvaluation = {
  evaluationId: string;
  artifactId: string;
  logoRemovalSurvival: boolean;
  limeRemovalSurvival: boolean;
  styleRemovalSurvival: boolean;
  behaviorVisible: boolean;
  judgmentVisible: boolean;
  makerTracesVisible: boolean;
  ndxRecognition: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  notes: string[];
  evaluatedAt: string;
};

export type NorthStarCharacterDistanceEvaluation = {
  evaluationId: string;
  artifactId: string;
  characterPresenceDistance: 'CLOSE' | 'MODERATE' | 'FAR';
  behavioralSimilarity: boolean;
  cosmeticSimilarity: boolean;
  notes: string[];
  evaluatedAt: string;
};

export type MarketingArtifactEvaluation = {
  evaluationId: string;
  artifactId: string;
  characterPresence: 'PASS' | 'FAIL';
  makerCausality: 'PASS' | 'FAIL';
  behavioralClarity: 'PASS' | 'FAIL';
  genericSocialRisk: boolean;
  templateCollapseRisk: boolean;
  limeDependency: boolean;
  failureStates: MarketingFailureState[];
  evaluatedAt: string;
};

export type MarketingExpressionExperiment01 = {
  experimentId: string;
  projectId: string;
  status:
    | 'NOT_STARTED'
    | 'FORMULATING'
    | 'FORMULATED'
    | 'GENERATING'
    | 'GENERATED'
    | 'FOUNDER_REVIEW'
    | 'FAILED';
  topics: string[];
  behavioralModesRepresented: string[];
  artifacts: BrandMarketingArtifact[];
  setEvaluation: MarketingExperiment01SetEvaluation | null;
  founderSetJudgment: MarketingSetFounderJudgment;
  formulationStartedAt: string | null;
  formulationAttemptId: string | null;
  error: string | null;
};

export type MarketingExperiment01SetEvaluation = {
  sameCharacterAcrossTopics: 'PASS' | 'FAIL';
  meaningfulVisualRange: 'PASS' | 'FAIL';
  feedCoherenceWithoutTemplate: 'PASS' | 'FAIL';
  behavioralRange: 'PASS' | 'FAIL';
  informationDensityRange: 'PASS' | 'FAIL';
  characterTemperatureRange: 'PASS' | 'FAIL';
  failureStates: MarketingFailureState[];
  evaluatedAt: string;
};

export type MarketingExpressionForensicAudit = {
  auditId: string;
  projectId: string;
  existingMarketingExpressionLayer: boolean;
  characterToMarketingGap: string[];
  templateStyleShortcuts: string[];
  experimentFRelationship: string;
  experimentGRelationship: string;
  historicalRecordsMutated: false;
  auditedAt: string;
};

export type BrandMarketingExpressionRun = {
  runId: string;
  projectId: string;
  organizationId: string;
  status:
    | 'NOT_STARTED'
    | 'AUDITED'
    | 'COMPILING'
    | 'COMPILED'
    | 'EXPERIMENT_01_FORMULATING'
    | 'EXPERIMENT_01_READY'
    | 'EXPERIMENT_01_GENERATING'
    | 'EXPERIMENT_01_COMPLETE'
    | 'EXPERIMENT_01_V2_FORMULATING'
    | 'EXPERIMENT_01_V2_READY'
    | 'EXPERIMENT_01_V2_GENERATING'
    | 'EXPERIMENT_01_V2_COMPLETE'
    | 'FAILED';
  brandCharacterSystemId: string | null;
  forensicAudit: MarketingExpressionForensicAudit | null;
  expressionSystem: BrandMarketingExpressionSystem | null;
  northStarArtifact: FounderMarketingNorthStarArtifact | null;
  northStarForensics: MarketingNorthStarForensicEvaluation | null;
  experiment01: MarketingExpressionExperiment01 | null;
  experiment01V1Version: 'EXPERIMENT_01_V1' | null;
  experiment01V2: import('../editorialInformationArchitecture/types.js').MarketingExpressionExperiment01V2 | null;
  experimentGCharacterReevaluationRequired: boolean;
  error: string | null;
  accounting: {
    anthropicRequests: number;
    anthropicInputTokens: number;
    anthropicOutputTokens: number;
    anthropicEstimatedCostUsd: number;
    falRequests: number;
    falEstimatedCostUsd: number;
    falActualCostUsd: number;
  };
  updatedAt: string;
};
