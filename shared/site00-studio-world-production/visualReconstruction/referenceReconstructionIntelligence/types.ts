/**
 * Reference Reconstruction Intelligence — core types (5-layer methodology).
 * P0.VR.6R5 — MEASURE → INFER → CONSTRAIN → CONVERGE → VERIFY
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { AuthorityMode, FidelityMode } from '../p0vr7/types.js';

export const RRI_FAILURE_CODES = [
  'REFERENCE_VIEWPORT_MISMATCH',
  'REFERENCE_CONTENT_CANVAS_UNRESOLVED',
  'REFERENCE_DEVICE_FRAME_MISCLASSIFIED',
  'REFERENCE_REGION_TREE_INVALID',
  'REFERENCE_PARENT_INFERENCE_FAILED',
  'REFERENCE_LAYOUT_MODE_WRONG',
  'REFERENCE_GRID_INFERENCE_FAILED',
  'REFERENCE_RESPONSIVE_AUTHORITY_COLLAPSED',
  'REFERENCE_TYPOGRAPHY_METRICS_DRIFT',
  'REFERENCE_LINE_BREAK_DRIFT',
  'REFERENCE_OPTICAL_ALIGNMENT_DRIFT',
  'REFERENCE_SURFACE_DRIFT',
  'REFERENCE_BOX_MODEL_DRIFT',
  'REFERENCE_INTRINSIC_SIZE_DRIFT',
  'REFERENCE_NATIVE_CONTROL_LEAK',
  'REFERENCE_OVERFLOW_DRIFT',
  'REFERENCE_ANCHORING_DRIFT',
  'REFERENCE_LAYER_STACK_DRIFT',
  'REFERENCE_GLOBAL_CSS_CONTAMINATION',
  'REFERENCE_LEGACY_WRAPPER_BLOCKING',
  'REFERENCE_CUMULATIVE_LAYOUT_DRIFT',
  'REFERENCE_CAPTURE_NONDETERMINISTIC',
  'REFERENCE_FONT_NOT_READY',
  'REFERENCE_LAYOUT_NOT_STABLE',
  'REFERENCE_DATA_STATE_MISMATCH',
  'REFERENCE_CORRECTION_ROOT_CAUSE_WRONG',
  'REFERENCE_VERIFIED_REGION_REGRESSION',
  'REFERENCE_FALSE_PASS',
  'REFERENCE_IMPLEMENTATION_NO_OP',
  'REFERENCE_BLUEPRINT_MISSING',
  'REFERENCE_INFERENCE_UNCERTAIN',
  'REFERENCE_HOST_SHELL_OVERCLASSIFIED',
  'REFERENCE_AUTHORITY_REGION_UNDERCLASSIFIED',
  'REFERENCE_FUNCTION_VISUAL_COUPLED',
  'REFERENCE_MULTI_ASSET_DISCOVERY_INCOMPLETE',
  'REFERENCE_MULTI_ASSET_JOB_NOT_CREATED',
  'REFERENCE_CROP_APPROVAL_SKIPPED',
  'REFERENCE_GENERATION_APPROVAL_SKIPPED',
  'REFERENCE_OUTPUT_APPROVAL_SKIPPED',
  'REFERENCE_REGENERATION_AUTO_DISPATCHED',
  'REFERENCE_ASSET_COMPLETENESS_FAILED',
  'REFERENCE_PARTIAL_VISUAL_IMPLEMENTATION',
  'REFERENCE_BINDING_WITHOUT_OUTPUT_APPROVAL',
] as const;

export type RriFailureCode = (typeof RRI_FAILURE_CODES)[number];

export const REFERENCE_REGION_ROLES = [
  'ROOT',
  'SHELL',
  'HEADER',
  'NAV',
  'SECTION',
  'PANEL',
  'CARD',
  'CONTROL',
  'TEXT_BLOCK',
  'IMAGE_SLOT',
  'FOOTER',
  'STICKY_REGION',
  'OVERLAY_REGION',
] as const;

export type ReferenceRegionRole = (typeof REFERENCE_REGION_ROLES)[number];

export const LAYOUT_MODES = [
  'NORMAL_FLOW',
  'FLEX',
  'GRID',
  'ABSOLUTE',
  'RELATIVE',
  'STICKY',
  'FIXED',
  'OVERLAY',
] as const;

export type LayoutMode = (typeof LAYOUT_MODES)[number];

export const DRIFT_CLASSIFICATIONS = ['MAJOR', 'MINOR', 'MICRO'] as const;
export type DriftClassification = (typeof DRIFT_CLASSIFICATIONS)[number];

export const BLUEPRINT_STATUSES = ['DRAFT', 'READY', 'IMPLEMENTING', 'VERIFIED', 'BLOCKED'] as const;
export type BlueprintStatus = (typeof BLUEPRINT_STATUSES)[number];

export type NormalizedBbox = { x: number; y: number; width: number; height: number };

export type ReferenceFrameSegmentation = {
  deviceFrameRegion: NormalizedBbox | null;
  browserChromeRegion: NormalizedBbox | null;
  implementedUiRegion: NormalizedBbox;
  contentCanvasRegion: NormalizedBbox;
  ignoredContextRegion: NormalizedBbox | null;
};

export type ReferenceViewportCalibration = {
  referenceViewportWidth: number;
  referenceViewportHeight: number;
  liveCssViewportWidth: number;
  liveCssViewportHeight: number;
  devicePixelRatio: number;
  browserZoom: number;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
  scrollbarWidth: number;
  captureScale: number;
  contentCanvasScale: number;
  viewportMatch: boolean;
};

export type ReferenceRegion = {
  regionId: string;
  parentRegionId: string | null;
  role: ReferenceRegionRole;
  bbox: { x: number; y: number; width: number; height: number };
  normalizedBbox: NormalizedBbox;
  zLayer: number;
  visibility: 'VISIBLE' | 'HIDDEN';
  expectedOverflow: 'VISIBLE' | 'HIDDEN' | 'CLIP' | 'SCROLL_X' | 'SCROLL_Y' | 'WRAP' | 'TRUNCATE';
  expectedPositioning: LayoutMode;
  confidence: number;
  locked?: boolean;
};

export type ReferenceGeometrySpec = {
  regionId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  gap: number | null;
  alignmentAnchor: 'START' | 'CENTER' | 'END' | 'STRETCH';
  aspectRatio: number | null;
};

export type ReferenceSpacingSystem = {
  horizontalInset: number;
  verticalInset: number;
  sectionGap: number;
  panelGap: number;
  cardGap: number;
  internalPadding: number;
  controlGap: number;
  labelGap: number;
  screenScopedTokens: Record<string, string>;
};

export type ReferenceTypographySpec = {
  regionId: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  textTransform: 'UPPERCASE' | 'NONE' | 'CAPITALIZE';
  alignment: 'LEFT' | 'CENTER' | 'RIGHT';
  textWidth: number | null;
  lineCount: number;
  lineBreakPositions: number[];
  wrapMode: 'INTENTIONAL' | 'AUTO';
};

export type ReferenceLineBreakContract = {
  regionId: string;
  expectedLineCount: number;
  expectedBreakPositions: string[];
  maxTextWidth: number;
};

export type OpticalAlignmentHint = {
  regionId: string;
  mode: 'MATHEMATICAL_CENTER' | 'OPTICAL_CENTER' | 'BASELINE_ALIGN' | 'CAP_HEIGHT_ALIGN' | 'EDGE_ALIGN' | 'VISUAL_WEIGHT_ALIGN';
};

export type ReferenceSurfaceSpec = {
  regionId: string;
  backgroundColor: string;
  borderColor: string | null;
  borderWidth: number;
  borderStyle: string;
  radius: number;
  shadow: string | null;
  opacity: number;
  dividerStyle: string | null;
  surfaceElevation: number;
};

export type ReferenceMeasurementSpec = {
  authorityId: string;
  viewport: DesignViewportClass;
  authorityMode: AuthorityMode;
  fidelityMode: FidelityMode;
  referenceNaturalWidth: number;
  referenceNaturalHeight: number;
  contentCanvasX: number;
  contentCanvasY: number;
  contentCanvasWidth: number;
  contentCanvasHeight: number;
  devicePixelRatioContext: number;
  normalizedCoordinateMap: boolean;
  frameSegmentation: ReferenceFrameSegmentation;
  viewportCalibration: ReferenceViewportCalibration;
  regions: ReferenceRegion[];
  geometrySpecs: ReferenceGeometrySpec[];
  spacingSystem: ReferenceSpacingSystem;
  typographySpecs: ReferenceTypographySpec[];
  lineBreakContracts: ReferenceLineBreakContract[];
  opticalAlignmentHints: OpticalAlignmentHint[];
  surfaceSpecs: ReferenceSurfaceSpec[];
  measurementSpecVersion: string;
};

export type ReferenceParentChildGraph = {
  nodes: string[];
  edges: Array<{ parentId: string; childId: string; relationship: 'CONTAINS' | 'SIBLING' }>;
};

export type ReferenceLayoutPlan = {
  authorityId: string;
  viewport: DesignViewportClass;
  regionLayoutModes: Record<string, LayoutMode>;
  parentChildGraph: ReferenceParentChildGraph;
  gridInferences: Array<{ regionId: string; columns: number; rows: number; gap: number }>;
  flexInferences: Array<{ regionId: string; direction: 'ROW' | 'COLUMN'; justify: string; align: string; gap: number; wrap: boolean }>;
  viewportSpecific: boolean;
  uncertainties: ReferenceInferenceUncertainty[];
};

export type ReferenceInferenceUncertainty = {
  regionId: string;
  field: string;
  reason: string;
  severity: 'NEEDS_INFERENCE_REVIEW' | 'SAFE_REVERSIBLE_GUESS';
};

export type ExecutionStyleConflict = {
  selector: string;
  property: string;
  currentValue: string;
  authorityValue: string;
  scope: string;
  severity: DriftClassification;
  failureCode: RriFailureCode;
};

export type RegionVisualDelta = {
  regionId: string;
  xDelta: number;
  yDelta: number;
  widthDelta: number;
  heightDelta: number;
  surfaceDelta: boolean;
  typographyDelta: boolean;
  alignmentDelta: boolean;
  severity: DriftClassification;
  probableCause: string | null;
};

export type VisualCorrectionPlan = {
  iteration: number;
  targetRegions: string[];
  rootCauses: string[];
  files: string[];
  selectors: string[];
  components: string[];
  proposedChanges: string[];
  expectedImpact: string;
  riskToOtherScreens: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type ConvergenceIterationRecord = {
  iteration: number;
  beforeCaptureId: string | null;
  deltaSummary: string;
  correctionPlanId: string | null;
  filesChanged: string[];
  afterCaptureId: string | null;
  improvementScore: number;
  regressions: string[];
};

export type FidelityThresholdProfile = {
  profileId: string;
  fidelityMode: FidelityMode;
  rootGeometryPx: number;
  majorRegionGeometryPx: number;
  typographySizePx: number;
  lineBreakTolerance: number;
  surfaceColorDelta: number;
  alignmentPx: number;
  assetPresenceRequired: boolean;
};

export type ReferenceDataState = {
  selectedTab: string | null;
  selectedFamily: string | null;
  selectedScreen: string | null;
  openPanel: string | null;
  scrollY: number;
  emptyState: boolean;
  loadingState: boolean;
};

export type ReferenceReconstructionBlueprint = {
  blueprintId: string;
  authorityId: string;
  viewport: DesignViewportClass;
  route: string;
  status: BlueprintStatus;
  viewportCalibration: ReferenceViewportCalibration;
  regionTree: ReferenceRegion[];
  geometrySpecs: ReferenceGeometrySpec[];
  typographySpecs: ReferenceTypographySpec[];
  surfaceSpecs: ReferenceSurfaceSpec[];
  layoutPlan: ReferenceLayoutPlan;
  spacingSystem: ReferenceSpacingSystem;
  lineBreakContracts: ReferenceLineBreakContract[];
  overflowContracts: Record<string, ReferenceRegion['expectedOverflow']>;
  anchoringContracts: Record<string, LayoutMode>;
  layerStack: Array<{ regionId: string; zIndexIntent: number }>;
  densityContract: { visiblePrimaryData: number; progressiveDisclosureMode: string | null };
  dataState: ReferenceDataState;
  assetRequirements: Array<{ slotId: string; required: boolean; bound: boolean }>;
  verificationThresholds: FidelityThresholdProfile;
  measurementSpecVersion: string;
  layoutPlanVersion: string;
  uncertainties: ReferenceInferenceUncertainty[];
  lockedRegions: string[];
  /** P0.VR.6R6 — authority boundary + multi-asset orchestration */
  authorityBoundaryMapId?: string;
  hostShellCoverage?: number;
  authorityRebuildCoverage?: number;
  boundaryReviewRequired?: boolean;
  multiAssetJobId?: string | null;
  assetMismatchCount?: number;
  cropApprovalState?: string;
  generationApprovalState?: string;
  assetCompletenessState?: string;
};

