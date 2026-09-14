/** P0.VR.TWINV3.0R6F1 — pixel-grounded measurement types */

import type { DesignWorkspaceViewport } from '../designWorkspaceAuthorityTypes.js';
import type { SurgicalBlueprintObject, BlueprintRelationship } from './types.js';

export type ReadinessScope = 'DERIVATION' | 'REVIEW' | 'BUILD';

export type ReadinessStage =
  | 'DERIVATION_READY'
  | 'DERIVATION_COMPLETE'
  | 'CORRECTION_IN_PROGRESS'
  | 'FOUNDER_REVIEW_READY'
  | 'BUILD_REVIEW_READY'
  | 'BUILD_READY'
  | 'BLOCKED';

export type VisualImportanceLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type PixelMeasuredObject = SurgicalBlueprintObject & {
  normalizedX: number;
  normalizedY: number;
  normalizedWidth: number;
  normalizedHeight: number;
  centerX: number;
  centerY: number;
  visualImportance: VisualImportanceLevel;
  pixelSource: 'MEASURED' | 'TEMPLATE_SCALED';
  internalGeometry?: {
    paddingTop: number;
    paddingLeft: number;
    paddingRight: number;
    paddingBottom: number;
    iconToLabelGap?: number;
  };
  typographyBlock?: {
    lineCount: number;
    approximateLineWidthPx: number;
    alignment: 'LEFT' | 'CENTER' | 'RIGHT';
    casing: 'UPPERCASE' | 'MIXED' | 'UNKNOWN';
  };
  imageBounds?: {
    aspectRatio: number;
    cropMode: 'CONTAIN' | 'COVER' | 'UNKNOWN';
    clipParentId: string | null;
  };
};

export type DetectedVisualCandidate = {
  candidateId: string;
  category: string;
  importance: VisualImportanceLevel;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
};

export type PixelGroundedAuthorityAnalysis = {
  id: string;
  authorityImageId: string;
  authorityImageHash: string;
  viewport: DesignWorkspaceViewport;
  imageWidthPx: number;
  imageHeightPx: number;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  rowBandAdjustments: number[];
  detectedCandidates: DetectedVisualCandidate[];
  measuredObjects: PixelMeasuredObject[];
  analysisOnly: true;
  version: number;
};

export type ObjectGranularityReceipt = {
  id: string;
  viewport: DesignWorkspaceViewport;
  visibleImplementationCandidates: number;
  mappedObjects: number;
  collapsedObjectWarnings: string[];
  omittedObjectWarnings: string[];
  granularityConfidence: number;
  result: 'PASS' | 'FAIL';
};

export type AuthorityVisualCoverageReceipt = {
  id: string;
  viewport: DesignWorkspaceViewport;
  detectedObjects: number;
  mappedObjects: number;
  unmappedObjects: number;
  highImportanceUnmapped: number;
  mediumImportanceUnmapped: number;
  lowImportanceUnmapped: number;
  coveragePercent: number;
  result: 'PASS' | 'FAIL';
};

export type WeightedAuthorityCoverageReceipt = {
  id: string;
  viewport: DesignWorkspaceViewport;
  rawCoveragePercent: number;
  weightedCoveragePercent: number;
  criticalCoveragePercent: number;
  highCoveragePercent: number;
  result: 'PASS' | 'FAIL';
};

export type VisualClusterMap = {
  id: string;
  authorityPairId: string;
  clusters: {
    clusterId: string;
    viewport: DesignWorkspaceViewport;
    label: string;
    objectIds: string[];
  }[];
  version: number;
};

export type ResponsiveObjectCorrespondenceMap = {
  id: string;
  authorityPairId: string;
  entries: {
    featureId: string;
    mobileObjectIds: string[];
    desktopObjectIds: string[];
    transformationClass: string;
  }[];
  version: number;
};

export type BlueprintTranslationGap = {
  id: string;
  viewport: DesignWorkspaceViewport;
  objectReference: string;
  gapType: string;
  confidence: number;
  reason: string;
  blocksBuild: boolean;
  blocksReview: boolean;
};

export type TranslationReviewRecord = {
  id: string;
  derivationRunId: string;
  authorityPairId: string;
  packageId: string;
  founderDecision: 'APPROVE_TRANSLATION' | 'REQUEST_DERIVATION_CORRECTION' | 'PENDING';
  reviewNotes: string;
  requestedCorrections: string[];
  approvedAt: string | null;
  rejectedAt: string | null;
  reviewedBy: string | null;
};

export type ScopedCompilerCheck = {
  gate: string;
  scope: ReadinessScope;
  result: 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_APPLICABLE';
  detail: string;
};

export type PixelGroundedSurgicalObjectMap = {
  id: string;
  authorityPairId: string;
  objects: PixelMeasuredObject[];
  relationships: BlueprintRelationship[];
  version: number;
  derivationAlgorithm: 'R6F1' | 'R6F2';
};

export const DERIVATION_ALGORITHM_R6F1 = 'R6F1' as const;

export const MIN_SURGICAL_OBJECTS_PER_VIEWPORT = 24;
