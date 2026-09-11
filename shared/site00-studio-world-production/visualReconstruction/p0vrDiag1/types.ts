/**
 * P0.VR.DIAG.1 — Authority-relative visual forensics types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export const FORENSIC_CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const;
export type ForensicConfidence = (typeof FORENSIC_CONFIDENCE_LEVELS)[number];

export const FUNCTIONAL_RISK_LEVELS = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type FunctionalRiskLevel = (typeof FUNCTIONAL_RISK_LEVELS)[number];

export const REGION_MATCH_STATUSES = ['MATCHED', 'MISSING_CURRENT', 'MISSING_AUTHORITY', 'AMBIGUOUS'] as const;
export type RegionMatchStatus = (typeof REGION_MATCH_STATUSES)[number];

export const ALIGNMENT_STATUSES = ['ALIGNED', 'PARTIAL', 'MISALIGNED', 'INSUFFICIENT_INPUT'] as const;
export type AlignmentStatus = (typeof ALIGNMENT_STATUSES)[number];

export const MEASURED_SPEC_STATUSES = ['DRAFT', 'READY', 'APPROVED', 'EXECUTING', 'VERIFIED', 'STALE'] as const;
export type MeasuredSpecStatus = (typeof MEASURED_SPEC_STATUSES)[number];

export const FORENSICS_VERSION_STATUSES = ['CURRENT', 'STALE', 'SUPERSEDED'] as const;
export type ForensicsVersionStatus = (typeof FORENSICS_VERSION_STATUSES)[number];

export const VISUAL_CATEGORIES = [
  'GEOMETRY',
  'SPACING',
  'TYPOGRAPHY',
  'ASSET',
  'NAVIGATION',
  'ORDER',
  'DENSITY',
  'CONTROL',
  'HIERARCHY',
  'COLOR',
] as const;
export type VisualCategory = (typeof VISUAL_CATEGORIES)[number];

export const CORRECTION_DIRECTIONS = [
  'INCREASE',
  'DECREASE',
  'MOVE',
  'REORDER',
  'ADD',
  'REMOVE',
  'RESIZE',
  'REPLACE',
  'RESTYLE',
] as const;
export type CorrectionDirection = (typeof CORRECTION_DIRECTIONS)[number];

export type NormalizedViewportGeometry = {
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
  widthPct: number;
  heightPct: number;
  aspectRatio: number;
  topOffsetPx: number;
  leftOffsetPx: number;
  rightOffsetPx: number;
  bottomOffsetPx: number;
};

export type DomRegionMeasurement = {
  regionId: string;
  actualX: number;
  actualY: number;
  actualWidth: number;
  actualHeight: number;
  computedPadding?: string | null;
  computedMargin?: string | null;
  computedGap?: string | null;
  computedFontSize?: string | null;
  computedLineHeight?: string | null;
  componentId?: string | null;
};

export type VisualRegionBounds = {
  regionId: string;
  regionName: string;
  category: VisualCategory;
  geometry: NormalizedViewportGeometry;
  componentId?: string | null;
  selectorHint?: string | null;
};

export type VisualRegionMatch = {
  regionId: string;
  regionName: string;
  authorityRegion: VisualRegionBounds | null;
  currentRegion: VisualRegionBounds | null;
  matchConfidence: ForensicConfidence;
  matchMethod: 'DOM_ID' | 'LAYOUT_PROFILE' | 'VISUAL_STRUCTURE' | 'AMBIGUOUS';
  status: RegionMatchStatus;
};

export type GeometryDelta = {
  evidenceId: string;
  regionId: string;
  regionName: string;
  metric: string;
  authority: number | string;
  current: number | string;
  absoluteDelta: number | null;
  relativeDeltaPct: number | null;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: ForensicConfidence;
  direction: CorrectionDirection;
  correction: string;
};

export type SpacingDelta = GeometryDelta & { spacingKind: 'GUTTER' | 'SECTION_GAP' | 'PADDING' | 'MARGIN' | 'ROW_GAP' | 'COLUMN_GAP' };

export type TypographyMeasurement = {
  evidenceId: string;
  regionId: string;
  fontFamily: string | null;
  fontSizePx: number | null;
  lineHeightPx: number | null;
  fontWeight: string | null;
  letterSpacing: string | null;
  textTransform: string | null;
  lineCount: number | null;
  maxWidthPct: number | null;
  alignment: string | null;
  confidence: ForensicConfidence;
  estimated: boolean;
};

export type TypographyDelta = {
  evidenceId: string;
  regionId: string;
  regionName: string;
  authority: TypographyMeasurement;
  current: TypographyMeasurement;
  wrapDifference: string | null;
  correction: string;
  confidence: ForensicConfidence;
  direction: CorrectionDirection;
};

export type AssetVisualMatch = {
  evidenceId: string;
  regionId: string;
  authorityAssetRegion: VisualRegionBounds | null;
  currentAssetRegion: VisualRegionBounds | null;
  matchStatus: 'MATCH' | 'MISSING_CURRENT' | 'MISSING_AUTHORITY' | 'CROP_MISMATCH' | 'SCALE_MISMATCH';
  cropDelta: string | null;
  scaleDelta: string | null;
  positionDelta: string | null;
  confidence: ForensicConfidence;
  correction: string;
};

export type NavigationForensics = {
  evidenceId: string;
  regionId: string;
  itemCountAuthority: number | null;
  itemCountCurrent: number | null;
  spacingDeltaPx: number | null;
  heightDeltaPx: number | null;
  activeStateMismatch: boolean;
  orderMismatch: boolean;
  confidence: ForensicConfidence;
  correction: string;
  functionalRisk: FunctionalRiskLevel;
};

export type OrderStackForensics = {
  evidenceId: string;
  regionId: string;
  authorityOrder: string[];
  currentOrder: string[];
  mismatch: boolean;
  correction: string;
  confidence: ForensicConfidence;
};

export type ContentDensityMeasurement = {
  regionId: string;
  elementsPerViewport: number | null;
  occupiedAreaRatio: number | null;
  whiteSpaceRatio: number | null;
  cardCountVisible: number | null;
  confidence: ForensicConfidence;
};

export type DensityDelta = {
  evidenceId: string;
  regionId: string;
  regionName: string;
  authority: ContentDensityMeasurement;
  current: ContentDensityMeasurement;
  relativeDeltaPct: number | null;
  correction: string;
  confidence: ForensicConfidence;
};

export type ControlForensics = {
  evidenceId: string;
  regionId: string;
  controlKind: string;
  authorityHeightPx: number | null;
  currentHeightPx: number | null;
  authorityWidthPx: number | null;
  currentWidthPx: number | null;
  borderRadiusDelta: string | null;
  correction: string;
  confidence: ForensicConfidence;
};

export type HierarchyDifference = {
  evidenceId: string;
  dominantAuthority: string;
  dominantCurrent: string;
  titleProminenceDelta: string | null;
  heroProminenceDelta: string | null;
  ctaProminenceDelta: string | null;
  navProminenceDelta: string | null;
  confidence: ForensicConfidence;
};

export type FunctionalRiskAssessment = {
  evidenceId: string;
  changeSummary: string;
  risk: FunctionalRiskLevel;
  rationale: string;
};

export type VisualImpactScore = {
  evidenceId: string;
  regionId: string;
  score: number;
  areaWeight: number;
  hierarchyWeight: number;
  geometryWeight: number;
  salienceWeight: number;
};

export type AuthorityRelativeForensicsReport = {
  reportId: string;
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string | null;
  captureId: string;
  alignmentStatus: AlignmentStatus;
  regionMatches: VisualRegionMatch[];
  geometryDiffs: GeometryDelta[];
  spacingDiffs: SpacingDelta[];
  typographyDiffs: TypographyDelta[];
  assetDiffs: AssetVisualMatch[];
  navigationDiffs: NavigationForensics[];
  orderDiffs: OrderStackForensics[];
  densityDiffs: DensityDelta[];
  controlDiffs: ControlForensics[];
  hierarchyDiffs: HierarchyDifference[];
  missingRegions: string[];
  extraRegions: string[];
  topImpactItems: VisualImpactScore[];
  confidenceSummary: Record<ForensicConfidence, number>;
  functionalRiskSummary: FunctionalRiskAssessment[];
  generatedAt: string;
};

export type RegionReconstructionSpec = {
  regionId: string;
  regionName: string;
  evidenceId: string;
  authorityTarget: string;
  currentState: string;
  delta: string;
  correction: string;
  visualCategory: VisualCategory;
  confidence: ForensicConfidence;
  functionalRisk: FunctionalRiskLevel;
  direction: CorrectionDirection;
  dependencies: string[];
  componentId: string | null;
  selectorHint: string | null;
  unresolvedComponentTarget: boolean;
  status: 'PENDING' | 'FOUNDER_OVERRIDE_KEEP_CURRENT' | 'APPROVED' | 'EXCLUDED';
};

export type MeasuredReconstructionSpec = {
  specId: string;
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string | null;
  captureId: string;
  forensicsReportId: string;
  regionSpecs: RegionReconstructionSpec[];
  functionalConstraints: string[];
  assetRequirements: string[];
  responsiveRequirements: string[];
  confidenceSummary: Record<ForensicConfidence, number>;
  status: MeasuredSpecStatus;
  generatedAt: string;
};

export type ForensicsVersion = {
  versionId: string;
  authorityVersionId: string | null;
  captureId: string;
  reportId: string;
  specId: string;
  createdAt: string;
  status: ForensicsVersionStatus;
};

export type VisualConvergenceScore = {
  geometry: number;
  spacing: number;
  typography: number;
  assets: number;
  hierarchy: number;
  controls: number;
  order: number;
  function: number;
  overall: number;
};

export type FounderForensicOverride = {
  evidenceId: string;
  who: string;
  when: string;
  action: 'KEEP_CURRENT' | 'EXCLUDE' | 'NOTE';
  reason: string;
};

export type ForensicsCaptureInput = {
  captureId: string;
  width: number;
  height: number;
  imageRef?: string | null;
  domMeasurements?: DomRegionMeasurement[];
  cssSnapshot?: Record<string, string | number>;
};

export type ForensicsAuthorityInput = {
  authorityVersionId: string | null;
  width: number;
  height: number;
  assetRef?: string | null;
  referenceType?: 'VIEWPORT_SCREENSHOT' | 'FULL_PAGE_REFERENCE';
  visualShellSpec?: {
    headerHeightPx: number;
    headerPaddingX: number;
    contentPaddingX: number;
    sectionGap: number;
    bottomNavHeightPx: number;
    viewportWidth: number;
    viewportHeight: number;
  } | null;
};

export type AuthorityRelativeForensicsInput = {
  pageId: string;
  viewport: DesignViewportClass;
  pageArchetype: string;
  screenId?: string;
  route?: string;
  currentCapture: ForensicsCaptureInput;
  designAuthority: ForensicsAuthorityInput;
  domMeasurements?: DomRegionMeasurement[];
  componentMap?: Array<{ regionId: string; componentId: string; selectorHint?: string | null }>;
};
