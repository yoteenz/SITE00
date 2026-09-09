/**
 * P0.VR.6R2 — Canonical visual convergence engine.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { AuthorityMode, FidelityMode } from '../p0vr7/types.js';

export const P0_VR_6R2_LINEAGE = 'P0.VR.6R2' as const;

export const DESIGN_VISUAL_VERIFICATION_STATUSES = [
  'NOT_STARTED',
  'CAPTURE_PENDING',
  'COMPARISON_PENDING',
  'DRIFT_FOUND',
  'CORRECTION_IN_PROGRESS',
  'RECAPTURE_PENDING',
  'HIGH_MATCH',
  'FOUNDER_REVIEW_REQUIRED',
  'VERIFIED',
  'BLOCKED',
] as const;
export type DesignVisualVerificationStatus = (typeof DESIGN_VISUAL_VERIFICATION_STATUSES)[number];

export const PAGE_VISUAL_VERIFICATION_STATUSES = [
  'MISSING_REF',
  'REFERENCE_READY',
  'IMPLEMENTING',
  'VISUAL_QA',
  'DRIFT',
  'HIGH_MATCH',
  'VERIFIED',
  'BLOCKED',
] as const;
export type PageVisualVerificationStatus = (typeof PAGE_VISUAL_VERIFICATION_STATUSES)[number];

export const VISUAL_DRIFT_TYPES = [
  'SHELL_DRIFT',
  'GLOBAL_GEOMETRY_DRIFT',
  'COMPONENT_POSITION_DRIFT',
  'COMPONENT_SIZE_DRIFT',
  'TYPOGRAPHY_DRIFT',
  'LINE_HEIGHT_DRIFT',
  'SPACING_DRIFT',
  'COLOR_ROLE_DRIFT',
  'BORDER_DRIFT',
  'RADIUS_DRIFT',
  'ASSET_POSITION_DRIFT',
  'ASSET_SCALE_DRIFT',
  'ASSET_FIDELITY_DRIFT',
  'DENSITY_DRIFT',
  'RESPONSIVE_DRIFT',
  'TEXT_COLLISION',
  'TEXT_CLIPPING',
  'HORIZONTAL_OVERFLOW',
  'ICON_SUBSTITUTION',
  'STATE_VISUAL_DRIFT',
] as const;
export type VisualDriftType = (typeof VISUAL_DRIFT_TYPES)[number];

export const DRIFT_SEVERITIES = ['BLOCKER', 'MAJOR', 'MODERATE', 'MINOR', 'ACCEPTABLE_VARIANCE'] as const;
export type DriftSeverity = (typeof DRIFT_SEVERITIES)[number];

export const VERIFICATION_SOURCES = ['SYSTEM', 'FOUNDER'] as const;
export type VerificationSource = (typeof VERIFICATION_SOURCES)[number];

export const CONVERGENCE_HISTORY_EVENTS = [
  'LIVE_CAPTURED',
  'OVERLAY_CREATED',
  'DRIFT_DETECTED',
  'CORRECTION_PLAN_CREATED',
  'CORRECTION_APPLIED',
  'RECAPTURED',
  'HIGH_MATCH',
  'FOUNDER_VERIFIED',
  'SYSTEM_VERIFIED',
] as const;
export type ConvergenceHistoryEvent = (typeof CONVERGENCE_HISTORY_EVENTS)[number];

export const REFERENCE_VISUAL_REGION_ROLES = [
  'SHELL',
  'HEADER',
  'HERO',
  'NAVIGATION',
  'TAB_BAR',
  'VIEWPORT_SELECTOR',
  'STEPPER',
  'PRIMARY_CONTENT',
  'CARD_GRID',
  'UTILITY_ROWS',
  'FOOTER',
  'BOTTOM_NAV',
] as const;
export type ReferenceVisualRegionRole = (typeof REFERENCE_VISUAL_REGION_ROLES)[number];

export const DYNAMIC_MASK_KINDS = [
  'COUNT',
  'DATE',
  'USER_NAME',
  'PROJECT_NAME',
  'DYNAMIC_STATUS',
  'LIVE_IMAGE',
] as const;
export type DynamicMaskKind = (typeof DYNAMIC_MASK_KINDS)[number];

export type VisualComparisonNormalization = {
  referenceCanvasWidth: number;
  referenceCanvasHeight: number;
  liveCanvasWidth: number;
  liveCanvasHeight: number;
  normalizedWidth: number;
  normalizedHeight: number;
  scaleApplied: number;
  cropApplied: boolean;
  devicePixelRatio: number;
  browserChromeExcluded: boolean;
  safeAreaExcluded: boolean;
};

export type ReferenceVisualRegion = {
  regionId: string;
  referenceId: string;
  semanticRole: ReferenceVisualRegionRole | string;
  parentRegionId: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  normalizedX: number;
  normalizedY: number;
  normalizedWidth: number;
  normalizedHeight: number;
  dynamicContent: boolean;
  maskDuringDiff: boolean;
  priority: number;
  expectedAssetSlot: string | null;
};

export type DynamicContentMask = {
  maskId: string;
  regionId: string;
  kind: DynamicMaskKind;
  description: string;
};

export type VisualOverlayArtifact = {
  artifactId: string;
  sessionId: string;
  iterationNumber: number;
  referenceOnlyPath: string | null;
  liveOnlyPath: string | null;
  overlayPath: string | null;
  diffPath: string | null;
  opacity: number;
  createdAt: string;
};

export type VisualDeltaMeasurement = {
  measurementId: string;
  regionId: string;
  componentId: string | null;
  deltaX: number | null;
  deltaY: number | null;
  deltaWidth: number | null;
  deltaHeight: number | null;
  deltaFontSize: number | null;
  deltaLineHeight: number | null;
  deltaSpacing: number | null;
  deltaColor: string | null;
  deltaRadius: number | null;
  deltaBorderWidth: number | null;
  assetScaleDelta: number | null;
  driftType: VisualDriftType;
  severity: DriftSeverity;
  confidence: number;
  masked: boolean;
  description: string;
};

export type VisualConvergenceCorrection = {
  target: string;
  instruction: string;
  requiresCodeChange: boolean;
  requiresAssetChange: boolean;
  requiresFounderInput: boolean;
};

export type VisualConvergenceCorrectionPlan = {
  planId: string;
  comparisonSessionId: string;
  iteration: number;
  findings: VisualDeltaMeasurement[];
  corrections: VisualConvergenceCorrection[];
  priorityOrder: string[];
  estimatedScope: 'CSS' | 'LAYOUT' | 'ASSET' | 'MIXED';
  requiresCodeChange: boolean;
  requiresAssetChange: boolean;
  requiresFounderInput: boolean;
  status: 'PENDING' | 'APPLIED' | 'BLOCKED';
  createdAt: string;
};

export type VisualConvergenceIteration = {
  iterationId: string;
  comparisonSessionId: string;
  iterationNumber: number;
  captureBeforeId: string | null;
  overlayId: string | null;
  deltaSetId: string | null;
  correctionPlanId: string | null;
  captureAfterId: string | null;
  statusBefore: DesignVisualVerificationStatus;
  statusAfter: DesignVisualVerificationStatus;
  startedAt: string;
  completedAt: string | null;
};

export type DesignReferenceComparisonSession = {
  sessionId: string;
  contractId: string;
  projectId: string;
  pageId: string | null;
  assetId: string | null;
  referenceId: string;
  viewport: DesignViewportClass;
  authorityMode: AuthorityMode;
  fidelityMode: FidelityMode;
  targetRoute: string;
  referenceWidth: number;
  referenceHeight: number;
  liveCaptureId: string | null;
  iterationNumber: number;
  maxAutomaticIterations: number;
  status: DesignVisualVerificationStatus;
  verificationSource: VerificationSource | null;
  normalization: VisualComparisonNormalization | null;
  regions: ReferenceVisualRegion[];
  dynamicMasks: DynamicContentMask[];
  latestOverlay: VisualOverlayArtifact | null;
  latestDeltas: VisualDeltaMeasurement[];
  latestCorrectionPlan: VisualConvergenceCorrectionPlan | null;
  iterations: VisualConvergenceIteration[];
  historyEvents: Array<{ event: ConvergenceHistoryEvent; at: string; detail?: string }>;
  numericScore: number | null;
  startedAt: string;
  completedAt: string | null;
};

export type DesignExecutionFidelityEnvelope = {
  envelopeId: string;
  contractId: string;
  referenceId: string;
  authorityMode: AuthorityMode;
  fidelityMode: FidelityMode;
  viewport: DesignViewportClass;
  geometryProfile: unknown;
  typographyProfile: unknown;
  spacingProfile: unknown;
  assetManifest: unknown[];
  dynamicMasks: DynamicContentMask[];
  requiredVisualQa: boolean;
  convergencePolicy: {
    visualConvergenceRequired: boolean;
    overlayQaRequired: boolean;
    regionDeltaAnalysisRequired: boolean;
    correctionLoopRequired: boolean;
    maxIterations: number;
  };
  verificationRequired: boolean;
  visualConvergenceSessionId: string | null;
};

export const P0_VR_6R2_FAILURE_CODES = [
  'VISUAL_CONVERGENCE_NOT_RUN',
  'VISUAL_REFERENCE_CAPTURE_MISSING',
  'VISUAL_OVERLAY_MISSING',
  'VISUAL_DELTA_MEASUREMENT_MISSING',
  'VISUAL_CORRECTION_PLAN_MISSING',
  'VISUAL_RECAPTURE_MISSING',
  'VISUAL_FALSE_VERIFICATION',
  'VISUAL_EXECUTOR_SELF_PASS',
  'VISUAL_DYNAMIC_MASK_INVALID',
  'VISUAL_MAX_ITERATIONS_REACHED',
  'VISUAL_ASSET_CORRECTION_REQUIRES_SPEND',
  'VISUAL_VIEWPORT_AUTHORITY_MISMATCH',
] as const;
export type P0VR6R2FailureCode = (typeof P0_VR_6R2_FAILURE_CODES)[number];
