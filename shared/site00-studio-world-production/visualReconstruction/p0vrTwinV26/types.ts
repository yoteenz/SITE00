import type {
  FAILURE_TAXONOMY,
  INVENTION_BUDGET_BY_STAGE,
  IR_SCHEMA_VERSION,
  P0_VR_TWIN_V26_BUILD,
} from './constants.js';

export type FailureTaxonomyCode = (typeof FAILURE_TAXONOMY)[number];
export type InventionBudget = 'OPEN' | 'CONTROLLED' | 'MICRO' | 'NONE';
export type ExecutionIntent = 'CREATIVE' | 'TRANSLATION' | 'QA';
export type BundleSyncStatus =
  | 'SYNCED'
  | 'DIRTY_VISUAL'
  | 'DIRTY_BLUEPRINT'
  | 'DIRTY_ASSETS'
  | 'DIRTY_FUNCTIONS'
  | 'DIRTY_RESPONSIVE'
  | 'DIRTY_STATE'
  | 'DIRTY_MULTIPLE';

export type ApprovalType =
  | 'APPROVE_CREATIVE_DIRECTION'
  | 'APPROVE_PAIRED_CONCEPT'
  | 'APPROVE_IMPLEMENTATION'
  | 'PROMOTE_TO_LIVE';

export type AcceptanceStatus =
  | 'MACHINE_PENDING'
  | 'MACHINE_PASS'
  | 'MACHINE_FAIL'
  | 'FOUNDER_PENDING'
  | 'FOUNDER_PASS'
  | 'FOUNDER_REJECTED';

export type DataKnowledgeState = 'KNOWN' | 'UNKNOWN' | 'NOT_APPLICABLE' | 'LOADING' | 'ERROR';

export type IrKind =
  | 'IntentIR'
  | 'DesignIR'
  | 'VisualIR'
  | 'AssetIR'
  | 'FunctionIR'
  | 'ImplementationIR'
  | 'RenderIR'
  | 'FidelityIR';

export type IrEnvelope<K extends IrKind, Payload = Record<string, unknown>> = {
  irId: string;
  irKind: K;
  conceptId: string;
  conceptVersionId: string;
  schemaVersion: typeof IR_SCHEMA_VERSION;
  createdAt: string;
  producer: string;
  inputIrIds: string[];
  status: 'DRAFT' | 'LOCKED' | 'PASS' | 'FAIL';
  checksum: string;
  payload: Payload;
};

export type ConceptBundleChecksum = {
  conceptId: string;
  conceptVersionId: string;
  checksum: string;
  visualIrChecksum: string;
  assetIrChecksum: string;
  functionIrChecksum: string;
  designIrChecksum: string;
  hostContractVersion: string;
  responsiveContractVersion: string;
  stateContractVersion: string;
  computedAt: string;
};

export type ConceptGenerationPreflightReceipt = {
  intentReady: boolean;
  objectsReady: boolean;
  assetsPlanned: boolean;
  functionsPlanned: boolean;
  hostBoundaryReady: boolean;
  viewportReady: boolean;
  typographyReady: boolean;
  colorReady: boolean;
  responsiveReady: boolean;
  statesReady: boolean;
  blockingReasons: string[];
  status: 'PASS' | 'FAIL';
};

export type CompilerReadinessReceipt = {
  visualSync: boolean;
  blueprintCoverage: boolean;
  typographyCoverage: boolean;
  assetCoverage: boolean;
  functionCoverage: boolean;
  ownershipCoverage: boolean;
  responsiveCoverage: boolean;
  stateCoverage: boolean;
  rasterIndependence: boolean;
  bundleChecksumValid: boolean;
  blockingReasons: string[];
  status: 'PASS' | 'FAIL';
};

export type ReviewVersionHeader = {
  conceptVersionId: string;
  blueprintVersionId: string;
  assetManifestVersionId: string;
  functionPlanVersionId: string;
  buildVersionId: string | null;
  bundleChecksum: string;
  stale: boolean;
};

export type ObjectLineageEntry = {
  objectId: string;
  conceptVersionId: string;
  designIrId: string;
  visualIrId: string;
  assetId: string | null;
  functionBindingId: string | null;
  implementationComponent: string;
  domSelector: string;
  renderObjectId: string;
  fidelityReceiptId: string | null;
  status: 'LINKED' | 'BROKEN';
};

export type VisualRelationship = {
  relationshipId: string;
  sourceObjectId: string;
  targetObjectId: string;
  type: string;
  targetValue: string;
  tolerance: number;
  priority: number;
};

export type TypographyFidelityContract = {
  objectId: string;
  fontFamily: string;
  fallbackFamily: string;
  fontRole: string | null;
  fontSize: number | null;
  fontWeight: string | null;
  lineHeight: number | null;
  letterSpacing: number | null;
  lineBreaks: string[];
  overflowPolicy: 'truncate' | 'wrap' | 'visible';
};

export type AssetIdentityContract = {
  objectId: string;
  canonicalAssetId: string;
  assetVersionId: string;
  assetChecksum: string;
  contentFingerprint: string;
  width: number;
  height: number;
  alphaExpected: boolean;
};

export type DesignCompilerBundle = {
  buildRef: typeof P0_VR_TWIN_V26_BUILD;
  conceptId: string;
  conceptVersionId: string;
  irChain: {
    intent: IrEnvelope<'IntentIR'>;
    design: IrEnvelope<'DesignIR'>;
    visual: IrEnvelope<'VisualIR'>;
    asset: IrEnvelope<'AssetIR'>;
    function: IrEnvelope<'FunctionIR'>;
    implementation: IrEnvelope<'ImplementationIR'>;
    render: IrEnvelope<'RenderIR'>;
    fidelity: IrEnvelope<'FidelityIR'>;
  };
  bundleChecksum: ConceptBundleChecksum;
  bundleSyncStatus: BundleSyncStatus;
  executionIntent: ExecutionIntent;
  inventionBudget: typeof INVENTION_BUDGET_BY_STAGE;
  preflightReceipt: ConceptGenerationPreflightReceipt | null;
  compilerReadiness: CompilerReadinessReceipt | null;
  objectLineage: ObjectLineageEntry[];
  visualRelationships: VisualRelationship[];
  reviewVersionHeader: ReviewVersionHeader | null;
  acceptanceStatus: AcceptanceStatus;
  approvedBundleChecksum: string | null;
  approvedAt: string | null;
  failureClosed: true;
};

export type PromotionReadinessReceipt = {
  conceptApproved: boolean;
  compilerReady: boolean;
  buildReady: boolean;
  machineFidelity: boolean;
  founderFidelity: boolean;
  runtimeQuality: boolean;
  versionFresh: boolean;
  checksumValid: boolean;
  blockingReasons: string[];
  status: 'PASS' | 'FAIL';
};
