import type {
  CONCEPT_OBJECT_SOURCE_TYPES,
  CONCEPT_VISUAL_OBJECT_TYPES,
  PAIRED_CONCEPT_STATUSES,
  P0_VR_TWIN_V25_BUILD,
} from './constants.js';

export type ConceptObjectSourceType = (typeof CONCEPT_OBJECT_SOURCE_TYPES)[number];
export type ConceptVisualObjectType = (typeof CONCEPT_VISUAL_OBJECT_TYPES)[number];
export type PairedConceptStatus = (typeof PAIRED_CONCEPT_STATUSES)[number];

export type CompositionPlan = {
  compositionPlanId: string;
  conceptId: string;
  versionId: string;
  pageBands: string[];
  columns: number;
  objects: string[];
  visualHierarchy: string[];
  typographyStrategy: string;
  colorStrategy: string;
  assetStrategy: string;
  interactionStrategy: string;
  responsiveStrategy: string;
  hostBoundary: string;
  createdAt: string;
};

export type ConceptVisualObject = {
  objectId: string;
  parentId: string | null;
  role: string;
  type: ConceptVisualObjectType;
  semanticRole: string;
  renderPrimitive: 'DOM' | 'CSS' | 'SVG' | 'MEDIA';
  sourceType: ConceptObjectSourceType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  textContent: string | null;
  fontFamily: string | null;
  fontRole: string | null;
  fontSize: number | null;
  fontWeight: string | null;
  lineHeight: number | null;
  letterSpacing: number | null;
  textTransform: string | null;
  textAlign: string | null;
  lineBreaks: string[];
  color: string | null;
  background: string | null;
  border: string | null;
  borderWidth: number | null;
  borderRadius: number | null;
  opacity: number;
  assetSlotId: string | null;
  canonicalAssetId: string | null;
  objectFit: string | null;
  objectPosition: string | null;
  crop: string | null;
  interactionRole: string | null;
  functionBindingTarget: string | null;
  ownership: 'CLIENT' | 'HOST';
  status: 'PLANNED' | 'RECONCILED' | 'LOCKED';
};

export type ConceptVisualBlueprint = {
  blueprintId: string;
  conceptId: string;
  versionId: string;
  viewport: 'mobile';
  canvas: { width: number; height: number };
  bands: { bandId: string; label: string; y: number; h: number }[];
  objects: ConceptVisualObject[];
  grid: { columns: number; gutter: number; margin: number };
  typographyTokens: { role: string; family: string; size: number; weight: string }[];
  colorTokens: { role: string; value: string }[];
  surfaceTokens: string[];
  borderTokens: string[];
  assetSlots: string[];
  zLayers: { layer: number; objectIds: string[] }[];
  alignmentRules: string[];
  responsiveRules: string[];
  hostBoundary: string;
  status: 'DRAFT' | 'RECONCILED' | 'LOCKED';
  createdAt: string;
};

export type ConceptAssetPlanSlot = {
  assetSlotId: string;
  blueprintObjectId: string;
  role: string;
  assetType: string;
  visualDescription: string;
  sourceType: ConceptObjectSourceType;
  sourceStrategy: string;
  existingAssetId: string | null;
  generationRequired: boolean;
  transparentBackground: boolean;
  expectedWidth: number;
  expectedHeight: number;
  cropBehavior: string;
  fit: string;
  position: string;
  status: 'PLANNED' | 'RESOLVED' | 'FAILED';
};

export type ConceptAssetPlan = {
  conceptId: string;
  versionId: string;
  assetSlots: ConceptAssetPlanSlot[];
  status: 'DRAFT' | 'READY';
  createdAt: string;
};

export type ConceptFunctionTargetPlan = {
  bindingPlanId: string;
  conceptId: string;
  versionId: string;
  targets: { objectId: string; functionKey: string; liveFunction: string }[];
  status: 'DRAFT' | 'COMPLETE';
  createdAt: string;
};

export type ConceptGeneratedAsset = {
  assetId: string;
  conceptId: string;
  versionId: string;
  blueprintObjectId: string;
  assetSlotId: string;
  role: string;
  assetType: string;
  sourceMode: string;
  sourceVisualId: string;
  transparentBackground: boolean;
  canonicalFile: string;
  storageUrl: string;
  width: number;
  height: number;
  cropBounds: string | null;
  status: 'REGISTERED' | 'PENDING';
  createdAt: string;
};

