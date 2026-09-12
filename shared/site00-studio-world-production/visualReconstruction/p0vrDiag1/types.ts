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
  computedFontWeight?: string | null;
  computedLetterSpacing?: string | null;
  computedTextTransform?: string | null;
  computedDisplay?: string | null;
  computedAlignItems?: string | null;
  computedJustifyContent?: string | null;
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

export const VISUAL_REGION_TYPES = [
  'HEADER',
  'IDENTITY',
  'NAVIGATION',
  'HERO',
  'MEDIA',
  'STATUS',
  'METRICS',
  'CONTENT',
  'LIST',
  'CARD_RAIL',
  'CTA',
  'CONTROLS',
  'FOOTER',
  'PERSISTENT_NAV',
  'CUSTOM',
] as const;
export type VisualRegionType = (typeof VISUAL_REGION_TYPES)[number];

export const REGION_SIGNIFICANCE_LEVELS = ['MAJOR', 'SUPPORTING', 'MINOR'] as const;
export type RegionSignificance = (typeof REGION_SIGNIFICANCE_LEVELS)[number];

export const FORENSIC_CAPTURE_SCOPES = ['CURRENT_VIEWPORT', 'FULL_PAGE', 'SEGMENTED_SCROLL'] as const;
export type ForensicCaptureScope = (typeof FORENSIC_CAPTURE_SCOPES)[number];

export const FORENSIC_COVERAGE_GATE_STATUSES = ['PASS', 'WARNING', 'BLOCK'] as const;
export type ForensicCoverageGateStatus = (typeof FORENSIC_COVERAGE_GATE_STATUSES)[number];

export const FULL_PAGE_FORENSIC_STATUSES = [
  'INCOMPLETE_FORENSICS',
  'READY_FOR_DIRECTION',
  'READY_FOR_TWIN',
  'TWIN_PARTIAL',
  'TWIN_CONVERGED',
  'REVISION_REQUIRED',
  'CURRENT_CAPTURE_SCOPE_INSUFFICIENT',
] as const;
export type FullPageForensicStatus = (typeof FULL_PAGE_FORENSIC_STATUSES)[number];

export type VisualRegionMatch = {
  regionId: string;
  regionName: string;
  regionType?: VisualRegionType;
  significance?: RegionSignificance;
  authorityRegion: VisualRegionBounds | null;
  currentRegion: VisualRegionBounds | null;
  matchConfidence: ForensicConfidence;
  matchMethod: 'DOM_ID' | 'LAYOUT_PROFILE' | 'VISUAL_STRUCTURE' | 'AMBIGUOUS';
  status: RegionMatchStatus;
};

export const DIMENSION_MEASUREMENT_SOURCES = [
  'DOM_RECT',
  'COMPUTED_STYLE',
  'CHILD_ANCHOR',
  'SCREENSHOT_ESTIMATE',
  'AUTHORITY_IMAGE_ESTIMATE',
  'CSS_SNAPSHOT',
  'SHELL_SPEC',
  'LAYOUT_PROFILE',
  'DOM',
  'ESTIMATED',
] as const;
export type DimensionMeasurementSource = (typeof DIMENSION_MEASUREMENT_SOURCES)[number];

export const DIMENSION_IMPORTANCE_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
export type DimensionImportance = (typeof DIMENSION_IMPORTANCE_LEVELS)[number];

export const REGION_MEASUREMENT_DEPTH_STATUSES = [
  'UNMEASURED',
  'SHALLOW',
  'SUFFICIENT',
  'DEEP',
  'BLOCKED',
] as const;
export type RegionMeasurementDepthStatus = (typeof REGION_MEASUREMENT_DEPTH_STATUSES)[number];

export type RegionDimensionEvidence = {
  evidenceId: string;
  regionId: string;
  dimension: string;
  authorityValue: string | number;
  currentValue: string | number;
  delta: string | null;
  deltaPct: number | null;
  unit: 'px' | 'pct' | 'ratio' | 'count' | 'none';
  confidence: ForensicConfidence;
  /** @deprecated use authoritySource/currentSource */
  source: 'DOM' | 'CSS_SNAPSHOT' | 'SHELL_SPEC' | 'LAYOUT_PROFILE' | 'ESTIMATED';
  authoritySource?: DimensionMeasurementSource;
  currentSource?: DimensionMeasurementSource;
  importance?: DimensionImportance;
  alignedWithinTolerance?: boolean;
  measurementConflict?: boolean;
};

export type RegionMeasurementDepth = {
  regionId: string;
  regionType: VisualRegionType;
  requiredDimensions: string[];
  resolvedDimensions: string[];
  missingDimensions: string[];
  depthScore: number;
  confidence: ForensicConfidence;
  status: RegionMeasurementDepthStatus;
};

export type ForensicMeasurementDepthGate = {
  status: ForensicCoverageGateStatus;
  reason: string;
  blockApproveDirection: boolean;
  founderMayProceedWithWarning: boolean;
  majorSufficient: number;
  majorTotal: number;
  shallowMajorRegions: string[];
};

export type GlobalPageMeasurementProfile = {
  pageLeftGutter: number | null;
  pageRightGutter: number | null;
  verticalRhythmGap: number | null;
  contentMaxWidth: number | null;
  sectionCount: number;
  occupiedAreaRatio: number | null;
};

export type RegionReconstructionTargetMap = {
  regionId: string;
  componentId: string | null;
  domPath: string | null;
  layoutParent: string | null;
  styleOwner: string | null;
  confidence: ForensicConfidence;
};

