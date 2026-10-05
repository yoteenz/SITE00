import type {
  ATOMIC_GENERATION_CLASSIFICATIONS,
  GENERATION_BUNDLE_OUTPUT_TYPES,
  GENERATION_BUNDLE_STATUSES,
  P0_VR_TWIN_V29_BUILD,
} from './constants.js';
import type { ConceptCompositionState } from '../p0vrTwinV27/types.js';
import type { BlueprintRelationship, SurgicalBlueprintObject } from '../p0vrTwinV27/types.js';
import type { FalVisualArtifact } from '../p0vrTwinV28/types.js';

export type GenerationBundleOutputType = (typeof GENERATION_BUNDLE_OUTPUT_TYPES)[number];
export type GenerationBundleStatus = (typeof GENERATION_BUNDLE_STATUSES)[number];
export type AtomicGenerationClassification = (typeof ATOMIC_GENERATION_CLASSIFICATIONS)[number];

export type AtomicConceptGenerationBundle = {
  buildRef: typeof P0_VR_TWIN_V29_BUILD;
  generationBundleId: string;
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  projectId: string;
  pageId: string;
  viewport: 'mobile';
  authorityVisualId: string;
  blueprintTwinVisualId: string;
  surgicalBlueprintDataId: string;
  assetGenerationContractSetId: string;
  assetManifestId: string;
  functionBindingMapId: string;
  requiredOutputs: GenerationBundleOutputType[];
  completedOutputs: GenerationBundleOutputType[];
  failedOutputs: GenerationBundleOutputType[];
  providerLineage: string[];
  status: GenerationBundleStatus;
  createdAt: string;
  completedAt: string | null;
};

export type SurgicalBlueprintData = {
  surgicalBlueprintDataId: string;
  generationBundleId: string;
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
  functionTargets: { objectId: string; functionKey: string }[];
  responsiveRules: string[];
  stateRules: string[];
  ownershipRules: string[];
  status: 'DRAFT' | 'LOCKED';
};

export type AtomicAssetGenerationContract = {
  assetGenerationContractId: string;
  generationBundleId: string;
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  objectId: string;
  assetSlotId: string;
  role: string;
  assetType: string;
  generationProvider: string;
  generationModel: string;
  generationModelVersion: string;
  normalizedGenerationInstruction: string;
  negativeConstraints: string[];
  referenceAssetIds: string[];
  referenceVisualIds: string[];
  transparentBackground: boolean;
  expectedAspectRatio: string;
  expectedWidth: number;
  expectedHeight: number;
  orientation: string;
  lightingIntent: string | null;
  cameraIntent: string | null;
  materialIntent: string | null;
  styleIntent: string | null;
  colorIntent: string | null;
  subjectIntent: string | null;
  isolationRules: string[];
  backgroundRules: string[];
  approvedVisualTarget: string | null;
  visualFingerprint: string | null;
  regenerationEligible: boolean;
  retryPolicy: string;
  spendPolicy: 'FOUNDER_CONFIRM' | 'AUTO_POLICY';
  status: string;
};

export type AtomicAssetGenerationContractSet = {
  contractSetId: string;
  generationBundleId: string;
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  contracts: AtomicAssetGenerationContract[];
  status: 'DRAFT' | 'READY';
};

export type StandaloneAssetRender = {
  artifactId: string;
  generationBundleId: string;
  compositionStateId: string;
  objectId: string;
  assetSlotId: string;
  storageUrl: string;
  providerJobRef: string;
  transparentBackground: boolean;
  assetVersionId: string;
};

export type StandaloneAssetGenerationReceipt = {
  generationBundleId: string;
  objectId: string;
  assetSlotId: string;
  generationContractId: string;
  providerJobRef: string;
  artifactId: string;
  visualTargetId: string;
  transparentBackground: boolean;
  similarityStatus: 'PENDING' | 'PASS' | 'FAIL';
  status: 'PASS' | 'FAIL' | 'SKIPPED';
};

export type FunctionBinding = {
  functionBindingId: string;
  objectId: string;
  functionalRole: string;
  sourceFunction: string;
  dataSource: string;
  route: string | null;
  action: string | null;
  interaction: string | null;
  requiredStates: string[];
  status: 'BOUND';
};

export type FunctionBindingMap = {
  functionBindingMapId: string;
  generationBundleId: string;
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  bindings: FunctionBinding[];
  status: 'COMPLETE' | 'INCOMPLETE';
};

export type GenerationBundleCompletenessReceipt = {
  generationBundleId: string;
  authorityReady: boolean;
  blueprintTwinReady: boolean;
  surgicalDataReady: boolean;
  assetContractsReady: boolean;
  requiredAssetsReady: boolean;
  functionMapReady: boolean;
  missingOutputs: GenerationBundleOutputType[];
  failedOutputs: GenerationBundleOutputType[];
  status: 'PASS' | 'FAIL' | 'PARTIAL';
};

export type AtomicObjectConsistencyReceipt = {
  objectId: string;
  inCompositionState: boolean;
  inAuthority: boolean;
  inBlueprintTwin: boolean;
  inSurgicalData: boolean;
  assetResolved: boolean;
  functionResolved: boolean;
  status: 'PASS' | 'FAIL';
};

export type AtomicBundleRegistrationReceipt = {
  generationBundleId: string;
  authorityRegistered: boolean;
  blueprintTwinRegistered: boolean;
  surgicalDataRegistered: boolean;
  assetContractsRegistered: boolean;
  assetsRegistered: boolean;
  functionMapRegistered: boolean;
  bundleChecksum: string;
  status: 'PASS' | 'FAIL';
};

export type AssetRegenerationCapabilityReceipt = {
  objectId: string;
  contractStored: boolean;
  referencesStored: boolean;
  regenerationCallable: boolean;
  newVersionCreated: boolean;
  visualTargetComparisonAvailable: boolean;
  status: 'PASS' | 'PARTIAL';
};

export type AtomicCreativeGenerationResult = {
  pipelineCallOrder: readonly string[];
  bundle: AtomicConceptGenerationBundle;
  compositionState: ConceptCompositionState;
  authorityArtifact: FalVisualArtifact;
  blueprintTwinArtifact: FalVisualArtifact;
  surgicalBlueprintData: SurgicalBlueprintData;
  assetContractSet: AtomicAssetGenerationContractSet;
  standaloneAssets: StandaloneAssetRender[];
  functionBindingMap: FunctionBindingMap;
  completeness: GenerationBundleCompletenessReceipt;
  objectConsistency: AtomicObjectConsistencyReceipt[];
  registration: AtomicBundleRegistrationReceipt;
  assetRegenerationCapability: AssetRegenerationCapabilityReceipt;
  providerTrace: string[];
  v28CapabilityStatus: string;
  classification: AtomicGenerationClassification;
  failureCode: string | null;
  approveEnabled: boolean;
};
