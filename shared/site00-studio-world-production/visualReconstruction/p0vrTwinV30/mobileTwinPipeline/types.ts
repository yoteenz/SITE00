/** P0.VR.TWINV3.0R7M — Mobile-only composition-state twin pipeline */

import type { DesignWorkspaceViewport } from '../designWorkspaceAuthorityTypes.js';

export const R6F2_BLUEPRINT_ROLE = 'SUPERSEDED_BY_COMPOSITION_STATE_TWIN_PIPELINE' as const;

export type MobileDesignReferenceAuthorityStatus = 'REFERENCE_LOCKED';

export type MobileDesignReferenceAuthority = {
  id: string;
  projectId: string;
  workspaceType: 'DESIGN_PAGE_V3';
  viewport: 'MOBILE';
  sourceAuthorityId: string;
  sourceImageId: string;
  sourceImageHash: string;
  sourceImageUri: string;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  founderApproved: true;
  approvedAt: string;
  status: MobileDesignReferenceAuthorityStatus;
  version: number;
};

export type MobileTwinCompositionStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'RECONCILED'
  | 'FOUNDER_REVIEW_READY'
  | 'FROZEN';

export type MobileCompositionObjectDefinition = {
  objectId: string;
  parentObjectId: string | null;
  regionId: string;
  semanticRole: string;
  visualRole: string;
  objectType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  normalizedX: number;
  normalizedY: number;
  normalizedWidth: number;
  normalizedHeight: number;
  zIndex: number;
  typographyRef: string | null;
  assetRef: string | null;
  featureId: string | null;
  functionTarget: string | null;
  ownership: string;
  state: string;
  relationshipIds: string[];
  implementationPrimitive: string;
  visualImportance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
};

export type MobileTwinCompositionState = {
  id: string;
  projectId: string;
  workspaceType: 'DESIGN_PAGE_V3';
  viewport: 'MOBILE';
  referenceAuthorityId: string;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  hostProjectContractVersion: string;
  compositionVersion: number;
  objectDefinitions: MobileCompositionObjectDefinition[];
  regionDefinitions: { regionId: string; semanticRole: string; parentRegionId: string | null }[];
  typographyDefinitions: { role: string; fontFamily: string; casing: string }[];
  assetSlots: { slotId: string; objectId: string; resolution: string }[];
  functionTargets: { objectId: string; functionTarget: string; status: 'BOUND' | 'PARTIAL' | 'MISSING' | 'NOT_APPLICABLE' }[];
  featureBindings: { featureId: string; objectIds: string[]; presentation: string }[];
  ownershipBindings: { objectId: string; ownership: string }[];
  stateDefinitions: { objectId: string; state: string }[];
  interactionDefinitions: { objectId: string; intent: string }[];
  relationships: { id: string; fromObjectId: string; toObjectId: string; type: string }[];
  zOrder: string[];
  responsiveIntent: 'MOBILE_ONLY';
  providerMetadata: { provider: string; model: string; jobRef: string | null };
  compositionHash: string;
  status: MobileTwinCompositionStatus;
  createdAt: string;
};

export type MobileImplementationRenderStatus = 'GENERATED' | 'FOUNDER_REVIEW' | 'APPROVED' | 'SUPERSEDED';

export type MobileImplementationRender = {
  id: string;
  compositionStateId: string;
  compositionHash: string;
  referenceAuthorityId: string;
  renderImageUri: string;
  renderImageHash: string;
  widthPx: number;
  heightPx: number;
  provider: 'FAL' | 'LOCAL_COMPILER';
  providerJobRef: string;
  status: MobileImplementationRenderStatus;
  createdAt: string;
};

export type MobileImplementationRenderGateState =
  | 'GENERATED'
  | 'FOUNDER_REVIEW'
  | 'APPROVED'
  | 'REFINE_REQUESTED'
  | 'REGENERATE_REQUESTED'
  | 'FROZEN';

export type MobileImplementationVisualAuthorityStatus = 'FROZEN_IMPLEMENTATION_AUTHORITY';

export type MobileImplementationVisualAuthority = {
  id: string;
  renderId: string;
  compositionStateId: string;
  compositionHash: string;
  referenceAuthorityId: string;
  imageUri: string;
  imageHash: string;
  approvedAt: string;
  approvedBy: string;
  status: MobileImplementationVisualAuthorityStatus;
};

