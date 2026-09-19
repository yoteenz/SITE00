/**
 * Experiment E — Experience Expression types.
 */

import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import type {
  CanonItemClassification,
  DeviceClass,
  ExperienceConceptJudgment,
  ExperienceDistinctivenessResult,
  ExperienceExpressionReadinessState,
  ExperienceProvenance,
  ExperienceSurfaceType,
} from './constants.js';
import type { ExperienceAssetDirection } from './assetDirection.js';
import type { ExperienceAssetManifest, ExperienceAssetRequirement } from './assetManifest.js';
import type { ExperienceAssetGenerationReceipt } from './assetGeneration.js';
import type { ExperienceProductionAsset } from './assetLifecycle.js';
import type { ProjectProductionScope } from './productionScope.js';

export type ExperienceFunctionalCanonItem = {
  id: string;
  label: string;
  classification: CanonItemClassification;
  businessPurpose: string;
  founderTask: string;
  stateDependency: string | null;
  dataSource: string;
  mutationRisk: 'NONE' | 'LOW' | 'HIGH';
  canPresentationChange: boolean;
  route: string | null;
};

export type ExperienceFunctionalCanon = {
  version: number;
  projectSlug: string;
  routes: string[];
  navigation: string[];
  actions: string[];
  states: string[];
  items: ExperienceFunctionalCanonItem[];
  extractedAt: string;
};

export type HostExperienceCanon = {
  version: number;
  hostNavigation: string[];
  hostTypography: string[];
  hostColorBehavior: string[];
  hostSpatialBehavior: string[];
  hostMaterialBehavior: string[];
  hostMotionBehavior: string[];
  hostWayfinding: string[];
  hostResponsiveBehavior: string[];
  hostPersistentControls: string[];
  hostAccessibilityRules: string[];
  hostUiTypography: string;
  extractedAt: string;
};

export type ClientExperienceCanonTrait = {
  trait: string;
  provenance: ExperienceProvenance;
  source: string;
};

export type ClientExperienceCanon = {
  version: number;
  traits: ClientExperienceCanonTrait[];
  brandLoreSummary: string | null;
  personalitySummary: string | null;
  expressionContext: string | null;
  appetiteSummary: string | null;
  territorySummary: string | null;
  worldExpressionSummary: string | null;
  experimentalTraitsExcluded: string[];
  extractedAt: string;
};

export type GenericTemplateResemblanceDimension = {
  dimension: string;
  score: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string[];
};

export type GenericTemplateResemblanceAudit = {
  auditedAt: string;
  overallResemblance: 'LOW' | 'MEDIUM' | 'HIGH';
  dimensions: GenericTemplateResemblanceDimension[];
  primaryIssues: string[];
};

export type CurrentExperienceAudit = GenericTemplateResemblanceAudit & {
  /** Structured forensic audit label — not a visual quality score. */
  auditType: 'CURRENT_NDXBOOK_EXPERIENCE_FORENSIC';
};

export type ExperienceConcept = {
  experienceConceptId: string;
  conceptIndex: number;
  name: string;
  centralThesis: string;
  experienceMetaphor: string;
  whyItBelongsToSelectedTerritory: string;
  /** Provenance-safe evidence refs from Experiment E snapshot — not auto-promoted territories. */
  evidenceReferences: string[];
  whyItBelongsInsideSite00: string;
  viewerRole: string;
  projectRelationship: string;
  informationBehavior: string;
  interactionGrammar: string;
  navigationBehavior: string;
  hierarchyBehavior: string;
  spatialBehavior: string;
  compositionBehavior: string;
  hostClientRelationship: string;
  responsivePhilosophy: string;
  motionPhilosophy: string;
  keyExperienceMoments: string[];
  genericTemplateAvoidanceStrategy: string[];
  risks: string[];
  implementationFeasibility: 'HIGH' | 'MEDIUM' | 'LOW';
  functionalPreservationRationale: string;
  founderJudgment: ExperienceConceptJudgment;
  appetiteLineage: string | null;
  formedInIsolation: true;
};

export type ExperienceBible = {
  experienceBibleId: string;
  experienceConceptId: string;
  experienceThesis: string;
  viewerFounderRole: string;
  structuralMetaphor: string;
  informationBehavior: string;
  interactionGrammar: string;
  hierarchyGrammar: string;
  spatialCompositionGrammar: string;
  materialBehavior: string;
  typographyBehavior: {
    hostUiTypography: string;
    clientExpressiveTypography: string;
    environmentalType: string;
    metadataType: string;
    actionType: string;
    statusType: string;
  };
  colorBehavior: {
    hostWayfinding: string;
    clientWorldColor: string;
    statusColor: string;
    attentionColor: string;
    interactiveStateColor: string;
    backgroundEnvironment: string;
  };
  motionBehavior: string;
  responsivePhilosophy: string;
  accessibilityUsability: string[];
  progressiveDisclosure: {
    primaryExperienceRepresentation: string[];
    deepInspectorRepresentation: string[];
  };
  createdAt: string;
};

