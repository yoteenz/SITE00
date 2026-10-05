/** P0.VR.TWINV3.0R6F2 — exact visual boundary + geometry fidelity types */

import type { DesignWorkspaceViewport } from '../designWorkspaceAuthorityTypes.js';
import type { PixelMeasuredObject, VisualImportanceLevel } from './pixelGroundedTypes.js';

export const DERIVATION_ALGORITHM_R6F2 = 'R6F2' as const;

export type GeometrySource =
  | 'PIXEL_EDGE'
  | 'TEXT_EXTENT'
  | 'VISIBLE_CONTAINER'
  | 'ASSET_BOUND'
  | 'LINE_DETECTION'
  | 'PARENT_INFERENCE'
  | 'STRUCTURAL_INFERENCE'
  | 'MANUAL_OVERRIDE'
  | 'LOW_CONFIDENCE_INFERENCE';

export type GeometryConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type VisualBounds = { x: number; y: number; w: number; h: number };

export type LineGeometry = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  orientation: 'HORIZONTAL' | 'VERTICAL' | 'DIAGONAL';
};

export type ExactPixelMeasuredObject = PixelMeasuredObject & {
  predictedBounds: VisualBounds;
  visualBounds: VisualBounds;
  interactionBounds: VisualBounds;
  geometrySource: GeometrySource;
  geometryConfidence: number;
  geometryConfidenceLevel: GeometryConfidenceLevel;
  lineGeometry?: LineGeometry;
  supersededObjectId?: string | null;
  derivationAlgorithm: 'R6F2';
};

export type ObjectBoundaryFidelityReceipt = {
  id: string;
  objectId: string;
  viewport: DesignWorkspaceViewport;
  objectType: string;
  visualImportance: VisualImportanceLevel;
  predictedBounds: VisualBounds;
  refinedBounds: VisualBounds;
  boundaryConfidence: number;
  surroundingWhitespaceRatio: number;
  foreignPixelContaminationEstimate: number;
  parentContainmentValid: boolean;
  siblingOverlapValid: boolean;
  edgeAlignmentConfidence: number;
  geometrySource: GeometrySource;
  result: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
};

export type ObjectOverlapAuditEntry = {
  objectA: string;
  objectB: string;
  viewport: DesignWorkspaceViewport;
  classification: 'VALID_PARENT_CHILD' | 'VALID_VISUAL_OVERLAY' | 'INVALID_COLLISION' | 'AMBIGUOUS';
  overlapIoU: number;
};

export type ObjectOverlapAudit = {
  id: string;
  viewport: DesignWorkspaceViewport;
  entries: ObjectOverlapAuditEntry[];
  invalidCollisions: number;
};

export type GeometryFidelityReceipt = {
  id: string;
  viewport: DesignWorkspaceViewport;
  objectsEvaluated: number;
  exactPassObjects: number;
  reviewRequiredObjects: number;
  failedObjects: number;
  criticalGeometryFailures: number;
  highGeometryFailures: number;
  invalidSiblingOverlaps: number;
  averageBoundaryConfidence: number;
  weightedGeometryFidelityPercent: number;
  objectCoveragePercent: number;
  result: 'PASS' | 'FAIL';
};

export type ObjectGeometryOverride = {
  id: string;
  objectId: string;
  viewport: DesignWorkspaceViewport;
  priorBounds: VisualBounds;
  correctedBounds: VisualBounds;
  reason: string;
  overriddenBy: string;
  timestamp: string;
  derivationVersion: number;
};

export type ExactBoundaryAnalysis = {
  id: string;
  authorityImageId: string;
  viewport: DesignWorkspaceViewport;
  measuredObjects: ExactPixelMeasuredObject[];
  boundaryReceipts: ObjectBoundaryFidelityReceipt[];
  overlapAudit: ObjectOverlapAudit;
  geometryFidelityReceipt: GeometryFidelityReceipt;
  version: 2;
};
