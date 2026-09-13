import type { BUILD_READINESS_STATUSES, CONCEPT_GENERATION_TYPES, P0_VR_TWIN_V22_BUILD } from './constants.js';
import type {
  GeneratedHostArtifact,
  HostShellCompositePreview,
  HostShellContract,
  OwnershipResolutionReceipt,
  TwinV2CanvasBoundary,
} from '../p0vrTwinV22R2/types.js';
import type { HostBoundarySanitizationReceipt } from '../p0vrTwinV22R2/buildHostBoundarySanitizationReceipt.js';
import type { ClientCanvasBoundary } from '../p0vrTwinV22R2/computeClientCanvasBoundary.js';
import type { ClientCanvasTrimReceipt } from '../p0vrTwinV22R2/buildClientCanvasTrimReceipt.js';
import type { ClientCanvasTopReceipt } from '../p0vrTwinV22R2/buildClientCanvasTopReceipt.js';
import type { VisualOwnership } from '../p0vrTwinV22R2/types.js';
import type {
  BlueprintGrammar,
  CreativeBrandContext,
  PageCreativeDirection,
  PageFunctionGraph,
  PageIntentModel,
} from '../p0vrTwinV21/types.js';

export type ConceptGenerationType = (typeof CONCEPT_GENERATION_TYPES)[number];
export type ConceptBuildReadinessStatus = (typeof BUILD_READINESS_STATUSES)[number];

export type ConceptBuildReadiness = {
  visualReady: boolean;
  blueprintReady: boolean;
  assetsReady: boolean;
  functionsReady: boolean;
  shellReady: boolean;
  hostBoundaryReady: boolean;
  responsiveReady: boolean;
  unresolved: string[];
  status: ConceptBuildReadinessStatus;
};

export type ConceptBlueprintObject = {
  objectId: string;
  parentId: string | null;
  role: string;
  type: 'text' | 'image' | 'surface' | 'divider' | 'nav' | 'metric' | 'shell';
  bounds: { x: number; y: number; w: number; h: number };
  textRole: string | null;
  assetRole: string | null;
  surface: string | null;
  color: string | null;
  typography: string | null;
  border: string | null;
  zLayer: number;
  interactionRole: string | null;
  ownership?: VisualOwnership;
  ownershipNote?: string | null;
  isGeneratedHostArtifact?: boolean;
};

export type ConceptBlueprint = {
  blueprintId: string;
  conceptId: string;
  pageStructure: string;
  sections: { id: string; label: string; bounds: { x: number; y: number; w: number; h: number } }[];
  objects: ConceptBlueprintObject[];
  grid: { columns: number; gutterNorm: number; marginNorm: number };
  typography: {
    familyClass: string;
    roles: { role: string; sizeNorm: number; weight: string; case: string }[];
  };
  colors: { background: string[]; lime: string[]; surfaces: string[]; dividers: string[] };
  surfaces: string[];
  dividers: string[];
  assetSlots: string[];
  overlaps: { above: string; below: string }[];
  zLayers: { layer: number; objectIds: string[] }[];
  responsiveRelationships: string[];
  interactionRegions: { regionId: string; role: string }[];
  shellRelationship: string;
  sanitizedFromBlueprintId?: string | null;
  createdAt: string;
  status: 'DRAFT' | 'RECONCILED' | 'LOCKED';
};

export type ConceptBlueprintReconciliation = {
  reconciliationId: string;
  conceptId: string;
  retainedDecisions: string[];
  changedDecisions: string[];
  unexpectedAdditions: string[];
  missingPlannedObjects: string[];
  actualGeneratedGeometry: string;
  winner: 'GENERATED_VISUAL';
};

export type ConceptAssetSlot = {
  slotId: string;
  objectId: string;
  role: string;
  assetType: string;
  visualDescription: string;
  sourceStrategy:
    | 'EXISTING_PROJECT_ASSET'
    | 'EXISTING_LIBRARY_ASSET'
    | 'GENERATED_CONCEPT_ASSET'
    | 'CONCEPT_REGION_DERIVATION'
    | 'NEW_GENERATED_ASSET'
    | 'PROCEDURAL_DOM_GRAPHIC';
  sourceAsset: string | null;
  derivedAsset: string | null;
  generationRequired: boolean;
  crop: string | null;
  fit: string;
  position: string;
  resolution: string;
  status: 'RESOLVED' | 'PENDING_DERIVATION' | 'PENDING_GENERATION';
};