export type ResponsiveExperienceTranslation = {
  experienceConceptId: string;
  sharedConcept: string;
  mobileBehavior: string;
  desktopBehavior: string;
  preservedRecognitionSignals: string[];
  changedInteractionPatterns: string[];
  changedCompositionLogic: string[];
  whyTranslationStillMatchesConcept: string;
};

export type ExperienceBehaviorTranslation = {
  territoryId: string;
  worldExpressionSystemId: string;
  experienceConceptId: string;
  translations: Array<{
    worldBehavior: string;
    experienceBehavior: string;
    rationale: string;
  }>;
  socialLayoutCopyingBlocked: true;
};

export type ExperienceVisualDevelopmentBrief = {
  briefId: string;
  experienceConceptId: string;
  experienceBibleId: string;
  surfaceType: ExperienceSurfaceType;
  deviceClass: DeviceClass;
  functionalElementsRequired: string[];
  functionalStatesShown: string[];
  environmentBrief: string;
  spatialComposition: string;
  hierarchy: string;
  hostElements: string[];
  clientExpressionElements: string[];
  typographyRoles: string[];
  colorRoles: string[];
  materialRules: string[];
  lightingRules: string[];
  motionImplication: string;
  informationBehaviorShown: string;
  interactionStateShown: string;
  genericTemplateProhibitions: string[];
  hostContaminationProhibitions: string[];
  clientContaminationProhibitions: string[];
  imageModelRole: 'VISUAL_DEVELOPMENT';
  compiledPrompt: string;
  promptHash: string;
};

export type ExperienceVisualDevelopmentAsset = {
  assetId: string;
  assetMedium: 'EXPERIENCE_VISUAL_DEVELOPMENT';
  orgId: string;
  projectId: string;
  brandSlug: string;
  experimentId: string;
  experienceConceptId: string;
  experienceBibleId: string;
  surfaceType: ExperienceSurfaceType;
  deviceClass: DeviceClass;
  selectedConceptTerritoryId: string;
  worldExpressionSystemId: string;
  functionalCanonVersion: number;
  hostCanonVersion: number;
  clientCanonVersion: number;
  intelligenceSnapshotVersion: number;
  promptHash: string;
  provider: string;
  model: string;
  requestId: string | null;
  storagePath: string | null;
  generationCostUsd: number | null;
  founderJudgment: 'LOVE_IT' | 'REVISE' | 'NOT_FOR_ME' | null;
  productionState: string;
  canonStatus: string;
  generatedAt: string | null;
  idempotencyKey: string;
};

export type ExperienceImplementationContractAssetBinding = {
  requirementId: string;
  assetId: string | null;
  assetRole: string;
  assetFamily: string;
  surfaceId: string;
  pageRoute: string | null;
  responsiveVariants: Array<{ deviceClass: DeviceClass; storagePath: string | null }>;
  interactionRelationship: string;
  fallbackBehavior: string;
  productionState: string;
  approved: boolean;
};

export type ExperienceImplementationContract = {
  contractId: string;
  selectedExperienceConceptId: string;
  selectedExperienceBibleId: string;
  selectedConceptTerritoryId: string;
  worldExpressionSystemId: string;
  functionalPreservation: string[];
  hostInvariants: string[];
  clientExpression: string[];
  interactionGrammar: string[];
  informationHierarchy: string[];
  surfaceBehavior: string[];
  responsiveBehavior: string[];
  motionBehavior: string[];
  approvedVisualReferences: string[];
  assetBindings: ExperienceImplementationContractAssetBinding[];
  missingRequiredAssets: string[];
  implementationStatus: 'READY' | 'IMPLEMENTATION_BLOCKED_MISSING_ASSET' | 'NOT_COMPILED';
  antiTemplateConstraints: string[];
  doNotConstraints: string[];
  acceptanceCriteria: string[];
  compiledAt: string;
  /** Approved design proof reference — required before production implementation */
  approvedDesignProofId?: string | null;
  approvedDesignProofVersion?: string | null;
  approvedDesignProofStoragePath?: string | null;
  approvedDesignProofFingerprint?: string | null;
  surfaceArtDirectionId?: string | null;
  assetManifestId?: string | null;
  approvedAssetBindings?: ExperienceImplementationContractAssetBinding[];
  functionalCanonFingerprint?: string | null;
  workspaceCanonFingerprint?: string | null;
  clientExpressionFingerprint?: string | null;
  responsiveIntent?: string | null;
  motionIntent?: string | null;
  doNotConstraintsExtended?: string[];
  implementationBlockers?: string[];
};

