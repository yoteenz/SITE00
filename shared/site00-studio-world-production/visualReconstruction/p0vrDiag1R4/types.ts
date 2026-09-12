/**
 * P0.VR.DIAG.1R4 — Targeted shallow-region evidence recovery types.
 */

import type {
  ForensicConfidence,
  QualifiedDimensionEvidence,
  RegionMeasurementDepthStatus,
  VisualRegionType,
} from '../p0vrDiag1/types.js';

export const RECOVERY_METHODS = [
  'DOM_TARGET_RECOVERY',
  'CHILD_ANCHOR_EXTRACTION',
  'COMPUTED_STYLE_EXTRACTION',
  'AUTHORITY_REGION_REMEASURE',
  'AUTHORITY_CHILD_ANCHOR_REMEASURE',
  'SCROLL_SCOPE_EXPANSION',
  'SEGMENTED_CAPTURE_REQUIRED',
  'MANUAL_REGION_CONFIRMATION',
  'NOT_MEASURABLE',
] as const;
export type RegionEvidenceRecoveryMethod = (typeof RECOVERY_METHODS)[number];

export const REGION_TARGET_CONFIDENCE_VALUES = ['HIGH', 'MEDIUM', 'LOW', 'UNRESOLVED'] as const;
export type RegionTargetConfidence = (typeof REGION_TARGET_CONFIDENCE_VALUES)[number];

export type BlockingRegion = {
  regionId: string;
  regionName: string;
  regionType: VisualRegionType;
  depthStatus: RegionMeasurementDepthStatus;
  reasons: string[];
};

export type DomTargetCandidate = {
  selector: string;
  componentId: string | null;
  confidence: RegionTargetConfidence;
  signals: string[];
  usesNthChild: boolean;
};

export type DomTargetRecovery = {
  regionId: string;
  candidateTargets: DomTargetCandidate[];
  chosenTarget: DomTargetCandidate | null;
  matchConfidence: RegionTargetConfidence;
  matchSignals: string[];
  status: 'RESOLVED' | 'AMBIGUOUS' | 'UNRESOLVED' | 'OUT_OF_SCOPE';
};

export type RegionChildAnchor = {
  anchorId: string;
  role: string;
  x: number;
  y: number;
  width: number;
  height: number;
  source: 'DOM_RECT' | 'CHILD_ANCHOR';
  confidence: ForensicConfidence;
};

export type AuthorityRegionMeasurementPass = {
  regionId: string;
  authorityBounds: { x: number; y: number; width: number; height: number };
  childAnchors: RegionChildAnchor[];
  dimensions: string[];
  confidence: ForensicConfidence;
  status: 'COMPLETE' | 'PARTIAL' | 'SKIPPED' | 'FAILED';
};

export type RegionEvidenceCompleteness = {
  regionId: string;
  criticalExpected: number;
  criticalResolved: number;
  highExpected: number;
  highResolved: number;
  optionalResolved: number;
  completenessPct: number;
  status: RegionMeasurementDepthStatus;
  blockingMissing: string[];
};

export type RegionEvidenceRecoveryPlan = {
  regionId: string;
  regionType: VisualRegionType;
  currentDepthStatus: RegionMeasurementDepthStatus;
  qualifiedDimensions: QualifiedDimensionEvidence[];
  missingCriticalDimensions: string[];
  missingHighDimensions: string[];
  currentDomTargetStatus: DomTargetRecovery['status'];
  authorityMeasurementStatus: AuthorityRegionMeasurementPass['status'];
  recommendedRecoveryMethod: RegionEvidenceRecoveryMethod;
  reason: string;
};

export const FOUNDER_REGION_OVERRIDE_ACTIONS = [
  'KEEP_CURRENT',
  'EXCLUDE_FROM_RECONSTRUCTION',
  'CONFIRM_MATCH',
  'RETRY_ANALYSIS',
] as const;
export type FounderRegionOverrideAction = (typeof FOUNDER_REGION_OVERRIDE_ACTIONS)[number];

export type FounderRegionOverride = {
  regionId: string;
  action: FounderRegionOverrideAction;
  who: string;
  when: string;
  reason: string;
};

export type RegionEvidenceRecoveryReceipt = {
  forensicsVersionBefore: string;
  forensicsVersionAfter: string;
  regionsAttempted: string[];
  regionsImproved: string[];
  regionsStillBlocked: string[];
  dimensionsAdded: number;
  captureRequired: boolean;
  captureScopeReason: string | null;
  status: 'RECOVERY_COMPLETE' | 'PARTIAL' | 'NO_PROGRESS' | 'CAPTURE_SCOPE_INSUFFICIENT';
  depthBefore: { sufficient: number; total: number; pct: number; gateStatus: string };
  depthAfter: { sufficient: number; total: number; pct: number; gateStatus: string };
  regionTransitions: Array<{ regionId: string; regionName: string; before: RegionMeasurementDepthStatus; after: RegionMeasurementDepthStatus }>;
  plans: RegionEvidenceRecoveryPlan[];
  structureTraces?: import('../p0vrDiag1R5/types.js').InternalStructureRecoveryTrace[];
  recoveryFailures?: import('../p0vrDiag1R5/types.js').EvidenceRecoveryFailure[];
  dimensionTypeRepair?: import('../p0vrDiag1R5/types.js').DimensionTypeRepairReceipt | null;
  rootCauseSummary?: string | null;
  createdAt: string;
};

export type RecoveredDimensionProvenance = {
  dimension: string;
  source: string;
  sourceId: string;
  regionId: string;
  extractionMethod: RegionEvidenceRecoveryMethod;
  confidence: ForensicConfidence;
  timestamp: string;
};

export type RegionEvidenceRecoveryHistoryEntry = {
  receipt: RegionEvidenceRecoveryReceipt;
  provenance: RecoveredDimensionProvenance[];
};
