/**
 * P0.VR.DIAG.1R5 — Internal region structure + child-anchor forensics types.
 */

import type { ForensicConfidence, VisualRegionType } from '../p0vrDiag1/types.js';

export const INTERNAL_STRUCTURE_STATUSES = ['UNRESOLVED', 'PARTIAL', 'RESOLVED', 'AMBIGUOUS', 'UNSUPPORTED'] as const;
export type InternalStructureStatus = (typeof INTERNAL_STRUCTURE_STATUSES)[number];

export const ANCHOR_TYPES = [
  'CONTAINER',
  'ITEM',
  'ACTIVE_ITEM',
  'ACTIVE_INDICATOR',
  'TRACK',
  'FILL',
  'DIVIDER',
  'CELL',
  'ICON',
  'VALUE',
  'LABEL',
  'TITLE',
  'DATE',
  'CTA',
  'IMAGE',
  'CARD',
  'RAIL',
  'BADGE',
  'BORDER',
  'REPEATED_BLOCK',
  'CUSTOM',
] as const;
export type RegionChildAnchorType = (typeof ANCHOR_TYPES)[number];

export const RELATIONSHIP_TYPES = [
  'CONTAINS',
  'NEXT_TO',
  'ABOVE',
  'BELOW',
  'ALIGNED_LEFT',
  'ALIGNED_RIGHT',
  'ALIGNED_CENTER',
  'EQUAL_WIDTH',
  'EQUAL_HEIGHT',
  'SPACED_BY',
  'OVERLAPS',
  'ACTIVE_STATE_OF',
  'DIVIDES',
  'FOLLOWS',
  'PRECEDES',
] as const;
export type RegionRelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const DIMENSION_VALUE_TYPES_R5 = [
  'PIXEL',
  'PERCENT',
  'COUNT',
  'RATIO',
  'BOOLEAN',
  'ENUM',
  'RANGE',
  'COORDINATE',
] as const;
export type DimensionValueTypeR5 = (typeof DIMENSION_VALUE_TYPES_R5)[number];

export const COMPLEX_REGION_SUBTYPES = ['MILESTONE', 'CARD_RAIL', 'COMPOSITE', 'AMBIGUOUS'] as const;
export type ComplexRegionSubtype = (typeof COMPLEX_REGION_SUBTYPES)[number];

export const RECOVERY_FAILURE_CODES = [
  'DOM_CHILDREN_UNRESOLVED',
  'AUTHORITY_ANCHORS_UNRESOLVED',
  'REGION_TYPE_AMBIGUOUS',
  'CAPTURE_SCOPE_INSUFFICIENT',
  'STRUCTURE_UNSUPPORTED',
  'MEASUREMENT_CONFLICT',
  'NO_BLOCKING_REGIONS',
] as const;
export type EvidenceRecoveryFailureCode = (typeof RECOVERY_FAILURE_CODES)[number];

export type AnchorBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
  xPctWithinRegion?: number;
  yPctWithinRegion?: number;
  widthPctOfRegion?: number;
  heightPctOfRegion?: number;
};

export type RegionChildAnchorR5 = {
  anchorId: string;
  anchorType: RegionChildAnchorType;
  label: string;
  bounds: AnchorBounds;
  source: 'DOM_RECT' | 'CHILD_ANCHOR' | 'AUTHORITY_IMAGE_ESTIMATE';
  confidence: ForensicConfidence;
  parentAnchorId: string | null;
  orderIndex: number;
  metadata?: Record<string, string | number | boolean>;
};

export type RegionRelationship = {
  fromAnchorId: string;
  toAnchorId: string;
  relationshipType: RegionRelationshipType;
  value: string | number | null;
  confidence: ForensicConfidence;
};

export type RepeatedAnchorGroup = {
  groupType: 'NAV_ITEMS' | 'METRIC_CELLS' | 'CARDS' | 'LIST_ROWS' | 'TABS';
  anchors: RegionChildAnchorR5[];
  count: number;
  sharedGeometry: { width: number; height: number } | null;
  spacingProfile: { meanGap: number; minGap: number; maxGap: number; variance: number; equalSpacing: boolean };
  confidence: ForensicConfidence;
};

export type RegionInternalStructure = {
  regionId: string;
  regionType: VisualRegionType;
  subtype?: ComplexRegionSubtype;
  container: RegionChildAnchorR5 | null;
  childAnchors: RegionChildAnchorR5[];
  groups: RepeatedAnchorGroup[];
  relationships: RegionRelationship[];
  structureConfidence: ForensicConfidence;
  status: InternalStructureStatus;
};

export type ChildAnchorCorrespondence = {
  authorityAnchorId: string;
  currentAnchorId: string;
  matchConfidence: ForensicConfidence;
  matchSignals: string[];
  status: 'MATCHED' | 'UNMATCHED' | 'AMBIGUOUS';
};

export type InternalStructureMeasurement = {
  regionId: string;
  measurementType: string;
  authorityValue: string | number;
  currentValue: string | number;
  delta: string | null;
  valueType: DimensionValueTypeR5;
  unit: 'px' | 'pct' | 'ratio' | 'count' | 'none';
  sourceAnchors: string[];
  confidence: ForensicConfidence;
};

export type InternalStructureCompleteness = {
  regionId: string;
  expectedAnchors: string[];
  resolvedAnchors: string[];
  missingAnchors: string[];
  completenessPct: number;
  status: InternalStructureStatus;
};

export type EvidenceRecoveryFailure = {
  regionId: string;
  failureCode: EvidenceRecoveryFailureCode;
  failedStage: 'DOM_STRUCTURE' | 'AUTHORITY_STRUCTURE' | 'CORRESPONDENCE' | 'MEASUREMENT' | 'MERGE';
  details: string;
  recommendedNextAction: string;
};

export type DimensionTypeRepairReceipt = {
  forensicsVersionBefore: string;
  forensicsVersionAfter: string;
  dimensionsReclassified: number;
  regionsAffected: string[];
  rawEvidencePreserved: boolean;
  createdAt: string;
};

export type InternalStructureConvergence = {
  regionId: string;
  anchorMatchBefore: number;
  anchorMatchAfter: number;
  dimensionMatchBefore: number;
  dimensionMatchAfter: number;
  relationshipMatchBefore: number;
  relationshipMatchAfter: number;
  remainingIssues: string[];
};

export type InternalStructureRecoveryTrace = {
  regionId: string;
  regionName: string;
  validDimensionsBefore: number;
  validDimensionsAfter: number;
  structureStatus: InternalStructureStatus;
  recoveredDimensions: string[];
  failure?: EvidenceRecoveryFailure;
};
