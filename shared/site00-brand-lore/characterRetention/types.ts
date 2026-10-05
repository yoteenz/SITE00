/**
 * P0.5C.3 — Character Retention types
 */

import type {
  CHARACTER_BEAT_POSITIONS,
  CHARACTER_BEAT_TYPES,
  CHARACTER_DENSITY_LEVELS,
  CHARACTER_FAILURE_STATES,
  CLARITY_VS_STERILITY,
  COMPRESSION_CHARACTER_SAFETY,
  CONTROLLED_MISBEHAVIOR_MODES,
  HEADLINE_CHARACTER_RESULTS,
  HUMAN_TRACE_STRENGTH,
  HUMOR_ELIGIBILITY,
  HUMOR_MECHANISMS,
  IMAGE_CARRIES_CHARACTER,
  LOGO_REMOVAL_CHARACTER,
  MISBEHAVIOR_BUDGET_EVAL,
  PETTINESS_LEVELS,
  PUNCHLINE_DISPOSITION,
  STERILITY_LEVELS,
  V22_FOUNDER_JUDGMENTS,
} from './constants.js';
import type { AmendedFirstSlideContract, Experiment01V21Artifact } from '../culturalVisualParticipation/types.js';

export type CharacterBeatType = (typeof CHARACTER_BEAT_TYPES)[number];
export type CharacterDensityLevel = (typeof CHARACTER_DENSITY_LEVELS)[number];
export type CompressionCharacterSafety = (typeof COMPRESSION_CHARACTER_SAFETY)[number];
export type HumorEligibility = (typeof HUMOR_ELIGIBILITY)[number];
export type HumorMechanism = (typeof HUMOR_MECHANISMS)[number];
export type PunchlineDisposition = (typeof PUNCHLINE_DISPOSITION)[number];
export type ControlledMisbehaviorMode = (typeof CONTROLLED_MISBEHAVIOR_MODES)[number];
export type MisbehaviorBudgetEval = (typeof MISBEHAVIOR_BUDGET_EVAL)[number];
export type HumanTraceStrength = (typeof HUMAN_TRACE_STRENGTH)[number];
export type HeadlineCharacterResult = (typeof HEADLINE_CHARACTER_RESULTS)[number];
export type SterilityLevel = (typeof STERILITY_LEVELS)[number];
export type ClarityVsSterility = (typeof CLARITY_VS_STERILITY)[number];
export type LogoRemovalCharacter = (typeof LOGO_REMOVAL_CHARACTER)[number];
export type PettinessLevel = (typeof PETTINESS_LEVELS)[number];
export type CharacterBeatPosition = (typeof CHARACTER_BEAT_POSITIONS)[number];
export type ImageCarriesCharacter = (typeof IMAGE_CARRIES_CHARACTER)[number];
export type V22FounderJudgment = (typeof V22_FOUNDER_JUDGMENTS)[number] | null;
export type CharacterFailureState = (typeof CHARACTER_FAILURE_STATES)[number];

export type CharacterBeat = {
  beatType: CharacterBeatType;
  text: string | null;
  position: CharacterBeatPosition;
  visualPunchline: boolean;
  reasoning: string;
};

export type MarketingHumorExpression = {
  source: string;
  target: string;
  mechanism: HumorMechanism;
  delivery: string;
  timing: string;
  visualOrVerbal: 'VISUAL' | 'VERBAL' | 'BOTH';
  culturalDependency: boolean;
  ethicalBoundary: string;
  whyFunny: string;
  whyNDX: string;
  failureRisk: string;
};

export type ControlledMisbehavior = {
  mode: ControlledMisbehaviorMode;
  causality: string;
  placement: CharacterBeatPosition;
  budgetSlot: number;
};

export type CharacterRetentionContract = {
  id: string;
  projectId: string;
  contentPieceId: string;
  artifactId: string;
  characterSystemId: string;
  marketingExpressionSystemId: string;
  characterFacultiesRequired: string[];
  characterFacultiesOptional: string[];
  primaryCharacterBeat: CharacterBeat;
  secondaryCharacterBeat: CharacterBeat | null;
  humorRequired: boolean;
  humorMechanism: HumorMechanism | null;
  humorEligibility: HumorEligibility;
  humorExpression: MarketingHumorExpression | null;
  judgmentRequired: boolean;
  culturalShorthandAllowed: boolean;
  humanTraceRequired: boolean;
  humanTraceStrength: HumanTraceStrength;
  controlledMisbehaviorAllowed: boolean;
  controlledMisbehavior: ControlledMisbehavior[];
  informationRemoved: string[];
  characterSignalsPreserved: string[];
  characterSignalsLost: string[];
  microcopyBudget: number;
  pettinessLevel: PettinessLevel;
  punchlineDisposition: PunchlineDisposition;
  retentionEvaluation: CharacterRetentionEvaluation;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type CharacterDensityEvaluation = {
  evaluationId: string;
  artifactId: string;
  textDensity: string;
  characterDensity: CharacterDensityLevel;
  independent: true;
  evaluatedAt: string;
};

export type CompressionCharacterSafetyEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: CompressionCharacterSafety;
  funniestPartRemoved: boolean;
  humanPartRemoved: boolean;
  culturalShorthandRemoved: boolean;
  reactionRemoved: boolean;
  judgmentRemoved: boolean;
  becameGeneric: boolean;
  failureStates: CharacterFailureState[];
  evaluatedAt: string;
};

