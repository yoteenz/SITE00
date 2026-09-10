/**
 * P0.VR.8-SRF — Screen replication fidelity types.
 */

import type {
  ASSET_DEFERRED_STATES,
  AUTHORITY_REBUILD_CLASSES,
  SCREEN_REPLICATION_DIFFERENCE_CLASSES,
} from './constants.js';

export type AssetDeferredState = (typeof ASSET_DEFERRED_STATES)[number];
export type AuthorityRebuildClass = (typeof AUTHORITY_REBUILD_CLASSES)[number];
export type ScreenReplicationDifferenceClass = (typeof SCREEN_REPLICATION_DIFFERENCE_CLASSES)[number];

export type ScreenReplicationFidelityContract = {
  contractId: string;
  projectId: string;
  brandFamilyId: string;
  moduleId: string;
  screenId: string;
  viewport: 'mobile' | 'desktop' | 'tablet';
  authorityId: string;
  authorityVersion: string;
  fidelityMode: 'EXACT' | 'HIGH' | 'INTERPRETIVE';
  assetPolicy: 'ASSET_DEFERRED_ALLOWED' | 'ASSET_REQUIRED';
  structurePolicy: 'PARENT_GEOMETRY_FIRST';
  interactionPolicy: 'PRESERVE_FUNCTION';
  responsivePolicy: 'INDEPENDENT_VIEWPORT';
  qaPolicy: 'STRUCTURAL_THEN_FULL';
  convergenceRequired: boolean;
  route: string;
  referencePath: string;
};

export type AssetDeferredPolicy = {
  policyId: string;
  allowedStates: AssetDeferredState[];
  continueStructuralConvergenceWhenAssetPending: true;
  preserveExactGeometry: true;
  forbidBrokenImageUi: true;
  forbidRandomSubstitute: true;
  placeholderMustBeNeutral: true;
};

export type NormalizedGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  marginTop?: number;
  marginBottom?: number;
  paddingX?: number;
  paddingY?: number;
  gap?: number;
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  anchor?: string;
};

export type ScreenAuthorityRegion = {
  regionId: string;
  role: string;
  geometry: NormalizedGeometry;
  rebuildClass: AuthorityRebuildClass;
  assetState?: AssetDeferredState;
  typographyRole?: string;
};

export type ScreenAuthorityBlueprint = {
  blueprintId: string;
  authorityId: string;
  viewport: ScreenReplicationFidelityContract['viewport'];
  pageBounds: { width: number; height: number };
  regions: ScreenAuthorityRegion[];
  scrollBehavior: 'PAGE_SCROLL' | 'REGION_SCROLL';
  firstViewportRegions: string[];
};

export type CompositionRelationship = {
  relationshipId: string;
  fromRegionId: string;
  toRegionId: string;
  relationship: string;
};

export type CompositionRelationshipMap = {
  mapId: string;
  authorityId: string;
  relationships: CompositionRelationship[];
};

export type AuthorityRebuildRegionMap = {
  mapId: string;
  authorityId: string;
  regions: Array<{ regionId: string; rebuildClass: AuthorityRebuildClass; label: string }>;
  hostLockedPercent: number;
  authorityControlledPercent: number;
  assetDeferredPercent: number;
  hostBoundarySuspect: boolean;
};

export type ScreenReplicationFidelityScore = {
  STRUCTURE_MATCH: number;
  GEOMETRY_MATCH: number;
  SPACING_MATCH: number;
  TYPOGRAPHY_MATCH: number;
  COMPOSITION_MATCH: number;
  CONTROL_MATCH: number;
  INTERACTION_MATCH: number;
  RESPONSIVE_MATCH: number;
  ASSET_MATCH: number;
  assetMatchStatus: 'VERIFIED' | 'DEFERRED' | 'PARTIAL';
  structuralFidelityHigh: boolean;
};

export type ScreenReplicationDifference = {
  differenceId: string;
  regionId: string | null;
  differenceClass: ScreenReplicationDifferenceClass;
  severity: 'BLOCKING' | 'MAJOR' | 'MINOR';
  description: string;
  masked: boolean;
};

export type ScreenReplicationCaptureSet = {
  referenceUrl: string;
  liveUrl: string;
  overlayUrl: string;
  diffUrl: string;
  viewportWidth: number;
  viewportHeight: number;
};

export type StructuralQaPass = {
  passKind: 'STRUCTURAL' | 'FULL';
  maskedRegionIds: string[];
  scores: ScreenReplicationFidelityScore;
  differences: ScreenReplicationDifference[];
  passed: boolean;
};

export type ScreenReplicationConvergenceState = {
  sessionId: string;
  contractId: string;
  passCount: number;
  structuralQa: StructuralQaPass | null;
  fullQa: StructuralQaPass | null;
  captures: ScreenReplicationCaptureSet | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'STRUCTURAL_AUTHORITY_VERIFIED' | 'BLOCKED' | 'FAILED';
  assetPendingCount: number;
  templateDriftDetected: boolean;
  compositionCloningDetected: boolean;
  wholePageImageCheatDetected: boolean;
};

export type ScreenReplicationInspectorState = {
  authorityId: string;
  viewport: string;
  hostLockedPercent: number;
  authorityControlledPercent: number;
  assetDeferredPercent: number;
  hostBoundarySuspect: boolean;
  scores: ScreenReplicationFidelityScore | null;
  structuralQaPassed: boolean;
  fullQaPassed: boolean;
  assetPendingCount: number;
  convergencePassCount: number;
  differenceClasses: ScreenReplicationDifferenceClass[];
  captures: ScreenReplicationCaptureSet | null;
  mobilePass: boolean;
  desktopStatus: 'GATED' | 'NOT_STARTED' | 'INDEPENDENT';
  statusLabel: string;
};