export type DimensionConvergenceResult = {
  regionId: string;
  dimension: string;
  beforeValue: string | number;
  afterValue: string | number;
  authorityValue: string | number;
  beforeDelta: string | null;
  afterDelta: string | null;
  improvementPct: number | null;
  status: 'IMPROVED' | 'UNCHANGED' | 'REGRESSED' | 'UNMEASURED';
};

export const ALIGNMENT_EVIDENCE_VALUES = [
  'LEFT',
  'CENTER',
  'RIGHT',
  'SPACE_BETWEEN',
  'BASELINE',
  'TOP',
  'MIDDLE',
  'BOTTOM',
] as const;
export type AlignmentEvidence = (typeof ALIGNMENT_EVIDENCE_VALUES)[number];

export type RegionComponentTarget = {
  regionId: string;
  componentId: string | null;
  selector: string | null;
  route: string | null;
  confidence: ForensicConfidence;
  unresolvedComponentTarget: boolean;
};

export type RegionForensicsBundle = {
  regionId: string;
  regionName: string;
  regionType: VisualRegionType;
  significance: RegionSignificance;
  status: RegionMatchStatus;
  componentTarget: RegionComponentTarget;
  dimensions: RegionDimensionEvidence[];
  corrections: string[];
  confidence: ForensicConfidence;
  functionalRisk: FunctionalRiskLevel;
  measurementDepth?: RegionMeasurementDepth;
  reconstructionTarget?: RegionReconstructionTargetMap;
};

export type FullPageRegionCoverageMap = {
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string | null;
  captureId: string;
  authorityRegions: string[];
  currentRegions: string[];
  matches: VisualRegionMatch[];
  missingCurrent: string[];
  extraCurrent: string[];
  ambiguous: string[];
  coverageScore: ForensicCoverageScore;
  unresolvedMajorRegions: string[];
  captureScope: ForensicCaptureScope;
  authorityCaptureScope: ForensicCaptureScope;
  scopeMismatch: boolean;
  status: FullPageForensicStatus;
};

export type ForensicCoverageScore = {
  majorAuthorityTotal: number;
  majorAccounted: number;
  majorAccountedPct: number;
  majorWithMeasurementDepth: number;
  /** Major regions with SUFFICIENT or DEEP depth status (1R2). */
  majorWithSufficientDepth: number;
  measurementDepthPct: number;
  ambiguousCount: number;
  score: number;
};

export type ForensicCoverageGate = {
  status: ForensicCoverageGateStatus;
  reason: string;
  blockApproveDirection: boolean;
  founderMayProceedWithWarning: boolean;
};

export type VerticalRhythmGap = {
  fromRegionId: string;
  toRegionId: string;
  fromRegionName: string;
  toRegionName: string;
  authorityGapPx: number | null;
  currentGapPx: number | null;
  deltaPx: number | null;
  confidence: ForensicConfidence;
  correction: string | null;
};

export type VerticalRhythmProfile = {
  evidenceId: string;
  gaps: VerticalRhythmGap[];
};

export type PageGutterProfile = {
  evidenceId: string;
  authorityLeft: number | null;
  authorityRight: number | null;
  currentLeft: number | null;
  currentRight: number | null;
  deltaLeft: number | null;
  deltaRight: number | null;
  confidence: ForensicConfidence;
  correction: string | null;
};

export type TypographyHierarchyLevel = {
  role: string;
  authorityFontSizePx: number | null;
  currentFontSizePx: number | null;
  authorityLineCount: number | null;
  currentLineCount: number | null;
  scaleToBodyRatio: number | null;
  confidence: ForensicConfidence;
};

export type TypographyHierarchyProfile = {
  evidenceId: string;
  levels: TypographyHierarchyLevel[];
  correction: string | null;
};

export type RegionSequenceComparison = {
  evidenceId: string;
  authorityOrder: string[];
  currentOrder: string[];
  mismatch: boolean;
  correction: string | null;
  confidence: ForensicConfidence;
};

export type RegionConvergenceResult = {
  regionId: string;
  regionName: string;
  beforeScore: number;
  afterScore: number;
  improvement: number;
  improvementPct: number;
  remainingIssues: string[];
  status: 'IMPROVED' | 'UNCHANGED' | 'REGRESSED' | 'UNANALYZED';
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
  regionForensics: RegionForensicsBundle[];
  coverageMap: FullPageRegionCoverageMap;
  coverageGate: ForensicCoverageGate;
  measurementDepthGate: ForensicMeasurementDepthGate;
  globalPageProfile: GlobalPageMeasurementProfile | null;
  verticalRhythm: VerticalRhythmProfile | null;
  gutterProfile: PageGutterProfile | null;
  typographyHierarchy: TypographyHierarchyProfile | null;
  regionSequence: RegionSequenceComparison | null;
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
  fullPageStatus: FullPageForensicStatus;
  generatedAt: string;
};

export type RegionReconstructionSpec = {
  regionId: string;
  regionName: string;
  evidenceId: string;
  outcome?: RegionMatchStatus;
  authorityTarget: string;
  currentState: string;
  delta: string;
  correction: string;
  corrections?: string[];
  dimensionDeltas?: RegionDimensionEvidence[];
  measurementDepth?: RegionMeasurementDepth;
  requiredDimensions?: string[];
  resolvedDimensions?: string[];
  missingDimensions?: string[];
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
  coverageGateStatus?: ForensicCoverageGateStatus;
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
