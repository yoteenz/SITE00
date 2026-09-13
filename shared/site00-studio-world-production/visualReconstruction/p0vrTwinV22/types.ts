import type { BUILD_READINESS_STATUSES, CONCEPT_GENERATION_TYPES, P0_VR_TWIN_V22_BUILD } from './constants.js';
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
  visualAsset: string | null;
  visualAssetUrl: string | null;
  creativeDirection: PageCreativeDirection;
  founderInstruction: string | null;
  pageIntentSnapshot: PageIntentModel;
  functionGraphSnapshot: PageFunctionGraph;
  brandContextSnapshot: CreativeBrandContext;
  blueprintGrammarSnapshot: BlueprintGrammar;
  conceptBlueprintId: string;
  assetManifestId: string;
  functionBindingPlanId: string;
  buildReadiness: ConceptBuildReadiness;
  founderJudgment: 'NONE' | 'APPROVED' | 'SHORTLISTED';
  visualAuthorityStatus: 'OPEN' | 'LOCKED_FOR_BUILD';
  status: 'DRAFT' | 'APPROVED' | 'BUILDING' | 'BUILT';
  legacyVersionId: string | null;
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
  responsiveContract: string[];
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
  outliers: string[];
  status: 'PENDING' | 'PARTIAL' | 'PASS';
};

export type ConceptGalleryState = {
  buildRef: typeof P0_VR_TWIN_V22_BUILD;
  candidates: ConceptCandidate[];
  activeConceptId: string | null;
  blueprints: Record<string, ConceptBlueprint>;
  manifests: Record<string, ConceptAssetManifest>;
  bindingPlans: Record<string, ConceptFunctionBindingPlan>;
  reconciliations: Record<string, ConceptBlueprintReconciliation>;
  packages: Record<string, ExecutableConceptPackage>;
  fidelityReceipts: Record<string, ConceptBuildFidelityReceipt>;
};