export type ExperienceImplementationEvaluation = {
  evaluatedAt: string;
  overallResult: 'PASS' | 'WARN' | 'FAIL' | 'NOT_EVALUATED';
  dimensions: Array<{ dimension: string; result: string; notes: string[] }>;
};

export type ExperienceRevisionDelta = {
  revisionId: string;
  experienceConceptId: string;
  preserve: string[];
  change: string[];
  doNot: string[];
  compiledAt: string;
};

export type ExperienceConceptDistinctivenessReport = {
  result: ExperienceDistinctivenessResult;
  cousinPairs: Array<{ conceptA: string; conceptB: string; overlapFields: string[] }>;
  conceptualCollapse: boolean;
  artificialDiversityUsed: false;
  notes: string[];
};

export type ExperienceExpressionReadiness = {
  state: ExperienceExpressionReadinessState;
  brandLoreReady: boolean;
  brandPersonalityReady: boolean;
  expressionContextReady: boolean;
  appetiteAvailable: boolean;
  appetiteIncluded: boolean;
  /** @deprecated Use crossMediumEvidenceStatus — territory selection is not required. */
  conceptTerritorySelected: boolean;
  worldExpressionAvailable: boolean;
  hostCanonReady: boolean;
  functionalCanonReady: boolean;
  snapshotCompiled: boolean;
  crossMediumEvidenceStatus: 'NONE' | 'MEDIUM_SPECIFIC_ONLY' | 'EXPLICITLY_PROMOTED_AVAILABLE';
  blockers: string[];
};

export type ExperienceExpressionRunStatus =
  | 'NOT_STARTED'
  | 'WAITING_FOR_SNAPSHOT'
  | 'WAITING_FOR_TERRITORY'
  | 'READY_TO_FORM'
  | 'FORMING'
  | 'CONCEPTS_READY'
  | 'GENERATING_VISUALS'
  | 'COMPLETE'
  | 'FAILED';

export type ExperienceExpressionRun = {
  experimentClassification: typeof import('./constants.js').EXPERIMENT_E_CLASSIFICATION;
  runId: string;
  organizationId: string;
  projectId: string;
  methodologyVersion: string;
  intelligenceSnapshotVersion: number;
  status: ExperienceExpressionRunStatus;
  readiness: ExperienceExpressionReadiness;
  experienceTestTerritoryId: string | null;
  experienceTestTerritoryName: string | null;
  selectionPurpose: typeof import('./constants.js').EXPERIENCE_TERRITORY_SELECTION_PURPOSE | null;
  selectedTerritory: CreativeConceptTerritory | null;
  worldExpressionSystem: WorldExpressionSystem | null;
  functionalCanon: ExperienceFunctionalCanon | null;
  hostCanon: HostExperienceCanon | null;
  clientCanon: ClientExperienceCanon | null;
  templateAudit: GenericTemplateResemblanceAudit | null;
  currentExperienceAudit: CurrentExperienceAudit | null;
  experimentSnapshot: import('./experienceExpressionSnapshot.js').ExperimentEIntelligenceSnapshot | null;
  crossMediumEvidence: import('./crossMediumConceptEvidence.js').CrossMediumConceptEvidence[];
  experienceConcepts: ExperienceConcept[];
  experienceBibles: ExperienceBible[];
  responsiveTranslations: ResponsiveExperienceTranslation[];
  behaviorTranslations: ExperienceBehaviorTranslation[];
  distinctiveness: ExperienceConceptDistinctivenessReport | null;
  visualBriefs: ExperienceVisualDevelopmentBrief[];
  visualAssets: ExperienceVisualDevelopmentAsset[];
  productionScope: ProjectProductionScope | null;
  assetDirection: ExperienceAssetDirection | null;
  assetManifest: ExperienceAssetManifest | null;
  assetRequirements: ExperienceAssetRequirement[];
  productionAssets: ExperienceProductionAsset[];
  assetGenerationReceipts: ExperienceAssetGenerationReceipt[];
  assetManifestCompiled: boolean;
  assetGenerationStarted: boolean;
  implementationContract: ExperienceImplementationContract | null;
  formationReady: boolean;
  visualGenerationReady: boolean;
  visualGenerationStarted: boolean;
  accounting: {
    anthropicRequests: number;
    anthropicInputTokens: number;
    anthropicOutputTokens: number;
    gptImage2Requests: number;
    falRequests: number;
    estimatedCostUsd: number;
  };
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
};
