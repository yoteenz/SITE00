import type { P0_VR_TWIN_V24R1_BUILD, TWIN_V2_IMPLEMENTATION_STRATEGIES } from './constants.js';

export type TwinV2ImplementationStrategy = (typeof TWIN_V2_IMPLEMENTATION_STRATEGIES)[number];

export type VisualAuthorityAttachment = {
  visualAuthorityId: string;
  assetUrl: string;
  storageRef: string | null;
  width: number;
  height: number;
  viewport: 'mobile';
  hash: string;
  clientCanvasTop: number;
  clientCanvasBottom: number;
};

export type VisualCompilerInputReceipt = {
  conceptId: string;
  visualAuthorityId: string;
  visualAuthorityAttached: boolean;
  executionPackageId: string;
  functionGraphId: string;
  assetManifestId: string;
  hostBoundaryId: string | null;
  viewport: 'mobile';
  status: 'PASS' | 'FAIL';
};

export type CompilerInvocationReceipt = {
  compilerRunId: string;
  conceptId: string;
  strategy: TwinV2ImplementationStrategy;
  compilerName: string;
  visualAuthorityId: string;
  executionPackageId: string;
  startedAt: string;
  completedAt: string;
  status: 'PASS' | 'FAIL';
};

export type VisualImplementationPlanRegion = {
  regionId: string;
  role: string;
  bounds: { x: number; y: number; w: number; h: number };
  surface: string;
  typographyRole: string;
  renderAs: 'DOM' | 'IMAGE_ASSET' | 'CSS_SURFACE';
};

export type VisualImplementationPlan = {
  planId: string;
  conceptId: string;
  visualAuthorityId: string;
  compilerRunId: string;
  regions: VisualImplementationPlanRegion[];
  typographyRolesDetected: number;
  imageRegionsDetected: number;
  dividersDetected: number;
  surfaceRegionsDetected: number;
  createdAt: string;
};

export type VisualCompilerSourceReceipt = {
  sourceGenerationId: string;
  compilerRunId: string;
  visualImplementationPlanId: string;
  sourceFiles: string[];
  componentFiles: string[];
  styleFiles: string[];
  status: 'PASS' | 'FAIL';
};

export type FunctionTransplantReceipt = {
  compilerRunId: string;
  functionBindingsAttempted: number;
  functionBindingsPassed: number;
  functionBindingsFailed: number;
  status: 'PASS' | 'FAIL';
};

export type TwinV2RouteProvenance = {
  route: string;
  twinId: string;
  conceptId: string;
  compilerRunId: string;
  sourceGenerationId: string;
  renderComponent: string;
  legacyRendererReferenced: boolean;
  status: 'PASS' | 'FAIL';
};

export type StrategyRoutingReceipt = {
  buildAction: 'BUILD_THIS_CONCEPT';
  resolvedStrategy: TwinV2ImplementationStrategy;
  compilerInvoked: boolean;
  oldRendererInvoked: boolean;
  fallbackUsed: boolean;
  visualAuthorityAttached: boolean;
  compilerRunId: string;
  sourceGenerationId: string;
  renderTwinId: string;
  status: 'PASS' | 'FAIL';
};

export type ImageInputAudit = {
  numberOfVisualInputs: number;
  approvedAuthorityIncluded: boolean;
  authorityRole: string;
  imageAnalysisPerformed: boolean;
};

export type CompilerOutputAudit = {
  visualObjectsDetected: number;
  regionsDetected: number;
  typographyRolesDetected: number;
  imageRegionsDetected: number;
  dividersDetected: number;
  surfaceRegionsDetected: number;
};

export type VisualCompilerBuildArtifacts = {
  buildRef: typeof P0_VR_TWIN_V24R1_BUILD;
  strategy: TwinV2ImplementationStrategy;
  strategyRoutingReceipt: StrategyRoutingReceipt;
  visualAuthority: VisualAuthorityAttachment;
  compilerInputReceipt: VisualCompilerInputReceipt;
  compilerInvocationReceipt: CompilerInvocationReceipt;
  visualImplementationPlan: VisualImplementationPlan;
  sourceReceipt: VisualCompilerSourceReceipt;
  functionTransplantReceipt: FunctionTransplantReceipt;
  routeProvenance: TwinV2RouteProvenance;
  imageInputAudit: ImageInputAudit;
  compilerOutputAudit: CompilerOutputAudit;
  compilerAvailability: {
    compilerProvider: string;
    compilerModel: string;
    visionEnabled: boolean;
    sourceGenerationEnabled: boolean;
  };
};

export type TwinV2BuildCallPath = {
  steps: string[];
};
