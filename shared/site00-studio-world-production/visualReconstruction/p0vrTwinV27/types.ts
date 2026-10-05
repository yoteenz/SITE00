import type {
  ASSET_TYPES_V27,
  BLUEPRINT_RELATIONSHIP_TYPES,
  DATA_VISUAL_STATES,
  P0_VR_TWIN_V27_BUILD,
  RESPONSIVE_RULES,
} from './constants.js';
import type { PendingDualOutputGeneration } from '../p0vrTwinV25/types.js';

export type BlueprintRelationshipType = (typeof BLUEPRINT_RELATIONSHIP_TYPES)[number];
export type AssetTypeV27 = (typeof ASSET_TYPES_V27)[number];
export type DataVisualState = (typeof DATA_VISUAL_STATES)[number];
export type ResponsiveRule = (typeof RESPONSIVE_RULES)[number];

export type CompositionObjectRef = {
  objectId: string;
  role: string;
  semanticRole: string;
  functionalRole: string | null;
  assetSlotId: string | null;
};

export type CompositionRelationshipRef = {
  relationshipId: string;
  sourceObjectId: string;
  targetObjectId: string;
  type: BlueprintRelationshipType;
};

export type ConceptCompositionState = {
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  projectId: string;
  pageId: string;
  viewport: 'mobile';
  hostBoundary: string;
  creativeDirection: string;
  requiredFunctionalRoles: string[];
  compositionObjects: CompositionObjectRef[];
  compositionRelationships: CompositionRelationshipRef[];
  typographyIntent: string;
  colorIntent: string;
  surfaceIntent: string;
  assetIntent: string[];
  interactionIntent: string[];
  responsiveIntent: string[];
  createdAt: string;
  status: 'DRAFT' | 'PARALLEL_READY' | 'RECONCILED' | 'LOCKED';
};

export type SurgicalBlueprintObject = {
  objectId: string;
  parentId: string | null;
  role: string;
  semanticRole: string;
  type: string;
  renderPrimitive: 'DOM' | 'CSS' | 'SVG' | 'MEDIA';
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  gap: number;
  zIndex: number;
  opacity: number;
  textContent: string | null;
  fontAssetId: string | null;
  fontFamily: string | null;
  fontRole: string | null;
  fontSize: number | null;
  fontWeight: string | null;
  fontStyle: string | null;
  lineHeight: number | null;
  letterSpacing: number | null;
  textTransform: string | null;
  textAlign: string | null;
  lineBreaks: string[];
  lineCount: number | null;
  maxWidth: number | null;
  overflowBehavior: string | null;
  color: string | null;
  background: string | null;
  gradient: string | null;
  borderColor: string | null;
  borderWidth: number | null;
  borderStyle: string | null;
  borderRadius: number | null;
  dividerThickness: number | null;
  dividerLength: number | null;
  iconGeometry: string | null;
  svgPathRef: string | null;
  assetSlotId: string | null;
  canonicalAssetId: string | null;
  assetVersionId: string | null;
  assetGenerationContractId: string | null;
  objectFit: string | null;
  objectPosition: string | null;
  cropWindow: string | null;
  alphaExpected: boolean;
  interactionRole: string | null;
  functionBindingTarget: string | null;
  route: string | null;
  action: string | null;
  stateContractId: string | null;
  responsiveContractId: string | null;
  ownership: 'CLIENT' | 'HOST';
  visualImportance: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  fidelityTolerance: number;
  dataVisualState: DataVisualState;
  status: 'PLANNED' | 'RECONCILED' | 'LOCKED';
};

export type BlueprintRelationship = {
  relationshipId: string;
  sourceObjectId: string;
  targetObjectId: string;
  type: BlueprintRelationshipType;
  value: number | null;
  unit: 'px' | 'ratio' | null;
  tolerance: number;
  priority: number;
};

