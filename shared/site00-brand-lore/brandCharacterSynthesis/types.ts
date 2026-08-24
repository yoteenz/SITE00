/**
 * Composite Brand Character Synthesis + Artifact Proof types.
 */

import type { BrandCharacterSystem } from '../brandCharacterTerritory/types.js';
import type {
  ARTIFACT_PROOF_FOUNDER_JUDGMENTS,
  ARTIFACT_PROOF_SCENARIOS,
  BRAND_CHARACTER_ARTIFACT_PROOF_V1,
  BRAND_CHARACTER_SYNTHESIS_V1,
  CHARACTER_TERRITORY_ROLES,
  CHARACTER_TRACE_CLASSES,
  SYNTHESIS_FAILURE_STATES,
  SYNTHESIS_FOUNDER_JUDGMENTS,
} from './constants.js';

export type CharacterTerritoryRole = (typeof CHARACTER_TERRITORY_ROLES)[number];
export type CharacterTraceClass = (typeof CHARACTER_TRACE_CLASSES)[number];
export type SynthesisFailureState = (typeof SYNTHESIS_FAILURE_STATES)[number];
export type SynthesisFounderJudgment = (typeof SYNTHESIS_FOUNDER_JUDGMENTS)[number] | null;
export type ArtifactProofFounderJudgment = (typeof ARTIFACT_PROOF_FOUNDER_JUDGMENTS)[number] | null;
export type ArtifactProofScenario = (typeof ARTIFACT_PROOF_SCENARIOS)[number];

export type SourceContributionEntry = {
  territoryId: string;
  territoryName: string;
  role: CharacterTerritoryRole;
  facultyHypothesis: string;
  contributedDimensions: string[];
  evidenceUsed: string[];
};