export type MobileBlueprintTwinVisual = {
  id: string;
  compositionStateId: string;
  compositionHash: string;
  implementationRenderId: string;
  twinImageUri: string;
  twinImageHash: string;
  provider: 'FAL' | 'LOCAL_COMPILER';
  providerJobRef: string;
  createdAt: string;
};

export type MobileTwinPackageStatus =
  | 'GENERATING'
  | 'RECONCILING'
  | 'FOUNDER_REVIEW_READY'
  | 'APPROVED'
  | 'BLOCKED'
  | 'FAILED';

export type MobileTwinPackage = {
  id: string;
  projectId: string;
  designReferenceAuthorityId: string;
  compositionStateId: string;
  compositionHash: string;
  implementationRenderId: string;
  implementationVisualAuthorityId: string | null;
  blueprintTwinVisualId: string;
  surgicalBlueprintId: string;
  objectMapId: string;
  canonicalAssetManifestId: string;
  functionBindingMapId: string;
  hostProjectOwnershipMapId: string;
  implementationPrimitiveContractId: string;
  reverseTraceabilityMapId: string;
  reconciliationReceiptId: string;
  referenceTranslationFidelityReceiptId: string;
  twinFidelityReceiptId: string;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  packageChecksum: string;
  providerLineage: string;
  status: MobileTwinPackageStatus;
  createdAt: string;
};

export type ReferenceTranslationFidelityReceipt = {
  id: string;
  referenceAuthorityId: string;
  renderId: string;
  compositionHash: string;
  compositionPreserved: boolean;
  spatialHierarchyScore: number;
  result: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
};

export type TwinFidelityReceipt = {
  id: string;
  renderId: string;
  blueprintTwinId: string;
  compositionStateId: string;
  compositionHash: string;
  objectIdentityMatch: boolean;
  compositionHashMatch: boolean;
  result: 'PASS' | 'FAIL';
};

export type MobileTwinReconciliationReceipt = {
  id: string;
  packageId: string;
  compositionStateId: string;
  compositionHash: string;
  derivativeCompositionMatch: boolean;
  errors: string[];
  result: 'PASS' | 'FAIL';
};

export type MobileTwinPipelineState = {
  designReference: MobileDesignReferenceAuthority | null;
  compositionStates: MobileTwinCompositionState[];
  activeCompositionStateId: string | null;
  renders: MobileImplementationRender[];
  activeRenderId: string | null;
  renderGate: MobileImplementationRenderGateState;
  implementationVisualAuthority: MobileImplementationVisualAuthority | null;
  blueprintTwins: MobileBlueprintTwinVisual[];
  packages: MobileTwinPackage[];
  latestPackageId: string | null;
  artifactsById: Record<string, unknown>;
  falJobsDispatched: number;
  desktopStatus: 'DEFERRED';
  r6f2ForensicRole: typeof R6F2_BLUEPRINT_ROLE;
};

export type MobileTwinPipelineErrorCode =
  | 'MOBILE_REFERENCE_MISSING'
  | 'MOBILE_COMPOSITION_STATE_MISSING'
  | 'MOBILE_RENDER_GENERATION_FAILED'
  | 'MOBILE_RENDER_NOT_APPROVED'
  | 'BLUEPRINT_TWIN_COMPOSITION_MISMATCH'
  | 'DERIVATIVE_COMPOSITION_MISMATCH'
  | 'FEATURE_BINDING_GAP'
  | 'DESKTOP_SCOPE_VIOLATION';

export function emptyMobileTwinPipelineState(): MobileTwinPipelineState {
  return {
    designReference: null,
    compositionStates: [],
    activeCompositionStateId: null,
    renders: [],
    activeRenderId: null,
    renderGate: 'GENERATED',
    implementationVisualAuthority: null,
    blueprintTwins: [],
    packages: [],
    latestPackageId: null,
    artifactsById: {},
    falJobsDispatched: 0,
    desktopStatus: 'DEFERRED',
    r6f2ForensicRole: R6F2_BLUEPRINT_ROLE,
  };
}

export function assertMobileViewportOnly(viewport: DesignWorkspaceViewport): void {
  if (viewport !== 'MOBILE') throw new Error('DESKTOP_SCOPE_VIOLATION');
}
