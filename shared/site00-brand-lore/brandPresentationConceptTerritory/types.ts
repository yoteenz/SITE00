/**
 * Brand Presentation Concept Territory — brand-level before content/topic.
 */

import type {
  BRAND_PRESENTATION_CONCEPT_TERRITORY_V1,
  BrandPresentationLevelResult,
  EXPERIMENT_G_CLASSIFICATION,
  ExperimentGConceptJudgment,
  IntelligenceProvenanceClass,
  RecurrenceResult,
  TopicIndependenceResult,
} from './constants.js';

export type DirectionSeed = {
  directionSeed: string;
  explanation: string;
};

export type BrandPresentationConceptTerritory = {
  id: string;
  name: string;
  conceptThesis: string;
  brandExistenceModel: string;
  audienceRelationship: string;
  brandBehavior: string;
  publishingLogic: string;
  artifactLogic: string;
  knowledgeBehavior: string;
  authorityModel: string;
  participationLogic: string;
  recurrenceEngine: string;
  topicIndependence: string;
  socialNativeBehavior: string;
  expansionPotential: string;
  possibleDirectionRange: DirectionSeed[];
  antiCollapseRules: string[];
  notThis: string[];
  provenance: string;
  formationReceipt: Record<string, unknown> | null;
  brandPresentationLevel: BrandPresentationLevelEvaluation | null;
  topicIndependenceEval: TopicIndependenceEvaluation | null;
  recurrenceEval: RecurrenceEvaluation | null;
  conceptVsDirection: BrandPresentationConceptVsDirectionEvaluation | null;
  founderJudgment: ExperimentGConceptJudgment;
  judgmentNote: string | null;
  methodologyVersion: typeof BRAND_PRESENTATION_CONCEPT_TERRITORY_V1 | string;
  experimentId: string;
  formationVersion: number;
  snapshotVersion: number;
  snapshotFingerprint: string | null;
  formationPromptVersion: string;
  formationPromptFingerprint: string | null;
  conceptClassification: 'BRAND_PRESENTATION_CONCEPT';
  createdAt: string;
};

export type BrandPresentationLevelEvaluation = {
  result: BrandPresentationLevelResult;
  answersBrandPresentationQuestion: boolean;
  notes: string[];
};

export type TopicIndependenceEvaluation = {
  result: TopicIndependenceResult;
  testTopics: string[];
  perTopicResults: Array<{ topic: string; survives: boolean; note: string }>;
  notes: string[];
};

export type RecurrenceEvaluation = {
  result: RecurrenceResult;
  supportsFranchises: boolean;
  supportsManyTopics: boolean;
  supportsRecurringBehavior: boolean;
  notes: string[];
};

export type BrandPresentationConceptVsDirectionEvaluation = {
  result: 'CONCEPT' | 'DIRECTION_NOT_CONCEPT' | 'STYLE_DEPENDENT';
  supportsMultipleDirections: boolean;
  directionSeedCount: number;
  notes: string[];
};

export type IntelligenceProvenanceEntry = {
  source: string;
  classification: IntelligenceProvenanceClass;
  summary: string;
};

export type BrandPresentationIntelligenceSnapshot = {
  snapshotVersion: number;
  fingerprint: string;
  compiledAt: string;
  frozen: boolean;
  provenanceEntries: IntelligenceProvenanceEntry[];
  brandLevelTruth: string[];
  brandPersonality: string[];
  primaryExpressionContext: string[];
  founderCreativeLatitude: string | null;
  preferenceEvidence: string[];
  referenceEvidence: Array<{ source: string; purpose: string; policy: 'CALIBRATION_ONLY' }>;
  excludedHistoricalEvidence: string[];
  topicBlind: true;
  appetiteIncluded: boolean;
};

export type BrandPresentationFormationReceipt = {
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
  durationMs: number | null;
  createdAt: string;
};

export type BrandPresentationOrthogonalityEvaluation = {
  evaluatedAt: string;
  deterministicPreflight: 'HEURISTIC_PASS' | 'HEURISTIC_FAIL' | 'HEURISTIC_NOT_EVALUATED';
  semanticAuditResult: 'SEMANTIC_AUDIT_PASS' | 'SEMANTIC_AUDIT_FAIL' | 'SEMANTIC_AUDIT_NOT_EVALUATED';
  pairwiseOverlapMatrix: number[][];
  sharedParentHypotheses: string[];
  collapseRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'NOT_EVALUATED';
  setResult: 'PASS' | 'NEEDS_REFORMATION' | 'NOT_EVALUATED';
  reformationRecommended: boolean;
  notes: string[];
};

export type ExperimentFMethodologyOverlay = {
  originalClassification: 'CREATIVE_CONCEPT_TERRITORY_V2';
  laterMethodologyInterpretation: 'CONTENT_CONCEPT_TERRITORY_EXPERIMENT';
  reason: 'TOPIC_LEVEL_FORMATION_DETECTED';
  formationSubject: 'CREDIT UTILIZATION';
  brandPresentationAuthority: 'NONE';
  historicalValue: 'VALID_DOWNSTREAM_CONTENT_CONCEPT_RESEARCH';
  historicalSixPreserved: true;
  nonDestructive: true;
  usedInSuccessorFormation: false;
};

export type ExperimentGStatus =
  | 'NOT_STARTED'
  | 'SNAPSHOT_READY'
  | 'FORMING'
  | 'CONCEPTS_FORMED'
  | 'EVALUATIONS_COMPLETE'
  | 'NEEDS_REFORMATION'
  | 'FOUNDER_REVIEWED'
  | 'FAILED';

export type BrandPresentationConceptFormationRun = {
  experimentClassification: typeof EXPERIMENT_G_CLASSIFICATION;
  runId: string;
  organizationId: string;
  projectId: string;
  methodologyVersion: typeof BRAND_PRESENTATION_CONCEPT_TERRITORY_V1 | string;
  predecessorExperiment: string;
  supersessionRelationship: string;
  experimentFReinterpretation: typeof import('./constants.js').EXPERIMENT_F_REINTERPRETATION;
  intelligenceSnapshotVersion: number;
  formationSubject: null;
  topicBlind: true;
  currentStage: 'BRAND_PRESENTATION_CONCEPT_FORMATION';
  status: ExperimentGStatus;
  formationVersion: number;
  formationPromptVersion: string;
  idempotencyKey: string | null;
  intelligenceSnapshot: BrandPresentationIntelligenceSnapshot | null;
  concepts: BrandPresentationConceptTerritory[];
  orthogonality: BrandPresentationOrthogonalityEvaluation | null;
  formationReceipt: BrandPresentationFormationReceipt | null;
  directionDevelopmentAllowed: false;
  visualGenerationAllowed: false;
  contentGenerationAllowed: false;
  brandCanonMutationAllowed: false;
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
  /** Set when status enters FORMING; used to recover stale in-progress records. */
  formationStartedAt: string | null;
  /** Monotonic attempt token — background worker must match before persisting results. */
  formationAttemptId: string | null;
  startedAt: string | null;
  completedAt: string | null;
};