export type BrandCharacterSynthesis = {
  id: string;
  projectId: string;
  brandId: string;
  sourceTerritoryIds: string[];
  sourceDevelopmentIds: string[];
  formationRunId: string;
  version: number;
  status: 'FORMING' | 'SYNTHESIZED' | 'FAILED' | 'FOUNDER_REVIEWED' | 'APPROVED';
  characterName: string;
  characterEssence: string;
  characterThesis: string;
  characterWorldview: string;
  characterInternalLogic: string;
  characterHistoryOrArc: string;
  intellectualIdentity: string;
  socialIdentity: string;
  culturalIdentity: string;
  emotionalIdentity: string;
  judgmentIdentity: string;
  humorIdentity: string;
  languageIdentity: string;
  tasteIdentity: string;
  expressiveIdentity: string;
  artifactIdentity: string;
  youngerInstincts: string[];
  maturedInstincts: string[];
  continuities: string[];
  growthEdges: string[];
  productiveTensions: string[];
  resolvedContradictions: string[];
  unresolvedContradictions: string[];
  contextualModulationRules: string[];
  likes: string[];
  dislikes: string[];
  delights: string[];
  irritations: string[];
  obsessions: string[];
  blindSpots: string[];
  boundaries: string[];
  socialInstincts: string[];
  intellectualInstincts: string[];
  culturalInstincts: string[];
  makerBehaviors: string[];
  artifactBehaviors: string[];
  recognitionSignals: string[];
  neverBecome: string[];
  whyTheseThreeBelongTogether: string;
  sourceContributionMap: SourceContributionEntry[];
  founderHypothesisRelationship: string;
  maturationContinuitySummary: string | null;
  founderJudgment: SynthesisFounderJudgment;
  judgmentNote: string | null;
  fingerprint: string;
  methodologyVersion: typeof BRAND_CHARACTER_SYNTHESIS_V1 | string;
  providerReceipt: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type FounderCharacterHypothesis = {
  id: string;
  projectId: string;
  classification: 'FOUNDER_CHARACTER_HYPOTHESIS';
  authority: 'HIGH_VALUE_FORMATION_EVIDENCE';
  rawWording: string;
  normalizedInterpretation: string;
  maturationInsight: string;
  isBrandCanon: false;
  isFinalCharacterSystem: false;
  isVisualStyleMandate: false;
  ancestryCalibrationRole: 'CHARACTER_ANCESTRY_CALIBRATION';
  capturedAt: string;
  fingerprint: string;
};

export type MaturationDimensionState = 'PRESERVED' | 'PARTIAL' | 'AT_RISK' | 'ERASED';

export type CharacterMaturationContinuityEvaluation = {
  evaluationId: string;
  synthesisId: string;
  youngerInstinctPreserved: MaturationDimensionState;
  maturityGained: MaturationDimensionState;
  intellectualDepthGained: MaturationDimensionState;
  ethicalDepthGained: MaturationDimensionState;
  selfCorrectionGained: MaturationDimensionState;
  culturalInteriorityPreserved: MaturationDimensionState;
  humorPreserved: MaturationDimensionState;
  messinessPreserved: MaturationDimensionState;
  makerPresencePreserved: MaturationDimensionState;
  personalitySanitizationRisk: boolean;
  passesMaturationContinuity: boolean;
  coreInsightSupported: boolean;
  notes: string[];
  evaluatedAt: string;
};

export type BrandCharacterArtifactRevision = {
  revisionId: string;
  targetType: 'CHARACTER' | 'VISUAL' | 'ARTIFACT_EXPRESSION';
  note: string;
  createdAt: string;
};

export type BrandCharacterSynthesisEvaluation = {
  evaluationId: string;
  synthesisId: string;
  passesCoherence: boolean;
  passesPsychologicalDepth: boolean;
  passesProductiveTension: boolean;
  passesHumorCausality: boolean;
  passesCulturalInteriority: boolean;
  genericArchetypeRisk: boolean;
  adjectiveListRisk: boolean;
  failureStates: SynthesisFailureState[];
  notes: string[];
  evaluatedAt: string;
};

export type CharacterTrace = {
  traceId: string;
  traceClass: CharacterTraceClass;
  trigger: string;
  behavior: string;
  visibleManifestation: string;
  causalChain: string[];
};

export type BrandCharacterArtifactProof = {
  id: string;
  characterSystemId: string;
  scenario: ArtifactProofScenario;
  scenarioLabel: string;
  situation: string;
  whatNDXNoticed: string;
  whatNDXThought: string;
  whatNDXFelt: string;
  whatNDXRemembered: string;
  whatNDXConnected: string;
  whatNDXDecided: string;
  whatNDXDid: string;
  traces: CharacterTrace[];
  artifactContents: string[];
  makerEvidence: string[];
  culturalEvidence: string[];
  humorEvidence: string[];
  judgmentEvidence: string[];
  synthesisEvidence: string[];
  visualFreedomContract: string;
  mustNotBecome: string[];
  falPromptContract: {
    prompt: string;
    negativePrompt: string;
    promptHash: string;
    sectionOrder: string[];
  };
  evaluation: BrandCharacterArtifactEvaluation | null;
  founderJudgment: ArtifactProofFounderJudgment;
  judgmentNote: string | null;
  asset: BrandCharacterArtifactAsset | null;
  methodologyVersion: typeof BRAND_CHARACTER_ARTIFACT_PROOF_V1 | string;
  formulatedAt: string;
};

export type BrandCharacterArtifactEvaluation = {
  characterPresence: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  makerCausality: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  culturalFluency: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  judgment: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  synthesis: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  humor: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  genericBrandRisk: boolean;
  styleDependency: boolean;
  literalReferenceCopy: boolean;
  artifactAuthenticity: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  ndxRecognition: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  failureStates: SynthesisFailureState[];
  notes: string[];
};

export type BrandCharacterArtifactAsset = {
  assetId: string;
  proofId: string;
  storagePath: string | null;
  publicUrl: string | null;
  falRequestId: string | null;
  provider: 'fal';
  model: string;
  promptHash: string;
  costUsd: number;
  status: 'NOT_GENERATED' | 'GENERATING' | 'GENERATED' | 'FAILED';
  generatedAt: string | null;
  error: string | null;
};

export type BrandCharacterSynthesisRun = {
  runId: string;
  projectId: string;
  organizationId: string;
  formationRunId: string;
  status:
    | 'NOT_STARTED'
    | 'PREPARING'
    | 'SYNTHESIZING'
    | 'SYNTHESIZED'
    | 'SYSTEM_COMPILED'
    | 'PROOFS_FORMULATED'
    | 'PROOFS_GENERATED'
    | 'FAILED';
  territoryRoles: Record<string, CharacterTerritoryRole>;
  sourceTerritoryIds: string[];
  sourceDevelopmentIds: string[];
  founderHypothesis: FounderCharacterHypothesis | null;
  readinessRefresh: {
    previousState: string | null;
    newState: string;
    deepeningAnswerCount: number;
    brandLoreReadiness: string | null;
    remainingBlockers: string[];
    founderOverride: boolean;
  } | null;
  synthesis: BrandCharacterSynthesis | null;
  synthesisEvaluation: BrandCharacterSynthesisEvaluation | null;
  maturationEvaluation: CharacterMaturationContinuityEvaluation | null;
  characterSystem: BrandCharacterSystem | null;
  artifactProofs: BrandCharacterArtifactProof[];
  artifactRevisions: BrandCharacterArtifactRevision[];
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
