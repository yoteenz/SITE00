import type { DesignPageAuthorityReviewSession } from '../p0vrTwinV30/types.js';
import type { MobileTwinPipelineState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';

export type MobileTwinPackageApprovalStatus = 'PENDING' | 'CONFIRMED' | 'LOCAL_ONLY' | 'PERSIST_FAILED';

export type MobileTwinImplementationStateStatus =
  | 'NOT_STARTED'
  | 'READY_TO_COMPILE'
  | 'COMPILING'
  | 'PREVIEW_BUILD_READY'
  | 'FOUNDER_IMPLEMENTATION_REVIEW'
  | 'CORRECTION_REQUIRED'
  | 'FOUNDER_APPROVED'
  | 'PROMOTION_READY'
  | 'PROMOTED'
  | 'FAILED';

export type MobileTwinPackageApprovalRecord = {
  id: string;
  projectId: string;
  workspaceType: string;
  viewport: 'MOBILE';
  packageId: string;
  packageChecksum: string;
  compositionStateId: string;
  compositionHash: string;
  actualRenderId: string;
  actualRenderHash: string;
  blueprintRenderId: string;
  blueprintRenderHash: string;
  implementationVisualAuthorityId: string;
  providerStrategy: string;
  featureManifestVersion: string;
  projectContextVersion: string;
  approvedAt: string;
  approvedBy: string;
  approvalVersion: string;
  status: 'APPROVED';
  source: 'FOUNDER_APPROVAL';
  createdAt: string;
  updatedAt: string;
};

export type CompiledMobileTwinNode = {
  objectId: string;
  primitive: string;
  semanticRole: string;
  layout: { leftPct: number; topPct: number; widthPct: number; heightPct: number; zIndex: number };
  styles: Record<string, string>;
  functionTarget: string | null;
  featureId: string | null;
  ownership: string;
  interactionIntent: string | null;
};

export type CompiledMobileTwinImplementationDocument = {
  lineage: string;
  viewport: 'MOBILE';
  widthPx: number;
  heightPx: number;
  nodes: CompiledMobileTwinNode[];
  sourceArtifactIds: string[];
  forbiddenPrimitiveScan: { violations: string[]; count: number };
  structuredSource: 'COMPOSITION_AND_PACKAGE_ARTIFACTS';
};

export type ImplementationVisualFidelityReceipt = {
  id: string;
  implementationBuildId: string;
  authorityRenderId: string;
  majorRegionMatch: boolean;
  geometryMatch: boolean;
  typographyMatch: boolean;
  assetPlacementMatch: boolean;
  controlPlacementMatch: boolean;
  spacingMatch: boolean;
  projectAtmosphereMatch: boolean;
  hostProjectBoundaryMatch: boolean;
  result: 'PASS' | 'REVIEW_REQUIRED' | 'FAIL';
  founderReviewRequired: boolean;
};

export type ImplementationStructuralFidelityReceipt = {
  id: string;
  implementationBuildId: string;
  expectedObjectCount: number;
  renderedObjectCount: number;
  featureBindingsPass: boolean;
  functionBindingsPass: boolean;
  ownershipPass: boolean;
  implementationPrimitivesPass: boolean;
  traceabilityPass: boolean;
  forbiddenRasterImplementation: boolean;
  stateBehaviorPass: boolean;
  navigationBehaviorPass: boolean;
  result: 'PASS' | 'REVIEW_REQUIRED' | 'FAIL';
};

export type MobileTwinImplementationBuildRecord = {
  id: string;
  packageApprovalId: string;
  packageId: string;
  packageChecksum: string;
  compositionHash: string;
  implementationVersion: string;
  previewRoute: string;
  compiledAt: string;
  buildStatus: 'PREVIEW_BUILD_READY' | 'FAILED';
  compiledDocument: CompiledMobileTwinImplementationDocument;
  visualFidelityReceiptId: string | null;
  structuralFidelityReceiptId: string | null;
  founderStatus: 'PENDING' | 'FOUNDER_APPROVED' | 'CORRECTION_REQUESTED';
  promotionStatus: 'NOT_READY' | 'PROMOTION_READY' | 'PROMOTED';
};

export type MobileTwinPromotionReadinessReceipt = {
  id: string;
  packageApprovalDurable: boolean;
  implementationFounderApproved: boolean;
  visualFidelityAcceptable: boolean;
  structuralFidelityAcceptable: boolean;
  noCriticalFunctionalFailures: boolean;
  noForbiddenPrimitives: boolean;
  noStaleAuthorityPackage: boolean;
  previewRouteHealthy: boolean;
  status: 'NOT_READY' | 'PROMOTION_READY';
};

export type MobileTwinImplementationCorrectionReason =
  | 'VISUAL FIDELITY'
  | 'LAYOUT'
  | 'TYPOGRAPHY'
  | 'ASSET'
  | 'FUNCTION'
  | 'INTERACTION'
  | 'HOST/PROJECT FIREWALL'
  | 'RESPONSIVE'
  | 'OTHER';

export type MobileTwinImplementationSessionSlice = {
  packageApprovalStatus: MobileTwinPackageApprovalStatus;
  backendPackageApprovalId: string | null;
  implementationStatus: MobileTwinImplementationStateStatus;
  latestBuildId: string | null;
  latestImplementationVersion: string | null;
  previewRoute: string | null;
  promotionStatus: MobileTwinPromotionReadinessReceipt['status'];
  history: string[];
};

export type MobileTwinImplementationPersistInput = {
  session: DesignPageAuthorityReviewSession;
  approvedBy?: string;
};

export type MobileTwinImplementationApiAction =
  | 'PERSIST_PACKAGE_APPROVAL'
  | 'GET_IMPLEMENTATION_STATE'
  | 'COMPILE_IMPLEMENTATION'
  | 'APPROVE_IMPLEMENTATION'
  | 'REQUEST_IMPLEMENTATION_CORRECTION';

export type MobileTwinStructuredCompilerInput = {
  pipeline: MobileTwinPipelineState;
  packageId: string;
};