export type BoundaryOverlayRegion = {
  regionId: string;
  label: string;
  boundaryClass: 'HOST_LOCKED' | 'AUTHORITY_REBUILD' | 'FUNCTION_PRESERVE_VISUAL_REBUILD' | 'ASSET_SLOT' | 'CONTEXT_ONLY';
  bbox: NormalizedBbox;
};

export type ReferenceReconstructionInspectorState = {
  authorityId: string;
  viewport: DesignViewportClass;
  contentCanvas: { width: number; height: number };
  devicePixelRatio: number;
  regionCount: number;
  layoutInferenceStatus: 'PENDING' | 'COMPLETE' | 'UNCERTAIN';
  blueprintStatus: BlueprintStatus;
  assetRequirementCount: number;
  styleConflictCount: number;
  captureReadyStatus: 'NOT_READY' | 'READY' | 'BLOCKED';
  captureBlockers: string[];
  convergenceIteration: number;
  majorDriftCount: number;
  minorDriftCount: number;
  microDriftCount: number;
  noOpGuard: 'PASS' | 'FAIL' | 'NOT_RUN';
  falsePassGuard: 'PASS' | 'FAIL' | 'NOT_RUN';
  partialOpGuard: 'PASS' | 'FAIL' | 'NOT_RUN';
  verificationStatus: 'NOT_STARTED' | 'BLOCKED' | 'HIGH_MATCH' | 'VERIFIED';
  failureCodes: RriFailureCode[];
  hostShellCoveragePercent: number;
  authorityRebuildCoveragePercent: number;
  boundaryReviewRequired: boolean;
  boundaryOverlayRegions: BoundaryOverlayRegion[];
  assetMismatchCount: number;
  multiAssetJobId: string | null;
  cropApprovalSummary: string;
  generationApprovalSummary: string;
};
