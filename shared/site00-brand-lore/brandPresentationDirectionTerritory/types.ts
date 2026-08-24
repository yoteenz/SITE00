/**
 * Brand Presentation Direction — concept → direction layer types.
 */

import type {
  BRAND_PRESENTATION_DIRECTION_TERRITORY_V1,
  BRAND_PRESENTATION_DIRECTION_CLASSIFICATION,
  BRAND_PRESENTATION_DIRECTION_RUN_ID,
  CROSS_PARENT_AUDIT_RESULTS,
  ExperimentGDirectionJudgment,
  PARENT_FIDELITY_RESULTS,
  RECURRENCE_DIRECTION_RESULTS,
  SIBLING_DISTINCTIVENESS_RESULTS,
  TOPIC_SUBSTITUTION_RESULTS,
} from './constants.js';
import type { BrandPresentationConceptTerritory } from '../brandPresentationConceptTerritory/types.js';

export type ExpressionSeed = {
  seed: string;
  explanation: string;
};

export type FrozenParentConceptSnapshot = Pick<
  BrandPresentationConceptTerritory,
  | 'id'
  | 'name'
  | 'conceptThesis'
  | 'brandExistenceModel'
  | 'audienceRelationship'
  | 'brandBehavior'
  | 'publishingLogic'
  | 'artifactLogic'
  | 'knowledgeBehavior'
  | 'authorityModel'
  | 'participationLogic'
  | 'recurrenceEngine'
  | 'topicIndependence'
  | 'socialNativeBehavior'
  | 'expansionPotential'
  | 'possibleDirectionRange'
  | 'antiCollapseRules'
  | 'notThis'
  | 'snapshotFingerprint'
  | 'founderJudgment'
> & {
  formationFingerprint: string | null;
  frozenAt: string;
  intelligenceSnapshotFingerprint: string | null;
};

export type BrandPresentationDirectionCandidate = {
  directionId: string;
  parentConceptId: string;
  parentConceptName: string;
  parentDirectionId: string | null;
  directionIndex: number;
  directionName: string;
  directionThesis: string;
  directionInterpretation: string;
  brandPosture: string;
  audienceRelationship: string;
  brandBehavior: string;
  editorialBehavior: string;
  publishingBehavior: string;
  knowledgeBehavior: string;
  authorityBehavior: string;
  participationBehavior: string;
  recurrenceBehavior: string;
  artifactBehavior: string;
  temporalBehavior: string;
  informationRevelationLogic: string;
  emotionalTemperature: string;
  culturalPosture: string;
  socialNativeBehavior: string;
  recognitionMechanism: string;
  topicIndependence: string;
  expansionPotential: string;
  visualImplications: string;
  visualFreedom: string;
  possibleExpressionSeeds: ExpressionSeed[];
  antiCollapseRules: string[];
  notThis: string[];
  parentConceptFidelity: {
    result: (typeof PARENT_FIDELITY_RESULTS)[number];
    notes: string[];
  } | null;
  siblingDistinctiveness: {
    result: (typeof SIBLING_DISTINCTIVENESS_RESULTS)[number];
    notes: string[];
  } | null;
  topicIndependenceEval: {
    result: (typeof TOPIC_SUBSTITUTION_RESULTS)[number];
    testTopics: string[];
    notes: string[];
  } | null;
  recurrenceEval: {
    result: (typeof RECURRENCE_DIRECTION_RESULTS)[number];
    notes: string[];
  } | null;
  formationVersion: number;
  formationFingerprint: string | null;
  providerReceipt: Record<string, unknown> | null;
  founderJudgment: ExperimentGDirectionJudgment;
  judgmentNote: string | null;
  revisionNote: {
    preserve: string[];
    change: string[];
    doNotBecome: string[];
  } | null;
  methodologyVersion: typeof BRAND_PRESENTATION_DIRECTION_TERRITORY_V1 | string;
  experimentId: typeof BRAND_PRESENTATION_DIRECTION_RUN_ID | string;
  createdAt: string;
};

export type BrandPresentationDirectionParentGroup = {
  parentConceptId: string;
  parentConceptName: string;
  parentSnapshot: FrozenParentConceptSnapshot;
  directionIds: string[];
  siblingDistinctiveness: {
    result: (typeof SIBLING_DISTINCTIVENESS_RESULTS)[number];
    notes: string[];
  };
  parentFidelitySummary: {
    passCount: number;
    driftCount: number;
    notes: string[];
  };
};

export type BrandPresentationDirectionCrossParentAudit = {
  evaluatedAt: string;
  result: (typeof CROSS_PARENT_AUDIT_RESULTS)[number];
  conceptualLeakage: string[];
  crossParentDuplication: string[];
  artificialDiversityFlags: string[];
  semanticAuditResult: 'SEMANTIC_AUDIT_PASS' | 'SEMANTIC_AUDIT_FAIL' | 'SEMANTIC_AUDIT_NOT_EVALUATED';
  notes: string[];
};

export type BrandPresentationDirectionFormationReceipt = {
  receiptId: string;
  provider: 'anthropic';
  model: string;
  promptFingerprint: string;
  parentConceptCount: number;
  directionsExpected: number;
  formationVersion: number;
  formationPromptVersion: string;
  idempotencyKey: string;
  inputTokens: number | null;
  outputTokens: number | null;
  providerRequestId: string | null;
  durationMs: number | null;
  createdAt: string;
};

export type BrandPresentationDirectionFormationStatus =
  | 'NOT_STARTED'
  | 'PARENTS_READY'
  | 'FORMING'
  | 'DIRECTIONS_FORMED'
  | 'EVALUATIONS_COMPLETE'
  | 'FOUNDER_REVIEW'
  | 'FAILED';

export type BrandPresentationDirectionFormationRun = {
  experimentClassification: typeof BRAND_PRESENTATION_DIRECTION_CLASSIFICATION;
  runId: typeof BRAND_PRESENTATION_DIRECTION_RUN_ID | string;
  organizationId: string;
  projectId: string;
  methodologyVersion: typeof BRAND_PRESENTATION_DIRECTION_TERRITORY_V1 | string;
  parentExperiment: 'EXPERIMENT_G';
  parentConceptSnapshots: FrozenParentConceptSnapshot[];
  parentGroups: BrandPresentationDirectionParentGroup[];
  directions: BrandPresentationDirectionCandidate[];
  crossParentAudit: BrandPresentationDirectionCrossParentAudit | null;
  formationReceipt: BrandPresentationDirectionFormationReceipt | null;
  status: BrandPresentationDirectionFormationStatus;
  formationVersion: number;
  formationPromptVersion: string;
  idempotencyKey: string | null;
  directionDevelopmentAllowed: true;
  visualFormulationAllowed: false;
  visualGenerationAllowed: false;
  falGenerationAllowed: false;
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
  formationStartedAt: string | null;
  formationAttemptId: string | null;
  startedAt: string | null;
  completedAt: string | null;
};
