/** P0.VR.TWINV3.0R6 — locked authority → implementation package types */

import type { DesignWorkspaceViewport } from '../designWorkspaceAuthorityTypes.js';

export type DerivationRunStatus = 'QUEUED' | 'DERIVING' | 'BLOCKED' | 'FAILED' | 'COMPLETE';

export type DesignWorkspaceDerivationRun = {
  id: string;
  projectId: string;
  workspaceType: 'DESIGN_PAGE_V3';
  authorityPairId: string;
  authorityPairVersion: number;
  pairChecksum: string;
  mobileAuthorityId: string;
  mobileAuthorityHash: string;
  desktopAuthorityId: string;
  desktopAuthorityHash: string;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  executionIntent: 'TRANSLATION';
  inventionBudget: 'NONE';
  status: DerivationRunStatus;
  startedAt: string;
  completedAt: string | null;
  derivativeArtifactIds: string[];
  readinessReceiptId: string | null;
  implementationPackageId: string | null;
  errorCodes: string[];
  version: number;
  idempotencyKey: string;
  providerDispatches: ProviderDerivationDispatch[];
  falJobsDispatched: number;
};

export type ProviderDerivationDispatch = {
  id: string;
  provider: 'NONE' | 'FAL' | 'LOCAL_COMPILER';
  model: string;
  derivativeType: string;
  purpose: string;
  inputAuthorityIds: string[];
  inputHashes: string[];
  status: 'SKIPPED' | 'PREFLIGHT_PASS' | 'DISPATCHED' | 'COMPLETE';
};

export type BlueprintRegion = {
  regionId: string;
  viewport: DesignWorkspaceViewport;
  semanticRole: string;
  parentRegionId: string | null;
  ownership: 'SITE_00_HOST' | 'ACTIVE_PROJECT' | 'SHARED_CONTRACT' | 'SYSTEM_STATE';
  x: number;
  y: number;
  w: number;
  h: number;
  scrollBehavior: 'SCROLL' | 'FIXED' | 'STICKY' | 'CONTEXTUAL';
  zIndex: number;
};

export type DesignWorkspaceStructuralBlueprint = {
  id: string;
  authorityPairId: string;
  mobileAuthorityId: string;
  desktopAuthorityId: string;
  mobileAuthorityHash: string;
  desktopAuthorityHash: string;
  rootFrame: { mobile: { w: number; h: number }; desktop: { w: number; h: number } };
  regions: BlueprintRegion[];
  version: number;
};

export type SurgicalObjectCategory =
  | 'TEXT'
  | 'BUTTON'
  | 'ICON'
  | 'IMAGE'
  | 'SURFACE'
  | 'BORDER'
  | 'BADGE'
  | 'STATUS'
  | 'TAB'
  | 'NAV_ITEM'
  | 'THUMBNAIL'
  | 'PROGRESS'
  | 'PANEL'
  | 'ARTIFACT'
  | 'CONTROL';

export type SurgicalBlueprintObject = {
  objectId: string;
  viewport: DesignWorkspaceViewport;
  parentObjectId: string | null;
  regionId: string;
  category: SurgicalObjectCategory;
  semanticRole: string;
  featureId: string | null;
  ownership: 'SITE_00_HOST' | 'ACTIVE_PROJECT' | 'SHARED_CONTRACT' | 'SYSTEM_STATE';
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  visibleText: string | null;
  interactionIntent: string | null;
  fidelityImportance: 'HIGH' | 'MEDIUM' | 'LOW';
  implementationPrimitive: string;
};

export type BlueprintRelationshipType =
  | 'alignedWith'
  | 'baselineWith'
  | 'gapTo'
  | 'anchoredTo'
  | 'contains'
  | 'overlaps'
  | 'stacksWith'
  | 'flowsAfter'
  | 'fixedTo'
  | 'stickyWithin'
  | 'dominates'
  | 'reveals'
  | 'collapsesInto';

export type BlueprintRelationship = {
  id: string;
  type: BlueprintRelationshipType;
  fromObjectId: string;
  toObjectId: string;
  viewport: DesignWorkspaceViewport;
};

export type SurgicalObjectMap = {
  id: string;
  authorityPairId: string;
  objects: SurgicalBlueprintObject[];
  relationships: BlueprintRelationship[];
  version: number;
};

export type FeatureVisualResolution =
  | 'VISIBLE_DIRECTLY'
  | 'VISIBLE_CONTEXTUALLY'
  | 'NAVIGATION_ACCESS'
  | 'DRAWER_ACCESS'
  | 'BOTTOM_SHEET_ACCESS'
  | 'SECONDARY_STATE'
  | 'NOT_VISUALLY_PRESENT_BUT_STRUCTURALLY_SUPPORTED'
  | 'TRANSLATION_GAP';

export type CompletedMasterFeatureBinding = {
  id: string;
  featureId: string;
  resolution: FeatureVisualResolution;
  regionId: string;
  objectIds: string[];
  mobilePresentation: string;
  desktopPresentation: string;
  structuralBindingState: 'BOUND' | 'STRUCTURALLY_SUPPORTED' | 'BLOCKED_WITH_GAP';
  gapCode: string | null;
};

export type CanonicalAssetEntry = {
  assetObjectId: string;
  viewport: DesignWorkspaceViewport;
  artifactType: string;
  assetSource: 'PROJECT_CANONICAL' | 'HOST_ICON' | 'GENERATION_CONTRACT' | 'NONE';
  authorityCropForbidden: true;
  runtimeRequirement: 'IMAGE' | 'SVG' | 'NONE';
  gapCode: string | null;
};

