/**
 * Creative Concept Territory V2 — concept-before-direction models.
 */

import type {
  ConceptDistinctivenessV2Result,
  ConceptVsDirectionResult,
  EXPERIMENT_F_CLASSIFICATION,
  ExperimentEvidencePolicy,
  ExperimentFConceptJudgment,
  HistoricalConceptComparisonRelation,
} from './constants.js';

export type { ConceptDistinctivenessV2Result };

export type DirectionSeed = {
  directionSeed: string;
  explanation: string;
};

export type CreativeConceptTerritoryV2 = {
  id: string;
  conceptName: string;
  conceptThesis: string;
  coreCreativeIdea: string;
  worldPremiseSeed: string;
  viewerRole: string;
  audienceRelationship: string;
  contentMechanism: string;
  informationBehavior: string;
  emotionalTension: string;
  participationLogic: string;
  spatialTemporalLogic: string;
  artifactLogic: string;
  narrativeLogic: string;
  whyThisIsNdxbook: string;
  whyThisIsAConceptNotDirection: string;
  possibleDirectionRange: DirectionSeed[];
  possibleNativeFormats: string[];
  antiCollapseRules: string[];
  provenance: string;
  formationReceipt: Record<string, unknown> | null;
  conceptVsDirection: ConceptVsDirectionEvaluation | null;
  founderJudgment: ExperimentFConceptJudgment;
  judgmentNote: string | null;
  methodologyVersion: string;
  createdAt: string;
};

export type ConceptVsDirectionEvaluation = {
  result: ConceptVsDirectionResult;
  supportsMultipleDirections: boolean;
  styleDependent: boolean;
  formatDependent: boolean;
  notes: string[];
};

export type SharedParentCandidate = {
  sharedParentConcept: string;
  conceptIds: string[];
  mechanism: string;
  notes: string[];
};

export type ConceptFamilyGroup = {
  familyId: string;
  parentIdea: string;
  memberConceptIds: string[];
  notes: string[];
};

export type ConceptOrthogonalityEvaluationV2 = {
  evaluatedAt: string;
  pairwiseOverlapMatrix: number[][];
  conceptualDimensions: string[];
  sharedParentCandidates: SharedParentCandidate[];
  conceptFamilies: ConceptFamilyGroup[];
  directionLevelRisks: string[];
  styleLevelRisks: string[];
  formatDependenceRisks: string[];
  artificialDiversityUsed: boolean;
  artificialDiversityRisk: string | null;
  strongestDistinctivePairs: Array<[number, number]>;
  weakestDistinctivePairs: Array<[number, number]>;
  setResult: ConceptDistinctivenessV2Result;
  reformationRecommended: boolean;
  notes: string[];
};

export type SixConceptFormationReceipt = {
  receiptId: string;
  provider: 'anthropic';
  model: string;
  promptFingerprint: string;
  snapshotFingerprint: string;
  formationVersion: number;
  idempotencyKey: string;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number | null;
  createdAt: string;
};

export type ExperimentFIntelligenceSnapshot = {
  snapshotVersion: number;
  fingerprint: string;
  compiledAt: string;
  frozen: boolean;
  brandLevelTruth: string[];
  mediumContext: string[];
  founderCreativeLatitude: string | null;
  preferenceEvidence: string[];
  historicalExperimentEvidence: Array<{ source: string; policy: ExperimentEvidencePolicy }>;
  excludedContamination: string[];
  appetiteIncluded: boolean;
};

export type HistoricalConceptComparison = {
  newConceptId: string;
  newConceptName: string;
  oldDirectionName: string;
  relation: HistoricalConceptComparisonRelation;
  salvageCandidate: boolean;
  notes: string[];
};

export type ExperimentDMethodologyOverlay = {
  experimentDistinctiveness: typeof import('./constants.js').EXPERIMENT_D_CONCEPT_DISTINCTIVENESS;
  laterMethodologyInterpretation: typeof import('./constants.js').EXPERIMENT_D_LATER_INTERPRETATION;
  founderConclusion: typeof import('./constants.js').EXPERIMENT_D_FOUNDER_CONCLUSION;
  originalClassification: 'CREATIVE_CONCEPT_TERRITORY';
  historicalTerritoriesPreserved: true;
  nonDestructive: true;
};

export type ExperimentFStatus =
  | 'NOT_STARTED'
  | 'SNAPSHOT_READY'
  | 'FORMING'
  | 'CONCEPTS_FORMED'
  | 'DISTINCTIVENESS_VALIDATED'
  | 'NEEDS_REFORMATION'
  | 'FOUNDER_REVIEWED'
  | 'DIRECTION_DEVELOPMENT_ALLOWED'
  | 'FAILED';

export type SixConceptReformationRun = {
  experimentClassification: typeof EXPERIMENT_F_CLASSIFICATION;
  runId: string;
  organizationId: string;
  projectId: string;
  methodologyVersion: string;
  predecessorExperiment: string;
  supersedesMethodology: string;
  reformationReason: string;
  intelligenceSnapshotVersion: number;
  topicId: string;
  topicName: string;
  currentStage: 'CONCEPT_FORMATION';
  status: ExperimentFStatus;
  formationVersion: number;
  idempotencyKey: string | null;
  intelligenceSnapshot: ExperimentFIntelligenceSnapshot | null;
  concepts: CreativeConceptTerritoryV2[];
  orthogonality: ConceptOrthogonalityEvaluationV2 | null;
  formationReceipt: SixConceptFormationReceipt | null;
  historicalComparison: HistoricalConceptComparison[] | null;
  historicalComparisonAvailable: boolean;
  directionDevelopmentAllowed: boolean;
  visualGenerationAllowed: false;
  accounting: {
    anthropicRequests: number;
    anthropicInputTokens: number;
    anthropicOutputTokens: number;
    anthropicEstimatedCostUsd: number;
    gptImage2Requests: 0;
    falRequests: 0;
    visualGenerationCostUsd: 0;
  };
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
};

export type CreativeDirectionCandidateContract = {
  directionId: string;
  parentConceptId: string;
  directionSeed: string;
  status: 'NOT_STARTED' | 'FORMED' | 'APPROVED';
};
