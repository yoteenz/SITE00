import type { P0_VR_TWIN_V23_BUILD, TWIN_V2_BUILD_MODES, TWIN_V2_BUILD_STAGES } from './constants.js';
import type { ConceptBuildFidelityReceipt } from '../p0vrTwinV22/types.js';

export type TwinV2BuildMode = (typeof TWIN_V2_BUILD_MODES)[number];
export type TwinV2BuildStage = (typeof TWIN_V2_BUILD_STAGES)[number];

export type TwinV2BuildPolicy = {
  requiresApprovedConcept: boolean;
  requiresExecutablePackage: boolean;
  allowsSemanticFallback: boolean;
  allowsTemplateFallback: boolean;
  allowsV1Fallback: boolean;
  allowsGenericSourceGeneration: boolean;
  allowsCreativeReinterpretation: boolean;
};

export type TwinV2ExecutionLineage = {
  buildRef: typeof P0_VR_TWIN_V23_BUILD;
  conceptId: string;
  approvedVisualAuthorityId: string;
  executionBlueprintId: string;
  assetManifestId: string;
  functionBindingPlanId: string;
  hostShellContractId: string | null;
  executablePackageId: string;
  builderInvocationId: string;
  sourceGenerationId: string;
  renderedTwinId: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  failureCode?: string | null;
};

export type ExecutablePackageAttachmentReceipt = {
  packageId: string;
  conceptId: string;
  visualAttached: boolean;
  blueprintAttached: boolean;
  assetsAttached: boolean;
  functionsAttached: boolean;
  hostShellAttached: boolean;
  responsiveContractAttached: boolean;
  builderReceivedPackageId: string;
  status: 'PASS' | 'FAIL';
  missing?: string[];
};

export type ConceptObjectBuildBinding = {
  objectId: string;
  sourceComponent: 'ConceptDirectedPackageTwinV2';
  sourceFile: string;
  renderStrategy: string;
  assetBinding: string | null;
  functionBinding: string | null;
  status: 'BOUND' | 'UNBOUND' | 'DEFERRED';
};

export type TwinV2SourceGenerationReceipt = {
  sourceGenerationId: string;
  packageId: string;
  conceptId: string;
  visualAuthorityId: string;
  blueprintId: string;
  assetManifestId: string;
  functionBindingPlanId: string;
  hostShellContractId: string | null;
  inputObjects: string[];
  sourceFilesGenerated: string[];
  fallbackUsed: boolean;
  fallbackType: string | null;
  status: 'PASS' | 'FAIL';
  buildMode: TwinV2BuildMode;
};

export type TwinV2SourceProvenance = {
  sourceFile: string;
  conceptId: string;
  packageId: string;
  blueprintId: string;
  objectIds: string[];
  assetSlots: string[];
  functionBindings: string[];
  status: 'GENERATED';
};

export type TwinV2RenderReceipt = {
  twinId: string;
  route: string;
  conceptId: string;
  packageId: string;
  blueprintId: string;
  sourceGenerationId: string;
  hostShellContractId: string | null;
  renderedAt: string;
  status: 'PASS' | 'FAIL';
};

export type TwinV2BuildHistoryEntry = {
  twinId: string;
  conceptId: string;
  packageId: string | null;
  builtAt: string;
  status: 'PASS' | 'FAILED_PACKAGE_LINEAGE' | 'FAILED_BUILD';
  componentRef: string;
};

export type ActiveApprovedConceptTrace = {
  activeConceptId: string | null;
  approvedConceptId: string | null;
  approvedVisualAuthorityId: string | null;
  executionBlueprintId: string | null;
  assetManifestId: string | null;
  functionBindingPlanId: string | null;
  hostShellContractId: string | null;
  executablePackageId: string | null;
  currentTwinV2Id: string;
  lineageConsistent: boolean;
};

export type PackageDrivenBuildArtifacts = {
  buildPolicy: TwinV2BuildPolicy;
  buildMode: TwinV2BuildMode;
  buildStage: TwinV2BuildStage;
  failureStage: TwinV2BuildStage | null;
  lineage: TwinV2ExecutionLineage;
  attachmentReceipt: ExecutablePackageAttachmentReceipt;
  sourceGenerationReceipt: TwinV2SourceGenerationReceipt;
  renderReceipt: TwinV2RenderReceipt;
  objectBindings: ConceptObjectBuildBinding[];
  sourceProvenance: TwinV2SourceProvenance[];
  objectCoverage: {
    blueprintObjectCount: number;
    boundObjectCount: number;
    generatedObjectCount: number;
    unboundObjectCount: number;
  };
  fidelityReceipt: ConceptBuildFidelityReceipt;
  activeTrace: ActiveApprovedConceptTrace;
};

export type BuilderEntryPointTrace = {
  builderFunction: string;
  sourceFile: string;
  inputType: string;
  fallbacksAvailable: string[];
  renderModeSelected: string;
};