export type SurgicalBlueprintTwin = {
  blueprintTwinId: string;
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  viewport: 'mobile';
  canvas: { width: number; height: number };
  objects: SurgicalBlueprintObject[];
  relationships: BlueprintRelationship[];
  typographyTokens: { role: string; family: string; size: number; weight: string }[];
  colorTokens: { role: string; value: string }[];
  surfaceTokens: string[];
  assetBindings: { objectId: string; assetSlotId: string | null; canonicalAssetId: string | null }[];
  functionBindings: { objectId: string; functionKey: string }[];
  stateContracts: string[];
  responsiveContracts: string[];
  ownershipContracts: string[];
  status: 'DRAFT' | 'RECONCILED' | 'LOCKED';
  createdAt: string;
};

export type AuthorityVisualRecord = {
  authorityVisualId: string;
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  imageUrl: string | null;
  status: 'PLANNED' | 'RENDERED' | 'RECONCILED';
  createdAt: string;
};

export type AssetGenerationContract = {
  assetGenerationContractId: string;
  conceptId: string;
  conceptVersionId: string;
  compositionStateId: string;
  objectId: string;
  assetSlotId: string;
  canonicalAssetId: string | null;
  assetVersionId: string | null;
  role: string;
  assetType: AssetTypeV27;
  generationProvider: string;
  generationModel: string;
  generationModelVersion: string;
  normalizedGenerationInstruction: string;
  negativeConstraints: string[];
  referenceAssetIds: string[];
  referenceVisualId: string | null;
  transparentBackground: boolean;
  expectedAspectRatio: string;
  expectedWidth: number;
  expectedHeight: number;
  orientation: string;
  cameraAngle: string | null;
  lightingIntent: string | null;
  materialIntent: string | null;
  styleIntent: string | null;
  colorIntent: string | null;
  subjectIntent: string | null;
  isolationRules: string[];
  backgroundRules: string[];
  approvedVisualFingerprint: string | null;
  assetChecksum: string | null;
  regenerationEligible: boolean;
  retryPolicy: string;
  spendPolicy: 'FOUNDER_CONFIRM' | 'AUTO_POLICY';
  status: 'DRAFT' | 'READY' | 'GENERATED' | 'REGISTERED';
  createdAt: string;
};

export type AssetGenerationContractSet = {
  contractSetId: string;
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  contracts: AssetGenerationContract[];
  status: 'DRAFT' | 'READY';
  createdAt: string;
};

export type TwinReconciliationReceipt = {
  compositionStateId: string;
  authorityVisualId: string;
  blueprintTwinId: string;
  plannedObjectCount: number;
  visualObjectCount: number;
  blueprintObjectCount: number;
  matchedObjectCount: number;
  geometryCorrections: string[];
  typographyCorrections: string[];
  assetCorrections: string[];
  relationshipCorrections: string[];
  unresolvedObjects: string[];
  status: 'PASS' | 'FAIL';
};

export type ApprovedTwinBundle = {
  bundleId: string;
  compositionStateId: string;
  authorityVisualId: string;
  blueprintTwinId: string;
  assetManifestId: string;
  functionPlanId: string;
  bundleChecksum: string;
  status: 'APPROVED_TWIN_BUNDLE';
  lockedAt: string;
};

export type CanonicalAssetManifestEntry = {
  canonicalAssetId: string;
  assetVersionId: string;
  storageUrl: string;
  checksum: string;
  contentFingerprint: string;
  conceptId: string;
  conceptVersionId: string;
  objectId: string;
  assetSlotId: string;
  generationContractId: string | null;
  transparentBackground: boolean;
};

export type CanonicalAssetManifest = {
  manifestId: string;
  conceptId: string;
  conceptVersionId: string;
  compositionStateId: string;
  assets: CanonicalAssetManifestEntry[];
  requiredAssetCount: number;
  resolvedAssetCount: number;
  regenerableAssetCount: number;
  transparentAssetCount: number;
  status: 'DRAFT' | 'READY' | 'PASS';
  checksum: string;
};