export type PunchlinePreservationEvaluation = {
  evaluationId: string;
  artifactId: string;
  sourcePunchline: string | null;
  disposition: PunchlineDisposition;
  justification: string | null;
  silentlyRemoved: boolean;
  evaluatedAt: string;
};

export type HeadlineCharacterEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: HeadlineCharacterResult;
  genericEditorialRisk: boolean;
  corporateRisk: boolean;
  evaluatedAt: string;
};

export type ArtifactSterilityEvaluation = {
  evaluationId: string;
  artifactId: string;
  level: SterilityLevel;
  failureStates: CharacterFailureState[];
  evaluatedAt: string;
};

export type ClarityVsSterilityEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: ClarityVsSterility;
  evaluatedAt: string;
};

export type CharacterRecognitionWithoutBrandMarkersEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: LogoRemovalCharacter;
  dependsOnLime: boolean;
  dependsOnLogo: boolean;
  dependsOnBrandName: boolean;
  evaluatedAt: string;
};

export type CharacterRetentionEvaluation = {
  evaluationId: string;
  artifactId: string;
  characterDensity: CharacterDensityEvaluation;
  compressionSafety: CompressionCharacterSafetyEvaluation;
  punchlinePreservation: PunchlinePreservationEvaluation;
  headlineCharacter: HeadlineCharacterEvaluation;
  sterility: ArtifactSterilityEvaluation;
  clarityVsSterility: ClarityVsSterilityEvaluation;
  logoRemovalCharacter: CharacterRecognitionWithoutBrandMarkersEvaluation;
  misbehaviorBudget: MisbehaviorBudgetEval;
  imageCarriesCharacter: ImageCarriesCharacter;
  passesApprovalGate: boolean;
  failureStates: CharacterFailureState[];
  evaluatedAt: string;
};

export type CharacterRetentionExtension = {
  characterRetention: CharacterRetentionContract;
  characterEvaluation: CharacterRetentionEvaluation;
};

export type CharacterRetainedFirstSlideContract = AmendedFirstSlideContract & CharacterRetentionExtension;

export type Experiment01V22Artifact = {
  id: string;
  v1ArtifactId: string;
  v21ArtifactId: string;
  topic: string;
  subject: string;
  contract: CharacterRetainedFirstSlideContract;
  carouselArchitecture: Experiment01V21Artifact['carouselArchitecture'];
  editorialDecision: Experiment01V21Artifact['editorialDecision'];
  generationContract: Experiment01V21Artifact['generationContract'];
  generatedAssetId: string | null;
  generatedAssetUrl: string | null;
  generationStatus: 'NOT_GENERATED' | 'GENERATING' | 'GENERATED' | 'FAILED';
  characterEvaluation: CharacterRetentionEvaluation;
  founderJudgment: V22FounderJudgment;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type FeedCharacterRhythm = {
  boardId: string;
  humorIntensity: number[];
  traceIntensity: number[];
  pettiness: number[];
  seriousness: number[];
  culturalShorthand: number[];
  visualMisbehavior: number[];
  variationAdequate: boolean;
};

export type FeedHumorRhythm = {
  boardId: string;
  distribution: Record<string, number>;
  everyPostIsJoke: boolean;
  noHumorWhereRequired: boolean;
};

export type CharacterRetentionCalibration = {
  calibrationId: string;
  northStarId: string;
  jokePlacement: 'PASS' | 'FAIL';
  visualInterruption: 'PASS' | 'FAIL';
  controlledImperfection: 'PASS' | 'FAIL';
  makerTrace: 'PASS' | 'FAIL';
  classification: 'CHARACTER_RETENTION_CALIBRATION';
  identityAuthority: 'NONE';
  evaluatedAt: string;
};

export type ContentPackageCharacterRetentionLayer = {
  characterRetentionContractId: string;
  contract: CharacterRetentionContract;
};

export type MarketingExpressionExperiment01V22 = {
  experimentId: string;
  version: 'EXPERIMENT_01_V2_2_CHARACTER_RETENTION';
  projectId: string;
  status: 'NOT_STARTED' | 'CONTRACTS_READY' | 'GENERATING' | 'GENERATED' | 'FOUNDER_REVIEW' | 'FAILED';
  topics: string[];
  v1ArtifactIds: string[];
  v21ArtifactIds: string[];
  retainedContracts: CharacterRetainedFirstSlideContract[];
  generatedArtifacts: Experiment01V22Artifact[];
  feedCharacterRhythm: FeedCharacterRhythm | null;
  feedHumorRhythm: FeedHumorRhythm | null;
  northStarCharacterCalibration: CharacterRetentionCalibration | null;
  founderSetJudgment: V22FounderJudgment;
  error: string | null;
};
