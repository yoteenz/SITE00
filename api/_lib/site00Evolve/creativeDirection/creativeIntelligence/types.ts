/**
 * Creative Intelligence Infrastructure — provider-neutral formation types.
 * Business logic depends on these interfaces, not on any LLM vendor SDK.
 */

import type { BrandExpressionContext } from '../../../../../shared/site00-brand-lore/types.js';
import type { BrandLoreReferenceEntry } from '../../../../../shared/site00-brand-lore/types.js';
import type { CoreDirectionDefinition } from '../types.js';

/** Internal reasoning lifecycle — separate from founder approval lifecycle. */
export type CoreDirectionFormationStatus =
  | 'NOT_READY'
  | 'READY_TO_FORM'
  | 'FORMING'
  | 'CRITIQUING'
  | 'REVISING'
  | 'READY_FOR_VISUAL_PRODUCTION'
  | 'NEEDS_HUMAN_REVIEW'
  | 'FAILED';

export type PriorExplorationLabel = 'PRIOR_PROPOSED_EXPLORATION' | 'LEGACY_PROPOSED_EXPLORATION';

export type ExistingCreativeExploration = {
  label: PriorExplorationLabel;
  directionName: string;
  oneLineThesis: string;
  bigIdea: string;
  source: string;
};

/** Extended Core Direction Board — preserves canonical CoreDirectionDefinition fields. */
export type FormedCoreDirection = CoreDirectionDefinition & {
  directionId: string;
  loreLineage: string[];
  conceptualAncestor: string;
  audienceRole: string;
  brandRole: string;
  imageryLanguage: string;
  colorLogic: string;
  motionSeed: string;
  socialExpressionHypothesis: string;
  risks: string[];
  qualityConfidence?: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type CoreDirectionFormationInput = {
  organizationId: string;
  projectId: string | null;
  brandLoreProfileId: string;
  brandLoreProfileVersion: number;
  brandLoreFingerprint: string;
  brandExpressionContext: BrandExpressionContext | null;
  brandPurpose: string | null;
  audienceRelationship: string[] | null;
  brandBelief: string | null;
  culturalOpposition: string[] | null;
  coreObsessions: string | null;
  emotionalPromise: string[] | null;
  creativeTensions: string[] | null;
  worldMetaphor: string | null;
  materialVocabulary: string[] | null;
  symbolicVocabulary: string[] | null;
  referenceLineage: string | null;
  currentReferenceSignals: string | null;
  authenticLanguageSamples: string[] | null;
  antiLanguage: string[] | null;
  socialSignal: string | null;
  audienceRitual: string[] | null;
  memoryGoal: string | null;
  desiredMythology: string | null;
  futureWorld: string | null;
  creativeAntiPatterns: string[] | null;
  contentBrainSummary: string | null;
  founderConfirmedCanon: string[];
  referenceEvidence: BrandLoreReferenceEntry[];
  existingCreativeExplorations: ExistingCreativeExploration[];
  formationVersion: number;
};

export type CoreDirectionFormationResult = {
  directions: FormedCoreDirection[];
  rationaleSummary?: string;
  requestUsage?: ProviderRequestUsage;
};

export type CriticDimension =
  | 'BRAND_GROUNDEDNESS'
  | 'CONCEPT_STRENGTH'
  | 'DISTINCTIVENESS'
  | 'CULTURAL_SPECIFICITY'
  | 'EXPANSION_POTENTIAL'
  | 'SOCIAL_FIRST_VIABILITY'
  | 'VISUAL_POTENTIAL'
  | 'PROPRIETARY_QUALITY'
  | 'ANTI_GENERIC_RISK'
  | 'LORE_LINEAGE_QUALITY';

export type CriticAssessment = 'PASS' | 'WEAK' | 'FAIL';

export type DirectionCritique = {
  directionId: string;
  directionName: string;
  overall: CriticAssessment;
  dimensions: Partial<Record<CriticDimension, CriticAssessment>>;
  failureReasons: string[];
  revisionGuidance: string | null;
};

export type DistinctivenessCheck = {
  passed: boolean;
  duplicatePairs: Array<{ directionA: string; directionB: string; overlapFields: string[] }>;
  worldDifferentiationQuestion: string;
  worldDifferentiationAnswer: string;
};

export type CoreDirectionCritiqueResult = {
  critiques: DirectionCritique[];
  distinctiveness: DistinctivenessCheck;
  revisionRequired: boolean;
  failedDirectionIds: string[];
  requestUsage?: ProviderRequestUsage;
};

export type RenderingMediumRecommendation =
  | 'CODE_NATIVE'
  | 'SVG_NATIVE'
  | 'FAL_GENERATED'
  | 'FAL_GENERATED_AND_ISOLATED'
  | 'HYBRID_COMPOSITION'
  | 'DETERMINISTIC_COMPOSITE'
  | 'EXISTING_ASSET'
  | 'REFERENCE_CONDITIONED_GENERATION';

export type ComparisonProofType =
  | 'heroWorld'
  | 'primaryArtifact'
  | 'materialObject'
  | 'typographicGraphic'
  | 'socialExpression'
  | 'motionSeed';

export type ComparisonProofProductionState =
  | 'PLANNED'
  | 'GENERATING'
  | 'INSPECTING'
  | 'REGENERATING'
  | 'READY'
  | 'NEEDS_REVIEW'
  | 'FAILED';

export type ComparisonProofInspectionOutcome = 'ACCEPT' | 'REJECT' | 'NEEDS_HUMAN_REVIEW';

export type ComparisonProofCompositePlacement = {
  canvasWidth: number;
  canvasHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  anchor: string;
  shadowOwner: 'ASSET_INTRINSIC' | 'CODE_NATIVE_SHADOW' | 'COMPOSITE_SHADOW' | 'NONE';
  breakpoint: 'MOBILE' | 'DESKTOP';
};

export type ComparisonProofAsset = {
  assetId: string;
  comparisonSetKey: string;
  comparisonIndex: number;
  directionId: string;
  directionName: string;
  sourceFormationId: string;
  sourceFormationVersion: number;
  proofType: ComparisonProofType;
  url: string;
  storagePath: string;
  medium: RenderingMediumRecommendation;
  model?: string;
  promptHash: string;
  referenceHash?: string;
  qaState: ComparisonProofInspectionOutcome;
  productionState: ComparisonProofProductionState;
  backgroundRemovalRequired?: boolean;
  edgeTreatment?: string;
  shadowOwner?: ComparisonProofCompositePlacement['shadowOwner'];
  compositeMaps?: ComparisonProofCompositePlacement[];
  sourceGenerationUrl?: string;
  iteration: number;
  inspectionNotes?: string[];
  createdAt: string;
};

export type ComparisonProofProductionPlan = {
  plannedFalCalls: number;
  backgroundRemovalCalls: number;
  codeNativeProofs: number;
  motionVideoCalls: number;
  estimatedCostUsd: number;
  proofTypesByDirection: Record<string, ComparisonProofType[]>;
};

export type ComparisonDistinctivenessResult = {
  pair: [string, string];
  result: 'DISTINCT' | 'TOO_SIMILAR' | 'NEEDS_HUMAN_REVIEW';
  notes: string;
};

export type SixDirectionProductionResult = {
  v1Completion: {
    anthropicRequestCount: number;
    directionsCompleted: number;
    tokenUsage?: ProviderRequestUsage;
  };
  production: {
    skipped: boolean;
    falRequestCount: number;
    backgroundRemovalCount: number;
    codeNativeCount: number;
    estimatedCostUsd: number;
    actualCostUsd: number;
    assetsAccepted: number;
    assetsRejected: number;
    assetsNeedReview: number;
  };
  distinctiveness: ComparisonDistinctivenessResult[];
  sixWorldGate: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  assets: ComparisonProofAsset[];
};

export type VisualProofComponent = {
  purpose: string;
  mediumRecommendation: RenderingMediumRecommendation;
  referenceIntent?: string[];
  generationNeed?: string;
};

export type VisualProofPlan = {
  directionId: string;
  directionName: string;
  heroWorld: VisualProofComponent;
  primaryArtifact: VisualProofComponent;
  socialExpression: VisualProofComponent & { format: string };
  typographicGraphicProof: VisualProofComponent & { codeVsGeneratedDecision: string };
  materialObjectProof?: VisualProofComponent;
  motionSeed: VisualProofComponent & { proofType: string };
};

export type ProviderCapability = {
  providerId: string;
  modelId: string;
  supportsStructuredOutput: boolean;
  supportsLongContext: boolean;
  supportsVision: boolean;
  supportsToolUse: boolean;
  maxContext: number;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'MISCONFIGURED';
};

export type ProviderRequestUsage = {
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd?: number;
};

export type ProviderRequestAccounting = {
  providerId: string;
  modelId: string;
  requestCount: number;
  revisionCount: number;
  formationRequests: number;
  critiqueRequests: number;
  reviseRequests: number;
  tokenUsage: ProviderRequestUsage;
};

/** Targeted completion of missing production fields — separate from full reformation. */
export type DirectionCompletionOverlay = {
  directionId: string;
  directionName: string;
  completedAt: string;
  promptVersion: string;
  fieldsRequested: string[];
  fieldsCompleted: string[];
  preservedFields: string[];
  completedFields: Partial<FormedCoreDirection>;
  requestUsage?: ProviderRequestUsage;
};

export type CoreDirectionFormationRecord = {
  formationId: string;
  organizationId: string;
  projectId: string | null;
  engagementId?: string | null;
  brandLoreProfileId: string;
  brandLoreProfileVersion: number;
  brandLoreFingerprint: string;
  formationVersion: number;
  providerId: string;
  modelId: string;
  promptVersion: string;
  status: CoreDirectionFormationStatus;
  idempotencyKey: string;
  formationInput?: CoreDirectionFormationInput | null;
  candidateDirections: FormedCoreDirection[];
  criticResult: CoreDirectionCritiqueResult | null;
  revisionRounds: number;
  finalDirections: FormedCoreDirection[];
  visualProofPlans: VisualProofPlan[];
  /** Stored separately from original Sonnet output — does not rewrite formation identity. */
  directionCompletionOverlays?: DirectionCompletionOverlay[];
  legacyStaticPreview: 'PRESERVED';
  proposedFormationLabel: 'PROPOSED_FORMATION';
  providerAccounting: ProviderRequestAccounting;
  error: string | null;
  errorCode?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt: string | null;
  failedAt?: string | null;
  updatedAt?: string | null;
};

/** Instance-scoped founder review projection — NOT a formation, NOT a reform. */
export type ComparisonDirectionCandidate = FormedCoreDirection & {
  comparisonIndex: number;
  sourceFormationId: string;
  sourceFormationVersion: number;
  sourceDirectionIndex: number;
  brandLoreProfileVersion: number;
  brandLoreFingerprint: string;
  fieldCompleteness: {
    complete: boolean;
    missingFields: string[];
  };
  completionLineage: DirectionCompletionOverlay | null;
};

export type ComparisonVisualProofPlan = VisualProofPlan & {
  comparisonIndex: number;
  sourceFormationId: string;
  sourceFormationVersion: number;
};

export type FounderComparisonSet = {
  kind: 'INSTANCE_SCOPED_FOUNDER_COMPARISON';
  orgSlug: 'ndxbook';
  organizationId: string;
  brandLoreFingerprint: string;
  brandLoreProfileVersion: number;
  canonicalFormationId: string;
  canonicalFormationVersion: number;
  persistent: true;
  directionCount: number;
  directions: ComparisonDirectionCandidate[];
  visualProofPlans: ComparisonVisualProofPlan[];
  v1CompletionStatus: {
    required: boolean;
    missingByDirection: Record<string, string[]>;
    overlaysApplied: number;
  };
  distinctivenessPairs: Array<{
    pair: [string, string];
    relationship: 'conceptual_cousin';
    differentiationNote: string;
  }>;
  /** Accepted Stage A proof assets keyed by directionId then proofType. */
  proofAssetsByDirection?: Record<
    string,
    Partial<Record<ComparisonProofType, ComparisonProofAsset>>
  >;
  /** Board-first creative direction boards (pilot: THE MARKED-UP COPY only). */
  creativeDirectionBoardsByDirection?: Record<string, import('./creativeDirectionBoardTypes.js').CreativeDirectionBoard>;
  productionSummary?: ComparisonProofProductionPlan;
};

/** Founder-selected direction lineage — independent from canonical formation. */
export type FounderSelectedDirectionLineage = {
  selectedDirectionId: string;
  directionName: string;
  sourceFormationId: string;
  sourceFormationVersion: number;
  sourceDirectionIndex: number;
  brandLoreProfileVersion: number;
  brandLoreFingerprint: string;
  comparisonIndex: number;
};

export type CreativeIntelligenceProviderStatus =
  | 'CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE'
  | 'CREATIVE_INTELLIGENCE_READY'
  | 'CREATIVE_INTELLIGENCE_CONFIGURED';

export type ReviseCoreDirectionsInput = {
  formationInput: CoreDirectionFormationInput;
  candidates: FormedCoreDirection[];
  critique: CoreDirectionCritiqueResult;
};

export interface CreativeIntelligenceProvider {
  readonly providerId: string;
  readonly capability: ProviderCapability;
  formCoreDirections(input: CoreDirectionFormationInput): Promise<CoreDirectionFormationResult>;
  critiqueCoreDirections(
    input: CoreDirectionFormationInput,
    candidates: FormedCoreDirection[],
  ): Promise<CoreDirectionCritiqueResult>;
  reviseCoreDirections(input: ReviseCoreDirectionsInput): Promise<CoreDirectionFormationResult>;
}
