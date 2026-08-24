/**
 * Brand Presentation Visual Formulation — finalist → expression → visual types.
 */

import type {
  BRAND_PRESENTATION_VISUAL_FORMULATION_V1,
  BRAND_PRESENTATION_VISUAL_FORMULATION_CLASSIFICATION,
  BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID,
  FinalistSelectionStatus,
  VisualExpressionJudgment,
  VisualFormulationStatus,
  REFERENCE_CLASSES,
  DIRECTION_DRIFT_RESULTS,
  VISUAL_DISTINCTIVENESS_RESULTS,
  VISION_QA_RESULTS,
} from './constants.js';
import type { BrandPresentationVisualExplorationPolicy } from './constants.js';

export type BrandPresentationVisualFinalistSelection = {
  selectionId: string;
  projectId: string;
  projectSlug: string;
  experimentId: string;
  directionId: string;
  parentConceptId: string;
  parentConceptName: string;
  directionName: string;
  directionFormationFingerprint: string | null;
  founderJudgmentId: string | null;
  selectedBy: string;
  selectedAt: string;
  selectionOrder: 1 | 2;
  status: FinalistSelectionStatus;
  version: number;
};

export type BrandPresentationVisualReferenceEntry = {
  referenceId: string;
  referenceClass: (typeof REFERENCE_CLASSES)[number];
  sourceLabel: string;
  publicUrl: string | null;
  storagePath: string | null;
  excludedReason: string | null;
};

export type BrandPresentationVisualReferencePackage = {
  packageId: string;
  directionId: string;
  expressionId: string | null;
  references: BrandPresentationVisualReferenceEntry[];
  excludedSources: string[];
  referenceConditioned: boolean;
  strictConditioningRequired: boolean;
  compiledAt: string;
  fingerprint: string;
};

export type BrandPresentationVisualExpressionCandidate = {
  expressionId: string;
  projectId: string;
  projectSlug: string;
  parentConceptId: string;
  parentConceptName: string;
  parentDirectionId: string;
  parentDirectionName: string;
  expressionIndex: 1 | 2 | 3;
  expressionLabel: 'A' | 'B' | 'C';
  expressionName: string;
  expressionThesis: string;
  directionInterpretation: string;
  visualBehavior: string;
  compositionBehavior: string;
  typographyBehavior: string;
  imageryBehavior: string;
  graphicLanguage: string;
  artifactLanguage: string;
  informationBehavior: string;
  densityBehavior: string;
  rhythmBehavior: string;
  recurrenceBehavior: string;
  socialSurfaceBehavior: string;
  motionPotential: string;
  materialPotential: string;
  recognitionMechanism: string;
  variationLogic: string;
  brandFidelity: string;
  directionFidelity: string;
  visualDistinctiveness: string;
  antiCollapseRules: string[];
  notThis: string[];
  referencePackageId: string | null;
  promptFingerprint: string | null;
  generationReceipt: Record<string, unknown> | null;
  assetId: string | null;
  assetStoragePath: string | null;
  assetPublicUrl: string | null;
  assetFingerprint: string | null;
  founderJudgment: VisualExpressionJudgment;
  judgmentNote: string | null;
  directionDriftEval: {
    result: (typeof DIRECTION_DRIFT_RESULTS)[number];
    notes: string[];
  } | null;
  siblingDistinctivenessEval: {
    result: (typeof VISUAL_DISTINCTIVENESS_RESULTS)[number];
    notes: string[];
  } | null;
  visionEval: {
    directionFidelity: (typeof VISION_QA_RESULTS)[number];
    brandFidelity: (typeof VISION_QA_RESULTS)[number];
    referenceAdherence: (typeof VISION_QA_RESULTS)[number];
    genericRisk: (typeof VISION_QA_RESULTS)[number];
    visualRange: (typeof VISUAL_DISTINCTIVENESS_RESULTS)[number];
    notes: string[];
  } | null;
  parentExpressionId: string | null;
  revisionNumber: number;
  status: 'FORMULATED' | 'GENERATED' | 'SUPERSEDED' | 'REVISION_REQUIRED';
  formationVersion: number;
  createdAt: string;
};

export type VisualExpressionRevisionDelta = {
  revisionId: string;
  parentExpressionId: string;
  parentAssetId: string | null;
  childExpressionId: string;
  revisionNumber: number;
  preserve: string[];
  change: string[];
  doNotBecome: string[];
  revisionPromptFingerprint: string;
  createdAt: string;
};

export type BrandPresentationWinnerSelection = {
  winnerId: string;
  projectId: string;
  projectSlug: string;
  parentConceptId: string;
  parentConceptName: string;
  directionId: string;
  directionName: string;
  expressionId: string;
  expressionLabel: 'A' | 'B' | 'C';
  assetId: string | null;
  assetStoragePath: string | null;
  founderJudgment: string;
  selectionTimestamp: string;
  methodologyVersion: string;
  directionFormationFingerprint: string | null;
  expressionFormationFingerprint: string | null;
  referenceFingerprint: string | null;
  generationReceiptLineage: Record<string, unknown> | null;
  brandCanonMutated: false;
  implementationStarted: false;
  eligibleForExpressionSystemDevelopment: true;
};

export type BrandPresentationVisualFormulationRun = {
  experimentClassification: typeof BRAND_PRESENTATION_VISUAL_FORMULATION_CLASSIFICATION;
  runId: typeof BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID | string;
  organizationId: string;
  projectId: string;
  projectSlug: string;
  methodologyVersion: typeof BRAND_PRESENTATION_VISUAL_FORMULATION_V1 | string;
  parentExperiment: 'EXPERIMENT_G';
  parentDirectionRunId: string;
  explorationPolicy: BrandPresentationVisualExplorationPolicy;
  finalists: BrandPresentationVisualFinalistSelection[];
  expressions: BrandPresentationVisualExpressionCandidate[];
  referencePackages: BrandPresentationVisualReferencePackage[];
  revisions: VisualExpressionRevisionDelta[];
  winner: BrandPresentationWinnerSelection | null;
  crossFinalistCollapseEval: {
    result: 'PASS' | 'FINALIST_VISUAL_COLLAPSE' | 'NOT_EVALUATED';
    notes: string[];
  } | null;
  status: VisualFormulationStatus;
  formationVersion: number;
  formationPromptVersion: string;
  visualFormulationAllowed: true;
  visualGenerationAllowed: boolean;
  falGenerationAllowed: boolean;
  brandCanonMutationAllowed: false;
  expressionSystemDevelopmentAllowed: false;
  accounting: {
    anthropicRequests: number;
    anthropicInputTokens: number;
    anthropicOutputTokens: number;
    anthropicEstimatedCostUsd: number;
    falRequests: number;
    falRequestsExpected: number;
    visualGenerationCostUsd: number;
    hiddenVariantRequests: 0;
  };
  error: string | null;
  formationStartedAt: string | null;
  generationStartedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
};