export type ConceptAssetPurityReceipt = {
  assetId: string;
  blueprintObjectId: string;
  backgroundTransparent: boolean;
  uiContamination: boolean;
  neighborContamination: boolean;
  edgeQuality: 'PASS' | 'WARN';
  canonicalStored: boolean;
  status: 'PASS' | 'FAIL';
};

export type VisualBlueprintReconciliation = {
  reconciliationId: string;
  conceptId: string;
  versionId: string;
  objectsFound: string[];
  objectsMissing: string[];
  objectsMoved: string[];
  objectsResized: string[];
  typographyChanges: string[];
  assetChanges: string[];
  newObjects: string[];
  removedObjects: string[];
  styleChanges: string[];
  status: 'PASS' | 'RECONCILIATION_REQUIRED';
};

export type ReconciledConceptVisualBlueprint = ConceptVisualBlueprint & {
  reconciledFromBlueprintId: string;
  reconciliationId: string;
  reconciledAt: string;
};

export type BlueprintVisualCoverageReceipt = {
  conceptId: string;
  plannedObjectCount: number;
  detectedObjectCount: number;
  matchedObjectCount: number;
  missingObjectCount: number;
  newObjectCount: number;
  coveragePercent: number;
  status: 'PASS' | 'FAIL';
};

export type AssetCoverageReceipt = {
  conceptId: string;
  requiredAssetCount: number;
  resolvedAssetCount: number;
  canonicalStoredCount: number;
  transparentAssetCount: number;
  unresolvedAssetCount: number;
  coveragePercent: number;
  status: 'PASS' | 'FAIL';
};

export type PairedConceptArtifact = {
  conceptId: string;
  versionId: string;
  sessionId: string;
  projectId: string;
  pageId: string;
  viewport: 'mobile';
  creativeDirectionId: string;
  compositionPlanId: string;
  visualAssetId: string | null;
  conceptVisualBlueprintId: string;
  reconciliationReceiptId: string | null;
  assetManifestId: string;
  functionBindingPlanId: string;
  status: PairedConceptStatus;
  conceptOrigin: 'DUAL_OUTPUT_PAIRED' | 'LEGACY_IMAGE_FIRST';
  createdAt: string;
  updatedAt: string;
};

export type PendingDualOutputGeneration = {
  buildRef: typeof P0_VR_TWIN_V25_BUILD;
  conceptId: string;
  versionId: string;
  generationType: 'INITIAL' | 'REGENERATED' | 'REFINED';
  parentConceptId: string | null;
  founderInstruction: string | null;
  paired: PairedConceptArtifact;
  compositionPlan: CompositionPlan;
  visualBlueprint: ConceptVisualBlueprint;
  assetPlan: ConceptAssetPlan;
  functionTargetPlan: ConceptFunctionTargetPlan;
  visualGenerationInstruction: string;
  startedAt: string;
};

export type BlueprintObjectCodeBinding = {
  objectId: string;
  renderPrimitive: string;
  component: string;
  selector: string;
  sourceFile: string;
  styleSource: string;
  assetSlot: string | null;
  canonicalAssetId: string | null;
  functionBinding: string | null;
  status: 'BOUND' | 'UNBOUND';
};

export type RasterIndependenceReceipt = {
  conceptId: string;
  uiStructureVisibleWithoutRaster: boolean;
  textVisibleWithoutRaster: boolean;
  navVisibleWithoutRaster: boolean;
  progressVisibleWithoutRaster: boolean;
  metricsVisibleWithoutRaster: boolean;
  activityVisibleWithoutRaster: boolean;
  status: 'PASS' | 'FAIL';
};

export type BlueprintObjectFidelityReceipt = {
  objectId: string;
  geometryStatus: 'PENDING' | 'PASS' | 'FAIL';
  styleStatus: 'PENDING' | 'PASS' | 'FAIL';
  assetStatus: 'PENDING' | 'PASS' | 'FAIL';
};