export type CanonicalAssetManifest = {
  id: string;
  authorityPairId: string;
  assets: CanonicalAssetEntry[];
  version: number;
};

export type FunctionBindingStatus = 'BOUND' | 'PARTIAL' | 'MISSING' | 'NOT_APPLICABLE' | 'UNKNOWN';

export type FunctionBindingEntry = {
  objectId: string;
  featureId: string;
  functionTarget: string;
  status: FunctionBindingStatus;
};

export type FunctionBindingMap = {
  id: string;
  authorityPairId: string;
  bindings: FunctionBindingEntry[];
  version: number;
};

export type HostProjectOwnershipMap = {
  id: string;
  authorityPairId: string;
  entries: { targetId: string; targetKind: 'REGION' | 'OBJECT'; ownership: BlueprintRegion['ownership'] }[];
  version: number;
};

export type ResponsiveRelationshipEntry = {
  featureOrRegionKey: string;
  mobileExpression: string;
  desktopExpression: string;
  sharedIdentity: string;
  interpolationRule: string;
};

export type ResponsiveRelationshipContract = {
  id: string;
  authorityPairId: string;
  siblingAuthorities: true;
  entries: ResponsiveRelationshipEntry[];
  version: number;
};

export type TypographyStyleEntry = {
  role: string;
  ownership: 'SITE_00_HOST' | 'ACTIVE_PROJECT';
  fontFamily: string;
  weight: number;
  sizePx: number;
  casing: 'UPPERCASE' | 'MIXED' | 'LOWERCASE';
};

export type TypographyFidelityContract = {
  id: string;
  authorityPairId: string;
  styles: TypographyStyleEntry[];
  version: number;
};

export type StateVisualEntry = {
  state: string;
  visualTreatment: string;
  numericValue: number | 'UNKNOWN';
};

export type StateVisualContract = {
  id: string;
  authorityPairId: string;
  states: StateVisualEntry[];
  version: number;
};

export type InteractionGeometryEntry = {
  objectId: string;
  hitboxW: number;
  hitboxH: number;
  minTouchTargetPx: number;
  a11yName: string;
};

export type InteractionGeometryContract = {
  id: string;
  authorityPairId: string;
  entries: InteractionGeometryEntry[];
  version: number;
};

export type ImplementationPrimitiveEntry = {
  objectId: string;
  primitive: string;
  forbidden: string[];
};

export type ImplementationPrimitiveContract = {
  id: string;
  authorityPairId: string;
  entries: ImplementationPrimitiveEntry[];
  authorityRasterFirewall: true;
  version: number;
};

export type ReverseTraceabilityEntry = {
  featureId: string;
  masterRegionId: string;
  blueprintObjectId: string;
  implementationPrimitive: string;
  functionBindingStatus: FunctionBindingStatus;
};

export type ReverseTraceabilityMap = {
  id: string;
  authorityPairId: string;
  traces: ReverseTraceabilityEntry[];
  version: number;
};

export type CompilerReadinessCheck = {
  gate: string;
  result: 'PASS' | 'FAIL' | 'BLOCKED';
  detail: string;
};

export type CompilerReadinessReceipt = {
  id: string;
  authorityPairId: string;
  derivationRunId: string;
  checks: CompilerReadinessCheck[];
  overall: 'PASS' | 'BLOCKED' | 'READY_WITH_BLOCKERS';
  blockers: string[];
  generatedAt: string;
};

export type ImplementationPackageStatus = 'INCOMPLETE' | 'BLOCKED' | 'READY_FOR_REVIEW' | 'APPROVED_FOR_BUILD' | 'FEATURE_STALE';

export type DesignWorkspaceImplementationPackage = {
  id: string;
  derivationRunId: string;
  authorityPairId: string;
  pairChecksum: string;
  structuralBlueprintId: string;
  surgicalObjectMapId: string;
  masterFeatureBindingIds: string[];
  canonicalAssetManifestId: string;
  functionBindingMapId: string;
  hostProjectOwnershipMapId: string;
  responsiveRelationshipContractId: string;
  typographyFidelityContractId: string;
  stateVisualContractId: string;
  interactionGeometryContractId: string;
  implementationPrimitiveContractId: string;
  reverseTraceabilityMapId: string;
  compilerReadinessReceiptId: string;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  executionIntent: 'TRANSLATION';
  inventionBudget: 'NONE';
  packageChecksum: string;
  status: ImplementationPackageStatus;
  version: number;
  createdAt: string;
};

export type DesignWorkspaceDerivationArtifactBundle = {
  structuralBlueprint: DesignWorkspaceStructuralBlueprint;
  surgicalObjectMap: SurgicalObjectMap;
  featureBindings: CompletedMasterFeatureBinding[];
  canonicalAssetManifest: CanonicalAssetManifest;
  functionBindingMap: FunctionBindingMap;
  hostProjectOwnershipMap: HostProjectOwnershipMap;
  responsiveRelationshipContract: ResponsiveRelationshipContract;
  typographyFidelityContract: TypographyFidelityContract;
  stateVisualContract: StateVisualContract;
  interactionGeometryContract: InteractionGeometryContract;
  implementationPrimitiveContract: ImplementationPrimitiveContract;
  reverseTraceabilityMap: ReverseTraceabilityMap;
  compilerReadinessReceipt: CompilerReadinessReceipt;
  implementationPackage: DesignWorkspaceImplementationPackage;
};

export type DesignWorkspaceDerivationState = {
  runs: DesignWorkspaceDerivationRun[];
  activeRunId: string | null;
  packages: DesignWorkspaceImplementationPackage[];
  latestPackageId: string | null;
  artifactsById: Record<string, unknown>;
};