export type AssetRegenerationReceipt = {
  assetId: string;
  oldAssetVersionId: string;
  newAssetVersionId: string;
  generationContractId: string;
  provider: string;
  model: string;
  referenceInputs: string[];
  visualSimilarity: number;
  fingerprintMatch: boolean;
  purityStatus: 'PASS' | 'FAIL';
  accepted: boolean;
  status: 'PASS' | 'FAIL';
};

export type BlueprintObjectCodeBinding = {
  objectId: string;
  renderPrimitive: string;
  component: string;
  selector: string;
  sourceFile: string;
  styleSource: string;
  canonicalAssetId: string | null;
  functionBindingId: string | null;
  status: 'BOUND' | 'UNBOUND';
};

export type BlueprintTranslationReceipt = {
  blueprintTwinId: string;
  objectCoverage: number;
  relationshipCoverage: number;
  assetCoverage: number;
  functionCoverage: number;
  stateCoverage: number;
  responsiveCoverage: number;
  translationGaps: { objectId: string; property: string; reason: string }[];
  status: 'PASS' | 'FAIL';
};

export type RuntimeIndependenceReceipt = {
  authorityVisualRequired: boolean;
  uiSurvivesAuthorityRemoval: boolean;
  uiSurvivesMediaRemoval: boolean;
  textRemains: boolean;
  navRemains: boolean;
  metricsRemain: boolean;
  progressRemains: boolean;
  activityRemains: boolean;
  status: 'PASS' | 'FAIL';
};

export type TwinFidelityReceipt = {
  criticalObjectScore: number;
  geometryScore: number;
  relationshipScore: number;
  typographyScore: number;
  assetScore: number;
  surfaceScore: number;
  colorScore: number;
  overallWeightedScore: number;
  criticalOutliers: string[];
  status: 'MACHINE_PASS' | 'MACHINE_FAIL' | 'FOUNDER_PASS' | 'FOUNDER_FAIL';
};

export type ParallelTwinGenerationBundle = {
  compositionState: ConceptCompositionState;
  authorityVisual: AuthorityVisualRecord;
  surgicalBlueprintTwin: SurgicalBlueprintTwin;
  assetGenerationContractSet: AssetGenerationContractSet;
};

export type PendingParallelTwinGeneration = Omit<PendingDualOutputGeneration, 'buildRef'> & {
  buildRef: typeof P0_VR_TWIN_V27_BUILD;
  parallelTwin: ParallelTwinGenerationBundle;
};

export type NdxOverviewTwinV27PilotResult = {
  pipelineCallOrder: string[];
  compositionState: ConceptCompositionState;
  compositionObjectCount: number;
  compositionRelationshipCount: number;
  authorityVisual: AuthorityVisualRecord;
  surgicalBlueprintTwin: SurgicalBlueprintTwin;
  sharedCompositionStateId: string;
  surgicalObjectCount: number;
  sampleTextObject: SurgicalBlueprintObject;
  sampleDividerObject: SurgicalBlueprintObject;
  sampleImageObject: SurgicalBlueprintObject;
  sampleRelationship: BlueprintRelationship;
  assetGenerationContractSet: AssetGenerationContractSet;
  generatedAssetCount: number;
  canonicalAssetCount: number;
  transparentAssetCount: number;
  sampleAssetGenerationContract: AssetGenerationContract;
  twinReconciliationReceipt: TwinReconciliationReceipt;
  canonicalAssetManifest: CanonicalAssetManifest;
  blueprintTranslationReceipt: BlueprintTranslationReceipt;
  runtimeIndependenceReceipt: RuntimeIndependenceReceipt;
  twinFidelityReceipt: TwinFidelityReceipt;
  machinePassStatus: 'PASS' | 'FAIL';
  founderReviewStatus: 'PENDING' | 'PASS';
  buildRef: typeof P0_VR_TWIN_V27_BUILD;
};