export type ConceptAssetManifest = {
  manifestId: string;
  conceptId: string;
  slots: ConceptAssetSlot[];
  createdAt: string;
  status: 'DRAFT' | 'READY';
};

export type ConceptFunctionBinding = {
  bindingId: string;
  visualRegion: string;
  liveFunction: string;
  functionKey: string;
  status: 'BOUND' | 'DEFERRED';
  deferredReason: string | null;
};

export type ConceptFunctionBindingPlan = {
  bindingPlanId: string;
  conceptId: string;
  bindings: ConceptFunctionBinding[];
  requiredFunctions: string[];
  unboundFunctions: string[];
  requiredFunctionCoverage: number;
  status: 'DRAFT' | 'COMPLETE' | 'PARTIAL';
  createdAt: string;
};

export type ConceptCandidate = {
  conceptId: string;
  sessionId: string;
  projectId: string;
  pageId: string;
  viewport: 'mobile';
  versionNumber: number;
  parentConceptId: string | null;
  generationType: ConceptGenerationType;
  /** P0.VR.TWINV2.5 — dual-output vs legacy image-first backfill. */
  conceptOrigin?: 'DUAL_OUTPUT_PAIRED' | 'LEGACY_IMAGE_FIRST';
  pairedConceptStatus?: string | null;
  visualAsset: string | null;
  visualAssetUrl: string | null;
  creativeDirection: PageCreativeDirection;
  founderInstruction: string | null;
  pageIntentSnapshot: PageIntentModel;
  functionGraphSnapshot: PageFunctionGraph;
  brandContextSnapshot: CreativeBrandContext;
  blueprintGrammarSnapshot: BlueprintGrammar;
  conceptBlueprintId: string;
  /** Raw generated composition blueprint (audit). */
  originalBlueprintId?: string | null;
  /** Host-sanitized blueprint used for build + founder execution view. */
  executionBlueprintId?: string | null;
  assetManifestId: string;
  functionBindingPlanId: string;
  buildReadiness: ConceptBuildReadiness;
  founderJudgment: 'NONE' | 'APPROVED' | 'SHORTLISTED';
  visualAuthorityStatus: 'OPEN' | 'LOCKED_FOR_BUILD';
  status: 'DRAFT' | 'APPROVED' | 'BUILDING' | 'BUILT';
  legacyVersionId: string | null;
  providerGenerationId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExecutableConceptPackage = {
  packageId: string;
  conceptId: string;
  visualAuthority: { imageUrl: string | null; imageStorageRef: string | null; lockedAt: string };
  blueprint: ConceptBlueprint;
  assetManifest: ConceptAssetManifest;
  functionBindingPlan: ConceptFunctionBindingPlan;
  shellContract: string[];
  hostShellContract?: HostShellContract;
  responsiveContract: string[];
  /** Supporting context only — must not override approved visual package. */
  pageIntentSnapshot?: PageIntentModel;
  functionGraphSnapshot?: PageFunctionGraph;
  status: 'READY' | 'BUILDING' | 'BUILT';
  createdAt: string;
};

export type ConceptBuildFidelityReceipt = {
  conceptId: string;
  twinId: string;
  visualAuthorityId: string;
  blueprintObjectCount: number;
  renderedObjectCount: number;
  geometryMatch: number | null;
  typographyMatch: number | null;
  assetMatch: number | null;
  colorMatch: number | null;
  functionCoverage: number | null;
  hostBoundaryMatch?: boolean | null;
  outliers: string[];
  status: 'PENDING' | 'PARTIAL' | 'PASS';
};

export type BackfillReceipt = {
  projectId: string;
  pageId: string;
  viewport: 'mobile';
  discoverableGenerationCount: number;
  backfilledCount: number;
  dedupedCount: number;
  failedCount: number;
  failedIds: string[];
  canonicalConceptCount: number;
  status: 'COMPLETE' | 'PARTIAL' | 'FAILED' | 'NO_DISCOVERABLE_GENERATIONS';
  searchedSessionIds: string[];
};

export type GalleryHydrationReceipt = {
  queryCount: number;
  activeConceptId: string | null;
  renderedConceptCount: number;
  emptyStateShown: boolean;
  backfillTriggered: boolean;
  status: 'HYDRATED' | 'EMPTY';
};

export type ConceptGalleryState = {
  buildRef: typeof P0_VR_TWIN_V22_BUILD;
  candidates: ConceptCandidate[];
  activeConceptId: string | null;
  lastActiveConceptId?: string | null;
  pendingDualOutput?:
    | import('../p0vrTwinV25/types.js').PendingDualOutputGeneration
    | import('../p0vrTwinV27/types.js').PendingParallelTwinGeneration
    | null;
  pairedArtifacts?: Record<string, import('../p0vrTwinV25/types.js').PairedConceptArtifact>;
  compositionPlans?: Record<string, import('../p0vrTwinV25/types.js').CompositionPlan>;
  visualBlueprints?: Record<string, import('../p0vrTwinV25/types.js').ConceptVisualBlueprint>;
  reconciledVisualBlueprints?: Record<string, import('../p0vrTwinV25/types.js').ReconciledConceptVisualBlueprint>;
  assetPlans?: Record<string, import('../p0vrTwinV25/types.js').ConceptAssetPlan>;
  functionTargetPlans?: Record<string, import('../p0vrTwinV25/types.js').ConceptFunctionTargetPlan>;
  generatedConceptAssets?: Record<string, import('../p0vrTwinV25/types.js').ConceptGeneratedAsset[]>;
  assetPurityReceipts?: Record<string, import('../p0vrTwinV25/types.js').ConceptAssetPurityReceipt>;
  visualBlueprintReconciliations?: Record<string, import('../p0vrTwinV25/types.js').VisualBlueprintReconciliation>;
  blueprintVisualCoverage?: Record<string, import('../p0vrTwinV25/types.js').BlueprintVisualCoverageReceipt>;
  assetCoverage?: Record<string, import('../p0vrTwinV25/types.js').AssetCoverageReceipt>;
  designCompilerBundles?: Record<string, import('../p0vrTwinV26/types.js').DesignCompilerBundle>;
  blueprints: Record<string, ConceptBlueprint>;
  manifests: Record<string, ConceptAssetManifest>;
  bindingPlans: Record<string, ConceptFunctionBindingPlan>;
  reconciliations: Record<string, ConceptBlueprintReconciliation>;
  packages: Record<string, ExecutableConceptPackage>;
  fidelityReceipts: Record<string, ConceptBuildFidelityReceipt>;
  sanitizedBlueprints: Record<string, ConceptBlueprint>;
  generatedHostArtifacts: Record<string, GeneratedHostArtifact[]>;
  ownershipReceipts: Record<string, OwnershipResolutionReceipt>;
  canvasBoundaries: Record<string, TwinV2CanvasBoundary>;
  hostShellContracts: Record<string, HostShellContract>;
  compositePreviews: Record<string, HostShellCompositePreview>;
  hostBoundarySanitizationReceipts?: Record<string, HostBoundarySanitizationReceipt>;
  clientCanvasBoundaries?: Record<string, ClientCanvasBoundary>;
  clientCanvasTrimReceipts?: Record<string, ClientCanvasTrimReceipt>;
  clientCanvasTopReceipts?: Record<string, ClientCanvasTopReceipt>;
  backfillReceipt?: BackfillReceipt;
  galleryHydrationReceipt?: GalleryHydrationReceipt;
  compositionStates?: Record<string, import('../p0vrTwinV27/types.js').ConceptCompositionState>;
  surgicalBlueprintTwins?: Record<string, import('../p0vrTwinV27/types.js').SurgicalBlueprintTwin>;
  assetGenerationContractSets?: Record<string, import('../p0vrTwinV27/types.js').AssetGenerationContractSet>;
  authorityVisuals?: Record<string, import('../p0vrTwinV27/types.js').AuthorityVisualRecord>;
  twinReconciliationReceipts?: Record<string, import('../p0vrTwinV27/types.js').TwinReconciliationReceipt>;
  canonicalAssetManifestsV27?: Record<string, import('../p0vrTwinV27/types.js').CanonicalAssetManifest>;
  blueprintTranslationReceipts?: Record<string, import('../p0vrTwinV27/types.js').BlueprintTranslationReceipt>;
  runtimeIndependenceReceipts?: Record<string, import('../p0vrTwinV27/types.js').RuntimeIndependenceReceipt>;
  twinFidelityReceipts?: Record<string, import('../p0vrTwinV27/types.js').TwinFidelityReceipt>;
  surgicalBlueprintCodeBindings?: Record<string, import('../p0vrTwinV27/types.js').BlueprintObjectCodeBinding[]>;
  falParallelTwinProofs?: Record<string, import('../p0vrTwinV28/types.js').FalParallelTwinProofBundle>;
  atomicGenerationBundles?: Record<string, import('../p0vrTwinV29/types.js').AtomicCreativeGenerationResult>;
};
